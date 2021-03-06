/*
 Tomloprod Modal 1.0.0
 
 The MIT License (MIT)
 
 Copyright (c) 2015 by Tomás López.
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

var TomloprodModal = (function () {
    "use strict";
    var closeButton = null,
            closeOnEsc = true,
            draggable = true,
            closeOnOverlay = false,
            handlers = {},
            showMessages = false,
            cssAvoidSelection = ".tm-avoidSelection{-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;}";
    /**
     * Adds the value to the specified property to a set of elements.
     * @param {Objects[]} els
     * @param {String} propiedad
     * @param {String} valor
     */
    function addPropertyValueFromClasses(els, propiedad, valor) {
        [].forEach.call(els, function (el) {
            el.style[propiedad] = valor;
        });
    }
    /**
     * Add css block to the head.
     * @param {String} css
     */
    function addCSS(css) {
        var head = document.head || document.getElementsByTagName('head')[0], style_Block = document.createElement('style');
        style_Block.type = 'text/css';
        if (style_Block.styleSheet) {
            style_Block.styleSheet.cssText = css;
        } else {
            style_Block.appendChild(document.createTextNode(css));
        }
        head.appendChild(style_Block);
    }
    /**
     * Checks whether the element contains the specified class.
     * @param {Event.target} event
     * @param {String} className
     * @returns {Boolean}
     */
    function hasClass(event, className) {
        if (event.classList) {
            return event.classList.contains(className);
        }
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(event.className);
    }
    /**
     * Add a class to the element indicated.
     * @param {Event.target} event
     * @param {String} className
     */
    function addClass(event, className) {
        if (event.classList) {
            event.classList.add(className);
        } else {
            event.className += ' ' + className;
        }
    }

    /**
     * Return the position of the element indicated into array.
     * @param {Array} array
     * @param {String} item
     * @returns {Number}
     */
    function indexOf(array, item) {
        var conta = 0, len = array.length;
        for (conta = 0; conta < len; conta += 1) {
            if (array[conta].toString() === item.toString()) {
                return conta;
            }
        }
        return -1;
    }
    /**
     * Deletes the class indicated on the item indicated.
     * @param {event.target} event
     * @param {String} className
     */
    function removeClass(event, className) {
        if (event.classList) {
            event.classList.remove(className);
        } else {
            event.className = event.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }
    /**
     * Move the modal window to the positions indicated.
     * @param {Object} modal
     * @param {Number} coordX
     * @param {Number} coordY
     */
    function move(modal, coordX, coordY) {
        modal.style.left = coordX + 'px';
        modal.style.top = coordY + 'px';

        if (showMessages) {
            console.info("TomloprodModal: Dragging. Coord X: " + coordX + 'px | Coord Y: ' + coordY + 'px');
        }
    }

    function getKey(event) {
        event = event || window.event;
        //////////// Esc
        if (event.keyCode === 27) {
            TomloprodModal.closeModal();
        }
    }

    return {
        modal: [],
        isOpen: false,
        openModal: function (isModal) {
            if (TomloprodModal.isOpen) {
                TomloprodModal.closeModal();
            }
            TomloprodModal.modal = document.getElementById(isModal);
            if (TomloprodModal.modal) {
                if (draggable && hasClass(TomloprodModal.modal, "tm-draggable")) {
                    TomloprodModal.modal.setAttribute('onmousedown', 'TomloprodModal.startDragging(this,event);');
                    TomloprodModal.modal.setAttribute('onmouseup', 'TomloprodModal.stopDragging(this);');
                }
                addClass(TomloprodModal.modal, 'tm-showModal');
                closeButton = TomloprodModal.modal.querySelector('.tm-closeButton');
                closeButton.addEventListener('click', TomloprodModal.closeModal, false);
                if (closeOnOverlay) {
                    document.querySelector(".tm-overlay").addEventListener('click', TomloprodModal.closeModal, false);
                }
                if (closeOnEsc) {
                    document.onkeyup = getKey;
                }
                TomloprodModal.isOpen = true;
                TomloprodModal.fire('opened');
            } else if (showMessages) {
                console.error("TomloprodModal: Cannot find the indicated modal window.");
            }
        },
        registerHandler: function (event, callback) {
            var added = true;
            if (handlers[event]) {
                if (indexOf(handlers[event], callback) === -1) {
                    handlers[event].push(callback);
                } else {
                    added = false;
                    console.error("TomloprodModal: The event ''" + event + "'' already contain one handler with the next function:\n\n " + callback);
                }
            } else {
                handlers[event] = [callback];
            }
            if (showMessages && added) {
                console.info("TomloprodModal: There are one new handler registered to the event ''" + event + "'':\n\n " + callback + ". \n\nTotal handlers of ''" + event + "'' event: " + handlers[event].length);
            }
        },
        removeHandler: function (event, callback) {
            if (handlers[event]) {
                callback = callback || false;

                if (callback) {
                    var i = indexOf(handlers[event], callback);
                    if (i > -1) {
                        handlers[event].splice(i, 1);
                    } else {
                        return false;
                    }
                    if (showMessages) {
                        console.info("TomloprodModal: The handlers with the name ''" + event + "'' have been deleted successfully. (" + callback + ")");
                    }
                    return true;
                }
                delete handlers[event];
                if (showMessages) {
                    console.info("TomloprodModal: The handler ''" + event + "'' has been deleted successfully. (" + callback + ")");
                }
            } else {
                return false;
            }
        },
        fire: function (event) {
            if (!handlers[event]) {
                if (showMessages) {
                    console.info("TomloprodModal: There aren't any handlers registered with that name.");
                }
                return false;
            }
            var i;
            for (i = 0; i < handlers[event].length; i += 1) {
                handlers[event][i].apply(window, Array.prototype.slice.call(arguments, 1));
            }
        },
        start: function (params) {
            addCSS(cssAvoidSelection);
            var configOption = null;
            if (params !== undefined) {
                for (configOption in params) {
                    if (params[configOption] !== undefined) {
                        switch (configOption) {
                            case "draggable":
                                draggable = params[configOption];
                                break;
                            case "bgColor":
                                addPropertyValueFromClasses(document.getElementsByClassName("tm-wrapper"), "backgroundColor", params[configOption]);
                                break;
                            case "borderRadius":
                                addPropertyValueFromClasses(document.getElementsByClassName("tm-wrapper"), "-webkit-border-radius", params[configOption]);
                                addPropertyValueFromClasses(document.getElementsByClassName("tm-wrapper"), "-moz-border-radius", params[configOption]);
                                addPropertyValueFromClasses(document.getElementsByClassName("tm-wrapper"), "border-radius", params[configOption]);
                                break;
                            case "textColor":
                                addPropertyValueFromClasses(document.getElementsByClassName("tm-content"), "color", params[configOption]);
                                addPropertyValueFromClasses(document.getElementsByClassName("tm-wrapper"), "color", params[configOption]);
                                break;
                            case "closeOnOverlay":
                                closeOnOverlay = params[configOption];
                                break;
                            case "overlayColor":
                                document.querySelector(".tm-overlay").style.backgroundColor = params[configOption];
                                break;
                            case "removeOverlay":
                                if (params[configOption]) {
                                    document.querySelector(".tm-overlay").parentNode.removeChild(document.querySelector(".tm-overlay"));
                                }
                                break;
                            case "showMessages":
                                showMessages = params[configOption];
                                break;
                            case "closeOnEsc":
                                closeOnEsc = params[configOption];
                                break;
                            case "idMainContainer":
                                addClass(document.getElementById(params[configOption]), "tm-MainContainer");
                                break;
                        }
                    }
                }
            }
            document.onclick = function (event) {
                event = event || window.event;
                if (hasClass(event.target, 'tm-trigger')) {
                    TomloprodModal.openModal(event.target.getAttribute('data-tm-modal'));
                    event.preventDefault();
                }
            };
            var aHrefs = document.getElementsByTagName("A");
            for (var x = 0; x < aHrefs.length; x++) {
                var el = aHrefs[x];
                if (hasClass(el, 'tm-trigger')) {
                  el.onclick = function (event) {
                      event = event || window.event;
                      TomloprodModal.openModal(this.getAttribute('data-tm-modal'));
                      event.preventDefault();
                  };
                }
            }
        },
        stop: function () {
            document.onclick = null;
            var aHrefs = document.getElementsByTagName("A");
            for (var x = 0; x < aHrefs.length; x++) {
                var el = aHrefs[x];
                el.onclick = null;
            }
        },
        closeModal: function (event) {
            if (event !== undefined) {
                event.stopPropagation();
            }
            removeClass(TomloprodModal.modal, 'tm-showModal');
            closeButton.removeEventListener('click', TomloprodModal.closeModal, false);
            var inputs_Text = TomloprodModal.modal.querySelectorAll('.tm-emptyOnClose'), conta = 0;
            for (conta = 0; conta < inputs_Text.length; conta += 1) {
                if (inputs_Text[conta].tagName === "INPUT") {
                    inputs_Text[conta].value = "";
                } else {
                    inputs_Text[conta].innerHTML = "";
                }
            }

            TomloprodModal.isOpen = false;
            TomloprodModal.fire("closed");
        },
        /** DRAG METHODS **/
        /**
         * Starts the dragging of modal window.
         * @param {Object} modal
         * @param {Event} event
         */
        startDragging: function (modal, event) {
            event = event || window.event;
            modal.style.cursor = 'move';
            var modalTop = modal.offsetTop,
                    modalLeft = modal.offsetLeft,
                    halfWidthModal = TomloprodModal.modal.offsetWidth / 2,
                    halfHeightModal = TomloprodModal.modal.offsetHeight / 2,
                    widthWindow = parseInt(window.innerWidth, 10),
                    heightWindow = parseInt(window.innerHeight, 10),
                    differenceX = event.clientX - modalLeft,
                    differenceY = event.clientY - modalTop;
            document.onmousemove = function (event) {
                event = event || window.event;
                // Drag end position
                var modalX = event.clientX - differenceX,
                        modalY = event.clientY - differenceY;

                // X Control
                if (modalX < halfWidthModal) {
                    modalX = halfWidthModal;
                }
                if (modalX + halfWidthModal > widthWindow) {
                    modalX = widthWindow - halfWidthModal;
                }
                // Y Control
                if (modalY < halfHeightModal) {
                    modalY = halfHeightModal;
                }
                if (modalY + halfHeightModal > heightWindow) {
                    modalY = heightWindow - halfHeightModal;
                }
                addClass(document.getElementsByTagName("body")[0], 'tm-avoidSelection');
                addClass(TomloprodModal.modal, 'tm-avoidSelection');
                move(modal, modalX, modalY);
            };
        },
        /**
         * Method called when stopped the dragging of the modal window.
         * @param {Object} modal
         */
        stopDragging: function (modal) {
            modal.style.cursor = 'default';
            removeClass(document.getElementsByTagName("body")[0], 'tm-avoidSelection');
            removeClass(TomloprodModal.modal, 'tm-avoidSelection');
            TomloprodModal.fire('stopDragging');
            document.onmousemove = function () {
            };
        }
    };
}());
