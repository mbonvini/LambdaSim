import { parseString } from 'xml2js';
import log from 'loglevel';

const FMI_MODEL_DESCRIPTION = "fmiModelDescription";
const VENDOR_ANNOTATIONS = "VendorAnnotations";
const MODEL_VARIABLES = "ModelVariables";
const SCALAR_VARIABLE = "ScalarVariable";
const TOOL = "Tool";
const OBJECT = "$";
const REAL = "Real";
const BOOLEAN = "Boolean";
const INTEGER = "Integer";
const STRING = "String";
const ENUMERATION = "Enumeration"
const VAR_TYPES = [REAL, BOOLEAN, INTEGER, STRING, ENUMERATION];

export class ModelDescription {

    constructor() {
        this.description = null;
        this.typeDefinitions = null;
        this.unitDefinitions = null;
        this.vendorAnnotations = null;
        this.modelVariables = null;
        this.modelStructure = null;
    }

    loadFromXml(modelDescriptionXml) {
        self = this;
        parseString(modelDescriptionXml, function (err, modelDescription) {
            if (err) {
                log.error(err);
            } else {

                // High level model description
                if (modelDescription.hasOwnProperty(FMI_MODEL_DESCRIPTION)) {
                    const fmiModelDescription = modelDescription[FMI_MODEL_DESCRIPTION];
                    self.description = fmiModelDescription[OBJECT];

                    // Vendor annotations (optional)
                    if (fmiModelDescription.hasOwnProperty(VENDOR_ANNOTATIONS)) {
                        self.vendorAnnotations = fmiModelDescription[VENDOR_ANNOTATIONS].map(
                            function (vendorAnn) {
                                if (vendorAnn.hasOwnProperty(TOOL)) {
                                    return vendorAnn[TOOL].map(
                                        function (tool) {
                                            return tool[OBJECT];
                                        }
                                    );
                                } else {
                                    return [];
                                }
                            }
                        )
                    } else {
                        log.info("Missing " + VENDOR_ANNOTATIONS);
                    }

                    // Units (optional)

                    // Model scalar variables (required)
                    if (fmiModelDescription.hasOwnProperty(MODEL_VARIABLES)) {
                        if (fmiModelDescription[MODEL_VARIABLES].length > 0) {
                            if (fmiModelDescription[MODEL_VARIABLES][0].hasOwnProperty(SCALAR_VARIABLE)) {
                                const scalarVars = fmiModelDescription[MODEL_VARIABLES][0][SCALAR_VARIABLE];
                                self.modelVariables = scalarVars.map(
                                    function (variable) {
                                        let varObj = variable[OBJECT];
                                        for(let x in VAR_TYPES){
                                            if(variable.hasOwnProperty(VAR_TYPES[x])){
                                                varObj['type'] = VAR_TYPES[x];
                                                varObj['typeAttr'] = variable[VAR_TYPES[x]][0][OBJECT];
                                            }
                                        }
                                        return varObj;
                                    }
                                );

                            }else{
                                log.error("Missing " + SCALAR_VARIABLE);
                            }
                        }else{
                            log.error("No model variables");
                        }
                    } else {
                        log.error("Missing " + MODEL_VARIABLES);
                    }

                } else {
                    log.error("Missing " + FMI_MODEL_DESCRIPTION);
                }

            }
        });
    }

}