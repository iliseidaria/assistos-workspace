const {request} = require("../util");

async function sendRequest(url, method, data) {
    return await request(url, method, this.__securityContext, data);
}
async function getGalleriesMetadata(spaceId) {
    return await this.sendRequest(`/spaces/containerObject/meta/${spaceId}/galleries`, "GET");
}

async function getGallery(spaceId, galleryId) {
    return await this.sendRequest(`/spaces/containerObject/${spaceId}/${galleryId}`, "GET");
}

async function addGallery(spaceId, galleryData) {
    galleryData.metadata = ["id", "config"];
    return await this.sendRequest(`/spaces/containerObject/${spaceId}/galleries`, "POST", galleryData);
}

async function deleteGallery(spaceId, galleryId) {
    return await this.sendRequest(`/spaces/containerObject/${spaceId}/${galleryId}`, "DELETE");
}
async function getImage(spaceId, galleryId, imageId){
    let objectURI = encodeURIComponent(`${galleryId}/${imageId}`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "GET");
}
async function getGalleryConfig(spaceId, galleryId){
    let objectURI = encodeURIComponent(`${galleryId}/config`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "GET");
}
async function getGalleryOpenAIHistory(spaceId, galleryId){
    let objectURI = encodeURIComponent(`${galleryId}/openAIHistory`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "GET");
}
async function getGalleryMidjourneyHistory(spaceId, galleryId){
    let objectURI = encodeURIComponent(`${galleryId}/midjourneyHistory`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "GET");
}
async function updateGalleryConfig(spaceId, galleryId, configData){
    let objectURI = encodeURIComponent(`${galleryId}/config`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "PUT", configData);
}
async function updateOpenAIHistoryImages(spaceId, galleryId, imagesData){
    let objectURI = encodeURIComponent(`${galleryId}/openAIHistory`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "PUT", imagesData);
}
async function addOpenAIHistoryImages(spaceId, galleryId, imagesData){
    let objectURI = encodeURIComponent(`${galleryId}/openAIHistory`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "POST", imagesData);
}
async function updateOpenAIHistoryImage(spaceId, galleryId, imageId, imageData){
    let objectURI = encodeURIComponent(`${galleryId}/${imageId}`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "PUT", imageData);
}
async function getMidjourneyHistoryImage(spaceId, galleryId, imageId){
    let objectURI = encodeURIComponent(`${galleryId}/${imageId}`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "GET");
}
async function addMidjourneyHistoryImage(spaceId, galleryId, imageData){
    let objectURI = encodeURIComponent(`${galleryId}/midjourneyHistory`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "POST", imageData);
}
async function updateMidjourneyHistoryImage(spaceId, galleryId, imageId, imageData){
    let objectURI = encodeURIComponent(`${galleryId}/${imageId}`);
    imageData.id = imageId;
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "PUT", imageData);
}
async function deleteMidjourneyHistoryImage(spaceId, galleryId, imageId){
    let objectURI = encodeURIComponent(`${galleryId}/${imageId}`);
    return await this.sendRequest(`/spaces/embeddedObject/${spaceId}/${objectURI}`, "DELETE");
}
module.exports = {
    sendRequest,
    getGalleriesMetadata,
    getGallery,
    addGallery,
    deleteGallery,
    getImage,
    getGalleryConfig,
    getGalleryOpenAIHistory,
    getGalleryMidjourneyHistory,
    updateGalleryConfig,
    updateOpenAIHistoryImages,
    addMidjourneyHistoryImage,
    updateMidjourneyHistoryImage,
    getMidjourneyHistoryImage,
    deleteMidjourneyHistoryImage,
    updateOpenAIHistoryImage,
    addOpenAIHistoryImages
}