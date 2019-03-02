!function(root, factory) {
    "object" == typeof exports && "object" == typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define([], factory) : "object" == typeof exports ? exports.ReactDevToolsBackend = factory() : root.ReactDevToolsBackend = factory();
}(this, function() {
    return function(modules) {
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                exports: {},
                id: moduleId,
                loaded: !1
            };
            return modules[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
            module.loaded = !0, module.exports;
        }
        var installedModules = {};
        return __webpack_require__.m = modules, __webpack_require__.c = installedModules, 
        __webpack_require__.p = "", __webpack_require__(0);
    }([ function(module, exports, __webpack_require__) {
        "use strict";
        function connectToDevTools(options) {
            function scheduleRetry() {
                setTimeout(function() {
                    return connectToDevTools(options);
                }, 2e3);
            }
            function handleClose() {
                hasClosed || (hasClosed = !0, scheduleRetry(), closeListeners.forEach(function(fn) {
                    return fn();
                }));
            }
            function handleFailed() {
                hasClosed || (hasClosed = !0, closeListeners.forEach(function(fn) {
                    return fn();
                }));
            }
            function handleMessage(evt) {
                var data;
                try {
                    invariant("string" == typeof evt.data), data = JSON.parse(evt.data);
                } catch (e) {
                    return void console.error("failed to parse json: " + String(evt.data));
                }
                messageListeners.forEach(function(fn) {
                    try {
                        fn(data);
                    } catch (e) {
                        throw console.log(data), e;
                    }
                });
            }
            var _ref = options || {}, _ref$host = _ref.host, host = void 0 === _ref$host ? "localhost" : _ref$host, _ref$port = _ref.port, port = void 0 === _ref$port ? 8097 : _ref$port, websocket = _ref.websocket, _ref$resolveRNStyle = _ref.resolveRNStyle, resolveRNStyle = void 0 === _ref$resolveRNStyle ? null : _ref$resolveRNStyle, _ref$isAppActive = _ref.isAppActive, isAppActive = void 0 === _ref$isAppActive ? function() {
                return !0;
            } : _ref$isAppActive;
            if (!isAppActive()) return void scheduleRetry();
            var messageListeners = [], closeListeners = [], uri = "ws://" + host + ":" + port, ws = websocket ? websocket : new window.WebSocket(uri);
            ws.onclose = handleClose, ws.onerror = handleFailed, ws.onmessage = handleMessage, 
            ws.onopen = function() {
                var wall = {
                    listen: function(fn) {
                        messageListeners.push(fn);
                    },
                    onClose: function(fn) {
                        closeListeners.push(fn);
                    },
                    send: function(data) {
                        ws.send(JSON.stringify(data));
                    }
                };
                setupBackend(wall, resolveRNStyle);
            };
            var hasClosed = !1;
        }
        function setupBackend(wall, resolveRNStyle) {
            wall.onClose(function() {
                agent && agent.emit("shutdown"), window.__REACT_DEVTOOLS_GLOBAL_HOOK__.emit("shutdown"), 
                bridge = null, agent = null, console.log("closing devtools");
            });
            var bridge = new Bridge(wall), agent = new Agent(window, {
                rnStyle: !!resolveRNStyle,
                rnStyleMeasure: !!resolveRNStyle
            });
            agent.addBridge(bridge), resolveRNStyle && setupRNStyle(bridge, agent, resolveRNStyle), 
            setupProfiler(bridge, agent, window.__REACT_DEVTOOLS_GLOBAL_HOOK__), setupRelay(bridge, agent, window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
            var _connectTimeout = setTimeout(function() {
                console.warn("react-devtools agent got no connection");
            }, 2e4);
            agent.once("connected", function() {
                agent && (inject(window.__REACT_DEVTOOLS_GLOBAL_HOOK__, agent), clearTimeout(_connectTimeout));
            }), ProfileCollector.init(agent);
        }
        var Agent = __webpack_require__(1), Bridge = __webpack_require__(7), ProfileCollector = __webpack_require__(32), installGlobalHook = __webpack_require__(33), installRelayHook = __webpack_require__(34), inject = __webpack_require__(35), invariant = __webpack_require__(47), setupRNStyle = __webpack_require__(51), setupProfiler = __webpack_require__(53), setupRelay = __webpack_require__(54);
        installGlobalHook(window), installRelayHook(window), window.document && window.__REACT_DEVTOOLS_GLOBAL_HOOK__.on("react-devtools", function(agent) {
            var setupHighlighter = __webpack_require__(55);
            setupHighlighter(agent);
        }), module.exports = {
            connectToDevTools: connectToDevTools
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
        }
        function _possibleConstructorReturn(self, call) {
            if (!self) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return !call || "object" != typeof call && "function" != typeof call ? self : call;
        }
        function _inherits(subClass, superClass) {
            if ("function" != typeof superClass && null !== superClass) throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            }), superClass && (Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass);
        }
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                    "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
                Constructor;
            };
        }(), _require = __webpack_require__(2), EventEmitter = _require.EventEmitter, assign = __webpack_require__(3), nullthrows = __webpack_require__(4)["default"], guid = __webpack_require__(5), getIn = __webpack_require__(6), Agent = function(_EventEmitter) {
            function Agent(global, capabilities) {
                _classCallCheck(this, Agent);
                var _this = _possibleConstructorReturn(this, (Agent.__proto__ || Object.getPrototypeOf(Agent)).call(this));
                _this.global = global, _this.internalInstancesById = new Map(), _this.idsByInternalInstances = new WeakMap(), 
                _this.renderers = new Map(), _this.elementData = new Map(), _this.roots = new Set(), 
                _this.reactInternals = {};
                var lastSelected;
                _this.on("selected", function(id) {
                    var data = _this.elementData.get(id);
                    data && data.publicInstance && _this.global.$r === lastSelected && (_this.global.$r = data.publicInstance, 
                    lastSelected = data.publicInstance);
                }), _this._prevSelected = null, _this._scrollUpdate = !1;
                var isReactDOM = window.document && "function" == typeof window.document.createElement;
                return _this.capabilities = assign({
                    scroll: isReactDOM && "function" == typeof window.document.body.scrollIntoView,
                    dom: isReactDOM,
                    editTextContent: !1
                }, capabilities), isReactDOM && (_this._updateScroll = _this._updateScroll.bind(_this), 
                window.addEventListener("scroll", _this._onScroll.bind(_this), !0), window.addEventListener("click", _this._onClick.bind(_this), !0), 
                window.addEventListener("mouseover", _this._onMouseOver.bind(_this), !0), window.addEventListener("resize", _this._onResize.bind(_this), !0)), 
                _this;
            }
            return _inherits(Agent, _EventEmitter), _createClass(Agent, [ {
                key: "sub",
                value: function(ev, fn) {
                    var _this2 = this;
                    return this.on(ev, fn), function() {
                        _this2.removeListener(ev, fn);
                    };
                }
            }, {
                key: "setReactInternals",
                value: function(renderer, reactInternals) {
                    this.reactInternals[renderer] = reactInternals;
                }
            }, {
                key: "addBridge",
                value: function(bridge) {
                    var _this3 = this;
                    bridge.on("requestCapabilities", function() {
                        bridge.send("capabilities", _this3.capabilities), _this3.emit("connected");
                    }), bridge.on("setState", this._setState.bind(this)), bridge.on("setProps", this._setProps.bind(this)), 
                    bridge.on("setContext", this._setContext.bind(this)), bridge.on("makeGlobal", this._makeGlobal.bind(this)), 
                    bridge.on("highlight", function(id) {
                        return _this3.highlight(id);
                    }), bridge.on("highlightMany", function(id) {
                        return _this3.highlightMany(id);
                    }), bridge.on("hideHighlight", function() {
                        return _this3.emit("hideHighlight");
                    }), bridge.on("startInspecting", function() {
                        return _this3.emit("startInspecting");
                    }), bridge.on("stopInspecting", function() {
                        return _this3.emit("stopInspecting");
                    }), bridge.on("selected", function(id) {
                        return _this3.emit("selected", id);
                    }), bridge.on("isRecording", function(isRecording) {
                        return _this3.emit("isRecording", isRecording);
                    }), bridge.on("setInspectEnabled", function(enabled) {
                        _this3._inspectEnabled = enabled, _this3.emit("stopInspecting");
                    }), bridge.on("shutdown", function() {
                        return _this3.emit("shutdown");
                    }), bridge.on("changeTextContent", function(_ref) {
                        var id = _ref.id, text = _ref.text, node = _this3.getNodeForID(id);
                        node && (node.textContent = text);
                    }), bridge.on("putSelectedNode", function(id) {
                        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$node = _this3.getNodeForID(id);
                    }), bridge.on("putSelectedInstance", function(id) {
                        var node = _this3.elementData.get(id);
                        node ? window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$type = node.type : window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$type = null, 
                        node && node.publicInstance ? window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$inst = node.publicInstance : window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$inst = null;
                    }), bridge.on("checkSelection", function() {
                        var newSelected = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0;
                        if (newSelected !== _this3._prevSelected) {
                            _this3._prevSelected = newSelected;
                            var sentSelected = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$node;
                            newSelected !== sentSelected && _this3.selectFromDOMNode(newSelected, !0);
                        }
                    }), bridge.on("scrollToNode", function(id) {
                        return _this3.scrollToNode(id);
                    }), bridge.on("traceupdatesstatechange", function(value) {
                        return _this3.emit("traceupdatesstatechange", value);
                    }), bridge.on("colorizerchange", function(value) {
                        return _this3.emit("colorizerchange", value);
                    }), this.on("root", function(id) {
                        return bridge.send("root", id);
                    }), this.on("mount", function(data) {
                        return bridge.send("mount", data);
                    }), this.on("update", function(data) {
                        return bridge.send("update", data);
                    }), this.on("updateProfileTimes", function(data) {
                        return bridge.send("updateProfileTimes", data);
                    }), this.on("unmount", function(id) {
                        bridge.send("unmount", id), bridge.forget(id);
                    }), this.on("setSelection", function(data) {
                        return bridge.send("select", data);
                    }), this.on("setInspectEnabled", function(data) {
                        return bridge.send("setInspectEnabled", data);
                    }), this.on("isRecording", function(isRecording) {
                        return bridge.send("isRecording", isRecording);
                    }), this.on("storeSnapshot", function(data) {
                        return bridge.send("storeSnapshot", data);
                    }), this.on("clearSnapshots", function() {
                        return bridge.send("clearSnapshots");
                    });
                }
            }, {
                key: "scrollToNode",
                value: function(id) {
                    var node = this.getNodeForID(id);
                    if (!node) return void console.warn("unable to get the node for scrolling");
                    var domElement = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
                    return domElement ? ("function" == typeof domElement.scrollIntoViewIfNeeded ? domElement.scrollIntoViewIfNeeded() : "function" == typeof domElement.scrollIntoView && domElement.scrollIntoView(), 
                    void this.highlight(id)) : void console.warn("unable to get the domElement for scrolling");
                }
            }, {
                key: "highlight",
                value: function(id) {
                    var data = this.elementData.get(id), node = this.getNodeForID(id);
                    data && node && this.emit("highlight", {
                        node: node,
                        name: data.name,
                        props: data.props
                    });
                }
            }, {
                key: "highlightMany",
                value: function(ids) {
                    var _this4 = this, nodes = [];
                    ids.forEach(function(id) {
                        var node = _this4.getNodeForID(id);
                        node && nodes.push(node);
                    }), nodes.length && this.emit("highlightMany", nodes);
                }
            }, {
                key: "getNodeForID",
                value: function(id) {
                    var component = this.internalInstancesById.get(id);
                    if (!component) return null;
                    var renderer = this.renderers.get(id);
                    return renderer && this.reactInternals[renderer].getNativeFromReactElement ? this.reactInternals[renderer].getNativeFromReactElement(component) : null;
                }
            }, {
                key: "selectFromDOMNode",
                value: function(node, quiet) {
                    var offsetFromLeaf = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 0, id = this.getIDForNode(node);
                    id && this.emit("setSelection", {
                        id: id,
                        quiet: quiet,
                        offsetFromLeaf: offsetFromLeaf
                    });
                }
            }, {
                key: "selectFromReactInstance",
                value: function(instance, quiet) {
                    var id = this.getId(instance);
                    return id ? void this.emit("setSelection", {
                        id: id,
                        quiet: quiet
                    }) : void console.log("no instance id", instance);
                }
            }, {
                key: "getIDForNode",
                value: function(node) {
                    if (!this.reactInternals) return null;
                    var component;
                    for (var renderer in this.reactInternals) {
                        try {
                            component = this.reactInternals[renderer].getReactElementFromNative(node);
                        } catch (e) {}
                        if (component) return this.getId(component);
                    }
                    return null;
                }
            }, {
                key: "_setProps",
                value: function(_ref2) {
                    var id = _ref2.id, path = _ref2.path, value = _ref2.value, data = this.elementData.get(id);
                    data && data.updater && "function" == typeof data.updater.setInProps ? data.updater.setInProps(path, value) : console.warn("trying to set props on a component that doesn't support it");
                }
            }, {
                key: "_setState",
                value: function(_ref3) {
                    var id = _ref3.id, path = _ref3.path, value = _ref3.value, data = this.elementData.get(id);
                    data && data.updater && "function" == typeof data.updater.setInState ? data.updater.setInState(path, value) : console.warn("trying to set state on a component that doesn't support it");
                }
            }, {
                key: "_setContext",
                value: function(_ref4) {
                    var id = _ref4.id, path = _ref4.path, value = _ref4.value, data = this.elementData.get(id);
                    data && data.updater && "function" == typeof data.updater.setInContext ? data.updater.setInContext(path, value) : console.warn("trying to set context on a component that doesn't support it");
                }
            }, {
                key: "_makeGlobal",
                value: function(_ref5) {
                    var id = _ref5.id, path = _ref5.path, data = this.elementData.get(id);
                    if (data) {
                        var value;
                        value = "instance" === path ? data.publicInstance : getIn(data, path), this.global.$tmp = value, 
                        console.log("$tmp =", value);
                    }
                }
            }, {
                key: "getId",
                value: function(internalInstance) {
                    return "object" === ("undefined" == typeof internalInstance ? "undefined" : _typeof(internalInstance)) && internalInstance ? (this.idsByInternalInstances.has(internalInstance) || (this.idsByInternalInstances.set(internalInstance, guid()), 
                    this.internalInstancesById.set(nullthrows(this.idsByInternalInstances.get(internalInstance)), internalInstance)), 
                    nullthrows(this.idsByInternalInstances.get(internalInstance))) : internalInstance;
                }
            }, {
                key: "addRoot",
                value: function(renderer, internalInstance) {
                    var id = this.getId(internalInstance);
                    this.roots.add(id), this.emit("root", id);
                }
            }, {
                key: "rootCommitted",
                value: function(renderer, internalInstance, data) {
                    var id = this.getId(internalInstance);
                    this.emit("rootCommitted", id, internalInstance, data);
                }
            }, {
                key: "onMounted",
                value: function(renderer, component, data) {
                    var _this5 = this, id = this.getId(component);
                    this.renderers.set(id, renderer), this.elementData.set(id, data);
                    var send = assign({}, data);
                    send.children && send.children.map && (send.children = send.children.map(function(c) {
                        return _this5.getId(c);
                    })), send.id = id, send.canUpdate = send.updater && !!send.updater.forceUpdate, 
                    delete send.type, delete send.updater, this.emit("mount", send);
                }
            }, {
                key: "onUpdated",
                value: function(component, data) {
                    var _this6 = this, id = this.getId(component);
                    this.elementData.set(id, data);
                    var send = assign({}, data);
                    send.children && send.children.map && (send.children = send.children.map(function(c) {
                        return _this6.getId(c);
                    })), send.id = id, send.canUpdate = send.updater && !!send.updater.forceUpdate, 
                    delete send.type, delete send.updater, this.emit("update", send);
                }
            }, {
                key: "onUpdatedProfileTimes",
                value: function(component, data) {
                    var _this7 = this, id = this.getId(component);
                    this.elementData.set(id, data);
                    var send = assign({}, data);
                    send.children && send.children.map && (send.children = send.children.map(function(c) {
                        return _this7.getId(c);
                    })), send.id = id, send.canUpdate = send.updater && !!send.updater.forceUpdate, 
                    delete send.type, delete send.updater, this.emit("updateProfileTimes", send);
                }
            }, {
                key: "onUnmounted",
                value: function(component) {
                    var id = this.getId(component);
                    this.elementData["delete"](id), this.roots.has(id) && (this.roots["delete"](id), 
                    this.emit("rootUnmounted", id)), this.renderers["delete"](id), this.emit("unmount", id), 
                    this.idsByInternalInstances["delete"](component);
                }
            }, {
                key: "_onScroll",
                value: function() {
                    this._scrollUpdate || (this._scrollUpdate = !0, window.requestAnimationFrame(this._updateScroll));
                }
            }, {
                key: "_updateScroll",
                value: function() {
                    this.emit("refreshMultiOverlay"), this.emit("stopInspecting"), this._scrollUpdate = !1;
                }
            }, {
                key: "_onClick",
                value: function(event) {
                    if (this._inspectEnabled) {
                        var id = this.getIDForNode(event.target);
                        id && (event.stopPropagation(), event.preventDefault(), this.emit("setSelection", {
                            id: id
                        }), this.emit("setInspectEnabled", !1));
                    }
                }
            }, {
                key: "_onMouseOver",
                value: function(event) {
                    if (this._inspectEnabled) {
                        var id = this.getIDForNode(event.target);
                        if (!id) return;
                        this.highlight(id);
                    }
                }
            }, {
                key: "_onResize",
                value: function(event) {
                    this.emit("stopInspecting");
                }
            } ]), Agent;
        }(EventEmitter);
        module.exports = Agent;
    }, function(module, exports) {
        function EventEmitter() {
            this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0;
        }
        function isFunction(arg) {
            return "function" == typeof arg;
        }
        function isNumber(arg) {
            return "number" == typeof arg;
        }
        function isObject(arg) {
            return "object" == typeof arg && null !== arg;
        }
        function isUndefined(arg) {
            return void 0 === arg;
        }
        module.exports = EventEmitter, EventEmitter.EventEmitter = EventEmitter, EventEmitter.prototype._events = void 0, 
        EventEmitter.prototype._maxListeners = void 0, EventEmitter.defaultMaxListeners = 10, 
        EventEmitter.prototype.setMaxListeners = function(n) {
            if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError("n must be a positive number");
            return this._maxListeners = n, this;
        }, EventEmitter.prototype.emit = function(type) {
            var er, handler, len, args, i, listeners;
            if (this._events || (this._events = {}), "error" === type && (!this._events.error || isObject(this._events.error) && !this._events.error.length)) {
                if (er = arguments[1], er instanceof Error) throw er;
                var err = new Error('Uncaught, unspecified "error" event. (' + er + ")");
                throw err.context = er, err;
            }
            if (handler = this._events[type], isUndefined(handler)) return !1;
            if (isFunction(handler)) switch (arguments.length) {
              case 1:
                handler.call(this);
                break;

              case 2:
                handler.call(this, arguments[1]);
                break;

              case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;

              default:
                args = Array.prototype.slice.call(arguments, 1), handler.apply(this, args);
            } else if (isObject(handler)) for (args = Array.prototype.slice.call(arguments, 1), 
            listeners = handler.slice(), len = listeners.length, i = 0; i < len; i++) listeners[i].apply(this, args);
            return !0;
        }, EventEmitter.prototype.addListener = function(type, listener) {
            var m;
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", type, isFunction(listener.listener) ? listener.listener : listener), 
            this._events[type] ? isObject(this._events[type]) ? this._events[type].push(listener) : this._events[type] = [ this._events[type], listener ] : this._events[type] = listener, 
            isObject(this._events[type]) && !this._events[type].warned && (m = isUndefined(this._maxListeners) ? EventEmitter.defaultMaxListeners : this._maxListeners, 
            m && m > 0 && this._events[type].length > m && (this._events[type].warned = !0, 
            console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[type].length), 
            "function" == typeof console.trace && console.trace())), this;
        }, EventEmitter.prototype.on = EventEmitter.prototype.addListener, EventEmitter.prototype.once = function(type, listener) {
            function g() {
                this.removeListener(type, g), fired || (fired = !0, listener.apply(this, arguments));
            }
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            var fired = !1;
            return g.listener = listener, this.on(type, g), this;
        }, EventEmitter.prototype.removeListener = function(type, listener) {
            var list, position, length, i;
            if (!isFunction(listener)) throw TypeError("listener must be a function");
            if (!this._events || !this._events[type]) return this;
            if (list = this._events[type], length = list.length, position = -1, list === listener || isFunction(list.listener) && list.listener === listener) delete this._events[type], 
            this._events.removeListener && this.emit("removeListener", type, listener); else if (isObject(list)) {
                for (i = length; i-- > 0; ) if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                    position = i;
                    break;
                }
                if (position < 0) return this;
                1 === list.length ? (list.length = 0, delete this._events[type]) : list.splice(position, 1), 
                this._events.removeListener && this.emit("removeListener", type, listener);
            }
            return this;
        }, EventEmitter.prototype.removeAllListeners = function(type) {
            var key, listeners;
            if (!this._events) return this;
            if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[type] && delete this._events[type], 
            this;
            if (0 === arguments.length) {
                for (key in this._events) "removeListener" !== key && this.removeAllListeners(key);
                return this.removeAllListeners("removeListener"), this._events = {}, this;
            }
            if (listeners = this._events[type], isFunction(listeners)) this.removeListener(type, listeners); else if (listeners) for (;listeners.length; ) this.removeListener(type, listeners[listeners.length - 1]);
            return delete this._events[type], this;
        }, EventEmitter.prototype.listeners = function(type) {
            var ret;
            return ret = this._events && this._events[type] ? isFunction(this._events[type]) ? [ this._events[type] ] : this._events[type].slice() : [];
        }, EventEmitter.prototype.listenerCount = function(type) {
            if (this._events) {
                var evlistener = this._events[type];
                if (isFunction(evlistener)) return 1;
                if (evlistener) return evlistener.length;
            }
            return 0;
        }, EventEmitter.listenerCount = function(emitter, type) {
            return emitter.listenerCount(type);
        };
    }, function(module, exports) {
        "use strict";
        function toObject(val) {
            if (null === val || void 0 === val) throw new TypeError("Object.assign cannot be called with null or undefined");
            return Object(val);
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty, propIsEnumerable = Object.prototype.propertyIsEnumerable;
        module.exports = Object.assign || function(target, source) {
            for (var from, symbols, to = toObject(target), s = 1; s < arguments.length; s++) {
                from = Object(arguments[s]);
                for (var key in from) hasOwnProperty.call(from, key) && (to[key] = from[key]);
                if (Object.getOwnPropertySymbols) {
                    symbols = Object.getOwnPropertySymbols(from);
                    for (var i = 0; i < symbols.length; i++) propIsEnumerable.call(from, symbols[i]) && (to[symbols[i]] = from[symbols[i]]);
                }
            }
            return to;
        };
    }, function(module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports["default"] = function(x) {
            if (null != x) return x;
            throw new Error("Got unexpected null or undefined");
        };
    }, function(module, exports) {
        "use strict";
        function guid() {
            return "g" + Math.random().toString(16).substr(2);
        }
        module.exports = guid;
    }, function(module, exports) {
        "use strict";
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                return arr2;
            }
            return Array.from(arr);
        }
        function getIn(base, path) {
            return path.reduce(function(obj, attr) {
                if (obj) {
                    if (hasOwnProperty.call(obj, attr)) return obj[attr];
                    if ("function" == typeof obj[Symbol.iterator]) return [].concat(_toConsumableArray(obj))[attr];
                }
                return null;
            }, base);
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        module.exports = getIn;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function _toConsumableArray(arr) {
            if (Array.isArray(arr)) {
                for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                return arr2;
            }
            return Array.from(arr);
        }
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
        }
        function getWindowFunction(name, polyfill) {
            return String(window[name]).indexOf("[native code]") === -1 ? polyfill : window[name];
        }
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        }, _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                    "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
                Constructor;
            };
        }(), consts = __webpack_require__(8), hydrate = __webpack_require__(27), dehydrate = __webpack_require__(28), getIn = __webpack_require__(6), performanceNow = __webpack_require__(29), lastRunTimeMS = 5, cancelIdleCallback = getWindowFunction("cancelIdleCallback", clearTimeout), requestIdleCallback = getWindowFunction("requestIdleCallback", function(cb, options) {
            var delayMS = 3e3 * lastRunTimeMS;
            return delayMS > 500 && (delayMS = 500), setTimeout(function() {
                var startTime = performanceNow();
                cb({
                    didTimeout: !1,
                    timeRemaining: function() {
                        return 1 / 0;
                    }
                });
                var endTime = performanceNow();
                lastRunTimeMS = (endTime - startTime) / 1e3;
            }, delayMS);
        }), Bridge = function() {
            function Bridge(wall) {
                _classCallCheck(this, Bridge), this._cbs = new Map(), this._inspectables = new Map(), 
                this._cid = 0, this._listeners = {}, this._buffer = [], this._flushHandle = null, 
                this._callers = {}, this._paused = !1, this._wall = wall, wall.listen(this._handleMessage.bind(this));
            }
            return _createClass(Bridge, [ {
                key: "inspect",
                value: function(id, path, cb) {
                    var _cid = this._cid++;
                    this._cbs.set(_cid, function(data, cleaned, proto, protoclean) {
                        cleaned.length && hydrate(data, cleaned), proto && protoclean.length && hydrate(proto, protoclean), 
                        proto && (data[consts.proto] = proto), cb(data);
                    }), this._wall.send({
                        type: "inspect",
                        callback: _cid,
                        path: path,
                        id: id
                    });
                }
            }, {
                key: "call",
                value: function(name, args, cb) {
                    var _cid = this._cid++;
                    this._cbs.set(_cid, cb), this._wall.send({
                        type: "call",
                        callback: _cid,
                        args: args,
                        name: name
                    });
                }
            }, {
                key: "onCall",
                value: function(name, handler) {
                    if (this._callers[name]) throw new Error("only one call handler per call name allowed");
                    this._callers[name] = handler;
                }
            }, {
                key: "pause",
                value: function() {
                    this._wall.send({
                        type: "pause"
                    });
                }
            }, {
                key: "resume",
                value: function() {
                    this._wall.send({
                        type: "resume"
                    });
                }
            }, {
                key: "setInspectable",
                value: function(id, data) {
                    var prev = this._inspectables.get(id);
                    return prev ? void this._inspectables.set(id, _extends({}, prev, data)) : void this._inspectables.set(id, data);
                }
            }, {
                key: "send",
                value: function(evt, data) {
                    this._buffer.push({
                        evt: evt,
                        data: data
                    }), this.scheduleFlush();
                }
            }, {
                key: "scheduleFlush",
                value: function() {
                    if (!this._flushHandle && this._buffer.length) {
                        var timeout = this._paused ? 5e3 : 500;
                        this._flushHandle = requestIdleCallback(this.flushBufferWhileIdle.bind(this), {
                            timeout: timeout
                        });
                    }
                }
            }, {
                key: "cancelFlush",
                value: function() {
                    this._flushHandle && (cancelIdleCallback(this._flushHandle), this._flushHandle = null);
                }
            }, {
                key: "flushBufferWhileIdle",
                value: function(deadline) {
                    this._flushHandle = null;
                    for (var chunkCount = this._paused ? 20 : 10, chunkSize = Math.round(this._buffer.length / chunkCount), minChunkSize = this._paused ? 50 : 100; this._buffer.length && (deadline.timeRemaining() > 0 || deadline.didTimeout); ) {
                        var take = Math.min(this._buffer.length, Math.max(minChunkSize, chunkSize)), currentBuffer = this._buffer.splice(0, take);
                        this.flushBufferSlice(currentBuffer);
                    }
                    this._buffer.length && this.scheduleFlush();
                }
            }, {
                key: "flushBufferSlice",
                value: function(bufferSlice) {
                    var _this = this, events = bufferSlice.map(function(_ref) {
                        var evt = _ref.evt, data = _ref.data, cleaned = [], san = dehydrate(data, cleaned);
                        return cleaned.length && _this.setInspectable(data.id, data), {
                            type: "event",
                            evt: evt,
                            data: san,
                            cleaned: cleaned
                        };
                    });
                    this._wall.send({
                        type: "many-events",
                        events: events
                    });
                }
            }, {
                key: "forget",
                value: function(id) {
                    this._inspectables["delete"](id);
                }
            }, {
                key: "on",
                value: function(evt, fn) {
                    this._listeners[evt] ? this._listeners[evt].push(fn) : this._listeners[evt] = [ fn ];
                }
            }, {
                key: "off",
                value: function(evt, fn) {
                    if (this._listeners[evt]) {
                        var ix = this._listeners[evt].indexOf(fn);
                        ix !== -1 && this._listeners[evt].splice(ix, 1);
                    }
                }
            }, {
                key: "once",
                value: function(evt, fn) {
                    var self = this, listener = function listener() {
                        fn.apply(this, arguments), self.off(evt, listener);
                    };
                    this.on(evt, listener);
                }
            }, {
                key: "_handleMessage",
                value: function(payload) {
                    var _this2 = this;
                    if ("resume" === payload.type) return this._paused = !1, void this.scheduleFlush();
                    if ("pause" === payload.type) return this._paused = !0, void this.cancelFlush();
                    if ("callback" === payload.type) {
                        var callback = this._cbs.get(payload.id);
                        return void (callback && (callback.apply(void 0, _toConsumableArray(payload.args)), 
                        this._cbs["delete"](payload.id)));
                    }
                    if ("call" === payload.type) return void this._handleCall(payload.name, payload.args, payload.callback);
                    if ("inspect" === payload.type) return void this._inspectResponse(payload.id, payload.path, payload.callback);
                    if ("event" === payload.type) {
                        payload.cleaned && hydrate(payload.data, payload.cleaned);
                        var fns = this._listeners[payload.evt], data = payload.data;
                        fns && fns.forEach(function(fn) {
                            return fn(data);
                        });
                    }
                    "many-events" === payload.type && payload.events.forEach(function(event) {
                        event.cleaned && hydrate(event.data, event.cleaned);
                        var handlers = _this2._listeners[event.evt];
                        handlers && handlers.forEach(function(fn) {
                            return fn(event.data);
                        });
                    });
                }
            }, {
                key: "_handleCall",
                value: function(name, args, callback) {
                    if (!this._callers[name]) return void console.warn('unknown call: "' + name + '"');
                    args = Array.isArray(args) ? args : [ args ];
                    var result;
                    try {
                        result = this._callers[name].apply(null, args);
                    } catch (e) {
                        return void console.error("Failed to call", e);
                    }
                    this._wall.send({
                        type: "callback",
                        id: callback,
                        args: [ result ]
                    });
                }
            }, {
                key: "_inspectResponse",
                value: function(id, path, callback) {
                    var inspectable = this._inspectables.get(id), result = {}, cleaned = [], proto = null, protoclean = [];
                    if (inspectable) {
                        var val = getIn(inspectable, path), protod = !1, isFn = "function" == typeof val;
                        if (val && "function" == typeof val[Symbol.iterator]) {
                            var iterVal = Object.create({}), count = 0, _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
                            try {
                                for (var _step, _iterator = val[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                                    var entry = _step.value;
                                    if (count > 100) break;
                                    iterVal[count] = entry, count++;
                                }
                            } catch (err) {
                                _didIteratorError = !0, _iteratorError = err;
                            } finally {
                                try {
                                    !_iteratorNormalCompletion && _iterator["return"] && _iterator["return"]();
                                } finally {
                                    if (_didIteratorError) throw _iteratorError;
                                }
                            }
                            val = iterVal;
                        }
                        if (Object.getOwnPropertyNames(val).forEach(function(name) {
                            "__proto__" === name && (protod = !0), (!isFn || "arguments" !== name && "callee" !== name && "caller" !== name) && (result[name] = dehydrate(val[name], cleaned, [ name ]));
                        }), !protod && val.__proto__ && "Object" !== val.constructor.name) {
                            var newProto = {}, pIsFn = "function" == typeof val.__proto__;
                            Object.getOwnPropertyNames(val.__proto__).forEach(function(name) {
                                (!pIsFn || "arguments" !== name && "callee" !== name && "caller" !== name) && (newProto[name] = dehydrate(val.__proto__[name], protoclean, [ name ]));
                            }), proto = newProto;
                        }
                    }
                    this._wall.send({
                        type: "callback",
                        id: callback,
                        args: [ result, cleaned, proto, protoclean ]
                    });
                }
            } ]), Bridge;
        }();
        module.exports = Bridge;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var _Symbol = __webpack_require__(9);
        module.exports = {
            name: _Symbol("name"),
            type: _Symbol("type"),
            inspected: _Symbol("inspected"),
            meta: _Symbol("meta"),
            proto: _Symbol("proto")
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__(10)() ? Symbol : __webpack_require__(11);
    }, function(module, exports) {
        "use strict";
        module.exports = function() {
            var symbol;
            if ("function" != typeof Symbol) return !1;
            symbol = Symbol("test symbol");
            try {
                String(symbol);
            } catch (e) {
                return !1;
            }
            return "symbol" == typeof Symbol.iterator || "object" == typeof Symbol.isConcatSpreadable && ("object" == typeof Symbol.iterator && ("object" == typeof Symbol.toPrimitive && ("object" == typeof Symbol.toStringTag && "object" == typeof Symbol.unscopables)));
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var NativeSymbol, SymbolPolyfill, HiddenSymbol, d = __webpack_require__(12), validateSymbol = __webpack_require__(25), create = Object.create, defineProperties = Object.defineProperties, defineProperty = Object.defineProperty, objPrototype = Object.prototype, globalSymbols = create(null);
        "function" == typeof Symbol && (NativeSymbol = Symbol);
        var generateName = function() {
            var created = create(null);
            return function(desc) {
                for (var name, ie11BugWorkaround, postfix = 0; created[desc + (postfix || "")]; ) ++postfix;
                return desc += postfix || "", created[desc] = !0, name = "@@" + desc, defineProperty(objPrototype, name, d.gs(null, function(value) {
                    ie11BugWorkaround || (ie11BugWorkaround = !0, defineProperty(this, name, d(value)), 
                    ie11BugWorkaround = !1);
                })), name;
            };
        }();
        HiddenSymbol = function(description) {
            if (this instanceof HiddenSymbol) throw new TypeError("TypeError: Symbol is not a constructor");
            return SymbolPolyfill(description);
        }, module.exports = SymbolPolyfill = function Symbol(description) {
            var symbol;
            if (this instanceof Symbol) throw new TypeError("TypeError: Symbol is not a constructor");
            return symbol = create(HiddenSymbol.prototype), description = void 0 === description ? "" : String(description), 
            defineProperties(symbol, {
                __description__: d("", description),
                __name__: d("", generateName(description))
            });
        }, defineProperties(SymbolPolyfill, {
            "for": d(function(key) {
                return globalSymbols[key] ? globalSymbols[key] : globalSymbols[key] = SymbolPolyfill(String(key));
            }),
            keyFor: d(function(s) {
                var key;
                validateSymbol(s);
                for (key in globalSymbols) if (globalSymbols[key] === s) return key;
            }),
            hasInstance: d("", NativeSymbol && NativeSymbol.hasInstance || SymbolPolyfill("hasInstance")),
            isConcatSpreadable: d("", NativeSymbol && NativeSymbol.isConcatSpreadable || SymbolPolyfill("isConcatSpreadable")),
            iterator: d("", NativeSymbol && NativeSymbol.iterator || SymbolPolyfill("iterator")),
            match: d("", NativeSymbol && NativeSymbol.match || SymbolPolyfill("match")),
            replace: d("", NativeSymbol && NativeSymbol.replace || SymbolPolyfill("replace")),
            search: d("", NativeSymbol && NativeSymbol.search || SymbolPolyfill("search")),
            species: d("", NativeSymbol && NativeSymbol.species || SymbolPolyfill("species")),
            split: d("", NativeSymbol && NativeSymbol.split || SymbolPolyfill("split")),
            toPrimitive: d("", NativeSymbol && NativeSymbol.toPrimitive || SymbolPolyfill("toPrimitive")),
            toStringTag: d("", NativeSymbol && NativeSymbol.toStringTag || SymbolPolyfill("toStringTag")),
            unscopables: d("", NativeSymbol && NativeSymbol.unscopables || SymbolPolyfill("unscopables"))
        }), defineProperties(HiddenSymbol.prototype, {
            constructor: d(SymbolPolyfill),
            toString: d("", function() {
                return this.__name__;
            })
        }), defineProperties(SymbolPolyfill.prototype, {
            toString: d(function() {
                return "Symbol (" + validateSymbol(this).__description__ + ")";
            }),
            valueOf: d(function() {
                return validateSymbol(this);
            })
        }), defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d("", function() {
            return validateSymbol(this);
        })), defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d("c", "Symbol")), 
        defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag, d("c", SymbolPolyfill.prototype[SymbolPolyfill.toStringTag])), 
        defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive, d("c", SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var d, assign = __webpack_require__(13), normalizeOpts = __webpack_require__(20), isCallable = __webpack_require__(21), contains = __webpack_require__(22);
        d = module.exports = function(dscr, value) {
            var c, e, w, options, desc;
            return arguments.length < 2 || "string" != typeof dscr ? (options = value, value = dscr, 
            dscr = null) : options = arguments[2], null == dscr ? (c = w = !0, e = !1) : (c = contains.call(dscr, "c"), 
            e = contains.call(dscr, "e"), w = contains.call(dscr, "w")), desc = {
                value: value,
                configurable: c,
                enumerable: e,
                writable: w
            }, options ? assign(normalizeOpts(options), desc) : desc;
        }, d.gs = function(dscr, get, set) {
            var c, e, options, desc;
            return "string" != typeof dscr ? (options = set, set = get, get = dscr, dscr = null) : options = arguments[3], 
            null == get ? get = void 0 : isCallable(get) ? null == set ? set = void 0 : isCallable(set) || (options = set, 
            set = void 0) : (options = get, get = set = void 0), null == dscr ? (c = !0, e = !1) : (c = contains.call(dscr, "c"), 
            e = contains.call(dscr, "e")), desc = {
                get: get,
                set: set,
                configurable: c,
                enumerable: e
            }, options ? assign(normalizeOpts(options), desc) : desc;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__(14)() ? Object.assign : __webpack_require__(15);
    }, function(module, exports) {
        "use strict";
        module.exports = function() {
            var obj, assign = Object.assign;
            return "function" == typeof assign && (obj = {
                foo: "raz"
            }, assign(obj, {
                bar: "dwa"
            }, {
                trzy: "trzy"
            }), obj.foo + obj.bar + obj.trzy === "razdwatrzy");
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var keys = __webpack_require__(16), value = __webpack_require__(19), max = Math.max;
        module.exports = function(dest, src) {
            var error, i, assign, l = max(arguments.length, 2);
            for (dest = Object(value(dest)), assign = function(key) {
                try {
                    dest[key] = src[key];
                } catch (e) {
                    error || (error = e);
                }
            }, i = 1; i < l; ++i) src = arguments[i], keys(src).forEach(assign);
            if (void 0 !== error) throw error;
            return dest;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__(17)() ? Object.keys : __webpack_require__(18);
    }, function(module, exports) {
        "use strict";
        module.exports = function() {
            try {
                return Object.keys("primitive"), !0;
            } catch (e) {
                return !1;
            }
        };
    }, function(module, exports) {
        "use strict";
        var keys = Object.keys;
        module.exports = function(object) {
            return keys(null == object ? object : Object(object));
        };
    }, function(module, exports) {
        "use strict";
        module.exports = function(value) {
            if (null == value) throw new TypeError("Cannot use null or undefined");
            return value;
        };
    }, function(module, exports) {
        "use strict";
        var forEach = Array.prototype.forEach, create = Object.create, process = function(src, obj) {
            var key;
            for (key in src) obj[key] = src[key];
        };
        module.exports = function(options) {
            var result = create(null);
            return forEach.call(arguments, function(options) {
                null != options && process(Object(options), result);
            }), result;
        };
    }, function(module, exports) {
        "use strict";
        module.exports = function(obj) {
            return "function" == typeof obj;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        module.exports = __webpack_require__(23)() ? String.prototype.contains : __webpack_require__(24);
    }, function(module, exports) {
        "use strict";
        var str = "razdwatrzy";
        module.exports = function() {
            return "function" == typeof str.contains && (str.contains("dwa") === !0 && str.contains("foo") === !1);
        };
    }, function(module, exports) {
        "use strict";
        var indexOf = String.prototype.indexOf;
        module.exports = function(searchString) {
            return indexOf.call(this, searchString, arguments[1]) > -1;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var isSymbol = __webpack_require__(26);
        module.exports = function(value) {
            if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
            return value;
        };
    }, function(module, exports) {
        "use strict";
        module.exports = function(x) {
            return x && ("symbol" == typeof x || "Symbol" === x["@@toStringTag"]) || !1;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function hydrate(data, cleaned) {
            cleaned.forEach(function(path) {
                var last = path.pop(), obj = path.reduce(function(obj_, attr) {
                    return obj_ ? obj_[attr] : null;
                }, data);
                if (obj && obj[last]) {
                    var replace = {};
                    replace[consts.name] = obj[last].name, replace[consts.type] = obj[last].type, replace[consts.meta] = obj[last].meta, 
                    replace[consts.inspected] = !1, obj[last] = replace;
                }
            });
        }
        var consts = __webpack_require__(8);
        module.exports = hydrate;
    }, function(module, exports) {
        "use strict";
        function getPropType(data) {
            if (!data) return null;
            var type = "undefined" == typeof data ? "undefined" : _typeof(data);
            if ("object" === type) {
                if (data._reactFragment) return "react_fragment";
                if (Array.isArray(data)) return "array";
                if (ArrayBuffer.isView(data)) return data instanceof DataView ? "data_view" : "typed_array";
                if (data instanceof ArrayBuffer) return "array_buffer";
                if ("function" == typeof data[Symbol.iterator]) return "iterator";
                if ("[object Date]" === Object.prototype.toString.call(data)) return "date";
            }
            return type;
        }
        function createDehydrated(type, data, cleaned, path) {
            var meta = {};
            return "array" !== type && "typed_array" !== type || (meta.length = data.length), 
            "iterator" !== type && "typed_array" !== type || (meta.readOnly = !0), cleaned.push(path), 
            {
                type: type,
                meta: meta,
                name: data.constructor && "Object" !== data.constructor.name ? data.constructor.name : ""
            };
        }
        function dehydrate(data, cleaned) {
            var path = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : [], level = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0, type = getPropType(data);
            switch (type) {
              case "function":
                return cleaned.push(path), {
                    name: data.name,
                    type: "function"
                };

              case "string":
                return data.length <= 500 ? data : data.slice(0, 500) + "...";

              case "symbol":
                return cleaned.push(path), {
                    type: "symbol",
                    name: data.toString()
                };

              case "react_fragment":
                return "A React Fragment";

              case "array_buffer":
              case "data_view":
                return cleaned.push(path), {
                    type: type,
                    name: "data_view" === type ? "DataView" : "ArrayBuffer",
                    meta: {
                        length: data.byteLength,
                        uninspectable: !0
                    }
                };

              case "array":
                return level > 2 ? createDehydrated(type, data, cleaned, path) : data.map(function(item, i) {
                    return dehydrate(item, cleaned, path.concat([ i ]), level + 1);
                });

              case "typed_array":
              case "iterator":
                return createDehydrated(type, data, cleaned, path);

              case "date":
                return cleaned.push(path), {
                    name: data.toString(),
                    type: "date",
                    meta: {
                        uninspectable: !0
                    }
                };

              case "object":
                if (level > 2 || data.constructor && "function" == typeof data.constructor && "Object" !== data.constructor.name) return createDehydrated(type, data, cleaned, path);
                var res = {};
                for (var name in data) res[name] = dehydrate(data[name], cleaned, path.concat([ name ]), level + 1);
                return res;

              default:
                return data;
            }
        }
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
        module.exports = dehydrate;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var performanceNow, performance = __webpack_require__(30);
        performanceNow = performance.now ? function() {
            return performance.now();
        } : function() {
            return Date.now();
        }, module.exports = performanceNow;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var performance, ExecutionEnvironment = __webpack_require__(31);
        ExecutionEnvironment.canUseDOM && (performance = window.performance || window.msPerformance || window.webkitPerformance), 
        module.exports = performance || {};
    }, function(module, exports) {
        "use strict";
        var canUseDOM = !("undefined" == typeof window || !window.document || !window.document.createElement), ExecutionEnvironment = {
            canUseDOM: canUseDOM,
            canUseWorkers: "undefined" != typeof Worker,
            canUseEventListeners: canUseDOM && !(!window.addEventListener && !window.attachEvent),
            canUseViewport: canUseDOM && !!window.screen,
            isInWorker: !canUseDOM
        };
        module.exports = ExecutionEnvironment;
    }, function(module, exports) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
        }
        function init(agent) {
            return new ProfileCollector(agent);
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                    "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
                Constructor;
            };
        }(), _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, hasNativePerformanceNow = "object" === ("undefined" == typeof performance ? "undefined" : _typeof(performance)) && "function" == typeof performance.now, now = hasNativePerformanceNow ? function() {
            return performance.now();
        } : function() {
            return Date.now();
        }, ProfileCollector = function() {
            function ProfileCollector(agent) {
                var _this = this;
                _classCallCheck(this, ProfileCollector), this._committedNodes = new Set(), this._isRecording = !1, 
                this._maxActualDuration = 0, this._recordingStartTime = 0, this._onIsRecording = function(isRecording) {
                    _this._committedNodes = new Set(), _this._isRecording = isRecording, _this._recordingStartTime = isRecording ? now() : 0, 
                    isRecording && _this._agent.emit("clearSnapshots");
                }, this._onMountOrUpdate = function(data) {
                    _this._isRecording && void 0 !== data.actualDuration && (_this._committedNodes.add(data.id), 
                    _this._maxActualDuration = Math.max(_this._maxActualDuration, data.actualDuration));
                }, this._onRootCommitted = function(id, internalInstance, data) {
                    _this._isRecording && (_this._takeCommitSnapshotForRoot(id, data), _this._committedNodes = new Set(), 
                    _this._maxActualDuration = 0);
                }, this._onUnmount = function(id) {
                    _this._committedNodes["delete"](id);
                }, this._agent = agent, agent.on("isRecording", this._onIsRecording), agent.on("mount", this._onMountOrUpdate), 
                agent.on("rootCommitted", this._onRootCommitted), agent.on("unmount", this._onUnmount), 
                agent.on("update", this._onMountOrUpdate);
            }
            return _createClass(ProfileCollector, [ {
                key: "_takeCommitSnapshotForRoot",
                value: function(id, data) {
                    var _this2 = this, interactionsArray = null != data.memoizedInteractions ? Array.from(data.memoizedInteractions) : [], memoizedInteractions = interactionsArray.map(function(_ref) {
                        var name = _ref.name, timestamp = _ref.timestamp;
                        return {
                            name: name,
                            timestamp: timestamp - _this2._recordingStartTime
                        };
                    }), storeSnapshot = {
                        memoizedInteractions: memoizedInteractions,
                        committedNodes: Array.from(this._committedNodes),
                        commitTime: now() - this._recordingStartTime,
                        duration: this._maxActualDuration,
                        root: id
                    };
                    this._agent.emit("storeSnapshot", storeSnapshot);
                }
            } ]), ProfileCollector;
        }();
        module.exports = {
            init: init
        };
    }, function(module, exports) {
        "use strict";
        function installGlobalHook(window) {
            function detectReactBuildType(renderer) {
                try {
                    if ("string" == typeof renderer.version) return renderer.bundleType > 0 ? "development" : "production";
                    var toString = Function.prototype.toString;
                    if (renderer.Mount && renderer.Mount._renderNewRootComponent) {
                        var renderRootCode = toString.call(renderer.Mount._renderNewRootComponent);
                        return 0 !== renderRootCode.indexOf("function") ? "production" : renderRootCode.indexOf("storedMeasure") !== -1 ? "development" : renderRootCode.indexOf("should be a pure function") !== -1 ? renderRootCode.indexOf("NODE_ENV") !== -1 ? "development" : renderRootCode.indexOf("development") !== -1 ? "development" : renderRootCode.indexOf("true") !== -1 ? "development" : renderRootCode.indexOf("nextElement") !== -1 || renderRootCode.indexOf("nextComponent") !== -1 ? "unminified" : "development" : renderRootCode.indexOf("nextElement") !== -1 || renderRootCode.indexOf("nextComponent") !== -1 ? "unminified" : "outdated";
                    }
                } catch (err) {}
                return "production";
            }
            if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                var hasDetectedBadDCE = !1, hook = {
                    _renderers: {},
                    helpers: {},
                    checkDCE: function(fn) {
                        try {
                            var toString = Function.prototype.toString, code = toString.call(fn);
                            code.indexOf("^_^") > -1 && (hasDetectedBadDCE = !0, setTimeout(function() {
                                throw new Error("React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://fb.me/react-perf-use-the-production-build");
                            }));
                        } catch (err) {}
                    },
                    inject: function(renderer) {
                        var id = Math.random().toString(16).slice(2);
                        hook._renderers[id] = renderer;
                        var reactBuildType = hasDetectedBadDCE ? "deadcode" : detectReactBuildType(renderer);
                        return hook.emit("renderer", {
                            id: id,
                            renderer: renderer,
                            reactBuildType: reactBuildType
                        }), id;
                    },
                    _listeners: {},
                    sub: function(evt, fn) {
                        return hook.on(evt, fn), function() {
                            return hook.off(evt, fn);
                        };
                    },
                    on: function(evt, fn) {
                        hook._listeners[evt] || (hook._listeners[evt] = []), hook._listeners[evt].push(fn);
                    },
                    off: function(evt, fn) {
                        if (hook._listeners[evt]) {
                            var ix = hook._listeners[evt].indexOf(fn);
                            ix !== -1 && hook._listeners[evt].splice(ix, 1), hook._listeners[evt].length || (hook._listeners[evt] = null);
                        }
                    },
                    emit: function(evt, data) {
                        hook._listeners[evt] && hook._listeners[evt].map(function(fn) {
                            return fn(data);
                        });
                    },
                    supportsFiber: !0,
                    _fiberRoots: {},
                    getFiberRoots: function(rendererID) {
                        var roots = hook._fiberRoots;
                        return roots[rendererID] || (roots[rendererID] = new Set()), roots[rendererID];
                    },
                    onCommitFiberUnmount: function(rendererID, fiber) {
                        hook.helpers[rendererID] && hook.helpers[rendererID].handleCommitFiberUnmount(fiber);
                    },
                    onCommitFiberRoot: function(rendererID, root) {
                        var mountedRoots = hook.getFiberRoots(rendererID), current = root.current, isKnownRoot = mountedRoots.has(root), isUnmounting = null == current.memoizedState || null == current.memoizedState.element;
                        isKnownRoot || isUnmounting ? isKnownRoot && isUnmounting && mountedRoots["delete"](root) : mountedRoots.add(root), 
                        hook.helpers[rendererID] && hook.helpers[rendererID].handleCommitFiberRoot(root);
                    }
                };
                Object.defineProperty(window, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
                    value: hook
                });
            }
        }
        module.exports = installGlobalHook;
    }, function(module, exports) {
        "use strict";
        function installRelayHook(window) {
            function decorate(obj, attr, fn) {
                var old = obj[attr];
                obj[attr] = function() {
                    var res = old.apply(this, arguments);
                    return fn.apply(this, arguments), res;
                };
            }
            function emit(name, data) {
                _eventQueue.push({
                    name: name,
                    data: data
                }), _listener && _listener(name, data);
            }
            function setRequestListener(listener) {
                if (_listener) throw new Error("Relay Devtools: Called only call setRequestListener once.");
                return _listener = listener, _eventQueue.forEach(function(_ref) {
                    var name = _ref.name, data = _ref.data;
                    listener(name, data);
                }), function() {
                    _listener = null;
                };
            }
            function recordRequest(type, start, request, requestNumber) {
                var id = Math.random().toString(16).substr(2);
                request.getPromise().then(function(response) {
                    emit("relay:success", {
                        id: id,
                        end: performanceNow(),
                        response: response.response
                    });
                }, function(error) {
                    emit("relay:failure", {
                        id: id,
                        end: performanceNow(),
                        error: error
                    });
                });
                for (var textChunks = [], text = request.getQueryString(); text.length > 0; ) textChunks.push(text.substr(0, TEXT_CHUNK_LENGTH)), 
                text = text.substr(TEXT_CHUNK_LENGTH);
                return {
                    id: id,
                    name: request.getDebugName(),
                    requestNumber: requestNumber,
                    start: start,
                    text: textChunks,
                    type: type,
                    variables: request.getVariables()
                };
            }
            function instrumentRelayRequests(relayInternals) {
                var NetworkLayer = relayInternals.NetworkLayer;
                decorate(NetworkLayer, "sendMutation", function(mutation) {
                    requestNumber++, emit("relay:pending", [ recordRequest("mutation", performanceNow(), mutation, requestNumber) ]);
                }), decorate(NetworkLayer, "sendQueries", function(queries) {
                    requestNumber++;
                    var start = performanceNow();
                    emit("relay:pending", queries.map(function(query) {
                        return recordRequest("query", start, query, requestNumber);
                    }));
                });
                var instrumented = {};
                for (var key in relayInternals) relayInternals.hasOwnProperty(key) && (instrumented[key] = relayInternals[key]);
                return instrumented.setRequestListener = setRequestListener, instrumented;
            }
            var performanceNow, performance = window.performance;
            performanceNow = performance && "function" == typeof performance.now ? function() {
                return performance.now();
            } : function() {
                return Date.now();
            };
            var TEXT_CHUNK_LENGTH = 500, hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
            if (hook) {
                var _eventQueue = [], _listener = null, requestNumber = 0, _relayInternals = null;
                Object.defineProperty(hook, "_relayInternals", {
                    configurable: !0,
                    set: function(relayInternals) {
                        _relayInternals = instrumentRelayRequests(relayInternals);
                    },
                    get: function() {
                        return _relayInternals;
                    }
                });
            }
        }
        module.exports = installRelayHook;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var setupBackend = __webpack_require__(36);
        module.exports = function(hook, agent) {
            var subs = [ hook.sub("renderer-attached", function(_ref) {
                var id = _ref.id, helpers = (_ref.renderer, _ref.helpers);
                agent.setReactInternals(id, helpers), helpers.walkTree(agent.onMounted.bind(agent, id), agent.addRoot.bind(agent, id));
            }), hook.sub("mount", function(_ref2) {
                var renderer = _ref2.renderer, internalInstance = _ref2.internalInstance, data = _ref2.data;
                return agent.onMounted(renderer, internalInstance, data);
            }), hook.sub("unmount", function(_ref3) {
                var internalInstance = (_ref3.renderer, _ref3.internalInstance);
                return agent.onUnmounted(internalInstance);
            }), hook.sub("update", function(_ref4) {
                var internalInstance = (_ref4.renderer, _ref4.internalInstance), data = _ref4.data;
                return agent.onUpdated(internalInstance, data);
            }), hook.sub("root", function(_ref5) {
                var renderer = _ref5.renderer, internalInstance = _ref5.internalInstance;
                return agent.addRoot(renderer, internalInstance);
            }), hook.sub("rootCommitted", function(_ref6) {
                var renderer = _ref6.renderer, internalInstance = _ref6.internalInstance, data = _ref6.data;
                return agent.rootCommitted(renderer, internalInstance, data);
            }), hook.sub("updateProfileTimes", function(_ref7) {
                var internalInstance = (_ref7.renderer, _ref7.internalInstance), data = _ref7.data;
                return agent.onUpdatedProfileTimes(internalInstance, data);
            }) ], success = setupBackend(hook);
            success && (hook.emit("react-devtools", agent), hook.reactDevtoolsAgent = agent, 
            agent.on("shutdown", function() {
                subs.forEach(function(fn) {
                    return fn();
                }), hook.reactDevtoolsAgent = null;
            }));
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var attachRenderer = __webpack_require__(37);
        module.exports = function(hook) {
            var oldReact = window.React && window.React.__internals;
            oldReact && 0 === Object.keys(hook._renderers).length && hook.inject(oldReact);
            for (var rid in hook._renderers) hook.helpers[rid] = attachRenderer(hook, rid, hook._renderers[rid]), 
            hook.emit("renderer-attached", {
                id: rid,
                renderer: hook._renderers[rid],
                helpers: hook.helpers[rid]
            });
            hook.on("renderer", function(_ref) {
                var id = _ref.id, renderer = _ref.renderer;
                hook.helpers[id] = attachRenderer(hook, id, renderer), hook.emit("renderer-attached", {
                    id: id,
                    renderer: renderer,
                    helpers: hook.helpers[id]
                });
            });
            var shutdown = function shutdown() {
                for (var id in hook.helpers) hook.helpers[id].cleanup();
                hook.off("shutdown", shutdown);
            };
            return hook.on("shutdown", shutdown), !0;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function attachRenderer(hook, rid, renderer) {
            var rootNodeIDMap = new Map(), extras = {}, isPre013 = !renderer.Reconciler;
            if ("function" == typeof renderer.findFiberByHostInstance) return attachRendererFiber(hook, rid, renderer);
            renderer.Mount.findNodeHandle && renderer.Mount.nativeTagToRootNodeID ? (extras.getNativeFromReactElement = function(component) {
                return renderer.Mount.findNodeHandle(component);
            }, extras.getReactElementFromNative = function(nativeTag) {
                var id = renderer.Mount.nativeTagToRootNodeID(nativeTag);
                return rootNodeIDMap.get(id);
            }) : renderer.ComponentTree ? (extras.getNativeFromReactElement = function(component) {
                return renderer.ComponentTree.getNodeFromInstance(component);
            }, extras.getReactElementFromNative = function(node) {
                return renderer.ComponentTree.getClosestInstanceFromNode(node);
            }) : renderer.Mount.getID && renderer.Mount.getNode ? (extras.getNativeFromReactElement = function(component) {
                try {
                    return renderer.Mount.getNode(component._rootNodeID);
                } catch (e) {
                    return;
                }
            }, extras.getReactElementFromNative = function(node) {
                for (var id = renderer.Mount.getID(node); node && node.parentNode && !id; ) node = node.parentNode, 
                id = renderer.Mount.getID(node);
                return rootNodeIDMap.get(id);
            }) : console.warn("Unknown react version (does not have getID), probably an unshimmed React Native");
            var oldMethods, oldRenderComponent, oldRenderRoot;
            return renderer.Mount._renderNewRootComponent ? oldRenderRoot = decorateResult(renderer.Mount, "_renderNewRootComponent", function(internalInstance) {
                hook.emit("root", {
                    renderer: rid,
                    internalInstance: internalInstance
                });
            }) : renderer.Mount.renderComponent && (oldRenderComponent = decorateResult(renderer.Mount, "renderComponent", function(internalInstance) {
                hook.emit("root", {
                    renderer: rid,
                    internalInstance: internalInstance._reactInternalInstance
                });
            })), renderer.Component ? (console.error("You are using a version of React with limited support in this version of the devtools.\nPlease upgrade to use at least 0.13, or you can downgrade to use the old version of the devtools:\ninstructions here https://github.com/facebook/react-devtools/tree/devtools-next#how-do-i-use-this-for-react--013"), 
            oldMethods = decorateMany(renderer.Component.Mixin, {
                mountComponent: function() {
                    var _this = this;
                    rootNodeIDMap.set(this._rootNodeID, this), setTimeout(function() {
                        hook.emit("mount", {
                            internalInstance: _this,
                            data: getData012(_this),
                            renderer: rid
                        });
                    }, 0);
                },
                updateComponent: function() {
                    var _this2 = this;
                    setTimeout(function() {
                        hook.emit("update", {
                            internalInstance: _this2,
                            data: getData012(_this2),
                            renderer: rid
                        });
                    }, 0);
                },
                unmountComponent: function() {
                    hook.emit("unmount", {
                        internalInstance: this,
                        renderer: rid
                    }), rootNodeIDMap["delete"](this._rootNodeID);
                }
            })) : renderer.Reconciler && (oldMethods = decorateMany(renderer.Reconciler, {
                mountComponent: function(internalInstance, rootID, transaction, context) {
                    var data = getData(internalInstance);
                    rootNodeIDMap.set(internalInstance._rootNodeID, internalInstance), hook.emit("mount", {
                        internalInstance: internalInstance,
                        data: data,
                        renderer: rid
                    });
                },
                performUpdateIfNecessary: function(internalInstance, nextChild, transaction, context) {
                    hook.emit("update", {
                        internalInstance: internalInstance,
                        data: getData(internalInstance),
                        renderer: rid
                    });
                },
                receiveComponent: function(internalInstance, nextChild, transaction, context) {
                    hook.emit("update", {
                        internalInstance: internalInstance,
                        data: getData(internalInstance),
                        renderer: rid
                    });
                },
                unmountComponent: function(internalInstance) {
                    hook.emit("unmount", {
                        internalInstance: internalInstance,
                        renderer: rid
                    }), rootNodeIDMap["delete"](internalInstance._rootNodeID);
                }
            })), extras.walkTree = function(visit, visitRoot) {
                var onMount = function(component, data) {
                    rootNodeIDMap.set(component._rootNodeID, component), visit(component, data);
                };
                walkRoots(renderer.Mount._instancesByReactRootID || renderer.Mount._instancesByContainerID, onMount, visitRoot, isPre013);
            }, extras.cleanup = function() {
                oldMethods && (renderer.Component ? restoreMany(renderer.Component.Mixin, oldMethods) : restoreMany(renderer.Reconciler, oldMethods)), 
                oldRenderRoot && (renderer.Mount._renderNewRootComponent = oldRenderRoot), oldRenderComponent && (renderer.Mount.renderComponent = oldRenderComponent), 
                oldMethods = null, oldRenderRoot = null, oldRenderComponent = null;
            }, extras;
        }
        function walkRoots(roots, onMount, onRoot, isPre013) {
            for (var name in roots) walkNode(roots[name], onMount, isPre013), onRoot(roots[name]);
        }
        function walkNode(internalInstance, onMount, isPre013) {
            var data = isPre013 ? getData012(internalInstance) : getData(internalInstance);
            data.children && Array.isArray(data.children) && data.children.forEach(function(child) {
                return walkNode(child, onMount, isPre013);
            }), onMount(internalInstance, data);
        }
        function decorateResult(obj, attr, fn) {
            var old = obj[attr];
            return obj[attr] = function(instance) {
                var res = old.apply(this, arguments);
                return fn(res), res;
            }, old;
        }
        function decorate(obj, attr, fn) {
            var old = obj[attr];
            return obj[attr] = function(instance) {
                var res = old.apply(this, arguments);
                return fn.apply(this, arguments), res;
            }, old;
        }
        function decorateMany(source, fns) {
            var olds = {};
            for (var name in fns) olds[name] = decorate(source, name, fns[name]);
            return olds;
        }
        function restoreMany(source, olds) {
            for (var name in olds) source[name] = olds[name];
        }
        var getData = __webpack_require__(38), getData012 = __webpack_require__(43), attachRendererFiber = __webpack_require__(44);
        module.exports = attachRenderer;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function getData(internalInstance) {
            var children = null, props = null, state = null, context = null, updater = null, name = null, type = null, key = null, ref = null, source = null, text = null, publicInstance = null, nodeType = "Native";
            if ("object" !== ("undefined" == typeof internalInstance ? "undefined" : _typeof(internalInstance))) nodeType = "Text", 
            text = internalInstance + ""; else if (null === internalInstance._currentElement || internalInstance._currentElement === !1) nodeType = "Empty"; else if (internalInstance._renderedComponent) nodeType = "NativeWrapper", 
            children = [ internalInstance._renderedComponent ], props = internalInstance._instance.props, 
            state = internalInstance._instance.state, context = internalInstance._instance.context, 
            context && 0 === Object.keys(context).length && (context = null); else if (internalInstance._renderedChildren) children = childrenList(internalInstance._renderedChildren); else if (internalInstance._currentElement && internalInstance._currentElement.props) {
                var unfilteredChildren = internalInstance._currentElement.props.children, filteredChildren = [];
                traverseAllChildrenImpl(unfilteredChildren, "", function(_traverseContext, child) {
                    var childType = "undefined" == typeof child ? "undefined" : _typeof(child);
                    "string" !== childType && "number" !== childType || filteredChildren.push(child);
                }), children = filteredChildren.length <= 1 ? filteredChildren.length ? String(filteredChildren[0]) : void 0 : filteredChildren;
            }
            if (!props && internalInstance._currentElement && internalInstance._currentElement.props && (props = internalInstance._currentElement.props), 
            null != internalInstance._currentElement && (type = internalInstance._currentElement.type, 
            internalInstance._currentElement.key && (key = String(internalInstance._currentElement.key)), 
            source = internalInstance._currentElement._source, ref = internalInstance._currentElement.ref, 
            "string" == typeof type ? (name = type, null != internalInstance._nativeNode && (publicInstance = internalInstance._nativeNode), 
            null != internalInstance._hostNode && (publicInstance = internalInstance._hostNode)) : "function" == typeof type ? (nodeType = "Composite", 
            name = getDisplayName(type), internalInstance._renderedComponent && (internalInstance._currentElement.props === internalInstance._renderedComponent._currentElement || internalInstance._currentElement.type.isReactTopLevelWrapper) && (nodeType = "Wrapper"), 
            null === name && (name = "No display name")) : "string" == typeof internalInstance._stringText ? (nodeType = "Text", 
            text = internalInstance._stringText) : name = getDisplayName(type)), internalInstance._instance) {
                var inst = internalInstance._instance, forceUpdate = inst.forceUpdate || inst.updater && inst.updater.enqueueForceUpdate && function(cb) {
                    inst.updater.enqueueForceUpdate(this, cb, "forceUpdate");
                };
                updater = {
                    setState: inst.setState && inst.setState.bind(inst),
                    forceUpdate: forceUpdate && forceUpdate.bind(inst),
                    setInProps: forceUpdate && setInProps.bind(null, internalInstance, forceUpdate),
                    setInState: inst.forceUpdate && setInState.bind(null, inst),
                    setInContext: forceUpdate && setInContext.bind(null, inst, forceUpdate)
                }, "function" == typeof type && (publicInstance = inst), inst._renderedChildren && (children = childrenList(inst._renderedChildren));
            }
            return "function" == typeof internalInstance.setNativeProps && (updater = {
                setNativeProps: function(nativeProps) {
                    internalInstance.setNativeProps(nativeProps);
                }
            }), {
                nodeType: nodeType,
                type: type,
                key: key,
                ref: ref,
                source: source,
                name: name,
                props: props,
                state: state,
                context: context,
                children: children,
                text: text,
                updater: updater,
                publicInstance: publicInstance
            };
        }
        function setInProps(internalInst, forceUpdate, path, value) {
            var element = internalInst._currentElement;
            internalInst._currentElement = _extends({}, element, {
                props: copyWithSet(element.props, path, value)
            }), forceUpdate.call(internalInst._instance);
        }
        function setInState(inst, path, value) {
            setIn(inst.state, path, value), inst.forceUpdate();
        }
        function setInContext(inst, forceUpdate, path, value) {
            setIn(inst.context, path, value), forceUpdate.call(inst);
        }
        function setIn(obj, path, value) {
            var last = path.pop(), parent = path.reduce(function(obj_, attr) {
                return obj_ ? obj_[attr] : null;
            }, obj);
            parent && (parent[last] = value);
        }
        function childrenList(children) {
            var res = [];
            for (var name in children) res.push(children[name]);
            return res;
        }
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        }, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, copyWithSet = __webpack_require__(39), getDisplayName = __webpack_require__(40), traverseAllChildrenImpl = __webpack_require__(41);
        module.exports = getData;
    }, function(module, exports) {
        "use strict";
        function copyWithSetImpl(obj, path, idx, value) {
            if (idx >= path.length) return value;
            var key = path[idx], updated = Array.isArray(obj) ? obj.slice() : _extends({}, obj);
            return updated[key] = copyWithSetImpl(obj[key], path, idx + 1, value), updated;
        }
        function copyWithSet(obj, path, value) {
            return copyWithSetImpl(obj, path, 0, value);
        }
        var _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) Object.prototype.hasOwnProperty.call(source, key) && (target[key] = source[key]);
            }
            return target;
        };
        module.exports = copyWithSet;
    }, function(module, exports) {
        "use strict";
        function getDisplayName(type) {
            var fallbackName = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "Unknown", nameFromCache = cachedDisplayNames.get(type);
            if (null != nameFromCache) return nameFromCache;
            var displayName = void 0;
            "string" == typeof type.displayName && (displayName = type.displayName), displayName || (displayName = type.name || fallbackName);
            var match = displayName.match(FB_MODULE_RE);
            if (match) {
                var componentName = match[1], moduleName = match[2];
                componentName && moduleName && (moduleName === componentName || moduleName.startsWith(componentName + ".")) && (displayName = componentName);
            }
            return cachedDisplayNames.set(type, displayName), displayName;
        }
        var FB_MODULE_RE = /^(.*) \[from (.*)\]$/, cachedDisplayNames = new WeakMap();
        module.exports = getDisplayName;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function escape(key) {
            var escapeRegex = /[=:]/g, escaperLookup = {
                "=": "=0",
                ":": "=2"
            }, escapedString = ("" + key).replace(escapeRegex, function(match) {
                return escaperLookup[match];
            });
            return "$" + escapedString;
        }
        function getComponentKey(component, index) {
            return "object" === ("undefined" == typeof component ? "undefined" : _typeof(component)) && null !== component && null != component.key ? escape(component.key) : index.toString(36);
        }
        function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
            var type = "undefined" == typeof children ? "undefined" : _typeof(children);
            if ("undefined" !== type && "boolean" !== type || (children = null), null === children || "string" === type || "number" === type || "object" === type && children.$$typeof === REACT_ELEMENT_TYPE) return callback(traverseContext, children, "" === nameSoFar ? SEPARATOR + getComponentKey(children, 0) : nameSoFar), 
            1;
            var child, nextName, subtreeCount = 0, nextNamePrefix = "" === nameSoFar ? SEPARATOR : nameSoFar + SUBSEPARATOR;
            if (Array.isArray(children)) for (var i = 0; i < children.length; i++) child = children[i], 
            nextName = nextNamePrefix + getComponentKey(child, i), subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext); else {
                var iteratorFn = ITERATOR_SYMBOL && children[ITERATOR_SYMBOL] || children[FAUX_ITERATOR_SYMBOL];
                if ("function" == typeof iteratorFn) for (var step, iterator = iteratorFn.call(children), ii = 0; !(step = iterator.next()).done; ) child = step.value, 
                nextName = nextNamePrefix + getComponentKey(child, ii++), subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext); else if ("object" === type) {
                    var addendum = " If you meant to render a collection of children, use an array instead.", childrenString = "" + children;
                    invariant(!1, "The React Devtools cannot render an object as a child. (found: %s).%s", "[object Object]" === childrenString ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString, addendum);
                }
            }
            return subtreeCount;
        }
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, invariant = __webpack_require__(42), SEPARATOR = ".", SUBSEPARATOR = ":", FAUX_ITERATOR_SYMBOL = "@@iterator", ITERATOR_SYMBOL = "function" == typeof Symbol && Symbol.iterator, REACT_ELEMENT_TYPE = "function" == typeof Symbol && Symbol["for"] && Symbol["for"]("react.element") || 60103;
        module.exports = traverseAllChildrenImpl;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function invariant(condition, format, a, b, c, d, e, f) {
            if (!condition) {
                var error;
                if (void 0 === format) error = new Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings."); else {
                    var args = [ a, b, c, d, e, f ], argIndex = 0;
                    error = new Error(format.replace(/%s/g, function() {
                        return args[argIndex++];
                    })), error.name = "Invariant Violation";
                }
                throw error.framesToPop = 1, error;
            }
        }
        module.exports = invariant;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function getData012(internalInstance) {
            var children = null, props = internalInstance.props, state = internalInstance.state, context = internalInstance.context, updater = null, name = null, type = null, key = null, ref = null, text = null, publicInstance = null, nodeType = "Native";
            return internalInstance._renderedComponent ? (nodeType = "Wrapper", children = [ internalInstance._renderedComponent ], 
            context && 0 === Object.keys(context).length && (context = null)) : internalInstance._renderedChildren ? (name = internalInstance.constructor.displayName, 
            children = childrenList(internalInstance._renderedChildren)) : "string" == typeof props.children && (name = internalInstance.constructor.displayName, 
            children = props.children, nodeType = "Native"), !props && internalInstance._currentElement && internalInstance._currentElement.props && (props = internalInstance._currentElement.props), 
            internalInstance._currentElement && (type = internalInstance._currentElement.type, 
            internalInstance._currentElement.key && (key = String(internalInstance._currentElement.key)), 
            ref = internalInstance._currentElement.ref, "string" == typeof type ? name = type : (nodeType = "Composite", 
            name = type.displayName, name || (name = "No display name"))), name || (name = internalInstance.constructor.displayName || "No display name", 
            nodeType = "Composite"), "string" == typeof props && (nodeType = "Text", text = props, 
            props = null, name = null), internalInstance.forceUpdate && (updater = {
                setState: internalInstance.setState.bind(internalInstance),
                forceUpdate: internalInstance.forceUpdate.bind(internalInstance),
                setInProps: internalInstance.forceUpdate && setInProps.bind(null, internalInstance),
                setInState: internalInstance.forceUpdate && setInState.bind(null, internalInstance),
                setInContext: internalInstance.forceUpdate && setInContext.bind(null, internalInstance)
            }, publicInstance = internalInstance), {
                nodeType: nodeType,
                type: type,
                key: key,
                ref: ref,
                source: null,
                name: name,
                props: props,
                state: state,
                context: context,
                children: children,
                text: text,
                updater: updater,
                publicInstance: publicInstance
            };
        }
        function setInProps(inst, path, value) {
            inst.props = copyWithSet(inst.props, path, value), inst.forceUpdate();
        }
        function setInState(inst, path, value) {
            setIn(inst.state, path, value), inst.forceUpdate();
        }
        function setInContext(inst, path, value) {
            setIn(inst.context, path, value), inst.forceUpdate();
        }
        function setIn(obj, path, value) {
            var last = path.pop(), parent = path.reduce(function(obj_, attr) {
                return obj_ ? obj_[attr] : null;
            }, obj);
            parent && (parent[last] = value);
        }
        function childrenList(children) {
            var res = [];
            for (var name in children) res.push(children[name]);
            return res;
        }
        var copyWithSet = __webpack_require__(39);
        module.exports = getData012;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function getInternalReactConstants(version) {
            var ReactTypeOfWork, ReactSymbols, ReactTypeOfSideEffect;
            return ReactTypeOfWork = semver.gte(version, "16.6.0-beta.0") ? {
                ClassComponent: 1,
                ContextConsumer: 9,
                ContextProvider: 10,
                CoroutineComponent: -1,
                CoroutineHandlerPhase: -1,
                ForwardRef: 11,
                Fragment: 7,
                FunctionalComponent: 0,
                HostComponent: 5,
                HostPortal: 4,
                HostRoot: 3,
                HostText: 6,
                IndeterminateComponent: 2,
                LazyComponent: 16,
                MemoComponent: 14,
                Mode: 8,
                Profiler: 12,
                SimpleMemoComponent: 15,
                SuspenseComponent: 13,
                YieldComponent: -1
            } : semver.gte(version, "16.4.3-alpha") ? {
                ClassComponent: 2,
                ContextConsumer: 11,
                ContextProvider: 12,
                CoroutineComponent: -1,
                CoroutineHandlerPhase: -1,
                ForwardRef: 13,
                Fragment: 9,
                FunctionalComponent: 0,
                HostComponent: 7,
                HostPortal: 6,
                HostRoot: 5,
                HostText: 8,
                IndeterminateComponent: 4,
                LazyComponent: -1,
                MemoComponent: -1,
                Mode: 10,
                Profiler: 15,
                SimpleMemoComponent: -1,
                SuspenseComponent: 16,
                YieldComponent: -1
            } : {
                ClassComponent: 2,
                ContextConsumer: 12,
                ContextProvider: 13,
                CoroutineComponent: 7,
                CoroutineHandlerPhase: 8,
                ForwardRef: 14,
                Fragment: 10,
                FunctionalComponent: 1,
                HostComponent: 5,
                HostPortal: 4,
                HostRoot: 3,
                HostText: 6,
                IndeterminateComponent: 0,
                LazyComponent: -1,
                MemoComponent: -1,
                Mode: 11,
                Profiler: 15,
                SimpleMemoComponent: -1,
                SuspenseComponent: 16,
                YieldComponent: 9
            }, ReactSymbols = {
                CONCURRENT_MODE_NUMBER: 60111,
                CONCURRENT_MODE_SYMBOL_STRING: "Symbol(react.concurrent_mode)",
                DEPRECATED_ASYNC_MODE_SYMBOL_STRING: "Symbol(react.async_mode)",
                CONTEXT_CONSUMER_NUMBER: 60110,
                CONTEXT_CONSUMER_SYMBOL_STRING: "Symbol(react.context)",
                CONTEXT_PROVIDER_NUMBER: 60109,
                CONTEXT_PROVIDER_SYMBOL_STRING: "Symbol(react.provider)",
                FORWARD_REF_NUMBER: 60112,
                FORWARD_REF_SYMBOL_STRING: "Symbol(react.forward_ref)",
                PROFILER_NUMBER: 60114,
                PROFILER_SYMBOL_STRING: "Symbol(react.profiler)",
                PURE_NUMBER: 60115,
                PURE_SYMBOL_STRING: "Symbol(react.pure)",
                STRICT_MODE_NUMBER: 60108,
                STRICT_MODE_SYMBOL_STRING: "Symbol(react.strict_mode)",
                SUSPENSE_NUMBER: 60113,
                SUSPENSE_SYMBOL_STRING: "Symbol(react.suspense)",
                DEPRECATED_PLACEHOLDER_SYMBOL_STRING: "Symbol(react.placeholder)"
            }, ReactTypeOfSideEffect = {
                PerformedWork: 1
            }, {
                ReactTypeOfWork: ReactTypeOfWork,
                ReactSymbols: ReactSymbols,
                ReactTypeOfSideEffect: ReactTypeOfSideEffect
            };
        }
        function attachRendererFiber(hook, rid, renderer) {
            function getDataFiber(fiber) {
                var type = fiber.type, key = fiber.key, ref = fiber.ref, source = fiber._debugSource, publicInstance = null, props = null, state = null, children = null, context = null, updater = null, nodeType = null, name = null, text = null, actualDuration = null, actualStartTime = null, treeBaseDuration = null, memoizedInteractions = null, resolvedType = type;
                switch ("object" === ("undefined" == typeof type ? "undefined" : _typeof(type)) && null !== type && "function" == typeof type.then && (resolvedType = type._reactResult), 
                fiber.tag) {
                  case FunctionalComponent:
                  case ClassComponent:
                    nodeType = "Composite", name = getDisplayName(resolvedType), publicInstance = fiber.stateNode, 
                    props = fiber.memoizedProps, state = fiber.memoizedState, null != publicInstance && (context = publicInstance.context, 
                    context && 0 === Object.keys(context).length && (context = null));
                    var inst = publicInstance;
                    inst && (updater = {
                        setState: inst.setState && inst.setState.bind(inst),
                        forceUpdate: inst.forceUpdate && inst.forceUpdate.bind(inst),
                        setInProps: inst.forceUpdate && setInProps.bind(null, fiber),
                        setInState: inst.forceUpdate && setInState.bind(null, inst),
                        setInContext: inst.forceUpdate && setInContext.bind(null, inst)
                    }), children = [];
                    break;

                  case ForwardRef:
                    var functionName = getDisplayName(resolvedType.render, "");
                    nodeType = "Special", name = resolvedType.displayName || ("" !== functionName ? "ForwardRef(" + functionName + ")" : "ForwardRef"), 
                    children = [];
                    break;

                  case HostRoot:
                    nodeType = "Wrapper", children = [], memoizedInteractions = fiber.stateNode.memoizedInteractions;
                    break;

                  case HostPortal:
                    nodeType = "Portal", name = "ReactPortal", props = {
                        target: fiber.stateNode.containerInfo
                    }, children = [];
                    break;

                  case HostComponent:
                    nodeType = "Native", name = fiber.type, name = name.replace("topsecret-", ""), publicInstance = fiber.stateNode, 
                    props = fiber.memoizedProps, children = "string" == typeof props.children || "number" == typeof props.children ? props.children.toString() : [], 
                    "function" == typeof fiber.stateNode.setNativeProps && (updater = {
                        setNativeProps: function(nativeProps) {
                            fiber.stateNode.setNativeProps(nativeProps);
                        }
                    });
                    break;

                  case HostText:
                    nodeType = "Text", text = fiber.memoizedProps;
                    break;

                  case Fragment:
                    nodeType = "Wrapper", children = [];
                    break;

                  default:
                    var symbolOrNumber = "object" === ("undefined" == typeof type ? "undefined" : _typeof(type)) && null !== type ? type.$$typeof : type, switchValue = "symbol" === ("undefined" == typeof symbolOrNumber ? "undefined" : _typeof(symbolOrNumber)) ? symbolOrNumber.toString() : symbolOrNumber;
                    switch (switchValue) {
                      case PURE_NUMBER:
                      case PURE_SYMBOL_STRING:
                        if (nodeType = "Special", type.displayName) name = type.displayName; else {
                            var displayName = type.render.displayName || type.render.name;
                            name = displayName ? "Pure(" + displayName + ")" : "Pure";
                        }
                        children = [];
                        break;

                      case CONCURRENT_MODE_NUMBER:
                      case CONCURRENT_MODE_SYMBOL_STRING:
                      case DEPRECATED_ASYNC_MODE_SYMBOL_STRING:
                        nodeType = "Special", name = "ConcurrentMode", children = [];
                        break;

                      case CONTEXT_PROVIDER_NUMBER:
                      case CONTEXT_PROVIDER_SYMBOL_STRING:
                        nodeType = "Special", props = fiber.memoizedProps, name = (fiber.type._context.displayName || "Context") + ".Provider", 
                        children = [];
                        break;

                      case CONTEXT_CONSUMER_NUMBER:
                      case CONTEXT_CONSUMER_SYMBOL_STRING:
                        nodeType = "Special", props = fiber.memoizedProps, name = (fiber.type.displayName || "Context") + ".Consumer", 
                        children = [];
                        break;

                      case STRICT_MODE_NUMBER:
                      case STRICT_MODE_SYMBOL_STRING:
                        nodeType = "Special", name = "StrictMode", children = [];
                        break;

                      case SUSPENSE_NUMBER:
                      case SUSPENSE_SYMBOL_STRING:
                      case DEPRECATED_PLACEHOLDER_SYMBOL_STRING:
                        nodeType = "Special", name = "Suspense", props = fiber.memoizedProps, children = [];
                        break;

                      case PROFILER_NUMBER:
                      case PROFILER_SYMBOL_STRING:
                        nodeType = "Special", props = fiber.memoizedProps, name = "Profiler(" + fiber.memoizedProps.id + ")", 
                        children = [];
                        break;

                      default:
                        nodeType = "Native", props = fiber.memoizedProps, name = "TODO_NOT_IMPLEMENTED_YET", 
                        children = [];
                    }
                }
                if (Array.isArray(children)) for (var child = fiber.child; child; ) children.push(getOpaqueNode(child)), 
                child = child.sibling;
                return void 0 !== fiber.actualDuration && (actualDuration = fiber.actualDuration, 
                actualStartTime = fiber.actualStartTime, treeBaseDuration = fiber.treeBaseDuration), 
                {
                    nodeType: nodeType,
                    type: type,
                    key: key,
                    ref: ref,
                    source: source,
                    name: name,
                    props: props,
                    state: state,
                    context: context,
                    children: children,
                    text: text,
                    updater: updater,
                    publicInstance: publicInstance,
                    memoizedInteractions: memoizedInteractions,
                    actualDuration: actualDuration,
                    actualStartTime: actualStartTime,
                    treeBaseDuration: treeBaseDuration
                };
            }
            function setInProps(fiber, path, value) {
                var inst = fiber.stateNode;
                fiber.pendingProps = copyWithSet(inst.props, path, value), fiber.alternate && (fiber.alternate.pendingProps = fiber.pendingProps), 
                fiber.stateNode.forceUpdate();
            }
            function setInState(inst, path, value) {
                setIn(inst.state, path, value), inst.forceUpdate();
            }
            function setInContext(inst, path, value) {
                setIn(inst.context, path, value), inst.forceUpdate();
            }
            function setIn(obj, path, value) {
                var last = path.pop(), parent = path.reduce(function(obj_, attr) {
                    return obj_ ? obj_[attr] : null;
                }, obj);
                parent && (parent[last] = value);
            }
            function getOpaqueNode(fiber) {
                if (opaqueNodes.has(fiber)) return fiber;
                var alternate = fiber.alternate;
                return null != alternate && opaqueNodes.has(alternate) ? alternate : (opaqueNodes.add(fiber), 
                fiber);
            }
            function hasDataChanged(prevFiber, nextFiber) {
                switch (nextFiber.tag) {
                  case ClassComponent:
                  case FunctionalComponent:
                  case ContextConsumer:
                    return (nextFiber.effectTag & PerformedWork) === PerformedWork;

                  default:
                    return prevFiber.memoizedProps !== nextFiber.memoizedProps || prevFiber.memoizedState !== nextFiber.memoizedState || prevFiber.ref !== nextFiber.ref;
                }
            }
            function haveProfilerTimesChanged(prevFiber, nextFiber) {
                return void 0 !== prevFiber.actualDuration && (prevFiber.actualDuration !== nextFiber.actualDuration || prevFiber.actualStartTime !== nextFiber.actualStartTime || prevFiber.treeBaseDuration !== nextFiber.treeBaseDuration);
            }
            function flushPendingEvents() {
                var events = pendingEvents;
                pendingEvents = [];
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    hook.emit(event.type, event);
                }
            }
            function enqueueMount(fiber) {
                pendingEvents.push({
                    internalInstance: getOpaqueNode(fiber),
                    data: getDataFiber(fiber),
                    renderer: rid,
                    type: "mount"
                });
                var isRoot = fiber.tag === HostRoot;
                isRoot && pendingEvents.push({
                    internalInstance: getOpaqueNode(fiber),
                    renderer: rid,
                    type: "root"
                });
            }
            function enqueueUpdateIfNecessary(fiber, hasChildOrderChanged) {
                return hasChildOrderChanged || hasDataChanged(fiber.alternate, fiber) ? void pendingEvents.push({
                    internalInstance: getOpaqueNode(fiber),
                    data: getDataFiber(fiber),
                    renderer: rid,
                    type: "update"
                }) : void (haveProfilerTimesChanged(fiber.alternate, fiber) && pendingEvents.push({
                    internalInstance: getOpaqueNode(fiber),
                    data: getDataFiber(fiber),
                    renderer: rid,
                    type: "updateProfileTimes"
                }));
            }
            function enqueueUnmount(fiber) {
                var isRoot = fiber.tag === HostRoot, opaqueNode = getOpaqueNode(fiber), event = {
                    internalInstance: opaqueNode,
                    renderer: rid,
                    type: "unmount"
                };
                isRoot ? pendingEvents.push(event) : pendingEvents.unshift(event), opaqueNodes["delete"](opaqueNode);
            }
            function markRootCommitted(fiber) {
                pendingEvents.push({
                    internalInstance: getOpaqueNode(fiber),
                    data: getDataFiber(fiber),
                    renderer: rid,
                    type: "rootCommitted"
                });
            }
            function mountFiber(fiber) {
                var node = fiber;
                outer: for (;;) if (node.child) node.child["return"] = node, node = node.child; else {
                    if (enqueueMount(node), node == fiber) return;
                    if (!node.sibling) {
                        for (;node["return"]; ) {
                            if (node = node["return"], enqueueMount(node), node == fiber) return;
                            if (node.sibling) {
                                node.sibling["return"] = node["return"], node = node.sibling;
                                continue outer;
                            }
                        }
                        return;
                    }
                    node.sibling["return"] = node["return"], node = node.sibling;
                }
            }
            function updateFiber(nextFiber, prevFiber) {
                var hasChildOrderChanged = !1;
                if (nextFiber.child !== prevFiber.child) {
                    for (var nextChild = nextFiber.child, prevChildAtSameIndex = prevFiber.child; nextChild; ) {
                        if (nextChild.alternate) {
                            var prevChild = nextChild.alternate;
                            updateFiber(nextChild, prevChild), hasChildOrderChanged || prevChild === prevChildAtSameIndex || (hasChildOrderChanged = !0);
                        } else mountFiber(nextChild), hasChildOrderChanged || (hasChildOrderChanged = !0);
                        nextChild = nextChild.sibling, hasChildOrderChanged || null == prevChildAtSameIndex || (prevChildAtSameIndex = prevChildAtSameIndex.sibling);
                    }
                    hasChildOrderChanged || null == prevChildAtSameIndex || (hasChildOrderChanged = !0);
                }
                enqueueUpdateIfNecessary(nextFiber, hasChildOrderChanged);
            }
            function walkTree() {
                hook.getFiberRoots(rid).forEach(function(root) {
                    mountFiber(root.current), markRootCommitted(root.current);
                }), flushPendingEvents();
            }
            function cleanup() {}
            function handleCommitFiberUnmount(fiber) {
                enqueueUnmount(fiber);
            }
            function handleCommitFiberRoot(root) {
                var current = root.current, alternate = current.alternate;
                if (alternate) {
                    var wasMounted = null != alternate.memoizedState && null != alternate.memoizedState.element, isMounted = null != current.memoizedState && null != current.memoizedState.element;
                    !wasMounted && isMounted ? mountFiber(current) : wasMounted && isMounted ? updateFiber(current, alternate) : wasMounted && !isMounted && enqueueUnmount(current);
                } else mountFiber(current);
                markRootCommitted(current), flushPendingEvents();
            }
            function getNativeFromReactElement(fiber) {
                try {
                    var opaqueNode = fiber, hostInstance = renderer.findHostInstanceByFiber(opaqueNode);
                    return hostInstance;
                } catch (err) {
                    return null;
                }
            }
            function getReactElementFromNative(hostInstance) {
                var fiber = renderer.findFiberByHostInstance(hostInstance);
                if (null != fiber) {
                    var opaqueNode = getOpaqueNode(fiber);
                    return opaqueNode;
                }
                return null;
            }
            var _getInternalReactCons = getInternalReactConstants(renderer.version), ReactTypeOfWork = _getInternalReactCons.ReactTypeOfWork, ReactSymbols = _getInternalReactCons.ReactSymbols, ReactTypeOfSideEffect = _getInternalReactCons.ReactTypeOfSideEffect, PerformedWork = ReactTypeOfSideEffect.PerformedWork, FunctionalComponent = ReactTypeOfWork.FunctionalComponent, ClassComponent = ReactTypeOfWork.ClassComponent, ContextConsumer = ReactTypeOfWork.ContextConsumer, HostRoot = ReactTypeOfWork.HostRoot, HostPortal = ReactTypeOfWork.HostPortal, HostComponent = ReactTypeOfWork.HostComponent, HostText = ReactTypeOfWork.HostText, Fragment = ReactTypeOfWork.Fragment, ForwardRef = ReactTypeOfWork.ForwardRef, CONCURRENT_MODE_NUMBER = ReactSymbols.CONCURRENT_MODE_NUMBER, CONCURRENT_MODE_SYMBOL_STRING = ReactSymbols.CONCURRENT_MODE_SYMBOL_STRING, DEPRECATED_ASYNC_MODE_SYMBOL_STRING = ReactSymbols.DEPRECATED_ASYNC_MODE_SYMBOL_STRING, CONTEXT_CONSUMER_NUMBER = ReactSymbols.CONTEXT_CONSUMER_NUMBER, CONTEXT_CONSUMER_SYMBOL_STRING = ReactSymbols.CONTEXT_CONSUMER_SYMBOL_STRING, CONTEXT_PROVIDER_NUMBER = ReactSymbols.CONTEXT_PROVIDER_NUMBER, CONTEXT_PROVIDER_SYMBOL_STRING = ReactSymbols.CONTEXT_PROVIDER_SYMBOL_STRING, PROFILER_NUMBER = ReactSymbols.PROFILER_NUMBER, PROFILER_SYMBOL_STRING = ReactSymbols.PROFILER_SYMBOL_STRING, PURE_NUMBER = ReactSymbols.PURE_NUMBER, PURE_SYMBOL_STRING = ReactSymbols.PURE_SYMBOL_STRING, STRICT_MODE_NUMBER = ReactSymbols.STRICT_MODE_NUMBER, STRICT_MODE_SYMBOL_STRING = ReactSymbols.STRICT_MODE_SYMBOL_STRING, SUSPENSE_NUMBER = ReactSymbols.SUSPENSE_NUMBER, SUSPENSE_SYMBOL_STRING = ReactSymbols.SUSPENSE_SYMBOL_STRING, DEPRECATED_PLACEHOLDER_SYMBOL_STRING = ReactSymbols.DEPRECATED_PLACEHOLDER_SYMBOL_STRING, opaqueNodes = new Set(), pendingEvents = [];
            return {
                getNativeFromReactElement: getNativeFromReactElement,
                getReactElementFromNative: getReactElementFromNative,
                handleCommitFiberRoot: handleCommitFiberRoot,
                handleCommitFiberUnmount: handleCommitFiberUnmount,
                cleanup: cleanup,
                walkTree: walkTree
            };
        }
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, semver = __webpack_require__(45), copyWithSet = __webpack_require__(39), getDisplayName = __webpack_require__(40);
        module.exports = attachRendererFiber;
    }, function(module, exports, __webpack_require__) {
        (function(process) {
            function parse(version, loose) {
                if (version instanceof SemVer) return version;
                if ("string" != typeof version) return null;
                if (version.length > MAX_LENGTH) return null;
                var r = loose ? re[LOOSE] : re[FULL];
                if (!r.test(version)) return null;
                try {
                    return new SemVer(version, loose);
                } catch (er) {
                    return null;
                }
            }
            function valid(version, loose) {
                var v = parse(version, loose);
                return v ? v.version : null;
            }
            function clean(version, loose) {
                var s = parse(version.trim().replace(/^[=v]+/, ""), loose);
                return s ? s.version : null;
            }
            function SemVer(version, loose) {
                if (version instanceof SemVer) {
                    if (version.loose === loose) return version;
                    version = version.version;
                } else if ("string" != typeof version) throw new TypeError("Invalid Version: " + version);
                if (version.length > MAX_LENGTH) throw new TypeError("version is longer than " + MAX_LENGTH + " characters");
                if (!(this instanceof SemVer)) return new SemVer(version, loose);
                debug("SemVer", version, loose), this.loose = loose;
                var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);
                if (!m) throw new TypeError("Invalid Version: " + version);
                if (this.raw = version, this.major = +m[1], this.minor = +m[2], this.patch = +m[3], 
                this.major > MAX_SAFE_INTEGER || this.major < 0) throw new TypeError("Invalid major version");
                if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) throw new TypeError("Invalid minor version");
                if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) throw new TypeError("Invalid patch version");
                m[4] ? this.prerelease = m[4].split(".").map(function(id) {
                    if (/^[0-9]+$/.test(id)) {
                        var num = +id;
                        if (num >= 0 && num < MAX_SAFE_INTEGER) return num;
                    }
                    return id;
                }) : this.prerelease = [], this.build = m[5] ? m[5].split(".") : [], this.format();
            }
            function inc(version, release, loose, identifier) {
                "string" == typeof loose && (identifier = loose, loose = void 0);
                try {
                    return new SemVer(version, loose).inc(release, identifier).version;
                } catch (er) {
                    return null;
                }
            }
            function diff(version1, version2) {
                if (eq(version1, version2)) return null;
                var v1 = parse(version1), v2 = parse(version2);
                if (v1.prerelease.length || v2.prerelease.length) {
                    for (var key in v1) if (("major" === key || "minor" === key || "patch" === key) && v1[key] !== v2[key]) return "pre" + key;
                    return "prerelease";
                }
                for (var key in v1) if (("major" === key || "minor" === key || "patch" === key) && v1[key] !== v2[key]) return key;
            }
            function compareIdentifiers(a, b) {
                var anum = numeric.test(a), bnum = numeric.test(b);
                return anum && bnum && (a = +a, b = +b), anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : a > b ? 1 : 0;
            }
            function rcompareIdentifiers(a, b) {
                return compareIdentifiers(b, a);
            }
            function major(a, loose) {
                return new SemVer(a, loose).major;
            }
            function minor(a, loose) {
                return new SemVer(a, loose).minor;
            }
            function patch(a, loose) {
                return new SemVer(a, loose).patch;
            }
            function compare(a, b, loose) {
                return new SemVer(a, loose).compare(new SemVer(b, loose));
            }
            function compareLoose(a, b) {
                return compare(a, b, !0);
            }
            function rcompare(a, b, loose) {
                return compare(b, a, loose);
            }
            function sort(list, loose) {
                return list.sort(function(a, b) {
                    return exports.compare(a, b, loose);
                });
            }
            function rsort(list, loose) {
                return list.sort(function(a, b) {
                    return exports.rcompare(a, b, loose);
                });
            }
            function gt(a, b, loose) {
                return compare(a, b, loose) > 0;
            }
            function lt(a, b, loose) {
                return compare(a, b, loose) < 0;
            }
            function eq(a, b, loose) {
                return 0 === compare(a, b, loose);
            }
            function neq(a, b, loose) {
                return 0 !== compare(a, b, loose);
            }
            function gte(a, b, loose) {
                return compare(a, b, loose) >= 0;
            }
            function lte(a, b, loose) {
                return compare(a, b, loose) <= 0;
            }
            function cmp(a, op, b, loose) {
                var ret;
                switch (op) {
                  case "===":
                    "object" == typeof a && (a = a.version), "object" == typeof b && (b = b.version), 
                    ret = a === b;
                    break;

                  case "!==":
                    "object" == typeof a && (a = a.version), "object" == typeof b && (b = b.version), 
                    ret = a !== b;
                    break;

                  case "":
                  case "=":
                  case "==":
                    ret = eq(a, b, loose);
                    break;

                  case "!=":
                    ret = neq(a, b, loose);
                    break;

                  case ">":
                    ret = gt(a, b, loose);
                    break;

                  case ">=":
                    ret = gte(a, b, loose);
                    break;

                  case "<":
                    ret = lt(a, b, loose);
                    break;

                  case "<=":
                    ret = lte(a, b, loose);
                    break;

                  default:
                    throw new TypeError("Invalid operator: " + op);
                }
                return ret;
            }
            function Comparator(comp, loose) {
                if (comp instanceof Comparator) {
                    if (comp.loose === loose) return comp;
                    comp = comp.value;
                }
                return this instanceof Comparator ? (debug("comparator", comp, loose), this.loose = loose, 
                this.parse(comp), this.semver === ANY ? this.value = "" : this.value = this.operator + this.semver.version, 
                void debug("comp", this)) : new Comparator(comp, loose);
            }
            function Range(range, loose) {
                if (range instanceof Range) return range.loose === loose ? range : new Range(range.raw, loose);
                if (range instanceof Comparator) return new Range(range.value, loose);
                if (!(this instanceof Range)) return new Range(range, loose);
                if (this.loose = loose, this.raw = range, this.set = range.split(/\s*\|\|\s*/).map(function(range) {
                    return this.parseRange(range.trim());
                }, this).filter(function(c) {
                    return c.length;
                }), !this.set.length) throw new TypeError("Invalid SemVer Range: " + range);
                this.format();
            }
            function toComparators(range, loose) {
                return new Range(range, loose).set.map(function(comp) {
                    return comp.map(function(c) {
                        return c.value;
                    }).join(" ").trim().split(" ");
                });
            }
            function parseComparator(comp, loose) {
                return debug("comp", comp), comp = replaceCarets(comp, loose), debug("caret", comp), 
                comp = replaceTildes(comp, loose), debug("tildes", comp), comp = replaceXRanges(comp, loose), 
                debug("xrange", comp), comp = replaceStars(comp, loose), debug("stars", comp), comp;
            }
            function isX(id) {
                return !id || "x" === id.toLowerCase() || "*" === id;
            }
            function replaceTildes(comp, loose) {
                return comp.trim().split(/\s+/).map(function(comp) {
                    return replaceTilde(comp, loose);
                }).join(" ");
            }
            function replaceTilde(comp, loose) {
                var r = loose ? re[TILDELOOSE] : re[TILDE];
                return comp.replace(r, function(_, M, m, p, pr) {
                    debug("tilde", comp, _, M, m, p, pr);
                    var ret;
                    return isX(M) ? ret = "" : isX(m) ? ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0" : isX(p) ? ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0" : pr ? (debug("replaceTilde pr", pr), 
                    "-" !== pr.charAt(0) && (pr = "-" + pr), ret = ">=" + M + "." + m + "." + p + pr + " <" + M + "." + (+m + 1) + ".0") : ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0", 
                    debug("tilde return", ret), ret;
                });
            }
            function replaceCarets(comp, loose) {
                return comp.trim().split(/\s+/).map(function(comp) {
                    return replaceCaret(comp, loose);
                }).join(" ");
            }
            function replaceCaret(comp, loose) {
                debug("caret", comp, loose);
                var r = loose ? re[CARETLOOSE] : re[CARET];
                return comp.replace(r, function(_, M, m, p, pr) {
                    debug("caret", comp, _, M, m, p, pr);
                    var ret;
                    return isX(M) ? ret = "" : isX(m) ? ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0" : isX(p) ? ret = "0" === M ? ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0" : ">=" + M + "." + m + ".0 <" + (+M + 1) + ".0.0" : pr ? (debug("replaceCaret pr", pr), 
                    "-" !== pr.charAt(0) && (pr = "-" + pr), ret = "0" === M ? "0" === m ? ">=" + M + "." + m + "." + p + pr + " <" + M + "." + m + "." + (+p + 1) : ">=" + M + "." + m + "." + p + pr + " <" + M + "." + (+m + 1) + ".0" : ">=" + M + "." + m + "." + p + pr + " <" + (+M + 1) + ".0.0") : (debug("no pr"), 
                    ret = "0" === M ? "0" === m ? ">=" + M + "." + m + "." + p + " <" + M + "." + m + "." + (+p + 1) : ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0" : ">=" + M + "." + m + "." + p + " <" + (+M + 1) + ".0.0"), 
                    debug("caret return", ret), ret;
                });
            }
            function replaceXRanges(comp, loose) {
                return debug("replaceXRanges", comp, loose), comp.split(/\s+/).map(function(comp) {
                    return replaceXRange(comp, loose);
                }).join(" ");
            }
            function replaceXRange(comp, loose) {
                comp = comp.trim();
                var r = loose ? re[XRANGELOOSE] : re[XRANGE];
                return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
                    debug("xRange", comp, ret, gtlt, M, m, p, pr);
                    var xM = isX(M), xm = xM || isX(m), xp = xm || isX(p), anyX = xp;
                    return "=" === gtlt && anyX && (gtlt = ""), xM ? ret = ">" === gtlt || "<" === gtlt ? "<0.0.0" : "*" : gtlt && anyX ? (xm && (m = 0), 
                    xp && (p = 0), ">" === gtlt ? (gtlt = ">=", xm ? (M = +M + 1, m = 0, p = 0) : xp && (m = +m + 1, 
                    p = 0)) : "<=" === gtlt && (gtlt = "<", xm ? M = +M + 1 : m = +m + 1), ret = gtlt + M + "." + m + "." + p) : xm ? ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0" : xp && (ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0"), 
                    debug("xRange return", ret), ret;
                });
            }
            function replaceStars(comp, loose) {
                return debug("replaceStars", comp, loose), comp.trim().replace(re[STAR], "");
            }
            function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
                return from = isX(fM) ? "" : isX(fm) ? ">=" + fM + ".0.0" : isX(fp) ? ">=" + fM + "." + fm + ".0" : ">=" + from, 
                to = isX(tM) ? "" : isX(tm) ? "<" + (+tM + 1) + ".0.0" : isX(tp) ? "<" + tM + "." + (+tm + 1) + ".0" : tpr ? "<=" + tM + "." + tm + "." + tp + "-" + tpr : "<=" + to, 
                (from + " " + to).trim();
            }
            function testSet(set, version) {
                for (var i = 0; i < set.length; i++) if (!set[i].test(version)) return !1;
                if (version.prerelease.length) {
                    for (var i = 0; i < set.length; i++) if (debug(set[i].semver), set[i].semver !== ANY && set[i].semver.prerelease.length > 0) {
                        var allowed = set[i].semver;
                        if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) return !0;
                    }
                    return !1;
                }
                return !0;
            }
            function satisfies(version, range, loose) {
                try {
                    range = new Range(range, loose);
                } catch (er) {
                    return !1;
                }
                return range.test(version);
            }
            function maxSatisfying(versions, range, loose) {
                var max = null, maxSV = null;
                try {
                    var rangeObj = new Range(range, loose);
                } catch (er) {
                    return null;
                }
                return versions.forEach(function(v) {
                    rangeObj.test(v) && (max && maxSV.compare(v) !== -1 || (max = v, maxSV = new SemVer(max, loose)));
                }), max;
            }
            function minSatisfying(versions, range, loose) {
                var min = null, minSV = null;
                try {
                    var rangeObj = new Range(range, loose);
                } catch (er) {
                    return null;
                }
                return versions.forEach(function(v) {
                    rangeObj.test(v) && (min && 1 !== minSV.compare(v) || (min = v, minSV = new SemVer(min, loose)));
                }), min;
            }
            function validRange(range, loose) {
                try {
                    return new Range(range, loose).range || "*";
                } catch (er) {
                    return null;
                }
            }
            function ltr(version, range, loose) {
                return outside(version, range, "<", loose);
            }
            function gtr(version, range, loose) {
                return outside(version, range, ">", loose);
            }
            function outside(version, range, hilo, loose) {
                version = new SemVer(version, loose), range = new Range(range, loose);
                var gtfn, ltefn, ltfn, comp, ecomp;
                switch (hilo) {
                  case ">":
                    gtfn = gt, ltefn = lte, ltfn = lt, comp = ">", ecomp = ">=";
                    break;

                  case "<":
                    gtfn = lt, ltefn = gte, ltfn = gt, comp = "<", ecomp = "<=";
                    break;

                  default:
                    throw new TypeError('Must provide a hilo val of "<" or ">"');
                }
                if (satisfies(version, range, loose)) return !1;
                for (var i = 0; i < range.set.length; ++i) {
                    var comparators = range.set[i], high = null, low = null;
                    if (comparators.forEach(function(comparator) {
                        comparator.semver === ANY && (comparator = new Comparator(">=0.0.0")), high = high || comparator, 
                        low = low || comparator, gtfn(comparator.semver, high.semver, loose) ? high = comparator : ltfn(comparator.semver, low.semver, loose) && (low = comparator);
                    }), high.operator === comp || high.operator === ecomp) return !1;
                    if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) return !1;
                    if (low.operator === ecomp && ltfn(version, low.semver)) return !1;
                }
                return !0;
            }
            function prerelease(version, loose) {
                var parsed = parse(version, loose);
                return parsed && parsed.prerelease.length ? parsed.prerelease : null;
            }
            function intersects(r1, r2, loose) {
                return r1 = new Range(r1, loose), r2 = new Range(r2, loose), r1.intersects(r2);
            }
            function coerce(version) {
                if (version instanceof SemVer) return version;
                if ("string" != typeof version) return null;
                var match = version.match(re[COERCE]);
                return null == match ? null : parse((match[1] || "0") + "." + (match[2] || "0") + "." + (match[3] || "0"));
            }
            exports = module.exports = SemVer;
            var debug;
            debug = "object" == typeof process && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? function() {
                var args = Array.prototype.slice.call(arguments, 0);
                args.unshift("SEMVER"), console.log.apply(console, args);
            } : function() {}, exports.SEMVER_SPEC_VERSION = "2.0.0";
            var MAX_LENGTH = 256, MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991, MAX_SAFE_COMPONENT_LENGTH = 16, re = exports.re = [], src = exports.src = [], R = 0, NUMERICIDENTIFIER = R++;
            src[NUMERICIDENTIFIER] = "0|[1-9]\\d*";
            var NUMERICIDENTIFIERLOOSE = R++;
            src[NUMERICIDENTIFIERLOOSE] = "[0-9]+";
            var NONNUMERICIDENTIFIER = R++;
            src[NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
            var MAINVERSION = R++;
            src[MAINVERSION] = "(" + src[NUMERICIDENTIFIER] + ")\\.(" + src[NUMERICIDENTIFIER] + ")\\.(" + src[NUMERICIDENTIFIER] + ")";
            var MAINVERSIONLOOSE = R++;
            src[MAINVERSIONLOOSE] = "(" + src[NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[NUMERICIDENTIFIERLOOSE] + ")\\.(" + src[NUMERICIDENTIFIERLOOSE] + ")";
            var PRERELEASEIDENTIFIER = R++;
            src[PRERELEASEIDENTIFIER] = "(?:" + src[NUMERICIDENTIFIER] + "|" + src[NONNUMERICIDENTIFIER] + ")";
            var PRERELEASEIDENTIFIERLOOSE = R++;
            src[PRERELEASEIDENTIFIERLOOSE] = "(?:" + src[NUMERICIDENTIFIERLOOSE] + "|" + src[NONNUMERICIDENTIFIER] + ")";
            var PRERELEASE = R++;
            src[PRERELEASE] = "(?:-(" + src[PRERELEASEIDENTIFIER] + "(?:\\." + src[PRERELEASEIDENTIFIER] + ")*))";
            var PRERELEASELOOSE = R++;
            src[PRERELEASELOOSE] = "(?:-?(" + src[PRERELEASEIDENTIFIERLOOSE] + "(?:\\." + src[PRERELEASEIDENTIFIERLOOSE] + ")*))";
            var BUILDIDENTIFIER = R++;
            src[BUILDIDENTIFIER] = "[0-9A-Za-z-]+";
            var BUILD = R++;
            src[BUILD] = "(?:\\+(" + src[BUILDIDENTIFIER] + "(?:\\." + src[BUILDIDENTIFIER] + ")*))";
            var FULL = R++, FULLPLAIN = "v?" + src[MAINVERSION] + src[PRERELEASE] + "?" + src[BUILD] + "?";
            src[FULL] = "^" + FULLPLAIN + "$";
            var LOOSEPLAIN = "[v=\\s]*" + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + "?" + src[BUILD] + "?", LOOSE = R++;
            src[LOOSE] = "^" + LOOSEPLAIN + "$";
            var GTLT = R++;
            src[GTLT] = "((?:<|>)?=?)";
            var XRANGEIDENTIFIERLOOSE = R++;
            src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
            var XRANGEIDENTIFIER = R++;
            src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + "|x|X|\\*";
            var XRANGEPLAIN = R++;
            src[XRANGEPLAIN] = "[v=\\s]*(" + src[XRANGEIDENTIFIER] + ")(?:\\.(" + src[XRANGEIDENTIFIER] + ")(?:\\.(" + src[XRANGEIDENTIFIER] + ")(?:" + src[PRERELEASE] + ")?" + src[BUILD] + "?)?)?";
            var XRANGEPLAINLOOSE = R++;
            src[XRANGEPLAINLOOSE] = "[v=\\s]*(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")(?:" + src[PRERELEASELOOSE] + ")?" + src[BUILD] + "?)?)?";
            var XRANGE = R++;
            src[XRANGE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAIN] + "$";
            var XRANGELOOSE = R++;
            src[XRANGELOOSE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAINLOOSE] + "$";
            var COERCE = R++;
            src[COERCE] = "(?:^|[^\\d])(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "})(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?(?:$|[^\\d])";
            var LONETILDE = R++;
            src[LONETILDE] = "(?:~>?)";
            var TILDETRIM = R++;
            src[TILDETRIM] = "(\\s*)" + src[LONETILDE] + "\\s+", re[TILDETRIM] = new RegExp(src[TILDETRIM], "g");
            var tildeTrimReplace = "$1~", TILDE = R++;
            src[TILDE] = "^" + src[LONETILDE] + src[XRANGEPLAIN] + "$";
            var TILDELOOSE = R++;
            src[TILDELOOSE] = "^" + src[LONETILDE] + src[XRANGEPLAINLOOSE] + "$";
            var LONECARET = R++;
            src[LONECARET] = "(?:\\^)";
            var CARETTRIM = R++;
            src[CARETTRIM] = "(\\s*)" + src[LONECARET] + "\\s+", re[CARETTRIM] = new RegExp(src[CARETTRIM], "g");
            var caretTrimReplace = "$1^", CARET = R++;
            src[CARET] = "^" + src[LONECARET] + src[XRANGEPLAIN] + "$";
            var CARETLOOSE = R++;
            src[CARETLOOSE] = "^" + src[LONECARET] + src[XRANGEPLAINLOOSE] + "$";
            var COMPARATORLOOSE = R++;
            src[COMPARATORLOOSE] = "^" + src[GTLT] + "\\s*(" + LOOSEPLAIN + ")$|^$";
            var COMPARATOR = R++;
            src[COMPARATOR] = "^" + src[GTLT] + "\\s*(" + FULLPLAIN + ")$|^$";
            var COMPARATORTRIM = R++;
            src[COMPARATORTRIM] = "(\\s*)" + src[GTLT] + "\\s*(" + LOOSEPLAIN + "|" + src[XRANGEPLAIN] + ")", 
            re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], "g");
            var comparatorTrimReplace = "$1$2$3", HYPHENRANGE = R++;
            src[HYPHENRANGE] = "^\\s*(" + src[XRANGEPLAIN] + ")\\s+-\\s+(" + src[XRANGEPLAIN] + ")\\s*$";
            var HYPHENRANGELOOSE = R++;
            src[HYPHENRANGELOOSE] = "^\\s*(" + src[XRANGEPLAINLOOSE] + ")\\s+-\\s+(" + src[XRANGEPLAINLOOSE] + ")\\s*$";
            var STAR = R++;
            src[STAR] = "(<|>)?=?\\s*\\*";
            for (var i = 0; i < R; i++) debug(i, src[i]), re[i] || (re[i] = new RegExp(src[i]));
            exports.parse = parse, exports.valid = valid, exports.clean = clean, exports.SemVer = SemVer, 
            SemVer.prototype.format = function() {
                return this.version = this.major + "." + this.minor + "." + this.patch, this.prerelease.length && (this.version += "-" + this.prerelease.join(".")), 
                this.version;
            }, SemVer.prototype.toString = function() {
                return this.version;
            }, SemVer.prototype.compare = function(other) {
                return debug("SemVer.compare", this.version, this.loose, other), other instanceof SemVer || (other = new SemVer(other, this.loose)), 
                this.compareMain(other) || this.comparePre(other);
            }, SemVer.prototype.compareMain = function(other) {
                return other instanceof SemVer || (other = new SemVer(other, this.loose)), compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
            }, SemVer.prototype.comparePre = function(other) {
                if (other instanceof SemVer || (other = new SemVer(other, this.loose)), this.prerelease.length && !other.prerelease.length) return -1;
                if (!this.prerelease.length && other.prerelease.length) return 1;
                if (!this.prerelease.length && !other.prerelease.length) return 0;
                var i = 0;
                do {
                    var a = this.prerelease[i], b = other.prerelease[i];
                    if (debug("prerelease compare", i, a, b), void 0 === a && void 0 === b) return 0;
                    if (void 0 === b) return 1;
                    if (void 0 === a) return -1;
                    if (a !== b) return compareIdentifiers(a, b);
                } while (++i);
            }, SemVer.prototype.inc = function(release, identifier) {
                switch (release) {
                  case "premajor":
                    this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", identifier);
                    break;

                  case "preminor":
                    this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", identifier);
                    break;

                  case "prepatch":
                    this.prerelease.length = 0, this.inc("patch", identifier), this.inc("pre", identifier);
                    break;

                  case "prerelease":
                    0 === this.prerelease.length && this.inc("patch", identifier), this.inc("pre", identifier);
                    break;

                  case "major":
                    0 === this.minor && 0 === this.patch && 0 !== this.prerelease.length || this.major++, 
                    this.minor = 0, this.patch = 0, this.prerelease = [];
                    break;

                  case "minor":
                    0 === this.patch && 0 !== this.prerelease.length || this.minor++, this.patch = 0, 
                    this.prerelease = [];
                    break;

                  case "patch":
                    0 === this.prerelease.length && this.patch++, this.prerelease = [];
                    break;

                  case "pre":
                    if (0 === this.prerelease.length) this.prerelease = [ 0 ]; else {
                        for (var i = this.prerelease.length; --i >= 0; ) "number" == typeof this.prerelease[i] && (this.prerelease[i]++, 
                        i = -2);
                        i === -1 && this.prerelease.push(0);
                    }
                    identifier && (this.prerelease[0] === identifier ? isNaN(this.prerelease[1]) && (this.prerelease = [ identifier, 0 ]) : this.prerelease = [ identifier, 0 ]);
                    break;

                  default:
                    throw new Error("invalid increment argument: " + release);
                }
                return this.format(), this.raw = this.version, this;
            }, exports.inc = inc, exports.diff = diff, exports.compareIdentifiers = compareIdentifiers;
            var numeric = /^[0-9]+$/;
            exports.rcompareIdentifiers = rcompareIdentifiers, exports.major = major, exports.minor = minor, 
            exports.patch = patch, exports.compare = compare, exports.compareLoose = compareLoose, 
            exports.rcompare = rcompare, exports.sort = sort, exports.rsort = rsort, exports.gt = gt, 
            exports.lt = lt, exports.eq = eq, exports.neq = neq, exports.gte = gte, exports.lte = lte, 
            exports.cmp = cmp, exports.Comparator = Comparator;
            var ANY = {};
            Comparator.prototype.parse = function(comp) {
                var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR], m = comp.match(r);
                if (!m) throw new TypeError("Invalid comparator: " + comp);
                this.operator = m[1], "=" === this.operator && (this.operator = ""), m[2] ? this.semver = new SemVer(m[2], this.loose) : this.semver = ANY;
            }, Comparator.prototype.toString = function() {
                return this.value;
            }, Comparator.prototype.test = function(version) {
                return debug("Comparator.test", version, this.loose), this.semver === ANY || ("string" == typeof version && (version = new SemVer(version, this.loose)), 
                cmp(version, this.operator, this.semver, this.loose));
            }, Comparator.prototype.intersects = function(comp, loose) {
                if (!(comp instanceof Comparator)) throw new TypeError("a Comparator is required");
                var rangeTmp;
                if ("" === this.operator) return rangeTmp = new Range(comp.value, loose), satisfies(this.value, rangeTmp, loose);
                if ("" === comp.operator) return rangeTmp = new Range(this.value, loose), satisfies(comp.semver, rangeTmp, loose);
                var sameDirectionIncreasing = !(">=" !== this.operator && ">" !== this.operator || ">=" !== comp.operator && ">" !== comp.operator), sameDirectionDecreasing = !("<=" !== this.operator && "<" !== this.operator || "<=" !== comp.operator && "<" !== comp.operator), sameSemVer = this.semver.version === comp.semver.version, differentDirectionsInclusive = !(">=" !== this.operator && "<=" !== this.operator || ">=" !== comp.operator && "<=" !== comp.operator), oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, loose) && (">=" === this.operator || ">" === this.operator) && ("<=" === comp.operator || "<" === comp.operator), oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, loose) && ("<=" === this.operator || "<" === this.operator) && (">=" === comp.operator || ">" === comp.operator);
                return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
            }, exports.Range = Range, Range.prototype.format = function() {
                return this.range = this.set.map(function(comps) {
                    return comps.join(" ").trim();
                }).join("||").trim(), this.range;
            }, Range.prototype.toString = function() {
                return this.range;
            }, Range.prototype.parseRange = function(range) {
                var loose = this.loose;
                range = range.trim(), debug("range", range, loose);
                var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
                range = range.replace(hr, hyphenReplace), debug("hyphen replace", range), range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace), 
                debug("comparator trim", range, re[COMPARATORTRIM]), range = range.replace(re[TILDETRIM], tildeTrimReplace), 
                range = range.replace(re[CARETTRIM], caretTrimReplace), range = range.split(/\s+/).join(" ");
                var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR], set = range.split(" ").map(function(comp) {
                    return parseComparator(comp, loose);
                }).join(" ").split(/\s+/);
                return this.loose && (set = set.filter(function(comp) {
                    return !!comp.match(compRe);
                })), set = set.map(function(comp) {
                    return new Comparator(comp, loose);
                });
            }, Range.prototype.intersects = function(range, loose) {
                if (!(range instanceof Range)) throw new TypeError("a Range is required");
                return this.set.some(function(thisComparators) {
                    return thisComparators.every(function(thisComparator) {
                        return range.set.some(function(rangeComparators) {
                            return rangeComparators.every(function(rangeComparator) {
                                return thisComparator.intersects(rangeComparator, loose);
                            });
                        });
                    });
                });
            }, exports.toComparators = toComparators, Range.prototype.test = function(version) {
                if (!version) return !1;
                "string" == typeof version && (version = new SemVer(version, this.loose));
                for (var i = 0; i < this.set.length; i++) if (testSet(this.set[i], version)) return !0;
                return !1;
            }, exports.satisfies = satisfies, exports.maxSatisfying = maxSatisfying, exports.minSatisfying = minSatisfying, 
            exports.validRange = validRange, exports.ltr = ltr, exports.gtr = gtr, exports.outside = outside, 
            exports.prerelease = prerelease, exports.intersects = intersects, exports.coerce = coerce;
        }).call(exports, __webpack_require__(46));
    }, function(module, exports) {
        function defaultSetTimout() {
            throw new Error("setTimeout has not been defined");
        }
        function defaultClearTimeout() {
            throw new Error("clearTimeout has not been defined");
        }
        function runTimeout(fun) {
            if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
            if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) return cachedSetTimeout = setTimeout, 
            setTimeout(fun, 0);
            try {
                return cachedSetTimeout(fun, 0);
            } catch (e) {
                try {
                    return cachedSetTimeout.call(null, fun, 0);
                } catch (e) {
                    return cachedSetTimeout.call(this, fun, 0);
                }
            }
        }
        function runClearTimeout(marker) {
            if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
            if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) return cachedClearTimeout = clearTimeout, 
            clearTimeout(marker);
            try {
                return cachedClearTimeout(marker);
            } catch (e) {
                try {
                    return cachedClearTimeout.call(null, marker);
                } catch (e) {
                    return cachedClearTimeout.call(this, marker);
                }
            }
        }
        function cleanUpNextTick() {
            draining && currentQueue && (draining = !1, currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1, 
            queue.length && drainQueue());
        }
        function drainQueue() {
            if (!draining) {
                var timeout = runTimeout(cleanUpNextTick);
                draining = !0;
                for (var len = queue.length; len; ) {
                    for (currentQueue = queue, queue = []; ++queueIndex < len; ) currentQueue && currentQueue[queueIndex].run();
                    queueIndex = -1, len = queue.length;
                }
                currentQueue = null, draining = !1, runClearTimeout(timeout);
            }
        }
        function Item(fun, array) {
            this.fun = fun, this.array = array;
        }
        function noop() {}
        var cachedSetTimeout, cachedClearTimeout, process = module.exports = {};
        !function() {
            try {
                cachedSetTimeout = "function" == typeof setTimeout ? setTimeout : defaultSetTimout;
            } catch (e) {
                cachedSetTimeout = defaultSetTimout;
            }
            try {
                cachedClearTimeout = "function" == typeof clearTimeout ? clearTimeout : defaultClearTimeout;
            } catch (e) {
                cachedClearTimeout = defaultClearTimeout;
            }
        }();
        var currentQueue, queue = [], draining = !1, queueIndex = -1;
        process.nextTick = function(fun) {
            var args = new Array(arguments.length - 1);
            if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
            queue.push(new Item(fun, args)), 1 !== queue.length || draining || runTimeout(drainQueue);
        }, Item.prototype.run = function() {
            this.fun.apply(null, this.array);
        }, process.title = "browser", process.browser = !0, process.env = {}, process.argv = [], 
        process.version = "", process.versions = {}, process.on = noop, process.addListener = noop, 
        process.once = noop, process.off = noop, process.removeListener = noop, process.removeAllListeners = noop, 
        process.emit = noop, process.binding = function(name) {
            throw new Error("process.binding is not supported");
        }, process.cwd = function() {
            return "/";
        }, process.chdir = function(dir) {
            throw new Error("process.chdir is not supported");
        }, process.umask = function() {
            return 0;
        };
    }, function(module, exports, __webpack_require__) {
        (function(global) {
            "use strict";
            /*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
            function compare(a, b) {
                if (a === b) return 0;
                for (var x = a.length, y = b.length, i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
                    x = a[i], y = b[i];
                    break;
                }
                return x < y ? -1 : y < x ? 1 : 0;
            }
            function isBuffer(b) {
                return global.Buffer && "function" == typeof global.Buffer.isBuffer ? global.Buffer.isBuffer(b) : !(null == b || !b._isBuffer);
            }
            function pToString(obj) {
                return Object.prototype.toString.call(obj);
            }
            function isView(arrbuf) {
                return !isBuffer(arrbuf) && ("function" == typeof global.ArrayBuffer && ("function" == typeof ArrayBuffer.isView ? ArrayBuffer.isView(arrbuf) : !!arrbuf && (arrbuf instanceof DataView || !!(arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer))));
            }
            function getName(func) {
                if (util.isFunction(func)) {
                    if (functionsHaveNames) return func.name;
                    var str = func.toString(), match = str.match(regex);
                    return match && match[1];
                }
            }
            function truncate(s, n) {
                return "string" == typeof s ? s.length < n ? s : s.slice(0, n) : s;
            }
            function inspect(something) {
                if (functionsHaveNames || !util.isFunction(something)) return util.inspect(something);
                var rawname = getName(something), name = rawname ? ": " + rawname : "";
                return "[Function" + name + "]";
            }
            function getMessage(self) {
                return truncate(inspect(self.actual), 128) + " " + self.operator + " " + truncate(inspect(self.expected), 128);
            }
            function fail(actual, expected, message, operator, stackStartFunction) {
                throw new assert.AssertionError({
                    message: message,
                    actual: actual,
                    expected: expected,
                    operator: operator,
                    stackStartFunction: stackStartFunction
                });
            }
            function ok(value, message) {
                value || fail(value, !0, message, "==", assert.ok);
            }
            function _deepEqual(actual, expected, strict, memos) {
                if (actual === expected) return !0;
                if (isBuffer(actual) && isBuffer(expected)) return 0 === compare(actual, expected);
                if (util.isDate(actual) && util.isDate(expected)) return actual.getTime() === expected.getTime();
                if (util.isRegExp(actual) && util.isRegExp(expected)) return actual.source === expected.source && actual.global === expected.global && actual.multiline === expected.multiline && actual.lastIndex === expected.lastIndex && actual.ignoreCase === expected.ignoreCase;
                if (null !== actual && "object" == typeof actual || null !== expected && "object" == typeof expected) {
                    if (isView(actual) && isView(expected) && pToString(actual) === pToString(expected) && !(actual instanceof Float32Array || actual instanceof Float64Array)) return 0 === compare(new Uint8Array(actual.buffer), new Uint8Array(expected.buffer));
                    if (isBuffer(actual) !== isBuffer(expected)) return !1;
                    memos = memos || {
                        actual: [],
                        expected: []
                    };
                    var actualIndex = memos.actual.indexOf(actual);
                    return actualIndex !== -1 && actualIndex === memos.expected.indexOf(expected) || (memos.actual.push(actual), 
                    memos.expected.push(expected), objEquiv(actual, expected, strict, memos));
                }
                return strict ? actual === expected : actual == expected;
            }
            function isArguments(object) {
                return "[object Arguments]" == Object.prototype.toString.call(object);
            }
            function objEquiv(a, b, strict, actualVisitedObjects) {
                if (null === a || void 0 === a || null === b || void 0 === b) return !1;
                if (util.isPrimitive(a) || util.isPrimitive(b)) return a === b;
                if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return !1;
                var aIsArgs = isArguments(a), bIsArgs = isArguments(b);
                if (aIsArgs && !bIsArgs || !aIsArgs && bIsArgs) return !1;
                if (aIsArgs) return a = pSlice.call(a), b = pSlice.call(b), _deepEqual(a, b, strict);
                var key, i, ka = objectKeys(a), kb = objectKeys(b);
                if (ka.length !== kb.length) return !1;
                for (ka.sort(), kb.sort(), i = ka.length - 1; i >= 0; i--) if (ka[i] !== kb[i]) return !1;
                for (i = ka.length - 1; i >= 0; i--) if (key = ka[i], !_deepEqual(a[key], b[key], strict, actualVisitedObjects)) return !1;
                return !0;
            }
            function notDeepStrictEqual(actual, expected, message) {
                _deepEqual(actual, expected, !0) && fail(actual, expected, message, "notDeepStrictEqual", notDeepStrictEqual);
            }
            function expectedException(actual, expected) {
                if (!actual || !expected) return !1;
                if ("[object RegExp]" == Object.prototype.toString.call(expected)) return expected.test(actual);
                try {
                    if (actual instanceof expected) return !0;
                } catch (e) {}
                return !Error.isPrototypeOf(expected) && expected.call({}, actual) === !0;
            }
            function _tryBlock(block) {
                var error;
                try {
                    block();
                } catch (e) {
                    error = e;
                }
                return error;
            }
            function _throws(shouldThrow, block, expected, message) {
                var actual;
                if ("function" != typeof block) throw new TypeError('"block" argument must be a function');
                "string" == typeof expected && (message = expected, expected = null), actual = _tryBlock(block), 
                message = (expected && expected.name ? " (" + expected.name + ")." : ".") + (message ? " " + message : "."), 
                shouldThrow && !actual && fail(actual, expected, "Missing expected exception" + message);
                var userProvidedMessage = "string" == typeof message, isUnwantedException = !shouldThrow && util.isError(actual), isUnexpectedException = !shouldThrow && actual && !expected;
                if ((isUnwantedException && userProvidedMessage && expectedException(actual, expected) || isUnexpectedException) && fail(actual, expected, "Got unwanted exception" + message), 
                shouldThrow && actual && expected && !expectedException(actual, expected) || !shouldThrow && actual) throw actual;
            }
            var util = __webpack_require__(48), hasOwn = Object.prototype.hasOwnProperty, pSlice = Array.prototype.slice, functionsHaveNames = function() {
                return "foo" === function() {}.name;
            }(), assert = module.exports = ok, regex = /\s*function\s+([^\(\s]*)\s*/;
            assert.AssertionError = function(options) {
                this.name = "AssertionError", this.actual = options.actual, this.expected = options.expected, 
                this.operator = options.operator, options.message ? (this.message = options.message, 
                this.generatedMessage = !1) : (this.message = getMessage(this), this.generatedMessage = !0);
                var stackStartFunction = options.stackStartFunction || fail;
                if (Error.captureStackTrace) Error.captureStackTrace(this, stackStartFunction); else {
                    var err = new Error();
                    if (err.stack) {
                        var out = err.stack, fn_name = getName(stackStartFunction), idx = out.indexOf("\n" + fn_name);
                        if (idx >= 0) {
                            var next_line = out.indexOf("\n", idx + 1);
                            out = out.substring(next_line + 1);
                        }
                        this.stack = out;
                    }
                }
            }, util.inherits(assert.AssertionError, Error), assert.fail = fail, assert.ok = ok, 
            assert.equal = function(actual, expected, message) {
                actual != expected && fail(actual, expected, message, "==", assert.equal);
            }, assert.notEqual = function(actual, expected, message) {
                actual == expected && fail(actual, expected, message, "!=", assert.notEqual);
            }, assert.deepEqual = function(actual, expected, message) {
                _deepEqual(actual, expected, !1) || fail(actual, expected, message, "deepEqual", assert.deepEqual);
            }, assert.deepStrictEqual = function(actual, expected, message) {
                _deepEqual(actual, expected, !0) || fail(actual, expected, message, "deepStrictEqual", assert.deepStrictEqual);
            }, assert.notDeepEqual = function(actual, expected, message) {
                _deepEqual(actual, expected, !1) && fail(actual, expected, message, "notDeepEqual", assert.notDeepEqual);
            }, assert.notDeepStrictEqual = notDeepStrictEqual, assert.strictEqual = function(actual, expected, message) {
                actual !== expected && fail(actual, expected, message, "===", assert.strictEqual);
            }, assert.notStrictEqual = function(actual, expected, message) {
                actual === expected && fail(actual, expected, message, "!==", assert.notStrictEqual);
            }, assert["throws"] = function(block, error, message) {
                _throws(!0, block, error, message);
            }, assert.doesNotThrow = function(block, error, message) {
                _throws(!1, block, error, message);
            }, assert.ifError = function(err) {
                if (err) throw err;
            };
            var objectKeys = Object.keys || function(obj) {
                var keys = [];
                for (var key in obj) hasOwn.call(obj, key) && keys.push(key);
                return keys;
            };
        }).call(exports, function() {
            return this;
        }());
    }, function(module, exports, __webpack_require__) {
        (function(global, process) {
            function inspect(obj, opts) {
                var ctx = {
                    seen: [],
                    stylize: stylizeNoColor
                };
                return arguments.length >= 3 && (ctx.depth = arguments[2]), arguments.length >= 4 && (ctx.colors = arguments[3]), 
                isBoolean(opts) ? ctx.showHidden = opts : opts && exports._extend(ctx, opts), isUndefined(ctx.showHidden) && (ctx.showHidden = !1), 
                isUndefined(ctx.depth) && (ctx.depth = 2), isUndefined(ctx.colors) && (ctx.colors = !1), 
                isUndefined(ctx.customInspect) && (ctx.customInspect = !0), ctx.colors && (ctx.stylize = stylizeWithColor), 
                formatValue(ctx, obj, ctx.depth);
            }
            function stylizeWithColor(str, styleType) {
                var style = inspect.styles[styleType];
                return style ? "[" + inspect.colors[style][0] + "m" + str + "[" + inspect.colors[style][1] + "m" : str;
            }
            function stylizeNoColor(str, styleType) {
                return str;
            }
            function arrayToHash(array) {
                var hash = {};
                return array.forEach(function(val, idx) {
                    hash[val] = !0;
                }), hash;
            }
            function formatValue(ctx, value, recurseTimes) {
                if (ctx.customInspect && value && isFunction(value.inspect) && value.inspect !== exports.inspect && (!value.constructor || value.constructor.prototype !== value)) {
                    var ret = value.inspect(recurseTimes, ctx);
                    return isString(ret) || (ret = formatValue(ctx, ret, recurseTimes)), ret;
                }
                var primitive = formatPrimitive(ctx, value);
                if (primitive) return primitive;
                var keys = Object.keys(value), visibleKeys = arrayToHash(keys);
                if (ctx.showHidden && (keys = Object.getOwnPropertyNames(value)), isError(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) return formatError(value);
                if (0 === keys.length) {
                    if (isFunction(value)) {
                        var name = value.name ? ": " + value.name : "";
                        return ctx.stylize("[Function" + name + "]", "special");
                    }
                    if (isRegExp(value)) return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
                    if (isDate(value)) return ctx.stylize(Date.prototype.toString.call(value), "date");
                    if (isError(value)) return formatError(value);
                }
                var base = "", array = !1, braces = [ "{", "}" ];
                if (isArray(value) && (array = !0, braces = [ "[", "]" ]), isFunction(value)) {
                    var n = value.name ? ": " + value.name : "";
                    base = " [Function" + n + "]";
                }
                if (isRegExp(value) && (base = " " + RegExp.prototype.toString.call(value)), isDate(value) && (base = " " + Date.prototype.toUTCString.call(value)), 
                isError(value) && (base = " " + formatError(value)), 0 === keys.length && (!array || 0 == value.length)) return braces[0] + base + braces[1];
                if (recurseTimes < 0) return isRegExp(value) ? ctx.stylize(RegExp.prototype.toString.call(value), "regexp") : ctx.stylize("[Object]", "special");
                ctx.seen.push(value);
                var output;
                return output = array ? formatArray(ctx, value, recurseTimes, visibleKeys, keys) : keys.map(function(key) {
                    return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
                }), ctx.seen.pop(), reduceToSingleString(output, base, braces);
            }
            function formatPrimitive(ctx, value) {
                if (isUndefined(value)) return ctx.stylize("undefined", "undefined");
                if (isString(value)) {
                    var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
                    return ctx.stylize(simple, "string");
                }
                return isNumber(value) ? ctx.stylize("" + value, "number") : isBoolean(value) ? ctx.stylize("" + value, "boolean") : isNull(value) ? ctx.stylize("null", "null") : void 0;
            }
            function formatError(value) {
                return "[" + Error.prototype.toString.call(value) + "]";
            }
            function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
                for (var output = [], i = 0, l = value.length; i < l; ++i) hasOwnProperty(value, String(i)) ? output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), !0)) : output.push("");
                return keys.forEach(function(key) {
                    key.match(/^\d+$/) || output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, !0));
                }), output;
            }
            function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
                var name, str, desc;
                if (desc = Object.getOwnPropertyDescriptor(value, key) || {
                    value: value[key]
                }, desc.get ? str = desc.set ? ctx.stylize("[Getter/Setter]", "special") : ctx.stylize("[Getter]", "special") : desc.set && (str = ctx.stylize("[Setter]", "special")), 
                hasOwnProperty(visibleKeys, key) || (name = "[" + key + "]"), str || (ctx.seen.indexOf(desc.value) < 0 ? (str = isNull(recurseTimes) ? formatValue(ctx, desc.value, null) : formatValue(ctx, desc.value, recurseTimes - 1), 
                str.indexOf("\n") > -1 && (str = array ? str.split("\n").map(function(line) {
                    return "  " + line;
                }).join("\n").substr(2) : "\n" + str.split("\n").map(function(line) {
                    return "   " + line;
                }).join("\n"))) : str = ctx.stylize("[Circular]", "special")), isUndefined(name)) {
                    if (array && key.match(/^\d+$/)) return str;
                    name = JSON.stringify("" + key), name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (name = name.substr(1, name.length - 2), 
                    name = ctx.stylize(name, "name")) : (name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), 
                    name = ctx.stylize(name, "string"));
                }
                return name + ": " + str;
            }
            function reduceToSingleString(output, base, braces) {
                var numLinesEst = 0, length = output.reduce(function(prev, cur) {
                    return numLinesEst++, cur.indexOf("\n") >= 0 && numLinesEst++, prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
                }, 0);
                return length > 60 ? braces[0] + ("" === base ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1] : braces[0] + base + " " + output.join(", ") + " " + braces[1];
            }
            function isArray(ar) {
                return Array.isArray(ar);
            }
            function isBoolean(arg) {
                return "boolean" == typeof arg;
            }
            function isNull(arg) {
                return null === arg;
            }
            function isNullOrUndefined(arg) {
                return null == arg;
            }
            function isNumber(arg) {
                return "number" == typeof arg;
            }
            function isString(arg) {
                return "string" == typeof arg;
            }
            function isSymbol(arg) {
                return "symbol" == typeof arg;
            }
            function isUndefined(arg) {
                return void 0 === arg;
            }
            function isRegExp(re) {
                return isObject(re) && "[object RegExp]" === objectToString(re);
            }
            function isObject(arg) {
                return "object" == typeof arg && null !== arg;
            }
            function isDate(d) {
                return isObject(d) && "[object Date]" === objectToString(d);
            }
            function isError(e) {
                return isObject(e) && ("[object Error]" === objectToString(e) || e instanceof Error);
            }
            function isFunction(arg) {
                return "function" == typeof arg;
            }
            function isPrimitive(arg) {
                return null === arg || "boolean" == typeof arg || "number" == typeof arg || "string" == typeof arg || "symbol" == typeof arg || "undefined" == typeof arg;
            }
            function objectToString(o) {
                return Object.prototype.toString.call(o);
            }
            function pad(n) {
                return n < 10 ? "0" + n.toString(10) : n.toString(10);
            }
            function timestamp() {
                var d = new Date(), time = [ pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()) ].join(":");
                return [ d.getDate(), months[d.getMonth()], time ].join(" ");
            }
            function hasOwnProperty(obj, prop) {
                return Object.prototype.hasOwnProperty.call(obj, prop);
            }
            var formatRegExp = /%[sdj%]/g;
            exports.format = function(f) {
                if (!isString(f)) {
                    for (var objects = [], i = 0; i < arguments.length; i++) objects.push(inspect(arguments[i]));
                    return objects.join(" ");
                }
                for (var i = 1, args = arguments, len = args.length, str = String(f).replace(formatRegExp, function(x) {
                    if ("%%" === x) return "%";
                    if (i >= len) return x;
                    switch (x) {
                      case "%s":
                        return String(args[i++]);

                      case "%d":
                        return Number(args[i++]);

                      case "%j":
                        try {
                            return JSON.stringify(args[i++]);
                        } catch (_) {
                            return "[Circular]";
                        }

                      default:
                        return x;
                    }
                }), x = args[i]; i < len; x = args[++i]) str += isNull(x) || !isObject(x) ? " " + x : " " + inspect(x);
                return str;
            }, exports.deprecate = function(fn, msg) {
                function deprecated() {
                    if (!warned) {
                        if (process.throwDeprecation) throw new Error(msg);
                        process.traceDeprecation ? console.trace(msg) : console.error(msg), warned = !0;
                    }
                    return fn.apply(this, arguments);
                }
                if (isUndefined(global.process)) return function() {
                    return exports.deprecate(fn, msg).apply(this, arguments);
                };
                if (process.noDeprecation === !0) return fn;
                var warned = !1;
                return deprecated;
            };
            var debugEnviron, debugs = {};
            exports.debuglog = function(set) {
                if (isUndefined(debugEnviron) && (debugEnviron = process.env.NODE_DEBUG || ""), 
                set = set.toUpperCase(), !debugs[set]) if (new RegExp("\\b" + set + "\\b", "i").test(debugEnviron)) {
                    var pid = process.pid;
                    debugs[set] = function() {
                        var msg = exports.format.apply(exports, arguments);
                        console.error("%s %d: %s", set, pid, msg);
                    };
                } else debugs[set] = function() {};
                return debugs[set];
            }, exports.inspect = inspect, inspect.colors = {
                bold: [ 1, 22 ],
                italic: [ 3, 23 ],
                underline: [ 4, 24 ],
                inverse: [ 7, 27 ],
                white: [ 37, 39 ],
                grey: [ 90, 39 ],
                black: [ 30, 39 ],
                blue: [ 34, 39 ],
                cyan: [ 36, 39 ],
                green: [ 32, 39 ],
                magenta: [ 35, 39 ],
                red: [ 31, 39 ],
                yellow: [ 33, 39 ]
            }, inspect.styles = {
                special: "cyan",
                number: "yellow",
                "boolean": "yellow",
                undefined: "grey",
                "null": "bold",
                string: "green",
                date: "magenta",
                regexp: "red"
            }, exports.isArray = isArray, exports.isBoolean = isBoolean, exports.isNull = isNull, 
            exports.isNullOrUndefined = isNullOrUndefined, exports.isNumber = isNumber, exports.isString = isString, 
            exports.isSymbol = isSymbol, exports.isUndefined = isUndefined, exports.isRegExp = isRegExp, 
            exports.isObject = isObject, exports.isDate = isDate, exports.isError = isError, 
            exports.isFunction = isFunction, exports.isPrimitive = isPrimitive, exports.isBuffer = __webpack_require__(49);
            var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
            exports.log = function() {
                console.log("%s - %s", timestamp(), exports.format.apply(exports, arguments));
            }, exports.inherits = __webpack_require__(50), exports._extend = function(origin, add) {
                if (!add || !isObject(add)) return origin;
                for (var keys = Object.keys(add), i = keys.length; i--; ) origin[keys[i]] = add[keys[i]];
                return origin;
            };
        }).call(exports, function() {
            return this;
        }(), __webpack_require__(46));
    }, function(module, exports) {
        module.exports = function(arg) {
            return arg && "object" == typeof arg && "function" == typeof arg.copy && "function" == typeof arg.fill && "function" == typeof arg.readUInt8;
        };
    }, function(module, exports) {
        "function" == typeof Object.create ? module.exports = function(ctor, superCtor) {
            ctor.super_ = superCtor, ctor.prototype = Object.create(superCtor.prototype, {
                constructor: {
                    value: ctor,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0
                }
            });
        } : module.exports = function(ctor, superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {};
            TempCtor.prototype = superCtor.prototype, ctor.prototype = new TempCtor(), ctor.prototype.constructor = ctor;
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function _defineProperty(obj, key, value) {
            return key in obj ? Object.defineProperty(obj, key, {
                value: value,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : obj[key] = value, obj;
        }
        function measureStyle(agent, bridge, resolveRNStyle, id) {
            var node = agent.elementData.get(id);
            if (!node || !node.props) return void bridge.send("rn-style:measure", {});
            var style = resolveRNStyle(node.props.style);
            styleOverridesByHostComponentId[id] && (style = Object.assign({}, style, styleOverridesByHostComponentId[id]));
            var instance = node.publicInstance;
            return instance && instance.measure ? void instance.measure(function(x, y, width, height, left, top) {
                if ("number" != typeof x) return void bridge.send("rn-style:measure", {
                    style: style
                });
                var margin = style && resolveBoxStyle("margin", style) || blank, padding = style && resolveBoxStyle("padding", style) || blank;
                bridge.send("rn-style:measure", {
                    style: style,
                    measuredLayout: {
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        left: left,
                        top: top,
                        margin: margin,
                        padding: padding
                    }
                });
            }) : void bridge.send("rn-style:measure", {
                style: style
            });
        }
        function shallowClone(obj) {
            var nobj = {};
            for (var n in obj) nobj[n] = obj[n];
            return nobj;
        }
        function renameStyle(agent, id, oldName, newName, val) {
            var _ref3, data = agent.elementData.get(id), newStyle = newName ? (_ref3 = {}, _defineProperty(_ref3, oldName, void 0), 
            _defineProperty(_ref3, newName, val), _ref3) : _defineProperty({}, oldName, void 0);
            if (data && data.updater && "function" == typeof data.updater.setInProps) {
                var customStyle, style = data && data.props && data.props.style;
                if (Array.isArray(style)) {
                    var lastLength = style.length - 1;
                    "object" !== _typeof(style[lastLength]) || Array.isArray(style[lastLength]) ? (style = style.concat([ newStyle ]), 
                    data.updater.setInProps([ "style" ], style)) : (customStyle = shallowClone(style[lastLength]), 
                    delete customStyle[oldName], newName ? customStyle[newName] = val : customStyle[oldName] = void 0, 
                    data.updater.setInProps([ "style", lastLength ], customStyle));
                } else "object" === ("undefined" == typeof style ? "undefined" : _typeof(style)) ? (customStyle = shallowClone(style), 
                delete customStyle[oldName], newName ? customStyle[newName] = val : customStyle[oldName] = void 0, 
                data.updater.setInProps([ "style" ], customStyle)) : (style = [ style, newStyle ], 
                data.updater.setInProps([ "style" ], style));
            } else {
                if (!data || !data.updater || "function" != typeof data.updater.setNativeProps) return;
                styleOverridesByHostComponentId[id] ? Object.assign(styleOverridesByHostComponentId[id], newStyle) : styleOverridesByHostComponentId[id] = newStyle, 
                data.updater.setNativeProps({
                    style: newStyle
                });
            }
            agent.emit("hideHighlight");
        }
        function setStyle(agent, id, attr, val) {
            var data = agent.elementData.get(id), newStyle = _defineProperty({}, attr, val);
            if (data && data.updater && "function" == typeof data.updater.setInProps) {
                var style = data.props && data.props.style;
                if (Array.isArray(style)) {
                    var lastLength = style.length - 1;
                    "object" !== _typeof(style[lastLength]) || Array.isArray(style[lastLength]) ? (style = style.concat([ newStyle ]), 
                    data.updater.setInProps([ "style" ], style)) : data.updater.setInProps([ "style", lastLength, attr ], val);
                } else style = [ style, newStyle ], data.updater.setInProps([ "style" ], style);
            } else {
                if (!data || !data.updater || "function" != typeof data.updater.setNativeProps) return;
                styleOverridesByHostComponentId[id] ? Object.assign(styleOverridesByHostComponentId[id], newStyle) : styleOverridesByHostComponentId[id] = newStyle, 
                data.updater.setNativeProps({
                    style: newStyle
                });
            }
            agent.emit("hideHighlight");
        }
        var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
            return typeof obj;
        } : function(obj) {
            return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        }, resolveBoxStyle = __webpack_require__(52), styleOverridesByHostComponentId = {};
        module.exports = function(bridge, agent, resolveRNStyle) {
            bridge.onCall("rn-style:get", function(id) {
                var node = agent.elementData.get(id);
                return node && node.props ? resolveRNStyle(node.props.style) : null;
            }), bridge.on("rn-style:measure", function(id) {
                measureStyle(agent, bridge, resolveRNStyle, id);
            }), bridge.on("rn-style:rename", function(_ref) {
                var id = _ref.id, oldName = _ref.oldName, newName = _ref.newName, val = _ref.val;
                renameStyle(agent, id, oldName, newName, val), setTimeout(function() {
                    return measureStyle(agent, bridge, resolveRNStyle, id);
                });
            }), bridge.on("rn-style:set", function(_ref2) {
                var id = _ref2.id, attr = _ref2.attr, val = _ref2.val;
                setStyle(agent, id, attr, val), setTimeout(function() {
                    return measureStyle(agent, bridge, resolveRNStyle, id);
                });
            });
        };
        var blank = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
    }, function(module, exports) {
        "use strict";
        function resolveBoxStyle(prefix, style) {
            var res = {}, subs = [ "top", "left", "bottom", "right" ], set = !1;
            return subs.forEach(function(sub) {
                res[sub] = style[prefix] || 0;
            }), style[prefix] && (set = !0), style[prefix + "Vertical"] && (res.top = res.bottom = style[prefix + "Vertical"], 
            set = !0), style[prefix + "Horizontal"] && (res.left = res.right = style[prefix + "Horizontal"], 
            set = !0), subs.forEach(function(sub) {
                var val = style[prefix + capFirst(sub)];
                val && (res[sub] = val, set = !0);
            }), set ? res : null;
        }
        function capFirst(text) {
            return text[0].toUpperCase() + text.slice(1);
        }
        module.exports = resolveBoxStyle;
    }, function(module, exports) {
        "use strict";
        var emptyFunction = function() {};
        module.exports = function(bridge, agent, hook) {
            var checkIfProfilingIsSupported = function() {
                var profilingIsSupported = !1;
                agent.roots.forEach(function(rootId) {
                    var root = agent.internalInstancesById.get(rootId);
                    root.hasOwnProperty("treeBaseDuration") && (profilingIsSupported = !0);
                }), bridge.call("profiler:update", [ profilingIsSupported ], emptyFunction);
            };
            agent.on("root", checkIfProfilingIsSupported), agent.on("rootUnmounted", checkIfProfilingIsSupported), 
            checkIfProfilingIsSupported();
        };
    }, function(module, exports) {
        "use strict";
        function decorate(obj, attr, fn) {
            var old = obj[attr];
            return obj[attr] = function() {
                var res = old.apply(this, arguments);
                return fn.apply(this, arguments), res;
            }, function() {
                obj[attr] = old;
            };
        }
        var subscriptionEnabled = !1;
        module.exports = function(bridge, agent, hook) {
            function sendStoreData() {
                subscriptionEnabled && bridge.send("relay:store", {
                    id: "relay:store",
                    nodes: DefaultStoreData.getNodeData()
                });
            }
            var shouldEnable = !!hook._relayInternals;
            if (bridge.onCall("relay:check", function() {
                return shouldEnable;
            }), shouldEnable) {
                var _hook$_relayInternals = hook._relayInternals, DefaultStoreData = _hook$_relayInternals.DefaultStoreData, setRequestListener = _hook$_relayInternals.setRequestListener;
                bridge.onCall("relay:store:enable", function() {
                    subscriptionEnabled = !0, sendStoreData();
                }), bridge.onCall("relay:store:disable", function() {
                    subscriptionEnabled = !1;
                }), sendStoreData(), decorate(DefaultStoreData, "handleUpdatePayload", sendStoreData), 
                decorate(DefaultStoreData, "handleQueryPayload", sendStoreData);
                var removeListener = setRequestListener(function(event, data) {
                    bridge.send(event, data);
                });
                hook.on("shutdown", removeListener);
            }
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        var Highlighter = __webpack_require__(56);
        module.exports = function(agent) {
            var hl = new Highlighter(window, function(node) {
                agent.selectFromDOMNode(node);
            });
            agent.on("highlight", function(data) {
                return hl.highlight(data.node, data.name);
            }), agent.on("highlightMany", function(nodes) {
                return hl.highlightMany(nodes);
            }), agent.on("hideHighlight", function() {
                return hl.hideHighlight();
            }), agent.on("refreshMultiOverlay", function() {
                return hl.refreshMultiOverlay();
            }), agent.on("startInspecting", function() {
                return hl.startInspecting();
            }), agent.on("stopInspecting", function() {
                return hl.stopInspecting();
            }), agent.on("shutdown", function() {
                hl.remove();
            });
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
        }
        function captureSubscription(obj, evt, cb) {
            return obj.addEventListener(evt, cb, !0), function() {
                return obj.removeEventListener(evt, cb, !0);
            };
        }
        function makeMagnifier() {
            var button = window.document.createElement("button");
            return button.innerHTML = "&#128269;", button.style.backgroundColor = "transparent", 
            button.style.border = "none", button.style.outline = "none", button.style.cursor = "pointer", 
            button.style.position = "fixed", button.style.bottom = "10px", button.style.right = "10px", 
            button.style.fontSize = "30px", button.style.zIndex = 1e7, button;
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                    "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
                Constructor;
            };
        }(), Overlay = __webpack_require__(57), MultiOverlay = __webpack_require__(59), Highlighter = function() {
            function Highlighter(win, onSelect) {
                _classCallCheck(this, Highlighter), this._win = win, this._onSelect = onSelect, 
                this._overlay = null, this._multiOverlay = null, this._subs = [];
            }
            return _createClass(Highlighter, [ {
                key: "startInspecting",
                value: function() {
                    this._inspecting = !0, this._subs = [ captureSubscription(this._win, "mouseover", this.onHover.bind(this)), captureSubscription(this._win, "mousedown", this.onMouseDown.bind(this)), captureSubscription(this._win, "click", this.onClick.bind(this)) ];
                }
            }, {
                key: "stopInspecting",
                value: function() {
                    this._subs.forEach(function(unsub) {
                        return unsub();
                    }), this.hideHighlight();
                }
            }, {
                key: "remove",
                value: function() {
                    this.stopInspecting(), this._button && this._button.parentNode && this._button.parentNode.removeChild(this._button);
                }
            }, {
                key: "highlight",
                value: function(node, name) {
                    this.removeMultiOverlay(), node.nodeType !== Node.COMMENT_NODE && (this._overlay || (this._overlay = new Overlay(this._win)), 
                    this._overlay.inspect(node, name));
                }
            }, {
                key: "highlightMany",
                value: function(nodes) {
                    this.removeOverlay(), this._multiOverlay || (this._multiOverlay = new MultiOverlay(this._win)), 
                    this._multiOverlay.highlightMany(nodes);
                }
            }, {
                key: "hideHighlight",
                value: function() {
                    this._inspecting = !1, this.removeOverlay(), this.removeMultiOverlay();
                }
            }, {
                key: "refreshMultiOverlay",
                value: function() {
                    this._multiOverlay && this._multiOverlay.refresh();
                }
            }, {
                key: "removeOverlay",
                value: function() {
                    this._overlay && (this._overlay.remove(), this._overlay = null);
                }
            }, {
                key: "removeMultiOverlay",
                value: function() {
                    this._multiOverlay && (this._multiOverlay.remove(), this._multiOverlay = null);
                }
            }, {
                key: "onMouseDown",
                value: function(evt) {
                    this._inspecting && (evt.preventDefault(), evt.stopPropagation(), evt.cancelBubble = !0, 
                    this._onSelect(evt.target));
                }
            }, {
                key: "onClick",
                value: function(evt) {
                    this._inspecting && (this._subs.forEach(function(unsub) {
                        return unsub();
                    }), evt.preventDefault(), evt.stopPropagation(), evt.cancelBubble = !0, this.hideHighlight());
                }
            }, {
                key: "onHover",
                value: function(evt) {
                    this._inspecting && (evt.preventDefault(), evt.stopPropagation(), evt.cancelBubble = !0, 
                    this.highlight(evt.target));
                }
            }, {
                key: "injectButton",
                value: function() {
                    this._button = makeMagnifier(), this._button.onclick = this.startInspecting.bind(this), 
                    this._win.document.body.appendChild(this._button);
                }
            } ]), Highlighter;
        }();
        module.exports = Highlighter;
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
        }
        function findTipPos(dims, win) {
            var top, tipHeight = 20, margin = 5;
            return top = dims.top + dims.height + tipHeight <= win.innerHeight ? dims.top + dims.height < 0 ? margin : dims.top + dims.height + margin : dims.top - tipHeight <= win.innerHeight ? dims.top - tipHeight - margin < margin ? margin : dims.top - tipHeight - margin : win.innerHeight - tipHeight - margin, 
            top += "px", dims.left < 0 ? {
                top: top,
                left: margin
            } : dims.left + 200 > win.innerWidth ? {
                top: top,
                right: margin
            } : {
                top: top,
                left: dims.left + margin + "px"
            };
        }
        function getElementDimensions(domElement) {
            var calculatedStyle = window.getComputedStyle(domElement);
            return {
                borderLeft: +calculatedStyle.borderLeftWidth.match(/[0-9]*/)[0],
                borderRight: +calculatedStyle.borderRightWidth.match(/[0-9]*/)[0],
                borderTop: +calculatedStyle.borderTopWidth.match(/[0-9]*/)[0],
                borderBottom: +calculatedStyle.borderBottomWidth.match(/[0-9]*/)[0],
                marginLeft: +calculatedStyle.marginLeft.match(/[0-9]*/)[0],
                marginRight: +calculatedStyle.marginRight.match(/[0-9]*/)[0],
                marginTop: +calculatedStyle.marginTop.match(/[0-9]*/)[0],
                marginBottom: +calculatedStyle.marginBottom.match(/[0-9]*/)[0],
                paddingLeft: +calculatedStyle.paddingLeft.match(/[0-9]*/)[0],
                paddingRight: +calculatedStyle.paddingRight.match(/[0-9]*/)[0],
                paddingTop: +calculatedStyle.paddingTop.match(/[0-9]*/)[0],
                paddingBottom: +calculatedStyle.paddingBottom.match(/[0-9]*/)[0]
            };
        }
        function getOwnerWindow(node) {
            return node.ownerDocument ? node.ownerDocument.defaultView : null;
        }
        function getOwnerIframe(node) {
            var nodeWindow = getOwnerWindow(node);
            return nodeWindow ? nodeWindow.frameElement : null;
        }
        function getBoundingClientRectWithBorderOffset(node) {
            var dimensions = getElementDimensions(node);
            return mergeRectOffsets([ node.getBoundingClientRect(), {
                top: dimensions.borderTop,
                left: dimensions.borderLeft,
                bottom: dimensions.borderBottom,
                right: dimensions.borderRight,
                width: 0,
                height: 0
            } ]);
        }
        function mergeRectOffsets(rects) {
            return rects.reduce(function(previousRect, rect) {
                return null == previousRect ? rect : {
                    top: previousRect.top + rect.top,
                    left: previousRect.left + rect.left,
                    width: previousRect.width,
                    height: previousRect.height,
                    bottom: previousRect.bottom + rect.bottom,
                    right: previousRect.right + rect.right
                };
            });
        }
        function getNestedBoundingClientRect(node, boundaryWindow) {
            var ownerIframe = getOwnerIframe(node);
            if (ownerIframe && ownerIframe !== boundaryWindow) {
                for (var rects = [ node.getBoundingClientRect() ], currentIframe = ownerIframe, onlyOneMore = !1; currentIframe; ) {
                    var rect = getBoundingClientRectWithBorderOffset(currentIframe);
                    if (rects.push(rect), currentIframe = getOwnerIframe(currentIframe), onlyOneMore) break;
                    currentIframe && getOwnerWindow(currentIframe) === boundaryWindow && (onlyOneMore = !0);
                }
                return mergeRectOffsets(rects);
            }
            return node.getBoundingClientRect();
        }
        function boxWrap(dims, what, node) {
            assign(node.style, {
                borderTopWidth: dims[what + "Top"] + "px",
                borderLeftWidth: dims[what + "Left"] + "px",
                borderRightWidth: dims[what + "Right"] + "px",
                borderBottomWidth: dims[what + "Bottom"] + "px",
                borderStyle: "solid"
            });
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                    "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
                Constructor;
            };
        }(), assign = __webpack_require__(3), _require = __webpack_require__(58), monospace = _require.monospace, Overlay = function() {
            function Overlay(window) {
                _classCallCheck(this, Overlay);
                var doc = window.document;
                this.win = window, this.container = doc.createElement("div"), this.node = doc.createElement("div"), 
                this.border = doc.createElement("div"), this.padding = doc.createElement("div"), 
                this.content = doc.createElement("div"), this.border.style.borderColor = overlayStyles.border, 
                this.padding.style.borderColor = overlayStyles.padding, this.content.style.backgroundColor = overlayStyles.background, 
                assign(this.node.style, {
                    borderColor: overlayStyles.margin,
                    pointerEvents: "none",
                    position: "fixed"
                }), this.tip = doc.createElement("div"), assign(this.tip.style, {
                    backgroundColor: "#333740",
                    borderRadius: "2px",
                    fontFamily: monospace.family,
                    fontWeight: "bold",
                    padding: "3px 5px",
                    position: "fixed",
                    fontSize: monospace.sizes.normal + "px"
                }), this.nameSpan = doc.createElement("span"), this.tip.appendChild(this.nameSpan), 
                assign(this.nameSpan.style, {
                    color: "#ee78e6",
                    borderRight: "1px solid #aaaaaa",
                    paddingRight: "0.5rem",
                    marginRight: "0.5rem"
                }), this.dimSpan = doc.createElement("span"), this.tip.appendChild(this.dimSpan), 
                assign(this.dimSpan.style, {
                    color: "#d7d7d7"
                }), this.container.style.zIndex = 1e7, this.node.style.zIndex = 1e7, this.tip.style.zIndex = 1e7, 
                this.container.appendChild(this.node), this.container.appendChild(this.tip), this.node.appendChild(this.border), 
                this.border.appendChild(this.padding), this.padding.appendChild(this.content), doc.body.appendChild(this.container);
            }
            return _createClass(Overlay, [ {
                key: "remove",
                value: function() {
                    this.container.parentNode && this.container.parentNode.removeChild(this.container);
                }
            }, {
                key: "inspect",
                value: function(node, name) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        var box = getNestedBoundingClientRect(node, this.win), dims = getElementDimensions(node);
                        boxWrap(dims, "margin", this.node), boxWrap(dims, "border", this.border), boxWrap(dims, "padding", this.padding), 
                        assign(this.content.style, {
                            height: box.height - dims.borderTop - dims.borderBottom - dims.paddingTop - dims.paddingBottom + "px",
                            width: box.width - dims.borderLeft - dims.borderRight - dims.paddingLeft - dims.paddingRight + "px"
                        }), assign(this.node.style, {
                            top: box.top - dims.marginTop + "px",
                            left: box.left - dims.marginLeft + "px"
                        }), this.nameSpan.textContent = name || node.nodeName.toLowerCase(), this.dimSpan.textContent = box.width + "px × " + box.height + "px";
                        var tipPos = findTipPos({
                            top: box.top - dims.marginTop,
                            left: box.left - dims.marginLeft,
                            height: box.height + dims.marginTop + dims.marginBottom,
                            width: box.width + dims.marginLeft + dims.marginRight
                        }, this.win);
                        assign(this.tip.style, tipPos);
                    }
                }
            } ]), Overlay;
        }(), overlayStyles = {
            background: "rgba(120, 170, 210, 0.7)",
            padding: "rgba(77, 200, 0, 0.3)",
            margin: "rgba(255, 155, 0, 0.3)",
            border: "rgba(255, 200, 50, 0.3)"
        };
        module.exports = Overlay;
    }, function(module, exports) {
        "use strict";
        module.exports = {
            monospace: {
                family: "Menlo, Consolas, monospace",
                sizes: {
                    normal: 11,
                    large: 14
                }
            },
            sansSerif: {
                family: '"Helvetica Neue", "Lucida Grande", -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, sans-serif',
                sizes: {
                    small: 10,
                    normal: 12,
                    large: 14
                }
            }
        };
    }, function(module, exports, __webpack_require__) {
        "use strict";
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
        }
        var _createClass = function() {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
                    "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function(Constructor, protoProps, staticProps) {
                return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), 
                Constructor;
            };
        }(), assign = __webpack_require__(3), MultiOverlay = function() {
            function MultiOverlay(window) {
                _classCallCheck(this, MultiOverlay), this.win = window;
                var doc = window.document;
                this.container = doc.createElement("div"), doc.body.appendChild(this.container), 
                this._currentNodes = null;
            }
            return _createClass(MultiOverlay, [ {
                key: "highlightMany",
                value: function(nodes) {
                    var _this = this;
                    this._currentNodes = nodes, this.container.innerHTML = "", nodes.forEach(function(node) {
                        var div = _this.win.document.createElement("div");
                        if ("function" == typeof node.getBoundingClientRect) {
                            var box = node.getBoundingClientRect();
                            box.bottom < 0 || box.top > window.innerHeight || (assign(div.style, {
                                top: box.top + "px",
                                left: box.left + "px",
                                width: box.width + "px",
                                height: box.height + "px",
                                border: "2px dotted rgba(200, 100, 100, .8)",
                                boxSizing: "border-box",
                                backgroundColor: "rgba(200, 100, 100, .2)",
                                position: "fixed",
                                zIndex: 1e7,
                                pointerEvents: "none"
                            }), _this.container.appendChild(div));
                        }
                    });
                }
            }, {
                key: "refresh",
                value: function() {
                    this._currentNodes && this.highlightMany(this._currentNodes);
                }
            }, {
                key: "remove",
                value: function() {
                    this.container.parentNode && (this.container.parentNode.removeChild(this.container), 
                    this._currentNodes = null);
                }
            } ]), MultiOverlay;
        }();
        module.exports = MultiOverlay;
    } ]);
});
//# sourceMappingURL=backend.js.map