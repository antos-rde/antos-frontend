/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

class NSpinnerTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("onchange", function(e) {});
        this.setopt("value", 0);
        this.setopt("step", 1);
    }
    
    mount() {
        $(this.refs.holder).attr("type", "text");
        $(this.refs.incr).click(e => {
            return this.set("value", (this.get("value") + this.get("step") ));
        });

        $(this.refs.decr).click(e => {
            return this.set("value", (this.get("value") - this.get("step") ));
         });
        
        // @observable.on "calibrate", () -> @calibrate()
        this.observable.on("resize", () => this.calibrate());

        $(this.refs.holder).on('keyup', e => {
            if (e.keyCode === 13) {
                let val = this.refs.holder.value;
                if (!isNaN(val)) {
                    val = parseInt(val);
                    if (val < 0) { val = this.value; }
                    return this.set("value", val);
                }
            }
        });
        return this.calibrate();
    }

    calibrate() {
        $(this.refs.holder).css("width", ($(this.root).width() - 20) + "px");
        $(this.refs.holder).css("height", $(this.root).height() + "px");
        $(this.refs.spinner)
            .css("width", "20px")
            .css("height", $(this.root).height() + "px");
        $(this.refs.incr)
            .css("height", (($(this.root).height() / 2) - 2) + "px")
            .css("position", "relative");
        $(this.refs.decr).css("height", (($(this.root).height() / 2) - 2) + "px")
            .css("position", "relative");
        $(this.refs.spinner).find("li")
            .css("display", "block")
            .css("text-align", "center")
            .css("vertical-align", "middle");
        $(this.refs.spinner).find("i")
            .css("font-size", "16px")
            .css("position", "absolute");
        const fn = function(ie, pos) {
            const el = $(ie).find("i");
            return el
            .css(pos, (($(ie).height() - el.height()) / 2) + "px")
            .css("left", (($(ie).width() - el.width()) / 2) + "px");
        };
        fn(this.refs.decr, "bottom");
        return fn(this.refs.incr, "top");
    }

    __value__(v) {
        $(this.refs.holder).val(this.get("value"));
        const evt = { id: this.aid(), data: v };
        this.get("onchange")(evt);
        return this.observable.trigger("nspin", evt);
    }
        
    layout() {
        return [
            {
                el: "input", ref: "holder"
            },
            {
                el: "ul", ref: "spinner", children: [
                    { el: "li", class: "incr", ref: "incr", children: [
                        { el: "i" }
                    ] },
                    { el: "li", class: "decr", ref: "decr",  children: [
                        { el: "i" }
                    ] }
                ]
            }
        ];
    }
}

Ant.OS.GUI.define("afx-nspinner", NSpinnerTag);