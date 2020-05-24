/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class TileLayoutTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("name", undefined);
        this.setopt("dir", undefined);
        $(this.root).css("display", "block");
        $(this.refs.yield)
            .css("display", "flex")
            .css("width", "100%");
    }
        // @setopt @conf.opt, "grow"

    __name__(v) {
        if (!v) { return; }
        $(this.refs.yield)
            .removeClass()
            .addClass(`afx-${v}-container`);
        return this.calibrate();
    }

    __dir__(v) {
        if (!v) { return; }
        $(this.refs.yield)
            .css("flex-direction", v);
        return this.calibrate();
    }

    mount() {
        this.observable.on("resize", e => this.calibrate());
        return this.calibrate();
    }

    calibrate() {
        if (this.get("dir") === "row") { return this.hcalibrate(); }
        if (this.get("dir") === "column") { return this.vcalibrate(); }
    }

    hcalibrate() {
        const auto_width = [];
        let ocwidth = 0;
        const avaiheight = $(this.root).height();
        const avaiWidth = $(this.root).width();
        $(this.refs.yield).css("height",  `${avaiheight}px`);
        $(this.refs.yield)
            .children()
            .each(function(e) {
                let dw = $(this).attr("data-width");
                if (dw && (dw !== "grow")) {
                    if (dw[dw.length - 1] === "%") { dw = (Number(dw.slice(0, -1)) * avaiWidth) / 100; }
                    $(this).css("width", `${dw}px`);
                    return ocwidth += Number(dw);
                } else {
                    $(this).css("flex-grow", "1");
                    return auto_width.push(this);
                }
        });

        const csize = (avaiWidth - ocwidth) / auto_width.length;
        if (csize > 0) {
            $.each(auto_width, (i, v) => $(v).css("width", `${csize}px`));
        }
        return this.observable.trigger("hboxchange",  { id: this.aid(), data: { w: avaiWidth, h: avaiheight } });
    }

    vcalibrate() {
        const auto_height = [];
        let ocheight = 0;
        const avaiheight = $(this.root).height();
        const avaiwidth = $(this.root).width();
        $(this.refs.yield).css("height", `${avaiheight}px`);
        $(this.refs.yield)
            .children()
            .each(function(e) {
                let dh = $(this).attr("data-height");
                if (dh && (dh !== "grow")) {
                    if (dh[dh.length - 1] === "%") { dh = (Number(dh.slice(0, -1)) * avaiheight) / 100; }
                    $(this).css("height", `${dh}px`);
                    return ocheight += Number(dh);
                } else {
                    $(this).css("flex-grow", "1");
                    return auto_height.push(this);
                }
        });

        const csize = (avaiheight - ocheight) / auto_height.length;
        if (csize > 0) {
            $.each(auto_height, (i, v) => $(v).css("height", `${csize}px`));
        }

        return this.observable.trigger("vboxchange", { id: this.aid(), data: { w: avaiwidth, h: avaiheight } });
    }

    layout() {
        return [{
            el: "div", ref: "yield"
        }];
    }
}


class HBoxTag extends TileLayoutTag {
    constructor(r, o) {
        super(r, o);
        this.set("dir", "row");
        this.set("name", "hbox");
    }
}

class VBoxTag extends TileLayoutTag {
    constructor(r, o) {
        super(r, o);
        this.set("dir", "column");
        this.set("name", "vbox");
    }
}
    
    
Ant.OS.GUI.define("afx-tile", TileLayoutTag);
Ant.OS.GUI.define("afx-hbox", HBoxTag);
Ant.OS.GUI.define("afx-vbox", VBoxTag);