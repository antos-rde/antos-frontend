/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class OverlayTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("width", undefined);
        this.setopt("height", undefined);
        $(this.refs.yield)
            .css("position", "relative")
            .css("width", "100%" )
            .css("height", "100%");
        $(this.root)
            .css("position", "absolute")
            .css("z-index", 1000000);
    }
            //.css "display", "flex"
            //.css "flex-direction", "column"
        //$(@refs.yield).css "flex", "1"

    __width__(v) {
        if (!v) { return; }
        return this.calibrate();
    }
    
    __height__(v) {
        if (!v) { return; }
        return this.calibrate();
    }

    mount() {
        return this.calibrate();
    }

    calibrate() {
        $(this.root)
            .css("width", this.get("width") )
            .css("height", this.get("height"));
        return this.observable.trigger("resize", {
            id: this.aid(),
            data: {
                w: this.get("width"),
                h: this.get("height")
            }
        });
    }

    layout() {
        return [{
            el: "afx-vbox", ref: "yield"
        }];
    }
}
Ant.OS.GUI.define("afx-overlay", OverlayTag);