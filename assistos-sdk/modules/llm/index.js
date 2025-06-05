const {request} = require("../util");
const personalityType = "personalities";

async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}

async function getPersonality(spaceId, fileName) {
    const Personality = require("../personality/models/Personality");
    let personality;
    if (fileName) {
        try {
            personality = await this.sendRequest(`/spaces/fileObject/${spaceId}/${personalityType}/${fileName}`, "GET");
        } catch (error) {
            personality = await this.getDefaultPersonality(spaceId);
        }
    } else {
        personality = await this.getDefaultPersonality(spaceId);
    }
    return new Personality(personality);
}

async function getDefaultPersonality(spaceId) {
    const Personality = require("../personality/models/Personality");
    const personality = await this.sendRequest(`/personalities/default/${spaceId}`, "GET");
    return new Personality(personality);
}

async function generateTextAdvanced(spaceId, initiatorPersonality, targetPersonality, requestPrompt, outputFormatPrompt) {
    const requestData = {
        initiator: initiatorPersonality,
        target: targetPersonality,
        text: requestPrompt,
        outputFormat: outputFormatPrompt
    }
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/text/generate/advanced`, "POST", requestData)
}

async function generateText(spaceId, prompt, personalityId) {
    const personality = await this.getPersonality(spaceId, personalityId)
    const requestData = {
        modelName: personality.getCurrentSettings("text"),
        prompt: prompt
    }
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/text/generate`, "POST", requestData)
}

async function getChatCompletion(spaceId, chat, personalityId, injectPersonalityAsSysPrompt = false) {
    const personality = await this.getPersonality(spaceId, personalityId);
    if (injectPersonalityAsSysPrompt) {
        personality.applyPersonalityToSysPromptChat(chat);
    }
    const requestData = {
        modelName: personality.getCurrentSettings("chat"),
        chat: chat
    }
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/chat/generate`, "POST", requestData);
}


async function textToSpeech(spaceId, modelConfigs, personalityId) {
    const personality = await this.getPersonality(spaceId, personalityId);
    const requestData = {
        modelName: personality.getCurrentSettings("audio"),
        ...modelConfigs
    }
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/audio/generate`, "POST", requestData);
}

async function generateImage(spaceId, modelConfigs, personalityId) {
    const personality = await this.getPersonality(spaceId, personalityId);
    const requestData = {
        modelName: personality.getCurrentSettings("image"),
        ...modelConfigs
    }
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/image/generate`, "POST", requestData);
}

async function editImage(spaceId, modelName, modelConfigs, personalityId) {
    const personality = await this.getPersonality(spaceId, personalityId);
    const requestData = {
        modelName: personality.getCurrentSettings("image"),
        ...modelConfigs
    }
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/image/edit`, "POST", requestData);
}

async function lipSync(spaceId, taskId, videoId, audioId, modelConfigs, personalityId) {
    const personality = await this.getPersonality(spaceId, personalityId);
    const requestData = {
        modelName: personality.getCurrentSettings("video"),
        taskId: taskId,
        videoId: videoId,
        audioId: audioId,
        ...modelConfigs
    }
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/video/lipsync`, "POST", requestData);
}

async function listVoices(spaceId, modelName) {
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/audio/listVoices`, "POST", {modelName});
}

async function listEmotions(spaceId, modelName) {
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/audio/listEmotions`, "POST", {modelName});
}

async function getLLMConfigs(spaceId) {
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/configs`, "GET");
}

async function listLlms(spaceId) {
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms`, "GET");
}

async function getDefaultModels() {
    return await this.sendRequest(`/apis/v1/llms/defaults`, "GET");
}
async function getModelLanguages(spaceId, modelName) {
    return await this.sendRequest(`/apis/v1/spaces/${spaceId}/llms/languages`, "POST", {modelName});
}

module.exports = {
    generateText,
    generateTextAdvanced,
    sendRequest,
    generateImage,
    textToSpeech,
    listVoices,
    listEmotions,
    getLLMConfigs,
    editImage,
    getChatCompletion,
    lipSync,
    listLlms,
    getDefaultModels,
    getPersonality,
    getDefaultPersonality,
    getModelLanguages
}
