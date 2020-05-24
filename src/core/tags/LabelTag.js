/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class LabelTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("color", undefined);
        this.setopt("icon", undefined);
        this.setopt("iconclass", undefined);
        this.setopt("class", undefined);
        this.setopt("text", undefined);
    }

    mount() {}

    update() {
        return this.set("text", this.get("text"));
    }

    __class__(v) {
        $(this.root).removeClass();
        if (v) { return $(this.root).addClass(v); }
    }

    __color__(v) {
        if (!v) { return; }
        return $(this.refs.container).css("color", v);
    }

    __icon__(v) {
        $(this.refs.i).attr("style", "");
        if (v) {
            $(this.refs.i)
                .css("background", `url(${Ant.OS.API.handle.get}/${v})`)
                .css("background-size", "100% 100%")
                .css("background-repeat", "no-repeat");
            return $(this.refs.i).show();
        } else {
            return $(this.refs.i).hide();
        }
    }

    __iconclass__(v) {
        $(this.refs.iclass).removeClass();
        if (v) {
            $(this.refs.iclass).addClass(v);
            return $(this.refs.iclass).show();
        } else {
            return $(this.refs.iclass).hide();
        }
    }



    __text__(v) {
        if (v && (v !== "")) {
            $(this.refs.text).show();
            return $(this.refs.text).html(v.__());
        } else {
            return $(this.refs.text).hide();
        }
    }

    layout() {
       return [{
            el: "span", ref: "container", children: [
                { el: "i", ref: "iclass" },
                { el: "i", ref: "i", class: "icon-style" },
                { el: "i", ref: "text", class: "label-text" }
            ]
        }];
   }
}


Ant.OS.GUI.define("afx-label", LabelTag);