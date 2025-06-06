const utilModule = require('assistos').loadModule('util', {});

class NotificationRouter{
    constructor() {
        this.objectsToRefresh = [];
        this.listeners = {};
        this.refreshDelay = 2000;
        this.startGarbageCollector();
    }
    on(objectId, presenterFN) {
        if (!this.listeners[objectId]) {
            this.listeners[objectId] = [];
        }
        this.listeners[objectId].push(new WeakRef(presenterFN));
    }
    getEventSource() {
        return this.eventSource;
    }
    startGarbageCollector() {
        this.garbageInterval = setInterval(async () => {
            for (const objectId in this.listeners) {
                const weakRefs = this.listeners[objectId];
                const stillReferenced = weakRefs.filter(weakRef => weakRef.deref());

                // If there are no active references, unsubscribe from the server
                if (stillReferenced.length === 0) {
                    await this.unsubscribeFromObject(objectId);
                    delete this.listeners[objectId];
                }
            }
        }, 60000 * 5); // 5 minutes
    }

    emit(objectId, data) {
        if(!this.listeners[objectId]){
            // no one is subscribed to this object
            return;
        }
        const eventListeners = this.listeners[objectId];
        this.listeners[objectId] = eventListeners.filter(weakRef => {
            const presenterFN = weakRef.deref();
            if (presenterFN) {
                presenterFN(data);
                return true;
            }
            return false;
        });
    }
    hasSubscription(objectId){
        return Object.keys(this.listeners).some(id => id.startsWith(objectId) && this.listeners[id].length > 0);
    }

    createSSEConnection() {
        if(this.eventSource){
            return;
        }
        this.eventSource = new EventSource("/events", {withCredentials: true});
        this.intervalId = setInterval(this.startRefreshInterval.bind(this), this.refreshDelay);
        this.eventSource.addEventListener('content', this.handleContentEvent.bind(this));
        this.eventSource.addEventListener('disconnect', this.handleDisconnectEvent.bind(this));
        this.eventSource.addEventListener('error', this.handleErrorEvent.bind(this));
        console.log("SSE Connection created");
    }
    startRefreshInterval(){
        for (let object of this.objectsToRefresh) {
            this.emit(object.objectId, object.data);
        }
        this.objectsToRefresh = [];
    }
    async closeSSEConnection() {
        clearInterval(this.intervalId);
        clearInterval(this.garbageInterval)
        await utilModule.request("/events/close", "GET");
        console.log("SSE Connection closed");
    }

    handleContentEvent(event) {
        let parsedMessage = JSON.parse(event.data);
        this.objectsToRefresh.push({objectId: parsedMessage.objectId, data: parsedMessage.data});
    }

    async handleDisconnectEvent(event,callback) {
        let disconnectReason = JSON.parse(event.data);
        clearInterval(this.intervalId);
        clearInterval(this.garbageInterval);
        this.eventSource.close();
        await callback(disconnectReason);
    }

    handleErrorEvent(err) {
        this.eventSource.close();
        clearInterval(this.intervalId);
        clearInterval(this.garbageInterval);
        console.error('EventSource failed:', err);
    }

    async unsubscribeFromObject(objectId) {
        let encodedObjectId = encodeURIComponent(objectId);
        await utilModule.request(`/events/unsubscribe/${encodedObjectId}`, "GET");
    }

    getObjectId(prefix, suffix) {
        return `${prefix}/${suffix}`;
    }
    async subscribeToDocument(documentId, suffix, presenterFN) {
        if(this.hasSubscription(documentId)){
            this.on(this.getObjectId(documentId, suffix), presenterFN);
            return;
        }
        let encodedObjectId = encodeURIComponent(documentId);
        await utilModule.request(`/events/subscribe/${encodedObjectId}`, "GET");
        this.on(this.getObjectId(documentId, suffix), presenterFN);
    }

    async subscribeToSpace(spaceId, suffix, presenterFN) {
        if(this.hasSubscription(spaceId)){
            this.on(this.getObjectId(spaceId, suffix), presenterFN);
            return;
        }
        let encodedObjectId = encodeURIComponent(spaceId);
        await utilModule.request(`/events/subscribe/${encodedObjectId}`, "GET");
        this.on(this.getObjectId(spaceId, suffix), presenterFN);
    }
}
module.exports= NotificationRouter;
