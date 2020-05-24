/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class TabBarTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("closable", false);
        this.setopt("ontabselect", function(e) {});
        this.setopt("ontabclose", function(e) {});
        this.setopt("items", []);
        this.setopt("selected", -1);
        this.root.push = e => {
            e.closable = this.get("closable");
            return this.refs.list.push(e);
        };
        this.root.remove = e => this.refs.list.remove(e);
        this.root.unshift = e => this.refs.list.unshift(e);
        this.refs.list.set("onlistselect", e => {
                this.get("ontabselect")(e);
                return this.observable.trigger("tabselect", e);
        });
    }

    __items__(v) {
        for (let i of Array.from(v)) { i.closable = this.get("closable"); }
        return this.refs.list.set("data", v);
    }

    __selected__(v) {
        return this.refs.list.set("selected", v);
    }

    mount() {
        $(this.refs.list).css("height", "100%");
        return this.refs.list.set("onitemclose", e => {
            e.id = this.aid();
            return this.get("ontabclose")(e);
        });
    }

    layout() {
        return [{
            el: "afx-list-view", ref: "list"
        }];
    }
}

Ant.OS.GUI.define("afx-tab-bar", TabBarTag);