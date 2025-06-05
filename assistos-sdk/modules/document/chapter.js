const Chapter = require("./models/Chapter");
async function getChapter(spaceId, documentId, chapterId) {
    let chapterData = await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}`, "GET");
    return new Chapter(chapterData);
}

async function addChapter(spaceId, documentId, chapterData) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}`, "POST", chapterData);
}

async function updateChapter(spaceId, documentId, chapterData) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterData.id}`, "PUT", chapterData);
}

async function deleteChapter(spaceId, documentId, chapterId) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}`, "DELETE");
}

async function swapChapters(spaceId, documentId, chapterId1, chapterId2, direction) {
    return await this.sendRequest(`/documents/chapters/swap/${spaceId}/${documentId}/${chapterId1}/${chapterId2}`, "PUT", {direction});
}

async function getChapterTitle(spaceId, documentId, chapterId) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=title`, "GET");
}

async function updateChapterTitle(spaceId, documentId, chapterId, title) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=title`, "PUT", title);
}
async function updateChapterComment(spaceId, documentId, chapterId, comment) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=comment`, "PUT", comment);
}
async function updateChapterVisibility(spaceId, documentId, chapterId, visibility) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=visibility`, "PUT", visibility);
}

async function getChapterBackgroundSound(spaceId, documentId, chapterId) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=backgroundSound`, "GET");
}

async function updateChapterBackgroundSound(spaceId, documentId, chapterId, backgroundSound) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=backgroundSound`, "PUT", backgroundSound);
}

async function getChapterCommands(spaceId, documentId, chapterId) {
    let commands = await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=commands`, "GET");
    if(typeof commands === "undefined") {
        return {};
    }
    return commands;
}

async function updateChapterCommands(spaceId, documentId, chapterId, commands) {
    return await this.sendRequest(`/documents/chapters/${spaceId}/${documentId}/${chapterId}?fields=commands`, "PUT", commands);
}

async function compileChapterVideo(spaceId, documentId, chapterId) {
    return await this.sendRequest(`/tasks/video/${spaceId}/${documentId}/${chapterId}`, "POST", {});
}
module.exports = {
    getChapter,
    addChapter,
    updateChapter,
    deleteChapter,
    swapChapters,
    getChapterTitle,
    updateChapterTitle,
    updateChapterVisibility,
    getChapterBackgroundSound,
    updateChapterBackgroundSound,
    updateChapterComment,
    getChapterCommands,
    updateChapterCommands,
    compileChapterVideo
}
