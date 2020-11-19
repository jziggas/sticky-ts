export class Sticky {
    /**
     * @constructor
     * @param selector - Selector string to find elements.
     * @param options - Options for the sticky elements (can be overwritten by data-{option}="" attributes).
     */
    constructor(selector = '', options = {}) {
        this.selector = selector;
        this.elements = [];
        this.vp = this.getViewportSize();
        this.body = document.querySelector('body');
        this.firstRender = false;
        this.scrollTop = this.getScrollTopPosition();
        this.options = {
            wrap: options.wrap || false,
            marginTop: options.marginTop || 0,
            marginBottom: options.marginBottom || 0,
            stickyFor: options.stickyFor || 0,
            stickyClass: options.stickyClass || null,
            stickyContainer: options.stickyContainer || 'body',
        };
        window.addEventListener('load', () => {
            this.scrollTop = this.getScrollTopPosition();
        });
        window.addEventListener('scroll', () => {
            this.scrollTop = this.getScrollTopPosition();
        });
        this.run();
    }
    /**
     * Waits for page to be fully loaded, then renders & activates every sticky element found with the specified selector.
     * @function
     */
    run() {
        const pageLoaded = setInterval(() => {
            if (document.readyState === 'interactive' && this.firstRender === false) {
                this.firstRender = true;
                const elements = document.querySelectorAll(this.selector);
                elements.forEach((element) => this.renderElement(element));
                return;
            }
            if (document.readyState === 'complete') {
                clearInterval(pageLoaded);
                this.update();
            }
        }, 10);
    }
    /**
     * Assigns the needed variables for sticky elements, that are used in the future for calculations.
     * @function
     * @param element - Element to be rendered
     */
    renderElement(element) {
        let dataMarginTop = element.getAttribute('data-margin-top') || '0';
        let dataMarginBottom = element.getAttribute('data-margin-bottom') || '0';
        let dataStickyFor = element.getAttribute('data-sticky-for') || '0';
        // Create a container for variables needed in future and set defaults.
        element.sticky = {
            active: false,
            marginTop: parseInt(dataMarginTop, 10) || this.options.marginTop,
            marginBottom: parseInt(dataMarginBottom, 10) || this.options.marginBottom,
            rect: this.getRectangle(element),
            stickyFor: parseInt(dataStickyFor, 10) || this.options.stickyFor,
            stickyClass: element.getAttribute('data-sticky-class') || this.options.stickyClass,
            // TODO: attribute for stickyContainer
            // element.sticky.stickyContainer = element.getAttribute('data-sticky-container') || this.options.stickyContainer
            stickyContainer: this.options.stickyContainer,
            wrap: element.hasAttribute('data-sticky-wrap') ? true : this.options.wrap,
        };
        element.sticky.container = this.getStickyContainer(element);
        element.sticky.container.rect = this.getRectangle(element.sticky.container);
        // TODO: Fix when element is image that has not yet loaded and width, height = 0
        if (element.tagName.toLowerCase() === 'img') {
            element.onload = () => element.sticky.rect = this.getRectangle(element);
        }
        if (element.sticky.wrap) {
            this.wrapElement(element);
        }
        this.activate(element);
    }
    /**
     * Wraps element with a placeholder element.
     * @function
     * @param element - Element to be wrapped.
     */
    wrapElement(element) {
        element.insertAdjacentHTML('beforebegin', '<span></span>');
        let previousSibling = element.previousSibling;
        previousSibling.appendChild(element);
    }
    /**
     * Function that activates element when specified conditions are met and then initalise events
     * @function
     * @param element - Element to be activated
     */
    activate(element) {
        if (((element.sticky.rect.top + element.sticky.rect.height) < (element.sticky.container.rect.top + element.sticky.container.rect.height))
            && (element.sticky.stickyFor < this.vp.width)
            && !element.sticky.active) {
            element.sticky.active = true;
            element.setAttribute('data-sticky-rendered', '');
        }
        if (this.elements.indexOf(element) < 0) {
            this.elements.push(element);
        }
        if (!element.sticky.resizeEvent) {
            this.initResizeEvents(element);
            element.sticky.resizeEvent = true;
        }
        if (!element.sticky.scrollEvent) {
            this.initScrollEvents(element);
            element.sticky.scrollEvent = true;
        }
        this.setPosition(element);
    }
    /**
     * Adds onResizeEvents to window listener and assigns function to element as resizeListener.
     * @function
     * @param element - Element for which resize events are initialised
     */
    initResizeEvents(element) {
        element.sticky.resizeListener = () => this.onResizeEvents(element);
        window.addEventListener('resize', element.sticky.resizeListener);
    }
    /**
     * Removes element listener from resize event.
     * @function
     * @param element - Element from which listener is deleted.
     */
    destroyResizeEvents(element) {
        window.removeEventListener('resize', element.sticky.resizeListener);
    }
    /**
     * Fired when user resizes window. It checks if element should be activated or deactivated and then runs setPosition function.
     * @function
     * @param element - Element for which event function is fired
     */
    onResizeEvents(element) {
        this.vp = this.getViewportSize();
        element.sticky.rect = this.getRectangle(element);
        element.sticky.container.rect = this.getRectangle(element.sticky.container);
        if (((element.sticky.rect.top + element.sticky.rect.height) < (element.sticky.container.rect.top + element.sticky.container.rect.height))
            && (element.sticky.stickyFor < this.vp.width)
            && !element.sticky.active) {
            element.sticky.active = true;
        }
        else if (((element.sticky.rect.top + element.sticky.rect.height) >= (element.sticky.container.rect.top + element.sticky.container.rect.height))
            || element.sticky.stickyFor >= this.vp.width
                && element.sticky.active) {
            element.sticky.active = false;
        }
        this.setPosition(element);
    }
    /**
     * Adds onScrollEvents to window listener and assigns function to element as scrollListener.
     * @function
     * @param element - Element for which scroll events are initialised
     */
    initScrollEvents(element) {
        element.sticky.scrollListener = () => this.onScrollEvents(element);
        window.addEventListener('scroll', element.sticky.scrollListener);
    }
    /**
     * Removes element listener from scroll event.
     * @function
     * @param element - Element from which listener is deleted.
     */
    destroyScrollEvents(element) {
        window.removeEventListener('scroll', element.sticky.scrollListener);
    }
    /**
     * Fired when user scrolls window. Invokes setPosition function if element is active.
     * @function
     * @param element - Element for which event function is fired
     */
    onScrollEvents(element) {
        if (element.sticky.active) {
            this.setPosition(element);
        }
    }
    /**
     * Main function for the library. Here are some condition calculations and css appending for sticky element when user scroll window
     * @function
     * @param element - Element that will be positioned if it's active
     */
    setPosition(element) {
        this.css(element, { position: '', width: '', top: '', left: '' });
        if ((this.vp.height < element.sticky.rect.height) || !element.sticky.active) {
            return;
        }
        if (!element.sticky.rect.width) {
            element.sticky.rect = this.getRectangle(element);
        }
        if (element.sticky.wrap) {
            this.css(element.parentNode, {
                display: 'block',
                width: element.sticky.rect.width + 'px',
                height: element.sticky.rect.height + 'px',
            });
        }
        if (element.sticky.marginBottom) {
            if (element.sticky.rect.top === 0
                && element.sticky.container === this.body) {
                this.css(element, {
                    position: 'fixed',
                    top: element.sticky.rect.top + 'px',
                    left: element.sticky.rect.left + 'px',
                    width: element.sticky.rect.width + 'px',
                });
            }
            else if (this.scrollTop + window.innerHeight >
                (element.sticky.rect.top + element.sticky.rect.height + element.sticky.marginBottom)) {
                // Stick element
                this.css(element, {
                    position: 'fixed',
                    width: element.sticky.rect.width + 'px',
                    left: element.sticky.rect.left + 'px',
                });
                if ( // Unstick, but keep setting it's top position
                (this.scrollTop + window.innerHeight - element.sticky.marginBottom) >
                    (element.sticky.container.rect.top + element.sticky.container.offsetHeight)) {
                    if (element.sticky.stickyClass) {
                        element.classList.remove(element.sticky.stickyClass);
                    }
                    this.css(element, {
                        top: (element.sticky.container.rect.top + element.sticky.container.offsetHeight) -
                            (this.scrollTop + element.sticky.rect.height) + 'px',
                    });
                }
                else { // Add top position to tick
                    if (element.sticky.stickyClass) {
                        element.classList.add(element.sticky.stickyClass);
                    }
                    this.css(element, { top: window.innerHeight - element.sticky.marginBottom - element.sticky.rect.height + 'px' });
                }
            }
            else { // Unstick and clear styles, when element is below the stick position
                if (element.sticky.stickyClass) {
                    element.classList.remove(element.sticky.stickyClass);
                }
                this.css(element, { position: '', width: '', top: '', left: '' });
                if (element.sticky.wrap) {
                    this.css(element.parentNode, { display: '', width: '', height: '' });
                }
            }
        }
        // If doesn't have marginBottom option
        else {
            if (element.sticky.rect.top === 0 && element.sticky.container === this.body) {
                this.css(element, {
                    position: 'fixed',
                    top: element.sticky.rect.top + 'px',
                    left: element.sticky.rect.left + 'px',
                    width: element.sticky.rect.width + 'px',
                });
            }
            else if (this.scrollTop > (element.sticky.rect.top - element.sticky.marginTop)) {
                this.css(element, {
                    position: 'fixed',
                    width: element.sticky.rect.width + 'px',
                    left: element.sticky.rect.left + 'px',
                });
                if ((this.scrollTop + element.sticky.rect.height + element.sticky.marginTop)
                    > (element.sticky.container.rect.top + element.sticky.container.offsetHeight)) {
                    if (element.sticky.stickyClass) {
                        element.classList.remove(element.sticky.stickyClass);
                    }
                    this.css(element, {
                        top: (element.sticky.container.rect.top + element.sticky.container.offsetHeight) - (this.scrollTop + element.sticky.rect.height) + 'px'
                    });
                }
                else {
                    if (element.sticky.stickyClass) {
                        element.classList.add(element.sticky.stickyClass);
                    }
                    this.css(element, { top: element.sticky.marginTop + 'px' });
                }
            }
            else {
                if (element.sticky.stickyClass) {
                    element.classList.remove(element.sticky.stickyClass);
                }
                this.css(element, { position: '', width: '', top: '', left: '' });
                if (element.sticky.wrap) {
                    this.css(element.parentNode, { display: '', width: '', height: '' });
                }
            }
        }
    }
    /**
     * Updates element sticky rectangle (with sticky container), then activates or deactivates element and updates its position if it's active.
     * @function
     */
    update() {
        const elements = document.querySelectorAll(this.selector);
        elements.forEach((element) => {
            // if this element has not already been rendered
            if (element.getAttribute('data-sticky-rendered') === null) {
                element.setAttribute('data-sticky-rendered', '');
                this.elements.push(element);
                this.renderElement(element);
            }
            else {
                element.sticky.rect = this.getRectangle(element);
                element.sticky.container.rect = this.getRectangle(element.sticky.container);
                this.activate(element);
                this.setPosition(element);
            }
        });
    }
    /**
     * Destroys sticky element, remove listeners
     * @function
     */
    destroy() {
        this.elements.forEach((element) => {
            this.destroyResizeEvents(element);
            this.destroyScrollEvents(element);
        });
    }
    /**
     * Function that returns container element in which sticky element is stuck (if is not specified, then it's stuck to body)
     * @function
     * @param element - Element which sticky container are looked for
     * @return Node - Sticky container
     */
    getStickyContainer(element) {
        let container = element.parentNode;
        while (!container.hasAttribute('data-sticky-container')
            && !container.parentNode.querySelector(element.sticky.stickyContainer)
            && container !== this.body) {
            container = container.parentNode;
        }
        return container;
    }
    /**
     * Returns an element's rectangle & position.
     * @function
     * @param element - Element in which position & rectangle are returned.
     * @return
     */
    getRectangle(element) {
        this.css(element, { position: '', width: '', top: '', left: '' });
        const width = Math.max(element.offsetWidth, element.clientWidth, element.scrollWidth);
        const height = Math.max(element.offsetHeight, element.clientHeight, element.scrollHeight);
        let top = 0;
        let left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return { top, left, width, height };
    }
    /**
     * Returns viewport dimensions.
     * @function
     * @return
     */
    getViewportSize() {
        return {
            width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        };
    }
    /**
     * Helper function to add/remove css properties for specified element.
     * @param element - DOM element
     * @param properties - CSS properties that will be added/removed from specified element
     */
    css(element, properties) {
        for (let property in properties) {
            if (properties.hasOwnProperty(property)) {
                element.style[property] = properties[property];
            }
        }
    }
    /**
     * Returns the window scroll position.
     * @function
     * @return Number - scroll position
     */
    getScrollTopPosition() {
        return (window.pageYOffset || document.body.scrollTop) - (document.body.clientTop || 0) || 0;
    }
}
