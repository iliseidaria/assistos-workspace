const request = require("../util").request;
const envType = require("assistos").envType;
const Document = require("./models/Document");
const constants = require("../../constants");

async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}

async function exportDocument(spaceId, documentId, exportType) {
    return await this.sendRequest(`/documents/export/${spaceId}/${documentId}`, "POST", {exportType});
}

async function exportDocumentAsDocx(spaceId, documentId) {
    return await this.sendRequest(`/documents/export/docx/${spaceId}/${documentId}`, "POST");
}

async function importDocument(spaceId, documentFormData) {
    return await this.sendRequest(`/documents/import/${spaceId}`, "POST", documentFormData);
}

async function getDocument(spaceId, documentId) {
    let documentData = await this.sendRequest(`/documents/${spaceId}/${documentId}`, "GET");
    return new Document(documentData);
}

async function getDocumentsMetadata(spaceId) {
    return await this.sendRequest(`/documents/metadata/${spaceId}`, "GET");
}

async function addDocument(spaceId, documentData) {
    documentData.metadata = ["id", "title", "type"];
    return await this.sendRequest(`/documents/${spaceId}`, "POST", documentData);
}

async function convertDocument(formData) {
    try {
        const init = {
            method: 'POST',
            body: formData
        };

        // Use server proxy endpoint instead of direct docs converter URL
        let url = '/documents/convert';

        if (envType === constants.ENV_TYPE.NODE) {
            url = `${constants[constants.ENVIRONMENT_MODE]}${url}`;
            init.headers = { Cookie: this.__securityContext.cookies };
        }
        
        const response = await fetch(url, init);

        if (!response.ok) {
            const errorText = await response.text();
            let errorDetails = errorText;
            try {
                errorDetails = JSON.parse(errorText);
            } catch (e) {
                // Not JSON, keep as text
            }
            
            throw new Error(`HTTP error! status: ${response.status}, details: ${typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : errorDetails}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}


async function uploadDoc(spaceId, docData) {
    return await this.sendRequest(`/documents/upload/${spaceId}`, "PUT", docData);
}

async function updateDocument(spaceId, documentId, documentData) {
    return await this.sendRequest(`/documents/${spaceId}/${documentId}`, "PUT", documentData);
}

async function deleteDocument(spaceId, documentId) {
    return await this.sendRequest(`/documents/${spaceId}/${documentId}`, "DELETE");
}

async function updateDocumentTitle(spaceId, documentId, title) {
    return await this.sendRequest(`/documents/${spaceId}/${documentId}?fields=title`, "PUT", title);
}

async function updateDocumentComment(spaceId, documentId, comment) {
    return await this.sendRequest(`/documents/${spaceId}/${documentId}?fields=comment`, "PUT", comment);
}

async function updateDocumentTopic(spaceId, documentId, topic) {
    return await this.sendRequest(`/documents/${spaceId}/${documentId}?fields=topic`, "PUT", topic);
}

async function updateDocumentAbstract(spaceId, documentId, abstract) {
    return await this.sendRequest(`/documents/${spaceId}/${documentId}?fields=abstract`, "PUT", abstract);
}

async function getDocumentTopic(spaceId, documentId) {
    return await this.sendRequest(`documents/${spaceId}/${documentId}?fields=topic`, "GET");
}

async function getDocumentAbstract(spaceId, documentId) {
    return await this.sendRequest(`/documents/${spaceId}/${documentId}?fields=abstract`, "GET");
}

async function getDocumentTitle(spaceId, documentId) {
    return await this.sendRequest(`documents/${spaceId}/${documentId}?fields=title`, "GET");
}

async function estimateDocumentVideoLength(spaceId, documentId) {
    return await this.sendRequest(`/documents/video/estimate/${spaceId}/${documentId}`, "GET");
}

async function documentToVideo(spaceId, documentId) {
    return await this.sendRequest(`/tasks/video/${spaceId}/${documentId}`, "POST", {});
}

async function getDocumentTasks(spaceId, documentId) {
    return await this.sendRequest(`/tasks/${spaceId}/${documentId}`, "GET");
}

async function deselectDocumentItem(spaceId, documentId, itemId, selectId) {
    return await this.sendRequest(`/documents/select/${spaceId}/${documentId}/${itemId}/${selectId}`, "DELETE");
}

async function getSelectedDocumentItems(spaceId, documentId) {
    return await this.sendRequest(`/documents/select/${spaceId}/${documentId}`, "GET");
}

async function selectDocumentItem(spaceId, documentId, itemId, itemData) {
    return await this.sendRequest(`/documents/select/${spaceId}/${documentId}/${itemId}`, "PUT", itemData);
}

async function getDocumentCommands(spaceId, documentId) {
    return await this.sendRequest(`documents/${spaceId}/${documentId}?fields=commands`, "GET");
}

async function updateDocumentCommands(spaceId, documentId, commands) {
    return await this.sendRequest(`documents/${spaceId}/${documentId}?fields=commands`, "PUT", commands);
}

async function translateDocument(spaceId, documentId, language, personalityId) {
    return await this.sendRequest(`/tasks/translate/${spaceId}/${documentId}`, "POST", {language, personalityId});
}

async function undoOperation(spaceId, documentId) {
    return await this.sendRequest(`/documents/undo/${spaceId}/${documentId}`, "PUT");
}

async function redoOperation(spaceId, documentId) {
    return await this.sendRequest(`/documents/redo/${spaceId}/${documentId}`, "PUT");
}

async function getDocumentSnapshot(spaceId, documentId, snapshotId) {
    return await this.sendRequest(`documents/snapshots/${spaceId}/${documentId}/${snapshotId}`, "GET");
}

async function getDocumentSnapshots(spaceId, documentId) {
    return await this.sendRequest(`documents/snapshots/${spaceId}/${documentId}`, "GET");
}

async function addDocumentSnapshot(spaceId, documentId, snapshotData) {
    return await this.sendRequest(`documents/snapshots/${spaceId}/${documentId}`, "POST", snapshotData);
}

async function deleteDocumentSnapshot(spaceId, documentId, snapshotId) {
    return await this.sendRequest(`documents/snapshots/${spaceId}/${documentId}/${snapshotId}`, "DELETE");
}

async function restoreDocumentSnapshot(spaceId, documentId, snapshotId, newSnapshotData) {
    return await this.sendRequest(`documents/snapshots/${spaceId}/${documentId}/${snapshotId}`, "PUT", newSnapshotData);
}

module.exports = {
    getDocumentTopic,
    getDocumentTitle,
    getDocumentAbstract,
    getDocumentsMetadata,
    getDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    updateDocumentTitle,
    updateDocumentTopic,
    updateDocumentAbstract,
    sendRequest,
    documentToVideo,
    estimateDocumentVideoLength,
    getDocumentTasks,
    exportDocument,
    importDocument,
    updateDocumentComment,
    deselectDocumentItem,
    getSelectedDocumentItems,
    selectDocumentItem,
    getDocumentCommands,
    updateDocumentCommands,
    exportDocumentAsDocx,
    translateDocument,
    undoOperation,
    redoOperation,
    getDocumentSnapshot,
    getDocumentSnapshots,
    addDocumentSnapshot,
    deleteDocumentSnapshot,
    restoreDocumentSnapshot,
    convertDocument,
    uploadDoc
};
