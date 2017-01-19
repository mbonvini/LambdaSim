import os
import sys
import string
import random
import boto3
import re
import argparse

BUCKET_PREFIX = "lambda-sim"

def random_bucket_name(prefix=BUCKET_PREFIX, size=8):
    size = 8
    chars = string.ascii_lowercase + string.digits
    rnd_str = ''.join(random.choice(chars) for _ in range(size))
    return "{}-{}".format(prefix, rnd_str)

def create_bucket(prefix=BUCKET_PREFIX, profile_name=None):
    """
    This function creates a bucket with a specified prefix
    that will contain the FMU models.
    If a bucket with a similar name exists the function return
    that bucket.

    :param str prefix: The prefix for the S3 bucket.
    :param str profile_name: The profile to use from the AWS
      confign file.
    :rtype: str
    :return: The function returns the name of the bucket where
      storing the FMU models.
    """
    session = boto3.Session(profile_name=profile_name)
    s3 = session.resource('s3')

    regex = r'{}-[a-z0-9]+'.format(prefix)
    buckets = [bucket.name for bucket in s3.buckets.all() if re.match(regex, bucket.name)]

    if len(buckets) == 0:
        bucket_name = random_bucket_name()
        s3.create_bucket(Bucket=bucket_name)
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
      the FMU to copy.
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

    fmus = [f for f in os.listdir(dir_path) if f.endswith("fmu")]

    for fmu in fmus:
        fmu_path = os.path.join(os.path.abspath(dir_path), fmu)
        print "Copy {}...".format(fmu)
        s3.Object(bucket_name, fmu).put(Body=open(fmu_path, 'rb'))
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

    args = parser.parse_args()

    if args.create:
        create_bucket(BUCKET_PREFIX, profile_name=args.profile)
    elif args.delete:
        delete_bucket(prefix=BUCKET_PREFIX, profile_name=args.profile)
    elif args.copy:
        bucket_name = create_bucket(BUCKET_PREFIX, profile_name=args.profile)
        copy_fmu(args.copy, bucket_name, profile_name=args.profile)
    else:
        parser.print_help()

