const Paragraph = require("./models/Paragraph");
async function getParagraph(spaceId, documentId, paragraphId) {
    let paragraphData = await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${paragraphId}`, "GET");
    return new Paragraph(paragraphData);
}

async function addParagraph(spaceId, documentId, chapterId, paragraphData) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${chapterId}`, "POST", paragraphData);
}

async function updateParagraph(spaceId, documentId, paragraphId, paragraphData) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${paragraphId}`, "PUT", paragraphData);
}

async function deleteParagraph(spaceId, documentId, chapterId, paragraphId) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${chapterId}/${paragraphId}`, "DELETE");
}
async function swapParagraphs(spaceId, documentId, chapterId, paragraphId, paragraphId2, direction) {
    return await this.sendRequest(`/documents/chapters/paragraphs/swap/${spaceId}/${documentId}/${chapterId}/${paragraphId}/${paragraphId2}`, "PUT", { direction });
}
async function getParagraphText(spaceId, documentId, paragraphId) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${paragraphId}?fields=text`, "GET");
}
async function updateParagraphText(spaceId, documentId, paragraphId, text) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${paragraphId}?fields=text`, "PUT", text);
}
async function updateParagraphComment(spaceId, documentId, paragraphId, text) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${paragraphId}?fields=comment`, "PUT", text);
}

async function updateParagraphCommands(spaceId, documentId, paragraphId, commandsObject) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${paragraphId}?fields=commands`, "PUT", commandsObject);
}

async function getParagraphCommands(spaceId, documentId, paragraphId) {
    return await this.sendRequest(`/documents/chapters/paragraphs/${spaceId}/${documentId}/${paragraphId}?fields=commands`, "GET");
}

async function chatCompleteParagraph({ spaceId, documentId, paragraphId, prompt, modelName=undefined, agentId=undefined }) {
    if (spaceId === undefined) throw new Error("Parameter 'spaceId' is required")
    if (documentId === undefined) throw new Error("Parameter 'documentId' is required")
    if (paragraphId === undefined) throw new Error("Parameter 'paragraphId' is required")
    if (prompt === undefined) throw new Error("Parameter 'prompt' is required")
    if (modelName === undefined && agentId === undefined) throw new Error("Either 'modelName' or 'agentId' must be defined")
    return this.sendRequest(`/spaces/chat-completion/${spaceId}/${documentId}/${paragraphId}`, "POST", {
        modelName, prompt, agentId
    })
}

async function createTextToSpeechTask(spaceId, documentId, paragraphId) {
    return await this.sendRequest(`/tasks/audio/${spaceId}/${documentId}/${paragraphId}`, "POST", {});
}
async function createLipSyncTask(spaceId, documentId, paragraphId, modelName, configs) {
    return await this.sendRequest(`/tasks/lipsync/${spaceId}/${documentId}/${paragraphId}`, "POST", {
        modelName: modelName,
        ...(configs || {})
    });
}
async function createParagraphCompileVideoTask(spaceId, documentId, chapterId, paragraphId) {
    return await this.sendRequest(`/tasks/video/${spaceId}/${documentId}/${chapterId}/${paragraphId}`, "POST", {});
}
module.exports = {
    getParagraph,
    addParagraph,
    updateParagraph,
    deleteParagraph,
    swapParagraphs,
    updateParagraphText,
    getParagraphText,
    createTextToSpeechTask,
    getParagraphCommands,
    updateParagraphCommands,
    createLipSyncTask,
    updateParagraphComment,
    createParagraphCompileVideoTask,
    chatCompleteParagraph
}
