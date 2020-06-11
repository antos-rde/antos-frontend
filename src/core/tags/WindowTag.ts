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
                }

                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof WindowTag
                 */
                protected calibrate(): void {}

                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof WindowTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Set the window width
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

                /**
                 * Get the window width
                 *
                 * @type {number}
                 * @memberof WindowTag
                 */
                get width(): number {
                    return this._width;
                }

                /**
                 * Set the window height
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

                /**
                 * Get the window height
                 *
                 * @type {number}
                 * @memberof WindowTag
                 */
                get height(): number {
                    return this._height;
                }

                /**
                 * enable/disable window minimizable
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

                /**
                 * Check whether the window is minimizable
                 *
                 * @type {boolean}
                 * @memberof WindowTag
                 */
                get minimizable(): boolean {
                    return this.hasattr("minimizable");
                }

                /**
                 * enable/disable widow resizable
                 *
                 * @memberof WindowTag
                 */
                set resizable(v: boolean) {
                    this.attsw(v, "resizable");
                    if (v) {
                        $(this.refs["maxbt"]).show();
                        $(this.refs["grip"]).show();
                    } else {
                        $(this.refs["maxbt"]).hide();
                        $(this.refs["grip"]).hide();
                    }
                }

                /**
                 * Check whether the current window is resizable
                 *
                 * @type {boolean}
                 * @memberof WindowTag
                 */
                get resizable(): boolean {
                    return this.hasattr("resizable");
                }

                /**
                 * Set the window title
                 *
                 * @memberof WindowTag
                 */
                set apptitle(v: string | FormattedString) {
                    $(this).attr("apptitle", v.__());
                    if (v) {
                        (this.refs["txtTitle"] as LabelTag).text = v;
                    }
                }

                /**
                 * Get window title
                 *
                 * @type {(string| FormattedString)}
                 * @memberof WindowTag
                 */
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
                    this.contextmenuHandle = function (e) {};
                    $(this.refs["minbt"]).click((e) => {
                        return this.observable.trigger("hide", {
                            id: this.aid,
                        });
                    });

                    $(this.refs["maxbt"]).click((e) => {
                        return this.toggle_window();
                    });

                    $(this.refs["closebt"]).click((e) => {
                        return this.observable.trigger("exit", {
                            id: this.aid,
                        });
                    });
                    const left = ($(this.desktop).width() - this.width) / 2;
                    const top = ($(this.desktop).height() - this.height) / 2;
                    $(this)
                        .css("position", "absolute")
                        .css("left", `${left}px`)
                        .css("top", `${top}px`)
                        .css("z-index", Ant.OS.GUI.zindex++);
                    $(this).on("mousedown", (e) => {
                        if (this._shown) {
                            return;
                        }
                        return this.observable.trigger("focus", {
                            id: this.aid,
                        });
                    });

                    $(this.refs["dragger"]).dblclick((e) => {
                        return this.toggle_window();
                    });

                    this.observable.on("resize", (e) => this.resize());

                    this.observable.on("focus", () => {
                        Ant.OS.GUI.zindex++;
                        $(this)
                            .show()
                            .css("z-index", Ant.OS.GUI.zindex)
                            .removeClass("unactive");
                        this._shown = true;
                    });

                    this.observable.on("blur", () => {
                        this._shown = false;
                        return $(this).addClass("unactive");
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
                    this.enable_dragging();
                    this.enable_resize();
                    this.setsize({
                        w: this.width,
                        h: this.height,
                    });
                    return this.observable.trigger("rendered", {
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
                    $(this.refs["dragger"]).on("mousedown", (e) => {
                        e.preventDefault();
                        const offset = $(this).offset();
                        offset.top = e.clientY - offset.top;
                        offset.left = e.clientX - offset.left;
                        $(window).on("mousemove", (e) => {
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
                        return $(window).on("mouseup", function (e) {
                            $(window).unbind("mousemove", null);
                            return $(window).unbind("mouseup", null);
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
                    $(this.refs["grip"])
                        .css("user-select", "none")
                        .css("cursor", "default")
                        .css("position", "absolute")
                        .css("bottom", "0")
                        .css("right", "0")
                        .css("cursor", "nwse-resize");

                    $(this.refs["grip"]).on("mousedown", (e) => {
                        e.preventDefault();
                        const offset = { top: 0, left: 0 };
                        offset.top = e.clientY;
                        offset.left = e.clientX;
                        $(window).on("mousemove", (e) => {
                            let w = $(this).width() + e.clientX - offset.left;
                            let h = $(this).height() + e.clientY - offset.top;
                            w = w < 100 ? 100 : w;
                            h = h < 100 ? 100 : h;
                            offset.top = e.clientY;
                            offset.left = e.clientX;
                            this._isMaxi = false;
                            this.setsize({ w, h });
                        });

                        $(window).on("mouseup", function (e) {
                            $(window).unbind("mousemove", null);
                            return $(window).unbind("mouseup", null);
                        });
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
                private toggle_window(): void {
                    let h: number, w: number;
                    if (!this.resizable) {
                        return;
                    }
                    if (this._isMaxi === false) {
                        this._history = {
                            top: $(this).css("top"),
                            left: $(this).css("left"),
                            width: $(this).css("width"),
                            height: $(this).css("height"),
                        };
                        w = $(this.desktop).width();
                        h = $(this.desktop).height();
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
                                    class: "afx-window-top",
                                    children: [
                                        {
                                            el: "li",
                                            class: "afx-window-close",
                                            ref: "closebt",
                                        },
                                        {
                                            el: "li",
                                            class: "afx-window-minimize",
                                            ref: "minbt",
                                        },
                                        {
                                            el: "li",
                                            class: "afx-window-maximize",
                                            ref: "maxbt",
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
                                    ],
                                },
                                { el: "div", class: "afx-clear" },
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
                            ],
                        },
                    ];
                }
            }

            define("afx-app-window", WindowTag);
        }
    }
}
