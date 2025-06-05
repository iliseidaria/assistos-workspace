import {createTemplateArray, findDoubleDollarWords} from "./utils/template-utils.js";
import {showModal,createReactiveModal} from "./utils/modal-utils.js";
import {ResourceManager} from "./managers/ResourceManager.js";
import {sanitize} from "./utils/dom-utils.js";

class WebSkel {
    constructor() {
        this._appContent = {};
        this.appServices = {};
        this._documentElement = document;
        this.actionRegistry = {};
        this.registerListeners();
        this.ResourceManager = new ResourceManager();
        this.defaultLoader = document.createElement("dialog");
        this.loaderCount = 0;
        this.defaultLoader.classList.add("spinner");
        this.defaultLoader.classList.add("spinner-default-style");
        window.showApplicationError = async (title, message, technical) => {
            return await showModal("show-error-modal", {
                title: title,
                message: message,
                technical: technical
            });
        }
        console.log("creating new app manager instance");
    }

    static async initialise(configsPath) {
        if (WebSkel.instance) {
            return WebSkel.instance;
        }
        let webSkel = new WebSkel();
        const utilModules = [
            './utils/dom-utils.js',
            './utils/form-utils.js',
            './utils/modal-utils.js',
            './utils/template-utils.js',
            './utils/browser-utils.js'
        ];
        for (const path of utilModules) {
            const moduleExports = await import(path);
            for (const [fnName, fn] of Object.entries(moduleExports)) {
                webSkel[fnName] = fn;
            }
        }
        await webSkel.loadConfigs(configsPath);
        WebSkel.instance = webSkel;
        return WebSkel.instance;
    }
    async createReactiveModal(modalComponentName, componentProps, waitForData = false) {
        retur
    }
    async loadConfigs(jsonPath) {
        try {
            const response = await fetch(jsonPath);
            const config = await response.json();
            this.configs = config;
            for (const service of config.services) {
                const ServiceModule = await import(service.path);
                this.initialiseService(ServiceModule[service.name]);
            }
            for (const component of config.components) {
                await this.defineComponent(component);
            }
        } catch (error) {
            console.error(error);
            await showApplicationError("Error loading configs", "Error loading configs", `Encountered ${error} while trying loading webSkel configs`);
        }
    }


    initialiseService(instance) {
        let service = new instance;
        const methodNames = Object.getOwnPropertyNames(instance.prototype)
            .filter(method => method !== 'constructor');
        methodNames.forEach(methodName => {
            this.appServices[methodName] = service[methodName].bind(service);
        });
    }

    showLoading() {
        function generateRandomId(length) {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let randomId = '';
            for (let i = 0; i < length; i++) {
                randomId += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return randomId;
        }

        let loader = this.defaultLoader.cloneNode(true);
        let id = generateRandomId(12);
        loader.setAttribute("data-id", id)
        if (this.loaderCount === 0) {
            document.body.appendChild(loader);
            loader.showModal();
        } else {
            this.loaderCount++;
        }
        return id;
    }

    hideLoading(id) {
        if (this.loaderCount > 1) {
            this.loaderCount--;
            return;
        }
        if (id) {
            let loader = document.querySelector(`[data-id = '${id}' ]`);
            if (loader) {
                loader.close();
                loader.remove();
            }
        } else {
            let loaderElements = document.querySelectorAll(".spinner");
            loaderElements.forEach(loader => {
                loader.close();
                loader.remove();
            });
        }
    }

    setLoading(stringHTML) {
        this.defaultLoader.innerHTML = stringHTML;
        this.defaultLoader.classList.remove("spinner-default-style");
    }

    resetLoading() {
        this.defaultLoader = document.createElement("dialog");
        this.defaultLoader.classList.add("spinner");
        this.defaultLoader.classList.add("spinner-default-style");
    }

    async changeToDynamicPage(pageHtmlTagName, url, dataPresenterParams, skipHistoryState) {
        try {
            this.validateTagName(pageHtmlTagName);
        } catch (e) {
            showApplicationError(e, e, e);
            console.error(e);
            return;
        }
        const id = this.showLoading();
        let attributesStringPresenter = '';
        if (dataPresenterParams)
            attributesStringPresenter = Object.entries(dataPresenterParams).map(([key, value]) => `data-${key}="${value}"`).join(' ');
        try {
            const result = `<${pageHtmlTagName} data-presenter="${pageHtmlTagName}" ${attributesStringPresenter}></${pageHtmlTagName}>`;
            if (!skipHistoryState) {
                const path = ["#", url].join("");
                window.history.pushState({pageHtmlTagName, relativeUrlContent: result}, path.toString(), path);
            }
            this.updateAppContent(result);
        } catch (error) {
            console.error("Failed to change page", error);
        } finally {
            this.hideLoading(id);
        }
    }

    validateTagName(tagName) {
        let regex = /^(?![0-9])[a-z0-9]+(?:-*[a-z0-9]+)*-*?$/;
        if (!regex.test(tagName)) {
            throw new Error(`Invalid tag name: ${tagName}`);
        }
        let element = this.configs.components.find((element) => element.name === tagName);
        if (!element) {
            throw new Error(`Element not found in configs: ${tagName}`);
        }
    }

    async changeToStaticPage(pageUrl, skipHistoryState) {
        const loadingId = this.showLoading();
        try {
            const pageContent = await this.fetchTextResult(pageUrl, skipHistoryState);
            this.updateAppContent(pageContent);
        } catch (error) {
            console.log("Failed to change page", error);
        } finally {
            this.hideLoading(loadingId);
        }
    }

    async interceptAppContentLinks(e) {
        let target = e.target || e.srcElement;
        if (target.hasAttribute("data-page")) {
            let pageName = target.getAttribute("data-page");
            e.preventDefault();
            return await this.changeToDynamicPage(pageName);
        }
        if (target.hasAttribute("data-path")) {
            let pageName = target.getAttribute("data-path");
            e.preventDefault();
            return await this.changeToStaticPage(pageName);
        }
    }

    setDomElementForPages(elem) {
        this._appContent = elem;
    }

    updateAppContent(content) {
        try {
            this.preventExternalResources(content);
        } catch (e) {
            showApplicationError(e, e, e);
            console.error(e);
            return;
        }
        this._appContent.innerHTML = content;
    }

    preventExternalResources(content) {
        let regex = /(src|href|action|onclick)\s*=\s*"[^"]*"/g;
        let matches = content.match(regex);
        if (matches) {
            for (let match of matches) {
                let url = match.split('"')[1];
                let linkDomain = (new URL(url)).host;
                if (window.location.host !== linkDomain) {
                    throw new Error(`External resource detected: ${url}`);
                }
            }
        }
    }

    registerListeners() {
        this._documentElement.addEventListener("click", this.interceptAppContentLinks.bind(this));
        window.onpopstate = (e) => {
            if (e.state && e.state.relativeUrlContent) {
                this.updateAppContent(e.state.relativeUrlContent);
            }
        };

        this._documentElement.addEventListener("click", async (event) => {
            let target = event.target;
            let stopPropagation = false;
            while (target && target !== this._documentElement && !stopPropagation) {
                if (target.hasAttribute("data-local-action")) {
                    event.preventDefault();
                    event.stopPropagation();
                    stopPropagation = true;
                    let currentCustomElement = target;
                    let actionHandled = false;
                    const action = target.getAttribute("data-local-action");
                    const [actionName, ...actionParams] = action.split(" ");
                    while (actionHandled === false) {
                        let presenterFound = false;
                        let p;
                        while (presenterFound === false) {
                            if (currentCustomElement.webSkelPresenter) {
                                presenterFound = true;
                                p = currentCustomElement.webSkelPresenter;
                                break;
                            }
                            currentCustomElement = currentCustomElement.parentElement;
                            if (currentCustomElement === document) {
                                await showApplicationError("Error executing action", "Action not found in any Presenter", "Action not found in any Presenter");
                                return;
                            }
                        }
                        if (p[actionName] !== undefined) {
                            try {
                                currentCustomElement.webSkelPresenter[actionName](target, ...actionParams);
                                actionHandled = true;
                            } catch (error) {
                                console.error(error);
                                await showApplicationError("Error executing action", "There is no action for the button to execute", `Encountered ${error}`);
                                return;
                            }
                        } else {
                            presenterFound = false;
                            currentCustomElement = currentCustomElement.parentElement;
                        }
                    }
                } else {
                    if (target.hasAttribute("data-action")) {
                        event.preventDefault(); // Cancel the native event
                        event.stopPropagation(); // Don't bubble/capture the event any further
                        stopPropagation = true;
                        const action = target.getAttribute("data-action");
                        const [actionName, ...actionParams] = action.split(" ");
                        if (actionName) {
                            this.callAction(actionName, target, ...actionParams);
                        } else {
                            console.error(`${target} : data action attribute value should not be empty!`);
                        }
                        break;
                    }

                }
                target = target.parentElement;
            }
        });
    }

    registerAction(actionName, actionHandler) {
        this.actionRegistry[actionName] = actionHandler;
    }

    callAction(actionName, ...params) {
        const actionHandler = this.actionRegistry[actionName];
        if (!actionHandler) {
            throw new Error(`No action handler registered for "${actionName}"`);
        }
        let thisCall = params && params[0] instanceof HTMLElement ? params[0] : null;
        actionHandler.call(thisCall, ...params);
    }

    async fetchTextResult(relativeUrlPath, skipHistoryState) {
        const appBaseUrl = new URL(`${window.location.protocol}//${window.location.host}`);
        if (relativeUrlPath.startsWith("#")) {
            relativeUrlPath = relativeUrlPath.slice(1);
        }
        console.log("Fetching Data from URL: ", appBaseUrl + relativeUrlPath);
        const response = await fetch(appBaseUrl + relativeUrlPath);
        if (!response.ok) {
            throw new Error("Failed to execute request");
        }
        const result = await response.text();
        if (!skipHistoryState) {
            const path = appBaseUrl + "#" + relativeUrlPath;
            window.history.pushState({relativeUrlPath, relativeUrlContent: result}, path.toString(), path);
        }
        return result;
    }

    /**
     * Creates a custom element with reactive properties.
     * @param {string} elementName - The tag name of the custom element.
     * @param {HTMLElement|string|null} [location=null] - The parent element or a selector where the element will be appended.
     * @param {Object} [attributes={}] - An object containing attributes to set on the element.
     * @param {Object} [props={}] - An object containing initial properties for reactive proxying.
     * @param {boolean} [observeProps=false] - If true, nested objects in props will be observed.
     * @returns {Proxy} A reactive proxy for the element's properties.
     */

    createElement(
        elementName,
        location = null,
        props = {},
        attributes = {},
        observeProps = false,
    ) {
        const element = document.createElement(elementName);
        const { proxy: propsProxy, revoke } = this.createReactiveProxy(props, observeProps, element);
        element.setAttribute('data-presenter', elementName);
        const handler = {
            get(target, prop, receiver) {
                if (prop === 'element') {
                    return new WeakRef(element);
                }
                if (prop in propsProxy) {
                    return Reflect.get(propsProxy, prop, receiver);
                }
                if (prop in element) {
                    const value = element[prop];
                    return typeof value === 'function' ? value.bind(element) : value;
                }
                return Reflect.get(target, prop, receiver);
            },
            set(target, prop, value, receiver) {
                if (prop === 'element') {
                    return false;
                }
                if (prop in propsProxy) {
                    return Reflect.set(propsProxy, prop, value, receiver);
                }
                if (prop in element) {
                    element[prop] = value;
                    return true;
                }
                return Reflect.set(propsProxy, prop, value, receiver);
            },
            has(target, prop) {
                return prop === 'element' || prop in propsProxy || prop in element;
            },
            ownKeys(target) {
                const propsKeys = Reflect.ownKeys(propsProxy);
                const elementKeys = Reflect.ownKeys(element);
                return [...new Set([...propsKeys, ...elementKeys, 'element'])];
            },
            getOwnPropertyDescriptor(target, prop) {
                if (prop === 'element') {
                    return {
                        value: new WeakRef(element),
                        writable: false,
                        enumerable: true,
                        configurable: false
                    };
                }
                if (prop in propsProxy) {
                    return Reflect.getOwnPropertyDescriptor(propsProxy, prop);
                }
                if (prop in element) {
                    return Reflect.getOwnPropertyDescriptor(element, prop);
                }
                return Reflect.getOwnPropertyDescriptor(target, prop);
            }
        };

        const combinedProxy = new Proxy({}, handler);

        element._webSkelProps = {
            raw: props,
            proxy: propsProxy,
            revoke,
            observeProps
        };

        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        if (location instanceof HTMLElement) {
            location?.appendChild(element);
        } else if (typeof location === 'string') {
            document.querySelector(location)?.appendChild(element);
        } else if (location === null) {
            // do not append to DOM, let the caller decide where to insert it
        }

        return combinedProxy;
    }

    /**
     * Creates a reactive proxy for an object that triggers an element invalidation on property changes.
     * @param {Object} target - The target object to wrap in a reactive proxy.
     * @param {boolean} observe - If true, nested objects are also wrapped in reactive proxies.
     * @param {HTMLElement} element - The element whose invalidate method is called on property changes.
     * @returns {{proxy: Proxy, revoke: Function}} An object containing the reactive proxy and a revoke function.
     */
    createReactiveProxy(target, observe, element) {
        const revokers = new Set();

        const handler = {
            set(obj, prop, value) {
                if (observe && typeof value === 'object' && value !== null) {
                    value = this.createReactiveProxy(value, observe, element).proxy;
                }

                const oldValue = obj[prop];
                obj[prop] = value;

                if (!Object.is(oldValue, value)) {
                    element.invalidateProxy?.();
                }
                return true;
            },
            deleteProperty(obj, prop) {
                delete obj[prop];
                element.invalidateProxy?.();
                return true;
            }
        };

        const {proxy, revoke} = Proxy.revocable(target, handler);

        if (observe) {
            for (const key in target) {
                if (typeof target[key] === 'object' && target[key] !== null) {
                    target[key] = this.createReactiveProxy(target[key], observe, element).proxy;
                }
            }
        }

        return {proxy, revoke};
    }


    defineComponent = async (component) => {
        if (!customElements.get(component.name)) {
            customElements.define(
                component.name,
                class extends HTMLElement {
                    constructor() {
                        super();
                        this.variables = {};
                        this.componentName = component.name;
                        this.props = {};
                        this.presenterReadyPromise = new Promise((resolve) => {
                            this.onPresenterReady = resolve;
                        });
                        this.isPresenterReady = false;
                    }

                    invalidateProxy() {
                        if (this.invalidateFn) {
                            this.invalidateFn();
                        }
                    }

                    async connectedCallback() {
                        if (this._webSkelProps) {
                            this.props = this._webSkelProps.proxy;
                        }
                        this.resources = await WebSkel.instance.ResourceManager.loadComponent(component);
                        let vars = findDoubleDollarWords(this.resources.html);
                        vars.forEach((vn) => {
                            vn = vn.slice(2);
                            this.variables[vn] = "";
                        });
                        this.templateArray = createTemplateArray(this.resources.html);
                        let self = this;
                        let presenter = null;

                        for (const attr of self.attributes) {
                            self.variables[attr.nodeName] = sanitize(attr.nodeValue);
                            if (attr.name === "data-presenter") {
                                presenter = attr.nodeValue;
                            }
                        }
                        if (presenter) {
                            const invalidate = async (loadDataAsyncFunction) => {
                                const displayError = (e) => {
                                    self.innerHTML = `Error rendering component: ${self.componentName}\n: ` + e + e.stack.split('\n')[1];
                                    console.error(e);
                                    WebSkel.instance.hideLoading();
                                }
                                const renderPage = async () => {
                                    try {
                                        await self.webSkelPresenter.beforeRender();
                                        for (let vn in self.variables) {
                                            if (typeof self.webSkelPresenter[vn] !== "undefined") {
                                                self.variables[vn] = self.webSkelPresenter[vn];
                                            }
                                        }
                                        self.refresh();
                                        await self.webSkelPresenter.afterRender?.();
                                    } catch (e) {
                                        displayError(e);
                                    }
                                };
                                WebSkel.instance.showLoading();
                                if (loadDataAsyncFunction) {
                                    try {
                                        await loadDataAsyncFunction();
                                    } catch (error) {
                                        return displayError(error);
                                    }
                                }
                                await renderPage();
                                WebSkel.instance.hideLoading();
                            }
                            const invalidateProxy = new Proxy(invalidate, {
                                apply: async function (target, thisArg, argumentsList) {
                                    if (!self.isPresenterReady) {
                                        await self.presenterReadyPromise;
                                    }
                                    return Reflect.apply(target, thisArg, argumentsList);
                                }
                            });
                            self.invalidateFn = invalidateProxy;

                            self.webSkelPresenter = WebSkel.instance.ResourceManager.initialisePresenter(presenter, self, invalidateProxy, this.props);
                        } else {
                            self.refresh();
                        }
                    }

                    async disconnectedCallback() {
                        this._webSkelProps?.revoke();
                        if (this.webSkelPresenter) {
                            if (this.webSkelPresenter.afterUnload) {
                                await this.webSkelPresenter.afterUnload();
                            }
                        }
                        if (this.resources) {
                            if (this.resources.css) {
                                await WebSkel.instance.ResourceManager.unloadStyleSheets(this.componentName);
                            }
                        }
                        // else case where you try to remove a css that has not been loaded yet
                    }

                    refresh() {
                        let stringHTML = "";
                        for (let item of this.templateArray) {
                            item.startsWith("$$") ? stringHTML += this.variables[item.slice(2)] : stringHTML += item;
                        }
                        this.innerHTML = stringHTML;
                    }
                }
            );
        }
    }
}

export default WebSkel;
