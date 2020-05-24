/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

class SwitchTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("swon", false);
        this.setopt("enable", true);
        this.setopt("onchange", function(e) {});
    }
    
    mount() {
        return $(this.refs.switch).click(e => {
            return this.onchange(e);
        });
    }

    onchange(e) {
        if (!this.get("enable")) { return; }
        this.setopt("swon", !this.get("swon"));
        const evt = { id: this.aid(), data: this.get("swon") };
        this.get("onchange")(evt);
        return this.observable.trigger("switch", evt);
    }

    __swon__(v) {
        $(this.refs.switch).removeClass();
        if (v) { return $(this.refs.switch).addClass("swon"); }
    }
        
    layout() {
        return [{
            el: "span", ref: "switch"
        }];
    }
}

Ant.OS.GUI.define("afx-switch", SwitchTag);