(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = global.document ?
            factory(global, true) :
            function (w) {
                if (!w.document) {
                    throw new Error("jQuery requires a window with a document");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

    // Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function (window, noGlobal) {
    var elements;
    var document = window.document;
    var jSozi = function (selector) {
        return new jSozi.fn.init(selector);
    };

    jSozi.fn = jSozi.prototype = {
        context: window.document,
        elements: null,
        selector: null,
        length: null,
        init: function (selector) {
            var elements = window.document.querySelectorAll(selector);
            this.selector = selector;
            this.elements = window.document.querySelectorAll(selector);
            this.element = window.document.querySelector(selector);
            this.length = this.elements.length;
            this.__proto__ = {
                eq: function (n) {
                    this.elements = [this.elements[n]];
                    this.length = 1;
                    return this;
                },
                parent: function () {

                    this.elements = [this.elements[0].parentElement];
                    this.length = 1;
                    return this;
                },
                simulateEvent: function (eventName) {
                    var eventMatchers = {
                        'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
                        'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
                    };
                    var defaultOptions = {
                        pointerX: 0,
                        pointerY: 0,
                        button: 0,
                        ctrlKey: false,
                        altKey: false,
                        shiftKey: false,
                        metaKey: false,
                        bubbles: true,
                        cancelable: true
                    };

                    var options = this.extend(defaultOptions, arguments[2] || {});
                    var oEvent, eventType = null;
                    for (var name in eventMatchers) {
                        if (eventMatchers[name].test(eventName)) {
                            eventType = name;
                            break;
                        }
                    }

                    if (!eventType)
                        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

                    if (typeof (this.elements[0]) != "undefined") {
                        if (document.createEvent) {
                            oEvent = document.createEvent(eventType);
                            if (eventType == 'HTMLEvents') {
                                oEvent.initEvent(eventName, options.bubbles, options.cancelable);
                            } else {
                                oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                                    options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
                                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, this.elements[0]);
                            }
                            this.elements[0].dispatchEvent(oEvent);
                        } else {
                            options.clientX = options.pointerX;
                            options.clientY = options.pointerY;
                            var evt = document.createEventObject();
                            oEvent = this.extend(evt, options);
                            this.elements[0].fireEvent('on' + eventName, oEvent);
                        }

                    }

                    return this;


                },
                extend: function (destination, source) {
                    for (var property in source)
                        destination[property] = source[property];
                    return destination;
                },
                click: function () {
                    this.simulateEvent('mouseover');
                    this.simulateEvent('mousedown');
                    this.simulateEvent('mouseup');
                    this.simulateEvent('click');
                    this.simulateEvent('mouseout');
                    return this;
                },
                InsertChar: function (c) {
                    try {
                        c = c.replace(/([^{])\n/g, '$1{enter}');
                        bililiteRange(this.element).bounds('selection').sendkeys(c).select();
                    } catch (e) {
                        console.log(e);
                    }
                },
                TimeOutPress: function (c, timeout) {
                    var el = this;
                    setTimeout(function () {
                        el.InsertChar(c);
                    }, timeout);
                },
                PressString: function (str) {
                    try{
                        if(this.element.getAttribute("type")=="email")
                            this.element.setAttribute("type","text")
                    } catch (e) {
                        console.log(e);
                    }
                    var el = this;
                    var i = 0;
                    for (var i = 0; i < str.length; i++) {
                        // console.log(str[i]);
                        el.TimeOutPress(str[i], i * 25);
                        this.element.focus();
                    }
                    return this;
                },
                SetValue: function(str){
                    this.element.value = str;
                    return this;
                }
            };
        }
    }

    window.jSozi = jSozi;
    return jSozi;
}));



