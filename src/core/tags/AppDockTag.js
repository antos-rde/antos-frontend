/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class AppDockTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("onappselect", function(e) {});
        this.setopt("items", []);
        this.setopt("selectedApp", undefined);
        this.root.newapp = a => this.addApp(a);
        this.root.removeapp = a => this.removeApp(a);
    }

    __selectedApp__(v) {
        let el = undefined;
        for (let it of Array.from(this.get("items"))) {
            it.app.blur();
            $(it.domel).removeClass();
            if (v && (v === it.app)) { el = it.domel; }
        }
        if (!el) { return; }
        $(el).addClass("selected");
        return $(Ant.OS.GUI.workspace)[0].unselect();
    }

    addApp(item) {
        this.get("items").push(item);
        const el = $("<afx-button>");
        el.appendTo(this.root);
        el[0].uify(this.observable);
        el[0].set("*", item);
        el.attr("tooltip", `cr:${item.app.title()}`);
        item.domel = el[0];
        el[0].set("onbtclick", e => {
            e.id = this.aid();
            e.data.app = item;
            return item.app.show();
        });
        return this.set("selectedApp", item.app);
    }

    removeApp(a) {
        let i = -1;
        const iterable = this.get("items");
        for (let k = 0; k < iterable.length; k++) {
            const v = iterable[k];
            if (v.app.pid === a.pid) {
                i = k;
                break;
            }
        }

        if (i !== -1) {
            const items = this.get("items");
            delete items[i].app;
            items.splice(i, 1);
            return $($(this.root).children()[i]).remove();
        }
    }

    mount() {
        this.root.contextmenuHandle = (e, m) => {
            if (e.target === this.root) { return; }
            const bt = $(e.target).closest("afx-button");
            const app = bt[0].get("app");
            m.set("items", [
                { text: "__(Show)", dataid: "show" },
                { text: "__(Hide)", dataid: "hide" },
                { text: "__(Close)", dataid: "quit" }
            ]);
            m.set("onmenuselect", function(evt) {
                const item = evt.data.item.get("data");
                if(app[item.dataid]) {
                    return app[item.dataid]();
                }
            });
            return m.show(e);
        };
        return Ant.OS.announcer.trigger("sysdockloaded");
    }
}

Ant.OS.GUI.define("afx-apps-dock", AppDockTag);