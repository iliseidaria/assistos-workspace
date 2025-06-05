const IFlow = require("./models/IFlow.js");
const request = require("../util").request;
const constants = require("../../constants.js");

async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}

async function listFlows() {
    return await this.sendRequest(`/flows/list`, "GET");
}

async function getFlow(spaceId, flowName) {
    return await import(`/flows/${spaceId}/${flowName}`);
}

async function callServerFlow(spaceId, flowName, context, personalityId) {
    return await this.sendRequest(`/flows/call/${spaceId}/${flowName}`, "POST", {
        context: context,
        personalityId: personalityId
    });
}

async function callFlow(spaceId, flowName, context, personalityId) {
    const envType = require("assistos").envType;
    const personalityModule = require("assistos").loadModule("personality", {});
    if (envType === constants.ENV_TYPE.NODE) {
        return await this.callServerFlow(spaceId, flowName, context, personalityId);
    } else if (envType === constants.ENV_TYPE.BROWSER) {
        let flowInstance;
        if (assistOS.currentApplicationName === assistOS.configuration.defaultApplicationName) {
            flowInstance = await assistOS.space.getFlow(flowName);
        } else {
            let app = assistOS.space.getApplicationByName(assistOS.currentApplicationName);
            flowInstance = app.getFlow(flowName);
        }
        let personality;
        if (personalityId) {
            personality = await personalityModule.getPersonality(assistOS.space.id, personalityId);
        } else {
            personality = await personalityModule.getPersonalityByName(assistOS.space.id, constants.DEFAULT_PERSONALITY_NAME);
        }
        const executeFlow = async (context, personality) => {
            flowInstance.__securityContext = {};
            return await flowInstance.execute(context, personality);
        };
        return await executeFlow(context, personality);
    }
}

module.exports = {
    getFlow,
    listFlows,
    callFlow,
    callServerFlow,
    sendRequest,
    IFlow
}