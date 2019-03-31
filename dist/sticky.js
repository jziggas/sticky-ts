"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sticky = /** @class */ (function () {
    /**
     * @constructor
     * @param selector - Selector string to find elements.
     * @param options - Options for the sticky elements (can be overwritten by data-{option}="" attributes).
     */
    function Sticky(selector, options) {
        var _this = this;
        if (selector === void 0) { selector = ''; }
        if (options === void 0) { options = {}; }
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
        window.addEventListener('load', function () {
            _this.scrollTop = _this.getScrollTopPosition();
        });
        window.addEventListener('scroll', function () {
            _this.scrollTop = _this.getScrollTopPosition();
        });
        this.run();
    }
    /**
     * Waits for page to be fully loaded, then renders & activates every sticky element found with the specified selector.
     * @function
     */
    Sticky.prototype.run = function () {
        var _this = this;
        var pageLoaded = setInterval(function () {
            if (document.readyState === 'interactive' && _this.firstRender === false) {
                _this.firstRender = true;
                var elements = document.querySelectorAll(_this.selector);
                elements.forEach(function (element) { return _this.renderElement(element); });
                return;
            }
            if (document.readyState === 'complete') {
                clearInterval(pageLoaded);
                _this.update();
            }
        }, 10);
    };
    /**
     * Assigns the needed variables for sticky elements, that are used in the future for calculations.
     * @function
     * @param element - Element to be rendered
     */
    Sticky.prototype.renderElement = function (element) {
        var _this = this;
        var dataMarginTop = element.getAttribute('data-margin-top') || '0';
        var dataMarginBottom = element.getAttribute('data-margin-bottom') || '0';
        var dataStickyFor = element.getAttribute('data-sticky-for') || '0';
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
            element.onload = function () { return element.sticky.rect = _this.getRectangle(element); };
        }
        if (element.sticky.wrap) {
            this.wrapElement(element);
        }
        this.activate(element);
    };
    /**
     * Wraps element with a placeholder element.
     * @function
     * @param element - Element to be wrapped.
     */
    Sticky.prototype.wrapElement = function (element) {
        element.insertAdjacentHTML('beforebegin', '<span></span>');
        var previousSibling = element.previousSibling;
        previousSibling.appendChild(element);
    };
    /**
     * Function that activates element when specified conditions are met and then initalise events
     * @function
     * @param element - Element to be activated
     */
    Sticky.prototype.activate = function (element) {
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
    };
    /**
     * Adds onResizeEvents to window listener and assigns function to element as resizeListener.
     * @function
     * @param element - Element for which resize events are initialised
     */
    Sticky.prototype.initResizeEvents = function (element) {
        var _this = this;
        element.sticky.resizeListener = function () { return _this.onResizeEvents(element); };
        window.addEventListener('resize', element.sticky.resizeListener);
    };
    /**
     * Removes element listener from resize event.
     * @function
     * @param element - Element from which listener is deleted.
     */
    Sticky.prototype.destroyResizeEvents = function (element) {
        window.removeEventListener('resize', element.sticky.resizeListener);
    };
    /**
     * Fired when user resizes window. It checks if element should be activated or deactivated and then runs setPosition function.
     * @function
     * @param element - Element for which event function is fired
     */
    Sticky.prototype.onResizeEvents = function (element) {
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
    };
    /**
     * Adds onScrollEvents to window listener and assigns function to element as scrollListener.
     * @function
     * @param element - Element for which scroll events are initialised
     */
    Sticky.prototype.initScrollEvents = function (element) {
        var _this = this;
        element.sticky.scrollListener = function () { return _this.onScrollEvents(element); };
        window.addEventListener('scroll', element.sticky.scrollListener);
    };
    /**
     * Removes element listener from scroll event.
     * @function
     * @param element - Element from which listener is deleted.
     */
    Sticky.prototype.destroyScrollEvents = function (element) {
        window.removeEventListener('scroll', element.sticky.scrollListener);
    };
    /**
     * Fired when user scrolls window. Invokes setPosition function if element is active.
     * @function
     * @param element - Element for which event function is fired
     */
    Sticky.prototype.onScrollEvents = function (element) {
        if (element.sticky.active) {
            this.setPosition(element);
        }
    };
    /**
     * Main function for the library. Here are some condition calculations and css appending for sticky element when user scroll window
     * @function
     * @param element - Element that will be positioned if it's active
     */
    Sticky.prototype.setPosition = function (element) {
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
    };
    /**
     * Updates element sticky rectangle (with sticky container), then activates or deactivates element and updates its position if it's active.
     * @function
     */
    Sticky.prototype.update = function () {
        var _this = this;
        var elements = document.querySelectorAll(this.selector);
        elements.forEach(function (element) {
            // if this element has not already been rendered
            if (element.getAttribute('data-sticky-rendered') === null) {
                element.setAttribute('data-sticky-rendered', '');
                _this.elements.push(element);
                _this.renderElement(element);
            }
            else {
                element.sticky.rect = _this.getRectangle(element);
                element.sticky.container.rect = _this.getRectangle(element.sticky.container);
                _this.activate(element);
                _this.setPosition(element);
            }
        });
    };
    /**
     * Destroys sticky element, remove listeners
     * @function
     */
    Sticky.prototype.destroy = function () {
        var _this = this;
        this.elements.forEach(function (element) {
            _this.destroyResizeEvents(element);
            _this.destroyScrollEvents(element);
            delete element.sticky;
        });
    };
    /**
     * Function that returns container element in which sticky element is stuck (if is not specified, then it's stuck to body)
     * @function
     * @param element - Element which sticky container are looked for
     * @return Node - Sticky container
     */
    Sticky.prototype.getStickyContainer = function (element) {
        var container = element.parentNode;
        while (!container.hasAttribute('data-sticky-container')
            && !container.parentNode.querySelector(element.sticky.stickyContainer)
            && container !== this.body) {
            container = container.parentNode;
        }
        return container;
    };
    /**
     * Returns an element's rectangle & position.
     * @function
     * @param element - Element in which position & rectangle are returned.
     * @return
     */
    Sticky.prototype.getRectangle = function (element) {
        this.css(element, { position: '', width: '', top: '', left: '' });
        var width = Math.max(element.offsetWidth, element.clientWidth, element.scrollWidth);
        var height = Math.max(element.offsetHeight, element.clientHeight, element.scrollHeight);
        var top = 0;
        var left = 0;
        do {
            top += element.offsetTop || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return { top: top, left: left, width: width, height: height };
    };
    /**
     * Returns viewport dimensions.
     * @function
     * @return
     */
    Sticky.prototype.getViewportSize = function () {
        return {
            width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
        };
    };
    /**
     * Helper function to add/remove css properties for specified element.
     * @param element - DOM element
     * @param properties - CSS properties that will be added/removed from specified element
     */
    Sticky.prototype.css = function (element, properties) {
        for (var property in properties) {
            if (properties.hasOwnProperty(property)) {
                element.style[property] = properties[property];
            }
        }
    };
    /**
     * Returns the window scroll position.
     * @function
     * @return Number - scroll position
     */
    Sticky.prototype.getScrollTopPosition = function () {
        return (window.pageYOffset || document.body.scrollTop) - (document.body.clientTop || 0) || 0;
    };
    return Sticky;
}());
exports.Sticky = Sticky;
