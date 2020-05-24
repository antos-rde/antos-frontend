/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

class MenuEntryTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("data", {});
        this.setopt("onmenuselect", function() {});
        this.setopt("onchildselect", function() {});
        this.setopt("children", undefined);
        this.setopt("child", undefined);
        this.setopt("parent", undefined);
        this.setopt("root", undefined);
    }

    __data__(data) {
        return (() => {
            const result = [];
            for (let k in data) {
                const v = data[k];
                result.push(this.set(k, v));
            }
            return result;
        })();
    }
    
    __child__(v) {
        return this.set("children", v);
    }

    has_children() {
        const ch = this.get("children");
        return ch && (ch.length > 0);
    }

    is_root() {
        if (this.get("parent")) { return false; } else { return true; }
    }
    
    layout() {
        return [{
            el: "li", ref: "container", children: [
                {
                    el: "a", ref: "entry", children: this.itemlayout()
                },
                { el: "afx-menu", ref: "submenu" }
            ]
        }];
    }
    __children__(v) {
        $(this.refs.container).removeClass("afx_submenu");
        if (!v || !(v.length > 0)) { return $(this.refs.submenu).hide(); }
        $(this.refs.container).addClass("afx_submenu");
        $(this.refs.submenu)
            .show()
            .attr("style", "");
        this.refs.submenu.set("parent", this);
        this.refs.submenu.set("root", this.get("root"));
        this.refs.submenu.set("items", v);
        if (this.is_root()) {
            return $(this.refs.container).mouseleave(e => {
                return $(this.refs.submenu).attr("style", "");
            });
        }
    }

    mount() {
        return $(this.refs.entry).click(e => this.select(e));
    }

    submenuoff() {
        const p = this.get("parent");
        if (!p) { return $(this.refs.submenu).attr("style", ""); }
        return p.submenuoff();
    }

    select(e) {
        e.item = this.root;
        const evt = { id: this.aid(), data: e };
        e.preventDefault();
        if (this.is_root() && this.has_children() && !this.get("context")) {
            $(this.refs.submenu).show();
        } else {
            this.submenuoff();
        }
        this.get("onmenuselect")(evt);
        if (this.get("parent")) {
            this.get("parent").get("onchildselect")(evt);
        }
        if (this.get("root")) {
            return this.get("root").get("onmenuitemselect")(evt);
        }
    }

    itemlayout() {}
}

class SimpleMenuEntryTag extends MenuEntryTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("switch", false);
        this.setopt("radio", false);
        this.setopt("color", undefined);
        this.setopt("icon", undefined);
        this.setopt("iconclass", undefined);
        this.setopt("text", "");
        this.setopt("shortcut", undefined);
        this.setopt("checked", false);
    }

    __switch__(v) {
        if (this.get("radio") || v) {
            return $(this.refs.switch).show();
        } else {
            return $(this.refs.switch).hide();
        }
    }
    
    __radio__(v) {
        if (this.get("switch") || v) {
            return $(this.refs.switch).show();
        } else {
            return $(this.refs.switch).hide();
        }
    }

    __checked__(v) {
        this.get("data").checked = v;
        if (!this.get("radio") && !this.get("switch")) { return; }
        return this.refs.switch.set("swon", v);
    }

    __color__(v) {
        if  (!v) { return; }
        return this.refs.label.set("color", v);
    }
    
    __icon__(v) {
        $(this.refs.container).removeClass("fix_padding");
        if (!v) { return; }
        this.refs.label.set("icon", v);
        return $(this.refs.container).addClass("fix_padding");
    }
    
    __iconclass__(v) {
        if (!v) { return; }
        return this.refs.label.set("iconclass", v);
    }

    __text__(v) {
        if (v === undefined) { return; }
        return this.refs.label.set("text", v);
    }
    
    __shortcut__(v) {
        $(this.refs.shortcut).hide();
        if (!v) { return; }
        $(this.refs.shortcut).show();
        return $(this.refs.shortcut).text(v);
    }

    reset_radio() {
        if  (!this.has_children()) { return; }
        for (let v of Array.from(this.get("children"))) {
            if (!v.domel.get("radio")) { return; }
            v.domel.set("checked", false);
        }
    }

    mount() {
        super.mount();
        return this.refs.switch.set("enable", false);
    }

    select(e) {
        if (this.get("switch")) {
            this.set("checked", !this.get("checked"));
        } else if (this.get("radio")) {
            const p = this.get("parent");
            if (p) { p.reset_radio(); }
            this.set("checked", !this.get("checked"));
        }
        return super.select(e);
    }

    itemlayout() {
        return [
            { el: "afx-switch", ref: "switch" },
            { el: "afx-label", ref: "label" },
            { el: "span", class: "shortcut", ref: "shortcut" }
        ];
    }
}

class MenuTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("context", false);
        this.setopt("parent", undefined);
        this.setopt("root", undefined);
        this.setopt("contentag", "afx-menu-entry");
        this.setopt("onmenuitemselect", e => this.handleselect(e));
        this.setopt("onmenuselect", function(e) {});
        this.setopt("items", []);
        this.root.show = e => {
            return this.showctxmenu(e);
        };
        this.root.push = e => this.push(e);
        this.root.remove = e => this.remove(e);
        this.root.unshift = e => this.unshift(e);
    }

    handleselect(e) {
        if (this.isctxmenu()) { $(this.root).hide(); }
        e.id = this.aid();
        this.get("onmenuselect")(e);
        return this.observable.trigger("menuselect", e);
    }

    showctxmenu(e) {
        if (!this.get("context")) { return; }
        return $(this.root)
            .css("top", (e.clientY - 15) + "px")
            .css("left", (e.clientX  - 5) +  "px")
            .show();
    }

    isctxmenu() {
        return this.get("context");
    }

    is_root() {
        return this.get("root") === undefined;
    }

    mount() {
        $(this.refs.container).css("display", "contents");
        if (!this.isctxmenu()) { return; }
        return $(this.refs.wrapper).mouseleave(e => {
            if (!this.is_root()) { return; }
            return $(this.root).hide();
        });
    }

    __context__(v) {
        $(this.refs.wrapper).removeClass("context");
        if (!v) { return; }
        $(this.refs.wrapper).addClass("context");
        return $(this.root).hide();
    }

    unshift(item) {
        return this.push(item, true);
    }

    remove(item) {
        const el = item.get("data");
        const data = this.get("items");
        if (data.includes(el)) {
            data.splice(data.indexOf(el), 1);
        }
        return $(item).remove();
    }

    push(item, flag) {
        let tag = this.get("contentag");
        if (item.tag) { ({
            tag
        } = item); }
        const items = this.get("items");
        const el = $(`<${tag}>`);
        if (flag) {
            $(this.refs.container).prepend(el[0]);
            if (!items.includes(item)) { this.get("items").unshift(item); }
        } else {
            el.appendTo(this.refs.container);
            if (!items.includes(item)) { this.get("items").push(item); }
        }
        el[0].uify(undefined);
        el[0].set("parent", this.get("parent"));
        el[0].set("root", this.get("parent") ? this.get("parent").get("root") : this);
        el[0].set("data", item);
        item.domel = el[0];
        return el[0];
    }

    __items__(data) {
        $(this.refs.container).empty();
        return Array.from(data).map((item) =>
            this.push(item, false));
    }

    layout() {
        return [{ el: "ul", ref: "wrapper", children: [
            { el: "li", class: "afx-corner-fix" },
            { el: "div", ref: "container" },
            { el: "li", class: "afx-corner-fix" }
        ] }];
    }
}

Ant.OS.GUI.define("afx-menu", MenuTag);
Ant.OS.GUI.define("afx-menu-entry-proto", MenuEntryTag);
Ant.OS.GUI.define("afx-menu-entry", SimpleMenuEntryTag);