namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A WindowTag represents a virtual window element
             * used by AntOS applications and dialogs.
             *
             * @export
             * @class WindowTag
             * @extends {AFXTag}
             */
            export class WindowTag extends AFXTag {
                /**
                 * The element ID of the virtual desktop element
                 *
                 * @type {string}
                 * @memberof WindowTag
                 */
                desktop: string;

                /**
                 * Window width placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof WindowTag
                 */
                private _width: number;

                /**
                 * Window height placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof WindowTag
                 */
                private _height: number;

                /**
                 * Placeholder indicates whether the current window is shown
                 *
                 * @private
                 * @type {boolean}
                 * @memberof WindowTag
                 */
                private _shown: boolean;

                /**
                 * Placeholder indicates whether the current window is maximized
                 *
                 * @private
                 * @type {boolean}
                 * @memberof WindowTag
                 */
                private _isMaxi: boolean;

                /**
                 * This placeholder stores the latest offset of the current window.
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof WindowTag
                 */
                private _history: GenericObject<any>;

                /**
                 * This placeholder store the callback for the menu open event
                 * 
                 * @private
                 * @type {(el: StackMenuTag) => void}
                 * @memberof WindowTag
                 */
                private _onmenuopen: (el: StackMenuTag) => void;
                /**
                 * This placeholder stores the offset of the virtual desktop element
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof WindowTag
                 */
                private _desktop_pos: GenericObject<any>;
                
                /**
                 * Creates an instance of WindowTag.
                 * @memberof WindowTag
                 */
                constructor() {
                    super();
                }
                
                /**
                 * blur overlay: If active the window overlay will be shown
                 * on inactive (blur event)
                 * 
                 * Setter: Enable the switch
                 *
                 * Getter: Check whether the switch is enabled
                 *
                 * @memberof WindowTag
                 */
                set blur_overlay(v: boolean) {
                    this.attsw(v, "blur-overlay");
                }
                get blur_overlay(): boolean {
                    return this.hasattr("blur-overlay");
                }
                /**
                 * Setter: set menu open event handler
                 * 
                 * @memberof WindowTag
                 */
                set onmenuopen(f: (el: StackMenuTag) => void)
                {
                    this._onmenuopen = f;
                }
                /**
                 * Init window tag
                 * - `shown`: false
                 * - `isMaxi`: false
                 * - `minimizable`: false
                 * - `resizable`: true
                 * - `apptitle`: Untitled
                 *
                 * @protected
                 * @memberof WindowTag
                 */
                protected init(): void {
                    this._shown = false;
                    this._isMaxi = false;
                    this._history = {};
                    this.desktop = GUI.workspace;
                    this._desktop_pos = $(this.desktop).offset();
                    this.minimizable = true;
                    this.resizable = true;
                    this.apptitle = "Untitled";
                    this._onmenuopen = undefined;
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof WindowTag
                 */
                protected calibrate(): void { }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof WindowTag
                 */
                protected reload(d?: any): void { }

                /**
                 * Setter: Set the window width
                 *
                 * Getter: Get the window width
                 *
                 * @memberof WindowTag
                 */
                set width(v: number) {
                    this._width = v;
                    if (!v) {
                        return;
                    }
                    this.setsize({ w: v, h: this.height });
                }
                get width(): number {
                    return this._width;
                }

                /**
                 * Setter: Set the window height
                 *
                 * Getter: Get the window height
                 *
                 * @memberof WindowTag
                 */
                set height(v: number) {
                    this._height = v;
                    if (!v) {
                        return;
                    }
                    this.setsize({
                        w: this.width,
                        h: v,
                    });
                }
                get height(): number {
                    return this._height;
                }
                
                /**
                 * Set the application menu content
                 * 
                 * @memberof WindowTag
                 */
                set menu(v: GenericObject<any>[])
                {
                    if(!v || v.length == 0)
                    {
                        $(this.refs.btnMenu).hide();
                    }
                    else
                    {
                        (this.refs.stackmenu as StackMenuTag).nodes = v;
                        $(this.refs.btnMenu).show();
                    }
                }

                /**
                 * Setter: enable/disable window minimizable
                 *
                 * getter: Check whether the window is minimizable
                 *
                 * @memberof WindowTag
                 */
                set minimizable(v: boolean) {
                    this.attsw(v, "minimizable");
                    if (v) {
                        $(this.refs["minbt"]).show();
                    } else {
                        $(this.refs["minbt"]).hide();
                    }
                }
                get minimizable(): boolean {
                    return this.hasattr("minimizable");
                }

                /**
                 * Setter: enable/disable widow resizable
                 *
                 * Getter: Check whether the current window is resizable
                 *
                 * @memberof WindowTag
                 */
                set resizable(v: boolean) {
                    this.attsw(v, "resizable");
                    if (v) {
                        $(this.refs["maxbt"]).show();
                        $(this.refs["grip"]).show();
                        $(this.refs["grip_bottom"]).show();
                        $(this.refs["grip_right"]).show();
                    } else {
                        $(this.refs["maxbt"]).hide();
                        $(this.refs["grip"]).hide();
                        $(this.refs["grip_bottom"]).hide();
                        $(this.refs["grip_right"]).hide();
                    }
                }
                get resizable(): boolean {
                    return this.hasattr("resizable");
                }

                /**
                 * Setter: Set the window title
                 *
                 * Getter: Get window title
                 *
                 * @memberof WindowTag
                 */
                set apptitle(v: string | FormattedString) {
                    $(this).attr("apptitle", v.__());
                    if (v) {
                        (this.refs["txtTitle"] as LabelTag).text = v;
                        this.observable.trigger("apptitlechange", this);
                    }
                }
                get apptitle(): string | FormattedString {
                    return $(this).attr("apptitle");
                }

                /**
                 * Resize all the children of the window based on its width and height
                 *
                 * @private
                 * @memberof WindowTag
                 */
                private resize(): void {
                    const ch =
                        $(this.refs["yield"]).height() /
                        $(this.refs["yield"]).children().length;
                    $(this.refs["yield"])
                        .children()
                        .each(function (e) {
                            $(this).css("height", `${ch}px`);
                        });
                }

                /**
                 * Mount the window tag and bind basic events
                 *
                 * @protected
                 * @returns {void}
                 * @memberof WindowTag
                 */
                protected mount(): void {
                    const btn_menu = (this.refs.btnMenu as ButtonTag);
                    const min_btn = (this.refs["minbt"] as ButtonTag);
                    const max_btn = (this.refs["maxbt"] as ButtonTag);
                    const close_btn = (this.refs["closebt"] as ButtonTag);
                    const stackmenu = (this.refs.stackmenu as StackMenuTag);
                    stackmenu.context = true;
                    btn_menu.iconclass = "bi bi-list";
                    min_btn.iconclass = "bi bi-dash";
                    max_btn.iconclass = "bi bi-stop";
                    close_btn.iconclass = "bi bi-x";
                    this.contextmenuHandle = function (e) { };
                    min_btn.onbtclick =(_) => {
                        return this.observable.trigger("hide", {
                            id: this.aid,
                        });
                    };
                    btn_menu.onbtclick = (e) => {
                        e.data.stopPropagation();
                        if($(stackmenu).is(":hidden"))
                        {
                            if(this._onmenuopen)
                            {
                                this._onmenuopen(stackmenu);
                            }
                            else
                            {
                                stackmenu.reset();
                            }
                            stackmenu.show();
                        }
                        else
                        {
                            $(stackmenu).hide();
                        }
                    };
                    max_btn.onbtclick = (_) => {
                        return this.toggle_window();
                    };

                    close_btn.onbtclick = (_) => {
                        return this.observable.trigger("exit", {
                            id: this.aid,
                        });
                    };
                    stackmenu.onmenuselect = (e) => {
                        if(!e.data.item.data.nodes)
                        {
                            stackmenu.selected = -1;
                        }
                    }
                    const left = ($(this.desktop).width() - this.width) / 2;
                    const top = ($(this.desktop).height() - this.height) / 2;
                    $(this)
                        .css("position", "absolute")
                        .css("left", `${left}px`)
                        .css("top", `${top}px`)
                        .css("z-index", 10);
                    $(this).on("pointerdown", (e) => {
                        if (this._shown) {
                            return;
                        }
                        return this.observable.trigger("focus", {
                            id: this.aid,
                        });
                    });
                    $(this.refs["dragger"]).on("dblclick", (e) => {
                        return this.toggle_window();
                    });

                    this.observable.on("resize", (e) => this.resize());

                    this.observable.on("focus", () => {
                        $(this)
                            .show()
                            .removeClass("unactive");
                        this._shown = true;
                        $(this.refs.win_overlay).hide();
                        $(this).trigger("focus");
                    });

                    this.observable.on("blur", () => {
                        this._shown = false;
                        $(this).addClass("unactive");
                        if(this.blur_overlay)
                            $(this.refs.win_overlay).show();
                    });
                    this.observable.on("hide", () => {
                        $(this).hide();
                        return (this._shown = false);
                    });

                    this.observable.on("toggle", () => {
                        if (this._shown) {
                            return this.observable.trigger("hide", {
                                id: this.aid,
                            });
                        } else {
                            return this.observable.trigger("focus", {
                                id: this.aid,
                            });
                        }
                    });
                    this.observable.on("loaded", ()=>{
                        $(this.refs.panel).removeClass("loading");
                        $(this).css("cursor", "auto");
                    });
                    this.observable.on("loading", ()=>{
                        if(!$(this.refs.panel).hasClass("loading"))
                            $(this.refs.panel).addClass("loading");
                        $(this).css("cursor", "wait");
                    });
                    this.enable_dragging();
                    this.enable_resize();
                    this.setsize({
                        w: this.width,
                        h: this.height,
                    });
                    $(this).attr("tabindex", 0).css("outline", "none");
                    if(OS.mobile)
                    {
                        this.toggle_window();
                        //this.minimizable = false;
                        this.resizable = false;
                    }
                    this.observable.on("desktopresize", (e) => {
                        if(this._isMaxi)
                        {
                            this._isMaxi = false;
                            this.toggle_window(true);
                        }
                        /*else
                        {
                            const w = this.width > e.data.width ? e.data.width: this.width;
                            const h = this.height > e.data.height ? e.data.height: this.height;
                            this.setsize({ w: w, h: h });
                        }*/
                    });
                    this.observable.trigger("rendered", {
                        id: this.aid,
                    });
                }

                /**
                 * Set the window size
                 *
                 * @private
                 * @param {GenericObject<any>} o format: `{ w: window_width, h: window_height }`
                 * @returns {void}
                 * @memberof WindowTag
                 */
                private setsize(o: GenericObject<any>): void {
                    if (!o) {
                        return;
                    }
                    this._width = o.w;
                    this._height = o.h;
                    $(this).css("width", `${o.w}px`).css("height", `${o.h}px`);
                    $(this.refs.winwrapper).css("height", `${o.h}px`);
                    this.observable.trigger("resize", {
                        id: this.aid,
                        data: o,
                    });
                }

                /**
                 * Enable to drag window on the virtual desktop
                 *
                 * @private
                 * @memberof WindowTag
                 */
                private enable_dragging(): void {
                    $(this.refs["dragger"])
                        .css("user-select", "none")
                        .css("cursor", "default");
                    $(this.refs.dragger).on("pointerdown", (e) => {
                        e.originalEvent.preventDefault();
                        const offset = $(this).offset();
                        offset.top = e.clientY - offset.top;
                        offset.left = e.clientX - offset.left;
                        $(window).on("pointermove", (e) => {
                            $(this.refs.win_overlay).show();
                            let left: number, top: number;
                            if (this._isMaxi) {
                                this.toggle_window();
                                top = 0;
                                const letf = e.clientX - $(this).width() / 2;
                                offset.top = 10;
                                offset.left = $(this).width() / 2;
                            } else {
                                top =
                                    e.clientY -
                                    offset.top -
                                    this._desktop_pos.top;
                                left =
                                    e.clientX -
                                    this._desktop_pos.top -
                                    offset.left;
                                left = left < 0 ? 0 : left;
                                top = top < 0 ? 0 : top;
                            }

                            return $(this)
                                .css("top", `${top}px`)
                                .css("left", `${left}px`);
                        });
                        return $(window).on("pointerup", (e) => {
                            $(this.refs.win_overlay).hide();
                            $(window).off("pointermove", null);
                            return $(window).off("pointerup", null);
                        });
                    });
                }

                /**
                 * Enable window resize, this only works if the window
                 * is resizable
                 *
                 * @private
                 * @memberof WindowTag
                 */
                private enable_resize(): void {
                    const offset = { top: 0, left: 0 };
                    let target = undefined;
                    const mouse_move_hdl = (e) => {
                        let w = $(this).width();
                        let h = $(this).height();
                        $(this.refs.win_overlay).show();
                        if (target != this.refs.grip_bottom) {
                            w += e.clientX - offset.left;
                        }
                        if (target != this.refs.grip_right) {
                            h += e.clientY - offset.top;
                        }
                        w = w < 100 ? 100 : w;
                        h = h < 100 ? 100 : h;
                        offset.top = e.clientY;
                        offset.left = e.clientX;
                        this._isMaxi = false;
                        this.setsize({ w, h });
                    }
                    const mouse_up_hdl = (e) => {
                        $(this.refs.win_overlay).hide();
                        $(window).off("pointermove", mouse_move_hdl);
                        return $(window).off("pointerup", mouse_up_hdl);
                    }
                    $(this.refs["grip"]).on("pointerdown", (e) => {
                        e.preventDefault();
                        offset.top = e.clientY;
                        offset.left = e.clientX;
                        target = this.refs.grip;
                        $(window).on("pointermove", mouse_move_hdl);
                        $(window).on("pointerup", mouse_up_hdl);
                    });
                    $(this.refs.grip_bottom).on("pointerdown", (e) => {
                        e.preventDefault();
                        offset.top = e.clientY;
                        offset.left = e.clientX;
                        target = this.refs.grip_bottom;
                        $(window).on("pointermove", mouse_move_hdl);
                        $(window).on("pointerup", mouse_up_hdl);
                    });
                    $(this.refs.grip_right).on("pointerdown", (e) => {
                        e.preventDefault();
                        offset.top = e.clientY;
                        offset.left = e.clientX;
                        target = this.refs.grip_right;
                        $(window).on("pointermove", mouse_move_hdl);
                        $(window).on("pointerup", mouse_up_hdl);
                    });
                }
                /**
                 * Maximize the window or restore its previous width, height,
                 * and position
                 *
                 * @private
                 * @returns {void}
                 * @memberof WindowTag
                 */
                private toggle_window(force?: boolean): void {
                    let h: number, w: number;
                    if (!this.resizable && !force) {
                        return;
                    }
                    if (this._isMaxi === false) {
                        this._history = {
                            top: $(this).css("top"),
                            left: $(this).css("left"),
                            width: $(this).css("width"),
                            height: $(this).css("height"),
                        };
                        w = $(this.desktop).width() - 2;
                        h = $(this.desktop).height() - 2;
                        $(this).css("top", "0").css("left", "0");
                        this.setsize({ w, h });
                        this._isMaxi = true;
                    } else {
                        this._isMaxi = false;
                        $(this)
                            .css("top", this._history.top)
                            .css("left", this._history.left);
                        this.setsize({
                            w: parseInt(this._history.width),
                            h: parseInt(this._history.height),
                        });
                    }
                }

                /**
                 * Layout definition of the window tag
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof WindowTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "div",
                            class: "afx-window-wrapper",
                            ref: "winwrapper",
                            children: [
                                {
                                    el: "ul",
                                    ref: 'panel',
                                    class: "afx-window-top",
                                    children: [
                                        {
                                            el: "li",
                                            children: [
                                                {
                                                    el: "afx-button",
                                                    ref: "btnMenu",
                                                },
                                            ],
                                        },
                                        {
                                            el: "li",
                                            class: "afx-window-title",
                                            ref: "dragger",
                                            children: [
                                                {
                                                    el: "afx-label",
                                                    ref: "txtTitle",
                                                },
                                            ],
                                        },
                                        {
                                            el: "li",
                                            class: "afx-window-minimize",
                                            children: [
                                                {
                                                    el: "afx-button",
                                                    ref: "minbt",
                                                }
                                            ]
                                        },
                                        {
                                            el: "li",
                                            class: "afx-window-maximize",
                                            children: [
                                                {
                                                    el: "afx-button",
                                                    ref: "maxbt",
                                                }
                                            ]
                                        },
                                        {
                                            el: "li",
                                            class: "afx-window-close",
                                            children: [
                                                {
                                                    el: "afx-button",
                                                    ref: "closebt",
                                                }
                                            ]
                                        },
                                    ],
                                },
                                {
                                    el: "div",
                                    ref: "yield",
                                    class: "afx-window-content",
                                },
                                {
                                    el: "div",
                                    ref: "grip",
                                    class: "afx-window-grip",
                                },
                                {
                                    el: "div",
                                    ref: "grip_bottom",
                                    class: "afx-window-grip-bottom",
                                },
                                {
                                    el: "div",
                                    ref: "grip_right",
                                    class: "afx-window-grip-right",
                                },
                                {
                                    el: "div",
                                    ref: "win_overlay",
                                    class: "afx-window-overlay",
                                },
                                {
                                    el: "afx-stack-menu",
                                    ref: "stackmenu"
                                }
                            ],
                        },
                    ];
                }
            }

            define("afx-app-window", WindowTag);
        }
    }
}
