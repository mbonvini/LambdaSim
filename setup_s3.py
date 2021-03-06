import os
import sys
import string
import random
import boto3
import re
import argparse
import json

BUCKET_PREFIX = "lambda-simulation"
DEFAULT_AWS_REGION = "us-west-2"

def random_bucket_name(prefix=BUCKET_PREFIX, size=8):
    size = 8
    chars = string.ascii_lowercase + string.digits
    rnd_str = ''.join(random.choice(chars) for _ in range(size))
    return "{}-{}".format(prefix, rnd_str)

def get_bucket_names(prefix=BUCKET_PREFIX, profile_name=None):
    """
    This function returns the name of the S3 bucket where
    the FMU are saved.

    :param str prefix: The prefix for the S3 bucket.
    :param str profile_name: The profile to use from the AWS
      confign file.
    :rtype: list[str]
    :return: The function returns a list of bucket names that have the
      prexix `BUCKET_PREFIX` that could be used to store FMUs.
    """
    session = boto3.Session(profile_name=profile_name)
    s3 = session.resource('s3')

    regex = r'{}-[a-z0-9]+'.format(prefix)
    buckets = [bucket.name for bucket in s3.buckets.all() if re.match(regex, bucket.name)]

    return buckets

def create_bucket(prefix=BUCKET_PREFIX, profile_name=None, region_name=DEFAULT_AWS_REGION):
    """
    This function creates a bucket with a specified prefix
    that will contain the FMU models.
    If a bucket with a similar name exists the function return
    that bucket.

    :param str prefix: The prefix for the S3 bucket.
    :param str profile_name: The profile to use from the AWS
      confign file.
    :param str region_name: AWS region when creating the new bucket.
    :rtype: str
    :return: The function returns the name of the bucket where
      storing the FMU models.
    """
    session = boto3.Session(profile_name=profile_name, region_name=region_name)
    s3 = session.resource('s3')
    buckets = get_bucket_names(BUCKET_PREFIX, profile_name)

    if len(buckets) == 0:
        bucket_name = random_bucket_name()
        s3.create_bucket(
            Bucket=bucket_name,
            CreateBucketConfiguration=dict(
                LocationConstraint=region_name
            )
        )
        print "Created S3 bucket {}".format(bucket_name)
    elif len(buckets) == 1:
        bucket_name = buckets[0]
        print "Use existing S3 bucket {}".format(bucket_name)
    else:
        msg = "There must be only 1 bucket with the prefix {}".format(prefix)
        msg += "\nThere are more instead: {}".format(buckets)
        raise Exception(msg)

    return bucket_name

def delete_bucket(name=None, prefix=BUCKET_PREFIX, profile_name=None):
    """
    This function delete the bucket specified by the parameter name.
    If the parameter is None the function deletes the buckets that match
    the prefix.

    :param str name: The name of the S3 bucket.
    :param str prefix: The prefix for the S3 bucket to delete.
    :param str profile_name: The profile to use from the AWS
      confign file.
    :rtype: NoneType
    """
    session = boto3.Session(profile_name=profile_name)
    s3 = session.resource('s3')

    if name is None:
        regex = r'{}-[a-z0-9]+'.format(prefix)
        buckets = [bucket for bucket in s3.buckets.all() if re.match(regex, bucket.name)]

        for bucket in buckets:
            for key in bucket.objects.all():
                key.delete()
            bucket.delete()
    else:
        bucket = s3.Bucket(name)
        for key in bucket.objects.all():
            key.delete()
        bucket.delete()


def copy_fmu(dir_path, bucket_name, profile_name=None):
    """
    This function copies the FMUs in the directory specified by
    the parameter dir_path to the S3 bucket specified by the
    parameter bucket_name.

    :param str dir_path: The name of the directory that contains
      the FMU to copy, the config.json file, and the input folder
      with all the csv files.
    :param str bucket_name: The name of the S3 bucket.
    :param str prefix: The prefix for the S3 bucket to delete.
    :param str profile_name: The profile to use from the AWS
      confign file.
    :rtype: NoneType
    """
    session = boto3.Session(profile_name=profile_name)
    s3 = session.resource('s3')

    if dir_path is None:
        msg = ("Please specify a path for the directory containing the"
               " directory that contains the FMU to be copied")
        raise ValueError(msg)
    elif not os.path.exists(dir_path):
        msg = "The directory {} does not exists".format(dir_path)
        raise ValueError(msg)
    elif not os.path.isdir(dir_path):
        msg = "The path {} is not a directory".format(dir_path)
        raise ValueError(msg)

    config_file_path = os.path.join(os.path.abspath(dir_path), "config.json")
    if not os.path.exists(config_file_path):
        msg = "The folder {} does not contain the 'config.json' file".format(
            dir_path
        )
        raise ValueError(msg)

    with open(config_file_path, "r") as c_file:
        config = json.loads(c_file.read())

    try:
        s3_sub_folder = config["s3"]["folder"]
    except KeyError:
        msg = "The 'config.json' file does not contain the s3 folder name"
        raise ValueError(msg)

    if not re.match(r"^[\w|\d]+", s3_sub_folder):
        msg = "The s3 folder name '{}' is not valid (only letters, underscores and numbers)."
        raise ValueError(msg)

    fmus = [f for f in os.listdir(dir_path) if f.endswith("fmu")]

    for fmu in fmus:
        fmu_path = os.path.join(os.path.abspath(dir_path), fmu)
        bucket_file = "{}/{}".format(s3_sub_folder, fmu)
        print "Copy {}... to s3://{}/{}".format(fmu, bucket_name, bucket_file)
        s3.Object(bucket_name, bucket_file).put(Body=open(fmu_path, 'rb'))
        print "Done"

    input_files_folder = os.path.join(os.path.abspath(dir_path), "inputs")
    if not os.path.exists(input_files_folder):
        print "No input files, skip"
        return
    elif not os.path.isdir(input_files_folder):
        msg = "The input files folder path {} is not a directory".format(input_files_folder)
        raise ValueError(msg)

    input_csv_files = [f for f in os.listdir(input_files_folder) if f.endswith("csv")]
    for csv_file in input_csv_files:
        csv_file_path = os.path.join(os.path.abspath(input_files_folder), csv_file)
        bucket_file = "{}/inputs/{}".format(s3_sub_folder, csv_file)
        print "Copy {}... to s3://{}/{}".format(csv_file, bucket_name, bucket_file)
        s3.Object(bucket_name, bucket_file).put(Body=open(csv_file_path, 'rb'))
        print "Done"


if __name__ == "__main__":

    description = "Command line utility to create or delete S3 buckets for FMUs"
    parser = argparse.ArgumentParser(
        prog="setup_s3",
        description=description)

    parser.add_argument(
        '-c', '--create', const=True, default=False,
        nargs='?', help="Create a S3 bucket for storing FMUs")

    parser.add_argument(
        '-n', '--get_name', const=True, default=False,
        nargs='?', help="Get the name of the S3 buckets that stores the FMUs")

    parser.add_argument(
        '-d', '--delete', const=True, default=False,
        nargs='?', help="Delete the S3 bucket that stores the FMUs")

    parser.add_argument(
        '-cp', '--copy', const=None, default=None,
        type=str, nargs='?',
        help="The name of folder containing the FMU to be copied"
    )

    parser.add_argument(
        '-p', '--profile', const=None, default=None,
        type=str, nargs='?',
        help="The name of the AWS IAM profile to use (see ~/.aws/credentials)"
    )

    parser.add_argument(
        '-r', '--region', default=DEFAULT_AWS_REGION,
        type=str, nargs='?',
        help="The name of the AWS region (by default us-west-2)"
    )

    args = parser.parse_args()

    if args.get_name:
        buckets = get_bucket_names(
            BUCKET_PREFIX,
            profile_name=args.profile
        )
        if len(buckets) == 0:
            sys.exit("No buckets")
        elif len(buckets) == 1:
            sys.stdout.write(buckets[0])
        else:
            sys.exit("More than one S3 bucket, please remove one")

    elif args.create:
        create_bucket(
            BUCKET_PREFIX,
            profile_name=args.profile,
            region_name=args.region
        )

    elif args.delete:
        delete_bucket(
            prefix=BUCKET_PREFIX,
            profile_name=args.profile
        )

    elif args.copy:
        bucket_name = create_bucket(
            BUCKET_PREFIX,
            profile_name=args.profile
        )
        copy_fmu(args.copy, bucket_name, profile_name=args.profile)

    else:
        parser.print_help()

