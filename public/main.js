
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    var defaultExport = /*@__PURE__*/(function (Error) {
      function defaultExport(route, path) {
        var message = "Unreachable '" + route + "', segment '" + path + "' is not defined";
        Error.call(this, message);
        this.message = message;
      }

      if ( Error ) defaultExport.__proto__ = Error;
      defaultExport.prototype = Object.create( Error && Error.prototype );
      defaultExport.prototype.constructor = defaultExport;

      return defaultExport;
    }(Error));

    function buildMatcher(path, parent) {
      var regex;

      var _isSplat;

      var _priority = -100;

      var keys = [];
      regex = path.replace(/[-$.]/g, '\\$&').replace(/\(/g, '(?:').replace(/\)/g, ')?').replace(/([:*]\w+)(?:<([^<>]+?)>)?/g, function (_, key, expr) {
        keys.push(key.substr(1));

        if (key.charAt() === ':') {
          _priority += 100;
          return ("((?!#)" + (expr || '[^#/]+?') + ")");
        }

        _isSplat = true;
        _priority += 500;
        return ("((?!#)" + (expr || '[^#]+?') + ")");
      });

      try {
        regex = new RegExp(("^" + regex + "$"));
      } catch (e) {
        throw new TypeError(("Invalid route expression, given '" + parent + "'"));
      }

      var _hashed = path.includes('#') ? 0.5 : 1;

      var _depth = path.length * _priority * _hashed;

      return {
        keys: keys,
        regex: regex,
        _depth: _depth,
        _isSplat: _isSplat
      };
    }
    var PathMatcher = function PathMatcher(path, parent) {
      var ref = buildMatcher(path, parent);
      var keys = ref.keys;
      var regex = ref.regex;
      var _depth = ref._depth;
      var _isSplat = ref._isSplat;
      return {
        _isSplat: _isSplat,
        _depth: _depth,
        match: function (value) {
          var matches = value.match(regex);

          if (matches) {
            return keys.reduce(function (prev, cur, i) {
              prev[cur] = typeof matches[i + 1] === 'string' ? decodeURIComponent(matches[i + 1]) : null;
              return prev;
            }, {});
          }
        }
      };
    };

    PathMatcher.push = function push (key, prev, leaf, parent) {
      var root = prev[key] || (prev[key] = {});

      if (!root.pattern) {
        root.pattern = new PathMatcher(key, parent);
        root.route = (leaf || '').replace(/\/$/, '') || '/';
      }

      prev.keys = prev.keys || [];

      if (!prev.keys.includes(key)) {
        prev.keys.push(key);
        PathMatcher.sort(prev);
      }

      return root;
    };

    PathMatcher.sort = function sort (root) {
      root.keys.sort(function (a, b) {
        return root[a].pattern._depth - root[b].pattern._depth;
      });
    };

    function merge(path, parent) {
      return ("" + (parent && parent !== '/' ? parent : '') + (path || ''));
    }
    function walk(path, cb) {
      var matches = path.match(/<[^<>]*\/[^<>]*>/);

      if (matches) {
        throw new TypeError(("RegExp cannot contain slashes, given '" + matches + "'"));
      }

      var parts = path !== '/' ? path.split('/') : [''];
      var root = [];
      parts.some(function (x, i) {
        var parent = root.concat(x).join('/') || null;
        var segment = parts.slice(i + 1).join('/') || null;
        var retval = cb(("/" + x), parent, segment ? ((x ? ("/" + x) : '') + "/" + segment) : null);
        root.push(x);
        return retval;
      });
    }
    function reduce(key, root, _seen) {
      var params = {};
      var out = [];
      var splat;
      walk(key, function (x, leaf, extra) {
        var found;

        if (!root.keys) {
          throw new defaultExport(key, x);
        }

        root.keys.some(function (k) {
          if (_seen.includes(k)) { return false; }
          var ref = root[k].pattern;
          var match = ref.match;
          var _isSplat = ref._isSplat;
          var matches = match(_isSplat ? extra || x : x);

          if (matches) {
            Object.assign(params, matches);

            if (root[k].route) {
              var routeInfo = Object.assign({}, root[k].info); // properly handle exact-routes!

              var hasMatch = false;

              if (routeInfo.exact) {
                hasMatch = extra === null;
              } else {
                hasMatch = x && leaf === null || x === leaf || _isSplat || !extra;
              }

              routeInfo.matches = hasMatch;
              routeInfo.params = Object.assign({}, params);
              routeInfo.route = root[k].route;
              routeInfo.path = _isSplat ? extra : leaf || x;
              out.push(routeInfo);
            }

            if (extra === null && !root[k].keys) {
              return true;
            }

            if (k !== '/') { _seen.push(k); }
            splat = _isSplat;
            root = root[k];
            found = true;
            return true;
          }

          return false;
        });

        if (!(found || root.keys.some(function (k) { return root[k].pattern.match(x); }))) {
          throw new defaultExport(key, x);
        }

        return splat || !found;
      });
      return out;
    }
    function find(path, routes, retries) {
      var get = reduce.bind(null, path, routes);
      var set = [];

      while (retries > 0) {
        retries -= 1;

        try {
          return get(set);
        } catch (e) {
          if (retries > 0) {
            return get(set);
          }

          throw e;
        }
      }
    }
    function add(path, routes, parent, routeInfo) {
      var fullpath = merge(path, parent);
      var root = routes;
      walk(fullpath, function (x, leaf) {
        root = PathMatcher.push(x, root, leaf, fullpath);

        if (x !== '/') {
          root.info = root.info || Object.assign({}, routeInfo);
        }
      });
      root.info = root.info || Object.assign({}, routeInfo);
      return fullpath;
    }
    function rm(path, routes, parent) {
      var fullpath = merge(path, parent);
      var root = routes;
      var leaf = null;
      var key = null;
      walk(fullpath, function (x) {
        if (!root) {
          leaf = null;
          return true;
        }

        key = x;
        leaf = x === '/' ? routes['/'] : root;

        if (!leaf.keys) {
          throw new defaultExport(path, x);
        }

        root = root[x];
      });

      if (!(leaf && key)) {
        throw new defaultExport(path, key);
      }

      delete leaf[key];

      if (key === '/') {
        delete leaf.info;
        delete leaf.route;
      }

      var offset = leaf.keys.indexOf(key);

      if (offset !== -1) {
        leaf.keys.splice(leaf.keys.indexOf(key), 1);
        PathMatcher.sort(leaf);
      }
    }

    var Router = function Router() {
      var routes = {};
      var stack = [];
      return {
        resolve: function (path, cb) {
          var ref = path.split(/(?=[#?])/);
          var uri = ref[0];
          var hash = ref[1];
          var query = ref[2];
          var segments = uri.substr(1).split('/');
          var prefix = [];
          var seen = [];
          segments.some(function (key) {
            var sub = prefix.concat(("/" + key)).join('');
            if (key.length) { prefix.push(("/" + key)); }

            try {
              var next = find(sub, routes, 1);
              cb(null, next.filter(function (x) {
                if (!seen.includes(x.route)) {
                  seen.push(x.route);
                  return true;
                }

                return false;
              }));
            } catch (e) {
              cb(e, []);
              return true;
            }

            return false;
          });

          if (hash) {
            cb(null, find(("" + uri + hash), routes, 1));
          }
        },
        mount: function (path, cb) {
          if (path !== '/') {
            stack.push(path);
          }

          cb();
          stack.pop();
        },
        find: function (path, retries) { return find(path, routes, retries === true ? 2 : retries || 1); },
        add: function (path, routeInfo) { return add(path, routes, stack.join(''), routeInfo); },
        rm: function (path) { return rm(path, routes, stack.join('')); }
      };
    };

    const CTX_ROUTER = {};

    function navigateTo(path) {
      // If path empty or no string, throws error
      if (!path || typeof path !== 'string') {
        throw Error(`svero expects navigateTo() to have a string parameter. The parameter provided was: ${path} of type ${typeof path} instead.`);
      }

      if (path[0] !== '/' && path[0] !== '#') {
        throw Error(`svero expects navigateTo() param to start with slash or hash, e.g. "/${path}" or "#${path}" instead of "${path}".`);
      }

      // If no History API support, fallbacks to URL redirect
      if (!history.pushState || !window.dispatchEvent) {
        window.location.href = path;
        return;
      }

      // If has History API support, uses it
      history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* node_modules/svero/src/Router.svelte generated by Svelte v3.12.1 */
    const { Object: Object_1 } = globals;

    const file = "node_modules/svero/src/Router.svelte";

    // (165:0) {#if failure && !nofallback}
    function create_if_block(ctx) {
    	var fieldset, legend, t0, t1, t2, pre, t3;

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			legend = element("legend");
    			t0 = text("Router failure: ");
    			t1 = text(ctx.path);
    			t2 = space();
    			pre = element("pre");
    			t3 = text(ctx.failure);
    			add_location(legend, file, 166, 4, 3810);
    			add_location(pre, file, 167, 4, 3854);
    			add_location(fieldset, file, 165, 2, 3795);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, legend);
    			append_dev(legend, t0);
    			append_dev(legend, t1);
    			append_dev(fieldset, t2);
    			append_dev(fieldset, pre);
    			append_dev(pre, t3);
    		},

    		p: function update(changed, ctx) {
    			if (changed.path) {
    				set_data_dev(t1, ctx.path);
    			}

    			if (changed.failure) {
    				set_data_dev(t3, ctx.failure);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(fieldset);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(165:0) {#if failure && !nofallback}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var t_1, current, dispose;

    	var if_block = (ctx.failure && !ctx.nofallback) && create_if_block(ctx);

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t_1 = space();

    			if (default_slot) default_slot.c();

    			dispose = listen_dev(window, "popstate", ctx.handlePopState);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t_1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.failure && !ctx.nofallback) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(t_1.parentNode, t_1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(t_1);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }



    const router = new Router();

    function cleanPath(route) {
      return route.replace(/\?[^#]*/, '').replace(/(?!^)\/#/, '#').replace('/#', '#').replace(/\/$/, '');
    }

    function fixPath(route) {
      if (route === '/#*' || route === '#*') return '#*_';
      if (route === '/*' || route === '*') return '/*_';
      return route;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $routeInfo, $basePath;

    	

      let t;
      let failure;
      let fallback;

      let { path = '/', nofallback = null } = $$props;

      const routeInfo = writable({}); validate_store(routeInfo, 'routeInfo'); component_subscribe($$self, routeInfo, $$value => { $routeInfo = $$value; $$invalidate('$routeInfo', $routeInfo); });
      const routerContext = getContext(CTX_ROUTER);
      const basePath = routerContext ? routerContext.basePath : writable(path); validate_store(basePath, 'basePath'); component_subscribe($$self, basePath, $$value => { $basePath = $$value; $$invalidate('$basePath', $basePath); });

      function handleRoutes(map) {
        const params = map.reduce((prev, cur) => {
          prev[cur.key] = Object.assign(prev[cur.key] || {}, cur.params);
          return prev;
        }, {});

        let skip;
        let routes = {};

        map.some(x => {
          if (typeof x.condition === 'boolean' || typeof x.condition === 'function') {
            const ok = typeof x.condition === 'function' ? x.condition() : x.condition;

            if (ok === false && x.redirect) {
              navigateTo(x.redirect);
              skip = true;
              return true;
            }
          }

          if (x.key && !routes[x.key]) {
            if (x.exact && !x.matches) return false;
            routes[x.key] = { ...x, params: params[x.key] };
          }

          return false;
        });

        if (!skip) {
          set_store_value(routeInfo, $routeInfo = routes);
        }
      }

      function doFallback(e, path) {
        set_store_value(routeInfo, $routeInfo[fallback] = { failure: e, params: { _: path.substr(1) || undefined } }, $routeInfo);
      }

      function resolveRoutes(path) {
        const segments = path.split('#')[0].split('/');
        const prefix = [];
        const map = [];

        segments.forEach(key => {
          const sub = prefix.concat(`/${key}`).join('');

          if (key) prefix.push(`/${key}`);

          try {
            const next = router.find(sub);

            handleRoutes(next);
            map.push(...next);
          } catch (e_) {
            doFallback(e_, path);
          }
        });

        return map;
      }

      function handlePopState() {
        const fullpath = cleanPath(`/${location.href.split('/').slice(3).join('/')}`);

        try {
          const found = resolveRoutes(fullpath);

          if (fullpath.includes('#')) {
            const next = router.find(fullpath);
            const keys = {};

            // override previous routes to avoid non-exact matches
            handleRoutes(found.concat(next).reduce((prev, cur) => {
              if (typeof keys[cur.key] === 'undefined') {
                keys[cur.key] = prev.length;
              }

              prev[keys[cur.key]] = cur;

              return prev;
            }, []));
          }
        } catch (e) {
          if (!fallback) {
            $$invalidate('failure', failure = e);
            return;
          }

          doFallback(e, fullpath);
        }
      }

      function _handlePopState() {
        clearTimeout(t);
        t = setTimeout(handlePopState, 100);
      }

      function assignRoute(key, route, detail) {
        key = key || Math.random().toString(36).substr(2);

        const fixedRoot = $basePath !== path && $basePath !== '/'
          ? `${$basePath}${path}`
          : path;

        const handler = { key, ...detail };

        let fullpath;

        router.mount(fixedRoot, () => {
          fullpath = router.add(fixPath(route), handler);
          fallback = (handler.fallback && key) || fallback;
        });

        _handlePopState();

        return [key, fullpath];
      }

      function unassignRoute(route) {
        router.rm(fixPath(route));
        _handlePopState();
      }

      setContext(CTX_ROUTER, {
        basePath,
        routeInfo,
        assignRoute,
        unassignRoute,
      });

    	const writable_props = ['path', 'nofallback'];
    	Object_1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('nofallback' in $$props) $$invalidate('nofallback', nofallback = $$props.nofallback);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { t, failure, fallback, path, nofallback, $routeInfo, $basePath };
    	};

    	$$self.$inject_state = $$props => {
    		if ('t' in $$props) t = $$props.t;
    		if ('failure' in $$props) $$invalidate('failure', failure = $$props.failure);
    		if ('fallback' in $$props) fallback = $$props.fallback;
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('nofallback' in $$props) $$invalidate('nofallback', nofallback = $$props.nofallback);
    		if ('$routeInfo' in $$props) routeInfo.set($routeInfo);
    		if ('$basePath' in $$props) basePath.set($basePath);
    	};

    	return {
    		failure,
    		path,
    		nofallback,
    		routeInfo,
    		basePath,
    		handlePopState,
    		$$slots,
    		$$scope
    	};
    }

    class Router_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["path", "nofallback"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Router_1", options, id: create_fragment.name });
    	}

    	get path() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nofallback() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nofallback(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svero/src/Route.svelte generated by Svelte v3.12.1 */

    const get_default_slot_changes = ({ activeRouter, activeProps }) => ({ router: activeRouter, props: activeProps });
    const get_default_slot_context = ({ activeRouter, activeProps }) => ({
    	router: activeRouter,
    	props: activeProps
    });

    // (46:0) {#if activeRouter}
    function create_if_block$1(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.component) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(46:0) {#if activeRouter}", ctx });
    	return block;
    }

    // (49:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.activeRouter || changed.activeProps)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(49:2) {:else}", ctx });
    	return block;
    }

    // (47:2) {#if component}
    function create_if_block_1(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		{ router: ctx.activeRouter },
    		ctx.activeProps
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.activeRouter || changed.activeProps) ? get_spread_update(switch_instance_spread_levels, [
    									(changed.activeRouter) && { router: ctx.activeRouter },
    			(changed.activeProps) && get_spread_object(ctx.activeProps)
    								]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(47:2) {#if component}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.activeRouter) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.activeRouter) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function getProps(given, required) {
      const { props, ...others } = given;

      // prune all declared props from this component
      required.forEach(k => {
        delete others[k];
      });

      return {
        ...props,
        ...others,
      };
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $routeInfo;

    	

      let { key = null, path = '', props = null, exact = undefined, fallback = undefined, component = undefined, condition = undefined, redirect = undefined } = $$props;

      const { assignRoute, unassignRoute, routeInfo } = getContext(CTX_ROUTER); validate_store(routeInfo, 'routeInfo'); component_subscribe($$self, routeInfo, $$value => { $routeInfo = $$value; $$invalidate('$routeInfo', $routeInfo); });

      let activeRouter = null;
      let activeProps = {};
      let fullpath;

      $$invalidate('key', [key, fullpath] = assignRoute(key, path, { condition, redirect, fallback, exact }), key);

      onDestroy(() => {
        unassignRoute(fullpath);
      });

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('key' in $$new_props) $$invalidate('key', key = $$new_props.key);
    		if ('path' in $$new_props) $$invalidate('path', path = $$new_props.path);
    		if ('props' in $$new_props) $$invalidate('props', props = $$new_props.props);
    		if ('exact' in $$new_props) $$invalidate('exact', exact = $$new_props.exact);
    		if ('fallback' in $$new_props) $$invalidate('fallback', fallback = $$new_props.fallback);
    		if ('component' in $$new_props) $$invalidate('component', component = $$new_props.component);
    		if ('condition' in $$new_props) $$invalidate('condition', condition = $$new_props.condition);
    		if ('redirect' in $$new_props) $$invalidate('redirect', redirect = $$new_props.redirect);
    		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { key, path, props, exact, fallback, component, condition, redirect, activeRouter, activeProps, fullpath, $routeInfo };
    	};

    	$$self.$inject_state = $$new_props => {
    		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
    		if ('key' in $$props) $$invalidate('key', key = $$new_props.key);
    		if ('path' in $$props) $$invalidate('path', path = $$new_props.path);
    		if ('props' in $$props) $$invalidate('props', props = $$new_props.props);
    		if ('exact' in $$props) $$invalidate('exact', exact = $$new_props.exact);
    		if ('fallback' in $$props) $$invalidate('fallback', fallback = $$new_props.fallback);
    		if ('component' in $$props) $$invalidate('component', component = $$new_props.component);
    		if ('condition' in $$props) $$invalidate('condition', condition = $$new_props.condition);
    		if ('redirect' in $$props) $$invalidate('redirect', redirect = $$new_props.redirect);
    		if ('activeRouter' in $$props) $$invalidate('activeRouter', activeRouter = $$new_props.activeRouter);
    		if ('activeProps' in $$props) $$invalidate('activeProps', activeProps = $$new_props.activeProps);
    		if ('fullpath' in $$props) fullpath = $$new_props.fullpath;
    		if ('$routeInfo' in $$props) routeInfo.set($routeInfo);
    	};

    	$$self.$$.update = ($$dirty = { $routeInfo: 1, key: 1, $$props: 1 }) => {
    		{
            $$invalidate('activeRouter', activeRouter = $routeInfo[key]);
            $$invalidate('activeProps', activeProps = getProps($$props, arguments[0]['$$'].props));
          }
    	};

    	return {
    		key,
    		path,
    		props,
    		exact,
    		fallback,
    		component,
    		condition,
    		redirect,
    		routeInfo,
    		activeRouter,
    		activeProps,
    		$$props: $$props = exclude_internal_props($$props),
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["key", "path", "props", "exact", "fallback", "component", "condition", "redirect"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Route", options, id: create_fragment$1.name });
    	}

    	get key() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallback() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallback(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condition() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redirect() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set redirect(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svero/src/Link.svelte generated by Svelte v3.12.1 */

    const file$1 = "node_modules/svero/src/Link.svelte";

    function create_fragment$2(ctx) {
    	var a, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			a = element("a");

    			if (default_slot) default_slot.c();

    			attr_dev(a, "href", ctx.href);
    			attr_dev(a, "class", ctx.className);
    			add_location(a, file$1, 31, 0, 684);
    			dispose = listen_dev(a, "click", prevent_default(ctx.onClick), false, true);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(a_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if (!current || changed.href) {
    				attr_dev(a, "href", ctx.href);
    			}

    			if (!current || changed.className) {
    				attr_dev(a, "class", ctx.className);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}

    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

      let { class: cssClass = '', href = '/', className = '', title = '' } = $$props;

      onMount(() => {
        $$invalidate('className', className = className || cssClass);
      });

      const dispatch = createEventDispatcher();

      // this will enable `<Link on:click={...} />` calls
      function onClick(e) {
        let fixedHref = href;

        // this will rebase anchors to avoid location changes
        if (fixedHref.charAt() !== '/') {
          fixedHref = window.location.pathname + fixedHref;
        }

        navigateTo(fixedHref);
        dispatch('click', e);
      }

    	const writable_props = ['class', 'href', 'className', 'title'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('class' in $$props) $$invalidate('cssClass', cssClass = $$props.class);
    		if ('href' in $$props) $$invalidate('href', href = $$props.href);
    		if ('className' in $$props) $$invalidate('className', className = $$props.className);
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { cssClass, href, className, title };
    	};

    	$$self.$inject_state = $$props => {
    		if ('cssClass' in $$props) $$invalidate('cssClass', cssClass = $$props.cssClass);
    		if ('href' in $$props) $$invalidate('href', href = $$props.href);
    		if ('className' in $$props) $$invalidate('className', className = $$props.className);
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    	};

    	return {
    		cssClass,
    		href,
    		className,
    		title,
    		onClick,
    		$$slots,
    		$$scope
    	};
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["class", "href", "className", "title"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Link", options, id: create_fragment$2.name });
    	}

    	get class() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get className() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set className(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/components/Nav.svelte";

    // (7:55) <Link href="/">
    function create_default_slot(ctx) {
    	var img;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "logo");
    			attr_dev(img, "src", "logo.png");
    			attr_dev(img, "alt", "Infomigra");
    			add_location(img, file$2, 6, 70, 265);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(img);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(7:55) <Link href=\"/\">", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var nav, div, span, current;

    	var link = new Link({
    		props: {
    		href: "/",
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div = element("div");
    			span = element("span");
    			link.$$.fragment.c();
    			attr_dev(span, "class", "font-semibold text-xl tracking-tight");
    			add_location(span, file$2, 6, 4, 199);
    			attr_dev(div, "class", "flex items-center flex-shrink-0 text-white mr-6");
    			add_location(div, file$2, 5, 2, 133);
    			attr_dev(nav, "class", "fixed items-center justify-between flex-wrap bg-teal-500 p-6 w-full");
    			add_location(nav, file$2, 4, 0, 49);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div);
    			append_dev(div, span);
    			mount_component(link, span, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var link_changes = {};
    			if (changed.$$scope) link_changes.$$scope = { changed, ctx };
    			link.$set(link_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(nav);
    			}

    			destroy_component(link);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Nav", options, id: create_fragment$3.name });
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/pages/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.question = list[i];
    	return child_ctx;
    }

    // (36:10) {#each questions as question}
    function create_each_block(ctx) {
    	var option, t0_value = ctx.question.name + "", t0, t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = ctx.question;
    			option.value = option.__value;
    			add_location(option, file$3, 36, 10, 1380);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(36:10) {#each questions as question}", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var div3, div2, h2, t1, form, div1, select, t2, div0, svg, path, t3, button, dispose;

    	let each_value = ctx.questions;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			h2 = element("h2");
    			h2.textContent = "¿En que te podemos ayudar?";
    			t1 = space();
    			form = element("form");
    			div1 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t3 = space();
    			button = element("button");
    			button.textContent = "Seleccionar";
    			attr_dev(h2, "class", "text-lg text-black");
    			add_location(h2, file$3, 31, 4, 943);
    			if (ctx.page === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline");
    			add_location(select, file$3, 34, 8, 1128);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$3, 42, 99, 1695);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$3, 42, 10, 1606);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$3, 41, 8, 1498);
    			attr_dev(div1, "class", "inline-block relative w-12/12");
    			add_location(div1, file$3, 33, 6, 1076);
    			attr_dev(button, "class", "flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded mt-4");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 45, 6, 1822);
    			attr_dev(form, "class", "mt-4");
    			add_location(form, file$3, 32, 4, 1010);
    			attr_dev(div2, "class", "block relative bg-white shadow-md rounded px-8 pb-8 mb-4 w-12/12");
    			add_location(div2, file$3, 29, 2, 859);
    			attr_dev(div3, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div3, file$3, 27, 0, 784);

    			dispose = [
    				listen_dev(select, "change", ctx.select_change_handler),
    				listen_dev(form, "submit", prevent_default(ctx.handleSubmit), false, true)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, h2);
    			append_dev(div2, t1);
    			append_dev(div2, form);
    			append_dev(form, div1);
    			append_dev(div1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.page);

    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(form, t3);
    			append_dev(form, button);
    		},

    		p: function update(changed, ctx) {
    			if (changed.questions) {
    				each_value = ctx.questions;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.page) select_option(select, ctx.page);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let page;

      let questions = [
        { path: '/vs', name: `Valor de visas según país de origen` },
        { path: '/vc', name: `Valor de visas consulares según país de origen` },
        { path: '/pt', name: `Valor de permisos de trabajo según país de origen` },
        { path: '/ss', name: `Valor de la sanciones según cantidad de días y forma de presentación` },
        { path: '/nc', name: `Definitiva y nacionalización` },
        { path: '/pd', name: `Valores de tramites y documentos PDI` },
        { path: '/rc', name: `Valores de trámites y documentos Registro Civil Chileno` }
      ];

      function handleSubmit() {
        navigateTo(`${page.path}`);
      }

    	function select_change_handler() {
    		page = select_value(this);
    		$$invalidate('page', page);
    		$$invalidate('questions', questions);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate('page', page = $$props.page);
    		if ('questions' in $$props) $$invalidate('questions', questions = $$props.questions);
    	};

    	return {
    		page,
    		questions,
    		handleSubmit,
    		select_change_handler
    	};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Home", options, id: create_fragment$4.name });
    	}
    }

    var View1 = [
    	{
    		country: "AFGANISTAN",
    		sc: 130,
    		t: 100,
    		e: 15
    	},
    	{
    		country: "ALBANIA",
    		sc: 140,
    		t: 140,
    		e: 140
    	},
    	{
    		country: "ALEMANIA",
    		sc: 75,
    		t: 75,
    		e: 75
    	},
    	{
    		country: "ANDORRA",
    		sc: 100,
    		t: 100,
    		e: 18
    	},
    	{
    		country: "ANGOLA",
    		sc: 160,
    		t: 180,
    		e: 15
    	},
    	{
    		country: "ANTIGUA Y BARBUDA",
    		sc: 0,
    		t: 120,
    		e: 60
    	},
    	{
    		country: "ARABIA SAUDITA",
    		sc: 44,
    		t: 43,
    		e: 0
    	},
    	{
    		country: "ARGELIA",
    		sc: 40,
    		t: 40,
    		e: 40
    	},
    	{
    		country: "ARGENTINA",
    		sc: 270,
    		t: 100,
    		e: 270
    	},
    	{
    		country: "ARMENIA",
    		sc: 200,
    		t: 200,
    		e: 200
    	},
    	{
    		country: "AUSTRALIA",
    		sc: 325,
    		t: 325,
    		e: 365
    	},
    	{
    		country: "AUSTRIA",
    		sc: 100,
    		t: 100,
    		e: 100
    	},
    	{
    		country: "AZERBAIYAN",
    		sc: 250,
    		t: 250,
    		e: 250
    	},
    	{
    		country: "BAHAMAS",
    		sc: 0,
    		t: 25,
    		e: 25
    	},
    	{
    		country: "BAHREIN",
    		sc: 145,
    		t: 119,
    		e: 119
    	},
    	{
    		country: "BANGLADESH",
    		sc: 10,
    		t: 10,
    		e: 10
    	},
    	{
    		country: "BARBADOS",
    		sc: 50,
    		t: 50,
    		e: 50
    	},
    	{
    		country: "BELARUS",
    		sc: 270,
    		t: 270,
    		e: 270
    	},
    	{
    		country: "BELGICA",
    		sc: 236,
    		t: 236,
    		e: 236
    	},
    	{
    		country: "BELICE",
    		sc: 38,
    		t: 625,
    		e: 38
    	},
    	{
    		country: "BENIN",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "BHUTAN",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "BOLIVIA",
    		sc: 300,
    		t: 283,
    		e: 0
    	},
    	{
    		country: "BOSNIA Y HERZEGOVINA",
    		sc: 90,
    		t: 90,
    		e: 90
    	},
    	{
    		country: "BOTSWANA",
    		sc: 17,
    		t: 17,
    		e: 17
    	},
    	{
    		country: "BRASIL",
    		sc: 100,
    		t: 100,
    		e: 40
    	},
    	{
    		country: "BRUNEI",
    		sc: 16,
    		t: 16,
    		e: 16
    	},
    	{
    		country: "BULGARIA",
    		sc: 136,
    		t: 136,
    		e: 136
    	},
    	{
    		country: "BURKINA FASO",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "BURUNDI",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "CABO VERDE",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "CAMBOYA",
    		sc: 130,
    		t: 100,
    		e: 60
    	},
    	{
    		country: "CAMERUN",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "CANADA",
    		sc: 140,
    		t: 135,
    		e: 135
    	},
    	{
    		country: "CHAD",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "CENTRO AFRICANA REP.",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "CHECA REPUBLICA",
    		sc: 133,
    		t: 133,
    		e: 0
    	},
    	{
    		country: "CHINA,REP.POPULAR",
    		sc: 152,
    		t: 152,
    		e: 152
    	},
    	{
    		country: "CHIPRE",
    		sc: 122,
    		t: 122,
    		e: 65
    	},
    	{
    		country: "COLOMBIA",
    		sc: 295,
    		t: 180,
    		e: 65
    	},
    	{
    		country: "COMORAS, ISLAS",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "CONGO (BRAZZAVILLE)",
    		sc: 60,
    		t: 40,
    		e: 60
    	},
    	{
    		country: "COSTA RICA",
    		sc: 658,
    		t: 658,
    		e: 381
    	},
    	{
    		country: "COTE D'IVOIRE (COSTA DE MARFIL)",
    		sc: 62,
    		t: 62,
    		e: 62
    	},
    	{
    		country: "CROACIA",
    		sc: 46,
    		t: 105,
    		e: 46
    	},
    	{
    		country: "CUBA",
    		sc: 155,
    		t: 50,
    		e: 65
    	},
    	{
    		country: "DINAMARCA",
    		sc: 699,
    		t: 542,
    		e: 286
    	},
    	{
    		country: "DIJIBOUTI",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "DOMINICA",
    		sc: 296,
    		t: 296,
    		e: 74
    	},
    	{
    		country: "DOMINICANA, REP.",
    		sc: 90,
    		t: 90,
    		e: 80
    	},
    	{
    		country: "ECUADOR",
    		sc: 230,
    		t: 180,
    		e: 130
    	},
    	{
    		country: "EGIPTO",
    		sc: 15,
    		t: 15,
    		e: 15
    	},
    	{
    		country: "EL SALVADOR",
    		sc: 115,
    		t: 115,
    		e: 105
    	},
    	{
    		country: "EMIRATOS ARABES UNIDOS",
    		sc: 100,
    		t: 105,
    		e: 278
    	},
    	{
    		country: "ERITREA",
    		sc: 150,
    		t: 160,
    		e: 15
    	},
    	{
    		country: "ESLOVAQUIA",
    		sc: 137,
    		t: 137,
    		e: 0
    	},
    	{
    		country: "ESLOVENIA",
    		sc: 82,
    		t: 82,
    		e: 82
    	},
    	{
    		country: "ESPAÑA",
    		sc: 65,
    		t: 65,
    		e: 65
    	},
    	{
    		country: "ESTADOS UNIDOS DE AMERICA",
    		sc: 580,
    		t: 470,
    		e: 160
    	},
    	{
    		country: "ESTONIA",
    		sc: 105,
    		t: 105,
    		e: 105
    	},
    	{
    		country: "ETIOPIA",
    		sc: 30,
    		t: 30,
    		e: 30
    	},
    	{
    		country: "FEDERACION RUSA",
    		sc: 90,
    		t: 90,
    		e: 90
    	},
    	{
    		country: "FIJI",
    		sc: 160,
    		t: 160,
    		e: 70
    	},
    	{
    		country: "FILIPINAS",
    		sc: 400,
    		t: 305,
    		e: 250
    	},
    	{
    		country: "FINLANDIA",
    		sc: 667,
    		t: 562,
    		e: 407
    	},
    	{
    		country: "FRANCIA",
    		sc: 115,
    		t: 115,
    		e: 115
    	},
    	{
    		country: "FYROM (EX REP. YUGOSLAVA DE MACEDONIA)",
    		sc: 51,
    		t: 51,
    		e: 51
    	},
    	{
    		country: "GABON",
    		sc: 60,
    		t: 60,
    		e: 60
    	},
    	{
    		country: "GAMBIA",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "GEORGIA",
    		sc: 100,
    		t: 100,
    		e: 100
    	},
    	{
    		country: "GHANA",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "GRANADA",
    		sc: 0,
    		t: 0,
    		e: 40
    	},
    	{
    		country: "GRECIA",
    		sc: 98,
    		t: 98,
    		e: 98
    	},
    	{
    		country: "GUATEMALA",
    		sc: 150,
    		t: 150,
    		e: 50
    	},
    	{
    		country: "GUINEA",
    		sc: 95,
    		t: 95,
    		e: 4
    	},
    	{
    		country: "GUINEA BISSAU",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "GUINEA ECUATORIAL",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "GUYANA",
    		sc: 142,
    		t: 142,
    		e: 142
    	},
    	{
    		country: "HAITI",
    		sc: 25,
    		t: 25,
    		e: 15
    	},
    	{
    		country: "HONDURAS",
    		sc: 100,
    		t: 100,
    		e: 100
    	},
    	{
    		country: "HONG-KONG",
    		sc: 21,
    		t: 21,
    		e: 21
    	},
    	{
    		country: "HUNGRIA",
    		sc: 80,
    		t: 80,
    		e: 30
    	},
    	{
    		country: "INDIA",
    		sc: 147,
    		t: 147,
    		e: 106
    	},
    	{
    		country: "INDONESIA",
    		sc: 100,
    		t: 100,
    		e: 100
    	},
    	{
    		country: "IRAN",
    		sc: 130,
    		t: 130,
    		e: 91
    	},
    	{
    		country: "IRAQ",
    		sc: 73,
    		t: 73,
    		e: 73
    	},
    	{
    		country: "IRLANDA",
    		sc: 225,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "ISLANDIA",
    		sc: 96,
    		t: 96,
    		e: 96
    	},
    	{
    		country: "ISLAS MARSHALL",
    		sc: 35,
    		t: 35,
    		e: 35
    	},
    	{
    		country: "ISLAS SALOMON",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "ISRAEL",
    		sc: 48,
    		t: 0,
    		e: 25
    	},
    	{
    		country: "ITALIA",
    		sc: 139,
    		t: 139,
    		e: 139
    	},
    	{
    		country: "JAMAHIRlYA ARABE, LIBIA",
    		sc: 13,
    		t: 13,
    		e: 13
    	},
    	{
    		country: "JAMAICA",
    		sc: 150,
    		t: 150,
    		e: 150
    	},
    	{
    		country: "JAPON",
    		sc: 55,
    		t: 55,
    		e: 55
    	},
    	{
    		country: "JORDANIA",
    		sc: 44,
    		t: 43,
    		e: 0
    	},
    	{
    		country: "KAZA,JSTAN",
    		sc: 60,
    		t: 60,
    		e: 60
    	},
    	{
    		country: "KENYA",
    		sc: 385,
    		t: 385,
    		e: 13
    	},
    	{
    		country: "KIRGUISTAN",
    		sc: 125,
    		t: 125,
    		e: 125
    	},
    	{
    		country: "KIRIBATI",
    		sc: 23,
    		t: 23,
    		e: 23
    	},
    	{
    		country: "KUWAIT",
    		sc: 130,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "LESOTHO",
    		sc: 0,
    		t: 23,
    		e: 0
    	},
    	{
    		country: "LETONIA",
    		sc: 154,
    		t: 154,
    		e: 118
    	},
    	{
    		country: "LIBANO",
    		sc: 136,
    		t: 200,
    		e: 34
    	},
    	{
    		country: "LIBERIA",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "LIECHTENSTEIN",
    		sc: 150,
    		t: 150,
    		e: 150
    	},
    	{
    		country: "LITUANIA",
    		sc: 80,
    		t: 80,
    		e: 80
    	},
    	{
    		country: "LUXEMBURGO",
    		sc: 236,
    		t: 236,
    		e: 236
    	},
    	{
    		country: "MACAO",
    		sc: 12,
    		t: 12,
    		e: 0
    	},
    	{
    		country: "MADAGASCAR",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "MALASIA",
    		sc: 72,
    		t: 35,
    		e: 18
    	},
    	{
    		country: "MALAWI",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "MALDIVAS",
    		sc: 130,
    		t: 100,
    		e: 15
    	},
    	{
    		country: "MALI",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "MALTA",
    		sc: 34,
    		t: 34,
    		e: 34
    	},
    	{
    		country: "MARRUECOS",
    		sc: 15,
    		t: 15,
    		e: 15
    	},
    	{
    		country: "MAURICIO, ISLAS",
    		sc: 0,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "MAURITANIA",
    		sc: 25,
    		t: 25,
    		e: 25
    	},
    	{
    		country: "MEXICO",
    		sc: 411,
    		t: 286,
    		e: 36
    	},
    	{
    		country: "MíCRONESIA, EST. FED.",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "MOLDOVA",
    		sc: 110,
    		t: 110,
    		e: 110
    	},
    	{
    		country: "MONACO",
    		sc: 0,
    		t: 10,
    		e: 0
    	},
    	{
    		country: "MONGOLIA",
    		sc: 45,
    		t: 39,
    		e: 39
    	},
    	{
    		country: "MONTENEGRO",
    		sc: 0,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "MOZAMBIQUE",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "MYANMAR (EX - BIRMANIA)",
    		sc: 180,
    		t: 100,
    		e: 15
    	},
    	{
    		country: "NAMIBIA",
    		sc: 72,
    		t: 72,
    		e: 72
    	},
    	{
    		country: "NAURU",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "NEPAL",
    		sc: 100,
    		t: 10,
    		e: 30
    	},
    	{
    		country: "NICARAGUA",
    		sc: 142,
    		t: 267,
    		e: 121
    	},
    	{
    		country: "NIGER",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "NIGERIA",
    		sc: 112,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "NORUEGA",
    		sc: 463,
    		t: 463,
    		e: 386
    	},
    	{
    		country: "NUEVA ZELANDIA",
    		sc: 310,
    		t: 1380,
    		e: 235
    	},
    	{
    		country: "OMAN",
    		sc: 130,
    		t: 100,
    		e: 15
    	},
    	{
    		country: "PAISES BAJOS",
    		sc: 1205,
    		t: 320,
    		e: 425
    	},
    	{
    		country: "PAKISTAN",
    		sc: 144,
    		t: 120,
    		e: 72
    	},
    	{
    		country: "PALAU",
    		sc: 0,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "PALESTINA",
    		sc: 33,
    		t: 0,
    		e: 25
    	},
    	{
    		country: "PANAMA",
    		sc: 50,
    		t: 50,
    		e: 50
    	},
    	{
    		country: "PAPUA NUt VA GUINEA",
    		sc: 220,
    		t: 220,
    		e: 40
    	},
    	{
    		country: "PARAGUAY",
    		sc: 300,
    		t: 312,
    		e: 300
    	},
    	{
    		country: "PERU",
    		sc: 80,
    		t: 80,
    		e: 80
    	},
    	{
    		country: "POLONIA",
    		sc: 78,
    		t: 78,
    		e: 78
    	},
    	{
    		country: "PORTUGAL",
    		sc: 115,
    		t: 115,
    		e: 115
    	},
    	{
    		country: "QATAR",
    		sc: 70,
    		t: 70,
    		e: 70
    	},
    	{
    		country: "REINO UNIDO",
    		sc: 806,
    		t: 1388,
    		e: 487
    	},
    	{
    		country: "REPUBLICA DE COREA DEL SUR",
    		sc: 90,
    		t: 90,
    		e: 90
    	},
    	{
    		country: "REP. DEM. DEL CONGO",
    		sc: 70,
    		t: 70,
    		e: 70
    	},
    	{
    		country: "REP. POP. DEMOC. DE COREA DEL NORTE",
    		sc: 40,
    		t: 40,
    		e: 40
    	},
    	{
    		country: "REP. POP. DEMOC. DE LAOS",
    		sc: 35,
    		t: 35,
    		e: 35
    	},
    	{
    		country: "REP. UNIDA DE TANZANIA",
    		sc: 600,
    		t: 600,
    		e: 100
    	},
    	{
    		country: "RUMANIA",
    		sc: 163,
    		t: 163,
    		e: 163
    	},
    	{
    		country: "RWANDA",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "SAMOA OCCIDENTAL",
    		sc: 500,
    		t: 250,
    		e: 125
    	},
    	{
    		country: "SAN CRISTOBAL Y NEVIS",
    		sc: 937,
    		t: 225,
    		e: 150
    	},
    	{
    		country: "SAN MARINO",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "SAN VICENTE Y GRANADINAS",
    		sc: 590,
    		t: 590,
    		e: 590
    	},
    	{
    		country: "SANTA LUCIA",
    		sc: 140,
    		t: 280,
    		e: 280
    	},
    	{
    		country: "SANTA SEDE (VATICANO)",
    		sc: 0,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "SANTO TOME Y PRINCIPE",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "SENEGAL",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "SERBIA",
    		sc: 148,
    		t: 148,
    		e: 148
    	},
    	{
    		country: "SEYCHELLES",
    		sc: 60,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "SIERRA LEONA",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "SINGAPUR",
    		sc: 200,
    		t: 77,
    		e: 150
    	},
    	{
    		country: "SIRIA, REP ARABE",
    		sc: 6,
    		t: 6,
    		e: 6
    	},
    	{
    		country: "SOMALIA",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "SRI LANKA",
    		sc: 200,
    		t: 200,
    		e: 200
    	},
    	{
    		country: "SUDAFRICA",
    		sc: 47,
    		t: 47,
    		e: 47
    	},
    	{
    		country: "SUDAN",
    		sc: 70,
    		t: 35,
    		e: 35
    	},
    	{
    		country: "SUECIA",
    		sc: 278,
    		t: 209,
    		e: 139
    	},
    	{
    		country: "SUIZA",
    		sc: 100,
    		t: 100,
    		e: 100
    	},
    	{
    		country: "SURINAM",
    		sc: 45,
    		t: 40,
    		e: 15
    	},
    	{
    		country: "SWAZILANDIA",
    		sc: 27,
    		t: 27,
    		e: 27
    	},
    	{
    		country: "TAJLANDIA",
    		sc: 150,
    		t: 150,
    		e: 150
    	},
    	{
    		country: "TAIWAN",
    		sc: 66,
    		t: 66,
    		e: 66
    	},
    	{
    		country: "TAYIKISTAN",
    		sc: 200,
    		t: 200,
    		e: 200
    	},
    	{
    		country: "TIMOR ORIENTAL",
    		sc: 50,
    		t: 50,
    		e: 40
    	},
    	{
    		country: "TOGO",
    		sc: 120,
    		t: 60,
    		e: 15
    	},
    	{
    		country: "TONGA",
    		sc: 0,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "TRINIDAD Y TOBAGO",
    		sc: 1000,
    		t: 160,
    		e: 35
    	},
    	{
    		country: "TUNEZ",
    		sc: 0,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "TURKMENISTAN",
    		sc: 500,
    		t: 500,
    		e: 370
    	},
    	{
    		country: "TURQUIA",
    		sc: 165,
    		t: 165,
    		e: 85
    	},
    	{
    		country: "TUVALU",
    		sc: 0,
    		t: 0,
    		e: 0
    	},
    	{
    		country: "UCRANIA",
    		sc: 200,
    		t: 85,
    		e: 50
    	},
    	{
    		country: "UGANDA",
    		sc: 160,
    		t: 160,
    		e: 60
    	},
    	{
    		country: "URUGUAY",
    		sc: 65,
    		t: 65,
    		e: 65
    	},
    	{
    		country: "UZBEKISTAN",
    		sc: 250,
    		t: 250,
    		e: 250
    	},
    	{
    		country: "VANUATU",
    		sc: 280,
    		t: 280,
    		e: 23
    	},
    	{
    		country: "VENEZUELA",
    		sc: 60,
    		t: 60,
    		e: 60
    	},
    	{
    		country: "VIETNAM",
    		sc: 100,
    		t: 100,
    		e: 100
    	},
    	{
    		country: "YEMEN",
    		sc: 130,
    		t: 100,
    		e: 15
    	},
    	{
    		country: "ZAMBIA",
    		sc: 74,
    		t: 74,
    		e: 23
    	},
    	{
    		country: "ZIMBABWE",
    		sc: 100,
    		t: 100,
    		e: 80
    	}
    ];

    /* src/Helpers.svelte generated by Svelte v3.12.1 */

    function format(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
    return x1 + x2;
    }

    /* src/pages/Vs.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/pages/Vs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.data1 = list[i];
    	return child_ctx;
    }

    // (29:7) {#each View1 as data1}
    function create_each_block$1(ctx) {
    	var option, t0_value = ctx.data1["country"] + "", t0, t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = ctx.data1;
    			option.value = option.__value;
    			add_location(option, file$4, 29, 7, 1032);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(29:7) {#each View1 as data1}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var div4, div3, h2, t1, div2, label, t3, div1, select, t4, div0, svg, path, t5, table, thead, tr0, th0, t7, th1, t9, th2, t11, tbody, tr1, td0, t13, td1, t14, t15_value = ctx.selected ? ctx.selected["sc"] : '[waiting...]' + "", t15, t16, td2, t17, t18_value = ctx.selected ? format(Math.round((ctx.selected["sc"]*ctx.price_dollar))) : '[waiting...]' + "", t18, t19, tr2, td3, t21, td4, t22, t23_value = ctx.selected ? ctx.selected["t"] : '[waiting...]' + "", t23, t24, td5, t25, t26_value = ctx.selected ? format(Math.round((ctx.selected["t"]*ctx.price_dollar))) : '[waiting...]' + "", t26, t27, tr3, td6, t29, td7, t30, t31_value = ctx.selected ? ctx.selected["e"] : '[waiting...]' + "", t31, t32, td8, t33, t34_value = ctx.selected ? format(Math.round((ctx.selected["e"]*ctx.price_dollar))) : '[waiting...]' + "", t34, dispose;

    	let each_value = View1;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Valor de visas según tu país de origen";
    			t1 = space();
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Seleccione país de nacimiento";
    			t3 = space();
    			div1 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t5 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Tipo de visa";
    			t7 = space();
    			th1 = element("th");
    			th1.textContent = "Dolares";
    			t9 = space();
    			th2 = element("th");
    			th2.textContent = "Pesos chilenos";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Sujeta a contrato";
    			t13 = space();
    			td1 = element("td");
    			t14 = text("US$ ");
    			t15 = text(t15_value);
    			t16 = space();
    			td2 = element("td");
    			t17 = text("$ ");
    			t18 = text(t18_value);
    			t19 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			td3.textContent = "Temporaria";
    			t21 = space();
    			td4 = element("td");
    			t22 = text("US$ ");
    			t23 = text(t23_value);
    			t24 = space();
    			td5 = element("td");
    			t25 = text("$ ");
    			t26 = text(t26_value);
    			t27 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Estudiante";
    			t29 = space();
    			td7 = element("td");
    			t30 = text("US$ ");
    			t31 = text(t31_value);
    			t32 = space();
    			td8 = element("td");
    			t33 = text("$ ");
    			t34 = text(t34_value);
    			add_location(h2, file$4, 23, 1, 503);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$4, 25, 4, 607);
    			if (ctx.selected === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			add_location(select, file$4, 27, 6, 781);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$4, 35, 95, 1325);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$4, 35, 6, 1236);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-grey-700");
    			add_location(div0, file$4, 34, 4, 1132);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$4, 26, 6, 752);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$4, 24, 4, 555);
    			attr_dev(th0, "class", "w-3/6 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$4, 42, 6, 1512);
    			attr_dev(th1, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$4, 43, 6, 1635);
    			attr_dev(th2, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$4, 44, 6, 1753);
    			add_location(tr0, file$4, 41, 4, 1501);
    			add_location(thead, file$4, 40, 2, 1489);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$4, 49, 6, 1935);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$4, 50, 6, 1993);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$4, 51, 6, 2082);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$4, 48, 4, 1907);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$4, 54, 6, 2243);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$4, 55, 6, 2294);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$4, 56, 6, 2382);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$4, 53, 4, 2212);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$4, 59, 6, 2539);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$4, 60, 6, 2590);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$4, 61, 6, 2678);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$4, 58, 4, 2511);
    			add_location(tbody, file$4, 47, 2, 1895);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$4, 39, 0, 1447);
    			attr_dev(div3, "class", "w-2/3");
    			add_location(div3, file$4, 22, 2, 482);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$4, 21, 0, 408);
    			dispose = listen_dev(select, "change", ctx.select_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.selected);

    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div3, t5);
    			append_dev(div3, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t7);
    			append_dev(tr0, th1);
    			append_dev(tr0, t9);
    			append_dev(tr0, th2);
    			append_dev(table, t11);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, t14);
    			append_dev(td1, t15);
    			append_dev(tr1, t16);
    			append_dev(tr1, td2);
    			append_dev(td2, t17);
    			append_dev(td2, t18);
    			append_dev(tbody, t19);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td3);
    			append_dev(tr2, t21);
    			append_dev(tr2, td4);
    			append_dev(td4, t22);
    			append_dev(td4, t23);
    			append_dev(tr2, t24);
    			append_dev(tr2, td5);
    			append_dev(td5, t25);
    			append_dev(td5, t26);
    			append_dev(tbody, t27);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t29);
    			append_dev(tr3, td7);
    			append_dev(td7, t30);
    			append_dev(td7, t31);
    			append_dev(tr3, t32);
    			append_dev(tr3, td8);
    			append_dev(td8, t33);
    			append_dev(td8, t34);
    		},

    		p: function update(changed, ctx) {
    			if (changed.View1) {
    				each_value = View1;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.selected) select_option(select, ctx.selected);

    			if ((changed.selected) && t15_value !== (t15_value = ctx.selected ? ctx.selected["sc"] : '[waiting...]' + "")) {
    				set_data_dev(t15, t15_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t18_value !== (t18_value = ctx.selected ? format(Math.round((ctx.selected["sc"]*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t18, t18_value);
    			}

    			if ((changed.selected) && t23_value !== (t23_value = ctx.selected ? ctx.selected["t"] : '[waiting...]' + "")) {
    				set_data_dev(t23, t23_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t26_value !== (t26_value = ctx.selected ? format(Math.round((ctx.selected["t"]*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t26, t26_value);
    			}

    			if ((changed.selected) && t31_value !== (t31_value = ctx.selected ? ctx.selected["e"] : '[waiting...]' + "")) {
    				set_data_dev(t31, t31_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t34_value !== (t34_value = ctx.selected ? format(Math.round((ctx.selected["e"]*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t34, t34_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div4);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

    let selected;
    let price_dollar;

    onMount(async () => {
        await fetch(`https://mindicador.cl/api`)
          .then(r => r.json())
          .then(data => {
            $$invalidate('price_dollar', price_dollar = data.dolar.valor);
          });
    });

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate('selected', selected);
    		$$invalidate('View1', View1);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('price_dollar' in $$props) $$invalidate('price_dollar', price_dollar = $$props.price_dollar);
    	};

    	return {
    		selected,
    		price_dollar,
    		select_change_handler
    	};
    }

    class Vs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Vs", options, id: create_fragment$5.name });
    	}
    }

    var View1$1 = [
    	{
    		country: "AFGANISTAN",
    		vct: 130,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "ALBANIA",
    		vct: "NA",
    		vo: 140,
    		von: 140,
    		voi: 140
    	},
    	{
    		country: "ALEMANIA",
    		vct: "NA",
    		vo: 75,
    		von: 75,
    		voi: 75
    	},
    	{
    		country: "ANDORRA",
    		vct: "NA",
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "ANGOLA",
    		vct: 160,
    		vo: 180,
    		von: 180,
    		voi: 180
    	},
    	{
    		country: "ANTIGUA Y BARBUDA",
    		vct: "NA",
    		vo: 120,
    		von: 120,
    		voi: 120
    	},
    	{
    		country: "APATRIDAS, ASILADOS Y REFUGIADOS",
    		vct: "NA",
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "ARABIA SAUDITA",
    		vct: 44,
    		vo: 43,
    		von: 43,
    		voi: 43
    	},
    	{
    		country: "ARGELIA",
    		vct: "NA",
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "ARGENTINA",
    		vct: "NA",
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "ARMENIA",
    		vct: 200,
    		vo: 200,
    		von: 200,
    		voi: 200
    	},
    	{
    		country: "AUSTRALIA",
    		vct: "NA",
    		vo: 325,
    		von: 325,
    		voi: 325
    	},
    	{
    		country: "AUSTRIA",
    		vct: "NA",
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "AZERBAIYAN",
    		vct: 250,
    		vo: 250,
    		von: 250,
    		voi: 250
    	},
    	{
    		country: "BAHAMAS",
    		vct: "NA",
    		vo: 25,
    		von: 25,
    		voi: 25
    	},
    	{
    		country: "BAHREIN",
    		vct: 145,
    		vo: 119,
    		von: 119,
    		voi: 119
    	},
    	{
    		country: "BANGLADESH",
    		vct: 10,
    		vo: 10,
    		von: 10,
    		voi: 10
    	},
    	{
    		country: "BARBADOS",
    		vct: "NA",
    		vo: 50,
    		von: 50,
    		voi: 50
    	},
    	{
    		country: "BELARUS",
    		vct: 270,
    		vo: 270,
    		von: 270,
    		voi: 270
    	},
    	{
    		country: "BELGICA",
    		vct: "NA",
    		vo: 236,
    		von: 236,
    		voi: 236
    	},
    	{
    		country: "BELICE",
    		vct: "NA",
    		vo: 625,
    		von: 625,
    		voi: 625
    	},
    	{
    		country: "BENIN",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "BHUTAN",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "BOLIVIA",
    		vct: "NA",
    		vo: 283,
    		von: 283,
    		voi: 283
    	},
    	{
    		country: "BOSNIA Y HERZEGOVINA",
    		vct: "NA",
    		vo: 90,
    		von: 90,
    		voi: 90
    	},
    	{
    		country: "BOTSWANA",
    		vct: 17,
    		vo: 17,
    		von: 17,
    		voi: 17
    	},
    	{
    		country: "BRASIL",
    		vct: "NA",
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "BRUNEI",
    		vct: "NA",
    		vo: 16,
    		von: 16,
    		voi: 16
    	},
    	{
    		country: "BULGARIA",
    		vct: "NA",
    		vo: 136,
    		von: 136,
    		voi: 136
    	},
    	{
    		country: "BURKINA FASO",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "BURUNDI",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "CABO VERDE",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "CAMBOYA",
    		vct: 130,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "CAMERUN",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "CANADA",
    		vct: "NA",
    		vo: 135,
    		von: 135,
    		voi: 135
    	},
    	{
    		country: "CHAD",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "CENTRO AFRICANA REP.",
    		vct: "NA",
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "CHECA REPUBLICA",
    		vct: "NA",
    		vo: 133,
    		von: 133,
    		voi: 133
    	},
    	{
    		country: "CHINA,REP.POPULAR",
    		vct: 152,
    		vo: 152,
    		von: 152,
    		voi: 152
    	},
    	{
    		country: "CHIPRE",
    		vct: "NA",
    		vo: 122,
    		von: 122,
    		voi: 122
    	},
    	{
    		country: "COLOMBIA",
    		vct: "NA",
    		vo: 180,
    		von: 180,
    		voi: 180
    	},
    	{
    		country: "COMORAS, ISLAS",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "CONGO (BRAZZAVILLE)",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "COSTA RICA",
    		vct: "NA",
    		vo: 658,
    		von: 658,
    		voi: 658
    	},
    	{
    		country: "COTE D'IVOIRE (COSTA DE MARFIL)",
    		vct: 62,
    		vo: 62,
    		von: 62,
    		voi: 62
    	},
    	{
    		country: "CROACIA",
    		vct: "NA",
    		vo: 105,
    		von: 105,
    		voi: 105
    	},
    	{
    		country: "CUBA",
    		vct: 155,
    		vo: 50,
    		von: 50,
    		voi: 50
    	},
    	{
    		country: "DINAMARCA",
    		vct: "NA",
    		vo: 542,
    		von: 542,
    		voi: 542
    	},
    	{
    		country: "DIJIBOUTI",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "DOMINICA",
    		vct: 296,
    		vo: 296,
    		von: 296,
    		voi: 296
    	},
    	{
    		country: "DOMINICANA, REP.",
    		vct: 90,
    		vo: 90,
    		von: 90,
    		voi: 90
    	},
    	{
    		country: "ECUADOR",
    		vct: "NA",
    		vo: 180,
    		von: 180,
    		voi: 180
    	},
    	{
    		country: "EGIPTO",
    		vct: 15,
    		vo: 15,
    		von: 15,
    		voi: 15
    	},
    	{
    		country: "EL SALVADOR",
    		vct: "NA",
    		vo: 115,
    		von: 115,
    		voi: 115
    	},
    	{
    		country: "EMIRATOS ARABES UNIDOS",
    		vct: 100,
    		vo: 105,
    		von: 105,
    		voi: 105
    	},
    	{
    		country: "ERITREA",
    		vct: 150,
    		vo: 160,
    		von: 160,
    		voi: 160
    	},
    	{
    		country: "ESLOVAQUIA",
    		vct: "NA",
    		vo: 137,
    		von: 137,
    		voi: 137
    	},
    	{
    		country: "ESLOVENIA",
    		vct: "NA",
    		vo: 82,
    		von: 82,
    		voi: 82
    	},
    	{
    		country: "ESPAÑA",
    		vct: "NA",
    		vo: 65,
    		von: 65,
    		voi: 65
    	},
    	{
    		country: "ESTADOS UNIDOS DE AMERICA",
    		vct: "NA",
    		vo: 470,
    		von: 470,
    		voi: 470
    	},
    	{
    		country: "ESTONIA",
    		vct: "NA",
    		vo: 105,
    		von: 105,
    		voi: 105
    	},
    	{
    		country: "ETIOPIA",
    		vct: 30,
    		vo: 30,
    		von: 30,
    		voi: 30
    	},
    	{
    		country: "FEDERACION RUSA",
    		vct: "NA",
    		vo: 90,
    		von: 90,
    		voi: 90
    	},
    	{
    		country: "FIJI",
    		vct: "NA",
    		vo: 160,
    		von: 160,
    		voi: 160
    	},
    	{
    		country: "FILIPINAS",
    		vct: 400,
    		vo: 305,
    		von: 305,
    		voi: 305
    	},
    	{
    		country: "FINLANDIA",
    		vct: "NA",
    		vo: 562,
    		von: 562,
    		voi: 562
    	},
    	{
    		country: "FRANCIA",
    		vct: "NA",
    		vo: 115,
    		von: 115,
    		voi: 115
    	},
    	{
    		country: "FYROM (EX REP. YUGOSLAVA DE MACEDONIA\\",
    		vct: "NA",
    		vo: 51,
    		von: 51,
    		voi: 51
    	},
    	{
    		country: "GABON",
    		vct: 60,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "GAMBIA",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "GEORGIA",
    		vct: 100,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "GHANA",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "GRANADA",
    		vct: "NA",
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "GRECIA",
    		vct: "NA",
    		vo: 98,
    		von: 98,
    		voi: 98
    	},
    	{
    		country: "GUATEMALA",
    		vct: "NA",
    		vo: 150,
    		von: 150,
    		voi: 150
    	},
    	{
    		country: "GUINEA",
    		vct: 95,
    		vo: 95,
    		von: 95,
    		voi: 95
    	},
    	{
    		country: "GUINEA BISSAU",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "GUINEA ECUATORIAL",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "GUYANA",
    		vct: 142,
    		vo: 142,
    		von: 142,
    		voi: 142
    	},
    	{
    		country: "HAITI",
    		vct: 25,
    		vo: 25,
    		von: 25,
    		voi: 25
    	},
    	{
    		country: "HONDURAS",
    		vct: "NA",
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "HONG-KONG",
    		vct: "NA",
    		vo: 21,
    		von: 21,
    		voi: 21
    	},
    	{
    		country: "HUNGRIA",
    		vct: "NA",
    		vo: 80,
    		von: 80,
    		voi: 80
    	},
    	{
    		country: "INDIA",
    		vct: 147,
    		vo: 147,
    		von: 147,
    		voi: 147
    	},
    	{
    		country: "INDONESIA",
    		vct: "NA",
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "IRAN",
    		vct: 130,
    		vo: 130,
    		von: 130,
    		voi: 130
    	},
    	{
    		country: "IRAQ",
    		vct: 73,
    		vo: 73,
    		von: 73,
    		voi: 73
    	},
    	{
    		country: "IRLANDA",
    		vct: "NA",
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "ISLANDIA",
    		vct: "NA",
    		vo: 96,
    		von: 96,
    		voi: 96
    	},
    	{
    		country: "ISLAS MARSHALL",
    		vct: 35,
    		vo: 35,
    		von: 35,
    		voi: 35
    	},
    	{
    		country: "ISLAS SALOMON",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "ISRAEL",
    		vct: 44,
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "ITALIA",
    		vct: "NA",
    		vo: 139,
    		von: 139,
    		voi: 139
    	},
    	{
    		country: "JAMAHIRlYA ARABE, LIBIA",
    		vct: "NA",
    		vo: 13,
    		von: 13,
    		voi: 13
    	},
    	{
    		country: "JAMAICA",
    		vct: "NA",
    		vo: 150,
    		von: 150,
    		voi: 150
    	},
    	{
    		country: "JAPON",
    		vct: "NA",
    		vo: 55,
    		von: 55,
    		voi: 55
    	},
    	{
    		country: "JORDANIA",
    		vct: 44,
    		vo: 43,
    		von: 43,
    		voi: 43
    	},
    	{
    		country: "KAZA,JSTAN",
    		vct: 60,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "KENYA",
    		vct: 385,
    		vo: 385,
    		von: 385,
    		voi: 385
    	},
    	{
    		country: "KIRGUISTAN",
    		vct: 125,
    		vo: 125,
    		von: 125,
    		voi: 125
    	},
    	{
    		country: "KIRIBATI",
    		vct: 23,
    		vo: 23,
    		von: 23,
    		voi: 23
    	},
    	{
    		country: "KUWAIT",
    		vct: 130,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "LESOTHO",
    		vct: 0,
    		vo: 23,
    		von: 23,
    		voi: 23
    	},
    	{
    		country: "LETONIA",
    		vct: "NA",
    		vo: 154,
    		von: 154,
    		voi: 154
    	},
    	{
    		country: "LIBANO",
    		vct: 136,
    		vo: 200,
    		von: 200,
    		voi: 200
    	},
    	{
    		country: "LIBERIA",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "LIECHTENSTEIN",
    		vct: "NA",
    		vo: 150,
    		von: 150,
    		voi: 150
    	},
    	{
    		country: "LITUANIA",
    		vct: "NA",
    		vo: 80,
    		von: 80,
    		voi: 80
    	},
    	{
    		country: "LUXEMBURGO",
    		vct: "NA",
    		vo: 236,
    		von: 236,
    		voi: 236
    	},
    	{
    		country: "MACAO",
    		vct: "NA",
    		vo: 12,
    		von: 12,
    		voi: 12
    	},
    	{
    		country: "MADAGASCAR",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "MALASIA",
    		vct: 72,
    		vo: 35,
    		von: 35,
    		voi: 35
    	},
    	{
    		country: "MALAWI",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "MALDIVAS",
    		vct: 130,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "MALI",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "MALTA",
    		vct: "NA",
    		vo: 34,
    		von: 34,
    		voi: 34
    	},
    	{
    		country: "MARRUECOS",
    		vct: 15,
    		vo: 15,
    		von: 15,
    		voi: 15
    	},
    	{
    		country: "MAURICIO, ISLAS",
    		vct: "NA",
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "MAURITANIA",
    		vct: 25,
    		vo: 25,
    		von: 25,
    		voi: 25
    	},
    	{
    		country: "MEXICO",
    		vct: "NA",
    		vo: 286,
    		von: 286,
    		voi: 286
    	},
    	{
    		country: "MíCRONESIA, EST. FED.",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "MOLDOVA",
    		vct: "NA",
    		vo: 110,
    		von: 110,
    		voi: 110
    	},
    	{
    		country: "MONACO",
    		vct: "NA",
    		vo: 10,
    		von: 10,
    		voi: 10
    	},
    	{
    		country: "MONGOLIA",
    		vct: "NA",
    		vo: 39,
    		von: 39,
    		voi: 39
    	},
    	{
    		country: "MONTENEGRO",
    		vct: "NA",
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "MOZAMBIQUE",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "MYANMAR (EX - BlRMANIA)",
    		vct: 180,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "NAMIBIA",
    		vct: 72,
    		vo: 72,
    		von: 72,
    		voi: 72
    	},
    	{
    		country: "NAURU",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "NEPAL",
    		vct: 100,
    		vo: 10,
    		von: 10,
    		voi: 10
    	},
    	{
    		country: "NICARAGUA",
    		vct: "NA",
    		vo: 267,
    		von: 267,
    		voi: 267
    	},
    	{
    		country: "NIGER",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "NIGERIA",
    		vct: 112,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "NORUEGA",
    		vct: "NA",
    		vo: 463,
    		von: 463,
    		voi: 463
    	},
    	{
    		country: "NUEVA ZELANDIA",
    		vct: "NA",
    		vo: 1380,
    		von: 1380,
    		voi: 1380
    	},
    	{
    		country: "OMAN",
    		vct: 130,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "PAISES BAJOS",
    		vct: "NA",
    		vo: 320,
    		von: 320,
    		voi: 320
    	},
    	{
    		country: "PAKISTAN",
    		vct: 144,
    		vo: 120,
    		von: 120,
    		voi: 120
    	},
    	{
    		country: "PALAU",
    		vct: 0,
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "PALESTINA",
    		vct: 33,
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "PANAMA",
    		vct: "NA",
    		vo: 50,
    		von: 50,
    		voi: 50
    	},
    	{
    		country: "PAPUA NUt VA GUINEA",
    		vct: 220,
    		vo: 220,
    		von: 220,
    		voi: 220
    	},
    	{
    		country: "PARAGUAY",
    		vct: "NA",
    		vo: 312,
    		von: 312,
    		voi: 312
    	},
    	{
    		country: "PERU",
    		vct: "NA",
    		vo: 80,
    		von: 80,
    		voi: 80
    	},
    	{
    		country: "POLONIA",
    		vct: "NA",
    		vo: 78,
    		von: 78,
    		voi: 78
    	},
    	{
    		country: "PORTUGAL",
    		vct: "NA",
    		vo: 115,
    		von: 115,
    		voi: 115
    	},
    	{
    		country: "QATAR",
    		vct: 70,
    		vo: 70,
    		von: 70,
    		voi: 70
    	},
    	{
    		country: "REINO UNIDO",
    		vct: "NA",
    		vo: 1388,
    		von: 1388,
    		voi: 1388
    	},
    	{
    		country: "REPUBLICA DE COREA DEL SUR",
    		vct: "NA",
    		vo: 90,
    		von: 90,
    		voi: 90
    	},
    	{
    		country: "REP. DEM. DEL CONGO",
    		vct: 70,
    		vo: 70,
    		von: 70,
    		voi: 70
    	},
    	{
    		country: "REP. POP. DEMOC. DE COREA DEL NORTE",
    		vct: 40,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "REP. POP. DEMOC. DE LAOS",
    		vct: 35,
    		vo: 35,
    		von: 35,
    		voi: 35
    	},
    	{
    		country: "REP. UNIDA DE TANZANIA",
    		vct: "NA",
    		vo: 600,
    		von: 600,
    		voi: 600
    	},
    	{
    		country: "RUMANIA",
    		vct: "NA",
    		vo: 163,
    		von: 163,
    		voi: 163
    	},
    	{
    		country: "RWANDA",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "SAMOA OCCIDENTAL",
    		vct: 500,
    		vo: 250,
    		von: 250,
    		voi: 250
    	},
    	{
    		country: "SAN CRISTOBAL Y NEVIS",
    		vct: "NA",
    		vo: 225,
    		von: 225,
    		voi: 225
    	},
    	{
    		country: "SAN MARINO",
    		vct: "NA",
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "SAN VICENTE Y GRANADINAS",
    		vct: "NA",
    		vo: 590,
    		von: 590,
    		voi: 590
    	},
    	{
    		country: "SANTA LUCIA",
    		vct: "NA",
    		vo: 280,
    		von: 280,
    		voi: 280
    	},
    	{
    		country: "SANTA SEDE(VATICANO)",
    		vct: "NA",
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "SANTO TOME Y PRINCIPE",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "SENEGAL",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "SERBIA",
    		vct: "NA",
    		vo: 148,
    		von: 148,
    		voi: 148
    	},
    	{
    		country: "SEYCHELLES",
    		vct: 60,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "SIERRA LEONA",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "SINGAPUR",
    		vct: "NA",
    		vo: 77,
    		von: 77,
    		voi: 77
    	},
    	{
    		country: "SIRIA, REP ARABE",
    		vct: 6,
    		vo: 6,
    		von: 6,
    		voi: 6
    	},
    	{
    		country: "SOMALIA",
    		vct: "NA",
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "SRI LANKA",
    		vct: 200,
    		vo: 200,
    		von: 200,
    		voi: 200
    	},
    	{
    		country: "SUDAFRICA",
    		vct: "NA",
    		vo: 47,
    		von: 47,
    		voi: 47
    	},
    	{
    		country: "SUDAN",
    		vct: 70,
    		vo: 35,
    		von: 35,
    		voi: 35
    	},
    	{
    		country: "SUECIA",
    		vct: "NA",
    		vo: 209,
    		von: 209,
    		voi: 209
    	},
    	{
    		country: "SUIZA",
    		vct: "NA",
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "SURINAM",
    		vct: 45,
    		vo: 40,
    		von: 40,
    		voi: 40
    	},
    	{
    		country: "SWAZILANDIA",
    		vct: 27,
    		vo: 27,
    		von: 27,
    		voi: 27
    	},
    	{
    		country: "TAJLANDIA",
    		vct: "NA",
    		vo: 150,
    		von: 150,
    		voi: 150
    	},
    	{
    		country: "TAIWAN",
    		vct: 66,
    		vo: 66,
    		von: 66,
    		voi: 66
    	},
    	{
    		country: "TAYIKISTAN",
    		vct: 200,
    		vo: 200,
    		von: 200,
    		voi: 200
    	},
    	{
    		country: "TIMOR ORIENTAL",
    		vct: 50,
    		vo: 50,
    		von: 50,
    		voi: 50
    	},
    	{
    		country: "TOGO",
    		vct: 120,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "TONGA",
    		vct: "NA",
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "TRINIDAD Y TOBAGO",
    		vct: "NA",
    		vo: 160,
    		von: 160,
    		voi: 160
    	},
    	{
    		country: "TUNEZ",
    		vct: 0,
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "TURKMENISTAN",
    		vct: 500,
    		vo: 500,
    		von: 500,
    		voi: 500
    	},
    	{
    		country: "TURQUIA",
    		vct: "NA",
    		vo: 165,
    		von: 165,
    		voi: 165
    	},
    	{
    		country: "TUVALU",
    		vct: 0,
    		vo: 0,
    		von: 0,
    		voi: 0
    	},
    	{
    		country: "UCRANIA",
    		vct: 200,
    		vo: 85,
    		von: 85,
    		voi: 85
    	},
    	{
    		country: "UGANDA",
    		vct: 160,
    		vo: 160,
    		von: 160,
    		voi: 160
    	},
    	{
    		country: "URUGUAY",
    		vct: "NA",
    		vo: 65,
    		von: 65,
    		voi: 65
    	},
    	{
    		country: "UZBEKISTAN",
    		vct: 250,
    		vo: 250,
    		von: 250,
    		voi: 250
    	},
    	{
    		country: "VANUATU",
    		vct: 280,
    		vo: 280,
    		von: 280,
    		voi: 280
    	},
    	{
    		country: "VENEZUELA",
    		vct: 60,
    		vo: 60,
    		von: 60,
    		voi: 60
    	},
    	{
    		country: "VIETNAM",
    		vct: 100,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "YEMEN",
    		vct: 130,
    		vo: 100,
    		von: 100,
    		voi: 100
    	},
    	{
    		country: "ZAMBIA",
    		vct: 74,
    		vo: 74,
    		von: 74,
    		voi: 74
    	},
    	{
    		country: "ZIMBABWE",
    		vct: 100,
    		vo: 100,
    		von: 100,
    		voi: 100
    	}
    ];

    /* src/pages/Vc.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/pages/Vc.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.data1 = list[i];
    	return child_ctx;
    }

    // (30:7) {#each View1 as data1}
    function create_each_block$2(ctx) {
    	var option, t0_value = ctx.data1["country"] + "", t0, t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = ctx.data1;
    			option.value = option.__value;
    			add_location(option, file$5, 30, 7, 1047);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(30:7) {#each View1 as data1}", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var div4, div3, h2, t1, div2, label, t3, div1, select, t4, div0, svg, path, t5, table, thead, tr0, th0, t7, th1, t9, th2, t11, tbody, tr1, td0, t13, td1, t14_value = ctx.selected ? isNaN(ctx.selected["vct"]) ? 'No disponible' : `US$ ${ctx.selected["vct"]}` : '[waiting...]' + "", t14, t15, td2, t16_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["vct"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["vct"]*ctx.price_dollar)))}` : '[waiting...]' + "", t16, t17, tr2, td3, t19, td4, t20_value = ctx.selected ? isNaN(ctx.selected["vo"]) ? 'No disponible' : `US$ ${ctx.selected["vo"]}` : '[waiting...]' + "", t20, t21, td5, t22_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["vo"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["vo"]*ctx.price_dollar)))}` : '[waiting...]' + "", t22, t23, tr3, td6, t25, td7, t26_value = ctx.selected ? isNaN(ctx.selected["von"]) ? 'No disponible' : `US$ ${ctx.selected["von"]}` : '[waiting...]' + "", t26, t27, td8, t28_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["von"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["von"]*ctx.price_dollar)))}` : '[waiting...]' + "", t28, t29, tr4, td9, t31, td10, t32_value = ctx.selected ? isNaN(ctx.selected["voi"]) ? 'No disponible' : `US$ ${ctx.selected["voi"]}` : '[waiting...]' + "", t32, t33, td11, t34_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["voi"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["voi"]*ctx.price_dollar)))}` : '[waiting...]' + "", t34, dispose;

    	let each_value = View1$1;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Valor de visas consulares según país de origen";
    			t1 = space();
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Seleccione país de nacimiento";
    			t3 = space();
    			div1 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t5 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Tipo de permiso";
    			t7 = space();
    			th1 = element("th");
    			th1.textContent = "Dolares";
    			t9 = space();
    			th2 = element("th");
    			th2.textContent = "Pesos chilenos";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Visa consular de turismo";
    			t13 = space();
    			td1 = element("td");
    			t14 = text(t14_value);
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			td3.textContent = "Visa Oportunidades";
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Visa Orientación Nacional";
    			t25 = space();
    			td7 = element("td");
    			t26 = text(t26_value);
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			tr4 = element("tr");
    			td9 = element("td");
    			td9.textContent = "Visa de Orientación Internacional";
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			add_location(h2, file$5, 24, 1, 510);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$5, 26, 4, 622);
    			if (ctx.selected === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			add_location(select, file$5, 28, 6, 796);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$5, 36, 95, 1340);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$5, 36, 6, 1251);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$5, 35, 4, 1147);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$5, 27, 6, 767);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$5, 25, 4, 570);
    			attr_dev(th0, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$5, 43, 6, 1527);
    			attr_dev(th1, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$5, 44, 6, 1653);
    			attr_dev(th2, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$5, 45, 6, 1771);
    			add_location(tr0, file$5, 42, 4, 1516);
    			add_location(thead, file$5, 41, 2, 1504);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$5, 50, 6, 1953);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$5, 51, 6, 2018);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$5, 52, 6, 2156);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$5, 49, 4, 1925);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$5, 55, 6, 2401);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$5, 56, 6, 2460);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$5, 57, 6, 2596);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$5, 54, 4, 2370);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$5, 60, 6, 2836);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$5, 61, 6, 2902);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$5, 62, 6, 3040);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$5, 59, 4, 2808);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$5, 65, 6, 3285);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$5, 66, 6, 3359);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$5, 67, 6, 3497);
    			attr_dev(tr4, "class", "bg-gray-100");
    			add_location(tr4, file$5, 64, 4, 3254);
    			add_location(tbody, file$5, 48, 2, 1913);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$5, 40, 0, 1462);
    			attr_dev(div3, "class", "w-2/3 mt-20");
    			add_location(div3, file$5, 23, 2, 483);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$5, 22, 0, 409);
    			dispose = listen_dev(select, "change", ctx.select_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.selected);

    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div3, t5);
    			append_dev(div3, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t7);
    			append_dev(tr0, th1);
    			append_dev(tr0, t9);
    			append_dev(tr0, th2);
    			append_dev(table, t11);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, t14);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(td2, t16);
    			append_dev(tbody, t17);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td3);
    			append_dev(tr2, t19);
    			append_dev(tr2, td4);
    			append_dev(td4, t20);
    			append_dev(tr2, t21);
    			append_dev(tr2, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t25);
    			append_dev(tr3, td7);
    			append_dev(td7, t26);
    			append_dev(tr3, t27);
    			append_dev(tr3, td8);
    			append_dev(td8, t28);
    			append_dev(tbody, t29);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td9);
    			append_dev(tr4, t31);
    			append_dev(tr4, td10);
    			append_dev(td10, t32);
    			append_dev(tr4, t33);
    			append_dev(tr4, td11);
    			append_dev(td11, t34);
    		},

    		p: function update(changed, ctx) {
    			if (changed.View1) {
    				each_value = View1$1;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.selected) select_option(select, ctx.selected);

    			if ((changed.selected) && t14_value !== (t14_value = ctx.selected ? isNaN(ctx.selected["vct"]) ? 'No disponible' : `US$ ${ctx.selected["vct"]}` : '[waiting...]' + "")) {
    				set_data_dev(t14, t14_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t16_value !== (t16_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["vct"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["vct"]*ctx.price_dollar)))}` : '[waiting...]' + "")) {
    				set_data_dev(t16, t16_value);
    			}

    			if ((changed.selected) && t20_value !== (t20_value = ctx.selected ? isNaN(ctx.selected["vo"]) ? 'No disponible' : `US$ ${ctx.selected["vo"]}` : '[waiting...]' + "")) {
    				set_data_dev(t20, t20_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t22_value !== (t22_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["vo"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["vo"]*ctx.price_dollar)))}` : '[waiting...]' + "")) {
    				set_data_dev(t22, t22_value);
    			}

    			if ((changed.selected) && t26_value !== (t26_value = ctx.selected ? isNaN(ctx.selected["von"]) ? 'No disponible' : `US$ ${ctx.selected["von"]}` : '[waiting...]' + "")) {
    				set_data_dev(t26, t26_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t28_value !== (t28_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["von"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["von"]*ctx.price_dollar)))}` : '[waiting...]' + "")) {
    				set_data_dev(t28, t28_value);
    			}

    			if ((changed.selected) && t32_value !== (t32_value = ctx.selected ? isNaN(ctx.selected["voi"]) ? 'No disponible' : `US$ ${ctx.selected["voi"]}` : '[waiting...]' + "")) {
    				set_data_dev(t32, t32_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t34_value !== (t34_value = ctx.selected ? isNaN(format(Math.round((ctx.selected["voi"]*ctx.price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((ctx.selected["voi"]*ctx.price_dollar)))}` : '[waiting...]' + "")) {
    				set_data_dev(t34, t34_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div4);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

    let selected;

    let price_dollar;

    onMount(async () => {
        await fetch(`https://mindicador.cl/api`)
          .then(r => r.json())
          .then(data => {
            $$invalidate('price_dollar', price_dollar = data.dolar.valor);
          });
    });

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate('selected', selected);
    		$$invalidate('View1', View1$1);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('price_dollar' in $$props) $$invalidate('price_dollar', price_dollar = $$props.price_dollar);
    	};

    	return {
    		selected,
    		price_dollar,
    		select_change_handler
    	};
    }

    class Vc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Vc", options, id: create_fragment$6.name });
    	}
    }

    var View1$2 = [
    	{
    		country: "AFGANISTAN",
    		tt: 195,
    		ptt: 195,
    		tvt: 65,
    		tt10: 195
    	},
    	{
    		country: "ALBANIA",
    		tt: 210,
    		ptt: 210,
    		tvt: 70,
    		tt10: 210
    	},
    	{
    		country: "ALEMANIA",
    		tt: 112.5,
    		ptt: 112.5,
    		tvt: 38,
    		tt10: 112.5
    	},
    	{
    		country: "ANDORRA",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "ANGOLA",
    		tt: 240,
    		ptt: 240,
    		tvt: 80,
    		tt10: 240
    	},
    	{
    		country: "ANTIGUA Y BARBUDA",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "APATRIDAS. ASILADOS Y REFUGIADOS",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "ARABIA SAUDITA",
    		tt: 66,
    		ptt: 66,
    		tvt: 22,
    		tt10: 66
    	},
    	{
    		country: "ARGELIA",
    		tt: 60,
    		ptt: 60,
    		tvt: 20,
    		tt10: 60
    	},
    	{
    		country: "ARGENTINA",
    		tt: 405,
    		ptt: 405,
    		tvt: 135,
    		tt10: 405
    	},
    	{
    		country: "ARMENIA",
    		tt: 300,
    		ptt: 300,
    		tvt: 100,
    		tt10: 300
    	},
    	{
    		country: "AUSTRALIA",
    		tt: 487.5,
    		ptt: 487.5,
    		tvt: 163,
    		tt10: 487.5
    	},
    	{
    		country: "AUSTRIA",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "AZERBAIYAN",
    		tt: 375,
    		ptt: 375,
    		tvt: 125,
    		tt10: 375
    	},
    	{
    		country: "BAHAMAS",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "BAHREIN",
    		tt: 217.5,
    		ptt: 217.5,
    		tvt: 73,
    		tt10: 217.5
    	},
    	{
    		country: "BANGLADESH",
    		tt: 15,
    		ptt: 15,
    		tvt: 5,
    		tt10: 15
    	},
    	{
    		country: "BARBADOS",
    		tt: 75,
    		ptt: 75,
    		tvt: 25,
    		tt10: 75
    	},
    	{
    		country: "BELARUS",
    		tt: 405,
    		ptt: 405,
    		tvt: 135,
    		tt10: 405
    	},
    	{
    		country: "BELGICA",
    		tt: 354,
    		ptt: 354,
    		tvt: 118,
    		tt10: 354
    	},
    	{
    		country: "BELICE",
    		tt: 57,
    		ptt: 57,
    		tvt: 19,
    		tt10: 57
    	},
    	{
    		country: "BENIN",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "BHUTAN",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "BOLIVIA",
    		tt: 450,
    		ptt: 450,
    		tvt: 150,
    		tt10: 450
    	},
    	{
    		country: "BOSNIA Y HERZEGOVINA",
    		tt: 135,
    		ptt: 135,
    		tvt: 45,
    		tt10: 135
    	},
    	{
    		country: "BOTSWANA",
    		tt: 25.5,
    		ptt: 25.5,
    		tvt: 9,
    		tt10: 25.5
    	},
    	{
    		country: "BRASIL",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "BRUNEI",
    		tt: 24,
    		ptt: 24,
    		tvt: 8,
    		tt10: 24
    	},
    	{
    		country: "BULGARIA",
    		tt: 204,
    		ptt: 204,
    		tvt: 68,
    		tt10: 204
    	},
    	{
    		country: "BURKINA FASO",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "BURUNDI",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "CABO VERDE",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "CAMBOYA",
    		tt: 195,
    		ptt: 195,
    		tvt: 65,
    		tt10: 195
    	},
    	{
    		country: "CAMERUN",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "CANADA",
    		tt: 210,
    		ptt: 210,
    		tvt: 70,
    		tt10: 210
    	},
    	{
    		country: "CHAD",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "CENTRO AFRICANA REP.",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "CHECA REPUBLICA",
    		tt: 199.5,
    		ptt: 199.5,
    		tvt: 67,
    		tt10: 199.5
    	},
    	{
    		country: "CHINA.REP.POPULAR",
    		tt: 228,
    		ptt: 228,
    		tvt: 76,
    		tt10: 228
    	},
    	{
    		country: "CI-IIPRE",
    		tt: 183,
    		ptt: 183,
    		tvt: 61,
    		tt10: 183
    	},
    	{
    		country: "COLOMBIA",
    		tt: 442.5,
    		ptt: 442.5,
    		tvt: 148,
    		tt10: 442.5
    	},
    	{
    		country: "COMORAS. ISLAS",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "CONGO (BRAZZAVILLE)",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "COSTA RICA",
    		tt: 987,
    		ptt: 987,
    		tvt: 329,
    		tt10: 987
    	},
    	{
    		country: "COTE D'IVOIRE (COSTA DE MARFIL)",
    		tt: 93,
    		ptt: 93,
    		tvt: 31,
    		tt10: 93
    	},
    	{
    		country: "CROACIA",
    		tt: 69,
    		ptt: 69,
    		tvt: 23,
    		tt10: 69
    	},
    	{
    		country: "CUBA",
    		tt: 232.5,
    		ptt: 232.5,
    		tvt: 78,
    		tt10: 232.5
    	},
    	{
    		country: "DINAMARCA",
    		tt: 1048.5,
    		ptt: 1048.5,
    		tvt: 350,
    		tt10: 1048.5
    	},
    	{
    		country: "D.JIBOUTI",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "DOMINICA",
    		tt: 444,
    		ptt: 444,
    		tvt: 148,
    		tt10: 444
    	},
    	{
    		country: "DOMINICANA. REP.",
    		tt: 135,
    		ptt: 135,
    		tvt: 45,
    		tt10: 135
    	},
    	{
    		country: "ECUADOR",
    		tt: 345,
    		ptt: 345,
    		tvt: 115,
    		tt10: 345
    	},
    	{
    		country: "EGIPTO",
    		tt: 22.5,
    		ptt: 22.5,
    		tvt: 8,
    		tt10: 22.5
    	},
    	{
    		country: "EL SALVADOR",
    		tt: 172.5,
    		ptt: 172.5,
    		tvt: 58,
    		tt10: 172.5
    	},
    	{
    		country: "EMIRATOS ARABES UNIDOS",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "ERITREA",
    		tt: 225,
    		ptt: 225,
    		tvt: 75,
    		tt10: 225
    	},
    	{
    		country: "ESLOVAQUIA",
    		tt: 205.5,
    		ptt: 205.5,
    		tvt: 69,
    		tt10: 205.5
    	},
    	{
    		country: "ESLOVENIA",
    		tt: 123,
    		ptt: 123,
    		tvt: 41,
    		tt10: 123
    	},
    	{
    		country: "ESPAÑA",
    		tt: 97.5,
    		ptt: 97.5,
    		tvt: 33,
    		tt10: 97.5
    	},
    	{
    		country: "ESTADOS UNIDOS DE AMERICA",
    		tt: 870,
    		ptt: 870,
    		tvt: 290,
    		tt10: 870
    	},
    	{
    		country: "ESTONIA",
    		tt: 157.5,
    		ptt: 157.5,
    		tvt: 53,
    		tt10: 157.5
    	},
    	{
    		country: "ETIOPIA",
    		tt: 45,
    		ptt: 45,
    		tvt: 15,
    		tt10: 45
    	},
    	{
    		country: "FEDERACION RUSA",
    		tt: 135,
    		ptt: 135,
    		tvt: 45,
    		tt10: 135
    	},
    	{
    		country: "FIJI",
    		tt: 240,
    		ptt: 240,
    		tvt: 80,
    		tt10: 240
    	},
    	{
    		country: "FILIPINAS",
    		tt: 600,
    		ptt: 600,
    		tvt: 200,
    		tt10: 600
    	},
    	{
    		country: "FINLANDIA",
    		tt: 1000.5,
    		ptt: 1000.5,
    		tvt: 334,
    		tt10: 1000.5
    	},
    	{
    		country: "FRANCIA",
    		tt: 172.5,
    		ptt: 172.5,
    		tvt: 58,
    		tt10: 172.5
    	},
    	{
    		country: "FYROM (EX REP. YUGOSLAVA DE MACEDONIA\\",
    		tt: 76.5,
    		ptt: 76.5,
    		tvt: 26,
    		tt10: 76.5
    	},
    	{
    		country: "GABON",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "GAMBIA",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "GEORGIA",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "GHANA",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "GRANADA",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "GRECIA",
    		tt: 147,
    		ptt: 147,
    		tvt: 49,
    		tt10: 147
    	},
    	{
    		country: "GUATEMALA",
    		tt: 225,
    		ptt: 225,
    		tvt: 75,
    		tt10: 225
    	},
    	{
    		country: "GUINEA",
    		tt: 142.5,
    		ptt: 142.5,
    		tvt: 48,
    		tt10: 142.5
    	},
    	{
    		country: "GUINEA BISSAU",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "GUINEA ECUATORIAL",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "GUYANA",
    		tt: 213,
    		ptt: 213,
    		tvt: 71,
    		tt10: 213
    	},
    	{
    		country: "HAITI",
    		tt: 37.5,
    		ptt: 37.5,
    		tvt: 13,
    		tt10: 37.5
    	},
    	{
    		country: "HONDURAS",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "HONG-KONG",
    		tt: 31.5,
    		ptt: 31.5,
    		tvt: 11,
    		tt10: 31.5
    	},
    	{
    		country: "I-IUNGRIA",
    		tt: 120,
    		ptt: 120,
    		tvt: 40,
    		tt10: 120
    	},
    	{
    		country: "INDIA",
    		tt: 220.5,
    		ptt: 220.5,
    		tvt: 74,
    		tt10: 220.5
    	},
    	{
    		country: "INDONESIA",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "IRAN",
    		tt: 195,
    		ptt: 195,
    		tvt: 65,
    		tt10: 195
    	},
    	{
    		country: "IRAQ",
    		tt: 109.5,
    		ptt: 109.5,
    		tvt: 37,
    		tt10: 109.5
    	},
    	{
    		country: "IRLANDA",
    		tt: 337.5,
    		ptt: 337.5,
    		tvt: 113,
    		tt10: 337.5
    	},
    	{
    		country: "ISLANDIA",
    		tt: 144,
    		ptt: 144,
    		tvt: 48,
    		tt10: 144
    	},
    	{
    		country: "ISLAS MARSHALL",
    		tt: 52.5,
    		ptt: 52.5,
    		tvt: 18,
    		tt10: 52.5
    	},
    	{
    		country: "ISLAS SALOMON",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "ISRAEL",
    		tt: 72,
    		ptt: 72,
    		tvt: 24,
    		tt10: 72
    	},
    	{
    		country: "ITALIA",
    		tt: 208.5,
    		ptt: 208.5,
    		tvt: 70,
    		tt10: 208.5
    	},
    	{
    		country: "JAMAHIRlYA ARABE. LIBIA",
    		tt: 19.5,
    		ptt: 19.5,
    		tvt: 7,
    		tt10: 19.5
    	},
    	{
    		country: "JAMAICA",
    		tt: 225,
    		ptt: 225,
    		tvt: 75,
    		tt10: 225
    	},
    	{
    		country: "JAPON",
    		tt: 82.5,
    		ptt: 82.5,
    		tvt: 28,
    		tt10: 82.5
    	},
    	{
    		country: "JORDANIA",
    		tt: 66,
    		ptt: 66,
    		tvt: 22,
    		tt10: 66
    	},
    	{
    		country: "KAZA.JSTAN",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "KENYA",
    		tt: 577.5,
    		ptt: 577.5,
    		tvt: 193,
    		tt10: 577.5
    	},
    	{
    		country: "KIRGUISTAN",
    		tt: 187.5,
    		ptt: 187.5,
    		tvt: 63,
    		tt10: 187.5
    	},
    	{
    		country: "KIRIBATI",
    		tt: 34.5,
    		ptt: 34.5,
    		tvt: 12,
    		tt10: 34.5
    	},
    	{
    		country: "KUWAIT",
    		tt: 195,
    		ptt: 195,
    		tvt: 65,
    		tt10: 195
    	},
    	{
    		country: "LESOTHO",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "LETONIA",
    		tt: 231,
    		ptt: 231,
    		tvt: 77,
    		tt10: 231
    	},
    	{
    		country: "LIBANO",
    		tt: 204,
    		ptt: 204,
    		tvt: 68,
    		tt10: 204
    	},
    	{
    		country: "LIBERIA",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "LIECHTENSTEIN",
    		tt: 225,
    		ptt: 225,
    		tvt: 75,
    		tt10: 225
    	},
    	{
    		country: "LITUANIA",
    		tt: 120,
    		ptt: 120,
    		tvt: 40,
    		tt10: 120
    	},
    	{
    		country: "LUXEMBURGO",
    		tt: 354,
    		ptt: 354,
    		tvt: 118,
    		tt10: 354
    	},
    	{
    		country: "MACAO",
    		tt: 18,
    		ptt: 18,
    		tvt: 6,
    		tt10: 18
    	},
    	{
    		country: "MADAGASCAR",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "MALASIA",
    		tt: 108,
    		ptt: 108,
    		tvt: 36,
    		tt10: 108
    	},
    	{
    		country: "MALAWI",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "MALDIVAS",
    		tt: 195,
    		ptt: 195,
    		tvt: 65,
    		tt10: 195
    	},
    	{
    		country: "MALI",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "MALTA",
    		tt: 51,
    		ptt: 51,
    		tvt: 17,
    		tt10: 51
    	},
    	{
    		country: "MARRUECOS",
    		tt: 22.5,
    		ptt: 22.5,
    		tvt: 8,
    		tt10: 22.5
    	},
    	{
    		country: "MAURICIO. ISLAS",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "MAURITANIA",
    		tt: 37.5,
    		ptt: 37.5,
    		tvt: 13,
    		tt10: 37.5
    	},
    	{
    		country: "MEXICO",
    		tt: 616.5,
    		ptt: 616.5,
    		tvt: 206,
    		tt10: 616.5
    	},
    	{
    		country: "MíCRONESIA. EST. FED.",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "MOLDOVA",
    		tt: 165,
    		ptt: 165,
    		tvt: 55,
    		tt10: 165
    	},
    	{
    		country: "MONACO",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "MONGOLIA",
    		tt: 67.5,
    		ptt: 67.5,
    		tvt: 23,
    		tt10: 67.5
    	},
    	{
    		country: "MONTENEGRO",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "MOZAMBIQUE",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "MYANMAR (EX - BlRMANIA)",
    		tt: 270,
    		ptt: 270,
    		tvt: 90,
    		tt10: 270
    	},
    	{
    		country: "NAMIBIA",
    		tt: 108,
    		ptt: 108,
    		tvt: 36,
    		tt10: 108
    	},
    	{
    		country: "NAURU",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "NEPAL",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "NICARAGUA",
    		tt: 213,
    		ptt: 213,
    		tvt: 71,
    		tt10: 213
    	},
    	{
    		country: "NIGER",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "NIGERIA",
    		tt: 168,
    		ptt: 168,
    		tvt: 56,
    		tt10: 168
    	},
    	{
    		country: "NORUEGA",
    		tt: 694.5,
    		ptt: 694.5,
    		tvt: 232,
    		tt10: 694.5
    	},
    	{
    		country: "NUEVA ZELANDIA",
    		tt: 465,
    		ptt: 465,
    		tvt: 155,
    		tt10: 465
    	},
    	{
    		country: "OMAN",
    		tt: 195,
    		ptt: 195,
    		tvt: 65,
    		tt10: 195
    	},
    	{
    		country: "P AISES BAJOS",
    		tt: 1807.5,
    		ptt: 1807.5,
    		tvt: 603,
    		tt10: 1807.5
    	},
    	{
    		country: "PAKISTAN",
    		tt: 216,
    		ptt: 216,
    		tvt: 72,
    		tt10: 216
    	},
    	{
    		country: "PALAU",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "PALESTINA",
    		tt: 49.5,
    		ptt: 49.5,
    		tvt: 17,
    		tt10: 49.5
    	},
    	{
    		country: "PANAMA",
    		tt: 75,
    		ptt: 75,
    		tvt: 25,
    		tt10: 75
    	},
    	{
    		country: "PAPUA NUt VA GUINEA",
    		tt: 330,
    		ptt: 330,
    		tvt: 110,
    		tt10: 330
    	},
    	{
    		country: "PARAGUAY",
    		tt: 450,
    		ptt: 450,
    		tvt: 150,
    		tt10: 450
    	},
    	{
    		country: "PERU",
    		tt: 120,
    		ptt: 120,
    		tvt: 40,
    		tt10: 120
    	},
    	{
    		country: "POLONIA",
    		tt: 117,
    		ptt: 117,
    		tvt: 39,
    		tt10: 117
    	},
    	{
    		country: "PORTUGAL",
    		tt: 172.5,
    		ptt: 172.5,
    		tvt: 58,
    		tt10: 172.5
    	},
    	{
    		country: "QATAR",
    		tt: 105,
    		ptt: 105,
    		tvt: 35,
    		tt10: 105
    	},
    	{
    		country: "REINO UNIDO",
    		tt: 1209,
    		ptt: 1209,
    		tvt: 403,
    		tt10: 1209
    	},
    	{
    		country: "REPUBLICA DE COREA DEL SUR",
    		tt: 135,
    		ptt: 135,
    		tvt: 45,
    		tt10: 135
    	},
    	{
    		country: "REP. DEM. DEL CONGO",
    		tt: 105,
    		ptt: 105,
    		tvt: 35,
    		tt10: 105
    	},
    	{
    		country: "REP. POP. DEMOC. DE COREA DEL NORTE",
    		tt: 60,
    		ptt: 60,
    		tvt: 20,
    		tt10: 60
    	},
    	{
    		country: "REP. POP. DEMOC. DE LAOS",
    		tt: 52.5,
    		ptt: 52.5,
    		tvt: 18,
    		tt10: 52.5
    	},
    	{
    		country: "REP. UNIDA DE TANZANIA",
    		tt: 900,
    		ptt: 900,
    		tvt: 300,
    		tt10: 900
    	},
    	{
    		country: "RUMANIA",
    		tt: 244.5,
    		ptt: 244.5,
    		tvt: 82,
    		tt10: 244.5
    	},
    	{
    		country: "RWANDA",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "SAMOA OCCIDENTAL",
    		tt: 750,
    		ptt: 750,
    		tvt: 250,
    		tt10: 750
    	},
    	{
    		country: "SAN CRISTOBAL Y NEVIS",
    		tt: 1405.5,
    		ptt: 1405.5,
    		tvt: 469,
    		tt10: 1405.5
    	},
    	{
    		country: "SAN MARINO",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "SAN VICENTE Y GRANADINAS",
    		tt: 885,
    		ptt: 885,
    		tvt: 295,
    		tt10: 885
    	},
    	{
    		country: "SANTA LUCIA",
    		tt: 210,
    		ptt: 210,
    		tvt: 70,
    		tt10: 210
    	},
    	{
    		country: "SANTA SEDE(VATICANO)",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "SANTO TOME Y PRINCIPE",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "SENEGAL",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "SERBIA",
    		tt: 222,
    		ptt: 222,
    		tvt: 74,
    		tt10: 222
    	},
    	{
    		country: "SEYCHELLES",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "SIERRA LEONA",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "SINGAPUR",
    		tt: 300,
    		ptt: 300,
    		tvt: 100,
    		tt10: 300
    	},
    	{
    		country: "SIRIA. REP ARABE",
    		tt: 9,
    		ptt: 9,
    		tvt: 3,
    		tt10: 9
    	},
    	{
    		country: "SOMALIA",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "SRI LANKA",
    		tt: 300,
    		ptt: 300,
    		tvt: 100,
    		tt10: 300
    	},
    	{
    		country: "SUDAFRICA",
    		tt: 70.5,
    		ptt: 70.5,
    		tvt: 24,
    		tt10: 70.5
    	},
    	{
    		country: "SUDAN",
    		tt: 105,
    		ptt: 105,
    		tvt: 35,
    		tt10: 105
    	},
    	{
    		country: "SUECIA",
    		tt: 417,
    		ptt: 417,
    		tvt: 139,
    		tt10: 417
    	},
    	{
    		country: "SUIZA",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "SURINAM",
    		tt: 67.5,
    		ptt: 67.5,
    		tvt: 23,
    		tt10: 67.5
    	},
    	{
    		country: "SWAZILANDIA",
    		tt: 40.5,
    		ptt: 40.5,
    		tvt: 14,
    		tt10: 40.5
    	},
    	{
    		country: "TAJLANDIA",
    		tt: 225,
    		ptt: 225,
    		tvt: 75,
    		tt10: 225
    	},
    	{
    		country: "TAIWAN",
    		tt: 99,
    		ptt: 99,
    		tvt: 33,
    		tt10: 99
    	},
    	{
    		country: "TAYil(JSTAN",
    		tt: 300,
    		ptt: 300,
    		tvt: 100,
    		tt10: 300
    	},
    	{
    		country: "TIMOR ORIENTAL",
    		tt: 75,
    		ptt: 75,
    		tvt: 25,
    		tt10: 75
    	},
    	{
    		country: "TOGO",
    		tt: 180,
    		ptt: 180,
    		tvt: 60,
    		tt10: 180
    	},
    	{
    		country: "TONGA",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "TRINIDAD Y TOBAGO",
    		tt: 1500,
    		ptt: 1500,
    		tvt: 500,
    		tt10: 1500
    	},
    	{
    		country: "TUNEZ",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "TURKMENISTAN",
    		tt: 750,
    		ptt: 750,
    		tvt: 250,
    		tt10: 750
    	},
    	{
    		country: "TURQUIA",
    		tt: 247.5,
    		ptt: 247.5,
    		tvt: 83,
    		tt10: 247.5
    	},
    	{
    		country: "TUVALU",
    		tt: 0,
    		ptt: 0,
    		tvt: 0,
    		tt10: 0
    	},
    	{
    		country: "UCRANIA",
    		tt: 300,
    		ptt: 300,
    		tvt: 100,
    		tt10: 300
    	},
    	{
    		country: "UGANDA",
    		tt: 240,
    		ptt: 240,
    		tvt: 80,
    		tt10: 240
    	},
    	{
    		country: "URUGUAY",
    		tt: 97.5,
    		ptt: 97.5,
    		tvt: 33,
    		tt10: 97.5
    	},
    	{
    		country: "UZBEKISTAN",
    		tt: 375,
    		ptt: 375,
    		tvt: 125,
    		tt10: 375
    	},
    	{
    		country: "VANUATU",
    		tt: 420,
    		ptt: 420,
    		tvt: 140,
    		tt10: 420
    	},
    	{
    		country: "VENEZUELA",
    		tt: 90,
    		ptt: 90,
    		tvt: 30,
    		tt10: 90
    	},
    	{
    		country: "VIETNAM",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	},
    	{
    		country: "YEMEN",
    		tt: 195,
    		ptt: 195,
    		tvt: 65,
    		tt10: 195
    	},
    	{
    		country: "ZAMBIA",
    		tt: 111,
    		ptt: 111,
    		tvt: 37,
    		tt10: 111
    	},
    	{
    		country: "ZIMBABWE",
    		tt: 150,
    		ptt: 150,
    		tvt: 50,
    		tt10: 150
    	}
    ];

    /* src/pages/Pt.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/pages/Pt.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.data1 = list[i];
    	return child_ctx;
    }

    // (31:7) {#each View1 as data1}
    function create_each_block$3(ctx) {
    	var option, t0_value = ctx.data1["country"] + "", t0, t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = ctx.data1;
    			option.value = option.__value;
    			add_location(option, file$6, 31, 7, 1058);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(31:7) {#each View1 as data1}", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var div4, div3, h2, t1, div2, label, t3, div1, select, t4, div0, svg, path, t5, table, thead, tr0, th0, t7, th1, t9, th2, t11, tbody, tr1, td0, t13, td1, t14, t15_value = ctx.selected ? ctx.selected["tt"] : '[waiting...]' + "", t15, t16, td2, t17, t18_value = ctx.selected ? format(Math.round((ctx.selected["tt"]*ctx.price_dollar))) : '[waiting...]' + "", t18, t19, tr2, td3, t21, td4, t22, t23_value = ctx.selected ? ctx.selected["ptt"] : '[waiting...]' + "", t23, t24, td5, t25, t26_value = ctx.selected ? format(Math.round((ctx.selected["ptt"]*ctx.price_dollar))) : '[waiting...]' + "", t26, t27, tr3, td6, t29, td7, t30, t31_value = ctx.selected ? ctx.selected["tvt"] : '[waiting...]' + "", t31, t32, td8, t33, t34_value = ctx.selected ? format(Math.round((ctx.selected["tvt"]*ctx.price_dollar))) : '[waiting...]' + "", t34, t35, tr4, td9, t37, td10, t38, t39_value = ctx.selected ? ctx.selected["tt10"] : '[waiting...]' + "", t39, t40, td11, t41, t42_value = ctx.selected ? format(Math.round((ctx.selected["tt10"]*ctx.price_dollar))) : '[waiting...]' + "", t42, dispose;

    	let each_value = View1$2;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Valor de los permisos de trabajo según tu país de origen";
    			t1 = space();
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Seleccione país de nacimiento";
    			t3 = space();
    			div1 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t5 = space();
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Tipo de permiso";
    			t7 = space();
    			th1 = element("th");
    			th1.textContent = "Dolares";
    			t9 = space();
    			th2 = element("th");
    			th2.textContent = "Pesos chilenos";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Trabajo turista";
    			t13 = space();
    			td1 = element("td");
    			t14 = text("US$ ");
    			t15 = text(t15_value);
    			t16 = space();
    			td2 = element("td");
    			t17 = text("$ ");
    			t18 = text(t18_value);
    			t19 = space();
    			tr2 = element("tr");
    			td3 = element("td");
    			td3.textContent = "Prorroga turista";
    			t21 = space();
    			td4 = element("td");
    			t22 = text("US$ ");
    			t23 = text(t23_value);
    			t24 = space();
    			td5 = element("td");
    			t25 = text("$ ");
    			t26 = text(t26_value);
    			t27 = space();
    			tr3 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Trabajo visa en tramite";
    			t29 = space();
    			td7 = element("td");
    			t30 = text("US$ ");
    			t31 = text(t31_value);
    			t32 = space();
    			td8 = element("td");
    			t33 = text("$ ");
    			t34 = text(t34_value);
    			t35 = space();
    			tr4 = element("tr");
    			td9 = element("td");
    			td9.textContent = "Trabajo turismo 10 días";
    			t37 = space();
    			td10 = element("td");
    			t38 = text("US$ ");
    			t39 = text(t39_value);
    			t40 = space();
    			td11 = element("td");
    			t41 = text("$ ");
    			t42 = text(t42_value);
    			add_location(h2, file$6, 25, 1, 511);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$6, 27, 4, 633);
    			if (ctx.selected === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			add_location(select, file$6, 29, 6, 807);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$6, 37, 95, 1351);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$6, 37, 6, 1262);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$6, 36, 4, 1158);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$6, 28, 6, 778);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$6, 26, 4, 581);
    			attr_dev(th0, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$6, 44, 6, 1538);
    			attr_dev(th1, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$6, 45, 6, 1664);
    			attr_dev(th2, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$6, 46, 6, 1782);
    			add_location(tr0, file$6, 43, 4, 1527);
    			add_location(thead, file$6, 42, 2, 1515);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$6, 51, 6, 1964);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$6, 52, 6, 2020);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$6, 53, 6, 2109);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$6, 50, 4, 1936);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$6, 56, 6, 2270);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$6, 57, 6, 2327);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$6, 58, 6, 2417);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$6, 55, 4, 2239);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$6, 61, 6, 2576);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$6, 62, 6, 2640);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$6, 63, 6, 2730);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$6, 60, 4, 2548);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$6, 66, 6, 2892);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$6, 67, 6, 2956);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$6, 68, 6, 3047);
    			attr_dev(tr4, "class", "bg-gray-100");
    			add_location(tr4, file$6, 65, 4, 2861);
    			add_location(tbody, file$6, 49, 2, 1924);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$6, 41, 0, 1473);
    			attr_dev(div3, "class", "w-2/3 mt-20");
    			add_location(div3, file$6, 24, 2, 484);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$6, 23, 0, 410);
    			dispose = listen_dev(select, "change", ctx.select_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.selected);

    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div3, t5);
    			append_dev(div3, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t7);
    			append_dev(tr0, th1);
    			append_dev(tr0, t9);
    			append_dev(tr0, th2);
    			append_dev(table, t11);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(td1, t14);
    			append_dev(td1, t15);
    			append_dev(tr1, t16);
    			append_dev(tr1, td2);
    			append_dev(td2, t17);
    			append_dev(td2, t18);
    			append_dev(tbody, t19);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td3);
    			append_dev(tr2, t21);
    			append_dev(tr2, td4);
    			append_dev(td4, t22);
    			append_dev(td4, t23);
    			append_dev(tr2, t24);
    			append_dev(tr2, td5);
    			append_dev(td5, t25);
    			append_dev(td5, t26);
    			append_dev(tbody, t27);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td6);
    			append_dev(tr3, t29);
    			append_dev(tr3, td7);
    			append_dev(td7, t30);
    			append_dev(td7, t31);
    			append_dev(tr3, t32);
    			append_dev(tr3, td8);
    			append_dev(td8, t33);
    			append_dev(td8, t34);
    			append_dev(tbody, t35);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td9);
    			append_dev(tr4, t37);
    			append_dev(tr4, td10);
    			append_dev(td10, t38);
    			append_dev(td10, t39);
    			append_dev(tr4, t40);
    			append_dev(tr4, td11);
    			append_dev(td11, t41);
    			append_dev(td11, t42);
    		},

    		p: function update(changed, ctx) {
    			if (changed.View1) {
    				each_value = View1$2;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.selected) select_option(select, ctx.selected);

    			if ((changed.selected) && t15_value !== (t15_value = ctx.selected ? ctx.selected["tt"] : '[waiting...]' + "")) {
    				set_data_dev(t15, t15_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t18_value !== (t18_value = ctx.selected ? format(Math.round((ctx.selected["tt"]*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t18, t18_value);
    			}

    			if ((changed.selected) && t23_value !== (t23_value = ctx.selected ? ctx.selected["ptt"] : '[waiting...]' + "")) {
    				set_data_dev(t23, t23_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t26_value !== (t26_value = ctx.selected ? format(Math.round((ctx.selected["ptt"]*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t26, t26_value);
    			}

    			if ((changed.selected) && t31_value !== (t31_value = ctx.selected ? ctx.selected["tvt"] : '[waiting...]' + "")) {
    				set_data_dev(t31, t31_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t34_value !== (t34_value = ctx.selected ? format(Math.round((ctx.selected["tvt"]*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t34, t34_value);
    			}

    			if ((changed.selected) && t39_value !== (t39_value = ctx.selected ? ctx.selected["tt10"] : '[waiting...]' + "")) {
    				set_data_dev(t39, t39_value);
    			}

    			if ((changed.selected || changed.price_dollar) && t42_value !== (t42_value = ctx.selected ? format(Math.round((ctx.selected["tt10"]*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t42, t42_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div4);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

    let selected;


    let price_dollar;

    onMount(async () => {
        await fetch(`https://mindicador.cl/api`)
          .then(r => r.json())
          .then(data => {
            $$invalidate('price_dollar', price_dollar = data.dolar.valor);
          });
    });

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate('selected', selected);
    		$$invalidate('View1', View1$2);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('price_dollar' in $$props) $$invalidate('price_dollar', price_dollar = $$props.price_dollar);
    	};

    	return {
    		selected,
    		price_dollar,
    		select_change_handler
    	};
    }

    class Pt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Pt", options, id: create_fragment$7.name });
    	}
    }

    /* src/components/S1.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/components/S1.svelte";

    function create_fragment$8(ctx) {
    	var table, thead, tr0, th0, t1, th1, t3, th2, t5, th3, t7, th4, t9, tbody, tr1, td0, t11, td1, t13, td2, t15, td3, t17, td4, t19, tr2, td5, t21, td6, t23, td7, t25, td8, t27, td9, t29, tr3, td10, t31, td11, t33, td12, t35, td13, t37, td14, t39, tr4, td15, t41, td16, t43, td17, t45, td18, t47, td19;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Días";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Presentación voluntaria";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Denuncia polin";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Reincidencia presentación voluntaria";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia denuncia polin";
    			t9 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "1 a 100";
    			t11 = space();
    			td1 = element("td");
    			td1.textContent = "$ 40.871";
    			t13 = space();
    			td2 = element("td");
    			td2.textContent = "$ 53.876";
    			t15 = space();
    			td3 = element("td");
    			td3.textContent = "$ 68.738";
    			t17 = space();
    			td4 = element("td");
    			td4.textContent = "$ 104.036";
    			t19 = space();
    			tr2 = element("tr");
    			td5 = element("td");
    			td5.textContent = "101 a 190";
    			t21 = space();
    			td6 = element("td");
    			td6.textContent = "$ 53.876";
    			t23 = space();
    			td7 = element("td");
    			td7.textContent = "$ 68.738";
    			t25 = space();
    			td8 = element("td");
    			td8.textContent = "$ 89.173";
    			t27 = space();
    			td9 = element("td");
    			td9.textContent = "$ 135.618";
    			t29 = space();
    			tr3 = element("tr");
    			td10 = element("td");
    			td10.textContent = "191 a 375";
    			t31 = space();
    			td11 = element("td");
    			td11.textContent = "$ 68.738";
    			t33 = space();
    			td12 = element("td");
    			td12.textContent = "$ 89.173";
    			t35 = space();
    			td13 = element("td");
    			td13.textContent = "$ 117.040";
    			t37 = space();
    			td14 = element("td");
    			td14.textContent = "$ 174.631";
    			t39 = space();
    			tr4 = element("tr");
    			td15 = element("td");
    			td15.textContent = "376 y más";
    			t41 = space();
    			td16 = element("td");
    			td16.textContent = "$ 89.173";
    			t43 = space();
    			td17 = element("td");
    			td17.textContent = "$ 117.040";
    			t45 = space();
    			td18 = element("td");
    			td18.textContent = "$ 152.338";
    			t47 = space();
    			td19 = element("td");
    			td19.textContent = "$ 228.507";
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$7, 7, 6, 86);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$7, 8, 6, 201);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$7, 9, 6, 335);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$7, 10, 6, 460);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$7, 11, 6, 607);
    			add_location(tr0, file$7, 6, 4, 75);
    			add_location(thead, file$7, 5, 2, 63);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$7, 16, 6, 802);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$7, 17, 6, 850);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$7, 18, 6, 899);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$7, 19, 6, 948);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$7, 20, 6, 997);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$7, 15, 4, 774);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$7, 23, 6, 1086);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$7, 24, 6, 1136);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$7, 25, 6, 1185);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$7, 26, 6, 1234);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$7, 27, 6, 1283);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$7, 22, 4, 1055);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$7, 30, 6, 1369);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$7, 31, 6, 1419);
    			attr_dev(td12, "class", "border px-4 py-2");
    			add_location(td12, file$7, 32, 6, 1468);
    			attr_dev(td13, "class", "border px-4 py-2");
    			add_location(td13, file$7, 33, 6, 1517);
    			attr_dev(td14, "class", "border px-4 py-2");
    			add_location(td14, file$7, 34, 6, 1567);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$7, 29, 4, 1341);
    			attr_dev(td15, "class", "border px-4 py-2");
    			add_location(td15, file$7, 37, 6, 1653);
    			attr_dev(td16, "class", "border px-4 py-2");
    			add_location(td16, file$7, 38, 6, 1703);
    			attr_dev(td17, "class", "border px-4 py-2");
    			add_location(td17, file$7, 39, 6, 1752);
    			attr_dev(td18, "class", "border px-4 py-2");
    			add_location(td18, file$7, 40, 6, 1802);
    			attr_dev(td19, "class", "border px-4 py-2");
    			add_location(td19, file$7, 41, 6, 1852);
    			attr_dev(tr4, "class", "bg-white");
    			add_location(tr4, file$7, 36, 4, 1625);
    			add_location(tbody, file$7, 14, 2, 762);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$7, 4, 0, 21);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t11);
    			append_dev(tr1, td1);
    			append_dev(tr1, t13);
    			append_dev(tr1, td2);
    			append_dev(tr1, t15);
    			append_dev(tr1, td3);
    			append_dev(tr1, t17);
    			append_dev(tr1, td4);
    			append_dev(tbody, t19);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td5);
    			append_dev(tr2, t21);
    			append_dev(tr2, td6);
    			append_dev(tr2, t23);
    			append_dev(tr2, td7);
    			append_dev(tr2, t25);
    			append_dev(tr2, td8);
    			append_dev(tr2, t27);
    			append_dev(tr2, td9);
    			append_dev(tbody, t29);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td10);
    			append_dev(tr3, t31);
    			append_dev(tr3, td11);
    			append_dev(tr3, t33);
    			append_dev(tr3, td12);
    			append_dev(tr3, t35);
    			append_dev(tr3, td13);
    			append_dev(tr3, t37);
    			append_dev(tr3, td14);
    			append_dev(tbody, t39);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td15);
    			append_dev(tr4, t41);
    			append_dev(tr4, td16);
    			append_dev(tr4, t43);
    			append_dev(tr4, td17);
    			append_dev(tr4, t45);
    			append_dev(tr4, td18);
    			append_dev(tr4, t47);
    			append_dev(tr4, td19);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(table);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    class S1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "S1", options, id: create_fragment$8.name });
    	}
    }

    /* src/components/S2.svelte generated by Svelte v3.12.1 */

    const file$8 = "src/components/S2.svelte";

    function create_fragment$9(ctx) {
    	var table, thead, tr0, th0, t1, th1, t3, th2, t5, th3, t7, th4, t9, th5, t11, tbody, tr1, td0, t13, td1, t15, td2, t17, td3, t19, td4, t21, td5, t23, tr2, td6, t25, td7, t27, td8, t29, td9, t31, td10, t33, td11, t35, tr3, td12, t37, td13, t39, td14, t41, td15, t43, td16, t45, td17, t47, tr4, td18, t49, td19, t51, td20, t53, td21, t55, td22, t57, td23;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Tramo";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Días";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Presentación voluntaria";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Denuncia Polin";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia polin";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "1 a 100";
    			t15 = space();
    			td2 = element("td");
    			td2.textContent = "$ 40.871";
    			t17 = space();
    			td3 = element("td");
    			td3.textContent = "$ 61.307";
    			t19 = space();
    			td4 = element("td");
    			td4.textContent = "$ 81.742";
    			t21 = space();
    			td5 = element("td");
    			td5.textContent = "$ 122.613";
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "101 a 190";
    			t27 = space();
    			td8 = element("td");
    			td8.textContent = "$ 61.307";
    			t29 = space();
    			td9 = element("td");
    			td9.textContent = "$ 92.889";
    			t31 = space();
    			td10 = element("td");
    			td10.textContent = "$ 122.613";
    			t33 = space();
    			td11 = element("td");
    			td11.textContent = "$ 183.920";
    			t35 = space();
    			tr3 = element("tr");
    			td12 = element("td");
    			td12.textContent = "Tramo 3";
    			t37 = space();
    			td13 = element("td");
    			td13.textContent = "191 a 375";
    			t39 = space();
    			td14 = element("td");
    			td14.textContent = "$ 92.889";
    			t41 = space();
    			td15 = element("td");
    			td15.textContent = "$ 137.476";
    			t43 = space();
    			td16 = element("td");
    			td16.textContent = "$ 183.920";
    			t45 = space();
    			td17 = element("td");
    			td17.textContent = "$ 276.809";
    			t47 = space();
    			tr4 = element("tr");
    			td18 = element("td");
    			td18.textContent = "Tramo 4";
    			t49 = space();
    			td19 = element("td");
    			td19.textContent = "376 y más";
    			t51 = space();
    			td20 = element("td");
    			td20.textContent = "$ 137.476";
    			t53 = space();
    			td21 = element("td");
    			td21.textContent = "$ 206.214";
    			t55 = space();
    			td22 = element("td");
    			td22.textContent = "$ 276.809";
    			t57 = space();
    			td23 = element("td");
    			td23.textContent = "$ 414.285";
    			attr_dev(th0, "class", "w-1/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$8, 7, 6, 86);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$8, 8, 6, 202);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$8, 9, 6, 317);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$8, 10, 6, 451);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$8, 11, 6, 576);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$8, 12, 6, 723);
    			add_location(tr0, file$8, 6, 4, 75);
    			add_location(thead, file$8, 5, 2, 63);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$8, 17, 6, 918);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$8, 18, 6, 966);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$8, 19, 6, 1014);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$8, 20, 6, 1063);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$8, 21, 6, 1112);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$8, 22, 6, 1161);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$8, 16, 4, 890);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$8, 25, 6, 1250);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$8, 26, 6, 1298);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$8, 27, 6, 1348);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$8, 28, 6, 1397);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$8, 29, 6, 1446);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$8, 30, 6, 1496);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$8, 24, 4, 1219);
    			attr_dev(td12, "class", "border px-4 py-2");
    			add_location(td12, file$8, 33, 6, 1582);
    			attr_dev(td13, "class", "border px-4 py-2");
    			add_location(td13, file$8, 34, 6, 1630);
    			attr_dev(td14, "class", "border px-4 py-2");
    			add_location(td14, file$8, 35, 6, 1680);
    			attr_dev(td15, "class", "border px-4 py-2");
    			add_location(td15, file$8, 36, 6, 1729);
    			attr_dev(td16, "class", "border px-4 py-2");
    			add_location(td16, file$8, 37, 6, 1779);
    			attr_dev(td17, "class", "border px-4 py-2");
    			add_location(td17, file$8, 38, 6, 1829);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$8, 32, 4, 1554);
    			attr_dev(td18, "class", "border px-4 py-2");
    			add_location(td18, file$8, 41, 6, 1915);
    			attr_dev(td19, "class", "border px-4 py-2");
    			add_location(td19, file$8, 42, 6, 1963);
    			attr_dev(td20, "class", "border px-4 py-2");
    			add_location(td20, file$8, 43, 6, 2013);
    			attr_dev(td21, "class", "border px-4 py-2");
    			add_location(td21, file$8, 44, 6, 2063);
    			attr_dev(td22, "class", "border px-4 py-2");
    			add_location(td22, file$8, 45, 6, 2113);
    			attr_dev(td23, "class", "border px-4 py-2");
    			add_location(td23, file$8, 46, 6, 2163);
    			attr_dev(tr4, "class", "bg-white");
    			add_location(tr4, file$8, 40, 4, 1887);
    			add_location(tbody, file$8, 15, 2, 878);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$8, 4, 0, 21);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(tr0, t9);
    			append_dev(tr0, th5);
    			append_dev(table, t11);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t13);
    			append_dev(tr1, td1);
    			append_dev(tr1, t15);
    			append_dev(tr1, td2);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(tbody, t35);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td12);
    			append_dev(tr3, t37);
    			append_dev(tr3, td13);
    			append_dev(tr3, t39);
    			append_dev(tr3, td14);
    			append_dev(tr3, t41);
    			append_dev(tr3, td15);
    			append_dev(tr3, t43);
    			append_dev(tr3, td16);
    			append_dev(tr3, t45);
    			append_dev(tr3, td17);
    			append_dev(tbody, t47);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td18);
    			append_dev(tr4, t49);
    			append_dev(tr4, td19);
    			append_dev(tr4, t51);
    			append_dev(tr4, td20);
    			append_dev(tr4, t53);
    			append_dev(tr4, td21);
    			append_dev(tr4, t55);
    			append_dev(tr4, td22);
    			append_dev(tr4, t57);
    			append_dev(tr4, td23);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(table);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    class S2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "S2", options, id: create_fragment$9.name });
    	}
    }

    /* src/components/S3.svelte generated by Svelte v3.12.1 */

    const file$9 = "src/components/S3.svelte";

    function create_fragment$a(ctx) {
    	var table, thead, tr0, th0, t1, th1, t3, th2, t5, th3, t7, th4, t9, tbody, tr1, td0, t11, td1, t13, td2, t15, td3, t17, td4, t19, tr2, td5, t21, td6, t23, td7, t25, td8, t27, td9, t29, tr3, td10, t31, td11, t33, td12, t35, td13, t37, td14, t39, tr4, td15, t41, td16, t43, td17, t45, td18, t47, td19;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Días";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Presentación voluntaria";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Denuncia polin";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Reincidencia presentación voluntaria";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia denuncia polin";
    			t9 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "1 a 100";
    			t11 = space();
    			td1 = element("td");
    			td1.textContent = "$ 40.871";
    			t13 = space();
    			td2 = element("td");
    			td2.textContent = "$ 61.307";
    			t15 = space();
    			td3 = element("td");
    			td3.textContent = "$ 122.613";
    			t17 = space();
    			td4 = element("td");
    			td4.textContent = "$ 817.423";
    			t19 = space();
    			tr2 = element("tr");
    			td5 = element("td");
    			td5.textContent = "101 a 190";
    			t21 = space();
    			td6 = element("td");
    			td6.textContent = "$ 102.178";
    			t23 = space();
    			td7 = element("td");
    			td7.textContent = "$ 154.196";
    			t25 = space();
    			td8 = element("td");
    			td8.textContent = "$ 306.534";
    			t27 = space();
    			td9 = element("td");
    			td9.textContent = "$ 817.423";
    			t29 = space();
    			tr3 = element("tr");
    			td10 = element("td");
    			td10.textContent = "191 a 375";
    			t31 = space();
    			td11 = element("td");
    			td11.textContent = "$ 204.356";
    			t33 = space();
    			td12 = element("td");
    			td12.textContent = "$ 306.534";
    			t35 = space();
    			td13 = element("td");
    			td13.textContent = "$ 510.890";
    			t37 = space();
    			td14 = element("td");
    			td14.textContent = "$ 817.423";
    			t39 = space();
    			tr4 = element("tr");
    			td15 = element("td");
    			td15.textContent = "376 y más";
    			t41 = space();
    			td16 = element("td");
    			td16.textContent = "$ 408.712";
    			t43 = space();
    			td17 = element("td");
    			td17.textContent = "$ 510.890";
    			t45 = space();
    			td18 = element("td");
    			td18.textContent = "$ 613.067";
    			t47 = space();
    			td19 = element("td");
    			td19.textContent = "$ 817.423";
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$9, 7, 6, 88);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$9, 8, 6, 203);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$9, 9, 6, 337);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$9, 10, 6, 462);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$9, 11, 6, 609);
    			add_location(tr0, file$9, 6, 4, 77);
    			add_location(thead, file$9, 5, 2, 65);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$9, 16, 6, 804);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$9, 17, 6, 852);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$9, 18, 6, 901);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$9, 19, 6, 950);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$9, 20, 6, 1000);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$9, 15, 4, 776);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$9, 23, 6, 1089);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$9, 24, 6, 1139);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$9, 25, 6, 1189);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$9, 26, 6, 1239);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$9, 27, 6, 1289);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$9, 22, 4, 1058);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$9, 30, 6, 1375);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$9, 31, 6, 1425);
    			attr_dev(td12, "class", "border px-4 py-2");
    			add_location(td12, file$9, 32, 6, 1475);
    			attr_dev(td13, "class", "border px-4 py-2");
    			add_location(td13, file$9, 33, 6, 1525);
    			attr_dev(td14, "class", "border px-4 py-2");
    			add_location(td14, file$9, 34, 6, 1575);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$9, 29, 4, 1347);
    			attr_dev(td15, "class", "border px-4 py-2");
    			add_location(td15, file$9, 37, 6, 1661);
    			attr_dev(td16, "class", "border px-4 py-2");
    			add_location(td16, file$9, 38, 6, 1711);
    			attr_dev(td17, "class", "border px-4 py-2");
    			add_location(td17, file$9, 39, 6, 1761);
    			attr_dev(td18, "class", "border px-4 py-2");
    			add_location(td18, file$9, 40, 6, 1811);
    			attr_dev(td19, "class", "border px-4 py-2");
    			add_location(td19, file$9, 41, 6, 1861);
    			attr_dev(tr4, "class", "bg-white");
    			add_location(tr4, file$9, 36, 4, 1633);
    			add_location(tbody, file$9, 14, 2, 764);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$9, 4, 0, 23);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t11);
    			append_dev(tr1, td1);
    			append_dev(tr1, t13);
    			append_dev(tr1, td2);
    			append_dev(tr1, t15);
    			append_dev(tr1, td3);
    			append_dev(tr1, t17);
    			append_dev(tr1, td4);
    			append_dev(tbody, t19);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td5);
    			append_dev(tr2, t21);
    			append_dev(tr2, td6);
    			append_dev(tr2, t23);
    			append_dev(tr2, td7);
    			append_dev(tr2, t25);
    			append_dev(tr2, td8);
    			append_dev(tr2, t27);
    			append_dev(tr2, td9);
    			append_dev(tbody, t29);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td10);
    			append_dev(tr3, t31);
    			append_dev(tr3, td11);
    			append_dev(tr3, t33);
    			append_dev(tr3, td12);
    			append_dev(tr3, t35);
    			append_dev(tr3, td13);
    			append_dev(tr3, t37);
    			append_dev(tr3, td14);
    			append_dev(tbody, t39);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td15);
    			append_dev(tr4, t41);
    			append_dev(tr4, td16);
    			append_dev(tr4, t43);
    			append_dev(tr4, td17);
    			append_dev(tr4, t45);
    			append_dev(tr4, td18);
    			append_dev(tr4, t47);
    			append_dev(tr4, td19);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(table);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    class S3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$a, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "S3", options, id: create_fragment$a.name });
    	}
    }

    /* src/components/S4.svelte generated by Svelte v3.12.1 */

    const file$a = "src/components/S4.svelte";

    function create_fragment$b(ctx) {
    	var table, thead, tr0, th0, t1, th1, t3, th2, t5, th3, t7, th4, t9, tbody, tr1, td0, t11, td1, t13, td2, t15, td3, t17, td4, t19, tr2, td5, t21, td6, t23, td7, t25, td8, t27, td9, t29, tr3, td10, t31, td11, t33, td12, t35, td13, t37, td14, t39, tr4, td15, t41, td16, t43, td17, t45, td18, t47, td19;

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			th0.textContent = "Días";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Presentación voluntaria";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Denuncia polin";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Reincidencia presentación voluntaria";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia denuncia polin";
    			t9 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "1 a 100";
    			t11 = space();
    			td1 = element("td");
    			td1.textContent = "$ 817.423";
    			t13 = space();
    			td2 = element("td");
    			td2.textContent = "$ 980.908";
    			t15 = space();
    			td3 = element("td");
    			td3.textContent = "$ 1.114.392";
    			t17 = space();
    			td4 = element("td");
    			td4.textContent = "$ 2.069.057";
    			t19 = space();
    			tr2 = element("tr");
    			td5 = element("td");
    			td5.textContent = "101 a 190";
    			t21 = space();
    			td6 = element("td");
    			td6.textContent = "$ 1.906.090";
    			t23 = space();
    			td7 = element("td");
    			td7.textContent = "$ 1.315.308";
    			t25 = space();
    			td8 = element("td");
    			td8.textContent = "$ 1.534.526";
    			t27 = space();
    			td9 = element("td");
    			td9.textContent = "$ 2.069.057";
    			t29 = space();
    			tr3 = element("tr");
    			td10 = element("td");
    			td10.textContent = "191 a 375";
    			t31 = space();
    			td11 = element("td");
    			td11.textContent = "$ 1.374.757";
    			t33 = space();
    			td12 = element("td");
    			td12.textContent = "$ 1.649.709";
    			t35 = space();
    			td13 = element("td");
    			td13.textContent = "$ 1.924.660";
    			t37 = space();
    			td14 = element("td");
    			td14.textContent = "$ 2.069.057";
    			t39 = space();
    			tr4 = element("tr");
    			td15 = element("td");
    			td15.textContent = "376 y más";
    			t41 = space();
    			td16 = element("td");
    			td16.textContent = "$ 1.653.424";
    			t43 = space();
    			td17 = element("td");
    			td17.textContent = "$ 1.984.109";
    			t45 = space();
    			td18 = element("td");
    			td18.textContent = "$ 2.013.834";
    			t47 = space();
    			td19 = element("td");
    			td19.textContent = "$ 2.069.057";
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$a, 7, 6, 88);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$a, 8, 6, 203);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$a, 9, 6, 337);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$a, 10, 6, 462);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$a, 11, 6, 609);
    			add_location(tr0, file$a, 6, 4, 77);
    			add_location(thead, file$a, 5, 2, 65);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$a, 16, 6, 804);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$a, 17, 6, 852);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$a, 18, 6, 902);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$a, 19, 6, 952);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$a, 20, 6, 1004);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$a, 15, 4, 776);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$a, 23, 6, 1095);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$a, 24, 6, 1145);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$a, 25, 6, 1197);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$a, 26, 6, 1249);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$a, 27, 6, 1301);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$a, 22, 4, 1064);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$a, 30, 6, 1389);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$a, 31, 6, 1439);
    			attr_dev(td12, "class", "border px-4 py-2");
    			add_location(td12, file$a, 32, 6, 1491);
    			attr_dev(td13, "class", "border px-4 py-2");
    			add_location(td13, file$a, 33, 6, 1543);
    			attr_dev(td14, "class", "border px-4 py-2");
    			add_location(td14, file$a, 34, 6, 1595);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$a, 29, 4, 1361);
    			attr_dev(td15, "class", "border px-4 py-2");
    			add_location(td15, file$a, 37, 6, 1683);
    			attr_dev(td16, "class", "border px-4 py-2");
    			add_location(td16, file$a, 38, 6, 1733);
    			attr_dev(td17, "class", "border px-4 py-2");
    			add_location(td17, file$a, 39, 6, 1785);
    			attr_dev(td18, "class", "border px-4 py-2");
    			add_location(td18, file$a, 40, 6, 1837);
    			attr_dev(td19, "class", "border px-4 py-2");
    			add_location(td19, file$a, 41, 6, 1889);
    			attr_dev(tr4, "class", "bg-white");
    			add_location(tr4, file$a, 36, 4, 1655);
    			add_location(tbody, file$a, 14, 2, 764);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$a, 4, 0, 23);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t1);
    			append_dev(tr0, th1);
    			append_dev(tr0, t3);
    			append_dev(tr0, th2);
    			append_dev(tr0, t5);
    			append_dev(tr0, th3);
    			append_dev(tr0, t7);
    			append_dev(tr0, th4);
    			append_dev(table, t9);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t11);
    			append_dev(tr1, td1);
    			append_dev(tr1, t13);
    			append_dev(tr1, td2);
    			append_dev(tr1, t15);
    			append_dev(tr1, td3);
    			append_dev(tr1, t17);
    			append_dev(tr1, td4);
    			append_dev(tbody, t19);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td5);
    			append_dev(tr2, t21);
    			append_dev(tr2, td6);
    			append_dev(tr2, t23);
    			append_dev(tr2, td7);
    			append_dev(tr2, t25);
    			append_dev(tr2, td8);
    			append_dev(tr2, t27);
    			append_dev(tr2, td9);
    			append_dev(tbody, t29);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td10);
    			append_dev(tr3, t31);
    			append_dev(tr3, td11);
    			append_dev(tr3, t33);
    			append_dev(tr3, td12);
    			append_dev(tr3, t35);
    			append_dev(tr3, td13);
    			append_dev(tr3, t37);
    			append_dev(tr3, td14);
    			append_dev(tbody, t39);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td15);
    			append_dev(tr4, t41);
    			append_dev(tr4, td16);
    			append_dev(tr4, t43);
    			append_dev(tr4, td17);
    			append_dev(tr4, t45);
    			append_dev(tr4, td18);
    			append_dev(tr4, t47);
    			append_dev(tr4, td19);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(table);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$b.name, type: "component", source: "", ctx });
    	return block;
    }

    class S4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$b, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "S4", options, id: create_fragment$b.name });
    	}
    }

    /* src/pages/Ss.svelte generated by Svelte v3.12.1 */

    const file$b = "src/pages/Ss.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.data1 = list[i];
    	return child_ctx;
    }

    // (29:7) {#each questions as data1}
    function create_each_block$4(ctx) {
    	var option, t0_value = ctx.data1.name + "", t0, t1;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = ctx.data1;
    			option.value = option.__value;
    			add_location(option, file$b, 29, 7, 1174);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(29:7) {#each questions as data1}", ctx });
    	return block;
    }

    // (40:2) {#if selected}
    function create_if_block$2(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1$1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.selected.path=="si") return 0;
    		if (ctx.selected.path=="tp") return 1;
    		if (ctx.selected.path=="sm") return 2;
    		if (ctx.selected.path=="sj") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(null, ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				if (if_block) {
    					group_outros();
    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});
    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];
    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					}
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (~current_block_type_index) if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(40:2) {#if selected}", ctx });
    	return block;
    }

    // (47:34) 
    function create_if_block_4(ctx) {
    	var current;

    	var s4 = new S4({ $$inline: true });

    	const block = {
    		c: function create() {
    			s4.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(s4, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(s4.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(s4.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(s4, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(47:34) ", ctx });
    	return block;
    }

    // (45:34) 
    function create_if_block_3(ctx) {
    	var current;

    	var s3 = new S3({ $$inline: true });

    	const block = {
    		c: function create() {
    			s3.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(s3, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(s3.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(s3.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(s3, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(45:34) ", ctx });
    	return block;
    }

    // (43:34) 
    function create_if_block_2(ctx) {
    	var current;

    	var s2 = new S2({ $$inline: true });

    	const block = {
    		c: function create() {
    			s2.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(s2, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(s2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(s2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(s2, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(43:34) ", ctx });
    	return block;
    }

    // (41:4) {#if selected.path=="si"}
    function create_if_block_1$1(ctx) {
    	var current;

    	var s1 = new S1({ $$inline: true });

    	const block = {
    		c: function create() {
    			s1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(s1, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(s1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(s1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(s1, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(41:4) {#if selected.path==\"si\"}", ctx });
    	return block;
    }

    function create_fragment$c(ctx) {
    	var div4, div3, h2, t1, div2, label, t3, div1, select, t4, div0, svg, path, t5, current, dispose;

    	let each_value = ctx.questions;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	var if_block = (ctx.selected) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Valor de la sanciones según cantidad de días y forma de presentación (pesos chilenos)";
    			t1 = space();
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Seleccione tipo de sanción";
    			t3 = space();
    			div1 = element("div");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			t5 = space();
    			if (if_block) if_block.c();
    			add_location(h2, file$b, 22, 1, 600);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$b, 25, 4, 748);
    			if (ctx.selected === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			add_location(select, file$b, 27, 6, 919);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$b, 35, 95, 1461);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$b, 35, 6, 1372);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$b, 34, 4, 1268);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$b, 26, 6, 890);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$b, 24, 0, 696);
    			attr_dev(div3, "class", "w-4/5");
    			add_location(div3, file$b, 21, 2, 579);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$b, 20, 0, 505);
    			dispose = listen_dev(select, "change", ctx.select_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h2);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, ctx.selected);

    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div3, t5);
    			if (if_block) if_block.m(div3, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.questions) {
    				each_value = ctx.questions;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.selected) select_option(select, ctx.selected);

    			if (ctx.selected) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div3, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div4);
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$c.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	

    let selected;

    let questions = [
      { path: 'si', name: `Estatus Irregular` },
      { path: 'tp', name: `Trabajar sin permiso de trabajo` },
      { path: 'sm', name: `Sanción empleador natural` },
      { path: 'sj', name: `Sanción para empleador juridico`}
    ];

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate('selected', selected);
    		$$invalidate('questions', questions);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate('selected', selected = $$props.selected);
    		if ('questions' in $$props) $$invalidate('questions', questions = $$props.questions);
    	};

    	return {
    		selected,
    		questions,
    		select_change_handler
    	};
    }

    class Ss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$c, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Ss", options, id: create_fragment$c.name });
    	}
    }

    var View5 = [
    	{
    		tramite: "Residencia Definitiva",
    		clp: 76666
    	},
    	{
    		tramite: "Opción de nacionalidad",
    		clp: 21626
    	},
    	{
    		tramite: "Nacionalidad general",
    		clp: 21626
    	},
    	{
    		tramite: "Nacionalidad por vínculo con chileno (esposo/a por ley vivo o muerto hijo/a chileno/a)",
    		clp: 4138
    	}
    ];

    /* src/pages/Nc.svelte generated by Svelte v3.12.1 */

    const file$c = "src/pages/Nc.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.dss = list[i];
    	return child_ctx;
    }

    // (23:4) {#each View5 as dss}
    function create_each_block$5(ctx) {
    	var tr, td0, t0_value = ctx.dss.tramite + "", t0, t1, td1, t2, t3_value = ctx.dss ? format(Math.round((ctx.dss.clp))) : '[waiting...]' + "", t3, t4;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text("$ ");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$c, 24, 6, 761);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$c, 25, 6, 815);
    			attr_dev(tr, "class", "bg-white");
    			add_location(tr, file$c, 23, 4, 733);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(tr, t4);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$5.name, type: "each", source: "(23:4) {#each View5 as dss}", ctx });
    	return block;
    }

    function create_fragment$d(ctx) {
    	var div2, div1, h2, t1, div0, t2, table, thead, tr, th0, t4, th1, t6, tbody;

    	let each_value = View5;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Definitiva y nacionalización";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Trámite";
    			t4 = space();
    			th1 = element("th");
    			th1.textContent = "Pesos chilenos";
    			t6 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(h2, file$c, 11, 2, 272);
    			attr_dev(div0, "class", "inline-block relative w-full mt-4");
    			add_location(div0, file$c, 12, 4, 314);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$c, 17, 6, 436);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$c, 18, 6, 554);
    			add_location(tr, file$c, 16, 4, 425);
    			add_location(thead, file$c, 15, 2, 413);
    			add_location(tbody, file$c, 21, 2, 696);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$c, 14, 0, 371);
    			attr_dev(div1, "class", "w-2/3 mt-20");
    			add_location(div1, file$c, 10, 2, 244);
    			attr_dev(div2, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div2, file$c, 9, 0, 170);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t4);
    			append_dev(tr, th1);
    			append_dev(table, t6);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.View5 || changed.format) {
    				each_value = View5;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$d.name, type: "component", source: "", ctx });
    	return block;
    }

    class Nc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$d, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Nc", options, id: create_fragment$d.name });
    	}
    }

    var View4 = [
    	{
    		tramite: "Constancia por pérdida de documento",
    		usd: 0.69
    	},
    	{
    		tramite: "Certificado de registro de viaje",
    		usd: 1.1
    	},
    	{
    		tramite: "Certificado de vigencia de la permanencia",
    		usd: 1.1
    	},
    	{
    		tramite: "Salvo conducto",
    		usd: 1.1
    	},
    	{
    		tramite: "Duplicado de tarjeta de turismo",
    		usd: 0
    	},
    	{
    		tramite: "Duplicado de permanencia definitiva",
    		usd: 1.1
    	},
    	{
    		tramite: "Certificado de residencia y domicilio",
    		usd: 1.1
    	},
    	{
    		tramite: "Certificado de registro",
    		usd: 1.1
    	}
    ];

    /* src/pages/Pd.svelte generated by Svelte v3.12.1 */

    const file$d = "src/pages/Pd.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.dss = list[i];
    	return child_ctx;
    }

    // (35:4) {#each View4 as dss}
    function create_each_block$6(ctx) {
    	var tr, td0, t0_value = ctx.dss.tramite + "", t0, t1, td1, t2, t3_value = ctx.dss ? ctx.dss.usd : '[waiting...]' + "", t3, t4, td2, t5, t6_value = ctx.dss ? format(Math.round((ctx.dss.usd*ctx.price_dollar))) : '[waiting...]' + "", t6, t7;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text("US$ ");
    			t3 = text(t3_value);
    			t4 = space();
    			td2 = element("td");
    			t5 = text("$ ");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$d, 36, 6, 1104);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$d, 37, 6, 1158);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$d, 38, 6, 1235);
    			attr_dev(tr, "class", "bg-white");
    			add_location(tr, file$d, 35, 4, 1076);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, t5);
    			append_dev(td2, t6);
    			append_dev(tr, t7);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.price_dollar) && t6_value !== (t6_value = ctx.dss ? format(Math.round((ctx.dss.usd*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t6, t6_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$6.name, type: "each", source: "(35:4) {#each View4 as dss}", ctx });
    	return block;
    }

    function create_fragment$e(ctx) {
    	var div2, div1, h2, t1, div0, t2, table, thead, tr, th0, t4, th1, t6, th2, t8, tbody;

    	let each_value = View4;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Valores de trámites y documentos PDI";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Trámite";
    			t4 = space();
    			th1 = element("th");
    			th1.textContent = "Dolares";
    			t6 = space();
    			th2 = element("th");
    			th2.textContent = "Pesos chilenos";
    			t8 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(h2, file$d, 22, 2, 489);
    			attr_dev(div0, "class", "inline-block relative w-full mt-4");
    			add_location(div0, file$d, 23, 4, 539);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$d, 28, 6, 661);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$d, 29, 6, 779);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$d, 30, 6, 897);
    			add_location(tr, file$d, 27, 4, 650);
    			add_location(thead, file$d, 26, 2, 638);
    			add_location(tbody, file$d, 33, 2, 1039);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$d, 25, 0, 596);
    			attr_dev(div1, "class", "w-2/3 mt-20");
    			add_location(div1, file$d, 21, 2, 461);
    			attr_dev(div2, "class", "container mx-auto flex justify-center items-center");
    			add_location(div2, file$d, 20, 0, 394);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t4);
    			append_dev(tr, th1);
    			append_dev(tr, t6);
    			append_dev(tr, th2);
    			append_dev(table, t8);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.View4 || changed.format || changed.price_dollar) {
    				each_value = View4;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$e.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	

    let price_dollar;

    onMount(async () => {
        await fetch(`https://mindicador.cl/api`)
          .then(r => r.json())
          .then(data => {
            $$invalidate('price_dollar', price_dollar = data.dolar.valor);
          });
    });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('price_dollar' in $$props) $$invalidate('price_dollar', price_dollar = $$props.price_dollar);
    	};

    	return { price_dollar };
    }

    class Pd extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$e, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Pd", options, id: create_fragment$e.name });
    	}
    }

    var View5$1 = [
    	{
    		tramite: "Cédula de identidad",
    		usd: 5.25
    	},
    	{
    		tramite: "Antecedentes",
    		usd: 1.44
    	},
    	{
    		tramite: "Certificado de nacimiento",
    		usd: 0.98
    	},
    	{
    		tramite: "Certificado de matrimonio",
    		usd: 0.98
    	}
    ];

    /* src/pages/Rc.svelte generated by Svelte v3.12.1 */

    const file$e = "src/pages/Rc.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.dss = list[i];
    	return child_ctx;
    }

    // (36:4) {#each View5 as dss}
    function create_each_block$7(ctx) {
    	var tr, td0, t0_value = ctx.dss.tramite + "", t0, t1, td1, t2, t3_value = ctx.dss ? ctx.dss.usd : '[waiting...]' + "", t3, t4, td2, t5, t6_value = ctx.dss ? format(Math.round((ctx.dss.usd*ctx.price_dollar))) : '[waiting...]' + "", t6, t7;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text("US$ ");
    			t3 = text(t3_value);
    			t4 = space();
    			td2 = element("td");
    			t5 = text("$ ");
    			t6 = text(t6_value);
    			t7 = space();
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$e, 37, 6, 1131);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$e, 38, 6, 1185);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$e, 39, 6, 1262);
    			attr_dev(tr, "class", "bg-white");
    			add_location(tr, file$e, 36, 4, 1103);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(td1, t3);
    			append_dev(tr, t4);
    			append_dev(tr, td2);
    			append_dev(td2, t5);
    			append_dev(td2, t6);
    			append_dev(tr, t7);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.price_dollar) && t6_value !== (t6_value = ctx.dss ? format(Math.round((ctx.dss.usd*ctx.price_dollar))) : '[waiting...]' + "")) {
    				set_data_dev(t6, t6_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$7.name, type: "each", source: "(36:4) {#each View5 as dss}", ctx });
    	return block;
    }

    function create_fragment$f(ctx) {
    	var div2, div1, h2, t1, div0, t2, table, thead, tr, th0, t4, th1, t6, th2, t8, tbody;

    	let each_value = View5$1;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Valores de trámites y documentos Registro Civil Chileno";
    			t1 = space();
    			div0 = element("div");
    			t2 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Trámite";
    			t4 = space();
    			th1 = element("th");
    			th1.textContent = "Dolares";
    			t6 = space();
    			th2 = element("th");
    			th2.textContent = "Pesos chilenos";
    			t8 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(h2, file$e, 23, 2, 497);
    			attr_dev(div0, "class", "inline-block relative w-full mt-4");
    			add_location(div0, file$e, 24, 4, 566);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$e, 29, 6, 688);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$e, 30, 6, 806);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$e, 31, 6, 924);
    			add_location(tr, file$e, 28, 4, 677);
    			add_location(thead, file$e, 27, 2, 665);
    			add_location(tbody, file$e, 34, 2, 1066);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$e, 26, 0, 623);
    			attr_dev(div1, "class", "w-2/3 mt-20");
    			add_location(div1, file$e, 22, 2, 469);
    			attr_dev(div2, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div2, file$e, 21, 0, 395);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t2);
    			append_dev(div1, table);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t4);
    			append_dev(tr, th1);
    			append_dev(tr, t6);
    			append_dev(tr, th2);
    			append_dev(table, t8);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.View5 || changed.format || changed.price_dollar) {
    				each_value = View5$1;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$f.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

    let price_dollar;

    onMount(async () => {
        await fetch(`https://mindicador.cl/api`)
          .then(r => r.json())
          .then(data => {
            $$invalidate('price_dollar', price_dollar = data.dolar.valor);
          });
    });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('price_dollar' in $$props) $$invalidate('price_dollar', price_dollar = $$props.price_dollar);
    	};

    	return { price_dollar };
    }

    class Rc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$f, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Rc", options, id: create_fragment$f.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    // (21:0) <Router>
    function create_default_slot$1(ctx) {
    	var t0, t1, t2, t3, t4, t5, t6, t7, current;

    	var route0 = new Route({
    		props: { path: "*", component: Home },
    		$$inline: true
    	});

    	var route1 = new Route({
    		props: {
    		exact: true,
    		path: "/",
    		component: Home
    	},
    		$$inline: true
    	});

    	var route2 = new Route({
    		props: {
    		exact: true,
    		path: "/vs",
    		component: Vs
    	},
    		$$inline: true
    	});

    	var route3 = new Route({
    		props: {
    		exact: true,
    		path: "/vc",
    		component: Vc
    	},
    		$$inline: true
    	});

    	var route4 = new Route({
    		props: {
    		exact: true,
    		path: "/pt",
    		component: Pt
    	},
    		$$inline: true
    	});

    	var route5 = new Route({
    		props: {
    		exact: true,
    		path: "/ss",
    		component: Ss
    	},
    		$$inline: true
    	});

    	var route6 = new Route({
    		props: {
    		exact: true,
    		path: "/nc",
    		component: Nc
    	},
    		$$inline: true
    	});

    	var route7 = new Route({
    		props: {
    		exact: true,
    		path: "/pd",
    		component: Pd
    	},
    		$$inline: true
    	});

    	var route8 = new Route({
    		props: {
    		exact: true,
    		path: "/rc",
    		component: Rc
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			route0.$$.fragment.c();
    			t0 = space();
    			route1.$$.fragment.c();
    			t1 = space();
    			route2.$$.fragment.c();
    			t2 = space();
    			route3.$$.fragment.c();
    			t3 = space();
    			route4.$$.fragment.c();
    			t4 = space();
    			route5.$$.fragment.c();
    			t5 = space();
    			route6.$$.fragment.c();
    			t6 = space();
    			route7.$$.fragment.c();
    			t7 = space();
    			route8.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(route6, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(route7, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(route8, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);

    			transition_in(route1.$$.fragment, local);

    			transition_in(route2.$$.fragment, local);

    			transition_in(route3.$$.fragment, local);

    			transition_in(route4.$$.fragment, local);

    			transition_in(route5.$$.fragment, local);

    			transition_in(route6.$$.fragment, local);

    			transition_in(route7.$$.fragment, local);

    			transition_in(route8.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_component(route1, detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(route2, detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			destroy_component(route3, detaching);

    			if (detaching) {
    				detach_dev(t3);
    			}

    			destroy_component(route4, detaching);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			destroy_component(route5, detaching);

    			if (detaching) {
    				detach_dev(t5);
    			}

    			destroy_component(route6, detaching);

    			if (detaching) {
    				detach_dev(t6);
    			}

    			destroy_component(route7, detaching);

    			if (detaching) {
    				detach_dev(t7);
    			}

    			destroy_component(route8, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(21:0) <Router>", ctx });
    	return block;
    }

    function create_fragment$g(ctx) {
    	var t, current;

    	var nav = new Nav({ $$inline: true });

    	var router = new Router_1({
    		props: {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			nav.$$.fragment.c();
    			t = space();
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(nav, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.$$scope) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);

    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(nav, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(router, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$g.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$g, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$g.name });
    	}
    }

    document.addEventListener('DOMContentLoaded', () => {
      new App({
        target: document.body
      });
    });

}());
//# sourceMappingURL=main.js.map
