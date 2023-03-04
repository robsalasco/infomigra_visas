
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
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
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
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
        else if (callback) {
            callback();
        }
    }

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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    var rr=Object.create;var E=Object.defineProperty;var er=Object.getOwnPropertyDescriptor;var tr=Object.getOwnPropertyNames;var nr=Object.getPrototypeOf,ar=Object.prototype.hasOwnProperty;var F=(r,e)=>()=>(e||r((e={exports:{}}).exports,e),e.exports);var cr=(r,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let a of tr(e))!ar.call(r,a)&&a!==t&&E(r,a,{get:()=>e[a],enumerable:!(n=er(e,a))||n.enumerable});return r};var ir=(r,e,t)=>(t=r!=null?rr(nr(r)):{},cr(e||!r||!r.__esModule?E(t,"default",{value:r,enumerable:!0}):t,r));var k=F((vr,A)=>{A.exports=r=>encodeURIComponent(r).replace(/[!'()*]/g,e=>`%${e.charCodeAt(0).toString(16).toUpperCase()}`);});var U=F((br,R)=>{var $="%[a-f0-9]{2}",C=new RegExp($,"gi"),N=new RegExp("("+$+")+","gi");function x(r,e){try{return decodeURIComponent(r.join(""))}catch{}if(r.length===1)return r;e=e||1;var t=r.slice(0,e),n=r.slice(e);return Array.prototype.concat.call([],x(t),x(n))}function sr(r){try{return decodeURIComponent(r)}catch{for(var e=r.match(C),t=1;t<e.length;t++)r=x(e,t).join(""),e=r.match(C);return r}}function fr(r){for(var e={"%FE%FF":"\uFFFD\uFFFD","%FF%FE":"\uFFFD\uFFFD"},t=N.exec(r);t;){try{e[t[0]]=decodeURIComponent(t[0]);}catch{var n=sr(t[0]);n!==t[0]&&(e[t[0]]=n);}t=N.exec(r);}e["%C2"]="\uFFFD";for(var a=Object.keys(e),i=0;i<a.length;i++){var c=a[i];r=r.replace(new RegExp(c,"g"),e[c]);}return r}R.exports=function(r){if(typeof r!="string")throw new TypeError("Expected `encodedURI` to be of type `string`, got `"+typeof r+"`");try{return r=r.replace(/\+/g," "),decodeURIComponent(r)}catch{return fr(r)}};});var T=F((jr,q)=>{q.exports=(r,e)=>{if(!(typeof r=="string"&&typeof e=="string"))throw new TypeError("Expected the arguments to be of type `string`");if(e==="")return [r];let t=r.indexOf(e);return t===-1?[r]:[r.slice(0,t),r.slice(t+e.length)]};});var I=F((Sr,D)=>{D.exports=function(r,e){for(var t={},n=Object.keys(r),a=Array.isArray(e),i=0;i<n.length;i++){var c=n[i],s=r[c];(a?e.indexOf(c)!==-1:e(c,s,r))&&(t[c]=s);}return t};});var Q=F(o=>{var ur=k(),lr=U(),B=T(),or=I(),dr=r=>r==null;function hr(r){switch(r.arrayFormat){case"index":return e=>(t,n)=>{let a=t.length;return n===void 0||r.skipNull&&n===null||r.skipEmptyString&&n===""?t:n===null?[...t,[l(e,r),"[",a,"]"].join("")]:[...t,[l(e,r),"[",l(a,r),"]=",l(n,r)].join("")]};case"bracket":return e=>(t,n)=>n===void 0||r.skipNull&&n===null||r.skipEmptyString&&n===""?t:n===null?[...t,[l(e,r),"[]"].join("")]:[...t,[l(e,r),"[]=",l(n,r)].join("")];case"comma":case"separator":return e=>(t,n)=>n==null||n.length===0?t:t.length===0?[[l(e,r),"=",l(n,r)].join("")]:[[t,l(n,r)].join(r.arrayFormatSeparator)];default:return e=>(t,n)=>n===void 0||r.skipNull&&n===null||r.skipEmptyString&&n===""?t:n===null?[...t,l(e,r)]:[...t,[l(e,r),"=",l(n,r)].join("")]}}function gr(r){let e;switch(r.arrayFormat){case"index":return (t,n,a)=>{if(e=/\[(\d*)\]$/.exec(t),t=t.replace(/\[\d*\]$/,""),!e){a[t]=n;return}a[t]===void 0&&(a[t]={}),a[t][e[1]]=n;};case"bracket":return (t,n,a)=>{if(e=/(\[\])$/.exec(t),t=t.replace(/\[\]$/,""),!e){a[t]=n;return}if(a[t]===void 0){a[t]=[n];return}a[t]=[].concat(a[t],n);};case"comma":case"separator":return (t,n,a)=>{let i=typeof n=="string"&&n.includes(r.arrayFormatSeparator),c=typeof n=="string"&&!i&&g(n,r).includes(r.arrayFormatSeparator);n=c?g(n,r):n;let s=i||c?n.split(r.arrayFormatSeparator).map(f=>g(f,r)):n===null?n:g(n,r);a[t]=s;};default:return (t,n,a)=>{if(a[t]===void 0){a[t]=n;return}a[t]=[].concat(a[t],n);}}}function L(r){if(typeof r!="string"||r.length!==1)throw new TypeError("arrayFormatSeparator must be single character string")}function l(r,e){return e.encode?e.strict?ur(r):encodeURIComponent(r):r}function g(r,e){return e.decode?lr(r):r}function H(r){return Array.isArray(r)?r.sort():typeof r=="object"?H(Object.keys(r)).sort((e,t)=>Number(e)-Number(t)).map(e=>r[e]):r}function J(r){let e=r.indexOf("#");return e!==-1&&(r=r.slice(0,e)),r}function yr(r){let e="",t=r.indexOf("#");return t!==-1&&(e=r.slice(t)),e}function P(r){r=J(r);let e=r.indexOf("?");return e===-1?"":r.slice(e+1)}function M(r,e){return e.parseNumbers&&!Number.isNaN(Number(r))&&typeof r=="string"&&r.trim()!==""?r=Number(r):e.parseBooleans&&r!==null&&(r.toLowerCase()==="true"||r.toLowerCase()==="false")&&(r=r.toLowerCase()==="true"),r}function V(r,e){e=Object.assign({decode:!0,sort:!0,arrayFormat:"none",arrayFormatSeparator:",",parseNumbers:!1,parseBooleans:!1},e),L(e.arrayFormatSeparator);let t=gr(e),n=Object.create(null);if(typeof r!="string"||(r=r.trim().replace(/^[?#&]/,""),!r))return n;for(let a of r.split("&")){if(a==="")continue;let[i,c]=B(e.decode?a.replace(/\+/g," "):a,"=");c=c===void 0?null:["comma","separator"].includes(e.arrayFormat)?c:g(c,e),t(g(i,e),c,n);}for(let a of Object.keys(n)){let i=n[a];if(typeof i=="object"&&i!==null)for(let c of Object.keys(i))i[c]=M(i[c],e);else n[a]=M(i,e);}return e.sort===!1?n:(e.sort===!0?Object.keys(n).sort():Object.keys(n).sort(e.sort)).reduce((a,i)=>{let c=n[i];return Boolean(c)&&typeof c=="object"&&!Array.isArray(c)?a[i]=H(c):a[i]=c,a},Object.create(null))}o.extract=P;o.parse=V;o.stringify=(r,e)=>{if(!r)return "";e=Object.assign({encode:!0,strict:!0,arrayFormat:"none",arrayFormatSeparator:","},e),L(e.arrayFormatSeparator);let t=c=>e.skipNull&&dr(r[c])||e.skipEmptyString&&r[c]==="",n=hr(e),a={};for(let c of Object.keys(r))t(c)||(a[c]=r[c]);let i=Object.keys(a);return e.sort!==!1&&i.sort(e.sort),i.map(c=>{let s=r[c];return s===void 0?"":s===null?l(c,e):Array.isArray(s)?s.reduce(n(c),[]).join("&"):l(c,e)+"="+l(s,e)}).filter(c=>c.length>0).join("&")};o.parseUrl=(r,e)=>{e=Object.assign({decode:!0},e);let[t,n]=B(r,"#");return Object.assign({url:t.split("?")[0]||"",query:V(P(r),e)},e&&e.parseFragmentIdentifier&&n?{fragmentIdentifier:g(n,e)}:{})};o.stringifyUrl=(r,e)=>{e=Object.assign({encode:!0,strict:!0},e);let t=J(r.url).split("?")[0]||"",n=o.extract(r.url),a=o.parse(n,{sort:!1}),i=Object.assign(a,r.query),c=o.stringify(i,e);c&&(c=`?${c}`);let s=yr(r.url);return r.fragmentIdentifier&&(s=`#${l(r.fragmentIdentifier,e)}`),`${t}${c}${s}`};o.pick=(r,e,t)=>{t=Object.assign({parseFragmentIdentifier:!0},t);let{url:n,query:a,fragmentIdentifier:i}=o.parseUrl(r,t);return o.stringifyUrl({url:n,query:or(a,e),fragmentIdentifier:i},t)};o.exclude=(r,e,t)=>{let n=Array.isArray(e)?a=>!e.includes(a):(a,i)=>!e(a,i);return o.pick(r,n,t)};});var X=ir(Q());var w=function(r){function e(t,n){var a="Unreachable '"+(t!=="/"?t.replace(/\/$/,""):t)+"', segment '"+n+"' is not defined";r.call(this,a),this.message=a,this.route=t,this.path=n;}return r&&(e.__proto__=r),e.prototype=Object.create(r&&r.prototype),e.prototype.constructor=e,e}(Error);function G(r,e){var t,n,a=-100,i=[];t=r.replace(/[-$.]/g,"\\$&").replace(/\(/g,"(?:").replace(/\)/g,")?").replace(/([:*]\w+)(?:<([^<>]+?)>)?/g,function(f,d,u){return i.push(d.substr(1)),d.charAt()===":"?(a+=100,"((?!#)"+(u||"[^#/]+?")+")"):(n=!0,a+=500,"((?!#)"+(u||"[^#]+?")+")")});try{t=new RegExp("^"+t+"$");}catch{throw new TypeError("Invalid route expression, given '"+e+"'")}var c=r.includes("#")?.5:1,s=r.length*a*c;return {keys:i,regex:t,_depth:s,_isSplat:n}}var m=function(e,t){var n=G(e,t),a=n.keys,i=n.regex,c=n._depth,s=n._isSplat;function f(d){var u=d.match(i);if(u)return a.reduce(function(y,O,j){return y[O]=typeof u[j+1]=="string"?decodeURIComponent(u[j+1]):null,y},{})}return f.regex=i,f.keys=a,{_isSplat:s,_depth:c,match:f}};m.push=function(e,t,n,a){var i=t[e]||(t[e]={});return i.pattern||(i.pattern=new m(e,a),i.route=(n||"").replace(/\/$/,"")||"/"),t.keys=t.keys||[],t.keys.includes(e)||(t.keys.push(e),m.sort(t)),i};m.sort=function(e){e.keys.sort(function(t,n){return e[t].pattern._depth-e[n].pattern._depth});};function K(r,e){return ""+(e&&e!=="/"?e:"")+(r||"")}function b(r,e){var t=r.match(/<[^<>]*\/[^<>]*>/);if(t)throw new TypeError("RegExp cannot contain slashes, given '"+t+"'");var n=r.split(/(?=\/|#)/),a=[];n[0]!=="/"&&n.unshift("/"),n.some(function(i,c){var s=a.slice(1).concat(i).join("")||null,f=n.slice(c+1).join("")||null,d=e(i,s,f?""+(i!=="/"?i:"")+f:null);return a.push(i),d});}function mr(r,e){var t=e.refs,n={},a=[],i;return b(r,function(c,s,f){if(!e.keys)throw new w(r,c);var d;if(e.keys.some(function(u){var y=e[u].pattern,O=y.match,j=y._length,p=y._isSplat,_=O(p&&f||c);if(_){var Y=(t[e[u].route]||[]).concat(t[e[u].route+"/"]||[]).concat(t[e[u].route+"#"]||[]);return Object.assign(n,_),Y.forEach(function(v){if(!a.some(function(Z){return Z.key===v})){var h=Object.assign({},t[v]),S=!1;h.exact?S=f===null:S=!(c&&s===null)||c===s||p||!f,h.matches=S,h.params=Object.assign({},n),h.route=h.fullpath,h.depth+=O.keys.length,h.path=p&&f||s||c,delete h.fullpath,a.push(h);}}),f===null&&!e[u].keys?!0:!p&&!f&&e.keys.some(function(v){return v.includes("*")})?!1:(i=p,e=e[u],d=!0,!0)}return !1}),!(d||e.keys.some(function(u){return e[u].pattern.match(c)})))throw new w(r,c);return i||!d}),a.sort(function(c,s){return s.fallback&&!c.fallback?-1:c.fallback&&!s.fallback?1:s.route.includes("#")&&!c.route.includes("#")?-1:c.route.includes("#")&&!s.route.includes("#")?1:c.depth-s.depth})}function z(r,e,t){for(var n=mr.bind(null,r,e),a=[];t>0;){t-=1;try{return n(a)}catch(i){if(t>0)return n(a);throw i}}}function pr(r,e,t,n){var a=K(r,t),i=a.split(/(?=[#:/*.]\w)/g).length,c=Object.assign({},n,{fullpath:a,depth:i});if(!r||!"#/".includes(r.charAt()))throw new TypeError("Routes should have a valid path, given "+JSON.stringify(r));if(!c.key)throw new TypeError("Routes should have a key, given "+JSON.stringify(c));e.refs[c.key]=c,e.refs[a]=e.refs[a]?e.refs[a].concat(c.key):[c.key];var s=e;return b(a,function(f,d){s=m.push(f,s,d,a);}),a}function Fr(r,e,t){var n=K(r,t),a=e,i=null,c=null;if(b(n,function(f){if(!a)return i=null,!0;if(!a.keys)throw new w(r,f);c=f,i=a,a=a[c];}),!(i&&c))throw new w(r,c);if(i===e&&(i=e["/"]),i.route!==c){var s=i.keys.indexOf(c);if(s===-1)throw new w(r,c);i.keys.splice(s,1),m.sort(i),delete i[c];}i.route===a.route&&delete e.refs[n];}var W=function(){var e={refs:{}},t=[];return {routes:e,resolve:function(n,a){var i=n.split("?")[0],c=[];b(i,function(s,f,d){try{a(null,z(f,e,2).filter(function(u){return c.includes(u.route)?!1:(c.push(u.route),!0)}),f);}catch(u){a(u,[]);}});},mount:function(n,a){n!=="/"&&t.push(n),a(),t.pop();},find:function(n,a){return z(n,e,a===!0?2:a||1)},add:function(n,a){return pr(n,e,t.join(""),a)},rm:function(n){return Fr(n,e,t.join(""))}}};W.matches=function(e,t){return G(e,t).regex.test(t)};var wr=W;var export_parse=X.parse;var export_stringify=X.stringify;

    const cache = {};
    const baseTag = document.getElementsByTagName('base');
    const basePrefix = (baseTag[0] && baseTag[0].href) || '/';

    const ROOT_URL = basePrefix.replace(window.location.origin, '');

    const router = writable({
      path: '/',
      query: {},
      params: {},
      initial: true,
    });

    const CTX_ROUTER = {};
    const CTX_ROUTE = {};

    // use location.hash on embedded pages, e.g. Svelte REPL
    let HASHCHANGE = window.location.origin === 'null';

    function hashchangeEnable(value) {
      if (typeof value === 'boolean') {
        HASHCHANGE = !!value;
      }

      return HASHCHANGE;
    }

    Object.defineProperty(router, 'hashchange', {
      set: value => hashchangeEnable(value),
      get: () => hashchangeEnable(),
      configurable: false,
      enumerable: false,
    });

    function fixedLocation(path, callback, doFinally) {
      const baseUri = router.hashchange ? window.location.hash.replace('#', '') : window.location.pathname;

      // this will rebase anchors to avoid location changes
      if (path.charAt() !== '/') {
        path = baseUri + path;
      }

      const currentURL = baseUri + window.location.hash + window.location.search;

      // do not change location et all...
      if (currentURL !== path) {
        callback(path);
      }

      // invoke final guard regardless of previous result
      if (typeof doFinally === 'function') {
        doFinally();
      }
    }

    function cleanPath(uri, fix) {
      return uri !== '/' || fix ? uri.replace(/\/$/, '') : uri;
    }

    function navigateTo(path, options) {
      const {
        reload, replace,
        params, queryParams,
      } = options || {};

      // If path empty or no string, throws error
      if (!path || typeof path !== 'string' || (path[0] !== '/' && path[0] !== '#')) {
        throw new Error(`Expecting '/${path}' or '#${path}', given '${path}'`);
      }

      if (params) {
        path = path.replace(/:([a-zA-Z][a-zA-Z0-9_-]*)/g, (_, key) => params[key]);
      }

      if (queryParams) {
        const qs = export_stringify(queryParams);

        if (qs) {
          path += `?${qs}`;
        }
      }

      if (router.hashchange) {
        let fixedURL = path.replace(/^#|#$/g, '');

        if (ROOT_URL !== '/') {
          fixedURL = fixedURL.replace(cleanPath(ROOT_URL), '');
        }

        window.location.hash = fixedURL !== '/' ? fixedURL : '';
        return;
      }

      // If no History API support, fallbacks to URL redirect
      if (reload || !window.history.pushState || !window.dispatchEvent) {
        window.location.href = path;
        return;
      }

      // If has History API support, uses it
      fixedLocation(path, nextURL => {
        window.history[replace ? 'replaceState' : 'pushState'](null, '', nextURL);
        window.dispatchEvent(new Event('popstate'));
      });
    }

    function getProps(given, required) {
      const { props: sub, ...others } = given;

      // prune all declared props from this component
      required.forEach(k => {
        delete others[k];
      });

      return {
        ...sub,
        ...others,
      };
    }

    function isActive(uri, path, exact) {
      if (!cache[[uri, path, exact]]) {
        if (exact !== true && path.indexOf(uri) === 0) {
          cache[[uri, path, exact]] = /^[#/?]?$/.test(path.substr(uri.length, 1));
        } else if (uri.includes('*') || uri.includes(':')) {
          cache[[uri, path, exact]] = wr.matches(uri, path);
        } else {
          cache[[uri, path, exact]] = cleanPath(path) === uri;
        }
      }

      return cache[[uri, path, exact]];
    }

    function isPromise(object) {
      return object && typeof object.then === 'function';
    }

    function isSvelteComponent(object) {
      return object && object.prototype;
    }

    const baseRouter = new wr();
    const routeInfo = writable({});

    // private registries
    const onError = {};
    const shared = {};

    let errors = [];
    let routers = 0;
    let interval;
    let currentURL;

    // take snapshot from current state...
    router.subscribe(value => { shared.router = value; });
    routeInfo.subscribe(value => { shared.routeInfo = value; });

    function doFallback(failure, fallback) {
      routeInfo.update(defaults => ({
        ...defaults,
        [fallback]: {
          ...shared.router,
          failure,
        },
      }));
    }

    function handleRoutes(map, params, enforce) {
      map.some(x => {
        if (x.key && (enforce || (x.matches && !shared.routeInfo[x.key]))) {
          if (x.redirect && (x.condition === null || x.condition(shared.router) !== true)) {
            if (x.exact && shared.router.path !== x.path) return false;
            navigateTo(x.redirect);
            return true;
          }

          if (x.exact && x.path !== currentURL) {
            if (currentURL.replace(/[#/]$/, '') !== x.path) return false;
          }

          if (enforce && x.fallback) {
            return false;
          }

          Object.assign(params, x.params);

          // upgrade matching routes!
          routeInfo.update(defaults => ({
            ...defaults,
            [x.key]: {
              ...shared.router,
              ...x,
            },
          }));
        }

        return false;
      });
    }

    function evtHandler() {
      let baseUri = !router.hashchange ? window.location.href.replace(window.location.origin, '') : window.location.hash || '/';
      let failure;

      // unprefix active URL
      if (ROOT_URL !== '/') {
        baseUri = baseUri.replace(cleanPath(ROOT_URL), '');
      }

      // skip given anchors if already exists on document, see #43
      if (
        /^#[\w-]+$/.test(window.location.hash)
        && document.querySelector(window.location.hash)
        && currentURL === baseUri.split('#')[0]
      ) return;

      // trailing slash is required to keep route-info on nested routes!
      // see: https://github.com/pateketrueke/abstract-nested-router/commit/0f338384bddcfbaee30f3ea2c4eb0c24cf5174cd
      const normalizedURL = baseUri.replace('/#', '#').replace(/^#\//, '/');
      const [path, qs] = normalizedURL.split('?');
      const fullpath = path.replace(/\/?$/, '/');
      const params = {};

      if (currentURL !== normalizedURL) {
        currentURL = normalizedURL;
        router.set({
          path: cleanPath(fullpath),
          query: export_parse(qs),
          params,
        });
      }

      routeInfo.set({});

      // load all matching routes...
      baseRouter.resolve(fullpath, (err, result) => {
        if (err) {
          failure = err;
          return;
        }

        handleRoutes(result, params);
      });

      if (!failure) {
        try {
          handleRoutes(baseRouter.find(fullpath), params, true);
        } catch (e) {
          // noop
        }
      }

      // it's fine to omit failures for '/' paths
      if (failure && failure.path !== '/') {
        console.debug(failure);
      } else {
        failure = null;
      }

      // clear previously failed handlers
      errors.forEach(cb => cb());
      errors = [];

      let fallback;

      // invoke error-handlers to clear out previous state!
      Object.keys(onError).forEach(root => {
        if (isActive(root, fullpath, false)) {
          const fn = onError[root].callback;

          fn(failure);
          errors.push(fn);
        }

        if (!fallback && onError[root].fallback) {
          fallback = onError[root].fallback;
        }
      });

      // handle unmatched fallbacks
      if (failure && fallback) {
        doFallback(failure, fallback);
      }
    }

    function findRoutes() {
      clearTimeout(interval);
      interval = setTimeout(evtHandler);
    }

    function addRouter(root, fallback, callback) {
      if (!routers) {
        window.addEventListener('popstate', findRoutes, false);
      }

      // register error-handlers
      if (!onError[root] || fallback) {
        onError[root] = { fallback, callback };
      }

      routers += 1;

      return () => {
        routers -= 1;

        if (!routers) {
          window.removeEventListener('popstate', findRoutes, false);
        }
      };
    }

    /* node_modules/.pnpm/yrv@0.0.57_svelte@3.55.1/node_modules/yrv/build/dist/lib/Router.svelte generated by Svelte v3.55.1 */
    const get_default_slot_changes = dirty => ({ router: dirty & /*$router*/ 2 });
    const get_default_slot_context = ctx => ({ router: /*$router*/ ctx[1] });

    // (105:0) {#if !disabled}
    function create_if_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, $router*/ 130)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(105:0) {#if !disabled}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*disabled*/ ctx[0] && create_if_block(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (!/*disabled*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*disabled*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function unassignRoute(route) {
    	try {
    		baseRouter.rm(route);
    	} catch(e) {
    		
    	} // 🔥 this is fine...

    	findRoutes();
    }

    function instance($$self, $$props, $$invalidate) {
    	let $router;
    	let $basePath;
    	validate_store(router, 'router');
    	component_subscribe($$self, router, $$value => $$invalidate(1, $router = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, ['default']);
    	let cleanup;
    	let failure;
    	let fallback;
    	let { key = '' } = $$props;
    	let { path = '/' } = $$props;
    	let { pending = null } = $$props;
    	let { disabled = false } = $$props;
    	let { condition = null } = $$props;
    	const routerContext = getContext(CTX_ROUTER);
    	const basePath = routerContext ? routerContext.basePath : writable(path);
    	validate_store(basePath, 'basePath');
    	component_subscribe($$self, basePath, value => $$invalidate(12, $basePath = value));

    	const fixedRoot = $basePath !== path && $basePath !== '/'
    	? `${$basePath}${path !== '/' ? path : ''}`
    	: path;

    	function assignRoute(_key, route, detail) {
    		_key = _key || `route-${Math.random().toString(36).substr(2)}`;
    		const $key = [key, _key].filter(Boolean).join('.');
    		const handler = { key: $key, ...detail };
    		let fullpath;

    		baseRouter.mount(fixedRoot, () => {
    			fullpath = baseRouter.add(route, handler);
    			fallback = handler.fallback && $key || fallback;
    		});

    		findRoutes();
    		return [$key, fullpath];
    	}

    	function onError(err) {
    		failure = err;

    		if (failure && fallback) {
    			doFallback(failure, fallback);
    		}
    	}

    	onMount(() => {
    		cleanup = addRouter(fixedRoot, fallback, onError);
    	});

    	onDestroy(() => {
    		if (cleanup) cleanup();
    	});

    	setContext(CTX_ROUTER, {
    		basePath,
    		assignRoute,
    		unassignRoute,
    		pendingComponent: pending
    	});

    	const writable_props = ['key', 'path', 'pending', 'disabled', 'condition'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('key' in $$props) $$invalidate(3, key = $$props.key);
    		if ('path' in $$props) $$invalidate(4, path = $$props.path);
    		if ('pending' in $$props) $$invalidate(5, pending = $$props.pending);
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('condition' in $$props) $$invalidate(6, condition = $$props.condition);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		CTX_ROUTER,
    		router,
    		baseRouter,
    		addRouter,
    		findRoutes,
    		doFallback,
    		onMount,
    		onDestroy,
    		getContext,
    		setContext,
    		cleanup,
    		failure,
    		fallback,
    		key,
    		path,
    		pending,
    		disabled,
    		condition,
    		routerContext,
    		basePath,
    		fixedRoot,
    		assignRoute,
    		unassignRoute,
    		onError,
    		$router,
    		$basePath
    	});

    	$$self.$inject_state = $$props => {
    		if ('cleanup' in $$props) cleanup = $$props.cleanup;
    		if ('failure' in $$props) failure = $$props.failure;
    		if ('fallback' in $$props) fallback = $$props.fallback;
    		if ('key' in $$props) $$invalidate(3, key = $$props.key);
    		if ('path' in $$props) $$invalidate(4, path = $$props.path);
    		if ('pending' in $$props) $$invalidate(5, pending = $$props.pending);
    		if ('disabled' in $$props) $$invalidate(0, disabled = $$props.disabled);
    		if ('condition' in $$props) $$invalidate(6, condition = $$props.condition);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*condition, $router*/ 66) {
    			 if (condition) {
    				$$invalidate(0, disabled = !condition($router));
    			}
    		}
    	};

    	return [disabled, $router, basePath, key, path, pending, condition, $$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			key: 3,
    			path: 4,
    			pending: 5,
    			disabled: 0,
    			condition: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get key() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get path() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pending() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pending(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get condition() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set condition(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/.pnpm/yrv@0.0.57_svelte@3.55.1/node_modules/yrv/build/dist/lib/Route.svelte generated by Svelte v3.55.1 */
    const get_default_slot_spread_changes = dirty => dirty & /*activeProps*/ 8;
    const get_default_slot_changes$1 = dirty => ({});
    const get_default_slot_context$1 = ctx => ({ .../*activeProps*/ ctx[3] });

    // (133:0) {#if activeRouter}
    function create_if_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_5, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*hasLoaded*/ ctx[4]) return 0;
    		if (/*component*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
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
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
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
    				} else {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(133:0) {#if activeRouter}",
    		ctx
    	});

    	return block;
    }

    // (148:4) {:else}
    function create_else_block_1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, activeProps*/ 65544)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						get_default_slot_spread_changes(dirty) || !current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(148:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (146:4) {#if component}
    function create_if_block_5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*activeProps*/ ctx[3]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeProps*/ 8)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*activeProps*/ ctx[3])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(146:4) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (135:2) {#if !hasLoaded}
    function create_if_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*pending*/ ctx[1] || /*pendingComponent*/ ctx[5]) && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pending*/ ctx[1] || /*pendingComponent*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*pending*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2(ctx);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(135:2) {#if !hasLoaded}",
    		ctx
    	});

    	return block;
    }

    // (136:4) {#if pending || pendingComponent}
    function create_if_block_2(ctx) {
    	let show_if;
    	let show_if_1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_3, create_if_block_4, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (dirty & /*pending*/ 2) show_if = null;
    		if (show_if == null) show_if = !!isSvelteComponent(/*pending*/ ctx[1]);
    		if (show_if) return 0;
    		if (show_if_1 == null) show_if_1 = !!isSvelteComponent(/*pendingComponent*/ ctx[5]);
    		if (show_if_1) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_1(ctx, -1);
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
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
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
    				} else {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(136:4) {#if pending || pendingComponent}",
    		ctx
    	});

    	return block;
    }

    // (141:6) {:else}
    function create_else_block(ctx) {
    	let t_value = (/*pending*/ ctx[1] || /*pendingComponent*/ ctx[5]) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pending*/ 2 && t_value !== (t_value = (/*pending*/ ctx[1] || /*pendingComponent*/ ctx[5]) + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(141:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (139:52) 
    function create_if_block_4(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*activeProps*/ ctx[3]];
    	var switch_value = /*pendingComponent*/ ctx[5];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeProps*/ 8)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*activeProps*/ ctx[3])])
    			: {};

    			if (switch_value !== (switch_value = /*pendingComponent*/ ctx[5])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(139:52) ",
    		ctx
    	});

    	return block;
    }

    // (137:6) {#if isSvelteComponent(pending)}
    function create_if_block_3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*activeProps*/ ctx[3]];
    	var switch_value = /*pending*/ ctx[1];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*activeProps*/ 8)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*activeProps*/ ctx[3])])
    			: {};

    			if (switch_value !== (switch_value = /*pending*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
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
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(137:6) {#if isSvelteComponent(pending)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*activeRouter*/ ctx[2] && create_if_block$1(ctx);

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
    		p: function update(ctx, [dirty]) {
    			if (/*activeRouter*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*activeRouter*/ 4) {
    						transition_in(if_block, 1);
    					}
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $router;
    	let $routeInfo;
    	let $routePath;
    	validate_store(router, 'router');
    	component_subscribe($$self, router, $$value => $$invalidate(14, $router = $$value));
    	validate_store(routeInfo, 'routeInfo');
    	component_subscribe($$self, routeInfo, $$value => $$invalidate(15, $routeInfo = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Route', slots, ['default']);
    	let { key = null } = $$props;
    	let { path = '/' } = $$props;
    	let { exact = null } = $$props;
    	let { pending = null } = $$props;
    	let { disabled = false } = $$props;
    	let { fallback = null } = $$props;
    	let { component = null } = $$props;
    	let { condition = null } = $$props;
    	let { redirect = null } = $$props;

    	// replacement for `Object.keys(arguments[0].$$.props)`
    	const thisProps = [
    		'key',
    		'path',
    		'exact',
    		'pending',
    		'disabled',
    		'fallback',
    		'component',
    		'condition',
    		'redirect'
    	];

    	const routeContext = getContext(CTX_ROUTE);
    	const routerContext = getContext(CTX_ROUTER);
    	const { assignRoute, unassignRoute, pendingComponent } = routerContext || {};
    	const routePath = routeContext ? routeContext.routePath : writable(path);
    	validate_store(routePath, 'routePath');
    	component_subscribe($$self, routePath, value => $$invalidate(19, $routePath = value));
    	let activeRouter = null;
    	let activeProps = {};
    	let fullpath;
    	let hasLoaded;

    	const fixedRoot = $routePath !== path && $routePath !== '/'
    	? `${$routePath}${path !== '/' ? path : ''}`
    	: path;

    	function resolve() {
    		const fixedRoute = path !== fixedRoot && fixedRoot.substr(-1) !== '/'
    		? `${fixedRoot}/`
    		: fixedRoot;

    		$$invalidate(7, [key, fullpath] = assignRoute(key, fixedRoute, { condition, redirect, fallback, exact }), key);
    	}

    	resolve();

    	onDestroy(() => {
    		if (unassignRoute) {
    			unassignRoute(fullpath);
    		}
    	});

    	setContext(CTX_ROUTE, { routePath });

    	$$self.$$set = $$new_props => {
    		$$invalidate(27, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('key' in $$new_props) $$invalidate(7, key = $$new_props.key);
    		if ('path' in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ('exact' in $$new_props) $$invalidate(9, exact = $$new_props.exact);
    		if ('pending' in $$new_props) $$invalidate(1, pending = $$new_props.pending);
    		if ('disabled' in $$new_props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ('fallback' in $$new_props) $$invalidate(11, fallback = $$new_props.fallback);
    		if ('component' in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ('condition' in $$new_props) $$invalidate(12, condition = $$new_props.condition);
    		if ('redirect' in $$new_props) $$invalidate(13, redirect = $$new_props.redirect);
    		if ('$$scope' in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		writable,
    		routeInfo,
    		CTX_ROUTER,
    		CTX_ROUTE,
    		router,
    		getProps,
    		isPromise,
    		isSvelteComponent,
    		onDestroy,
    		getContext,
    		setContext,
    		key,
    		path,
    		exact,
    		pending,
    		disabled,
    		fallback,
    		component,
    		condition,
    		redirect,
    		thisProps,
    		routeContext,
    		routerContext,
    		assignRoute,
    		unassignRoute,
    		pendingComponent,
    		routePath,
    		activeRouter,
    		activeProps,
    		fullpath,
    		hasLoaded,
    		fixedRoot,
    		resolve,
    		$router,
    		$routeInfo,
    		$routePath
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(27, $$props = assign(assign({}, $$props), $$new_props));
    		if ('key' in $$props) $$invalidate(7, key = $$new_props.key);
    		if ('path' in $$props) $$invalidate(8, path = $$new_props.path);
    		if ('exact' in $$props) $$invalidate(9, exact = $$new_props.exact);
    		if ('pending' in $$props) $$invalidate(1, pending = $$new_props.pending);
    		if ('disabled' in $$props) $$invalidate(10, disabled = $$new_props.disabled);
    		if ('fallback' in $$props) $$invalidate(11, fallback = $$new_props.fallback);
    		if ('component' in $$props) $$invalidate(0, component = $$new_props.component);
    		if ('condition' in $$props) $$invalidate(12, condition = $$new_props.condition);
    		if ('redirect' in $$props) $$invalidate(13, redirect = $$new_props.redirect);
    		if ('activeRouter' in $$props) $$invalidate(2, activeRouter = $$new_props.activeRouter);
    		if ('activeProps' in $$props) $$invalidate(3, activeProps = $$new_props.activeProps);
    		if ('fullpath' in $$props) fullpath = $$new_props.fullpath;
    		if ('hasLoaded' in $$props) $$invalidate(4, hasLoaded = $$new_props.hasLoaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 if (key) {
    			$$invalidate(2, activeRouter = !disabled && $routeInfo[key]);
    			$$invalidate(3, activeProps = getProps($$props, thisProps));
    			$$invalidate(3, activeProps.router = activeRouter, activeProps);
    		}

    		if ($$self.$$.dirty & /*activeRouter, $router, component*/ 16389) {
    			 if (activeRouter) {
    				for (const k in $router.params) {
    					if (typeof activeRouter.params[k] === 'undefined') {
    						$$invalidate(2, activeRouter.params[k] = $router.params[k], activeRouter);
    					}
    				}

    				if (!component) {
    					// component passed as slot
    					$$invalidate(4, hasLoaded = true);
    				} else if (isSvelteComponent(component)) {
    					// component passed as Svelte component
    					$$invalidate(4, hasLoaded = true);
    				} else if (isPromise(component)) {
    					// component passed as import()
    					component.then(module => {
    						$$invalidate(0, component = module.default);
    						$$invalidate(4, hasLoaded = true);
    					});
    				} else {
    					// component passed as () => import()
    					component().then(module => {
    						$$invalidate(0, component = module.default);
    						$$invalidate(4, hasLoaded = true);
    					});
    				}
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		pending,
    		activeRouter,
    		activeProps,
    		hasLoaded,
    		pendingComponent,
    		routePath,
    		key,
    		path,
    		exact,
    		disabled,
    		fallback,
    		condition,
    		redirect,
    		$router,
    		$routeInfo,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			key: 7,
    			path: 8,
    			exact: 9,
    			pending: 1,
    			disabled: 10,
    			fallback: 11,
    			component: 0,
    			condition: 12,
    			redirect: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
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

    	get exact() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pending() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pending(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
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

    /* node_modules/.pnpm/yrv@0.0.57_svelte@3.55.1/node_modules/yrv/build/dist/lib/Link.svelte generated by Svelte v3.55.1 */

    const file = "node_modules/.pnpm/yrv@0.0.57_svelte@3.55.1/node_modules/yrv/build/dist/lib/Link.svelte";

    // (108:0) {:else}
    function create_else_block$1(ctx) {
    	let a;
    	let a_href_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

    	let a_levels = [
    		/*fixedProps*/ ctx[6],
    		{
    			href: a_href_value = cleanPath(/*fixedHref*/ ctx[5] || /*href*/ ctx[1])
    		},
    		{ class: /*cssClass*/ ctx[0] },
    		{ title: /*title*/ ctx[2] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 108, 2, 2944);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			/*a_binding*/ ctx[19](a);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*handleAnchorOnClick*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*fixedProps*/ 64 && /*fixedProps*/ ctx[6],
    				(!current || dirty & /*fixedHref, href*/ 34 && a_href_value !== (a_href_value = cleanPath(/*fixedHref*/ ctx[5] || /*href*/ ctx[1]))) && { href: a_href_value },
    				(!current || dirty & /*cssClass*/ 1) && { class: /*cssClass*/ ctx[0] },
    				(!current || dirty & /*title*/ 4) && { title: /*title*/ ctx[2] }
    			]));
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
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			/*a_binding*/ ctx[19](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(108:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (104:0) {#if button}
    function create_if_block$2(ctx) {
    	let button_1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

    	let button_1_levels = [
    		/*fixedProps*/ ctx[6],
    		{ class: /*cssClass*/ ctx[0] },
    		{ title: /*title*/ ctx[2] }
    	];

    	let button_1_data = {};

    	for (let i = 0; i < button_1_levels.length; i += 1) {
    		button_1_data = assign(button_1_data, button_1_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			button_1 = element("button");
    			if (default_slot) default_slot.c();
    			set_attributes(button_1, button_1_data);
    			add_location(button_1, file, 104, 2, 2818);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button_1, anchor);

    			if (default_slot) {
    				default_slot.m(button_1, null);
    			}

    			if (button_1.autofocus) button_1.focus();
    			/*button_1_binding*/ ctx[18](button_1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button_1, "click", /*handleOnClick*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			}

    			set_attributes(button_1, button_1_data = get_spread_update(button_1_levels, [
    				dirty & /*fixedProps*/ 64 && /*fixedProps*/ ctx[6],
    				(!current || dirty & /*cssClass*/ 1) && { class: /*cssClass*/ ctx[0] },
    				(!current || dirty & /*title*/ 4) && { title: /*title*/ ctx[2] }
    			]));
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
    			if (detaching) detach_dev(button_1);
    			if (default_slot) default_slot.d(detaching);
    			/*button_1_binding*/ ctx[18](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(104:0) {#if button}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*button*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
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
    				} else {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let fixedProps;
    	let $router;
    	validate_store(router, 'router');
    	component_subscribe($$self, router, $$value => $$invalidate(15, $router = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Link', slots, ['default']);
    	let ref;
    	let active;
    	let { class: cssClass = '' } = $$props;
    	let fixedHref = null;
    	let { go = null } = $$props;
    	let { open = null } = $$props;
    	let { href = '' } = $$props;
    	let { title = '' } = $$props;
    	let { button = false } = $$props;
    	let { exact = false } = $$props;
    	let { reload = false } = $$props;
    	let { replace = false } = $$props;

    	// replacement for `Object.keys(arguments[0].$$.props)`
    	const thisProps = ['go', 'open', 'href', 'class', 'title', 'button', 'exact', 'reload', 'replace'];

    	const dispatch = createEventDispatcher();

    	// this will enable `<Link on:click={...} />` calls
    	function handleOnClick(e) {
    		e.preventDefault();

    		if (typeof go === 'string' && window.history.length > 1) {
    			if (go === 'back') window.history.back(); else if (go === 'fwd') window.history.forward(); else window.history.go(parseInt(go, 10));
    			return;
    		}

    		if (!fixedHref && href !== '') {
    			if (open) {
    				let specs = typeof open === 'string' ? open : '';
    				const wmatch = specs.match(/width=(\d+)/);
    				const hmatch = specs.match(/height=(\d+)/);
    				if (wmatch) specs += `,left=${(window.screen.width - wmatch[1]) / 2}`;
    				if (hmatch) specs += `,top=${(window.screen.height - hmatch[1]) / 2}`;

    				if (wmatch && !hmatch) {
    					specs += `,height=${wmatch[1]},top=${(window.screen.height - wmatch[1]) / 2}`;
    				}

    				const w = window.open(href, '', specs);

    				const t = setInterval(
    					() => {
    						if (w.closed) {
    							dispatch('close');
    							clearInterval(t);
    						}
    					},
    					120
    				);
    			} else window.location.href = href;

    			return;
    		}

    		fixedLocation(
    			href,
    			() => {
    				navigateTo(fixedHref || '/', { reload, replace });
    			},
    			() => dispatch('click', e)
    		);
    	}

    	function handleAnchorOnClick(e) {
    		// user used a keyboard shortcut to force open link in a new tab
    		if (e.metaKey || e.ctrlKey || e.button !== 0) {
    			return;
    		}

    		handleOnClick(e);
    	}

    	function button_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(4, ref);
    		});
    	}

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			ref = $$value;
    			$$invalidate(4, ref);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(22, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('class' in $$new_props) $$invalidate(0, cssClass = $$new_props.class);
    		if ('go' in $$new_props) $$invalidate(9, go = $$new_props.go);
    		if ('open' in $$new_props) $$invalidate(10, open = $$new_props.open);
    		if ('href' in $$new_props) $$invalidate(1, href = $$new_props.href);
    		if ('title' in $$new_props) $$invalidate(2, title = $$new_props.title);
    		if ('button' in $$new_props) $$invalidate(3, button = $$new_props.button);
    		if ('exact' in $$new_props) $$invalidate(11, exact = $$new_props.exact);
    		if ('reload' in $$new_props) $$invalidate(12, reload = $$new_props.reload);
    		if ('replace' in $$new_props) $$invalidate(13, replace = $$new_props.replace);
    		if ('$$scope' in $$new_props) $$invalidate(16, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ROOT_URL,
    		fixedLocation,
    		navigateTo,
    		cleanPath,
    		isActive,
    		getProps,
    		router,
    		ref,
    		active,
    		cssClass,
    		fixedHref,
    		go,
    		open,
    		href,
    		title,
    		button,
    		exact,
    		reload,
    		replace,
    		thisProps,
    		dispatch,
    		handleOnClick,
    		handleAnchorOnClick,
    		fixedProps,
    		$router
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(22, $$props = assign(assign({}, $$props), $$new_props));
    		if ('ref' in $$props) $$invalidate(4, ref = $$new_props.ref);
    		if ('active' in $$props) $$invalidate(14, active = $$new_props.active);
    		if ('cssClass' in $$props) $$invalidate(0, cssClass = $$new_props.cssClass);
    		if ('fixedHref' in $$props) $$invalidate(5, fixedHref = $$new_props.fixedHref);
    		if ('go' in $$props) $$invalidate(9, go = $$new_props.go);
    		if ('open' in $$props) $$invalidate(10, open = $$new_props.open);
    		if ('href' in $$props) $$invalidate(1, href = $$new_props.href);
    		if ('title' in $$props) $$invalidate(2, title = $$new_props.title);
    		if ('button' in $$props) $$invalidate(3, button = $$new_props.button);
    		if ('exact' in $$props) $$invalidate(11, exact = $$new_props.exact);
    		if ('reload' in $$props) $$invalidate(12, reload = $$new_props.reload);
    		if ('replace' in $$props) $$invalidate(13, replace = $$new_props.replace);
    		if ('fixedProps' in $$props) $$invalidate(6, fixedProps = $$new_props.fixedProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*href*/ 2) {
    			// rebase active URL
    			 if (!(/^(\w+:)?\/\//).test(href)) {
    				$$invalidate(5, fixedHref = cleanPath(ROOT_URL, true) + cleanPath(router.hashchange ? `#${href}` : href));
    			}
    		}

    		if ($$self.$$.dirty & /*ref, $router, href, exact, active, button*/ 51226) {
    			 if (ref && $router.path) {
    				if (isActive(href, $router.path, exact)) {
    					if (!active) {
    						$$invalidate(14, active = true);
    						ref.setAttribute('aria-current', 'page');

    						if (button) {
    							ref.setAttribute('disabled', true);
    						}
    					}
    				} else if (active) {
    					$$invalidate(14, active = false);
    					ref.removeAttribute('disabled');
    					ref.removeAttribute('aria-current');
    				}
    			}
    		}

    		// extract additional props
    		 $$invalidate(6, fixedProps = getProps($$props, thisProps));
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		cssClass,
    		href,
    		title,
    		button,
    		ref,
    		fixedHref,
    		fixedProps,
    		handleOnClick,
    		handleAnchorOnClick,
    		go,
    		open,
    		exact,
    		reload,
    		replace,
    		active,
    		$router,
    		$$scope,
    		slots,
    		button_1_binding,
    		a_binding
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 0,
    			go: 9,
    			open: 10,
    			href: 1,
    			title: 2,
    			button: 3,
    			exact: 11,
    			reload: 12,
    			replace: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get go() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set go(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get open() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get button() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set button(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reload() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reload(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Modal.svelte generated by Svelte v3.55.1 */
    const file$1 = "src/components/Modal.svelte";

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "🚀";
    			attr_dev(div0, "class", "modal-overlay absolute w-full h-full bg-black opacity-25 top-0 left-0 cursor-pointer");
    			add_location(div0, file$1, 21, 2, 561);
    			attr_dev(div1, "class", "absolute w-1/2 h-32 bg-white rounded-sm shadow-lg flex items-center justify-center text-2xl");
    			add_location(div1, file$1, 22, 2, 668);
    			attr_dev(div2, "class", "modal opacity-0 pointer-events-none absolute w-full h-full top-0 left-0 flex items-center justify-center svelte-1bcupx0");
    			add_location(div2, file$1, 20, 0, 440);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = listen_dev(window, "load", toggleModal, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function toggleModal() {
    	const modal = document.querySelector('.modal');
    	modal.classList.toggle('opacity-0');
    	modal.classList.toggle('pointer-events-none');
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, []);

    	onMount(() => {
    		const overlay = document.querySelector('.modal-overlay');
    		overlay.addEventListener('click', toggleModal);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, toggleModal });
    	return [];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.55.1 */
    const file$2 = "src/components/Nav.svelte";

    // (7:55) <Link href="/">
    function create_default_slot(ctx) {
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = text("Infomigra");
    			attr_dev(img, "class", "logo");
    			if (!src_url_equal(img.src, img_src_value = "logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Infomigra");
    			add_location(img, file$2, 6, 70, 263);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(7:55) <Link href=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let nav;
    	let div;
    	let span;
    	let link;
    	let current;

    	link = new Link({
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
    			create_component(link.$$.fragment);
    			attr_dev(span, "class", "font-semibold text-xl tracking-tight");
    			add_location(span, file$2, 6, 4, 197);
    			attr_dev(div, "class", "flex items-center flex-shrink-0 text-white mr-6");
    			add_location(div, file$2, 5, 2, 131);
    			attr_dev(nav, "class", "fixed items-center justify-between flex-wrap bg-teal-500 p-6 w-full");
    			add_location(nav, file$2, 4, 0, 47);
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
    		p: function update(ctx, [dirty]) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				link_changes.$$scope = { dirty, ctx };
    			}

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
    			if (detaching) detach_dev(nav);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Link });
    	return [];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/Home.svelte generated by Svelte v3.55.1 */
    const file$3 = "src/pages/Home.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (35:10) {#each questions as question}
    function create_each_block(ctx) {
    	let option;
    	let t0_value = /*question*/ ctx[4].name + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*question*/ ctx[4];
    			option.value = option.__value;
    			add_location(option, file$3, 35, 10, 1262);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:10) {#each questions as question}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let div2;
    	let h2;
    	let t1;
    	let form;
    	let div1;
    	let select;
    	let t2;
    	let div0;
    	let svg;
    	let path;
    	let t3;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value = /*questions*/ ctx[1];
    	validate_each_argument(each_value);
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
    			add_location(h2, file$3, 30, 4, 825);
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline");
    			if (/*page*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$3, 33, 8, 1010);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$3, 41, 99, 1577);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$3, 41, 10, 1488);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$3, 40, 8, 1380);
    			attr_dev(div1, "class", "inline-block relative w-12/12");
    			add_location(div1, file$3, 32, 6, 958);
    			attr_dev(button, "class", "flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded mt-4");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 44, 6, 1704);
    			attr_dev(form, "class", "mt-4");
    			add_location(form, file$3, 31, 4, 892);
    			attr_dev(div2, "class", "block relative bg-white shadow-md rounded px-8 pb-8 mb-4 w-12/12");
    			add_location(div2, file$3, 28, 2, 741);
    			attr_dev(div3, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div3, file$3, 26, 0, 666);
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

    			select_option(select, /*page*/ ctx[0]);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(form, t3);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[3]),
    					listen_dev(form, "submit", prevent_default(/*handleSubmit*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*questions*/ 2) {
    				each_value = /*questions*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty & /*page, questions*/ 3) {
    				select_option(select, /*page*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	let page;

    	let questions = [
    		{
    			path: '/vs',
    			name: `Valor de visas según país de origen`
    		},
    		{
    			path: '/vc',
    			name: `Valor de visas consulares según país de origen`
    		},
    		{
    			path: '/pt',
    			name: `Valor de permisos de trabajo según país de origen`
    		},
    		{
    			path: '/ss',
    			name: `Valor de la sanciones según cantidad de días y forma de presentación`
    		},
    		{
    			path: '/nc',
    			name: `Definitiva y nacionalización`
    		},
    		{
    			path: '/rc',
    			name: `Valores de trámites y documentos Registro Civil Chileno`
    		}
    	];

    	function handleSubmit() {
    		navigateTo(`${page.path}`);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		page = select_value(this);
    		$$invalidate(0, page);
    		$$invalidate(1, questions);
    	}

    	$$self.$capture_state = () => ({
    		navigateTo,
    		page,
    		questions,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('questions' in $$props) $$invalidate(1, questions = $$props.questions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, questions, handleSubmit, select_change_handler];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$5.name
    		});
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

    /* src/Helpers.svelte generated by Svelte v3.55.1 */

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

    /* src/pages/Vs.svelte generated by Svelte v3.55.1 */
    const file$4 = "src/pages/Vs.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (29:7) {#each View1 as data1}
    function create_each_block$1(ctx) {
    	let option;
    	let t0_value = /*data1*/ ctx[3]["country"] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*data1*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$4, 29, 7, 985);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(29:7) {#each View1 as data1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div4;
    	let div3;
    	let h2;
    	let t1;
    	let div2;
    	let label;
    	let t3;
    	let div1;
    	let select;
    	let t4;
    	let div0;
    	let svg;
    	let path;
    	let t5;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t7;
    	let th1;
    	let t9;
    	let th2;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t14;

    	let t15_value = (/*selected*/ ctx[0]
    	? /*selected*/ ctx[0]["sc"]
    	: '[waiting...]') + "";

    	let t15;
    	let t16;
    	let td2;
    	let t17;

    	let t18_value = (/*selected*/ ctx[0]
    	? format(Math.round(/*selected*/ ctx[0]["sc"] * /*price_dollar*/ ctx[1]))
    	: '[waiting...]') + "";

    	let t18;
    	let t19;
    	let tr2;
    	let td3;
    	let t21;
    	let td4;
    	let t22;

    	let t23_value = (/*selected*/ ctx[0]
    	? /*selected*/ ctx[0]["t"]
    	: '[waiting...]') + "";

    	let t23;
    	let t24;
    	let td5;
    	let t25;

    	let t26_value = (/*selected*/ ctx[0]
    	? format(Math.round(/*selected*/ ctx[0]["t"] * /*price_dollar*/ ctx[1]))
    	: '[waiting...]') + "";

    	let t26;
    	let t27;
    	let tr3;
    	let td6;
    	let t29;
    	let td7;
    	let t30;

    	let t31_value = (/*selected*/ ctx[0]
    	? /*selected*/ ctx[0]["e"]
    	: '[waiting...]') + "";

    	let t31;
    	let t32;
    	let td8;
    	let t33;

    	let t34_value = (/*selected*/ ctx[0]
    	? format(Math.round(/*selected*/ ctx[0]["e"] * /*price_dollar*/ ctx[1]))
    	: '[waiting...]') + "";

    	let t34;
    	let mounted;
    	let dispose;
    	let each_value = View1;
    	validate_each_argument(each_value);
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
    			add_location(h2, file$4, 23, 1, 456);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$4, 25, 4, 560);
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$4, 27, 6, 734);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$4, 35, 95, 1278);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$4, 35, 6, 1189);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-grey-700");
    			add_location(div0, file$4, 34, 4, 1085);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$4, 26, 6, 705);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$4, 24, 4, 508);
    			attr_dev(th0, "class", "w-3/6 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$4, 42, 6, 1465);
    			attr_dev(th1, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$4, 43, 6, 1588);
    			attr_dev(th2, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$4, 44, 6, 1706);
    			add_location(tr0, file$4, 41, 4, 1454);
    			add_location(thead, file$4, 40, 2, 1442);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$4, 49, 6, 1888);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$4, 50, 6, 1946);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$4, 51, 6, 2035);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$4, 48, 4, 1860);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$4, 54, 6, 2196);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$4, 55, 6, 2247);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$4, 56, 6, 2335);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$4, 53, 4, 2165);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$4, 59, 6, 2492);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$4, 60, 6, 2543);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$4, 61, 6, 2631);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$4, 58, 4, 2464);
    			add_location(tbody, file$4, 47, 2, 1848);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$4, 39, 0, 1400);
    			attr_dev(div3, "class", "w-2/3");
    			add_location(div3, file$4, 22, 2, 435);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$4, 21, 0, 361);
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

    			select_option(select, /*selected*/ ctx[0]);
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

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*View1*/ 0) {
    				each_value = View1;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty & /*selected, View1*/ 1) {
    				select_option(select, /*selected*/ ctx[0]);
    			}

    			if (dirty & /*selected*/ 1 && t15_value !== (t15_value = (/*selected*/ ctx[0]
    			? /*selected*/ ctx[0]["sc"]
    			: '[waiting...]') + "")) set_data_dev(t15, t15_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t18_value !== (t18_value = (/*selected*/ ctx[0]
    			? format(Math.round(/*selected*/ ctx[0]["sc"] * /*price_dollar*/ ctx[1]))
    			: '[waiting...]') + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*selected*/ 1 && t23_value !== (t23_value = (/*selected*/ ctx[0]
    			? /*selected*/ ctx[0]["t"]
    			: '[waiting...]') + "")) set_data_dev(t23, t23_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t26_value !== (t26_value = (/*selected*/ ctx[0]
    			? format(Math.round(/*selected*/ ctx[0]["t"] * /*price_dollar*/ ctx[1]))
    			: '[waiting...]') + "")) set_data_dev(t26, t26_value);

    			if (dirty & /*selected*/ 1 && t31_value !== (t31_value = (/*selected*/ ctx[0]
    			? /*selected*/ ctx[0]["e"]
    			: '[waiting...]') + "")) set_data_dev(t31, t31_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t34_value !== (t34_value = (/*selected*/ ctx[0]
    			? format(Math.round(/*selected*/ ctx[0]["e"] * /*price_dollar*/ ctx[1]))
    			: '[waiting...]') + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Vs', slots, []);
    	let selected;
    	let price_dollar;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(1, price_dollar = data.dolar.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Vs> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    	}

    	$$self.$capture_state = () => ({
    		View1,
    		format,
    		onMount,
    		selected,
    		price_dollar
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('price_dollar' in $$props) $$invalidate(1, price_dollar = $$props.price_dollar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, price_dollar, select_change_handler];
    }

    class Vs extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vs",
    			options,
    			id: create_fragment$6.name
    		});
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

    /* src/pages/Vc.svelte generated by Svelte v3.55.1 */
    const file$5 = "src/pages/Vc.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (30:7) {#each View1 as data1}
    function create_each_block$2(ctx) {
    	let option;
    	let t0_value = /*data1*/ ctx[3]["country"] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*data1*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$5, 30, 7, 1000);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(30:7) {#each View1 as data1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div4;
    	let div3;
    	let h2;
    	let t1;
    	let div2;
    	let label;
    	let t3;
    	let div1;
    	let select;
    	let t4;
    	let div0;
    	let svg;
    	let path;
    	let t5;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t7;
    	let th1;
    	let t9;
    	let th2;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;

    	let t14_value = (/*selected*/ ctx[0]
    	? isNaN(/*selected*/ ctx[0]["vct"])
    		? 'No disponible'
    		: `US$ ${/*selected*/ ctx[0]["vct"]}`
    	: '[waiting...]') + "";

    	let t14;
    	let t15;
    	let td2;

    	let t16_value = (/*selected*/ ctx[0]
    	? isNaN(format(Math.round(/*selected*/ ctx[0]["vct"] * /*price_dollar*/ ctx[1])))
    		? 'No disponible'
    		: `$ ${format(Math.round(/*selected*/ ctx[0]["vct"] * /*price_dollar*/ ctx[1]))}`
    	: '[waiting...]') + "";

    	let t16;
    	let t17;
    	let tr2;
    	let td3;
    	let t19;
    	let td4;

    	let t20_value = (/*selected*/ ctx[0]
    	? isNaN(/*selected*/ ctx[0]["vo"])
    		? 'No disponible'
    		: `US$ ${/*selected*/ ctx[0]["vo"]}`
    	: '[waiting...]') + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (/*selected*/ ctx[0]
    	? isNaN(format(Math.round(/*selected*/ ctx[0]["vo"] * /*price_dollar*/ ctx[1])))
    		? 'No disponible'
    		: `$ ${format(Math.round(/*selected*/ ctx[0]["vo"] * /*price_dollar*/ ctx[1]))}`
    	: '[waiting...]') + "";

    	let t22;
    	let t23;
    	let tr3;
    	let td6;
    	let t25;
    	let td7;

    	let t26_value = (/*selected*/ ctx[0]
    	? isNaN(/*selected*/ ctx[0]["von"])
    		? 'No disponible'
    		: `US$ ${/*selected*/ ctx[0]["von"]}`
    	: '[waiting...]') + "";

    	let t26;
    	let t27;
    	let td8;

    	let t28_value = (/*selected*/ ctx[0]
    	? isNaN(format(Math.round(/*selected*/ ctx[0]["von"] * /*price_dollar*/ ctx[1])))
    		? 'No disponible'
    		: `$ ${format(Math.round(/*selected*/ ctx[0]["von"] * /*price_dollar*/ ctx[1]))}`
    	: '[waiting...]') + "";

    	let t28;
    	let t29;
    	let tr4;
    	let td9;
    	let t31;
    	let td10;

    	let t32_value = (/*selected*/ ctx[0]
    	? isNaN(/*selected*/ ctx[0]["voi"])
    		? 'No disponible'
    		: `US$ ${/*selected*/ ctx[0]["voi"]}`
    	: '[waiting...]') + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (/*selected*/ ctx[0]
    	? isNaN(format(Math.round(/*selected*/ ctx[0]["voi"] * /*price_dollar*/ ctx[1])))
    		? 'No disponible'
    		: `$ ${format(Math.round(/*selected*/ ctx[0]["voi"] * /*price_dollar*/ ctx[1]))}`
    	: '[waiting...]') + "";

    	let t34;
    	let mounted;
    	let dispose;
    	let each_value = View1$1;
    	validate_each_argument(each_value);
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
    			add_location(h2, file$5, 24, 1, 463);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$5, 26, 4, 575);
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$5, 28, 6, 749);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$5, 36, 95, 1293);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$5, 36, 6, 1204);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$5, 35, 4, 1100);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$5, 27, 6, 720);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$5, 25, 4, 523);
    			attr_dev(th0, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$5, 43, 6, 1480);
    			attr_dev(th1, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$5, 44, 6, 1606);
    			attr_dev(th2, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$5, 45, 6, 1724);
    			add_location(tr0, file$5, 42, 4, 1469);
    			add_location(thead, file$5, 41, 2, 1457);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$5, 50, 6, 1906);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$5, 51, 6, 1971);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$5, 52, 6, 2109);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$5, 49, 4, 1878);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$5, 55, 6, 2354);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$5, 56, 6, 2413);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$5, 57, 6, 2549);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$5, 54, 4, 2323);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$5, 60, 6, 2789);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$5, 61, 6, 2855);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$5, 62, 6, 2993);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$5, 59, 4, 2761);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$5, 65, 6, 3238);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$5, 66, 6, 3312);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$5, 67, 6, 3450);
    			attr_dev(tr4, "class", "bg-gray-100");
    			add_location(tr4, file$5, 64, 4, 3207);
    			add_location(tbody, file$5, 48, 2, 1866);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$5, 40, 0, 1415);
    			attr_dev(div3, "class", "w-2/3 mt-20");
    			add_location(div3, file$5, 23, 2, 436);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$5, 22, 0, 362);
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

    			select_option(select, /*selected*/ ctx[0]);
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

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*View1*/ 0) {
    				each_value = View1$1;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty & /*selected, View1*/ 1) {
    				select_option(select, /*selected*/ ctx[0]);
    			}

    			if (dirty & /*selected*/ 1 && t14_value !== (t14_value = (/*selected*/ ctx[0]
    			? isNaN(/*selected*/ ctx[0]["vct"])
    				? 'No disponible'
    				: `US$ ${/*selected*/ ctx[0]["vct"]}`
    			: '[waiting...]') + "")) set_data_dev(t14, t14_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t16_value !== (t16_value = (/*selected*/ ctx[0]
    			? isNaN(format(Math.round(/*selected*/ ctx[0]["vct"] * /*price_dollar*/ ctx[1])))
    				? 'No disponible'
    				: `$ ${format(Math.round(/*selected*/ ctx[0]["vct"] * /*price_dollar*/ ctx[1]))}`
    			: '[waiting...]') + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*selected*/ 1 && t20_value !== (t20_value = (/*selected*/ ctx[0]
    			? isNaN(/*selected*/ ctx[0]["vo"])
    				? 'No disponible'
    				: `US$ ${/*selected*/ ctx[0]["vo"]}`
    			: '[waiting...]') + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t22_value !== (t22_value = (/*selected*/ ctx[0]
    			? isNaN(format(Math.round(/*selected*/ ctx[0]["vo"] * /*price_dollar*/ ctx[1])))
    				? 'No disponible'
    				: `$ ${format(Math.round(/*selected*/ ctx[0]["vo"] * /*price_dollar*/ ctx[1]))}`
    			: '[waiting...]') + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*selected*/ 1 && t26_value !== (t26_value = (/*selected*/ ctx[0]
    			? isNaN(/*selected*/ ctx[0]["von"])
    				? 'No disponible'
    				: `US$ ${/*selected*/ ctx[0]["von"]}`
    			: '[waiting...]') + "")) set_data_dev(t26, t26_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t28_value !== (t28_value = (/*selected*/ ctx[0]
    			? isNaN(format(Math.round(/*selected*/ ctx[0]["von"] * /*price_dollar*/ ctx[1])))
    				? 'No disponible'
    				: `$ ${format(Math.round(/*selected*/ ctx[0]["von"] * /*price_dollar*/ ctx[1]))}`
    			: '[waiting...]') + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*selected*/ 1 && t32_value !== (t32_value = (/*selected*/ ctx[0]
    			? isNaN(/*selected*/ ctx[0]["voi"])
    				? 'No disponible'
    				: `US$ ${/*selected*/ ctx[0]["voi"]}`
    			: '[waiting...]') + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t34_value !== (t34_value = (/*selected*/ ctx[0]
    			? isNaN(format(Math.round(/*selected*/ ctx[0]["voi"] * /*price_dollar*/ ctx[1])))
    				? 'No disponible'
    				: `$ ${format(Math.round(/*selected*/ ctx[0]["voi"] * /*price_dollar*/ ctx[1]))}`
    			: '[waiting...]') + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Vc', slots, []);
    	let selected;
    	let price_dollar;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(1, price_dollar = data.dolar.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Vc> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    	}

    	$$self.$capture_state = () => ({
    		View1: View1$1,
    		format,
    		onMount,
    		selected,
    		price_dollar
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('price_dollar' in $$props) $$invalidate(1, price_dollar = $$props.price_dollar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, price_dollar, select_change_handler];
    }

    class Vc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vc",
    			options,
    			id: create_fragment$7.name
    		});
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

    /* src/pages/Pt.svelte generated by Svelte v3.55.1 */
    const file$6 = "src/pages/Pt.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (31:7) {#each View1 as data1}
    function create_each_block$3(ctx) {
    	let option;
    	let t0_value = /*data1*/ ctx[3]["country"] + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*data1*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$6, 31, 7, 1011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(31:7) {#each View1 as data1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div4;
    	let div3;
    	let h2;
    	let t1;
    	let div2;
    	let label;
    	let t3;
    	let div1;
    	let select;
    	let t4;
    	let div0;
    	let svg;
    	let path;
    	let t5;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t7;
    	let th1;
    	let t9;
    	let th2;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t14;

    	let t15_value = (/*selected*/ ctx[0]
    	? /*selected*/ ctx[0]["tt"]
    	: '[waiting...]') + "";

    	let t15;
    	let t16;
    	let td2;
    	let t17;

    	let t18_value = (/*selected*/ ctx[0]
    	? format(Math.round(/*selected*/ ctx[0]["tt"] * /*price_dollar*/ ctx[1]))
    	: '[waiting...]') + "";

    	let t18;
    	let t19;
    	let tr2;
    	let td3;
    	let t21;
    	let td4;
    	let t22;

    	let t23_value = (/*selected*/ ctx[0]
    	? /*selected*/ ctx[0]["ptt"]
    	: '[waiting...]') + "";

    	let t23;
    	let t24;
    	let td5;
    	let t25;

    	let t26_value = (/*selected*/ ctx[0]
    	? format(Math.round(/*selected*/ ctx[0]["ptt"] * /*price_dollar*/ ctx[1]))
    	: '[waiting...]') + "";

    	let t26;
    	let t27;
    	let tr3;
    	let td6;
    	let t29;
    	let td7;
    	let t30;

    	let t31_value = (/*selected*/ ctx[0]
    	? /*selected*/ ctx[0]["tvt"]
    	: '[waiting...]') + "";

    	let t31;
    	let t32;
    	let td8;
    	let t33;

    	let t34_value = (/*selected*/ ctx[0]
    	? format(Math.round(/*selected*/ ctx[0]["tvt"] * /*price_dollar*/ ctx[1]))
    	: '[waiting...]') + "";

    	let t34;
    	let t35;
    	let tr4;
    	let td9;
    	let t37;
    	let td10;
    	let t38;

    	let t39_value = (/*selected*/ ctx[0]
    	? /*selected*/ ctx[0]["tt10"]
    	: '[waiting...]') + "";

    	let t39;
    	let t40;
    	let td11;
    	let t41;

    	let t42_value = (/*selected*/ ctx[0]
    	? format(Math.round(/*selected*/ ctx[0]["tt10"] * /*price_dollar*/ ctx[1]))
    	: '[waiting...]') + "";

    	let t42;
    	let mounted;
    	let dispose;
    	let each_value = View1$2;
    	validate_each_argument(each_value);
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
    			add_location(h2, file$6, 25, 1, 464);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$6, 27, 4, 586);
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$6, 29, 6, 760);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$6, 37, 95, 1304);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$6, 37, 6, 1215);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$6, 36, 4, 1111);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$6, 28, 6, 731);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$6, 26, 4, 534);
    			attr_dev(th0, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$6, 44, 6, 1491);
    			attr_dev(th1, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$6, 45, 6, 1617);
    			attr_dev(th2, "class", "w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$6, 46, 6, 1735);
    			add_location(tr0, file$6, 43, 4, 1480);
    			add_location(thead, file$6, 42, 2, 1468);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$6, 51, 6, 1917);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$6, 52, 6, 1973);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$6, 53, 6, 2062);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$6, 50, 4, 1889);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$6, 56, 6, 2223);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$6, 57, 6, 2280);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$6, 58, 6, 2370);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$6, 55, 4, 2192);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$6, 61, 6, 2529);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$6, 62, 6, 2593);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$6, 63, 6, 2683);
    			attr_dev(tr3, "class", "bg-white");
    			add_location(tr3, file$6, 60, 4, 2501);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$6, 66, 6, 2845);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$6, 67, 6, 2909);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$6, 68, 6, 3000);
    			attr_dev(tr4, "class", "bg-gray-100");
    			add_location(tr4, file$6, 65, 4, 2814);
    			add_location(tbody, file$6, 49, 2, 1877);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$6, 41, 0, 1426);
    			attr_dev(div3, "class", "w-2/3 mt-20");
    			add_location(div3, file$6, 24, 2, 437);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$6, 23, 0, 363);
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

    			select_option(select, /*selected*/ ctx[0]);
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

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*View1*/ 0) {
    				each_value = View1$2;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty & /*selected, View1*/ 1) {
    				select_option(select, /*selected*/ ctx[0]);
    			}

    			if (dirty & /*selected*/ 1 && t15_value !== (t15_value = (/*selected*/ ctx[0]
    			? /*selected*/ ctx[0]["tt"]
    			: '[waiting...]') + "")) set_data_dev(t15, t15_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t18_value !== (t18_value = (/*selected*/ ctx[0]
    			? format(Math.round(/*selected*/ ctx[0]["tt"] * /*price_dollar*/ ctx[1]))
    			: '[waiting...]') + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*selected*/ 1 && t23_value !== (t23_value = (/*selected*/ ctx[0]
    			? /*selected*/ ctx[0]["ptt"]
    			: '[waiting...]') + "")) set_data_dev(t23, t23_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t26_value !== (t26_value = (/*selected*/ ctx[0]
    			? format(Math.round(/*selected*/ ctx[0]["ptt"] * /*price_dollar*/ ctx[1]))
    			: '[waiting...]') + "")) set_data_dev(t26, t26_value);

    			if (dirty & /*selected*/ 1 && t31_value !== (t31_value = (/*selected*/ ctx[0]
    			? /*selected*/ ctx[0]["tvt"]
    			: '[waiting...]') + "")) set_data_dev(t31, t31_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t34_value !== (t34_value = (/*selected*/ ctx[0]
    			? format(Math.round(/*selected*/ ctx[0]["tvt"] * /*price_dollar*/ ctx[1]))
    			: '[waiting...]') + "")) set_data_dev(t34, t34_value);

    			if (dirty & /*selected*/ 1 && t39_value !== (t39_value = (/*selected*/ ctx[0]
    			? /*selected*/ ctx[0]["tt10"]
    			: '[waiting...]') + "")) set_data_dev(t39, t39_value);

    			if (dirty & /*selected, price_dollar*/ 3 && t42_value !== (t42_value = (/*selected*/ ctx[0]
    			? format(Math.round(/*selected*/ ctx[0]["tt10"] * /*price_dollar*/ ctx[1]))
    			: '[waiting...]') + "")) set_data_dev(t42, t42_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Pt', slots, []);
    	let selected;
    	let price_dollar;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(1, price_dollar = data.dolar.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Pt> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    	}

    	$$self.$capture_state = () => ({
    		View1: View1$2,
    		format,
    		onMount,
    		selected,
    		price_dollar
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('price_dollar' in $$props) $$invalidate(1, price_dollar = $$props.price_dollar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, price_dollar, select_change_handler];
    }

    class Pt extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pt",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/components/S1.svelte generated by Svelte v3.55.1 */
    const file$7 = "src/components/S1.svelte";

    function create_fragment$9(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(2 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$7, 17, 6, 301);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$7, 18, 6, 417);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$7, 19, 6, 532);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$7, 20, 6, 666);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$7, 21, 6, 789);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$7, 22, 6, 936);
    			add_location(tr0, file$7, 16, 4, 290);
    			add_location(thead, file$7, 15, 2, 278);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$7, 27, 6, 1129);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$7, 28, 6, 1177);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$7, 29, 6, 1233);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$7, 30, 6, 1369);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$7, 31, 6, 1505);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$7, 32, 6, 1638);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$7, 26, 4, 1101);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$7, 35, 6, 1812);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$7, 36, 6, 1860);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$7, 37, 6, 1918);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$7, 38, 6, 2054);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$7, 39, 6, 2189);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$7, 40, 6, 2322);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$7, 34, 4, 1781);
    			add_location(tbody, file$7, 25, 2, 1089);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$7, 14, 0, 236);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(2 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S1', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S1> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S1",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/S2.svelte generated by Svelte v3.55.1 */
    const file$8 = "src/components/S2.svelte";

    function create_fragment$a(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$8, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$8, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$8, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$8, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$8, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$8, 22, 6, 958);
    			add_location(tr0, file$8, 16, 4, 312);
    			add_location(thead, file$8, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$8, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$8, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$8, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$8, 30, 6, 1391);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$8, 31, 6, 1527);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$8, 32, 6, 1660);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$8, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$8, 35, 6, 1834);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$8, 36, 6, 1882);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$8, 37, 6, 1940);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$8, 38, 6, 2076);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$8, 39, 6, 2211);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$8, 40, 6, 2344);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$8, 34, 4, 1803);
    			add_location(tbody, file$8, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$8, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S2', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S2> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S2",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/S3.svelte generated by Svelte v3.55.1 */
    const file$9 = "src/components/S3.svelte";

    function create_fragment$b(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;
    	let t17;
    	let td3;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;
    	let t29;
    	let td9;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(2 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			td2.textContent = "Amonestación";
    			t17 = space();
    			td3 = element("td");
    			td3.textContent = "Amonestación";
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			td8.textContent = "Amonestación";
    			t29 = space();
    			td9 = element("td");
    			td9.textContent = "Amonestación";
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$9, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$9, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$9, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$9, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$9, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$9, 22, 6, 958);
    			add_location(tr0, file$9, 16, 4, 312);
    			add_location(thead, file$9, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$9, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$9, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$9, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$9, 30, 6, 1308);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$9, 31, 6, 1361);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$9, 32, 6, 1494);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$9, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$9, 35, 6, 1668);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$9, 36, 6, 1716);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$9, 37, 6, 1774);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$9, 38, 6, 1827);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$9, 39, 6, 1880);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$9, 40, 6, 2013);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$9, 34, 4, 1637);
    			add_location(tbody, file$9, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$9, 14, 0, 258);
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
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
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
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(2 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S3', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S3> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S3 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S3",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/S4.svelte generated by Svelte v3.55.1 */
    const file$a = "src/components/S4.svelte";

    function create_fragment$c(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(3.8 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$a, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$a, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$a, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$a, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$a, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$a, 22, 6, 958);
    			add_location(tr0, file$a, 16, 4, 312);
    			add_location(thead, file$a, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$a, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$a, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$a, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$a, 30, 6, 1391);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$a, 31, 6, 1527);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$a, 32, 6, 1662);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$a, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$a, 35, 6, 1836);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$a, 36, 6, 1884);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$a, 37, 6, 1942);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$a, 38, 6, 2078);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$a, 39, 6, 2213);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$a, 40, 6, 2348);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$a, 34, 4, 1805);
    			add_location(tbody, file$a, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$a, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(3.8 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S4', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S4> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S4 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S4",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/components/S5.svelte generated by Svelte v3.55.1 */
    const file$b = "src/components/S5.svelte";

    function create_fragment$d(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(3.8 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$b, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$b, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$b, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$b, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$b, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$b, 22, 6, 958);
    			add_location(tr0, file$b, 16, 4, 312);
    			add_location(thead, file$b, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$b, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$b, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$b, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$b, 30, 6, 1391);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$b, 31, 6, 1527);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$b, 32, 6, 1662);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$b, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$b, 35, 6, 1836);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$b, 36, 6, 1884);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$b, 37, 6, 1942);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$b, 38, 6, 2078);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$b, 39, 6, 2213);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$b, 40, 6, 2348);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$b, 34, 4, 1805);
    			add_location(tbody, file$b, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$b, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.38 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(3.8 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(2.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S5', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S5> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S5 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S5",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/S6.svelte generated by Svelte v3.55.1 */
    const file$c = "src/components/S6.svelte";

    function create_fragment$e(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(37.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$c, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$c, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$c, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$c, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$c, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$c, 22, 6, 958);
    			add_location(tr0, file$c, 16, 4, 312);
    			add_location(thead, file$c, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$c, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$c, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$c, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$c, 30, 6, 1388);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$c, 31, 6, 1523);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$c, 32, 6, 1657);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$c, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$c, 35, 6, 1832);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$c, 36, 6, 1880);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$c, 37, 6, 1938);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$c, 38, 6, 2071);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$c, 39, 6, 2205);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$c, 40, 6, 2339);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$c, 34, 4, 1801);
    			add_location(tbody, file$c, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$c, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(37.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(25 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S6', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S6> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S6 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S6",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/S7.svelte generated by Svelte v3.55.1 */
    const file$d = "src/components/S7.svelte";

    function create_fragment$f(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(20 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$d, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$d, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$d, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$d, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$d, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$d, 22, 6, 958);
    			add_location(tr0, file$d, 16, 4, 312);
    			add_location(thead, file$d, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$d, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$d, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$d, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$d, 30, 6, 1390);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$d, 31, 6, 1526);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$d, 32, 6, 1660);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$d, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$d, 35, 6, 1833);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$d, 36, 6, 1881);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$d, 37, 6, 1939);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$d, 38, 6, 2074);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$d, 39, 6, 2207);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$d, 40, 6, 2341);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$d, 34, 4, 1802);
    			add_location(tbody, file$d, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$d, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(20 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S7', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S7> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S7 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S7",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/S8.svelte generated by Svelte v3.55.1 */
    const file$e = "src/components/S8.svelte";

    function create_fragment$g(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(20 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(20 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(40 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$e, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$e, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$e, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$e, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$e, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$e, 22, 6, 958);
    			add_location(tr0, file$e, 16, 4, 312);
    			add_location(thead, file$e, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$e, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$e, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$e, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$e, 30, 6, 1388);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$e, 31, 6, 1523);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$e, 32, 6, 1657);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$e, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$e, 35, 6, 1830);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$e, 36, 6, 1878);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$e, 37, 6, 1936);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$e, 38, 6, 2069);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$e, 39, 6, 2203);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$e, 40, 6, 2337);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$e, 34, 4, 1799);
    			add_location(tbody, file$e, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$e, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(20 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(20 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(40 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S8', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S8> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S8 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S8",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/S9.svelte generated by Svelte v3.55.1 */
    const file$f = "src/components/S9.svelte";

    function create_fragment$h(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(22.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$f, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$f, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$f, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$f, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$f, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$f, 22, 6, 958);
    			add_location(tr0, file$f, 16, 4, 312);
    			add_location(thead, file$f, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$f, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$f, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$f, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$f, 30, 6, 1389);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$f, 31, 6, 1525);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$f, 32, 6, 1659);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$f, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$f, 35, 6, 1832);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$f, 36, 6, 1880);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$f, 37, 6, 1938);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$f, 38, 6, 2072);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$f, 39, 6, 2206);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$f, 40, 6, 2340);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$f, 34, 4, 1801);
    			add_location(tbody, file$f, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$f, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(22.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S9', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S9> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S9 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S9",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/S10.svelte generated by Svelte v3.55.1 */
    const file$g = "src/components/S10.svelte";

    function create_fragment$i(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(45 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(150 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(60 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(200 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$g, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$g, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$g, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$g, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$g, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$g, 22, 6, 958);
    			add_location(tr0, file$g, 16, 4, 312);
    			add_location(thead, file$g, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$g, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$g, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$g, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$g, 30, 6, 1389);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$g, 31, 6, 1523);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$g, 32, 6, 1658);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$g, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$g, 35, 6, 1832);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$g, 36, 6, 1880);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$g, 37, 6, 1938);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$g, 38, 6, 2072);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$g, 39, 6, 2206);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$g, 40, 6, 2341);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$g, 34, 4, 1801);
    			add_location(tbody, file$g, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$g, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(45 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(150 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(60 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(200 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S10', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S10> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S10 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S10",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/components/S11.svelte generated by Svelte v3.55.1 */
    const file$h = "src/components/S11.svelte";

    function create_fragment$j(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(22.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$h, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$h, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$h, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$h, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$h, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$h, 22, 6, 958);
    			add_location(tr0, file$h, 16, 4, 312);
    			add_location(thead, file$h, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$h, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$h, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$h, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$h, 30, 6, 1389);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$h, 31, 6, 1525);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$h, 32, 6, 1659);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$h, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$h, 35, 6, 1832);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$h, 36, 6, 1880);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$h, 37, 6, 1938);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$h, 38, 6, 2072);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$h, 39, 6, 2206);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$h, 40, 6, 2340);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$h, 34, 4, 1801);
    			add_location(tbody, file$h, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$h, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(22.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(15 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(30 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(50 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(100 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S11', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S11> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S11 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S11",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    /* src/components/S12.svelte generated by Svelte v3.55.1 */
    const file$i = "src/components/S12.svelte";

    function create_fragment$k(ctx) {
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let tbody;
    	let tr1;
    	let td0;
    	let t13;
    	let td1;
    	let t15;
    	let td2;

    	let t16_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t16;
    	let t17;
    	let td3;

    	let t18_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t18;
    	let t19;
    	let td4;

    	let t20_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t20;
    	let t21;
    	let td5;

    	let t22_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t22;
    	let t23;
    	let tr2;
    	let td6;
    	let t25;
    	let td7;
    	let t27;
    	let td8;

    	let t28_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t28;
    	let t29;
    	let td9;

    	let t30_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t30;
    	let t31;
    	let td10;

    	let t32_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t32;
    	let t33;
    	let td11;

    	let t34_value = (isNaN(/*price_utm*/ ctx[0])
    	? '...waiting'
    	: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "";

    	let t34;

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
    			th3.textContent = "Denuncia PDI";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Reincidencia presentación voluntaria";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Reincidencia denuncia PDI";
    			t11 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "Tramo 1";
    			t13 = space();
    			td1 = element("td");
    			td1.textContent = "Antes de 5 días";
    			t15 = space();
    			td2 = element("td");
    			t16 = text(t16_value);
    			t17 = space();
    			td3 = element("td");
    			t18 = text(t18_value);
    			t19 = space();
    			td4 = element("td");
    			t20 = text(t20_value);
    			t21 = space();
    			td5 = element("td");
    			t22 = text(t22_value);
    			t23 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "Tramo 2";
    			t25 = space();
    			td7 = element("td");
    			td7.textContent = "Despúes de 5 días";
    			t27 = space();
    			td8 = element("td");
    			t28 = text(t28_value);
    			t29 = space();
    			td9 = element("td");
    			t30 = text(t30_value);
    			t31 = space();
    			td10 = element("td");
    			t32 = text(t32_value);
    			t33 = space();
    			td11 = element("td");
    			t34 = text(t34_value);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$i, 17, 6, 323);
    			attr_dev(th1, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$i, 18, 6, 439);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$i, 19, 6, 554);
    			attr_dev(th3, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th3, file$i, 20, 6, 688);
    			attr_dev(th4, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th4, file$i, 21, 6, 811);
    			attr_dev(th5, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th5, file$i, 22, 6, 958);
    			add_location(tr0, file$i, 16, 4, 312);
    			add_location(thead, file$i, 15, 2, 300);
    			attr_dev(td0, "class", "border px-4 py-2");
    			add_location(td0, file$i, 27, 6, 1151);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$i, 28, 6, 1199);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$i, 29, 6, 1255);
    			attr_dev(td3, "class", "border px-4 py-2");
    			add_location(td3, file$i, 30, 6, 1390);
    			attr_dev(td4, "class", "border px-4 py-2");
    			add_location(td4, file$i, 31, 6, 1526);
    			attr_dev(td5, "class", "border px-4 py-2");
    			add_location(td5, file$i, 32, 6, 1659);
    			attr_dev(tr1, "class", "bg-white");
    			add_location(tr1, file$i, 26, 4, 1123);
    			attr_dev(td6, "class", "border px-4 py-2");
    			add_location(td6, file$i, 35, 6, 1833);
    			attr_dev(td7, "class", "border px-4 py-2");
    			add_location(td7, file$i, 36, 6, 1881);
    			attr_dev(td8, "class", "border px-4 py-2");
    			add_location(td8, file$i, 37, 6, 1939);
    			attr_dev(td9, "class", "border px-4 py-2");
    			add_location(td9, file$i, 38, 6, 2074);
    			attr_dev(td10, "class", "border px-4 py-2");
    			add_location(td10, file$i, 39, 6, 2207);
    			attr_dev(td11, "class", "border px-4 py-2");
    			add_location(td11, file$i, 40, 6, 2340);
    			attr_dev(tr2, "class", "bg-gray-100");
    			add_location(tr2, file$i, 34, 4, 1802);
    			add_location(tbody, file$i, 25, 2, 1111);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$i, 14, 0, 258);
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
    			append_dev(td2, t16);
    			append_dev(tr1, t17);
    			append_dev(tr1, td3);
    			append_dev(td3, t18);
    			append_dev(tr1, t19);
    			append_dev(tr1, td4);
    			append_dev(td4, t20);
    			append_dev(tr1, t21);
    			append_dev(tr1, td5);
    			append_dev(td5, t22);
    			append_dev(tbody, t23);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t25);
    			append_dev(tr2, td7);
    			append_dev(tr2, t27);
    			append_dev(tr2, td8);
    			append_dev(td8, t28);
    			append_dev(tr2, t29);
    			append_dev(tr2, td9);
    			append_dev(td9, t30);
    			append_dev(tr2, t31);
    			append_dev(tr2, td10);
    			append_dev(td10, t32);
    			append_dev(tr2, t33);
    			append_dev(tr2, td11);
    			append_dev(td11, t34);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*price_utm*/ 1 && t16_value !== (t16_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t16, t16_value);

    			if (dirty & /*price_utm*/ 1 && t18_value !== (t18_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.75 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*price_utm*/ 1 && t20_value !== (t20_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t20, t20_value);

    			if (dirty & /*price_utm*/ 1 && t22_value !== (t22_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(7.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t22, t22_value);

    			if (dirty & /*price_utm*/ 1 && t28_value !== (t28_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(0.5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t28, t28_value);

    			if (dirty & /*price_utm*/ 1 && t30_value !== (t30_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(1 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*price_utm*/ 1 && t32_value !== (t32_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(5 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t32, t32_value);

    			if (dirty & /*price_utm*/ 1 && t34_value !== (t34_value = (isNaN(/*price_utm*/ ctx[0])
    			? '...waiting'
    			: '$ ' + Math.round(10 * /*price_utm*/ ctx[0]).toLocaleString('es-CL')) + "")) set_data_dev(t34, t34_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('S12', slots, []);
    	let price_utm;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_utm = data.utm.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<S12> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount, price_utm });

    	$$self.$inject_state = $$props => {
    		if ('price_utm' in $$props) $$invalidate(0, price_utm = $$props.price_utm);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_utm];
    }

    class S12 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "S12",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* src/pages/Ss.svelte generated by Svelte v3.55.1 */
    const file$j = "src/pages/Ss.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (45:7) {#each questions as data1}
    function create_each_block$4(ctx) {
    	let option;
    	let t0_value = /*data1*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t0 = text(t0_value);
    			t1 = space();
    			option.__value = option_value_value = /*data1*/ ctx[3];
    			option.value = option.__value;
    			add_location(option, file$j, 45, 7, 2264);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t0);
    			append_dev(option, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(45:7) {#each questions as data1}",
    		ctx
    	});

    	return block;
    }

    // (56:2) {#if selected}
    function create_if_block$3(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	const if_block_creators = [
    		create_if_block_1$1,
    		create_if_block_2$1,
    		create_if_block_3$1,
    		create_if_block_4$1,
    		create_if_block_5$1,
    		create_if_block_6,
    		create_if_block_7,
    		create_if_block_8,
    		create_if_block_9,
    		create_if_block_10,
    		create_if_block_11,
    		create_if_block_12
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selected*/ ctx[0].path == "rsi") return 0;
    		if (/*selected*/ ctx[0].path == "exr") return 1;
    		if (/*selected*/ ctx[0].path == "cdn") return 2;
    		if (/*selected*/ ctx[0].path == "rsa") return 3;
    		if (/*selected*/ ctx[0].path == "tzf") return 4;
    		if (/*selected*/ ctx[0].path == "scm") return 5;
    		if (/*selected*/ ctx[0].path == "ex1") return 6;
    		if (/*selected*/ ctx[0].path == "ex2") return 7;
    		if (/*selected*/ ctx[0].path == "ex3") return 8;
    		if (/*selected*/ ctx[0].path == "ex4") return 9;
    		if (/*selected*/ ctx[0].path == "asa") return 10;
    		if (/*selected*/ ctx[0].path == "qre") return 11;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

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
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(56:2) {#if selected}",
    		ctx
    	});

    	return block;
    }

    // (79:35) 
    function create_if_block_12(ctx) {
    	let s12;
    	let current;
    	s12 = new S12({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s12.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s12, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s12.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s12.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s12, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_12.name,
    		type: "if",
    		source: "(79:35) ",
    		ctx
    	});

    	return block;
    }

    // (77:35) 
    function create_if_block_11(ctx) {
    	let s11;
    	let current;
    	s11 = new S11({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s11.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s11, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s11.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s11.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s11, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_11.name,
    		type: "if",
    		source: "(77:35) ",
    		ctx
    	});

    	return block;
    }

    // (75:35) 
    function create_if_block_10(ctx) {
    	let s10;
    	let current;
    	s10 = new S10({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s10.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s10, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s10.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s10.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s10, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_10.name,
    		type: "if",
    		source: "(75:35) ",
    		ctx
    	});

    	return block;
    }

    // (73:35) 
    function create_if_block_9(ctx) {
    	let s9;
    	let current;
    	s9 = new S9({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s9.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s9, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s9.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s9.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s9, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_9.name,
    		type: "if",
    		source: "(73:35) ",
    		ctx
    	});

    	return block;
    }

    // (71:35) 
    function create_if_block_8(ctx) {
    	let s8;
    	let current;
    	s8 = new S8({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s8.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s8, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s8.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s8.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s8, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(71:35) ",
    		ctx
    	});

    	return block;
    }

    // (69:35) 
    function create_if_block_7(ctx) {
    	let s7;
    	let current;
    	s7 = new S7({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s7.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s7, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s7.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s7.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s7, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(69:35) ",
    		ctx
    	});

    	return block;
    }

    // (67:35) 
    function create_if_block_6(ctx) {
    	let s6;
    	let current;
    	s6 = new S6({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s6.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s6, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s6.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s6.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(67:35) ",
    		ctx
    	});

    	return block;
    }

    // (65:35) 
    function create_if_block_5$1(ctx) {
    	let s5;
    	let current;
    	s5 = new S5({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(s5, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(s5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(s5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(s5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5$1.name,
    		type: "if",
    		source: "(65:35) ",
    		ctx
    	});

    	return block;
    }

    // (63:35) 
    function create_if_block_4$1(ctx) {
    	let s4;
    	let current;
    	s4 = new S4({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s4.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(63:35) ",
    		ctx
    	});

    	return block;
    }

    // (61:35) 
    function create_if_block_3$1(ctx) {
    	let s3;
    	let current;
    	s3 = new S3({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s3.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(61:35) ",
    		ctx
    	});

    	return block;
    }

    // (59:35) 
    function create_if_block_2$1(ctx) {
    	let s2;
    	let current;
    	s2 = new S2({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s2.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(59:35) ",
    		ctx
    	});

    	return block;
    }

    // (57:4) {#if selected.path=="rsi"}
    function create_if_block_1$1(ctx) {
    	let s1;
    	let current;
    	s1 = new S1({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(s1.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(57:4) {#if selected.path==\\\"rsi\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let div4;
    	let div3;
    	let h2;
    	let t1;
    	let div2;
    	let label;
    	let t3;
    	let div1;
    	let select;
    	let t4;
    	let div0;
    	let svg;
    	let path;
    	let t5;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*questions*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let if_block = /*selected*/ ctx[0] && create_if_block$3(ctx);

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
    			add_location(h2, file$j, 38, 1, 1690);
    			attr_dev(label, "class", "block uppercase tracking-wide text-white text-xs font-bold mb-2");
    			attr_dev(label, "for", "contryselection");
    			add_location(label, file$j, 41, 4, 1838);
    			attr_dev(select, "class", "block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm");
    			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$j, 43, 6, 2009);
    			attr_dev(path, "d", "M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z");
    			add_location(path, file$j, 51, 95, 2551);
    			attr_dev(svg, "class", "fill-current h-4 w-4");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$j, 51, 6, 2462);
    			attr_dev(div0, "class", "pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700");
    			add_location(div0, file$j, 50, 4, 2358);
    			attr_dev(div1, "class", "relative");
    			add_location(div1, file$j, 42, 6, 1980);
    			attr_dev(div2, "class", "inline-block relative w-full mt-4");
    			add_location(div2, file$j, 40, 0, 1786);
    			attr_dev(div3, "class", "w-4/5");
    			add_location(div3, file$j, 37, 2, 1669);
    			attr_dev(div4, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div4, file$j, 36, 0, 1595);
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

    			select_option(select, /*selected*/ ctx[0]);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path);
    			append_dev(div3, t5);
    			if (if_block) if_block.m(div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*questions*/ 2) {
    				each_value = /*questions*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty & /*selected, questions*/ 3) {
    				select_option(select, /*selected*/ ctx[0]);
    			}

    			if (/*selected*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*selected*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
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
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Ss', slots, []);
    	let selected;

    	let questions = [
    		{
    			path: 'rsi',
    			name: `Retraso en solicitar cédula de identidad`
    		},
    		{
    			path: 'exr',
    			name: `Quedarse en Chile con el permiso de residencia o permanencia expirado por 180 días o menos`
    		},
    		{
    			path: 'cdn',
    			name: `Incumplimiento de la obligación de informar cambio de domicilio.`
    		},
    		{
    			path: 'rsa',
    			name: `Desarrollo de actividades remuneradas sin autorización`
    		},
    		{
    			path: 'tzf',
    			name: `Transgresión de la Zona Fronteriza`
    		},
    		{
    			path: 'scm',
    			name: `Salir del país sin realizar control migratorio`
    		},
    		{
    			path: 'ex1',
    			name: `Empleo de extranjeros sin autorización: Micro empresa`
    		},
    		{
    			path: 'ex2',
    			name: `Empleo de extranjeros sin autorización: Pequeña empresa`
    		},
    		{
    			path: 'ex3',
    			name: `Empleo de extranjeros sin autorización: Mediana empresa`
    		},
    		{
    			path: 'ex4',
    			name: `Empleo de extranjeros sin autorización: Gran empresa`
    		},
    		{
    			path: 'asa',
    			name: `Arrendamiento o subarrendamiento abusivo`
    		},
    		{
    			path: 'qre',
    			name: `Quedarse en Chile con el permiso de residencia o permanencia expirado por 180 días o más`
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Ss> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		selected = select_value(this);
    		$$invalidate(0, selected);
    		$$invalidate(1, questions);
    	}

    	$$self.$capture_state = () => ({
    		S1,
    		S2,
    		S3,
    		S4,
    		S5,
    		S6,
    		S7,
    		S8,
    		S9,
    		S10,
    		S11,
    		S12,
    		selected,
    		questions
    	});

    	$$self.$inject_state = $$props => {
    		if ('selected' in $$props) $$invalidate(0, selected = $$props.selected);
    		if ('questions' in $$props) $$invalidate(1, questions = $$props.questions);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selected, questions, select_change_handler];
    }

    class Ss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ss",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    var View5 = [
    	{
    		tramite: "Residencia Definitiva",
    		clp: 105713
    	},
    	{
    		tramite: "Opción de nacionalidad",
    		clp: 29436
    	},
    	{
    		tramite: "Nacionalidad general",
    		clp: 29436
    	},
    	{
    		tramite: "Nacionalidad por vínculo con chileno (esposo/a por ley vivo o muerto hijo/a chileno/a)",
    		clp: 5887
    	}
    ];

    /* src/pages/Nc.svelte generated by Svelte v3.55.1 */
    const file$k = "src/pages/Nc.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (23:4) {#each View5 as dss}
    function create_each_block$5(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*dss*/ ctx[0].tramite + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2;

    	let t3_value = (/*dss*/ ctx[0]
    	? format(Math.round(/*dss*/ ctx[0].clp))
    	: '[waiting...]') + "";

    	let t3;
    	let t4;

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
    			add_location(td0, file$k, 24, 6, 714);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$k, 25, 6, 768);
    			attr_dev(tr, "class", "bg-white");
    			add_location(tr, file$k, 23, 4, 686);
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
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(23:4) {#each View5 as dss}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let div2;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let t2;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t4;
    	let th1;
    	let t6;
    	let tbody;
    	let each_value = View5;
    	validate_each_argument(each_value);
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

    			add_location(h2, file$k, 11, 2, 225);
    			attr_dev(div0, "class", "inline-block relative w-full mt-4");
    			add_location(div0, file$k, 12, 4, 267);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$k, 17, 6, 389);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$k, 18, 6, 507);
    			add_location(tr, file$k, 16, 4, 378);
    			add_location(thead, file$k, 15, 2, 366);
    			add_location(tbody, file$k, 21, 2, 649);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$k, 14, 0, 324);
    			attr_dev(div1, "class", "w-2/3 mt-20");
    			add_location(div1, file$k, 10, 2, 197);
    			attr_dev(div2, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div2, file$k, 9, 0, 123);
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
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*View5, format, Math*/ 0) {
    				each_value = View5;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nc', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nc> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ View5, format });
    	return [];
    }

    class Nc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nc",
    			options,
    			id: create_fragment$m.name
    		});
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

    /* src/pages/Rc.svelte generated by Svelte v3.55.1 */
    const file$l = "src/pages/Rc.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (36:4) {#each View5 as dss}
    function create_each_block$6(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*dss*/ ctx[1].tramite + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2;
    	let t3_value = (/*dss*/ ctx[1] ? /*dss*/ ctx[1].usd : '[waiting...]') + "";
    	let t3;
    	let t4;
    	let td2;
    	let t5;

    	let t6_value = (/*dss*/ ctx[1]
    	? format(Math.round(/*dss*/ ctx[1].usd * /*price_dollar*/ ctx[0]))
    	: '[waiting...]') + "";

    	let t6;
    	let t7;

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
    			add_location(td0, file$l, 37, 6, 1084);
    			attr_dev(td1, "class", "border px-4 py-2");
    			add_location(td1, file$l, 38, 6, 1138);
    			attr_dev(td2, "class", "border px-4 py-2");
    			add_location(td2, file$l, 39, 6, 1215);
    			attr_dev(tr, "class", "bg-white");
    			add_location(tr, file$l, 36, 4, 1056);
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
    		p: function update(ctx, dirty) {
    			if (dirty & /*price_dollar*/ 1 && t6_value !== (t6_value = (/*dss*/ ctx[1]
    			? format(Math.round(/*dss*/ ctx[1].usd * /*price_dollar*/ ctx[0]))
    			: '[waiting...]') + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(36:4) {#each View5 as dss}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let div2;
    	let div1;
    	let h2;
    	let t1;
    	let div0;
    	let t2;
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t4;
    	let th1;
    	let t6;
    	let th2;
    	let t8;
    	let tbody;
    	let each_value = View5$1;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
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

    			add_location(h2, file$l, 23, 2, 450);
    			attr_dev(div0, "class", "inline-block relative w-full mt-4");
    			add_location(div0, file$l, 24, 4, 519);
    			attr_dev(th0, "class", "w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th0, file$l, 29, 6, 641);
    			attr_dev(th1, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th1, file$l, 30, 6, 759);
    			attr_dev(th2, "class", "w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2");
    			add_location(th2, file$l, 31, 6, 877);
    			add_location(tr, file$l, 28, 4, 630);
    			add_location(thead, file$l, 27, 2, 618);
    			add_location(tbody, file$l, 34, 2, 1019);
    			attr_dev(table, "class", "table-fixed my-6 w-full");
    			add_location(table, file$l, 26, 0, 576);
    			attr_dev(div1, "class", "w-2/3 mt-20");
    			add_location(div1, file$l, 22, 2, 422);
    			attr_dev(div2, "class", "container mx-auto h-full flex justify-center items-center");
    			add_location(div2, file$l, 21, 0, 348);
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
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*View5, format, Math, price_dollar*/ 1) {
    				each_value = View5$1;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$n($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Rc', slots, []);
    	let price_dollar;

    	onMount(async () => {
    		await fetch(`https://mindicador.cl/api`).then(r => r.json()).then(data => {
    			$$invalidate(0, price_dollar = data.dolar.valor);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Rc> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ View5: View5$1, format, onMount, price_dollar });

    	$$self.$inject_state = $$props => {
    		if ('price_dollar' in $$props) $$invalidate(0, price_dollar = $$props.price_dollar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [price_dollar];
    }

    class Rc extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Rc",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.55.1 */

    // (20:0) <Router>
    function create_default_slot$1(ctx) {
    	let route0;
    	let t0;
    	let route1;
    	let t1;
    	let route2;
    	let t2;
    	let route3;
    	let t3;
    	let route4;
    	let t4;
    	let route5;
    	let t5;
    	let route6;
    	let current;

    	route0 = new Route({
    			props: { exact: true, path: "/", component: Home },
    			$$inline: true
    		});

    	route1 = new Route({
    			props: { exact: true, path: "/vs", component: Vs },
    			$$inline: true
    		});

    	route2 = new Route({
    			props: { exact: true, path: "/vc", component: Vc },
    			$$inline: true
    		});

    	route3 = new Route({
    			props: { exact: true, path: "/pt", component: Pt },
    			$$inline: true
    		});

    	route4 = new Route({
    			props: { exact: true, path: "/ss", component: Ss },
    			$$inline: true
    		});

    	route5 = new Route({
    			props: { exact: true, path: "/nc", component: Nc },
    			$$inline: true
    		});

    	route6 = new Route({
    			props: { exact: true, path: "/rc", component: Rc },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    			t5 = space();
    			create_component(route6.$$.fragment);
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
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(route6, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(20:0) <Router>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$o(ctx) {
    	let nav;
    	let t;
    	let router;
    	let current;
    	nav = new Nav({ $$inline: true });

    	router = new Router({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(nav.$$.fragment);
    			t = space();
    			create_component(router.$$.fragment);
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
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				router_changes.$$scope = { dirty, ctx };
    			}

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
    			if (detaching) detach_dev(t);
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$o.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$o($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		Link,
    		Modal,
    		Nav,
    		Home,
    		Vs,
    		Vc,
    		Pt,
    		Ss,
    		Nc,
    		Rc
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$o.name
    		});
    	}
    }

    document.addEventListener('DOMContentLoaded', () => {
      new App({
        target: document.body
      });
    });

}());
//# sourceMappingURL=main.js.map
