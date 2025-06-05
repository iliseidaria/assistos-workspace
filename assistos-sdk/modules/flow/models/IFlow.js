(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.IFlow = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    class IFlow {
        constructor() {
            const schema = this.constructor.flowParametersSchema;
            const metadata = this.constructor.flowMetadata;

            if (!schema) {
                throw new Error("Flow inputParametersValidationSchema is required");
            }
            if (!metadata) {
                throw new Error("Flow metadata is required");
            } else {
                if (!metadata.intent) {
                    throw new Error("Flow flowMetadata.intent is required");
                }
                if (!metadata.action) {
                    throw new Error("Flow flowMetadata.action is required");
                }
            }
        }

        loadModule(moduleName) {
            if (typeof require !== 'undefined') {
                return require("assistos").loadModule(moduleName, this.__securityContext);
            } else if (typeof assistOS !== 'undefined') {
                return assistOS.loadModule(moduleName, this.__securityContext);
            } else {
                throw new Error("Module loading is not supported in this environment");
            }
        }

        validateParameters(flowParameters) {
            const schema = this.constructor.flowParametersSchema;
            for (let key in schema) {
                if (schema[key].required && !flowParameters[key]) {
                    throw new Error(`Parameter ${key} is required`);
                }
            }
        }

        genericReject(reject, error) {
            reject({
                success: false,
                message: error.message,
                statusCode: error.statusCode || 500
            });
        }

        resolve(resolve, data) {
            resolve({
                success: true,
                data: data
            });
        }

        reject(reject, error) {
            reject({
                success: false,
                message: error.message,
                statusCode: error.statusCode || 500
            });
        }

        async execute(parameters) {
            return new Promise(async (resolve, reject) => {
                const apis = {
                    success: (data) => this.resolve(resolve, data),
                    fail: (error) => this.reject(reject, error),
                    loadModule: (moduleName) => this.loadModule(moduleName, this.__securityContext)
                };
                try {
                    this.validateParameters(parameters);
                    await this.userCode(apis, parameters);
                } catch (error) {
                    this.genericReject(reject, error);
                }
            });
        }
    }
    return IFlow;
}));
