const ServerSideSecurityContext = require('./modules/user/models/ServerSideSecurityContext');
const ClientSideSecurityContext = require('./modules/user/models/ClientSideSecurityContext');
const constants = require('./constants');

function detectEnvironment() {
    if (typeof fetch === 'function' && typeof document === 'object') {
        return constants.ENV_TYPE.BROWSER;
    } else if (typeof require === 'function' && typeof module === 'object' && typeof module.exports === 'object') {
        return constants.ENV_TYPE.NODE;
    } else {
        return constants.ENV_TYPE.UNKNOWN;
    }
}

const envType = detectEnvironment();

function _loadModule(moduleName) {
    switch (moduleName) {
        case 'document':
            return require('./modules/document');
        case 'space':
            return require('./modules/space');
        case 'user':
            return require('./modules/user');
        case 'personality':
            return require('./modules/personality');
        case 'flow':
            return require('./modules/flow');
        case 'util':
            return require('./modules/util');
        case 'llm':
            return require('./modules/llm');
        case 'application':
            return require('./modules/application');
        case 'gallery':
            return require('./modules/gallery');
        case 'notification':
            return require('./modules/notification');
        default:
            return null;
    }
}

function sdkModule(moduleName, securityContext) {
    let module = _loadModule(moduleName);
    this.__securityContext = securityContext;
    for (let key in module) {
        if (typeof module[key] === 'function' && !(module[key].prototype && Object.getOwnPropertyNames(module[key].prototype).length > 1 && module[key].prototype.constructor === module[key])) {
            this[key] = module[key].bind(this);
        } else {
            this[key] = module[key];
        }
    }
    return this;
}

function loadModule(moduleName, userContext) {
    if (!userContext) {
        throw new Error("User context is required to load a module");
    }
    return new sdkModule(moduleName, userContext);
}

module.exports = {
    loadModule: loadModule,
    constants: constants,
    envType,
    ServerSideSecurityContext,
    ClientSideSecurityContext
};
