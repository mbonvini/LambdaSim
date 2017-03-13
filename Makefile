#
# This Makefile contains instructions
# that allows to convert a simulation model
# into an REST API service hosted on AWS lambda and
# publicly available trough apigateway. 
#

$(eval CURDIR := $(shell pwd))
VENV_DIR=$(CURDIR)/venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip

PROFILE=default
AWS=$(VENV_DIR)/bin/aws --profile=$(PROFILE)

APP_DIR=$(CURDIR)/apps/hello_world
CONFIG_FILE=config.json
DASHBOARD_FILE=dashboard.json
PATH_CONFIG_FILE=$(APP_DIR)/$(CONFIG_FILE)

VENV_ZIP=LambdaFmiVenvPython27.zip
VENV_ZIP_URL=https://s3-us-west-2.amazonaws.com/lambda-sim/$(VENV_ZIP)

APP_ZIP_NAME=$(CURDIR)/LambdaSimApp.zip
LAMBDA_FUNCTION=lambda_function.py
HANDLER=lambda_function.lambda_handler
LS_LOG_LEVEL="10"

IAM_ROLE_NAME=LambdaSimRole
PERMISSION_FOR_LAMBDA_SIM_S3=PermissionForLambdaSimS3
PERMISSION_FOR_LAMBDA_SIM_LOGS=PermissionForLambdaSimLogs
IAM_ROLE_ASSUME_POLICY_DOCUMENT=$(CURDIR)/iam_roles/assume_role_policy.json
IAM_ROLE_ACCESS_S3_POLICY_DOCUMENT=$(CURDIR)/iam_roles/role_access_s3_policy.json
IAM_ROLE_ACCESS_LOGS_POLICY_DOCUMENT_TEMPLATE=$(CURDIR)/iam_roles/role_access_logs_policy.json
IAM_ROLE_ACCESS_LOGS_POLICY_DOCUMENT=role_access_logs_policy.json

METHOD_OPTIONS_RESPONSE=file://configs/method_options_response.json
INTEGRATION_OPTIONS_RESPONSE=file://configs/integration_options_response.json
CORS_HEADERS=file://configs/cors_headers.json

SWAGGER_API_TEMPLATE=$(CURDIR)/templates/swagger_api_template.json
SWAGGER_API_TEMPLATE_CORS=$(CURDIR)/templates/swagger_api_template_cors.json

# Access the data in the config file associated to the app
#-- Account
ACCOUNT_ID := $(shell aws --profile=marco iam list-users | jq '.Users[0].Arn / ":" | .[4]' | sed 's/^"\(.*\)".*/\1/')
AWS_REGION := $(shell more $(PATH_CONFIG_FILE) | jq '.aws.region' | sed 's/^"\(.*\)".*/\1/')
#-- Lambda
FUNCTION_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.function_name' | sed 's/^"\(.*\)".*/\1/')
DESCRIPTION := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.description')
TIMEOUT := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.timeout')
MEMORY_SIZE := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.memory_size')
#-- Apigateway
API_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.api.name')
API_DESCRIPTION := $(shell more $(PATH_CONFIG_FILE) | jq '.api.description')

define random_uuid
$(shell ./venv/bin/python -c "import sys,uuid; sys.stdout.write(uuid.uuid4().hex)" | pbcopy && pbpaste && echo)
endef

all: help
.PHONY: all


install: ## Install the dependencies needed to run this tool
	virtualenv ./venv
	$(PIP) install --upgrade pip
	$(PIP) install awscli
	$(PIP) install boto3
	$(PIP) install jinja2
.PHONY: install


uninstall: ## Remove the virtual environment
	rm -rf $(VENV_DIR)
.PHONY: uninstall


create_bucket: ## Create the bucket that stores the FMUs
	$(PYTHON) setup_s3.py --create \
	--profile $(PROFILE) \
	--region $(AWS_REGION)
.PHONY: create_bucket


get_bucket_name: ## Get the name of the bucket that stores the FMUs
	$(PYTHON) setup_s3.py --get_name --profile $(PROFILE)
.PHONY: create_bucket


delete_bucket: ## Delete the bucket that stores the FMUs
	$(PYTHON) setup_s3.py --delete --profile $(PROFILE)
.PHONY: delete_bucket


copy_fmu: create_bucket ## Copies the FMU to S3
	$(PYTHON) setup_s3.py --copy $(APP_DIR) --profile $(PROFILE)
.PHONY: copy_fmu


build_app: ## Builds the zip file that contains the lambda function
	if [ ! -f "./$(VENV_ZIP)" ]; then wget $(VENV_ZIP_URL); fi
	cp ./$(VENV_ZIP) $(APP_ZIP_NAME)
	zip -g $(APP_ZIP_NAME) $(LAMBDA_FUNCTION)
	cd $(APP_DIR) && zip -g $(APP_ZIP_NAME) $(CONFIG_FILE)
	if [ -f "$(APP_DIR)/$(DASHBOARD_FILE)" ]; then cd $(APP_DIR) && zip -g $(APP_ZIP_NAME) $(DASHBOARD_FILE); fi
.PHONY: build_app


create_logs_role: ## Create the IAM role specific for the log
	more $(IAM_ROLE_ACCESS_LOGS_POLICY_DOCUMENT_TEMPLATE) | jq '\
	.Statement[0].Resource = "arn:aws:logs:$(AWS_REGION):$(ACCOUNT_ID):*" | \
	.Statement[1].Resource[0] = "arn:aws:logs:$(AWS_REGION):$(ACCOUNT_ID):log-group:/aws/lambda/$(FUNCTION_NAME):*"' \
	> $(APP_DIR)/$(IAM_ROLE_ACCESS_LOGS_POLICY_DOCUMENT)
PHONY: create_logs_role


create_iam_role: create_logs_role ## Create the IAM role (valid for a specific lambda function)
	$(AWS) iam create-role \
	--role-name $(IAM_ROLE_NAME)-$(FUNCTION_NAME) \
	--assume-role-policy-document file://$(IAM_ROLE_ASSUME_POLICY_DOCUMENT) \
	> $(APP_DIR)/role_profile.json
	$(AWS) iam put-role-policy \
	--role-name $(IAM_ROLE_NAME)-$(FUNCTION_NAME) \
	--policy-name $(PERMISSION_FOR_LAMBDA_SIM_S3) \
	--policy-document file://$(IAM_ROLE_ACCESS_S3_POLICY_DOCUMENT)
	$(AWS) iam put-role-policy \
	--role-name $(IAM_ROLE_NAME)-$(FUNCTION_NAME) \
	--policy-name $(PERMISSION_FOR_LAMBDA_SIM_LOGS) \
	--policy-document file://$(APP_DIR)/$(IAM_ROLE_ACCESS_LOGS_POLICY_DOCUMENT)
.PHONY: create_iam_role


create_function: copy_fmu build_app create_iam_role ## Create the lambda function by uploading the zip file
	$(eval IAM_ROLE_ARN := $(shell more $(APP_DIR)/role_profile.json | jq '.Role.Arn'))
	$(eval BUCKET_NAME := $(shell $(PYTHON) setup_s3.py --get_name --profile $(PROFILE)))
	$(AWS) lambda create-function \
	--region $(AWS_REGION) \
	--function-name $(FUNCTION_NAME) \
	--runtime python2.7 \
	--role $(IAM_ROLE_ARN) \
	--handler $(HANDLER) \
	--description $(DESCRIPTION) \
	--timeout $(TIMEOUT) \
	--memory-size $(MEMORY_SIZE) \
	--zip-file fileb://$(APP_ZIP_NAME) \
	--environment '{"Variables": {"USER": "ec2-user", "LS_LOG_LEVEL": $(LS_LOG_LEVEL), "S3_FMU_BUCKET_NAME": "$(BUCKET_NAME)"}}' \
	> $(APP_DIR)/lambda_function.json
.PHONY: create_function


update_function_code: build_app ## Command to update the code of an existing lambda function
	$(eval IAM_ROLE_ARN := $(shell more $(APP_DIR)/role_profile.json | jq '.Role.Arn'))
	$(eval BUCKET_NAME := $(shell $(PYTHON) setup_s3.py --get_name --profile $(PROFILE)))
	$(AWS) lambda update-function-code \
	--region $(AWS_REGION) \
	--function-name $(FUNCTION_NAME) \
	--zip-file fileb://$(APP_ZIP_NAME) \
	> $(APP_DIR)/lambda_function.json
.PHONY: redeploy_function


prepare_api_spec:
	$(PYTHON) ./generate_api_template.py \
	$(APP_DIR)/lambda_function.json \
	$(APP_DIR)/rest_api_spec.json

submit_api_spec: prepare_api_spec
	$(AWS) apigateway import-rest-api \
	--region $(AWS_REGION) \
	--body file://$(APP_DIR)/rest_api_spec.json > $(APP_DIR)/rest_api.json

get_function_arn_uri: ## Get the ARN and URI of the lambda function
	@$(eval FUNCTION_ARN := $(shell more $(APP_DIR)/lambda_function.json | jq '.FunctionArn' | sed 's/^"\(.*\)".*/\1/'))
	@$(eval FUNCTION_URI := arn:aws:apigateway:$(AWS_REGION):lambda:path/2015-03-31/functions/$(FUNCTION_ARN)/invocations)
.PHONY: get_function_arn_uri

get_root_resource_id: ## Get the REST root resource
	@$(eval REST_API_ID := $(shell more $(APP_DIR)/rest_api.json | jq '.id'))
	@$(AWS) apigateway get-resources \
	--region $(AWS_REGION) \
	--rest-api-id $(REST_API_ID) > $(APP_DIR)/resources.json
.PHONY: get_resource_id


get_resource_id: get_root_resource_id ## Get the resource id of the "/" and of "/<lambda_function_name>"
	@$(eval REST_API_ID := $(shell more $(APP_DIR)/rest_api.json | jq '.id' | sed 's/^"\(.*\)".*/\1/'))
	@$(eval ROOT_RESOURCE_ID := $(shell more $(APP_DIR)/resources.json | jq '.items[] | select(.path == "/") | .id'))
	@$(eval RESOURCE_ID := $(shell more $(APP_DIR)/resources.json | jq '.items[] | select(.parentId == $(ROOT_RESOURCE_ID)) | .id'))
.PHONY: get_resource_id


enable_api: get_function_arn_uri get_resource_id ## Enable the lambda function to be called by API Gateway
	$(AWS) lambda add-permission \
	--region $(AWS_REGION) \
	--function-name $(FUNCTION_ARN) \
	--source-arn 'arn:aws:execute-api:$(AWS_REGION):$(ACCOUNT_ID):$(REST_API_ID)/*/*/$(FUNCTION_NAME)' \
	--principal apigateway.amazonaws.com \
	--statement-id $(call random_uuid) \
	--action lambda:InvokeFunction
	$(AWS) lambda add-permission \
	--region $(AWS_REGION) \
	--function-name $(FUNCTION_ARN) \
	--source-arn 'arn:aws:execute-api:$(AWS_REGION):$(ACCOUNT_ID):$(REST_API_ID)/prod/ANY/$(FUNCTION_NAME)' \
	--principal apigateway.amazonaws.com \
	--statement-id $(call random_uuid) \
	--action lambda:InvokeFunction
.PHONY: enable_api


deploy_api: get_resource_id ## Deploy the API
	$(AWS) apigateway create-deployment \
	--region $(AWS_REGION) \
	--rest-api-id $(REST_API_ID) \
	--stage-name prod \
	--description "Deploy API to production stage" > $(APP_DIR)/deployed.json
.PHONY: deploy_api


expose_function: submit_api_spec enable_api deploy_api ## Exposes the lambda function via API Gateway
.PHONY: expose_function


get_url: get_resource_id ## Get the URL of the API gateway API endpoint
	@echo The URL of the API is:
	@echo https://$(REST_API_ID).execute-api.$(AWS_REGION).amazonaws.com/prod/$(FUNCTION_NAME)
.PHONY: get_url


help: ## Show this help message
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
.PHONY: help
