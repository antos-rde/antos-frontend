/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {
            export class WindowTag extends AFXTag {
                desktop: string;
                private _width: number;
                private _height: number;
                private _shown: boolean;
                private _isMaxi: boolean;
                private _history: GenericObject<any>;
                private _desktop_pos: GenericObject<any>;
                constructor() {
                    super();
                }

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
                protected calibrate(): void {}
                protected reload(d?: any): void {}

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
                get resizable(): boolean {
                    return this.hasattr("resizable");
                }
                set apptitle(v: string| FormattedString) {
                    $(this).attr("apptitle", v.__());
                    if (v) {
                        (this.refs["txtTitle"] as LabelTag).text = v;
                    }
                }
                get apptitle(): string| FormattedString {
                    return $(this).attr("apptitle");
                }

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
