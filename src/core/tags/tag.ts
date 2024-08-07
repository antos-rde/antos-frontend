/**
 *
 * Extend the HTMLElement interface with some utility function need
 * by AFX API
 *
 * @interface HTMLElement
 */
interface HTMLElement {
    /**
     * Recursively update a tag and all its children
     *
     * @param {*} [d] data to send to all element in the DOM subtree
     * @memberof HTMLElement
     */
    update(d?: any): void;

    /**
     *
     * AFX will automatically bind the context menu on an HTMLElement
     * if this function is defined on that element. The function should
     * define the content of the context menu and its action
     *
     * Once the context menu is bound to the element, all context menu handle
     * defined on any child of this element will be ignored.
     *
     * @param {JQuery.MouseEventBase} e a mouse event
     * @param {OS.GUI.tag.StackMenuTag} m The context menu element {@link OS.GUI.tag.StackMenuTag}
     * @memberof HTMLElement
     */
    contextmenuHandle(e: JQuery.MouseEventBase, m: OS.GUI.tag.StackMenuTag): void;

    /**
     * Mount the element and all the children on its DOM subtree. This action
     * is performed in a top-down manner
     *
     * @memberof HTMLElement
     */
    sync(): void;

    /**
     *
     * This action allows to generated all the DOM nodes defined by all AFX tags
     * in its hierarchy.
     * It performs two operations, one top-down operation to generate all the
     * necessary DOM nodes, another bottom-up operation to init all the AFX tag
     * in the current element DOM hierarchy
     *
     * @param {OS.API.Announcer} o an AntOS observable object
     * @memberof HTMLElement
     */
    afxml(o: OS.API.Announcer): void;

    /**
     * Enable the drag event dispatching on this
     * element
     * 
     * This will trigger the `dragging` and `drop` event on the enabled
     * element when the mouse is down, move, then up, then move
     * 
     * The event can be listened using the traditional way,
     * Example:
     * ```
     * elem.addEventListener('dragging', (e) => {  }, false);
     * elem.addEventListener('drop', (e) => {  }, false);
     * ```
     * 
     * @meberof HTMLElement
     */
    enable_drag(): void;

    /**
     * Perform DOM generation ({@link afxml}) then mount ({@link sync}) all the
     * elements.
     *
     * @param {OS.API.Announcer} o an AntOS observable object
     * @param {boolean} [flag] indicates whether this is the top-most call of the operation
     * @memberof HTMLElement
     */
    uify(o: OS.API.Announcer, flag?: boolean): void;

    /**
     *
     *
     * @type {*}
     * @memberof HTMLElement
     */
    mozRequestFullScreen: any;

    /**
     *
     *
     * @type {*}
     * @memberof HTMLElement
     */
    webkitRequestFullscreen: any;

    /**
     *
     *
     * @type {*}
     * @memberof HTMLElement
     */
    msRequestFullscreen: any;
}

/**
 *
 *
 * @interface Document
 */
interface Document {
    mozCancelFullScreen: any;
    webkitExitFullscreen: any;
    cancelFullScreen: any;
}
namespace OS {
    export namespace GUI {
        /**
         * TagLayoutType interface using by AFX tags to defined
         * its internal DOM hierarchy
         *
         * @export
         * @interface TagLayoutType
         */
        export interface TagLayoutType {
            /**
             * Element tag name
             *
             * @type {string}
             * @memberof TagLayoutType
             */
            el: string;

            /**
             * Children layout of the current element
             *
             * @type {TagLayoutType[]}
             * @memberof TagLayoutType
             */
            children?: TagLayoutType[];

            /**
             * Reference name of the element used by AFX Tag
             *
             * @type {string}
             * @memberof TagLayoutType
             */
            ref?: string;

            /**
             * CSS class of the element
             *
             * @type {string}
             * @memberof TagLayoutType
             */
            class?: string;

            /**
             * this is the `data-id` attribute of the element,
             * can be query by the {@link OS.GUI.AFXTag.aid} Tag API function.
             * Not to be confused with the DOM `id` attribute
             *
             * @type {(string | number)}
             * @memberof TagLayoutType
             */
            id?: string | number;

            /**
             * Tooltip text of the element
             *
             * @type {(string | FormattedString)}
             * @memberof TagLayoutType
             */
            tooltip?: string | FormattedString;

            /**
             * `data-width` of the element, not to be confused with
             * the `width` attribute of the DOM element
             *
             * @type {number|string}
             * @memberof TagLayoutType
             */
            width?: number | string;

            /**
             ** `data-height` of the element, not to be confused with
             * the `height` attribute of the DOM element
             *
             * @type {number|string}
             * @memberof TagLayoutType
             */
            height?: number | string;
        }

        /**
         * Data type for event issued by AFX tags
         *
         * @export
         * @interface TagEventDataType
         * @template T item template
         */
        export interface TagEventDataType<T> {
            /**
             * Reference to the item involved in the event
             *
             * @type {T}
             * @memberof TagEventDataType
             */
            item?: T;

            [propName: string]: any;
        }

        /**
         * Format of the event issued by AFX tags
         *
         * @export
         * @interface TagEventType
         * @template T data type
         */
        export interface TagEventType<T> {
            /**
             * `data-id` of the tag that trigger the
             * event
             *
             * @type {(number | string)}
             * @memberof TagEventType
             */
            id: number | string;

            /**
             * Data object of the event
             *
             * @type {T}
             * @memberof TagEventType
             */
            data: T;
            /**
             * Original event if any
             *
             * @type {any}
             * @memberof TagEventType
             */
            originalEvent?: any;
            /**
             * is root tag?
             * 
             * @type {boolean}
             * @memberof TagEventType
             */
            root?: boolean;
        }

        /**
         * Drag and Drop data type sent between mouse events
         *
         * @export
         * @interface DnDEventDataType
         * @template T
         */
        export interface DnDEventDataType<T> {
            /**
             * Reference to the source DOM element
             *
             * @type {T}
             * @memberof DnDEventDataType
             */
            from: T[];

            /**
             * Reference to the target DOM element
             *
             * @type {T}
             * @memberof DnDEventDataType
             */
            to: T;
        }
        /**
         * Tag event callback type
         * 
         * @export
         */
        export type TagEventCallback<T> = (e: TagEventType<T>) => void;
        /**
         * Tag responsive envent callback type
         *
         * @export
         */
        export type TagResponsiveCallback = (fullfilled: boolean) => void;
        
        /**
         * A callback record with history of last fulfilled
         * 
         * @interface TagResponsiveCallbackRecord
         */
        interface TagResponsiveCallbackRecord {
            /**
             * Callback function
             *
             * @type {TagResponsiveCallback}
             * @memberof TagResponsiveCallbackRecord
             */
            callback: TagResponsiveCallback,
            /**
             * has the event been previously fulfilled?
             * 
             * @type {boolean}
             * @memberof TagResponsiveCallbackRecord
             */
            fulfilled: boolean,
        }
        
        /**
         * Tag responsive validator type
         * 
         * @export
         */
        export type TagResponsiveValidator = (w: number, h: number) => boolean;

        /**
         * Definitions of some default tag responsive validators
         *
         * @export
         */

        export const RESPONSIVE = {
            /**
             * Extra small devices (phones, 600px and down)
             */
            TINY: function(w: number,_h: number){
                return w <= 600;
            },
            /*  
            Small devices (portrait tablets and large phones, 600px and up)
            */
            SMALL: function(w: number, _h: number){
                return  w <= 768;
            },
            /*  
             Medium devices (landscape tablets, 768px and up) 
            */
            MEDIUM: function(w: number, _h: number){
                return w > 768;
            },
            /**
             * Large devices (laptops/desktops, 992px and up)
             */
            LARGE: function(w: number, _h: number){
                return w > 992;
            },
            /**
             * Extra large devices (large laptops and desktops, 1200px and up)
             */
            HUGE: function(w: number, _h: number){
                return w > 1200;
            },
            /**
             * Portrait mode
             */
            PORTRAIT: function(w: number, h: number){
                return h > w;
            },
            /**
             * Landscape mode
             */
            LANDSCAPE: function(w: number, h: number){
                return h < w;
            },
        }

        /**
         * A custom map to handle responsive events, a responsive event
         * consists of a validator and a callback
         * 
         * When avalidator return true, its corresponding callback will
         * be called
         */
        class ResponsiveHandle extends Map<TagResponsiveValidator,TagResponsiveCallbackRecord> {
            /**
             * Register a responsive envent to this map
             * 
             * @param {TagResponsiveValidator} a validator
             * @param {TagResponsiveCallback} event callback
             * @memberof ResponsiveHandle
             */
            on(validator: TagResponsiveValidator, callback: TagResponsiveCallback)
            {
                let record: TagResponsiveCallbackRecord = {
                    callback: callback,
                    fulfilled: false,
                }
                this.set(validator, record);
            }

            /**
             * unregister a responsive event
             * 
             * @param {TagResponsiveValidator} a validator
             * @memberof ResponsiveHandle
             */
            off(validator: TagResponsiveValidator)
            {
                this.delete(validator);
            }

            /**
             * Verify validators and execute callbacks
             * 
             * @param {number} root tag width
             * @param {number} root tag height
             * @memberof ResponsiveHandle
             */
            morph(rootw: number, rooth: number)
            {
                for (const [validator, record] of this.entries()) {
                    const val = validator(rootw, rooth);
                    if(record.fulfilled && val)
                    {
                        // the record has been previously fulfilled
                        // and the validator returns true
                        // nothing changed
                        continue;
                    }
                    if(!record.fulfilled && !val)
                    {
                        // the record has been previously unfulfilled
                        // and the validator returns false
                        // nothing changed
                        continue;
                    }
                    record.fulfilled =val;
                    record.callback(val);
                }
            }
        }

        /**
         * Base abstract class for tag implementation, any AFX tag should be
         * subclass of this class
         *
         * @export
         * @abstract
         * @class AFXTag
         * @extends {HTMLElement}
         */
        export abstract class AFXTag extends HTMLElement {
            /**
             * The announcer object of the tag
             *
             * @type {API.Announcer}
             * @memberof AFXTag
             */
            observable: API.Announcer;

            /**
             * Reference to some of the tag's children
             * element. This reference object is built
             * based on the `ref` property found in the
             * tag layout {@link TagLayoutType}
             *
             * @protected
             * @type {GenericObject<HTMLElement>}
             * @memberof AFXTag
             */
            protected refs: GenericObject<HTMLElement>;

            /**
             * boolean value indicated whether the tag
             * is already mounted in the DOM tree
             *
             * @protected
             * @type {boolean}
             * @memberof AFXTag
             */
            protected _mounted: boolean;

            /**
             * a {@link ResponsiveHandle} to handle all responsive event
             * related to this tag
             * 
             * @private
             * @memberof AFXTag
             */
            private _responsive_handle: ResponsiveHandle;

            private _responsive_check: (evt: TagEventType<{w: number, h: number}>) => void;
            /**
             * Creates an instance of AFXTag.
             * @memberof AFXTag
             */
            constructor() {
                super();

                if (!this.observable) {
                    this.observable = new Ant.OS.API.Announcer();
                }
                this._mounted = false;
                this.refs = {};
                this._responsive_handle = new ResponsiveHandle();
                this._responsive_check = undefined;
            }

            /**
             * This function verifies if a property name of the input object
             * corresponds to a setter of the current tag. If this is the
             * case, it sets the value of that property to the setter
             *
             * @param {GenericObject<any>} v input object
             * @memberof AFXTag
             */
            set(v: GenericObject<any>) {
                for (let k in v) {
                    let descriptor = this.descriptor_of(k);
                    if (descriptor && descriptor.set) {
                        this[k] = v[k];
                    }
                }
            }

            /**
             * Setter to set the tooltip text to the current tag.
             * The text should be in the following format:
             * ```text
             * cr|cl|ct|cb: tooltip text
             * ```
             *
             * @memberof AFXTag
             */
            set tooltip(v: string) {
                if (!v) {
                    return;
                }
                $(this).attr("tooltip", v);
            }
            
            /**
             * Setter to activate or deactivate focus on a Tag
             *
             * @memberof AFXTag
             */
            set focusable(v: boolean) {
                if(v) {
                    $(this).attr("tabindex", 0).css("outline", "none");
                } else  {
                    $(this).removeAttr("tabindex");
                }
            }

            /**
             *
             * This function looking for a property name of the tag
             * in its prototype chain. The descriptor of the property
             * will be returned if it exists
             *
             * @private
             * @param {string} k the property name to be queried
             * @returns {PropertyDescriptor} the property descriptor or undefined
             * @memberof AFXTag
             */
            private descriptor_of(k: string): PropertyDescriptor {
                let desc: PropertyDescriptor;
                let obj = this;
                do {
                    desc = Object.getOwnPropertyDescriptor(obj, k);
                } while (!desc && (obj = Object.getPrototypeOf(obj)));
                return desc;
            }

            /**
             * Setter: set the id of the tag in string or number
             *
             * Getter: get the id of the current tag
             *
             * @memberof AFXTag
             */
            set aid(v: string | number) {
                $(this).attr("data-id", v);
            }

            get aid(): string | number {
                return $(this).attr("data-id");
            }

            /**
             * Setter: Enable/disable responsive tag
             * 
             * Getter: get responsive status
             */
            set responsive(v:boolean) {
                if(!v)
                {
                    this.attsw(false,"responsive");
                    this.observable.off("resize",this._responsive_check);
                    this._responsive_check = undefined;
                    return;
                }
                if(this._responsive_check)
                {
                    return;
                }
                this._responsive_check = (evt: TagEventType<{w: number, h: number}>) => {
                    if(!evt || !evt.root || !evt.data.w || !evt.data.h )
                    {
                        return;
                    }
                    this._responsive_handle.morph(evt.data.w, evt.data.h);
                }
                this.observable.on("resize", this._responsive_check);
                this.attsw(true, "responsive");
            }
            get responsive(): boolean {
                return this.hasattr("responsive");
            }

            /**
             * Register a responsive event to this tag
             * 
             * @param {TagResponsiveValidator} responsive validator
             * @param {TagResponsiveCallback} responsive callback
             * @memberof AFXTag
             */
            morphon(validator: TagResponsiveValidator, callback:TagResponsiveCallback)
            {
                this._responsive_handle.on(validator, callback);
            }

            /**
             * Unregister a responsive event from this tag
             * 
             * @param {TagResponsiveValidator} responsive validator
             * @memberof AFXTag
             */
            morphoff(validator: TagResponsiveValidator)
            {
                this._responsive_handle.off(validator);
            }

            /**
             * Attach a data to this tag
             * 
             * This function will define a getter `domel`
             * in the attached data, this getter refers to the
             * current tag
             *
             * @returns {void}
             * @memberof AFXTag
             */
            attach(data: GenericObject<any>): void {
                const self = this;
                Object.defineProperty(data, 'domel', {
                    get: function () { return self },
                    enumerable: false,
                    configurable: true
                })
            }

            /**
             * Implementation from HTMLElement interface,
             * this function mount the current tag hierarchy
             *
             * @returns {void}
             * @memberof AFXTag
             */
            sync(): void {
                if (this._mounted) {
                    return;
                }
                this._mounted = true;
                this.mount();
                super.sync();
            }

            /**
             * Generate the DOM hierarchy of the current tag
             *
             * @param {API.Announcer} o observable object
             * @memberof AFXTag
             */
            afxml(o: API.Announcer): void {
                if (o) this.observable = o;
                if (!this.aid)
                    this.aid = (
                        Math.floor(Math.random() * 100000) + 1
                    ).toString();
                const children = $(this).children();
                for (let obj of this.layout()) {
                    const dom = this.mkui(obj);
                    if (dom) {
                        $(dom).appendTo(this);
                    }
                }
                if (this.refs.yield) {
                    for (let v of children) {
                        $(v).detach().appendTo(this.refs.yield);
                    }
                }
                const attrs = {};
                for (let i = 0; i < this.attributes.length; i++) {
                    const element = this.attributes[i];
                    let descriptor = this.descriptor_of(element.nodeName);
                    if (descriptor && descriptor.set) {
                        let value = "";
                        try {
                            value = JSON.parse(element.nodeValue);
                        } catch (e) {
                            value = element.nodeValue;
                        }
                        attrs[element.nodeName] = value;
                    }
                }
                super.afxml(this.observable);
                this.init();
                for (let k in attrs) {
                    this[k] = attrs[k];
                }
            }

            /**
             * Update the current tag hierarchy
             *
             * @param {*} d any data object
             * @memberof AFXTag
             */
            update(d: any): void {
                this.reload(d);
                super.update(d);
            }

            /**
             * Init the current tag, this function
             * is called before the {@link mount} function
             *
             * @protected
             * @abstract
             * @memberof AFXTag
             */
            protected abstract init(): void;

            /**
             * Mount only the current tag
             *
             * @protected
             * @abstract
             * @memberof AFXTag
             */
            protected abstract mount(): void;

            /**
             * Layout definition of a tag
             *
             * @protected
             * @abstract
             * @returns {TagLayoutType[]} tag layout object
             * @memberof AFXTag
             */
            protected abstract layout(): TagLayoutType[];

            /**
             * Update only the current tag, this function is
             * called by {@link update} before chaining the
             * update process to its children
             *
             * @protected
             * @abstract
             * @param {*} [d]
             * @memberof AFXTag
             */
            protected abstract reload(d?: any): void;

            /**
             * This function is used to re-render the current
             * tag
             *
             * @protected
             * @memberof AFXTag
             */
            protected calibrate(): void { }

            /**
             * This function parses the input layout object
             * and generates all the elements defined by
             * the tag
             *
             * @private
             * @param {TagLayoutType} tag tag layout object
             * @returns {Element} the DOM element specified by the tag layout
             * @memberof AFXTag
             */
            private mkui(tag: TagLayoutType): Element {
                if (!tag) {
                    return undefined;
                }
                const dom = $(`<${tag.el}>`);
                if (tag.class) {
                    $(dom).addClass(tag.class);
                }
                if (tag.id) {
                    $(dom).attr("data-id", tag.id);
                }
                if (tag.height) {
                    $(dom).attr("data-height", tag.height);
                }
                if (tag.width) {
                    $(dom).attr("data-width", tag.width);
                }
                if (tag.tooltip) {
                    $(dom).attr("tooltip", tag.tooltip.__());
                }
                if (tag.children) {
                    for (let v of tag.children) {
                        $(this.mkui(v)).appendTo(dom);
                    }
                }
                if (tag.ref) {
                    this.refs[tag.ref] = dom[0];
                }
                // dom.mount @observable
                return dom[0]; //.uify(@observable)
            }

            /**
             * This function inserts or removes an attribute name
             * to/from the target element based on the input `flag`.
             *
             * @protected
             * @param {boolean} flag indicates whether the attribute name should be inserted o removed
             * @param {string} v the attribute name
             * @param {HTMLElement} [el] the target element
             * @memberof AFXTag
             */
            protected attsw(flag: boolean, v: string, el?: HTMLElement): void {
                if (flag) this.atton(v, el);
                else this.attoff(v, el);
            }

            /**
             * Insert the attribute name to the target element
             *
             * @protected
             * @param {string} v the attribute name
             * @param {HTMLElement} [el] the target element
             * @memberof AFXTag
             */
            protected atton(v: string, el?: HTMLElement): void {
                const element = el ? el : this;
                $(element).attr(v, "");
            }

            /**
             * Remove the attribute name from the target element
             *
             * @protected
             * @param {string} v attribute name
             * @param {HTMLElement} [el] the target element
             * @memberof AFXTag
             */
            protected attoff(v: string, el?: HTMLElement): void {
                const element = el ? el : this;
                element.removeAttribute(v);
            }

            /**
             * Verify if the target element has an attribute name
             *
             * @protected
             * @param {string} v attribute name
             * @param {HTMLElement} [el] target element
             * @returns {boolean}
             * @memberof AFXTag
             */
            protected hasattr(v: string, el?: HTMLElement): boolean {
                const element = el ? el : this;
                return element.hasAttribute(v);
            }
        }

        HTMLElement.prototype.enable_drag = function () {
            $(this)
                .on("pointerdown", (evt: JQuery.MouseEventBase) => {
                    const offset = $(this).offset();
                    offset.top = evt.clientY - offset.top;
                    offset.left = evt.clientX - offset.left;
                    const mouse_move = (
                        e: JQuery.MouseEventBase
                    ) => {
                        const custom_event = new CustomEvent('dragging', {
                            detail: {
                                origin: evt,
                                current: e,
                                offset: offset
                            }
                        });
                        this.dispatchEvent(custom_event);
                    };

                    var mouse_up = (e: JQuery.MouseEventBase) => {
                        $(window).off("pointermove", mouse_move);
                        $(window).off("pointerup", mouse_up);
                        // trigger the drop event
                        const custom_event = new CustomEvent('drop', {
                            detail: {
                                origin: evt,
                                current: e,
                                offset: offset
                            }
                        });
                        this.dispatchEvent(custom_event);
                    };
                    $(window).on("pointermove", mouse_move);
                    $(window).on("pointerup", mouse_up);
                });
        }

        HTMLElement.prototype.update = function (d): void {
            $(this)
                .children()
                .each(function () {
                    if (this.update)
                        return this.update(d);
                });
        };
        HTMLElement.prototype.sync = function (): void {
            $(this)
                .children()
                .each(function () {
                    return this.sync();
                });
        };
        HTMLElement.prototype.afxml = function (o: API.Announcer): void {
            $(this)
                .children()
                .each(function () {
                    return this.afxml(o);
                });
        };
        HTMLElement.prototype.uify = function (
            o: API.Announcer,
            toplevel?: boolean
        ): void {
            this.afxml(o);
            this.sync();
            if (o && toplevel) o.trigger("mounted", this.aid);
        };
        /**
         * All the AFX tags are defined in this namespace,
         * these tags are defined as custom DOM elements and will be
         * stored in the `customElements` registry of the browser
         */
        export namespace tag {
            /**
             * Alias to  all classes that extends {@link AFXTag}
             */
            export type AFXTagTypeClass = {
                new <T extends AFXTag>(): T;
            };
            /**
             * Define an AFX tag as a custom element and add it to the
             * global `customElements` registry. If the tag is redefined, i.e.
             * the tag already exists, its behavior will be updated with the
             * new definition
             *
             * @export
             * @template T all classes that extends {@link AFXTag}
             * @param {string} name name of the tag
             * @param {{ new (): T }} cls the class that defines the tag
             * @returns {void}
             */
            export function define<T extends AFXTag>(
                name: string,
                cls: { new(): T }
            ): void {
                try {
                    customElements.define(name, cls);
                } catch (error) {
                    const proto = customElements.get(name);
                    if (cls) {
                        const props = Object.getOwnPropertyNames(cls.prototype);
                        // redefine the class
                        for (let prop of props) {
                            proto.prototype[prop] = cls.prototype[prop];
                        }
                        return;
                    }
                    throw error;
                }
            }
        }
    }
}
