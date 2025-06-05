const {request} = require("../util");
const personalityType = "personalities";
const Personality = require('./models/Personality.js');
async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}
async function getPersonalitiesMetadata(spaceId){
    try {
        await this.sendRequest(`/personalities/${spaceId}/ensure-default-llms`, "POST");
    }catch(error){
        //ignore error
    }
    return await this.sendRequest(`/spaces/fileObject/${spaceId}/${personalityType}`, "GET");
}
async function getPersonalities(spaceId){
    let personalities = await this.sendRequest(`/spaces/fileObject/${spaceId}/${personalityType}/data`, "GET");
    return personalities.map(personality => new Personality(personality));
}

async function getPersonality(spaceId, fileName){
    let personality =  await this.sendRequest(`/spaces/fileObject/${spaceId}/${personalityType}/${fileName}`, "GET");
    return new Personality(personality);
}
async function createNewConversation(spaceId,personalityId){
    return await this.sendRequest(`/personalities/chats/${spaceId}/${personalityId}`,"POST");
}

async function getPersonalitiesConversations(spaceId,personalityId){
    return await this.sendRequest(`/personalities/chats/${spaceId}/${personalityId}`,"GET")
}

async function getPersonalityByName(spaceId, name){
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
    let metadataList = await this.getPersonalitiesMetadata(spaceId)
    let personalityId = metadataList.find(pers => unsanitize(pers.name) === name).id;
    return await this.getPersonality(spaceId, personalityId);
}

async function getAgent(spaceId, agentId) {
    let url = `/spaces/${spaceId}/agents`;
    if (agentId) {
        url += `/${agentId}`;
    }
    return await this.sendRequest(url, 'GET');
}

async function addPersonality(spaceId, personalityData){
    return await this.sendRequest(`/personalities/${spaceId}`, "POST", personalityData, this.__securityContext);
}

async function updatePersonality(spaceId, fileName, personalityData){
    return await this.sendRequest(`/spaces/fileObject/${spaceId}/${personalityType}/${fileName}`, "PUT", personalityData, this.__securityContext);
}
async function deletePersonality(spaceId, fileName){
    return await this.sendRequest(`/spaces/fileObject/${spaceId}/${personalityType}/${fileName}`, "DELETE", this.__securityContext);
}
async function exportPersonality(spaceId, personalityId){
    return await this.sendRequest(`/spaces/${spaceId}/export/personalities/${personalityId}`, "GET", this.__securityContext);
}

async function sendQuery(spaceId, personalityId, chatId, prompt){
    return await this.sendRequest(`/chats/send/${spaceId}/${personalityId}/${chatId}`, "POST", prompt);
}
async function createChat(spaceId, personalityId){
    return await this.sendRequest(`/chats/${spaceId}/${personalityId}`, "POST");
}
module.exports = {
    getPersonalitiesMetadata,
    getPersonality,
    addPersonality,
    updatePersonality,
    deletePersonality,
    sendRequest,
    getAgent,
    getPersonalities,
    createNewConversation,
    getPersonalitiesConversations,
    getPersonalityByName,
    exportPersonality,
    sendQuery,
    createChat,
    models:{
        personality:require('./models/Personality.js'),
        agent:require('./models/Agent.js')
    }
}
