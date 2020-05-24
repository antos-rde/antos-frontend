/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class TreeViewItemPrototype extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("data", undefined);
        this.setopt("nodes", undefined);
        this.setopt("treeroot", undefined);
        this.setopt("indent", 0);
        this.setopt("toggle", false);
        this.setopt("fetch", undefined);
        this.setopt("open", true);
        this.setopt("itemindex", 0);
        this.setopt("parent", undefined);
        this.setopt("selected", false);
        this.setopt("treepath", this.aid());
    }
    
    update(p) {
        if (!p) { return; }
        switch (p) {
            case "expand":
                return this.set("open", true);
            case "collapse":
                return this.set("open", false);
            default:
                if (p !== this.get("treepath")) { return; }
                return this.set("open", true);
        }
    }

    __data__(v) {
        if (!v) { return; }
        if (v.nodes) { this.set("nodes", v.nodes); }
        this.set("open", v.open);
        if (v.path) { this.set("treepath", v.path); }
        return this.set("selected", v.selected);
    }

    __selected__(v) {
        if (!this.opts.data) { return; }
        $(this.refs.wrapper).removeClass();
        this.opts.data.selected = v;
        if (v) {
            this.get("treeroot").unselect();
            // set selectedItem but not trigger the update
            this.get("treeroot").set("selectedItem", this.root, true);
            return $(this.refs.wrapper).addClass("afx_tree_item_selected");
        }
    }
    
    __open__(v) {
        if (!this.is_folder()) { return; }
        $(this.refs.toggle)
            .removeClass();
        if(v) {
            if (this.get("fetch")) {
                this.get("fetch")(this.root)
                    .then(d => {
                        if (!d) { return; }
                        return this.set("nodes", d);
                }).catch(e => Ant.OS.announcer.oserror(e.toString(), e));
            } else {
                this.set("nodes", this.__("nodes"));
            }
            $(this.refs.childnodes).show();
        } else {
            $(this.refs.childnodes).hide();
        }
        if (v) { return $(this.refs.toggle).addClass("afx-tree-view-folder-open"); }
        return $(this.refs.toggle).addClass("afx-tree-view-folder-close");
    }
    
    __itemindex__(v) {
        if (!v) { return; }
        if ((v % 2) !== 0) { return $(this.refs.wrapper).addClass("afx_tree_item_odd"); }
    }

    __indent__(v) {
        if (!v) { return; }
        return $(this.refs.padding)
                .css("display", "inline-block")
                .css("height", "1px")
                .css("padding", 0)
                .css("margin", 0)
                .css("background-color", "transparent")
                .css("width", (v * 15) + "px" );
    }

    is_folder() {
        if (this.get("nodes")) { return true; } else { return false; }
    }
    

    __nodes__(nodes) {
        if (!nodes) { return; }
        // return unless @get("nodes") and @get("nodes").length > 0
        $(this.refs.childnodes).empty();
        $(this.refs.wrapper).addClass("afx_folder_item");
        const root = this.get("treeroot");
        return (() => {
            const result = [];
            for (let v of Array.from(nodes)) {
                const el = $("<afx-tree-view>").appendTo(this.refs.childnodes);
                el[0].uify(undefined);
                el[0].set("treeroot", root);
                el[0].set("indent", (this.get("indent") + 1));
                root.indexcounter++;
                el[0].set("parent", this.get("parent"));
                el[0].set("itemindex", root.indexcounter);
                el[0].set("treepath", `${this.get("treepath")}/${el[0].aid()}`);
                el[0].set("fetch", this.get("fetch"));
                result.push(el[0].set("data", v));
            }
            return result;
        })();
    }


    mount() {
        super.mount();
        $(this.refs.container)
            .css("padding", 0)
            .css("margin", 0)
            .css("white-space", "nowrap");
        $(this.refs.itemholder)
            .css("display", "inline-block");
        $(this.refs.wrapper)
            .click(e => {
                e.item = this.root;
                return this.get("treeroot").itemclick(e, false);
        });
        $(this.refs.wrapper)
            .dblclick(e => {
                e.item = this.root;
                return this.get("treeroot").itemclick(e, true);
        });

        return $(this.refs.toggle)
            .css("display", "inline-block")
            .css("width", "15px")
            .addClass("afx-tree-view-item")
            .click(e => {
                this.set("open", !this.get("open"));
                e.preventDefault();
                return e.stopPropagation();
        });
    }


    layout() {
        return [ {
            el: "div", ref: "wrapper", children: [
                {
                    el: "ul", ref: "container", children: [
                       { el: "li", ref: "padding" },
                       { el: "li", ref: "toggle" },
                       { el: "li", ref: "itemholder", class: "itemname", children: this.itemlayout() }
                    ]
                }
            ] },
            {
                el: "ul", ref: "childnodes"
            }
        ];
    }
    
    itemlayout() {}
}

class SimpleTreeViewItem extends TreeViewItemPrototype {
    constructor(r, o) {
        super(r, o);
    }


    __data__(v) {
        if (!v) { return; }
        super.__data__(v);
        if (v.color) { this.refs.label.set("color", v.color); }
        if (v.name) { this.refs.label.set("text", v.name); }
        if (v.icon) { this.refs.label.set("icon", v.icon); }
        if (v.iconclass) { return this.refs.label.set("iconclass", v.iconclass); }
    }

    itemlayout() {
        return [{ el: "afx-label", ref: "label" }];
    }
}


class TreeViewTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("itemtag", "afx-tree-view-item");
        this.setopt("data", undefined);
        this.setopt("treeroot", undefined);
        this.setopt("parent", undefined);
        this.setopt("indent", 0);
        this.setopt("open", true);
        this.setopt("itemindex", 0);
        this.setopt("ontreeselect", function() {});
        this.setopt("ontreedbclick", function() {});
        this.setopt("ondragndrop", function() {});
        this.setopt("selectedItem", undefined);
        this.setopt("fetch", undefined);
        this.setopt("dragndrop", false);
        this.setopt("treepath", this.aid());
        this.root.is_leaf = () => this.is_leaf();
        this.root.expandAll = () => this.expandAll();
        this.root.collapseAll = () => this.collapseAll();
        this.root.unselect = () => this.unselect();
        this.indexcounter = 0;
    }


    unselect() {
        if (this.get("selectedItem")) { return this.get("selectedItem").set("selected", false); }
    }

    __selectedItem(v) {
        if (!v) { return; }
        if (v === this.get("selectedItem")) { return; }
        return v.set("selected", true);
    }

    expandAll() {
        if (this.is_leaf()) { return; }
        return this.root.update("expand");
    }

    collapseAll() {
        if (this.is_leaf()) { return; }
        return this.root.update("collapse");
    }

    itemclick(e, flag) {
        if (!e || !e.item) { return; }
        if ((e.item === this.get("selectedItem")) && !flag) { return; }
        this.set("selectedItem", e.item);
        const evt = { id: this.aid(), data: e };
        if (flag) {
            this.get("ontreedbclick")(evt);
            return this.observable.trigger("treedbclick", evt);
        } else {
            this.get("ontreeselect")(evt);
            return this.observable.trigger("treeselect", evt);
        }
    }

    is_root() {
        return this.get("treeroot") === undefined;
    }

    is_leaf() {
        const data = this.get("data");
        if (!data) { return true; }
        if (data.nodes) { return false; } else { return true; }
    }

    __data__(v) {
        if (!v) { return; }
        $(this.root).empty();
        if (v.path) { this.set("treepath", v.path); }
        let tag = this.get("itemtag");
        if (v.tag) { ({
            tag
        } = v); }
        const el = $(`<${tag}>`).appendTo(this.root);
        el[0].uify(undefined);
        el[0].set("treeroot", this.is_root() ? this : this.get("treeroot"));
        el[0].set("indent", this.get("indent"));
        el[0].set("itemindex", this.get("itemindex"));
        el[0].set("treepath", this.get("treepath"));
        el[0].set("open", this.get("open"));
        el[0].set("fetch", this.get("fetch"));
        el[0].set("parent", this.root);
        el[0].set("data", v);
        if (this.is_root()) {
            $(this.root).off("mousedown", this.treemousedown);
            if (this.get("dragndrop")) { return $(this.root).on("mousedown", this.treemousedown); }
        }
    }

    mount() {
        this.dnd = {};
        this.treemousedown = e => {
            let el = $(e.target).closest("afx-tree-view");
            if (el.length === 0) { return; }
            el = el[0];
            if (el === this.root) { return; }
            this.dnd.from = el;
            this.dnd.to = undefined;
            $(window).on("mouseup", this.treemouseup);
            return $(window).on("mousemove", this.treemousemove);
        };
        
        this.treemouseup = e => {
            $(window).off("mouseup", this.treemouseup);
            $(window).off("mousemove", this.treemousemove);
            ($("#systooltip")).hide();
            let el = $(e.target).closest("afx-tree-view");
            if (el.length === 0) { return; }
            el = el[0];
            if (el.is_leaf()) { el = el.get("parent"); }
            if ((el === this.dnd.from) || (el === this.dnd.from.get("parent"))) { return; }
            this.dnd.to = el;
            this.__("ondragndrop")({ id: this.aid(), data: this.dnd });
            return this.dnd = {};
        };

        return this.treemousemove = e => {
            if (!e) { return; }
            if (!this.dnd.from) { return; }
            const data = this.dnd.from.get("data");
            const $label = $("#systooltip");
            const top = e.clientY + 5;
            const left = e.clientX + 5;
            $label.show();
            $label[0].set("text", data.name);
            if (data.icon) { $label[0].set("icon", data.icon); }
            if (data.iconclass) { $label[0].set("iconclass", data.iconclass); }
            return $label
                .css("top", top + "px")
                .css("left", left + "px");
        };
    }
}

Ant.OS.GUI.define("afx-tree-view", TreeViewTag);
Ant.OS.GUI.define("afx-tree-view-item-proto", TreeViewItemPrototype);
Ant.OS.GUI.define("afx-tree-view-item", SimpleTreeViewItem);