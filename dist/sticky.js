(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stickyts = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sticky = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Sticky =
/*#__PURE__*/
function () {
  /**
   * @constructor
   * @param selector - Selector string to find elements.
   * @param options - Options for the sticky elements (can be overwritten by data-{option}="" attributes).
   */
  function Sticky() {
    var _this = this;

    var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Sticky);

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
      stickyContainer: options.stickyContainer || 'body'
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


  _createClass(Sticky, [{
    key: "run",
    value: function run() {
      var _this2 = this;

      var pageLoaded = setInterval(function () {
        if (document.readyState === 'interactive' && _this2.firstRender === false) {
          _this2.firstRender = true;
          var elements = document.querySelectorAll(_this2.selector);
          elements.forEach(function (element) {
            return _this2.renderElement(element);
          });
          return;
        }

        if (document.readyState === 'complete') {
          clearInterval(pageLoaded);

          _this2.update();
        }
      }, 10);
    }
    /**
     * Assigns the needed variables for sticky elements, that are used in the future for calculations.
     * @function
     * @param element - Element to be rendered
     */

  }, {
    key: "renderElement",
    value: function renderElement(element) {
      var _this3 = this;

      var dataMarginTop = element.getAttribute('data-margin-top') || '0';
      var dataMarginBottom = element.getAttribute('data-margin-bottom') || '0';
      var dataStickyFor = element.getAttribute('data-sticky-for') || '0'; // Create a container for variables needed in future and set defaults.

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
        wrap: element.hasAttribute('data-sticky-wrap') ? true : this.options.wrap
      };
      element.sticky.container = this.getStickyContainer(element);
      element.sticky.container.rect = this.getRectangle(element.sticky.container); // TODO: Fix when element is image that has not yet loaded and width, height = 0

      if (element.tagName.toLowerCase() === 'img') {
        element.onload = function () {
          return element.sticky.rect = _this3.getRectangle(element);
        };
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

  }, {
    key: "wrapElement",
    value: function wrapElement(element) {
      element.insertAdjacentHTML('beforebegin', '<span></span>');
      var previousSibling = element.previousSibling;
      previousSibling.appendChild(element);
    }
    /**
     * Function that activates element when specified conditions are met and then initalise events
     * @function
     * @param element - Element to be activated
     */

  }, {
    key: "activate",
    value: function activate(element) {
      if (element.sticky.rect.top + element.sticky.rect.height < element.sticky.container.rect.top + element.sticky.container.rect.height && element.sticky.stickyFor < this.vp.width && !element.sticky.active) {
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

  }, {
    key: "initResizeEvents",
    value: function initResizeEvents(element) {
      var _this4 = this;

      element.sticky.resizeListener = function () {
        return _this4.onResizeEvents(element);
      };

      window.addEventListener('resize', element.sticky.resizeListener);
    }
    /**
     * Removes element listener from resize event.
     * @function
     * @param element - Element from which listener is deleted.
     */

  }, {
    key: "destroyResizeEvents",
    value: function destroyResizeEvents(element) {
      window.removeEventListener('resize', element.sticky.resizeListener);
    }
    /**
     * Fired when user resizes window. It checks if element should be activated or deactivated and then runs setPosition function.
     * @function
     * @param element - Element for which event function is fired
     */

  }, {
    key: "onResizeEvents",
    value: function onResizeEvents(element) {
      this.vp = this.getViewportSize();
      element.sticky.rect = this.getRectangle(element);
      element.sticky.container.rect = this.getRectangle(element.sticky.container);

      if (element.sticky.rect.top + element.sticky.rect.height < element.sticky.container.rect.top + element.sticky.container.rect.height && element.sticky.stickyFor < this.vp.width && !element.sticky.active) {
        element.sticky.active = true;
      } else if (element.sticky.rect.top + element.sticky.rect.height >= element.sticky.container.rect.top + element.sticky.container.rect.height || element.sticky.stickyFor >= this.vp.width && element.sticky.active) {
        element.sticky.active = false;
      }

      this.setPosition(element);
    }
    /**
     * Adds onScrollEvents to window listener and assigns function to element as scrollListener.
     * @function
     * @param element - Element for which scroll events are initialised
     */

  }, {
    key: "initScrollEvents",
    value: function initScrollEvents(element) {
      var _this5 = this;

      element.sticky.scrollListener = function () {
        return _this5.onScrollEvents(element);
      };

      window.addEventListener('scroll', element.sticky.scrollListener);
    }
    /**
     * Removes element listener from scroll event.
     * @function
     * @param element - Element from which listener is deleted.
     */

  }, {
    key: "destroyScrollEvents",
    value: function destroyScrollEvents(element) {
      window.removeEventListener('scroll', element.sticky.scrollListener);
    }
    /**
     * Fired when user scrolls window. Invokes setPosition function if element is active.
     * @function
     * @param element - Element for which event function is fired
     */

  }, {
    key: "onScrollEvents",
    value: function onScrollEvents(element) {
      if (element.sticky.active) {
        this.setPosition(element);
      }
    }
    /**
     * Main function for the library. Here are some condition calculations and css appending for sticky element when user scroll window
     * @function
     * @param element - Element that will be positioned if it's active
     */

  }, {
    key: "setPosition",
    value: function setPosition(element) {
      this.css(element, {
        position: '',
        width: '',
        top: '',
        left: ''
      });

      if (this.vp.height < element.sticky.rect.height || !element.sticky.active) {
        return;
      }

      if (!element.sticky.rect.width) {
        element.sticky.rect = this.getRectangle(element);
      }

      if (element.sticky.wrap) {
        this.css(element.parentNode, {
          display: 'block',
          width: element.sticky.rect.width + 'px',
          height: element.sticky.rect.height + 'px'
        });
      }

      if (element.sticky.marginBottom) {
        if (element.sticky.rect.top === 0 && element.sticky.container === this.body) {
          this.css(element, {
            position: 'fixed',
            top: element.sticky.rect.top + 'px',
            left: element.sticky.rect.left + 'px',
            width: element.sticky.rect.width + 'px'
          });
        } else if (this.scrollTop + window.innerHeight > element.sticky.rect.top + element.sticky.rect.height + element.sticky.marginBottom) {
          // Stick element
          this.css(element, {
            position: 'fixed',
            width: element.sticky.rect.width + 'px',
            left: element.sticky.rect.left + 'px'
          });

          if ( // Unstick, but keep setting it's top position
          this.scrollTop + window.innerHeight - element.sticky.marginBottom > element.sticky.container.rect.top + element.sticky.container.offsetHeight) {
            if (element.sticky.stickyClass) {
              element.classList.remove(element.sticky.stickyClass);
            }

            this.css(element, {
              top: element.sticky.container.rect.top + element.sticky.container.offsetHeight - (this.scrollTop + element.sticky.rect.height) + 'px'
            });
          } else {
            // Add top position to tick
            if (element.sticky.stickyClass) {
              element.classList.add(element.sticky.stickyClass);
            }

            this.css(element, {
              top: window.innerHeight - element.sticky.marginBottom - element.sticky.rect.height + 'px'
            });
          }
        } else {
          // Unstick and clear styles, when element is below the stick position
          if (element.sticky.stickyClass) {
            element.classList.remove(element.sticky.stickyClass);
          }

          this.css(element, {
            position: '',
            width: '',
            top: '',
            left: ''
          });

          if (element.sticky.wrap) {
            this.css(element.parentNode, {
              display: '',
              width: '',
              height: ''
            });
          }
        }
      } // If doesn't have marginBottom option
      else {
          if (element.sticky.rect.top === 0 && element.sticky.container === this.body) {
            this.css(element, {
              position: 'fixed',
              top: element.sticky.rect.top + 'px',
              left: element.sticky.rect.left + 'px',
              width: element.sticky.rect.width + 'px'
            });
          } else if (this.scrollTop > element.sticky.rect.top - element.sticky.marginTop) {
            this.css(element, {
              position: 'fixed',
              width: element.sticky.rect.width + 'px',
              left: element.sticky.rect.left + 'px'
            });

            if (this.scrollTop + element.sticky.rect.height + element.sticky.marginTop > element.sticky.container.rect.top + element.sticky.container.offsetHeight) {
              if (element.sticky.stickyClass) {
                element.classList.remove(element.sticky.stickyClass);
              }

              this.css(element, {
                top: element.sticky.container.rect.top + element.sticky.container.offsetHeight - (this.scrollTop + element.sticky.rect.height) + 'px'
              });
            } else {
              if (element.sticky.stickyClass) {
                element.classList.add(element.sticky.stickyClass);
              }

              this.css(element, {
                top: element.sticky.marginTop + 'px'
              });
            }
          } else {
            if (element.sticky.stickyClass) {
              element.classList.remove(element.sticky.stickyClass);
            }

            this.css(element, {
              position: '',
              width: '',
              top: '',
              left: ''
            });

            if (element.sticky.wrap) {
              this.css(element.parentNode, {
                display: '',
                width: '',
                height: ''
              });
            }
          }
        }
    }
    /**
     * Updates element sticky rectangle (with sticky container), then activates or deactivates element and updates its position if it's active.
     * @function
     */

  }, {
    key: "update",
    value: function update() {
      var _this6 = this;

      var elements = document.querySelectorAll(this.selector);
      elements.forEach(function (element) {
        // if this element has not already been rendered
        if (element.getAttribute('data-sticky-rendered') === null) {
          element.setAttribute('data-sticky-rendered', '');

          _this6.elements.push(element);

          _this6.renderElement(element);
        } else {
          element.sticky.rect = _this6.getRectangle(element);
          element.sticky.container.rect = _this6.getRectangle(element.sticky.container);

          _this6.activate(element);

          _this6.setPosition(element);
        }
      });
    }
    /**
     * Destroys sticky element, remove listeners
     * @function
     */

  }, {
    key: "destroy",
    value: function destroy() {
      var _this7 = this;

      this.elements.forEach(function (element) {
        _this7.destroyResizeEvents(element);

        _this7.destroyScrollEvents(element);

        delete element.sticky;
      });
    }
    /**
     * Function that returns container element in which sticky element is stuck (if is not specified, then it's stuck to body)
     * @function
     * @param element - Element which sticky container are looked for
     * @return Node - Sticky container
     */

  }, {
    key: "getStickyContainer",
    value: function getStickyContainer(element) {
      var container = element.parentNode;

      while (!container.hasAttribute('data-sticky-container') && !container.parentNode.querySelector(element.sticky.stickyContainer) && container !== this.body) {
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

  }, {
    key: "getRectangle",
    value: function getRectangle(element) {
      this.css(element, {
        position: '',
        width: '',
        top: '',
        left: ''
      });
      var width = Math.max(element.offsetWidth, element.clientWidth, element.scrollWidth);
      var height = Math.max(element.offsetHeight, element.clientHeight, element.scrollHeight);
      var top = 0;
      var left = 0;

      do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);

      return {
        top: top,
        left: left,
        width: width,
        height: height
      };
    }
    /**
     * Returns viewport dimensions.
     * @function
     * @return
     */

  }, {
    key: "getViewportSize",
    value: function getViewportSize() {
      return {
        width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      };
    }
    /**
     * Helper function to add/remove css properties for specified element.
     * @param element - DOM element
     * @param properties - CSS properties that will be added/removed from specified element
     */

  }, {
    key: "css",
    value: function css(element, properties) {
      for (var property in properties) {
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

  }, {
    key: "getScrollTopPosition",
    value: function getScrollTopPosition() {
      return (window.pageYOffset || document.body.scrollTop) - (document.body.clientTop || 0) || 0;
    }
  }]);

  return Sticky;
}();

exports.Sticky = Sticky;

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc3RpY2t5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztJQ2tDYSxNOzs7QUFTWDs7Ozs7QUFLQSxvQkFBdUQ7QUFBQTs7QUFBQSxRQUEzQyxRQUEyQyx1RUFBaEMsRUFBZ0M7QUFBQSxRQUE1QixPQUE0Qix1RUFBRixFQUFFOztBQUFBOztBQUNyRCxTQUFLLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQSxTQUFLLFFBQUwsR0FBZ0IsRUFBaEI7QUFFQSxTQUFLLEVBQUwsR0FBVSxLQUFLLGVBQUwsRUFBVjtBQUNBLFNBQUssSUFBTCxHQUFZLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCLENBQVo7QUFDQSxTQUFLLFdBQUwsR0FBbUIsS0FBbkI7QUFDQSxTQUFLLFNBQUwsR0FBaUIsS0FBSyxvQkFBTCxFQUFqQjtBQUVBLFNBQUssT0FBTCxHQUFlO0FBQ2IsTUFBQSxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQVIsSUFBZ0IsS0FEVDtBQUViLE1BQUEsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFSLElBQXFCLENBRm5CO0FBR2IsTUFBQSxZQUFZLEVBQUUsT0FBTyxDQUFDLFlBQVIsSUFBd0IsQ0FIekI7QUFJYixNQUFBLFNBQVMsRUFBRSxPQUFPLENBQUMsU0FBUixJQUFxQixDQUpuQjtBQUtiLE1BQUEsV0FBVyxFQUFFLE9BQU8sQ0FBQyxXQUFSLElBQXVCLElBTHZCO0FBTWIsTUFBQSxlQUFlLEVBQUUsT0FBTyxDQUFDLGVBQVIsSUFBMkI7QUFOL0IsS0FBZjtBQVNBLElBQUEsTUFBTSxDQUFDLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFlBQUs7QUFDbkMsTUFBQSxLQUFJLENBQUMsU0FBTCxHQUFpQixLQUFJLENBQUMsb0JBQUwsRUFBakI7QUFDRCxLQUZEO0FBR0EsSUFBQSxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0MsWUFBSztB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ZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiZXhwb3J0IGludGVyZmFjZSBJU3RpY2t5T3B0aW9ucyB7XG4gIG1hcmdpbkJvdHRvbT86IG51bWJlclxuICBtYXJnaW5Ub3A/OiBudW1iZXJcbiAgc3RpY2t5Q2xhc3M/OiBzdHJpbmcgfCBudWxsXG4gIHN0aWNreUNvbnRhaW5lcj86IHN0cmluZ1xuICBzdGlja3lGb3I/OiBudW1iZXJcbiAgd3JhcD86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RpY2t5RWxlbWVudENvbmZpZyBleHRlbmRzIElTdGlja3lPcHRpb25zIHtcbiAgYWN0aXZlOiBib29sZWFuXG4gIGNvbnRhaW5lcj86IGFueVxuICByZWN0OiBhbnlcbiAgcmVzaXplRXZlbnQ/OiBib29sZWFuXG4gIHJlc2l6ZUxpc3RlbmVyPzogRXZlbnRMaXN0ZW5lclxuICBzY3JvbGxFdmVudD86IGJvb2xlYW5cbiAgc2Nyb2xsTGlzdGVuZXI/OiBFdmVudExpc3RlbmVyXG59XG5leHBvcnQgaW50ZXJmYWNlIElTdGlja3lFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBzdGlja3k6IElTdGlja3lFbGVtZW50Q29uZmlnXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZpZXdwb3J0RGF0YSB7XG4gIGhlaWdodDogbnVtYmVyXG4gIHdpZHRoOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVjdGFuZ2xlIHtcbiAgbGVmdDogbnVtYmVyXG4gIGhlaWdodDogbnVtYmVyXG4gIHRvcDogbnVtYmVyXG4gIHdpZHRoOiBudW1iZXJcbn1cblxuZXhwb3J0IGNsYXNzIFN0aWNreSB7XG4gIGJvZHk6IEhUTUxCb2R5RWxlbWVudFxuICBlbGVtZW50czogYW55W11cbiAgZmlyc3RSZW5kZXI6IGJvb2xlYW5cbiAgb3B0aW9uczogSVN0aWNreU9wdGlvbnNcbiAgc2Nyb2xsVG9wOiBudW1iZXJcbiAgc2VsZWN0b3I6IHN0cmluZ1xuICB2cDogSVZpZXdwb3J0RGF0YVxuXG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHNlbGVjdG9yIC0gU2VsZWN0b3Igc3RyaW5nIHRvIGZpbmQgZWxlbWVudHMuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIHN0aWNreSBlbGVtZW50cyAoY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IGRhdGEte29wdGlvbn09XCJcIiBhdHRyaWJ1dGVzKS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9yID0gJycsIG9wdGlvbnM6IElTdGlja3lPcHRpb25zID0ge30pIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgICB0aGlzLmVsZW1lbnRzID0gW11cblxuICAgIHRoaXMudnAgPSB0aGlzLmdldFZpZXdwb3J0U2l6ZSgpXG4gICAgdGhpcy5ib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpIGFzIEhUTUxCb2R5RWxlbWVudFxuICAgIHRoaXMuZmlyc3RSZW5kZXIgPSBmYWxzZVxuICAgIHRoaXMuc2Nyb2xsVG9wID0gdGhpcy5nZXRTY3JvbGxUb3BQb3NpdGlvbigpXG5cbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICB3cmFwOiBvcHRpb25zLndyYXAgfHwgZmFsc2UsXG4gICAgICBtYXJnaW5Ub3A6IG9wdGlvbnMubWFyZ2luVG9wIHx8IDAsXG4gICAgICBtYXJnaW5Cb3R0b206IG9wdGlvbnMubWFyZ2luQm90dG9tIHx8IDAsXG4gICAgICBzdGlja3lGb3I6IG9wdGlvbnMuc3RpY2t5Rm9yIHx8IDAsXG4gICAgICBzdGlja3lDbGFzczogb3B0aW9ucy5zdGlja3lDbGFzcyB8fCBudWxsLFxuICAgICAgc3RpY2t5Q29udGFpbmVyOiBvcHRpb25zLnN0aWNreUNvbnRhaW5lciB8fCAnYm9keScsXG4gICAgfVxuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNjcm9sbFRvcCA9IHRoaXMuZ2V0U2Nyb2xsVG9wUG9zaXRpb24oKVxuICAgIH0pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wID0gdGhpcy5nZXRTY3JvbGxUb3BQb3NpdGlvbigpXG4gICAgfSlcblxuICAgIHRoaXMucnVuKClcbiAgfVxuICBcbiAgXG4gICAgLyoqXG4gICAgICogV2FpdHMgZm9yIHBhZ2UgdG8gYmUgZnVsbHkgbG9hZGVkLCB0aGVuIHJlbmRlcnMgJiBhY3RpdmF0ZXMgZXZlcnkgc3RpY2t5IGVsZW1lbnQgZm91bmQgd2l0aCB0aGUgc3BlY2lmaWVkIHNlbGVjdG9yLlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIHJ1bigpOiB2b2lkIHtcbiAgICAgIGNvbnN0IHBhZ2VMb2FkZWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnaW50ZXJhY3RpdmUnICYmIHRoaXMuZmlyc3RSZW5kZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgdGhpcy5maXJzdFJlbmRlciA9IHRydWVcbiAgXG4gICAgICAgICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SVN0aWNreUVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKVxuICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQ6IElTdGlja3lFbGVtZW50KSA9PiB0aGlzLnJlbmRlckVsZW1lbnQoZWxlbWVudCkpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgXG4gICAgICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChwYWdlTG9hZGVkKVxuICAgICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgICAgfVxuICAgICAgfSwgMTApXG4gICAgfVxuICBcbiAgXG4gICAgLyoqXG4gICAgICogQXNzaWducyB0aGUgbmVlZGVkIHZhcmlhYmxlcyBmb3Igc3RpY2t5IGVsZW1lbnRzLCB0aGF0IGFyZSB1c2VkIGluIHRoZSBmdXR1cmUgZm9yIGNhbGN1bGF0aW9ucy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEVsZW1lbnQgdG8gYmUgcmVuZGVyZWRcbiAgICAgKi9cbiAgICByZW5kZXJFbGVtZW50KGVsZW1lbnQ6IElTdGlja3lFbGVtZW50KTogdm9pZCB7XG4gICAgICBsZXQgZGF0YU1hcmdpblRvcCA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLW1hcmdpbi10b3AnKSB8fCAnMCdcbiAgICAgIGxldCBkYXRhTWFyZ2luQm90dG9tID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWFyZ2luLWJvdHRvbScpIHx8ICcwJ1xuICAgICAgbGV0IGRhdGFTdGlja3lGb3IgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zdGlja3ktZm9yJykgfHwgJzAnXG4gICAgICAvLyBDcmVhdGUgYSBjb250YWluZXIgZm9yIHZhcmlhYmxlcyBuZWVkZWQgaW4gZnV0dXJlIGFuZCBzZXQgZGVmYXVsdHMuXG4gICAgICBlbGVtZW50LnN0aWNreSA9IHtcbiAgICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgICAgbWFyZ2luVG9wOiBwYXJzZUludChkYXRhTWFyZ2luVG9wLCAxMCkgfHwgdGhpcy5vcHRpb25zLm1hcmdpblRvcCxcbiAgICAgICAgbWFyZ2luQm90dG9tOiBwYXJzZUludChkYXRhTWFyZ2luQm90dG9tLCAxMCkgfHwgdGhpcy5vcHRpb25zLm1hcmdpbkJvdHRvbSxcbiAgICAgICAgcmVjdDogdGhpcy5nZXRSZWN0YW5nbGUoZWxlbWVudCksXG4gICAgICAgIHN0aWNreUZvcjogcGFyc2VJbnQoZGF0YVN0aWNreUZvciwgMTApIHx8IHRoaXMub3B0aW9ucy5zdGlja3lGb3IsXG4gICAgICAgIHN0aWNreUNsYXNzOiBlbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1zdGlja3ktY2xhc3MnKSB8fCB0aGlzLm9wdGlvbnMuc3RpY2t5Q2xhc3MsXG4gICAgICAgIC8vIFRPRE86IGF0dHJpYnV0ZSBmb3Igc3RpY2t5Q29udGFpbmVyXG4gICAgICAgIC8vIGVsZW1lbnQuc3RpY2t5LnN0aWNreUNvbnRhaW5lciA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXN0aWNreS1jb250YWluZXInKSB8fCB0aGlzLm9wdGlvbnMuc3RpY2t5Q29udGFpbmVyXG4gICAgICAgIHN0aWNreUNvbnRhaW5lcjogdGhpcy5vcHRpb25zLnN0aWNreUNvbnRhaW5lcixcbiAgICAgICAgd3JhcDogZWxlbWVudC5oYXNBdHRyaWJ1dGUoJ2RhdGEtc3RpY2t5LXdyYXAnKSA/IHRydWUgOiB0aGlzLm9wdGlvbnMud3JhcCxcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lciA9IHRoaXMuZ2V0U3RpY2t5Q29udGFpbmVyKGVsZW1lbnQpXG4gICAgICBlbGVtZW50LnN0aWNreS5jb250YWluZXIucmVjdCA9IHRoaXMuZ2V0UmVjdGFuZ2xlKGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lcilcbiAgXG4gICAgICAvLyBUT0RPOiBGaXggd2hlbiBlbGVtZW50IGlzIGltYWdlIHRoYXQgaGFzIG5vdCB5ZXQgbG9hZGVkIGFuZCB3aWR0aCwgaGVpZ2h0ID0gMFxuICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykge1xuICAgICAgICBlbGVtZW50Lm9ubG9hZCA9ICgpID0+IGVsZW1lbnQuc3RpY2t5LnJlY3QgPSB0aGlzLmdldFJlY3RhbmdsZShlbGVtZW50KVxuICAgICAgfVxuICBcbiAgICAgIGlmIChlbGVtZW50LnN0aWNreS53cmFwKSB7XG4gICAgICAgIHRoaXMud3JhcEVsZW1lbnQoZWxlbWVudClcbiAgICAgIH1cblxuICAgICAgdGhpcy5hY3RpdmF0ZShlbGVtZW50KVxuICAgIH1cbiAgXG4gIFxuICAgIC8qKlxuICAgICAqIFdyYXBzIGVsZW1lbnQgd2l0aCBhIHBsYWNlaG9sZGVyIGVsZW1lbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IHRvIGJlIHdyYXBwZWQuXG4gICAgICovXG4gICAgd3JhcEVsZW1lbnQoZWxlbWVudDogSVN0aWNreUVsZW1lbnQpOiB2b2lkIHtcbiAgICAgIGVsZW1lbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsICc8c3Bhbj48L3NwYW4+JylcbiAgICAgIGxldCBwcmV2aW91c1NpYmxpbmc6IE5vZGUgPSBlbGVtZW50LnByZXZpb3VzU2libGluZyBhcyBOb2RlXG4gICAgICBwcmV2aW91c1NpYmxpbmcuYXBwZW5kQ2hpbGQoZWxlbWVudClcbiAgICB9XG4gIFxuICBcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0aGF0IGFjdGl2YXRlcyBlbGVtZW50IHdoZW4gc3BlY2lmaWVkIGNvbmRpdGlvbnMgYXJlIG1ldCBhbmQgdGhlbiBpbml0YWxpc2UgZXZlbnRzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IHRvIGJlIGFjdGl2YXRlZFxuICAgICAqL1xuICAgICBhY3RpdmF0ZShlbGVtZW50OiBJU3RpY2t5RWxlbWVudCk6IHZvaWQge1xuICAgICAgaWYgKFxuICAgICAgICAoKGVsZW1lbnQuc3RpY2t5LnJlY3QudG9wICsgZWxlbWVudC5zdGlja3kucmVjdC5oZWlnaHQpIDwgKGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LnRvcCArIGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LmhlaWdodCkpXG4gICAgICAgICYmIChlbGVtZW50LnN0aWNreS5zdGlja3lGb3IgYXMgbnVtYmVyIDwgdGhpcy52cC53aWR0aClcbiAgICAgICAgJiYgIWVsZW1lbnQuc3RpY2t5LmFjdGl2ZVxuICAgICAgKSB7XG4gICAgICAgIGVsZW1lbnQuc3RpY2t5LmFjdGl2ZSA9IHRydWVcbiAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICdkYXRhLXN0aWNreS1yZW5kZXJlZCcsICcnIClcbiAgICAgIH1cbiAgXG4gICAgICBpZiAodGhpcy5lbGVtZW50cy5pbmRleE9mKGVsZW1lbnQpIDwgMCkge1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2goZWxlbWVudClcbiAgICAgIH1cbiAgXG4gICAgICBpZiAoIWVsZW1lbnQuc3RpY2t5LnJlc2l6ZUV2ZW50KSB7XG4gICAgICAgIHRoaXMuaW5pdFJlc2l6ZUV2ZW50cyhlbGVtZW50KVxuICAgICAgICBlbGVtZW50LnN0aWNreS5yZXNpemVFdmVudCA9IHRydWVcbiAgICAgIH1cbiAgXG4gICAgICBpZiAoIWVsZW1lbnQuc3RpY2t5LnNjcm9sbEV2ZW50KSB7XG4gICAgICAgIHRoaXMuaW5pdFNjcm9sbEV2ZW50cyhlbGVtZW50KVxuICAgICAgICBlbGVtZW50LnN0aWNreS5zY3JvbGxFdmVudCA9IHRydWVcbiAgICAgIH1cbiAgXG4gICAgICB0aGlzLnNldFBvc2l0aW9uKGVsZW1lbnQpXG4gICAgIH1cbiAgXG4gIFxuICAgIC8qKlxuICAgICAqIEFkZHMgb25SZXNpemVFdmVudHMgdG8gd2luZG93IGxpc3RlbmVyIGFuZCBhc3NpZ25zIGZ1bmN0aW9uIHRvIGVsZW1lbnQgYXMgcmVzaXplTGlzdGVuZXIuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IGZvciB3aGljaCByZXNpemUgZXZlbnRzIGFyZSBpbml0aWFsaXNlZFxuICAgICAqL1xuICAgICBpbml0UmVzaXplRXZlbnRzKGVsZW1lbnQ6IElTdGlja3lFbGVtZW50KTogdm9pZCB7XG4gICAgICBlbGVtZW50LnN0aWNreS5yZXNpemVMaXN0ZW5lciA9ICgpID0+IHRoaXMub25SZXNpemVFdmVudHMoZWxlbWVudClcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBlbGVtZW50LnN0aWNreS5yZXNpemVMaXN0ZW5lcilcbiAgICAgfVxuICBcbiAgXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBlbGVtZW50IGxpc3RlbmVyIGZyb20gcmVzaXplIGV2ZW50LlxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gRWxlbWVudCBmcm9tIHdoaWNoIGxpc3RlbmVyIGlzIGRlbGV0ZWQuXG4gICAgICovXG4gICAgIGRlc3Ryb3lSZXNpemVFdmVudHMoZWxlbWVudDogSVN0aWNreUVsZW1lbnQpOiB2b2lkIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBlbGVtZW50LnN0aWNreS5yZXNpemVMaXN0ZW5lciBhcyBFdmVudExpc3RlbmVyKVxuICAgICB9XG4gIFxuICBcbiAgICAvKipcbiAgICAgKiBGaXJlZCB3aGVuIHVzZXIgcmVzaXplcyB3aW5kb3cuIEl0IGNoZWNrcyBpZiBlbGVtZW50IHNob3VsZCBiZSBhY3RpdmF0ZWQgb3IgZGVhY3RpdmF0ZWQgYW5kIHRoZW4gcnVucyBzZXRQb3NpdGlvbiBmdW5jdGlvbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEVsZW1lbnQgZm9yIHdoaWNoIGV2ZW50IGZ1bmN0aW9uIGlzIGZpcmVkXG4gICAgICovXG4gICAgIG9uUmVzaXplRXZlbnRzKGVsZW1lbnQ6IElTdGlja3lFbGVtZW50KTogdm9pZCB7XG4gICAgICB0aGlzLnZwID0gdGhpcy5nZXRWaWV3cG9ydFNpemUoKVxuICBcbiAgICAgIGVsZW1lbnQuc3RpY2t5LnJlY3QgPSB0aGlzLmdldFJlY3RhbmdsZShlbGVtZW50KVxuICAgICAgZWxlbWVudC5zdGlja3kuY29udGFpbmVyLnJlY3QgPSB0aGlzLmdldFJlY3RhbmdsZShlbGVtZW50LnN0aWNreS5jb250YWluZXIpXG4gIFxuICAgICAgaWYgKFxuICAgICAgICAoKGVsZW1lbnQuc3RpY2t5LnJlY3QudG9wICsgZWxlbWVudC5zdGlja3kucmVjdC5oZWlnaHQpIDwgKGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LnRvcCArIGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LmhlaWdodCkpXG4gICAgICAgICYmIChlbGVtZW50LnN0aWNreS5zdGlja3lGb3IgYXMgbnVtYmVyIDwgdGhpcy52cC53aWR0aClcbiAgICAgICAgJiYgIWVsZW1lbnQuc3RpY2t5LmFjdGl2ZVxuICAgICAgKSB7XG4gICAgICAgIGVsZW1lbnQuc3RpY2t5LmFjdGl2ZSA9IHRydWVcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICgoZWxlbWVudC5zdGlja3kucmVjdC50b3AgKyBlbGVtZW50LnN0aWNreS5yZWN0LmhlaWdodCkgPj0gKGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LnRvcCArIGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LmhlaWdodCkpXG4gICAgICAgIHx8IGVsZW1lbnQuc3RpY2t5LnN0aWNreUZvciBhcyBudW1iZXIgPj0gdGhpcy52cC53aWR0aFxuICAgICAgICAmJiBlbGVtZW50LnN0aWNreS5hY3RpdmVcbiAgICAgICkge1xuICAgICAgICBlbGVtZW50LnN0aWNreS5hY3RpdmUgPSBmYWxzZVxuICAgICAgfVxuICBcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWxlbWVudClcbiAgICAgfVxuICBcbiAgXG4gICAgLyoqXG4gICAgICogQWRkcyBvblNjcm9sbEV2ZW50cyB0byB3aW5kb3cgbGlzdGVuZXIgYW5kIGFzc2lnbnMgZnVuY3Rpb24gdG8gZWxlbWVudCBhcyBzY3JvbGxMaXN0ZW5lci5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEVsZW1lbnQgZm9yIHdoaWNoIHNjcm9sbCBldmVudHMgYXJlIGluaXRpYWxpc2VkXG4gICAgICovXG4gICAgIGluaXRTY3JvbGxFdmVudHMoZWxlbWVudDogSVN0aWNreUVsZW1lbnQpOiB2b2lkIHtcbiAgICAgIGVsZW1lbnQuc3RpY2t5LnNjcm9sbExpc3RlbmVyID0gKCkgPT4gdGhpcy5vblNjcm9sbEV2ZW50cyhlbGVtZW50KVxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGVsZW1lbnQuc3RpY2t5LnNjcm9sbExpc3RlbmVyKVxuICAgICB9XG4gIFxuICBcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGVsZW1lbnQgbGlzdGVuZXIgZnJvbSBzY3JvbGwgZXZlbnQuXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHBhcmFtIGVsZW1lbnQgLSBFbGVtZW50IGZyb20gd2hpY2ggbGlzdGVuZXIgaXMgZGVsZXRlZC5cbiAgICAgKi9cbiAgICAgZGVzdHJveVNjcm9sbEV2ZW50cyhlbGVtZW50OiBJU3RpY2t5RWxlbWVudCk6IHZvaWQge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGVsZW1lbnQuc3RpY2t5LnNjcm9sbExpc3RlbmVyIGFzIEV2ZW50TGlzdGVuZXIpXG4gICAgIH1cbiAgXG4gIFxuICAgIC8qKlxuICAgICAqIEZpcmVkIHdoZW4gdXNlciBzY3JvbGxzIHdpbmRvdy4gSW52b2tlcyBzZXRQb3NpdGlvbiBmdW5jdGlvbiBpZiBlbGVtZW50IGlzIGFjdGl2ZS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEVsZW1lbnQgZm9yIHdoaWNoIGV2ZW50IGZ1bmN0aW9uIGlzIGZpcmVkXG4gICAgICovXG4gICAgIG9uU2Nyb2xsRXZlbnRzKGVsZW1lbnQ6IElTdGlja3lFbGVtZW50KTogdm9pZCB7XG4gICAgICBpZiAoZWxlbWVudC5zdGlja3kuYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oZWxlbWVudClcbiAgICAgIH1cbiAgICAgfVxuICBcbiAgXG4gICAgLyoqXG4gICAgICogTWFpbiBmdW5jdGlvbiBmb3IgdGhlIGxpYnJhcnkuIEhlcmUgYXJlIHNvbWUgY29uZGl0aW9uIGNhbGN1bGF0aW9ucyBhbmQgY3NzIGFwcGVuZGluZyBmb3Igc3RpY2t5IGVsZW1lbnQgd2hlbiB1c2VyIHNjcm9sbCB3aW5kb3dcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEVsZW1lbnQgdGhhdCB3aWxsIGJlIHBvc2l0aW9uZWQgaWYgaXQncyBhY3RpdmVcbiAgICAgKi9cbiAgICAgc2V0UG9zaXRpb24oZWxlbWVudDogSVN0aWNreUVsZW1lbnQpOiB2b2lkIHtcbiAgICAgIHRoaXMuY3NzKGVsZW1lbnQsIHsgcG9zaXRpb246ICcnLCB3aWR0aDogJycsIHRvcDogJycsIGxlZnQ6ICcnIH0pXG4gIFxuICAgICAgaWYgKCh0aGlzLnZwLmhlaWdodCA8IGVsZW1lbnQuc3RpY2t5LnJlY3QuaGVpZ2h0KSB8fCAhZWxlbWVudC5zdGlja3kuYWN0aXZlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICBcbiAgICAgIGlmICghZWxlbWVudC5zdGlja3kucmVjdC53aWR0aCkge1xuICAgICAgICBlbGVtZW50LnN0aWNreS5yZWN0ID0gdGhpcy5nZXRSZWN0YW5nbGUoZWxlbWVudClcbiAgICAgIH1cbiAgXG4gICAgICBpZiAoZWxlbWVudC5zdGlja3kud3JhcCkge1xuICAgICAgICB0aGlzLmNzcygoZWxlbWVudCBhcyBFbGVtZW50KS5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50LCB7XG4gICAgICAgICAgZGlzcGxheTogJ2Jsb2NrJyxcbiAgICAgICAgICB3aWR0aDogZWxlbWVudC5zdGlja3kucmVjdC53aWR0aCArICdweCcsXG4gICAgICAgICAgaGVpZ2h0OiBlbGVtZW50LnN0aWNreS5yZWN0LmhlaWdodCArICdweCcsXG4gICAgICAgIH0pXG4gICAgICB9XG4gIFxuICAgICAgaWYgKGVsZW1lbnQuc3RpY2t5Lm1hcmdpbkJvdHRvbSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZWxlbWVudC5zdGlja3kucmVjdC50b3AgPT09IDBcbiAgICAgICAgICAmJiBlbGVtZW50LnN0aWNreS5jb250YWluZXIgPT09IHRoaXMuYm9keVxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLmNzcyhlbGVtZW50LCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgICAgIHRvcDogZWxlbWVudC5zdGlja3kucmVjdC50b3AgKyAncHgnLFxuICAgICAgICAgICAgbGVmdDogZWxlbWVudC5zdGlja3kucmVjdC5sZWZ0ICsgJ3B4JyxcbiAgICAgICAgICAgIHdpZHRoOiBlbGVtZW50LnN0aWNreS5yZWN0LndpZHRoICsgJ3B4JyxcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgdGhpcy5zY3JvbGxUb3AgKyB3aW5kb3cuaW5uZXJIZWlnaHQgPlxuICAgICAgICAgICAgKGVsZW1lbnQuc3RpY2t5LnJlY3QudG9wICsgZWxlbWVudC5zdGlja3kucmVjdC5oZWlnaHQgKyBlbGVtZW50LnN0aWNreS5tYXJnaW5Cb3R0b20pXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgLy8gU3RpY2sgZWxlbWVudFxuICAgICAgICAgIHRoaXMuY3NzKGVsZW1lbnQsIHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxuICAgICAgICAgICAgd2lkdGg6IGVsZW1lbnQuc3RpY2t5LnJlY3Qud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgbGVmdDogZWxlbWVudC5zdGlja3kucmVjdC5sZWZ0ICsgJ3B4JyxcbiAgICAgICAgICB9KVxuICBcbiAgICAgICAgICBpZiAoIC8vIFVuc3RpY2ssIGJ1dCBrZWVwIHNldHRpbmcgaXQncyB0b3AgcG9zaXRpb25cbiAgICAgICAgICAgICh0aGlzLnNjcm9sbFRvcCArIHdpbmRvdy5pbm5lckhlaWdodCAtIGVsZW1lbnQuc3RpY2t5Lm1hcmdpbkJvdHRvbSkgPlxuICAgICAgICAgICAgKGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LnRvcCArIGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5vZmZzZXRIZWlnaHQpXG4gICAgICAgICAgKSB7XG4gIFxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuc3RpY2t5LnN0aWNreUNsYXNzKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShlbGVtZW50LnN0aWNreS5zdGlja3lDbGFzcylcbiAgICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgICB0aGlzLmNzcyhlbGVtZW50LCB7XG4gICAgICAgICAgICAgIHRvcDogKGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5yZWN0LnRvcCArIGVsZW1lbnQuc3RpY2t5LmNvbnRhaW5lci5vZmZzZXRIZWlnaHQpIC1cbiAgICAgICAgICAgICAgKHRoaXMuc2Nyb2xsVG9wICsgZWxlbWVudC5zdGlja3kucmVjdC5oZWlnaHQpICsgJ3B4JyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHsgLy8gQWRkIHRvcCBwb3NpdGlvbiB0byB0aWNrXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5zdGlja3kuc3RpY2t5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGVsZW1lbnQuc3RpY2t5LnN0aWNreUNsYXNzKVxuICAgICAgICAgICAgfVxuICBcbiAgICAgICAgICAgIHRoaXMuY3NzKGVsZW1lbnQsIHsgdG9wOiB3aW5kb3cuaW5uZXJIZWlnaHQgLSBlbGVtZW50LnN0aWNreS5tYXJnaW5Cb3R0b20gLSBlbGVtZW50LnN0aWNreS5yZWN0LmhlaWdodCArICdweCcgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIFVuc3RpY2sgYW5kIGNsZWFyIHN0eWxlcywgd2hlbiBlbGVtZW50IGlzIGJlbG93IHRoZSBzdGljayBwb3NpdGlvblxuICAgICAgICAgIGlmIChlbGVtZW50LnN0aWNreS5zdGlja3lDbGFzcykge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGVsZW1lbnQuc3RpY2t5LnN0aWNreUNsYXNzKVxuICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgdGhpcy5jc3MoZWxlbWVudCwgeyBwb3NpdGlvbjogJycsIHdpZHRoOiAnJywgdG9wOiAnJywgbGVmdDogJycgfSlcbiAgXG4gICAgICAgICAgaWYgKGVsZW1lbnQuc3RpY2t5LndyYXApIHtcbiAgICAgICAgICAgIHRoaXMuY3NzKGVsZW1lbnQucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudCwgeyBkaXNwbGF5OiAnJywgd2lkdGg6ICcnLCBoZWlnaHQ6ICcnIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBJZiBkb2Vzbid0IGhhdmUgbWFyZ2luQm90dG9tIG9wdGlvblxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmICggZWxlbWVudC5zdGlja3kucmVjdC50b3AgPT09IDAgJiYgZWxlbWVudC5zdGlja3kuY29udGFpbmVyID09PSB0aGlzLmJvZHkgKSB7XG4gICAgICAgICAgdGhpcy5jc3MoZWxlbWVudCwge1xuICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICAgICAgICB0b3A6IGVsZW1lbnQuc3RpY2t5LnJlY3QudG9wICsgJ3B4JyxcbiAgICAgICAgICAgIGxlZnQ6IGVsZW1lbnQuc3RpY2t5LnJlY3QubGVmdCArICdweCcsXG4gICAgICAgICAgICB3aWR0aDogZWxlbWVudC5zdGlja3kucmVjdC53aWR0aCArICdweCcsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNjcm9sbFRvcCA+IChlbGVtZW50LnN0aWNreS5yZWN0LnRvcCAtIChlbGVtZW50LnN0aWNreS5tYXJnaW5Ub3AgYXMgbnVtYmVyKSkpIHtcbiAgICAgICAgICB0aGlzLmNzcyhlbGVtZW50LCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgICAgIHdpZHRoOiBlbGVtZW50LnN0aWNreS5yZWN0LndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgIGxlZnQ6IGVsZW1lbnQuc3RpY2t5LnJlY3QubGVmdCArICdweCcsXG4gICAgICAgICAgfSlcbiAgXG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKHRoaXMuc2Nyb2xsVG9wICsgZWxlbWVudC5zdGlja3kucmVjdC5oZWlnaHQgKyBlbGVtZW50LnN0aWNreS5tYXJnaW5Ub3ApXG4gICAgICAgICAgICA+IChlbGVtZW50LnN0aWNreS5jb250YWluZXIucmVjdC50b3AgKyBlbGVtZW50LnN0aWNreS5jb250YWluZXIub2Zmc2V0SGVpZ2h0KVxuICAgICAgICAgICkge1xuICBcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnN0aWNreS5zdGlja3lDbGFzcykge1xuICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoZWxlbWVudC5zdGlja3kuc3RpY2t5Q2xhc3MpXG4gICAgICAgICAgICB9XG4gIFxuICAgICAgICAgICAgdGhpcy5jc3MoZWxlbWVudCwge1xuICAgICAgICAgICAgICB0b3A6IChlbGVtZW50LnN0aWNreS5jb250YWluZXIucmVjdC50b3AgKyBlbGVtZW50LnN0aWNreS5jb250YWluZXIub2Zmc2V0SGVpZ2h0KSAtICh0aGlzLnNjcm9sbFRvcCArIGVsZW1lbnQuc3RpY2t5LnJlY3QuaGVpZ2h0KSArICdweCcgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5zdGlja3kuc3RpY2t5Q2xhc3MpIHtcbiAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGVsZW1lbnQuc3RpY2t5LnN0aWNreUNsYXNzKVxuICAgICAgICAgICAgfVxuICBcbiAgICAgICAgICAgIHRoaXMuY3NzKGVsZW1lbnQsIHsgdG9wOiBlbGVtZW50LnN0aWNreS5tYXJnaW5Ub3AgKyAncHgnIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChlbGVtZW50LnN0aWNreS5zdGlja3lDbGFzcykge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGVsZW1lbnQuc3RpY2t5LnN0aWNreUNsYXNzKVxuICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgdGhpcy5jc3MoZWxlbWVudCwgeyBwb3NpdGlvbjogJycsIHdpZHRoOiAnJywgdG9wOiAnJywgbGVmdDogJycgfSlcbiAgXG4gICAgICAgICAgaWYgKGVsZW1lbnQuc3RpY2t5LndyYXApIHtcbiAgICAgICAgICAgIHRoaXMuY3NzKGVsZW1lbnQucGFyZW50Tm9kZSBhcyBIVE1MRWxlbWVudCwgeyBkaXNwbGF5OiAnJywgd2lkdGg6ICcnLCBoZWlnaHQ6ICcnIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgIH1cbiAgXG4gIFxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgZWxlbWVudCBzdGlja3kgcmVjdGFuZ2xlICh3aXRoIHN0aWNreSBjb250YWluZXIpLCB0aGVuIGFjdGl2YXRlcyBvciBkZWFjdGl2YXRlcyBlbGVtZW50IGFuZCB1cGRhdGVzIGl0cyBwb3NpdGlvbiBpZiBpdCdzIGFjdGl2ZS5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICAgdXBkYXRlKCk6IHZvaWQge1xuICAgICAgY29uc3QgZWxlbWVudHM6IE5vZGVMaXN0T2Y8SVN0aWNreUVsZW1lbnQ+ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKVxuICAgICAgZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudDogSVN0aWNreUVsZW1lbnQpID0+IHtcbiAgICAgICAgLy8gaWYgdGhpcyBlbGVtZW50IGhhcyBub3QgYWxyZWFkeSBiZWVuIHJlbmRlcmVkXG4gICAgICAgIGlmICggZWxlbWVudC5nZXRBdHRyaWJ1dGUoICdkYXRhLXN0aWNreS1yZW5kZXJlZCcgKSA9PT0gbnVsbCApIHtcbiAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ2RhdGEtc3RpY2t5LXJlbmRlcmVkJywgJycgKVxuICAgICAgICAgIHRoaXMuZWxlbWVudHMucHVzaCggZWxlbWVudCApXG4gICAgICAgICAgdGhpcy5yZW5kZXJFbGVtZW50KGVsZW1lbnQpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudC5zdGlja3kucmVjdCA9IHRoaXMuZ2V0UmVjdGFuZ2xlKGVsZW1lbnQpXG4gICAgICAgICAgZWxlbWVudC5zdGlja3kuY29udGFpbmVyLnJlY3QgPSB0aGlzLmdldFJlY3RhbmdsZShlbGVtZW50LnN0aWNreS5jb250YWluZXIpXG4gIFxuICAgICAgICAgIHRoaXMuYWN0aXZhdGUoZWxlbWVudClcbiAgICAgICAgICB0aGlzLnNldFBvc2l0aW9uKGVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgIH1cbiAgXG4gIFxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHN0aWNreSBlbGVtZW50LCByZW1vdmUgbGlzdGVuZXJzXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICB0aGlzLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQ6IElTdGlja3lFbGVtZW50KSA9PiB7XG4gICAgICAgIHRoaXMuZGVzdHJveVJlc2l6ZUV2ZW50cyhlbGVtZW50KVxuICAgICAgICB0aGlzLmRlc3Ryb3lTY3JvbGxFdmVudHMoZWxlbWVudClcbiAgICAgICAgZGVsZXRlIGVsZW1lbnQuc3RpY2t5XG4gICAgICB9KVxuICAgICB9XG4gIFxuICBcbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgY29udGFpbmVyIGVsZW1lbnQgaW4gd2hpY2ggc3RpY2t5IGVsZW1lbnQgaXMgc3R1Y2sgKGlmIGlzIG5vdCBzcGVjaWZpZWQsIHRoZW4gaXQncyBzdHVjayB0byBib2R5KVxuICAgICAqIEBmdW5jdGlvblxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gRWxlbWVudCB3aGljaCBzdGlja3kgY29udGFpbmVyIGFyZSBsb29rZWQgZm9yXG4gICAgICogQHJldHVybiBOb2RlIC0gU3RpY2t5IGNvbnRhaW5lclxuICAgICAqL1xuICAgICBnZXRTdGlja3lDb250YWluZXIoZWxlbWVudDogSVN0aWNreUVsZW1lbnQpOiBOb2RlIHtcbiAgICAgIGxldCBjb250YWluZXIgPSBlbGVtZW50LnBhcmVudE5vZGVcbiAgXG4gICAgICB3aGlsZSAoXG4gICAgICAgICEoY29udGFpbmVyIGFzIEVsZW1lbnQpLmhhc0F0dHJpYnV0ZSgnZGF0YS1zdGlja3ktY29udGFpbmVyJylcbiAgICAgICAgJiYgISgoY29udGFpbmVyIGFzIE5vZGUpLnBhcmVudE5vZGUgYXMgRWxlbWVudCkucXVlcnlTZWxlY3RvcihlbGVtZW50LnN0aWNreS5zdGlja3lDb250YWluZXIgYXMgc3RyaW5nKVxuICAgICAgICAmJiBjb250YWluZXIgIT09IHRoaXMuYm9keVxuICAgICAgKSB7XG4gICAgICAgIGNvbnRhaW5lciA9IChjb250YWluZXIgYXMgTm9kZSkucGFyZW50Tm9kZVxuICAgICAgfVxuICBcbiAgICAgIHJldHVybiBjb250YWluZXIgYXMgTm9kZVxuICAgICB9XG4gIFxuICBcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGVsZW1lbnQncyByZWN0YW5nbGUgJiBwb3NpdGlvbi5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gZWxlbWVudCAtIEVsZW1lbnQgaW4gd2hpY2ggcG9zaXRpb24gJiByZWN0YW5nbGUgYXJlIHJldHVybmVkLlxuICAgICAqIEByZXR1cm5cbiAgICAgKi9cbiAgICBnZXRSZWN0YW5nbGUoZWxlbWVudDogSVN0aWNreUVsZW1lbnQpOiBJUmVjdGFuZ2xlIHtcbiAgICAgIHRoaXMuY3NzKGVsZW1lbnQsIHtwb3NpdGlvbjogJycsIHdpZHRoOiAnJywgdG9wOiAnJywgbGVmdDogJycgfSlcbiAgXG4gICAgICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KGVsZW1lbnQub2Zmc2V0V2lkdGgsIGVsZW1lbnQuY2xpZW50V2lkdGgsIGVsZW1lbnQuc2Nyb2xsV2lkdGgpXG4gICAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1heChlbGVtZW50Lm9mZnNldEhlaWdodCwgZWxlbWVudC5jbGllbnRIZWlnaHQsIGVsZW1lbnQuc2Nyb2xsSGVpZ2h0KVxuICBcbiAgICAgIGxldCB0b3AgPSAwXG4gICAgICBsZXQgbGVmdCA9IDBcbiAgXG4gICAgICBkbyB7XG4gICAgICAgIHRvcCArPSBlbGVtZW50Lm9mZnNldFRvcCB8fCAwXG4gICAgICAgIGxlZnQgKz0gZWxlbWVudC5vZmZzZXRMZWZ0IHx8IDBcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50IGFzIElTdGlja3lFbGVtZW50IFxuICAgICAgfSB3aGlsZSAoZWxlbWVudClcbiAgXG4gICAgICByZXR1cm4geyB0b3AsIGxlZnQsIHdpZHRoLCBoZWlnaHQgfVxuICAgIH1cbiAgXG4gIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdmlld3BvcnQgZGltZW5zaW9ucy5cbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAcmV0dXJuXG4gICAgICovXG4gICAgZ2V0Vmlld3BvcnRTaXplKCk6IElWaWV3cG9ydERhdGEge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgd2lkdGg6IE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCwgd2luZG93LmlubmVyV2lkdGggfHwgMCksXG4gICAgICAgIGhlaWdodDogTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApLFxuICAgICAgfVxuICAgIH1cbiAgXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRvIGFkZC9yZW1vdmUgY3NzIHByb3BlcnRpZXMgZm9yIHNwZWNpZmllZCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSBlbGVtZW50IC0gRE9NIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gcHJvcGVydGllcyAtIENTUyBwcm9wZXJ0aWVzIHRoYXQgd2lsbCBiZSBhZGRlZC9yZW1vdmVkIGZyb20gc3BlY2lmaWVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBjc3MoZWxlbWVudDogSFRNTEVsZW1lbnQsIHByb3BlcnRpZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgICBmb3IgKGxldCBwcm9wZXJ0eSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KHByb3BlcnR5KSkge1xuICAgICAgICAgIGVsZW1lbnQuc3R5bGVbcHJvcGVydHkgYXMgYW55XSA9IHByb3BlcnRpZXNbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHdpbmRvdyBzY3JvbGwgcG9zaXRpb24uXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICogQHJldHVybiBOdW1iZXIgLSBzY3JvbGwgcG9zaXRpb25cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFNjcm9sbFRvcFBvc2l0aW9uKCk6IG51bWJlciB7XG4gICAgICByZXR1cm4gKHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCkgIC0gKGRvY3VtZW50LmJvZHkuY2xpZW50VG9wIHx8IDApIHx8IDBcbiAgICB9XG4gIH0iXX0=
