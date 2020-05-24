/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class ButtonTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("color", undefined);
        this.setopt("icon", undefined);
        this.setopt("iconclass", undefined);
        this.setopt("text", "");
        this.setopt("enable", true);
        this.setopt("selected", false);
        this.setopt("toggle", false);
        this.setopt("onbtclick", function() {});
    }
    

    __color__(v) {
        return this.refs.label.set("color", v);
    }
    
    __icon__(v) {
        return this.refs.label.set("icon", v);
    }
    
    __iconclass__(v) {
        return this.refs.label.set("iconclass", v);
    }
    
    __text__(v) {
        return this.refs.label.set("text", v);
    }
    
    __enable__(v) {
        return $(this.refs.button).prop("disabled", !(this.get("enable")));
    }
    
    __selected__(v) {
        $(this.button).removeClass();
        if (v) { return $(this.button).addClass("selected"); }
    }

    mount() {
        this.root.trigger = () => {
            return $(this.refs.button).trigger("click");
        };

        return $(this.refs.button).click(e => {
            return this.btclickhd(e);
        });
    }
    
    btclickhd(e) {
        const hd = this.get("onbtclick");
        if (typeof hd === "string") {
            eval(hd);
        } else if (hd) {
            hd({ id: this.aid(), data: e });
        }
        this.observable.trigger("btclick", { id: this.aid(), data: e });
        if (this.toggle) {
            return this.set("selected", !this.get("selected"));
        }
    }

    layout() {
        return [{
            el: "Button", ref: "button", children: [
                { el: "afx-label", ref: "label" }
            ]
        }];
    }
}


Ant.OS.GUI.define("afx-button", ButtonTag);