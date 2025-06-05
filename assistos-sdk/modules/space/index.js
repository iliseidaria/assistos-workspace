const {request} = require("../util");
const Space = require('./models/Space.js');
const Announcement = require('./models/Announcement.js');
const constants = require("../../constants");
const envType = require("assistos").envType;

async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}

async function addSpaceAnnouncement(spaceId, announcementData) {
    return await this.sendRequest(`/spaces/${spaceId}/announcements`, "POST", announcementData)
}

async function getSpaceAnnouncement(spaceId, announcementId) {
    return await this.sendRequest(`/spaces/${spaceId}/announcements/${announcementId}`, "GET")
}

async function getSpaceChat(spaceId, chatId) {
    return await this.sendRequest(`/spaces/chat/${spaceId}/${chatId}`, "GET")
}

async function addSpaceChatMessage(spaceId, chatId, messageData) {
    return await this.sendRequest(`/spaces/chat/${spaceId}/${chatId}`, "POST", messageData)
}

async function resetSpaceChat(spaceId, chatId) {
    return await this.sendRequest(`/spaces/chat/${spaceId}/${chatId}`, "DELETE")
}

async function saveSpaceChat(spaceId, chatId) {
    return await this.sendRequest(`/spaces/chat/save/${spaceId}/${chatId}`, "POST")
}

async function getSpaceAnnouncements(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}/announcements`, "GET")
}

async function deleteSpaceAnnouncement(spaceId, announcementId) {
    return await this.sendRequest(`/spaces/${spaceId}/announcements/${announcementId}`, "DELETE")
}

async function updateSpaceAnnouncement(spaceId, announcementId, announcementData) {
    return await this.sendRequest(`/spaces/${spaceId}/announcements/${announcementId}`, "PUT", announcementData)
}

async function createSpace(spaceName) {
    const bodyObject = {
        spaceName: spaceName
    }
    return await this.sendRequest(`/spaces`, "POST", bodyObject);
}

/* webChat config */

/* themes */
async function addWebAssistantTheme(spaceId, themeData) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/themes`, "POST", themeData);
}

async function updateWebAssistantTheme(spaceId, id, themeData) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/themes/${id}`, "PUT", themeData);
}

async function getWebAssistantThemes(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/themes`, "GET");
}
async function getWebAssistantTheme(spaceId, themeId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/themes/${themeId}`, "GET");
}

async function getWebAssistantHomePage(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/home-page`, "GET");
}

async function getWebAssistantConfiguration(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration`, "GET");
}

async function addWebAssistantConfigurationPage(spaceId, pageData) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages`, "POST", pageData);
}

async function updateWebAssistantConfigurationSettings(spaceId, settingsData) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/settings`, "PUT", settingsData);
}

async function getWebAssistantConfigurationPages(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages`, "GET");
}

async function getWebAssistantConfigurationPage(spaceId, pageId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages/${pageId}`, "GET");
}

async function updateWebAssistantConfigurationPage(spaceId, pageId, pageData) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages/${pageId}`, "PUT", pageData);
}

async function deleteWebAssistantConfigurationPage(spaceId, pageId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages/${pageId}`, "DELETE");
}

async function getWebAssistantConfigurationPageMenu(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/menu`, "GET");
}

async function addWebAssistantConfigurationPageMenuItem(spaceId, pageId, menuItem) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages/${pageId}/menu`, "POST", menuItem);
}

async function getWebAssistantConfigurationPageMenuItem(spaceId, menuId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/menu/${menuId}`, "GET");
}

async function updateWebAssistantConfigurationPageMenuItem(spaceId, pageId, menuId, menuItemData) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages/${pageId}/menu/${menuId}`, "PUT", menuItemData);
}

async function deleteWebAssistantConfigurationPageMenuItem(spaceId, pageId, menuId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/configuration/pages/${pageId}/menu/${menuId}`, "DELETE");
}

/* webChat config end */

async function loadSpace(spaceId) {
    let requestURL = spaceId ? `/spaces/${spaceId}` : `/spaces`;
    return await this.sendRequest(requestURL, "GET");
}

async function storeSpace(spaceId, jsonData = null, apiKey = null, userId = null) {
    let headers = {
        "Content-type": "application/json; charset=UTF-8",
        Cookie: this.__securityContext.cookies
    };
    if (apiKey) {
        headers["apikey"] = `${apiKey}`;
        headers["initiatorid"] = `${userId}`;
    }

    let options = {
        method: "PUT",
        headers: headers,
        body: jsonData
    };
    let response = await fetch(`/spaces/${spaceId}`, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${response.message}`);
    }

    return await response.text();
}

async function deleteSpace(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}`, "DELETE");
}

async function addKeyToSpace(spaceId, userId, keyType, apiKey) {
    let result;
    let headers = {
        "Content-type": "application/json; charset=UTF-8",
        Cookie: this.__securityContext.cookies
    };
    if (apiKey) {
        headers["apikey"] = `${apiKey}`;
        headers["initiatorid"] = `${userId}`;
    }
    try {
        result = await fetch(`/spaces/${spaceId}/secrets`,
            {
                method: "POST",
                headers: headers
            });
    } catch (err) {
        console.error(err);
    }
    return await result.text();
}

async function getAPIKeysMetadata(spaceId) {
    return await this.sendRequest(`/spaces/${spaceId}/secrets/keys`, "GET");
}

async function getSpaceCollaborators(spaceId) {
    return await this.sendRequest(`/spaces/collaborators/${spaceId}`, "GET");
}

async function deleteSpaceCollaborator(spaceId, userId) {
    return await this.sendRequest(`/spaces/collaborators/${spaceId}/${userId}`, "DELETE");
}

async function inviteSpaceCollaborators(spaceId, collaborators) {
    return await this.sendRequest(`/spaces/collaborators/${spaceId}`, "POST", {collaborators});
}

async function setSpaceCollaboratorRole(spaceId, userId, role) {
    return await this.sendRequest(`/spaces/collaborators/${spaceId}/${userId}`, "PUT", {role});
}

async function importPersonality(spaceId, personalityFormData) {
    return await this.sendRequest(`/spaces/${spaceId}/import/personalities`, "POST", personalityFormData);
}

async function sendGeneralRequest(url, method, data = null, headers = {}, externalRequest = false) {
    let response;
    if (envType === constants.ENV_TYPE.NODE && !externalRequest) {
        headers.Cookie = this.__securityContext.cookies;
        url = `${constants[constants.ENVIRONMENT_MODE]}${url}`;
    }
    try {
        response = await fetch(url, {
            method: method,
            headers: headers,
            body: data || undefined
        });
    } catch (err) {
        throw new Error(err.message);
    }
    if (!response.ok) {
        throw new Error(`Failed to fetch:${response.status} ${response.statusText}`);
    }
    switch (response.headers.get("Content-Type")) {
        case "application/json":
            return (await response.json()).data;
        case "application/octet-stream":
        case "audio/mp3":
        case "video/mp4":
        case "image/png":
            return await response.arrayBuffer();
        case "text/plain":
        default :
            return await response.text();
    }
}

async function getImageURL(imageId) {
    return await this.getFileURL(imageId, "image/png");
}

async function getAudioURL(audioId) {
    return await this.getFileURL(audioId, "audio/mp3");
}

async function getVideoURL(videoId) {
    return await this.getFileURL(videoId, "video/mp4");
}

async function getFileURL(fileId, type) {
    const {downloadURL} = await this.sendGeneralRequest(`/spaces/downloads/${fileId}`, "GET", null, {"Content-Type": type});
    return downloadURL;
}

async function getAudioHead(audioId) {
    return await this.headFile(audioId, "audio/mp3");
}

async function getImageHead(imageId) {
    return await this.headFile(imageId, "image/png");
}

async function getVideoHead(videoId) {
    return await this.headFile(videoId, "video/mp4");
}

async function headFile(fileId, type) {
    return await this.sendGeneralRequest(`/spaces/files/${fileId}`, "HEAD", null, {"Content-Type": type});
}

async function getAudio(audioId) {
    return await this.getFile(audioId, "audio/mp3");
}

async function getImage(imageId) {
    return await this.getFile(imageId, "image/png");
}

async function getVideo(videoId, range) {
    return await this.getFile(videoId, "video/mp4", range);
}

async function getFile(fileId, type, range) {
    const {
        downloadURL,
        externalRequest
    } = await this.sendGeneralRequest(`/spaces/downloads/${fileId}`, "GET", null, {"Content-Type": type});
    let headers = {};
    if (range) {
        headers.Range = range;
    }
    return await this.sendGeneralRequest(downloadURL, "GET", null, headers, externalRequest);
}

async function putAudio(audio) {
    return await this.putFile(audio, "audio/mp3");
}

async function putImage(image) {
    return await this.putFile(image, "image/png");
}

async function putVideo(video) {
    return await this.putFile(video, "video/mp4");
}

async function putFile(file, type) {
    const {
        uploadURL,
        fileId,
        externalRequest
    } = await this.sendGeneralRequest(`/spaces/uploads`, "GET", null, {"Content-Type": type});
    await this.sendGeneralRequest(uploadURL, "PUT", file, {
        "Content-Type": type,
        "Content-Length": file.byteLength
    }, externalRequest);
    return fileId;
}

async function deleteImage(imageId) {
    return await this.deleteFile(imageId, "image/png");
}

async function deleteAudio(audioId) {
    return await this.deleteFile(audioId, "audio/mp3");
}

async function deleteVideo(videoId) {
    return await this.deleteFile(videoId, "video/mp4");
}

async function deleteFile(fileId, type) {
    return await this.sendGeneralRequest(`/spaces/files/${fileId}`, "DELETE", null, {"Content-Type": type});
}

async function addContainerObject(spaceId, objectType, objectData) {
    return await this.sendGeneralRequest(`/spaces/containerObject/${spaceId}/${objectType}`, "POST", objectData);
}

async function getContainerObject(spaceId, objectId) {
    return await this.sendGeneralRequest(`/spaces/containerObject/${spaceId}/${objectId}`, "GET");
}

async function updateContainerObject(spaceId, objectId, objectData) {
    return await this.sendGeneralRequest(`/spaces/containerObject/${spaceId}/${objectId}`, "PUT", objectData);
}

async function deleteContainerObject(spaceId, objectId) {
    return await this.sendGeneralRequest(`/spaces/containerObject/${spaceId}/${objectId}`, "DELETE");
}

/*embedded objects*/
async function getEmbeddedObject(spaceId, objectURI) {
    return await this.sendGeneralRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "GET");
}

async function addEmbeddedObject(spaceId, objectURI, objectData) {
    return await this.sendGeneralRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "POST", objectData);
}

async function updateEmbeddedObject(spaceId, objectURI, objectData) {
    return await this.sendGeneralRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "PUT", objectData);
}

async function deleteEmbeddedObject(spaceId, objectURI) {
    return await this.sendGeneralRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "DELETE");
}

async function swapEmbeddedObjects(spaceId, objectURI, objectData) {
    return await this.sendGeneralRequest(`/spaces/embeddedObject/swap/${spaceId}/${objectURI}`, "PUT", objectData);
}

async function startTelegramBot(spaceId, personalityId, botId) {
    return await this.sendGeneralRequest(`/telegram/startBot/${spaceId}/${personalityId}`, "POST", botId);
}

async function removeTelegramUser(spaceId, personalityId, telegramUserId) {
    return await this.sendGeneralRequest(`/telegram/auth/${spaceId}/${personalityId}`, "PUT", telegramUserId);
}

async function deleteWebAssistantTheme(spaceId, themeId) {
    return await this.sendRequest(`/spaces/${spaceId}/web-assistant/themes/${themeId}`, "DELETE");
}

module.exports = {
    deleteWebAssistantTheme,
    getWebAssistantThemes,
    addWebAssistantTheme,
    updateWebAssistantTheme,
    getWebAssistantTheme,
    getWebAssistantHomePage,
    updateWebAssistantConfigurationSettings,
    getWebAssistantConfigurationPageMenuItem,
    addWebAssistantConfigurationPage,
    getWebAssistantConfigurationPages,
    getWebAssistantConfigurationPage,
    updateWebAssistantConfigurationPage,
    deleteWebAssistantConfigurationPage,
    getWebAssistantConfigurationPageMenu,
    addWebAssistantConfigurationPageMenuItem,
    updateWebAssistantConfigurationPageMenuItem,
    deleteWebAssistantConfigurationPageMenuItem,
    createSpace,
    loadSpace,
    deleteSpace,
    storeSpace,
    addKeyToSpace,
    addSpaceChatMessage,
    addSpaceAnnouncement,
    getSpaceAnnouncement,
    getSpaceAnnouncements,
    updateSpaceAnnouncement,
    deleteSpaceAnnouncement,
    inviteSpaceCollaborators,
    sendRequest,
    getAPIKeysMetadata,
    putImage,
    deleteImage,
    Space,
    Announcement,
    putAudio,
    getAudio,
    deleteAudio,
    importPersonality,
    deleteVideo,
    putVideo,
    getVideo,
    getSpaceChat,
    getAudioHead,
    getImageHead,
    getImage,
    getVideoHead,
    getAudioURL,
    getVideoURL,
    getImageURL,
    sendGeneralRequest,
    getSpaceCollaborators,
    setSpaceCollaboratorRole,
    deleteSpaceCollaborator,
    saveSpaceChat,
    resetSpaceChat,
    putFile,
    headFile,
    deleteFile,
    getFile,
    getFileURL,
    getContainerObject,
    addContainerObject,
    updateContainerObject,
    deleteContainerObject,
    getEmbeddedObject,
    addEmbeddedObject,
    updateEmbeddedObject,
    deleteEmbeddedObject,
    swapEmbeddedObjects,
    startTelegramBot,
    removeTelegramUser,
    getWebAssistantConfiguration
}



