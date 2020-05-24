/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class FloatListTag extends ListViewTag {
    constructor(r, o) {
        super(r, o);

        this.setopt("dir", "horizontal");
        this.root.refresh = () => this.calibrate();
        this.root.push = e => this.refs.mlist.push(e);
        this.root.unshift = e => this.refs.mlist.unshift(e);
        this.root.remove = e => this.refs.mlist.remove(e);
    }

    // disable some uneccessary functions
    __dropdown__(v) { if (v) { return this.set("dropdown", false); } }
    __buttons__(v) {}
    showlist(e) {}
    dropoff(e) {}
    __data__(v) {
        super.__data__(v);
        return this.calibrate();
    }
    __dir__(v) {
        return this.calibrate();
    }

    mount() {
        $(this.refs.container)
            .css("width", "100%")
            .css("height", "100%");
        $(this.refs.mlist)
            .css("position", "absolute")
            .css("display", "block")
            .css("width", "100%");
        this.observable.on("resize", e => this.calibrate());
        if (this.root.ready) { return this.root.ready(this.root); }
    }

    push(v) {
        const el = super.push(v);
        this.enable_drag(el);
        return el;
    }

    enable_drag(el) {
        return $(el)
            .css("user-select", "none")
            .css("cursor", "default")
            .css("display", "block")
            .css("position", "absolute")
            .on("mousedown", evt => {
                const globalof = $(this.refs.mlist).offset();
                evt.preventDefault();
                const offset = $(el).offset();
                offset.top = evt.clientY - offset.top;
                offset.left = evt.clientX - offset.left;
                const mouse_move = function(e) {
                    let top  = e.clientY - offset.top - globalof.top;
                    let left = e.clientX - globalof.left - offset.left;
                    left = left < 0 ? 0 : left;
                    top = top < 0 ? 0 : top;
                    return $(el)
                        .css("top", `${top}px`)
                        .css("left", `${left}px`);
                };
                
                var mouse_up = function(e) {
                    $(window).unbind("mousemove", mouse_move);
                    return $(window).unbind("mouseup", mouse_up);
                };
                $(window).on("mousemove", mouse_move);
                return $(window).on("mouseup", mouse_up);
        });
    }

    calibrate() {
        let ctop = 20;
        let cleft = 20;
        $(this.refs.mlist)
            .css("height", `${$(this.refs.container).height()}px`);
        const gw = $(this.refs.mlist).width();
        const gh = $(this.refs.mlist).height();

        return $(this.refs.mlist).children().each((i, e) => {
            $(e)
                .css("top", `${ctop}px`)
                .css("left", `${cleft}px`);
            const w = $(e).width();
            const h = $(e).height();
            if (this.get("dir") === "vertical") {
                ctop += h + 20;
                if (ctop > gh) {
                    ctop = 20;
                    return cleft += w + 20;
                }
            } else {
                cleft += w + 20;
                if (cleft > gw) {
                    cleft = 20;
                    return ctop += h + 20;
                }
            }
        });
    }
}

Ant.OS.GUI.define("afx-float-list", FloatListTag);
