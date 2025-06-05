const Application = require("./models/Application.js");
const request = require("../util").request;

async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}
async function getWidgets(spaceId) {
    return await this.sendRequest(`/space/${spaceId}/applications/widgets`, "GET");
}
async function installApplication(spaceId, applicationId) {
    return await this.sendRequest(`/applications/${spaceId}/${applicationId}`, "POST");
}

async function uninstallApplication(spaceId, applicationId) {
    return await this.sendRequest(`/applications/${spaceId}/${applicationId}`, "DELETE");
}

async function getApplicationConfig(spaceId, applicationId) {
    return await this.sendRequest(`/applications/config/${spaceId}/${applicationId}`, "GET");
}

async function loadApplicationsMetadata(spaceId) {
    return await this.sendRequest(`/applications/metadata/${spaceId}`, "GET");
}
async function runApplicationTask(spaceId, applicationId, taskName, taskData) {
      return await this.sendRequest(`/applications/tasks/${spaceId}/${applicationId}/${taskName}`, "POST", taskData);
}
async function runApplicationFlow(spaceId, applicationId, flowId, flowData) {
        return await this.sendRequest(`/applications/flows/${spaceId}/${applicationId}/${flowId}`, "POST", flowData);
}
async function updateApplication(spaceId, applicationId) {
    return await this.sendRequest(`/applications/updates/${spaceId}/${applicationId}`, "PUT");
}
async function requiresUpdate(spaceId, applicationId) {
    return await this.sendRequest(`/applications/updates/${spaceId}/${applicationId}`, "GET");
}
async function getApplicationFile(spaceId, applicationId, relativeAppFilePath) {
    const pathSegments = relativeAppFilePath.split('/').map(segment => encodeURIComponent(segment));
    const encodedPath = pathSegments.join('/');
    const pathParts = relativeAppFilePath.split(".");
    const type = pathParts[pathParts.length - 1].toLowerCase(); // Normalize file extension
    if (type !== "js") {
        let response = await fetch(`/applications/files/${spaceId}/${applicationId}/${encodedPath}`, {
            method: "GET",
            credentials: 'include'
        });
        return await response.text();
    } else {
        return await import(`/applications/files/${spaceId}/${applicationId}/${encodedPath}`);
    }
}
async function getApplicationTasks(spaceId, applicationId) {
    return await this.sendRequest(`/applications/tasks/${spaceId}/${applicationId}`, "GET");
}
async function getApplicationsPlugins(spaceId) {
    return await this.sendRequest(`/applications/plugins/${spaceId}`, "GET");
}
/*
async function storeAppObject(appName, objectType, objectId, stringData) {
    return await this.sendRequest(`/app/${assistOS.space.id}/applications/${appName}/${objectType}/${objectId}`, "PUT", stringData);
}
async function loadAppObjects(appName, objectType) {
    return await this.sendRequest(`/app/${assistOS.space.id}/applications/${appName}/${objectType}`, "GET");
}
*/
/*
async function loadAppFlows(spaceId, appId) {
    return import(`/app/${spaceId}/applications/${appId}`);
}*/


module.exports = {
    installApplication,
    getWidgets,
    uninstallApplication,
    loadApplicationsMetadata,
    getApplicationConfig,
    getApplicationFile,
    sendRequest,
    runApplicationTask,
    runApplicationFlow,
    updateApplication,
    requiresUpdate,
    getApplicationTasks,
    getApplicationsPlugins,
    Application
};
