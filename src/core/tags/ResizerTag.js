/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class ResizerTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.dir = "hz";
        this.resizable_el = undefined;
        this.parent = $(this.root).parent().parent();
        this.minsize = 0;
    }

    mount() {
        let att;
        $(this.root).css(" display", "block");
        const tagname = $(this.parent).prop("tagName");
        this.resizable_el = $(this.root).prev().length === 1 ?  $(this.root).prev()[0] : undefined;
        if (tagname === "AFX-HBOX") {
            this.dir = "hz";
            $(this.root).css("cursor", "col-resize");
            $(this.root).addClass("horizontal");
            if (this.resizable_el) {
                att = $(this.resizable_el).attr("min-width");
                if (att) { this.minsize = parseInt(att); }
            }
        } else if (tagname === "AFX-VBOX") {
            this.dir = "ve";
            $(this.root).css("cursor", "row-resize");
            $(this.root).addClass("vertical");
            if (this.resizable_el) {
                att = $(this.resizable_el).attr("min-height");
                if (att) { this.minsize = parseInt(att); }
            }
        } else {
            this.dir = "none";
        }
        if (this.minsize === 0) { this.minsize = 10; }
        return this.draggable();
    }

    draggable() {
        $(this.root).css("user-select", "none");
        return $(this.root).on("mousedown", e => {
                e.preventDefault();
                $(window).on("mousemove", evt => {
                    if (!this.resizable_el) { return; }
                    if (this.dir === "hz") {
                        return this.horizontalResize(evt);
                    } else if (this.dir === "ve") {
                        return this.verticalResize(evt);
                    }
                });

                return $(window).on("mouseup", function(evt) {
                    $(window).unbind("mousemove", null);
                    $(window).unbind("mouseup", null);

                    return $(window).unbind("mouseup", null);
                });
        });
    }

    horizontalResize(e) {
        if (!this.resizable_el) { return; }
        const offset = $(this.resizable_el).offset();
        let w = Math.round(e.clientX - offset.left);
        if (w < this.minsize) { w = this.minsize; }
        $(this.resizable_el).attr("data-width", w.toString());
        return this.observable.trigger("resize", { id: this.aid(), data: { w } });
    }


    verticalResize(e) {
        if (!this.resizable_el) { return; }
        const offset = $(this.resizable_el).offset();
        let h = Math.round(e.clientY - offset.top);
        if (h < this.minsize) { h = this.minsize; }
        $(this.resizable_el).attr("data-height", h.toString());
        return this.observable.trigger("resize", { id: this.aid(), data: { w } });
    }

    layout() {
        return [];
    }
}

Ant.OS.GUI.define("afx-resizer", ResizerTag);