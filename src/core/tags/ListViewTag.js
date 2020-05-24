/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class ListViewItemTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("data", {});
        this.setopt("oncontextmenu", function(e) {});
        this.setopt("onclick", function(e) {});
        this.setopt("onselect", function(e) {});
        this.setopt("ondbclick", function(e) {});
        this.setopt("onclose", function(e) {});
        this.setopt("index", 0);
        this.setopt("closable", false);
        this.setopt("selected", false);
    }

    __closable__(v) {
        if (v) { return $(this.refs.btcl).show(); } else { return $(this.refs.btcl).hide(); }
    }

    __selected__(v) {
        $(this.refs.item).removeClass();
        if (!v) { return; }
        $(this.refs.item).addClass("selected");
        return this.get("onselect")({ item: this.root });
    }

    mount() {
        $(this.refs.item).attr("dataref", "afx-list-item");
        $(this.refs.item).contextmenu(e => {
            e.item = this.root;
            return this.get("oncontextmenu")(e);
        });

        $(this.refs.item).click(e => {
            e.item = this.root;
            return this.get("onclick")(e);
        });

        $(this.refs.item).dblclick(e => {
            e.item = this.root;
            return this.get("ondbclick")(e);
        });
        return $(this.refs.btcl).click(e => {
            e.item = this.root;
            return this.get("onclose")(e);
        });
    }
    layout() {
        return [{
            el: "li", ref: "item", children: [
                this.itemlayout(),
                { el: "i", class: "closable", ref: "btcl" }
            ]
        }];
    }
    
    itemlayout() {}
}

class SimpleListItemTag extends ListViewItemTag {
    constructor(r, o) {
        super(r, o);
    }

    __data__(v) {
        if (!v) { return; }
        if (v.class) { this.refs.label.set("class", v.class); }
        if (v.color) { this.refs.label.set("color", v.color); }
        if (v.iconclass) { this.refs.label.set("iconclass", v.iconclass); }
        if (v.icon) { this.refs.label.set("icon", v.icon); }
        if (v.text) { this.refs.label.set("text", v.text); }
        if (v.selected) { this.set("selected", v.selected); }
        if (v.closable) { return this.set("closable", v.closable); }
    }

    __selected(v) {
        return this.get("data").selected = v;
    }

    update() {
        return this.set("data", this.get("data"));
    }

    itemlayout() {
        return { el: "afx-label", ref: "label" };
    }
}

class ListViewTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("onlistselect", function() {});
        this.setopt("onlistdbclick", function() {});
        this.setopt("ondragndrop", function() {});
        this.setopt("onitemclose", () => true);
        this.setopt("buttons", []);
        this.setopt("data", []);
        this.setopt("dropdown", false);
        this.setopt("itemtag", "afx-list-item");
        this.setopt("multiselect", false);
        this.setopt("selectedItem", undefined);
        this.setopt("selectedItems", []);
        this.setopt("selected", -1);
        this.setopt("dragndrop", false);
        $(this.root)
            .css("display", "flex")
            .css("flex-direction", "column");
        this.root.push = e => this.push(e);
        this.root.remove = e => this.remove(e);
        this.root.unshift = e => this.unshift(e);
        this.root.unselect = () => this.unselect();
        this.root.selectNext = () => this.selectNext();
        this.root.selectPrev = () => this.selectPrev();
    }

    multiselect() {
        if (this.get("dropdown")) { return false; }
        return this.get("multiselect");
    }

    unshift(item) {
        return this.push(item, true);
    }

    has_data(v) {
        return this.get("data").includes(v);
    }

    push(item, flag) {
        let tag = this.get("itemtag");
        if (item.tag) { ({
            tag
        } = item); }
        const el = $(`<${tag}>`);
        if (flag) {
            if (!this.has_data(item)) { this.get("data").unshift(item); }
            $(this.refs.mlist).prepend(el[0]);
        } else {
            if (!this.has_data(item)) { this.get("data").push(item); }
            el.appendTo(this.refs.mlist);
        }
        el[0].uify(this.observable);
        el[0]
            .set("oncontextmenu", e => {
                return this.iclick(e, true);
        }).set("ondbclick", e => {
                return this.idbclick(e, false);
            }).set("onclick", e => {
                return this.iclick(e, false);
            }).set("onselect", e => {
                return this.iselect(e);
            }).set("onclose", e => {
                return this.iclose(e);
            }).set("data", item);
        item.domel = el[0];
        return el[0];
    }

    remove(item) {
        const el = item.get("data");
        const data = this.get("data");
        if (this.get("selectedItem") === item) { this.set("selectedItem", undefined); }
        const list = this.get("selectedItems");
        if (list.includes(item)) { list.splice(list.indexOf(item), 1); }
        if (data.includes(el)) {
            data.splice(data.indexOf(el), 1);
        }
        return $(item).remove();
    }

    selectNext() {
        if (this.multiselect()) { return; }
        const el = this.get("selectedItem");
        let idx = 0;
        if (el) { idx = $(el).index() + 1; }
        return this.set("selected", idx);
    }

    selectPrev() {
        if (this.multiselect()) { return; }
        const el = this.get("selectedItem");
        let idx = 0;
        if (el) { idx = $(el).index() - 1; }
        return this.set("selected", idx);
    }

    __selected__(idx) {
        if (idx < 0) { return this.unselect(); }
        const data = this.get("data");
        if (idx >= data.length) { return; }
        return data[idx].domel.set("selected", true);
    }

    __buttons__(v) {
        if (this.get("dropdown")) { return; }
        if (!(v.length > 0)) { return; }
        return (() => {
            const result = [];
            for (let item of Array.from(v)) {
                $(this.refs.btlist).show();
                const bt = $("<afx-button>").appendTo(this.refs.btlist);
                bt[0].uify(this.observable);
                bt[0].set("*", item);
                result.push(item.domel = bt[0]);
            }
            return result;
        })();
    }


    __data__(data) {
        $( this.refs.mlist).empty();
        for (let item of Array.from(data)) {
            this.push(item, false);
        }
        $(this.refs.container).off("mousedown", this.onmousedown);
        if (this.__("dragndrop") && !this.__("dropdown")) {
            return $(this.refs.container).on("mousedown", this.onmousedown);
        }
    }


    unselect() {
        for (let v of Array.from(this.get("selectedItems"))) { v.set("selected", false); }
        this.set("selectedItems", []);
        return this.set("selectedItem", undefined);
    }

    iclick(e, flag) {
        if (!e.item) { return; }
        const list = this.get("selectedItems");
        if (this.multiselect() && list.includes(e.item) && !flag) {
            list.splice(list.indexOf(e.item), 1);
            return e.item.set("selected", false);
        }
        return e.item.set("selected", true);
    }

    idbclick(e) {
        const evt = { id: this.aid(), data: e };
        this.get("onlistdbclick")(evt);
        return this.observable.trigger("listdbclick", evt);
    }
    iselect(e) {
        if (!e.item) { return; }
        if (this.multiselect()) {
            if (this.get("selectedItems").includes(e.item)) { return; }
            this.set("selectedItem", e.item);
            this.get("selectedItems").push(e.item);
            e.items = this.get("selectedItems");
        } else {
            if  (this.get("selectedItem") === e.item) { return; }
            if (this.get("selectedItem")) { this.get("selectedItem").set("selected", false); }
            this.set("selectedItem", e.item);
            this.set("selectedItems", [e.item]);
            e.items = [e.item];
            //scroll element
            const li = $(e.item).children()[0];
            const offset = $(this.refs.container).offset();
            const top = $(this.refs.container).scrollTop();
            if (($(li).offset().top + $(li).height()) > ($(this.refs.container).height() + offset.top)) {
                $(this.refs.container).scrollTop((top + $(this.refs.container).height()) - $(li).height());
            } else if ($(li).offset().top < offset.top) {
                $(this.refs.container).scrollTop((top - $(this.refs.container).height()) + $(li).height());
            }
        }

        if (this.get("dropdown")) {
            this.refs.drlabel.set("*", e.item.get("data"));
            $(this.refs.mlist).hide();
        }

        const evt = { id: this.aid(), data: e };
        this.get("onlistselect")(evt);
        return this.observable.trigger("listselect", evt);
    }

    mount() {
        this.dnd = {};
        this.onmousedown = e => {
            let el = $(e.target).closest("li[dataref='afx-list-item']");
            if (el.length === 0) { return; }
            el = el.parent()[0];
            this.dnd.from = el;
            this.dnd.to = undefined;
            $(window).on("mouseup", this.onmouseup);
            return $(window).on("mousemove", this.onmousemove);
        };
        
        this.onmouseup = e => {
            $(window).off("mouseup", this.onmouseup);
            $(window).off("mousemove", this.onmousemove);
            ($("#systooltip")).hide();
            let el = $(e.target).closest("li[dataref='afx-list-item']");
            if (el.length === 0) { return; }
            el = el.parent()[0];
            if (el === this.dnd.from) { return; }
            this.dnd.to = el;
            this.__("ondragndrop")({ id: this.aid(), data: this.dnd });
            return this.dnd = {};
        };

        this.onmousemove = e => {
            if (!e) { return; }
            if (!this.dnd.from) { return; }
            const data = this.dnd.from.get("data");
            const $label = $("#systooltip");
            const top = e.clientY + 5;
            const left = e.clientX + 5;
            $label.show();
            $label[0].set("*", data);
            return $label
                .css("top", top + "px")
                .css("left", left + "px");
        };

        $(this.refs.btlist).hide();
        this.observable.on("resize", e => this.calibrate());
        return this.calibrate();
    }

    iclose(e) {
        if (!e.item) { return; }
        const evt = { id: this.aid(), data: e };
        const r = this.get("onitemclose")(evt);
        if (!r) { return; }
        this.observable.trigger("itemclose", evt);
        return this.remove(e.item);
    }

    __dropdown__(v) {
        $(this.refs.container).removeAttr("style");
        $(this.refs.mlist).removeAttr("style");
        $(this.refs.container).css("flex", 1);
        $(this.root).removeClass();
        const drop = e => {
            return this.dropoff(e);
        };
        const show = e => {
            return this.showlist(e);
        };
        if (v) {
            $(this.root).addClass("dropdown");
            $(this.refs.current).show();
            $(document).on("click", drop);
            $(this.refs.current).on("click", show);
            $(this.refs.container)
                .css("position", "absolute")
                .css("display", "inline-block");
            $(this.refs.mlist)
                .css("position", "absolute")
                .css("display", "none")
                .css("top", "100%")
                .css("left", "0");
            return this.calibrate();
        } else {
            $(this.refs.current).hide();
            $(document).off("click", drop);
            return $(this.refs.current).off("click", show);
        }
    }

    showlist(e) {
        if (!this.get("dropdown")) { return; }
        const desktoph = $(Ant.OS.GUI.workspace).height();
        const offset = $(this.root).offset().top + $(this.refs.mlist).height();
        if (offset > desktoph) {
            $(this.refs.mlist)
                .css("top", `-${$(this.refs.mlist).outerHeight()}px`);
        } else {
            $(this.mlist).css("top", "100%");
        }
        return $(this.refs.mlist).show();
    }

    dropoff(e) {
        if ($(e.target).closest(this.refs.container).length === 0) { return $(this.refs.mlist).hide(); }
    }
        

    calibrate(e) {
        if (!this.get("dropdown")) { return; }
        const w = `${$(this.root).width()}px`;
        $(this.refs.container).css("width", w);
        $(this.refs.current).css("width", w);
        return $(this.refs.mlist).css("width", w);
    }


    layout() {
        return [
            {
                el: "div",
                class: "list-container",
                ref: "container",
                children: [
                    {
                        el: "div", ref: "current", children: [
                            { el: "afx-label", ref: "drlabel" }
                        ]
                    },
                    { el: "ul", ref: "mlist" }
                ]
            },
            { el: "div", class: "button_container", ref: "btlist" }
        ];
    }
}

Ant.OS.GUI.define("afx-list-view", ListViewTag);
Ant.OS.GUI.define("afx-list-item-proto", ListViewItemTag);
Ant.OS.GUI.define("afx-list-item", SimpleListItemTag);