#
# This Makefile contains instructions the rules
# that allows to convert a simulation model
# into an REST API service hosted on AWS lambda.
#
VENV_DIR=./venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip
PROFILE=marco
AWS=$(VENV_DIR)/bin/aws --profile=$(PROFILE)
APP_DIR=./sample_app

all: help
.PHONY: all


install: ## Install the dependencies needed to run this tool
	virtualenv ./venv
	$(PIP) install --upgrade pip
	$(PIP) install awscli
	$(PIP) install boto3
.PHONY: install


create_bucket: ## Create the bucket that stores the FMUs
	$(PYTHON) setup_s3.py --create --profile $(PROFILE)
.PHONY: create_bucket


delete_bucket: ## Delete the bucket that stores the FMUs
	$(PYTHON) setup_s3.py --delete --profile $(PROFILE)
.PHONY: delete_bucket


copy_fmu: ## Copies the FMU to S3
	$(PYTHON) setup_s3.py --copy $(APP_DIR) --profile $(PROFILE)
.PHONY: copy_fmu


remove: ## Remove the dependencies installed to run this tool
	rm -rf $(VENV_DIR)
.PHONY: remove


help: ## This help dialog.
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//'`); \
	for help_line in $${help_lines[@]}; do \
		IFS=$$'#' ; \
		help_split=($$help_line) ; \
		help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
		printf "%-30s %s\n" $$help_command $$help_info ; \
	done
.PHONY: help
