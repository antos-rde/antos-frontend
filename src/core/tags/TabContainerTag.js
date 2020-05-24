/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class TabContainerTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("dir", "column"); // or row
        this.setopt("selectedTab", undefined);
        this.setopt("tabbarwidth", undefined);
        this.setopt("tabbarheight", undefined);
        this.setopt("ontabselect", function() {});
        this.refs.bar.set("ontabselect", e => {
            const data = e.data.item.get("data");
            this.set("selectedTab", data);
            return this.get("ontabselect")({ data, id: this.aid() });
    });
    }

    __selectedTab(v) {
        if (!v) { return; }
        const selected = this.get("selectedTab");
        if (selected) { $(selected.container).hide(); }
        $(v.container).show();
        return this.observable.trigger("resize");
    }

    __tabbarwidth__(v) {
        if (!v) { return; }
        $(this.refs.bar).attr("data-width", `${this.get("tabbarwidth")}`);
        return this.refs.wrapper.calibrate();
    }

    __tabbarheight__(v) {
        $(this.refs.bar).attr("data-height", `${this.get("tabbarheight")}`);
        return this.refs.wrapper.calibrate();
    }

    __dir__(v) {
        if (!v) { return; }
        this.refs.wrapper.set("dir", v);
        return this.set("tabsize", this.get("tabsize"));
    }

    mount() {
        $(this.children).each((i, e) => {
            const item = {};
            if ($(e).attr("tabname")) { item.text = $(e).attr("tabname"); }
            if ($(e).attr("icon")) { item.icon = $(e).attr("icon"); }
            if ($(e).attr("iconclass")) { item.iconclass = $(e).attr("iconclass"); }
            item.container = e;
            $(e)
                .css("width", "100%")
                .css("height", "100%");
            const el = this.refs.bar.push(item);
            return el.set("selected", true);
        });
        this.observable.on("resize", e => this.calibrate());
        return this.calibrate();
    }

    calibrate() {
        return $(this.refs.wrapper).css("height", `${$(this.root).height()}px`);
    }

    layout() {
        return [{
            el: "afx-tile", ref: "wrapper", children: [
                { el: "afx-tab-bar", ref: "bar" },
                { el: "div", ref: "yield" }
            ]
        }];
    }
}

Ant.OS.GUI.define("afx-tab-container", TabContainerTag);