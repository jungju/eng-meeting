
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
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
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value == null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
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
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
            flush_render_callbacks($$.after_update);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
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

    /* src/App.svelte generated by Svelte v3.59.2 */

    const { Object: Object_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[30] = list[i][0];
    	child_ctx[31] = list[i][1];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[34] = list[i];
    	child_ctx[36] = i;
    	return child_ctx;
    }

    // (52:4) {#if left}
    function create_if_block_2(ctx) {
    	let div1;
    	let div0;

    	let t0_value = (/*conv*/ ctx[0][/*idx*/ ctx[1]]
    	? /*persons*/ ctx[4][/*conv*/ ctx[0][/*idx*/ ctx[1]].speaker].name
    	: '') + "";

    	let t0;
    	let t1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			attr_dev(div0, "class", "speaker-name-overlay svelte-1hjstv4");
    			add_location(div0, file, 53, 8, 1855);

    			if (!src_url_equal(img.src, img_src_value = /*conv*/ ctx[0][/*idx*/ ctx[1]]
    			? `./meet1/${/*conv*/ ctx[0][/*idx*/ ctx[1]].speaker}.webp`
    			: 'ready.webp')) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "alt", "Speaker Image");
    			attr_dev(img, "onerror", "this.src='ready.webp'");
    			attr_dev(img, "class", "svelte-1hjstv4");
    			add_location(img, file, 56, 8, 1974);
    			attr_dev(div1, "class", "left-panel svelte-1hjstv4");
    			add_location(div1, file, 52, 6, 1822);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*conv, idx, persons*/ 19 && t0_value !== (t0_value = (/*conv*/ ctx[0][/*idx*/ ctx[1]]
    			? /*persons*/ ctx[4][/*conv*/ ctx[0][/*idx*/ ctx[1]].speaker].name
    			: '') + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*conv, idx*/ 3 && !src_url_equal(img.src, img_src_value = /*conv*/ ctx[0][/*idx*/ ctx[1]]
    			? `./meet1/${/*conv*/ ctx[0][/*idx*/ ctx[1]].speaker}.webp`
    			: 'ready.webp')) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(52:4) {#if left}",
    		ctx
    	});

    	return block;
    }

    // (67:10) {#if showKorean}
    function create_if_block_1(ctx) {
    	let div;
    	let t_value = /*s*/ ctx[34].korean + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "korean-text svelte-1hjstv4");
    			set_style(div, "font-size", /*txtSize*/ ctx[10]);
    			add_location(div, file, 67, 12, 2561);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*conv*/ 1 && t_value !== (t_value = /*s*/ ctx[34].korean + "")) set_data_dev(t, t_value);

    			if (dirty[0] & /*txtSize*/ 1024) {
    				set_style(div, "font-size", /*txtSize*/ ctx[10]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(67:10) {#if showKorean}",
    		ctx
    	});

    	return block;
    }

    // (61:6) {#each conv as s, i}
    function create_each_block_1(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*persons*/ ctx[4][/*s*/ ctx[34].speaker]?.name + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;

    	let raw_value = (/*i*/ ctx[36] === /*idx*/ ctx[1]
    	? /*hl*/ ctx[12]
    	: /*s*/ ctx[34].text) + "";

    	let t3;
    	let t4;
    	let div2_class_value;
    	let mounted;
    	let dispose;
    	let if_block = /*showKorean*/ ctx[11] && create_if_block_1(ctx);

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[18](/*i*/ ctx[36]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			attr_dev(div0, "class", "speaker-name svelte-1hjstv4");
    			add_location(div0, file, 62, 10, 2335);
    			attr_dev(div1, "class", "dialogue-text svelte-1hjstv4");
    			set_style(div1, "font-size", /*txtSize*/ ctx[10]);
    			add_location(div1, file, 63, 10, 2405);
    			attr_dev(div2, "class", div2_class_value = "segment " + (/*i*/ ctx[36] === /*idx*/ ctx[1] ? 'active' : '') + " svelte-1hjstv4");
    			add_location(div2, file, 61, 8, 2227);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			div1.innerHTML = raw_value;
    			append_dev(div2, t3);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t4);

    			if (!mounted) {
    				dispose = listen_dev(div2, "click", click_handler_1, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*persons, conv*/ 17 && t0_value !== (t0_value = /*persons*/ ctx[4][/*s*/ ctx[34].speaker]?.name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*idx, hl, conv*/ 4099 && raw_value !== (raw_value = (/*i*/ ctx[36] === /*idx*/ ctx[1]
    			? /*hl*/ ctx[12]
    			: /*s*/ ctx[34].text) + "")) div1.innerHTML = raw_value;
    			if (dirty[0] & /*txtSize*/ 1024) {
    				set_style(div1, "font-size", /*txtSize*/ ctx[10]);
    			}

    			if (/*showKorean*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div2, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*idx*/ 2 && div2_class_value !== (div2_class_value = "segment " + (/*i*/ ctx[36] === /*idx*/ ctx[1] ? 'active' : '') + " svelte-1hjstv4")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(61:6) {#each conv as s, i}",
    		ctx
    	});

    	return block;
    }

    // (98:2) {#if sett}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t1;
    	let h3;
    	let t3;
    	let h4;
    	let t5;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = Object.entries(/*persons*/ ctx[4]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			h3 = element("h3");
    			h3.textContent = "설정";
    			t3 = space();
    			h4 = element("h4");
    			h4.textContent = "대화자 옵션";
    			t5 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "close-button svelte-1hjstv4");
    			add_location(span, file, 100, 8, 3883);
    			add_location(h3, file, 101, 8, 3963);
    			add_location(h4, file, 102, 8, 3983);
    			attr_dev(ul, "class", "option-list svelte-1hjstv4");
    			add_location(ul, file, 103, 8, 4007);
    			attr_dev(div0, "class", "modal-content svelte-1hjstv4");
    			add_location(div0, file, 99, 6, 3822);
    			attr_dev(div1, "class", "modal svelte-1hjstv4");
    			add_location(div1, file, 98, 4, 3766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div0, t1);
    			append_dev(div0, h3);
    			append_dev(div0, t3);
    			append_dev(div0, h4);
    			append_dev(div0, t5);
    			append_dev(div0, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(ul, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(span, "click", /*click_handler_10*/ ctx[27], false, false, false, false),
    					listen_dev(div0, "click", stop_propagation(/*click_handler*/ ctx[17]), false, false, true, false),
    					listen_dev(div1, "click", /*click_handler_11*/ ctx[29], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*persons, toggleSpeaker*/ 16400) {
    				each_value = Object.entries(/*persons*/ ctx[4]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(98:2) {#if sett}",
    		ctx
    	});

    	return block;
    }

    // (105:10) {#each Object.entries(persons) as [k, p]}
    function create_each_block(ctx) {
    	let li;
    	let label;
    	let input;
    	let input_checked_value;
    	let t0;
    	let t1_value = /*p*/ ctx[31].name + "";
    	let t1;
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function change_handler() {
    		return /*change_handler*/ ctx[28](/*k*/ ctx[30]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = text(" (음소거 및 영어 숨김)");
    			t3 = space();
    			attr_dev(input, "type", "checkbox");
    			input.checked = input_checked_value = /*p*/ ctx[31].hideEnglish;
    			add_location(input, file, 107, 16, 4139);
    			add_location(label, file, 106, 14, 4115);
    			attr_dev(li, "class", "svelte-1hjstv4");
    			add_location(li, file, 105, 12, 4096);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, label);
    			append_dev(label, input);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);
    			append_dev(li, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", change_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*persons*/ 16 && input_checked_value !== (input_checked_value = /*p*/ ctx[31].hideEnglish)) {
    				prop_dev(input, "checked", input_checked_value);
    			}

    			if (dirty[0] & /*persons*/ 16 && t1_value !== (t1_value = /*p*/ ctx[31].name + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(105:10) {#each Object.entries(persons) as [k, p]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let div2;
    	let button0;
    	let t2_value = (/*playing*/ ctx[5] ? "재생 중" : "재생") + "";
    	let t2;
    	let t3;
    	let button1;
    	let t4_value = (/*globalRepeat*/ ctx[6] ? "전체 반복 ON" : "전체 반복 OFF") + "";
    	let t4;
    	let t5;
    	let button2;
    	let t6_value = (/*segmentRepeat*/ ctx[7] ? "구간 반복 ON" : "구간 반복 OFF") + "";
    	let t6;
    	let t7;
    	let button3;
    	let t8_value = (/*showKorean*/ ctx[11] ? "한글발음 ON" : "한글발음 OFF") + "";
    	let t8;
    	let t9;
    	let button4;
    	let t10_value = (/*txtSize*/ ctx[10] === '1.2em' ? "글씨크게 OFF" : "글씨크게 ON") + "";
    	let t10;
    	let t11;
    	let button5;
    	let t12_value = (/*left*/ ctx[9] ? "사진 보임" : "사진 숨김") + "";
    	let t12;
    	let t13;
    	let button6;
    	let t14_value = (/*highlightEnabled*/ ctx[2] ? "하이라이트 ON" : "하이라이트 OFF") + "";
    	let t14;
    	let t15;
    	let button7;
    	let t17;
    	let mounted;
    	let dispose;
    	let if_block0 = /*left*/ ctx[9] && create_if_block_2(ctx);
    	let each_value_1 = /*conv*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let if_block1 = /*sett*/ ctx[8] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div2 = element("div");
    			button0 = element("button");
    			t2 = text(t2_value);
    			t3 = space();
    			button1 = element("button");
    			t4 = text(t4_value);
    			t5 = space();
    			button2 = element("button");
    			t6 = text(t6_value);
    			t7 = space();
    			button3 = element("button");
    			t8 = text(t8_value);
    			t9 = space();
    			button4 = element("button");
    			t10 = text(t10_value);
    			t11 = space();
    			button5 = element("button");
    			t12 = text(t12_value);
    			t13 = space();
    			button6 = element("button");
    			t14 = text(t14_value);
    			t15 = space();
    			button7 = element("button");
    			button7.textContent = "설정";
    			t17 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "right-panel svelte-1hjstv4");
    			set_style(div0, "width", /*left*/ ctx[9] ? '60%' : '100%');
    			add_location(div0, file, 59, 4, 2128);
    			attr_dev(div1, "class", "top-container svelte-1hjstv4");
    			add_location(div1, file, 50, 2, 1773);
    			attr_dev(button0, "class", "svelte-1hjstv4");
    			add_location(button0, file, 74, 4, 2731);
    			attr_dev(button1, "class", "toggle-btn svelte-1hjstv4");
    			add_location(button1, file, 77, 4, 2870);
    			attr_dev(button2, "class", "toggle-btn svelte-1hjstv4");
    			add_location(button2, file, 80, 4, 3010);
    			attr_dev(button3, "class", "toggle-btn svelte-1hjstv4");
    			add_location(button3, file, 83, 4, 3153);
    			attr_dev(button4, "class", "toggle-btn svelte-1hjstv4");
    			add_location(button4, file, 86, 4, 3285);
    			attr_dev(button5, "class", "toggle-btn svelte-1hjstv4");
    			add_location(button5, file, 89, 4, 3449);
    			attr_dev(button6, "class", "toggle-btn svelte-1hjstv4");
    			add_location(button6, file, 92, 4, 3558);
    			attr_dev(button7, "class", "svelte-1hjstv4");
    			add_location(button7, file, 95, 4, 3691);
    			attr_dev(div2, "class", "right-controls svelte-1hjstv4");
    			add_location(div2, file, 73, 2, 2698);
    			attr_dev(main, "class", "main-container svelte-1hjstv4");
    			add_location(main, file, 49, 0, 1741);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, button0);
    			append_dev(button0, t2);
    			append_dev(div2, t3);
    			append_dev(div2, button1);
    			append_dev(button1, t4);
    			append_dev(div2, t5);
    			append_dev(div2, button2);
    			append_dev(button2, t6);
    			append_dev(div2, t7);
    			append_dev(div2, button3);
    			append_dev(button3, t8);
    			append_dev(div2, t9);
    			append_dev(div2, button4);
    			append_dev(button4, t10);
    			append_dev(div2, t11);
    			append_dev(div2, button5);
    			append_dev(button5, t12);
    			append_dev(div2, t13);
    			append_dev(div2, button6);
    			append_dev(button6, t14);
    			append_dev(div2, t15);
    			append_dev(div2, button7);
    			append_dev(main, t17);
    			if (if_block1) if_block1.m(main, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_2*/ ctx[19], false, false, false, false),
    					listen_dev(button1, "click", /*click_handler_3*/ ctx[20], false, false, false, false),
    					listen_dev(button2, "click", /*click_handler_4*/ ctx[21], false, false, false, false),
    					listen_dev(button3, "click", /*click_handler_5*/ ctx[22], false, false, false, false),
    					listen_dev(button4, "click", /*click_handler_6*/ ctx[23], false, false, false, false),
    					listen_dev(button5, "click", /*click_handler_7*/ ctx[24], false, false, false, false),
    					listen_dev(button6, "click", /*click_handler_8*/ ctx[25], false, false, false, false),
    					listen_dev(button7, "click", /*click_handler_9*/ ctx[26], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*left*/ ctx[9]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty[0] & /*idx, audio, playSeg, txtSize, conv, showKorean, hl, persons*/ 15387) {
    				each_value_1 = /*conv*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*left*/ 512) {
    				set_style(div0, "width", /*left*/ ctx[9] ? '60%' : '100%');
    			}

    			if (dirty[0] & /*playing*/ 32 && t2_value !== (t2_value = (/*playing*/ ctx[5] ? "재생 중" : "재생") + "")) set_data_dev(t2, t2_value);
    			if (dirty[0] & /*globalRepeat*/ 64 && t4_value !== (t4_value = (/*globalRepeat*/ ctx[6] ? "전체 반복 ON" : "전체 반복 OFF") + "")) set_data_dev(t4, t4_value);
    			if (dirty[0] & /*segmentRepeat*/ 128 && t6_value !== (t6_value = (/*segmentRepeat*/ ctx[7] ? "구간 반복 ON" : "구간 반복 OFF") + "")) set_data_dev(t6, t6_value);
    			if (dirty[0] & /*showKorean*/ 2048 && t8_value !== (t8_value = (/*showKorean*/ ctx[11] ? "한글발음 ON" : "한글발음 OFF") + "")) set_data_dev(t8, t8_value);
    			if (dirty[0] & /*txtSize*/ 1024 && t10_value !== (t10_value = (/*txtSize*/ ctx[10] === '1.2em' ? "글씨크게 OFF" : "글씨크게 ON") + "")) set_data_dev(t10, t10_value);
    			if (dirty[0] & /*left*/ 512 && t12_value !== (t12_value = (/*left*/ ctx[9] ? "사진 보임" : "사진 숨김") + "")) set_data_dev(t12, t12_value);
    			if (dirty[0] & /*highlightEnabled*/ 4 && t14_value !== (t14_value = (/*highlightEnabled*/ ctx[2] ? "하이라이트 ON" : "하이라이트 OFF") + "")) set_data_dev(t14, t14_value);

    			if (/*sett*/ ctx[8]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(main, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			destroy_each(each_blocks, detaching);
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let hl;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let persons = {},
    		conv = [],
    		idx = 0,
    		playing = false,
    		globalRepeat = false,
    		segmentRepeat = false,
    		sett = false,
    		left = true,
    		txtSize = '1.2em',
    		showKorean = true,
    		highlightEnabled = false,
    		audio = new Audio(),
    		curT = 0; // 기본적으로 하이라이트 비활성화

    	onMount(async () => {
    		const r = await fetch('meet1.json');
    		const d = await r.json();
    		$$invalidate(4, persons = d.persons);
    		for (let k in persons) if (persons[k].hideEnglish === undefined) $$invalidate(4, persons[k].hideEnglish = false, persons);
    		$$invalidate(0, conv = d.conversation);
    		conv.forEach((s, i) => s.filePath = `./meet1/${String(i + 1).padStart(2, '0')}.mp3`);
    	});

    	audio.addEventListener('timeupdate', () => $$invalidate(16, curT = audio.currentTime));

    	function playSeg(i) {
    		if (i >= conv.length) {
    			$$invalidate(5, playing = false);
    			return;
    		}

    		$$invalidate(1, idx = i);
    		let s = conv[i];
    		$$invalidate(3, audio.src = s.filePath, audio);
    		$$invalidate(3, audio.muted = persons[s.speaker].muted || persons[s.speaker].hideEnglish, audio);
    		$$invalidate(5, playing = true);
    		audio.play();
    	}

    	audio.onended = () => {
    		if (segmentRepeat) playSeg(idx); else if (idx < conv.length - 1) playSeg(idx + 1); else if (globalRepeat) {
    			$$invalidate(1, idx = 0);
    			playSeg(0);
    		} else $$invalidate(5, playing = false);
    	};

    	function toggleSpeaker(k) {
    		$$invalidate(4, persons[k].hideEnglish = !persons[k].hideEnglish, persons);
    	}

    	function toggleHighlight() {
    		$$invalidate(2, highlightEnabled = !highlightEnabled);
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const click_handler_1 = i => {
    		audio.pause();
    		playSeg(i);
    	};

    	const click_handler_2 = () => {
    		playing
    		? (audio.pause(), $$invalidate(5, playing = false))
    		: playSeg(idx);
    	};

    	const click_handler_3 = () => $$invalidate(6, globalRepeat = !globalRepeat);
    	const click_handler_4 = () => $$invalidate(7, segmentRepeat = !segmentRepeat);
    	const click_handler_5 = () => $$invalidate(11, showKorean = !showKorean);
    	const click_handler_6 = () => $$invalidate(10, txtSize = txtSize === '1.2em' ? '2em' : '1.2em');
    	const click_handler_7 = () => $$invalidate(9, left = !left);
    	const click_handler_8 = () => toggleHighlight();
    	const click_handler_9 = () => $$invalidate(8, sett = true);
    	const click_handler_10 = () => $$invalidate(8, sett = false);
    	const change_handler = k => toggleSpeaker(k);
    	const click_handler_11 = () => $$invalidate(8, sett = false);

    	$$self.$capture_state = () => ({
    		onMount,
    		persons,
    		conv,
    		idx,
    		playing,
    		globalRepeat,
    		segmentRepeat,
    		sett,
    		left,
    		txtSize,
    		showKorean,
    		highlightEnabled,
    		audio,
    		curT,
    		playSeg,
    		toggleSpeaker,
    		toggleHighlight,
    		hl
    	});

    	$$self.$inject_state = $$props => {
    		if ('persons' in $$props) $$invalidate(4, persons = $$props.persons);
    		if ('conv' in $$props) $$invalidate(0, conv = $$props.conv);
    		if ('idx' in $$props) $$invalidate(1, idx = $$props.idx);
    		if ('playing' in $$props) $$invalidate(5, playing = $$props.playing);
    		if ('globalRepeat' in $$props) $$invalidate(6, globalRepeat = $$props.globalRepeat);
    		if ('segmentRepeat' in $$props) $$invalidate(7, segmentRepeat = $$props.segmentRepeat);
    		if ('sett' in $$props) $$invalidate(8, sett = $$props.sett);
    		if ('left' in $$props) $$invalidate(9, left = $$props.left);
    		if ('txtSize' in $$props) $$invalidate(10, txtSize = $$props.txtSize);
    		if ('showKorean' in $$props) $$invalidate(11, showKorean = $$props.showKorean);
    		if ('highlightEnabled' in $$props) $$invalidate(2, highlightEnabled = $$props.highlightEnabled);
    		if ('audio' in $$props) $$invalidate(3, audio = $$props.audio);
    		if ('curT' in $$props) $$invalidate(16, curT = $$props.curT);
    		if ('hl' in $$props) $$invalidate(12, hl = $$props.hl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*conv, idx, highlightEnabled, audio, curT*/ 65551) {
    			$$invalidate(12, hl = conv[idx]
    			? (() => {
    					const s = conv[idx];
    					if (!highlightEnabled) return s.text;
    					if (!audio.duration) return s.text;

    					let f = Math.min((curT + 0.2) / audio.duration, 1),
    						w = s.text.split(" "),
    						c = Math.floor(w.length * f);

    					return `<span style="color:red;">${w.slice(0, c).join(" ")}</span> ${w.slice(c).join(" ")}`;
    				})()
    			: "");
    		}
    	};

    	return [
    		conv,
    		idx,
    		highlightEnabled,
    		audio,
    		persons,
    		playing,
    		globalRepeat,
    		segmentRepeat,
    		sett,
    		left,
    		txtSize,
    		showKorean,
    		hl,
    		playSeg,
    		toggleSpeaker,
    		toggleHighlight,
    		curT,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		click_handler_9,
    		click_handler_10,
    		change_handler,
    		click_handler_11
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
