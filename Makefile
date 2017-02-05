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

PROFILE=marco
AWS_REGION=us-west-2
AWS=$(VENV_DIR)/bin/aws --profile=$(PROFILE)

APP_DIR=$(CURDIR)/apps/hello_world
CONFIG_FILE=config.json
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
	rm -rf ./venv
.PHONY: uninstall


create_bucket: ## Create the bucket that stores the FMUs
	$(PYTHON) setup_s3.py --create --profile $(PROFILE)
.PHONY: create_bucket


get_bucket_name: ## Get the name of the bucket that stores the FMUs
	$(PYTHON) setup_s3.py --get_name --profile $(PROFILE)
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


build_app: ## Builds the zip file that contains the lambda function
	if [ ! -f "./$(VENV_ZIP)" ]; then wget $(VENV_ZIP_URL); fi
	cp ./$(VENV_ZIP) $(APP_ZIP_NAME)
	zip -g $(APP_ZIP_NAME) $(LAMBDA_FUNCTION)
	cd $(APP_DIR) && zip -g $(APP_ZIP_NAME) $(CONFIG_FILE)
.PHONY: build_app


create_logs_role: ## Create the IAM role specific for the log 
	$(eval ACCOUNT_ID := $(shell more $(PATH_CONFIG_FILE) | jq '.aws.account'))
	$(eval AWS_REGION := $(shell more $(PATH_CONFIG_FILE) | jq '.aws.region' | sed 's/^"\(.*\)".*/\1/'))
	$(eval FUNCTION_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.function_name' | sed 's/^"\(.*\)".*/\1/'))
	more $(IAM_ROLE_ACCESS_LOGS_POLICY_DOCUMENT_TEMPLATE) | jq '\
	.Statement[0].Resource = "arn:aws:logs:$(AWS_REGION):$(ACCOUNT_ID):*" | \
	.Statement[1].Resource[0] = "arn:aws:logs:$(AWS_REGION):$(ACCOUNT_ID):log-group:/aws/lambda/$(FUNCTION_NAME):*"' \
	> $(APP_DIR)/$(IAM_ROLE_ACCESS_LOGS_POLICY_DOCUMENT)
PHONY: create_logs_role


create_iam_role: create_logs_role ## Create the IAM role (valid for a specific lambda function)
	$(eval FUNCTION_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.function_name' | sed 's/^"\(.*\)".*/\1/'))
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


deploy_app: build_app ## Create the lambda function by uploading the zip file
	$(eval FUNCTION_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.function_name'))
	$(eval DESCRIPTION := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.description'))
	$(eval TIMEOUT := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.timeout'))
	$(eval MEMORY_SIZE := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.memory_size'))
	$(eval IAM_ROLE_ARN := $(shell more $(APP_DIR)/role_profile.json | jq '.Role.Arn'))
	$(eval BUCKET_NAME := $(shell $(PYTHON) setup_s3.py --get_name --profile $(PROFILE)))
	$(eval AWS_REGION := $(shell more $(PATH_CONFIG_FILE) | jq '.aws.region' | sed 's/^"\(.*\)".*/\1/'))
	$(AWS) lambda create-function \
	--region $(REGION) \
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
.PHONY: deploy_app


create_api: ## Create a REST API using APIgateway
	$(eval API_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.api.name'))
	$(eval API_DESCRIPTION := $(shell more $(PATH_CONFIG_FILE) | jq '.api.description'))
	
	$(AWS) apigateway create-rest-api \
	--name	$(API_NAME) \
	--description $(API_DESCRIPTION) > $(APP_DIR)/rest_api.json
.PHONY: create_api


get_root_resource_id: ## Get the REST root resource
	$(eval REST_API_ID := $(shell more $(APP_DIR)/rest_api.json | jq '.id'))
	$(AWS) apigateway get-resources \
	--rest-api-id $(REST_API_ID) > $(APP_DIR)/resources.json
.PHONY: get_resource_id


create_resource: get_root_resource_id ## Create the main resource named as the lambda function
	$(eval ROOT_RESOURCE_ID := $(shell more $(APP_DIR)/resources.json | jq '.items[] | select(.path == "/") | .id'))
	$(eval FUNCTION_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.function_name'))
	$(AWS) apigateway create-resource \
	--rest-api-id $(REST_API_ID) \
	--parent-id $(ROOT_RESOURCE_ID) \
	--path-part $(FUNCTION_NAME)

get_resource_id: get_root_resource_id ## Get the resource id of the "/" and of "/<lambda_function_name>"
	$(eval REST_API_ID := $(shell more $(APP_DIR)/rest_api.json | jq '.id' | sed 's/^"\(.*\)".*/\1/'))
	$(eval ROOT_RESOURCE_ID := $(shell more $(APP_DIR)/resources.json | jq '.items[] | select(.path == "/") | .id'))
	$(eval RESOURCE_ID := $(shell more $(APP_DIR)/resources.json | jq '.items[] | select(.parentId == $(ROOT_RESOURCE_ID)) | .id'))

create_methods: get_resource_id ## Create the HTTP methods GET, POST and OPTIONS
	$(AWS) apigateway put-method \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method GET \
	--authorization-type NONE \
	--request-parameters '{}' \
	--no-api-key-required > $(APP_DIR)/get_method.json

	$(AWS) apigateway put-method \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method POST \
	--authorization-type NONE \
	--request-parameters '{}' \
	--no-api-key-required > $(APP_DIR)/post_method.json

	$(AWS) apigateway put-method \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method OPTIONS \
	--authorization-type NONE \
	--request-parameters '{}' \
	--no-api-key-required > $(APP_DIR)/options_method.json
.PHONY: create_methods


get_function_arn_uri: ## Get the ARN and URI of the lambda function
	$(eval FUNCTION_ARN := $(shell more $(APP_DIR)/lambda_function.json | jq '.FunctionArn' | sed 's/^"\(.*\)".*/\1/'))
	$(eval FUNCTION_URI := arn:aws:apigateway:$(AWS_REGION):lambda:path/2015-03-31/functions/$(FUNCTION_ARN)/invocations)
.PHONY: get_function_arn_uri


configure_get_method: get_resource_id get_function_arn_uri ## Configure the integration and the responses for the GET method
	$(AWS) apigateway put-integration \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method GET \
	--integration-http-method POST \
	--type AWS_PROXY \
	--uri $(FUNCTION_URI) \
	--passthrough-behavior WHEN_NO_MATCH \
	--cache-namespace $(RESOURCE_ID) \
	--cache-key-parameters '[]' \
	--content-handling CONVERT_TO_TEXT

	$(AWS) apigateway put-method-response \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method GET \
	--status-code 200 \
	--response-models '{"application/json": "Empty"}' \
	--response-parameters '{"method.response.header.Access-Control-Allow-Origin": false}'

	$(AWS) apigateway put-integration-response \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method GET \
	--status-code 200 \
	--response-templates '{"application/json": ""}' \
	--response-parameters $(CORS_HEADERS)
.PHONY: configure_get_method


configure_post_method: get_resource_id get_function_arn_uri ## Configure the integration and the responses for the POST method
	$(AWS) apigateway put-integration \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method POST \
	--integration-http-method POST \
	--type AWS_PROXY \
	--uri $(FUNCTION_URI) \
	--passthrough-behavior WHEN_NO_MATCH \
	--cache-namespace $(RESOURCE_ID) \
	--cache-key-parameters '[]' \
	--content-handling CONVERT_TO_TEXT

	$(AWS) apigateway put-method-response \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method POST \
	--status-code 200 \
	--response-models '{"application/json": "Empty"}' \
	--response-parameters '{"method.response.header.Access-Control-Allow-Origin": false}'

	$(AWS) apigateway put-integration-response \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method POST \
	--status-code 200 \
	--response-templates '{"application/json": ""}' \
	--response-parameters $(CORS_HEADERS)
.PHONY: configure_post_method


configure_options_method: get_resource_id get_function_arn_uri ## Configure the integration and the responses for the OPTIONS method
	$(AWS) apigateway put-integration \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method OPTIONS \
	--type MOCK \
	--passthrough-behavior WHEN_NO_MATCH \
	--cache-namespace $(RESOURCE_ID) \
	--cache-key-parameters '[]' \
	--request-templates '{"application/json": "{\"statusCode\": 200}"}'

	$(AWS) apigateway put-method-response \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method OPTIONS \
	--status-code 200 \
	--response-parameters $(METHOD_OPTIONS_RESPONSE) \
	--response-models '{"application/json": "Empty"}'

	$(AWS) apigateway put-integration-response \
	--rest-api-id $(REST_API_ID) \
	--resource-id $(RESOURCE_ID) \
	--http-method OPTIONS \
	--status-code 200 \
	--response-parameters $(INTEGRATION_OPTIONS_RESPONSE) \
	--response-template '{"application/json": ""}'
.PHONY: configure_options_method

deploy_api: get_resource_id
	$(AWS) apigateway create-deployment \
	--rest-api-id $(REST_API_ID) \
	--stage-name prod \
	--description "Deploy to production stage" > $(APP_DIR)/deployed.json

prepare_api_spec: get_function_arn_uri
	$(eval FUNCTION_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.function_name' | sed 's/^"\(.*\)".*/\1/'))
	more $(SWAGGER_API_TEMPLATE) | \
	jq '.paths["/hello_world"]["x-amazon-apigateway-any-method"]["x-amazon-apigateway-integration"].uri = "$(FUNCTION_URI)" | \
	.info.title = "$(FUNCTION_NAME)"' \
	> $(APP_DIR)/rest_api_spec.json

prepare_api_spec_new:
	$(PYTHON) ./generate_api_template.py \
	$(APP_DIR)/lambda_function.json \
	$(APP_DIR)/rest_api_spec.json

submit_api_spec:
	$(AWS) apigateway import-rest-api \
	--body file://$(APP_DIR)/rest_api_spec.json > $(APP_DIR)/rest_api.json


enable_api: get_function_arn_uri get_resource_id
	$(eval ACCOUNT_ID := $(shell more $(PATH_CONFIG_FILE) | jq '.aws.account' | sed 's/^"\(.*\)".*/\1/'))
	$(eval AWS_REGION := $(shell more $(PATH_CONFIG_FILE) | jq '.aws.region' | sed 's/^"\(.*\)".*/\1/'))
	$(eval FUNCTION_NAME := $(shell more $(PATH_CONFIG_FILE) | jq '.lambda.function_name' | sed 's/^"\(.*\)".*/\1/'))
	$(AWS) lambda add-permission \
	--function-name $(FUNCTION_ARN) \
	--source-arn 'arn:aws:execute-api:$(AWS_REGION):$(ACCOUNT_ID):$(REST_API_ID)/*/*/$(FUNCTION_NAME)' \
	--principal apigateway.amazonaws.com \
	--statement-id $(call random_uuid) \
	--action lambda:InvokeFunction
	$(AWS) lambda add-permission \
	--function-name $(FUNCTION_ARN) \
	--source-arn 'arn:aws:execute-api:$(AWS_REGION):$(ACCOUNT_ID):$(REST_API_ID)/prod/ANY/$(FUNCTION_NAME)' \
	--principal apigateway.amazonaws.com \
	--statement-id $(call random_uuid) \
	--action lambda:InvokeFunction


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



# curl -H 'x-api-key: xxx' \
-v https://veg94dkn94.execute-api.us-west-2.amazonaws.com/prod/hello_world
#curl -H 'x-api-key: xxx' \
-X POST https://veg94dkn94.execute-api.us-west-2.amazonaws.com/prod/hello_world
