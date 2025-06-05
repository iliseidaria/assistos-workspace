const constants = require("../../constants.js");
const envType = require("assistos").envType;

function fillTemplate(templateObject, fillObject, depth = 0) {
    /* Todo: Implement a detection mechanism for circular dependencies instead of a hardcoded nested depth limit */

    if (depth > 10) {
        throw new Error("Depth Overreach. Possible Circular Dependency");
    }

    const containsPlaceholder = (templateObjectValueString) => {
        const placeholderPattern = /\$\$[a-zA-Z0-9_]+(\?)?/g;
        return placeholderPattern.test(templateObjectValueString);
    }

    if (typeof templateObject === 'string') {
        if (containsPlaceholder(templateObject)) {
            let resultString = "";
            let buffer = "";
            let placeholder = "";
            let i = 0;

            while (i < templateObject.length) {
                if (templateObject[i] === '$' && templateObject[i + 1] === '$') {
                    if (buffer.length > 0) {
                        resultString += buffer;
                        buffer = "";
                    }
                    i += 2;
                    while (i < templateObject.length &&
                    /[\w?]/.test(templateObject[i])) {
                        placeholder += templateObject[i];
                        i++;
                    }
                    const optionalPlaceholder = placeholder.endsWith('?');
                    const placeholderKey = optionalPlaceholder ? placeholder.slice(0, -1) : placeholder;
                    if (fillObject.hasOwnProperty(placeholderKey)) {
                        let placeholderValue = fillObject[placeholderKey];
                        let isFullReplacement = templateObject.trim() === `$$${placeholderKey}` || templateObject.trim() === `$$${placeholderKey}?`;

                        if (typeof placeholderValue === 'object') {
                            if (!Array.isArray(placeholderValue) && !isFullReplacement) {
                                resultString += JSON.stringify(placeholderValue);
                            } else if (Array.isArray(placeholderValue) && !isFullReplacement) {
                                resultString += JSON.stringify(placeholderValue);
                            } else {
                                return placeholderValue;
                            }
                        } else if (placeholderValue === undefined && optionalPlaceholder) {
                            resultString += "";
                        } else {
                            resultString += placeholderValue.toString();
                        }
                    } else if (!optionalPlaceholder) {
                        throw new Error(`Missing required fill data for "${placeholderKey}"`);
                    }
                    placeholder = "";
                } else {
                    buffer += templateObject[i];
                    i++;
                }
            }
            resultString += buffer;
            return resultString;
        } else {
            return templateObject;
        }
    } else if (Array.isArray(templateObject)) {
        return templateObject.reduce((acc, currentElement) => {
            const replacedElement = fillTemplate(currentElement, fillObject, depth + 1);
            if (replacedElement !== "") {
                acc.push(replacedElement);
            }
            return acc;
        }, []);

    } else if (typeof templateObject === 'object') {
        const newObj = {};
        for (const [key, value] of Object.entries(templateObject)) {
            newObj[key] = fillTemplate(value, fillObject, depth + 1);
        }
        return newObj;
    } else {
        return templateObject;
    }
}

async function request(url, method, securityContext, data) {
    let init = {
        method: method,
        headers: {}
    };
    if (method === "POST" || method === "PUT") {
        if (data instanceof FormData || typeof data === "function") {
            /* let the browser decide the content type */
            init.body = data;
        } else if (typeof data === "string") {
            init.body = data;
            init.headers["Content-Type"] = "text/plain; charset=UTF-8";
        } else if (data instanceof ArrayBuffer || Buffer.isBuffer(data) || data instanceof Uint8Array) {
            init.body = data;
            init.headers["Content-Type"] = "application/octet-stream";
        } else {
            init.body = JSON.stringify(data);
            init.headers["Content-Type"] = "application/json; charset=UTF-8";
        }
    }
    if (envType === constants.ENV_TYPE.NODE) {
        url = `${constants[constants.ENVIRONMENT_MODE]}${url}`;
        init.headers.Cookie = securityContext.cookies;
    }
    let response;
    try {
        response = await fetch(url, init);
    } catch (err) {
        throw new Error(err.message);
    }
    const contentType = response.headers.get('Content-Type');
    if (contentType.includes('application/zip')) {
        return await response.blob();
    }
    if (contentType.includes('audio/') || contentType.includes('image/') || contentType.includes('video/') || contentType.includes('application/octet-stream')) {
        return await response.arrayBuffer();
    }
    if (method === "HEAD") {
        return response.ok;
    }
    if(contentType.includes('application/json')) {
        const responseJSON = await response.json();
        if (!response.ok) {
            let errorData = {
                status: response.status,
                message: responseJSON.message || "Unknown error"
            }
            throw new Error(JSON.stringify(errorData));
        }
        return responseJSON.data;
    }

    let textResponse = await response.text();
    if(!response.ok){
        throw new Error(textResponse);
    }
    return textResponse;
}

function unescapeHTML(value) {
    if (value != null && typeof value === "string") {
        return value.replace(/&amp;/g, '&')
            .replace(/&#39;/g, `'`)
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#13;/g, '\n')
            .replace(/&nbsp;/g, ' ');
    }
    return value;
}
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);

    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

function buildCommandsString(commandsObject) {
    const sortedCommandsArray = getSortedCommandsArray(commandsObject);
    return sortedCommandsArray.map(command => {
        let name = command.name;
        delete command.name;
        return buildCommandString(name, command || {});
    }).join("\n");
}

function buildCommandString(commandName, parameters) {
    let commandConfig = constants.COMMANDS_CONFIG.COMMANDS.find(cmd => cmd.NAME === commandName);
    if(commandConfig.TYPE === "array"){
        return parameters.map(commandParams => {
            const parametersString = Object.entries(commandParams).map(([key, value]) => {
                    return `${key}=${value}`;
                }).join(' ');
            return `${commandConfig.ITEM_NAME} ${parametersString};`
        }).join('\n');
    }
    const parametersString = Object.entries(parameters)
        .map(([key, value]) => {
            return `${key}=${value}`;
        }).join(' ');
    return `${commandName} ${parametersString};`
}

function getSortedCommandsArray(commandsObject) {
    Object.keys(commandsObject).forEach(key => {
        commandsObject[key].name = key;
    });
    return Object.values(commandsObject).sort((a, b) => {
        return constants.COMMANDS_CONFIG.ORDER.indexOf(a.name) - constants.COMMANDS_CONFIG.ORDER.indexOf(b.name);
    }).reduce((acc, command) => {
        if (constants.COMMANDS_CONFIG.ORDER.includes(command.name)) {
            acc.push(command);
        }
        return acc
    }, []);
}
function processCommandParams(stringParams, commandConfig) {
    let commandParams = {};
    if(!stringParams){
        return commandParams;
    }
    let paramsArray = stringParams.split(/\s+/);
    for (let param of paramsArray) {
        if (param.includes('=')) {
            let [name, value] = param.split('=');
            let parameter = commandConfig.PARAMETERS?.find(p => p.NAME === name);
            if (!parameter) {
                throw new Error(`Unknown parameter "${name}" in command: "${commandConfig.NAME}"`);
            }
            if (parameter.TYPE === 'number') {
                value = parseFloat(value);
                if (isNaN(value) || value < parameter.MIN_VALUE || value > parameter.MAX_VALUE) {
                    throw new Error(`Invalid value for parameter "${name}" in command: "${commandConfig.NAME}"`);
                }
            } else if (parameter.TYPE === 'string' && parameter.VALUES && !parameter.VALUES.includes(value)) {
                throw new Error(`Invalid value for parameter "${name}" in command: "${commandConfig.NAME}"`);
            }
            commandParams[name] = value;
        } else {
            throw new Error(`Invalid parameter format "${param}" in command: "${commandConfig.NAME}"`);
        }
    }
    for (let configParam of commandConfig.PARAMETERS) {
        if (configParam.REQUIRED && !commandParams.hasOwnProperty(configParam.NAME)) {
            throw new Error(`Missing required parameter "${configParam.NAME}" in command: "${commandConfig.NAME}"`);
        }
    }
    return commandParams;
}
function findCommands(input) {
    input = unescapeHTML(input);
    input = input.trim();

    const commandsArray = input.split(';').map(cmd => cmd.trim()).filter(cmd => cmd !== '');
    const result = {};

    const regex = /^(\w+)(\s+.*)?$/;
    let foundCommands = {}

    for (const commandStr of commandsArray) {
        const match = commandStr.match(regex);
        if (!match) {
            throw new Error(`Invalid command format: "${commandStr}"`);
        }
        const commandName = match[1];
        let repeatableCommand = constants.COMMANDS_CONFIG.COMMANDS.find(cmd => cmd.ITEM_NAME === commandName);
        if (repeatableCommand) {
            if (!foundCommands[repeatableCommand.NAME]) {
                foundCommands[repeatableCommand.NAME] = [];
            }
            foundCommands[repeatableCommand.NAME].push(match[2] ? match[2].trim() : '');
        } else if (foundCommands[commandName]) {
            throw new Error(`Command "${commandName}" is not repeatable`);
        } else {
            foundCommands[commandName] = match[2] ? match[2].trim() : '';
        }
    }


    for (const commandName in foundCommands) {
        const commandParamsString = foundCommands[commandName];
        if(Array.isArray(commandParamsString)){
            let commandConfig = constants.COMMANDS_CONFIG.COMMANDS.find(cmd => cmd.NAME === commandName);
            let resultArray = [];
            for(let stringParam of commandParamsString){
                resultArray.push(processCommandParams(stringParam, commandConfig));
            }
            result[commandName] = resultArray;
            continue;
        }

        const commandConfig = constants.COMMANDS_CONFIG.COMMANDS.find(cmd => cmd.NAME === commandName);
        if (!commandConfig) {
            throw new Error(`Unknown command "${commandName}"`);
        }

        for (let previousCommandKey of Object.keys(result)) {
            if (!commandConfig.NOT_ALLOWED_ALONG) {
                continue;
            }
            if (commandConfig.NOT_ALLOWED_ALONG.includes(previousCommandKey)) {
                throw new Error(`Command "${commandName}" is not allowed alongside "${previousCommandKey}"`);
            }
        }
        result[commandName] = processCommandParams(commandParamsString, commandConfig);
    }
    return result;
}

function getCommandsDifferences(commandsObject1, commandsObject2) {
    const differencesObject = {};
    const keys1 = Object.keys(commandsObject1);
    const keys2 = Object.keys(commandsObject2);

    for (const key of keys1) {
        if (!keys2.includes(key)) {
            differencesObject[key] = "deleted"; // command no longer exists in the updated commands config
        } else {
            differencesObject[key] = areCommandsDifferent(commandsObject1[key], commandsObject2[key]) ? "changed" : "same";
        }
    }

    for (const key of keys2) {
        if (!keys1.includes(key)) {
            differencesObject[key] = "new"; // command is new in the updated commands config
        }
    }
    return differencesObject;
}

function areCommandsDifferent(commandParams1, commandParams2) {
    if (Array.isArray(commandParams1) && Array.isArray(commandParams2)) {
        if (commandParams1.length !== commandParams2.length) {
            return true;
        }
        for (let i = 0; i < commandParams1.length; i++) {
            if (areCommandsDifferent(commandParams1[i], commandParams2[i])) {
                return true;
            }
        }
        return false;
    } else if (typeof commandParams1 === 'object' && typeof commandParams2 === 'object') {
        const keys1 = Object.keys(commandParams1);
        const keys2 = Object.keys(commandParams2);

        if (keys1.length !== keys2.length) {
            return true;
        }

        for (let key of keys1) {
            if (commandParams1[key] !== commandParams2[key]) {
                return true;
            }
        }

        for (let key of keys2) {
            if (!keys1.includes(key)) {
                return true;
            }
        }
        return false;
    }
    return commandParams1 !== commandParams2;
}

function unsanitize(value) {
    if (value != null && typeof value === "string") {
        return value.replace(/&nbsp;/g, ' ')
            .replace(/&#13;/g, '\n')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }
    return '';
}

function sanitize(value) {
    if (value != null && typeof value === "string") {
        return value.replace(/&/g, '&amp;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\r\n/g, '&#13;')
            .replace(/[\r\n]/g, '&#13;').replace(/\s/g, '&nbsp;');
    }
    return value;
}

async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}
async function getTaskLogs(spaceId, taskId) {
    return await this.sendRequest(`/tasks/logs/${spaceId}/${taskId}`, "GET");
}

async function cancelTask(taskId) {
    return await this.sendRequest(`/tasks/cancel/${taskId}`, "DELETE");
}

async function cancelTaskAndRemove(taskId) {
    return await this.sendRequest(`/tasks/remove/${taskId}`, "DELETE");
}

async function removeTask(taskId) {
    return await this.sendRequest(`/tasks/remove/${taskId}`, "DELETE");
}
async function downloadLogsFile(spaceId) {
    return await this.sendRequest(`/logs/${spaceId}`, "GET");
}

async function getTasks(spaceId) {
    return await this.sendRequest(`/tasks/space/${spaceId}`, "GET");
}

async function getTask(taskId) {
    return await this.sendRequest(`/tasks/${taskId}`, "GET");
}

async function getTaskRelevantInfo(taskId) {
    return await this.sendRequest(`/tasks/info/${taskId}`, "GET");
}

async function runTask(taskId) {
    return await this.sendRequest(`/tasks/${taskId}`, "POST", {});
}
async function runAllDocumentTasks(spaceId, documentId) {
    return await this.sendRequest(`/tasks/run-all/${spaceId}/${documentId}`, "POST", {});
}
async function cancelAllDocumentTasks(spaceId, documentId) {
    return await this.sendRequest(`/tasks/cancel-all/${spaceId}/${documentId}`, "DELETE");
}
module.exports = {
    request,
    fillTemplate,
    findCommands,
    arrayBufferToBase64,
    areCommandsDifferent,
    getCommandsDifferences,
    buildCommandString,
    buildCommandsString,
    cancelTask,
    getTasks,
    runTask,
    runAllDocumentTasks,
    cancelAllDocumentTasks,
    getTaskRelevantInfo,
    cancelTaskAndRemove,
    sendRequest,
    getTask,
    getTaskLogs,
    removeTask,
    downloadLogsFile,
    sanitize,
    getSortedCommandsArray,
    unsanitize
}
