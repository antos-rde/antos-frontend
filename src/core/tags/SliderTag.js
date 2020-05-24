/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class SliderTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("dragable", true);
        this.setopt("max", 100);
        this.setopt("value", 0);
        this.setopt("onchanging", function(e) {});
        this.setopt("onchange", function(e) {});
    }
    

    __value__() {
        return this.calibrate();
    }
    
    __max__() {
        return this.calibrate();
    }

    __dragable__(v) {
        if (v) {
            return $(this.root)
                .mouseover(() => {
                    return $(this.refs.point).show();
            }).mouseout(() => {
                    return $(this.refs.point).hide();
            });
        } else {
            $(this.refs.point).hide();
            return $(this.root)
                .unbind("mouseover")
                .ubbind("mouseout");
        }
    }
    
    mount() {
        this.enable_dragging();
        $(this.refs.point).css("position", "absolute");
        $(this.refs.point).hide();
        this.observable.on("resize", e => {
            return this.calibrate();
        });
        $(this.refs.container).click(e => {
            const offset = $(this.refs.container).offset();
            const left = e.clientX  - offset.left;
            const maxw = $(this.refs.container).width();
            this.set("value", (left * this.get("max")) / maxw);
            this.calibrate();
            const evt = { id: this.aid(), data: this.get("value") };
            this.get("onchange")(evt);
            return this.get("onchanging")(evt);
        });
        return this.calibrate();
    }

    calibrate() {
        if (this.get("value") > this.get("max")) { this.set("value", this.get("max")); }
        $(this.refs.container).css("width", $(this.root).width() + "px");
        const w = ($(this.refs.container).width() * this.get("value")) / this.get("max");
        $(this.refs.prg)
            .css("width", w + "px")
            .css("height", $(this.refs.container).height() + "px");
        if (this.get("dragable")) {
            const ow = w - ($(this.refs.point).width() / 2);
            const top = Math.floor(($(this.refs.prg).height() - $(this.refs.point).height()) / 2);
            return $(this.refs.point)
                .css("left", ow + "px")
                .css("top", top + "px");
        }
    }

    enable_dragging() {
        $(this.refs.point)
            .css("user-select", "none")
            .css("cursor", "default");
        return $(this.refs.point).on("mousedown", e => {
            e.preventDefault();
            const offset = $(this.refs.container).offset();
            $(window).on("mousemove", e => {
                let left = e.clientX  - offset.left;
                left = left < 0 ? 0 : left;
                const maxw = $(this.refs.container).width();
                left = left > maxw ? maxw : left;
                this.set("value", (left * this.get("max")) / maxw);
                this.calibrate();
                return this.get("onchanging")({ id: this.aid(), data: this.get("value") });
        });

            return $(window).on("mouseup", e => {
                this.get("onchange")({ id: this.aid(), data: this.get("value") });
                $(window).unbind("mousemove", null);
                return $(window).unbind("mouseup", null);
            });
        });
    }

    layout() {
        return [{
            el: "div", class: "container", ref: "container", children: [
                { el: "div", class: "progress", ref: "prg" },
                { el: "div", class: "dragpoint", ref: "point" }
            ]
        }];
    }
}

Ant.OS.GUI.define("afx-slider", SliderTag);