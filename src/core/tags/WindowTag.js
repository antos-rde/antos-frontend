/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class WindowTag extends  Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("minimizable", true);
        this.setopt("resizable", true);
        this.setopt("apptitle", "Untitled");
        this.setopt("desktop", Ant.OS.GUI.workspace);
        this.setopt("width", 400);
        this.setopt("height", 300);
        this.shown = false;
        this.isMaxi = false;
        this.history = {};
        this.desktop = $(this.get("desktop"));
        this.desktop_pos = this.desktop.offset();
    }

    resize() {
        const ch = $(this.refs["yield"]).height() / $(this.refs["yield"]).children().length;
        return $(this.refs["yield"]).children().each(function(e) {
            return $(this).css("height", `${ch}px`);
        });
    }

    mount() {
        this.root.contextmenuHandle = function(e) {};
        $(this.refs["minbt"]).click(e => {
            return this.observable.trigger("hide", { id: this.aid() });
    });
        
        $(this.refs["maxbt"]).click(e => {
            return this.toggle_window();
        });

        $(this.refs["closebt"]).click(e => {
            return this.observable.trigger("exit", { id: this.aid() });
        });
        const left = ($(this.desktop).width()  - (this.get("width"))) / 2;
        const top = ($(this.desktop).height() - (this.get("height"))) / 2;
        $(this.root)
            .css("position", 'absolute')
            .css("left", `${left}px`)
            .css("top", `${top}px`)
            .css("z-index", Ant.OS.GUI.zindex++);
        $(this.root).on("mousedown", e => {
            if (this.shown) { return; }
            return this.observable.trigger("focus", { id: this.aid() });
    });

        $(this.refs["dragger"]).dblclick(e => {
            return this.toggle_window();
        });

       
        this.observable.on("resize", e => this.resize());

        this.observable.on("focus", () => {
            Ant.OS.GUI.zindex++;
            $(this.root)
                .show()
                .css("z-index", Ant.OS.GUI.zindex)
                .removeClass("unactive");
            return this.shown = true;
        });

        this.observable.on("blur", () => {
            this.shown = false;
            return $(this.root)
                .addClass("unactive");
        });
        this.observable.on("hide", () => {
            $(this.root).hide();
            return this.shown = false;
        });

        this.observable.on("toggle", () => {
            if (this.shown) {
                return this.observable.trigger("hide", { id: this.aid() });
            } else {
                return this.observable.trigger("focus", { id: this.aid() });
            }
    });
        this.enable_dragging();
        this.enable_resize();
        this.setsize({ w: (this.get("width")), h: (this.get("height")) });
        return this.observable.trigger("rendered", { id: this.aid() });
    }

    __minimizable__(value) {
        if (value) { return $(this.refs["minbt"]).show(); } else { return $(this.refs["minbt"]).hide(); }
    }
    
    __width__(v) {
        if (!v) { return; }
        return this.setsize({ w: v, h: this.get("height") });
    }
 
    __height__(v) {
        if (!v) { return; }
        return this.setsize({ w: this.get("width"), h: v });
    }

    setsize(o) {
        if (!o) { return; }
        this.opts.width = o.w;
        this.opts.height = o.h;
        $(this.root)
            .css("width", `${o.w}px`)
            .css("height", `${o.h}px`);
        return this.observable.trigger("resize", { id: this.aid(), data: o });
    }

    __resizable__(value) {
        if (value) {
            $(this.refs["maxbt"]).show();
            return $(this.refs["grip"]).show();
        } else {
            $(this.refs["maxbt"]).hide();
            return $(this.refs["grip"]).hide();
        }
    }

    __apptitle__(value) {
        if (value) { return this.refs["txtTitle"].set("text", value); }
    }

    enable_dragging() {
        $(this.refs["dragger"])
                .css("user-select", "none")
                .css("cursor", "default");
        return $(this.refs["dragger"]).on("mousedown", e => {
            e.preventDefault();
            const offset = $(this.root).offset();
            offset.top = e.clientY - offset.top;
            offset.left = e.clientX - offset.left;
            $(window).on("mousemove", e => {
                let left, top;
                if (this.isMaxi) {
                    this.toggle_window();
                    top = 0;
                    const letf = e.clientX - ($(this.root).width() / 2);
                    offset.top = 10;
                    offset.left = $(this.root).width() / 2;
                } else {
                    top  = e.clientY - offset.top - this.desktop_pos.top;
                    left = e.clientX - this.desktop_pos.top - offset.left;
                    left = left < 0 ? 0 : left;
                    top = top < 0 ? 0 : top;
                }
                
                return $(this.root)
                    .css("top",  `${top}px`)
                    .css("left", `${left}px`);
            });
            return $(window).on("mouseup", function(e) {
                $(window).unbind("mousemove", null);
                return $(window).unbind("mouseup", null);
            });
        });
    }

    enable_resize() {
        $(this.refs["grip"])
            .css("user-select", "none")
            .css("cursor", "default")
            .css("position", "absolute")
            .css("bottom", "0")
            .css("right", "0")
            .css("cursor", "nwse-resize");
        
        return $(this.refs["grip"]).on("mousedown", e => {
            e.preventDefault();
            const offset = { top: 0, left: 0 };
            offset.top = e.clientY;
            offset.left = e.clientX;
            $(window).on("mousemove", e => {
                let w  = ($(this.root).width() + e.clientX) - offset.left;
                let h  = ($(this.root).height() + e.clientY) - offset.top;
                w  = w < 100 ? 100 : w;
                h  = h < 100 ? 100 : h;
                offset.top = e.clientY;
                offset.left = e.clientX;
                this.isMaxi = false;
                return this.setsize({ w, h });
        });

            return $(window).on("mouseup", function(e) {
                $(window).unbind("mousemove", null);
                return $(window).unbind("mouseup", null);
            });
        });
    }

    toggle_window() {
        let h, w;
        if (!this.get("resizable")) { return; }
        if (this.isMaxi === false) {
            this.history = {
                top: $(this.root).css("top"),
                left: $(this.root).css("left"),
                width: $(this.root).css("width"),
                height: $(this.root).css("height")
            };
            w = $(this.desktop).width();
            h = $(this.desktop).height();
            $(this.root)
                .css("top", "0")
                .css("left", "0");
            this.setsize({ w, h });
            return this.isMaxi = true;
        } else {
            this.isMaxi = false;
            $(this.root)
                .css("top", this.history.top)
                .css("left", this.history.left);
            return this.setsize({ w: parseInt(this.history.width), h: parseInt(this.history.height) });
        }
    }

    layout() {
        return [{
            el: "div", class: "afx-window-wrapper", children: [
                {
                    el: "ul", class: "afx-window-top", children: [
                        { el: "li", class: "afx-window-close", ref: "closebt" },
                        { el: "li", class: "afx-window-minimize", ref: "minbt" },
                        { el: "li", class: "afx-window-maximize", ref: "maxbt" },
                        { el: "li", class: "afx-window-title", ref: "dragger", children: [{
                            el: "afx-label", ref: "txtTitle"
                        }] }
                    ]
                },
                { el: "div", class: "afx-clear" },
                { el: "div", ref: "yield", class: "afx-window-content" },
                { el: "div", ref: "grip", class: "afx-window-grip" }
            ]
        }];
    }
}

Ant.OS.GUI.define("afx-app-window", WindowTag);