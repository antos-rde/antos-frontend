/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class GridRowTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("data", []);
        this.refs.yield = this.root;
    }
}

class GridCellPrototype extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("class", "afx-grid-cell");
        this.setopt("oncellselect", function(e) {});
        this.setopt("oncelldbclick", function(e) {});
        this.setopt("data", {});
        this.setopt("selected", false);
    }
    
    __data__(v) {
        if (!v.selected) { return; }
        return this.set("selected", v.selected);
    }
    
    __selected__(v) {
        this.get("data").selected = v;
        if (!v) { return; }
        return this.cellseleck({}, false);
    }
    
    update() {
        return this.set("data", this.get("data"));
    }

    mount() {
        $(this.root).css("display", "block");
        $(this.root).click(e => {
            return this.cellseleck(e, false);
        });
        return $(this.root).dblclick(e => {
            return this.cellseleck(e, true);
        });
    }
    

    cellseleck(e, flag) {
        e.item = this.root;
        const evt = { id: this.aid(), data: e };
        if (!flag) { return this.get("oncellselect")(evt); }
        return this.get("oncelldbclick")(evt);
    }

    __class__(v) {
        return $(this.root).removeClass().addClass(this.get("class"));
    }
}

class SimpleGridCellTag extends GridCellPrototype {
    constructor(r, o) {
        super(r, o);
        this.setopt("header", false);
    }

    __header__(v) {}


    __data(d) {
        return (() => {
            const result = [];
            for (let k in d) {
                const v = d[k];
                result.push(this.refs.cell.set(k, v));
            }
            return result;
        })();
    }

    layout() {
        return [{
            el: "afx-label", ref: "cell"
        }];
    }
}

class GridViewTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("header", []);
        this.setopt("headeritem", "afx-grid-cell");
        this.setopt("cellitem", "afx-grid-cell");
        this.setopt("selectedCell", undefined);
        this.setopt("selectedRows", []);
        this.setopt("selectedRow", undefined);
        this.setopt("rows", []);
        this.setopt("oncellselect", function(e) {});
        this.setopt("onrowselect", function(e) {});
        this.setopt("oncelldbclick", function(e) {});
        this.setopt("multiselect", false);
        this.root.push = r => this.push(r, false);
        this.root.unshift = r => this.unshift(r);
        this.root.remove = r => this.remove(r);
    }

    __header__(v) {
        if (!v || (v.length === 0)) { return $(this.refs.header).hide(); }
        $(this.refs.header).empty();
        for (let item of Array.from(v)) {
            const el = $(`<${this.get("headeritem")}>`).appendTo(this.refs.header);
            el[0].uify(undefined);
            el[0].set("data", item);
            item.domel = el[0];
        }
        return this.calibrate();
    }

    __rows__(rows) {
        $(this.refs.grid).empty();
        return Array.from(rows).map((row) =>
            this.push(row, false));
    }

    remove(row) {
        if (!row) { return; }
        const rowdata = row.get("data");
        const data = this.get("rows");
        if (this.get("selectedRow") === row) { this.set("selectedRow", undefined); }
        if ($(this.get("selectedCell")).parent()[0] === row) { this.set("selectedCell", undefined); }
        const list = this.get("selectedRows");
        if (list.includes(row)) { list.splice(list.indexOf(row), 1); }
        if (data.includes(rowdata)) {
            data.splice(data.indexOf(rowdata), 1);
        }
        return $(row).remove();
    }


    push(row, flag) {
        const rowel = $("<afx-grid-row>")
            .css("display", "contents");
        rowel[0].uify(undefined);
        rowel[0].set("data", row);
        row.domel = rowel[0];

        for (let cell of Array.from(row)) {
            let tag = this.get("cellitem");
            if (cell.tag) { ({
                tag
            } = cell); }
            const el = $(`<${tag}>`).appendTo(rowel);
            cell.domel = el[0];
            el[0].uify(undefined);
            el[0].set("oncellselect", e => this.cellselect(e, false));
            el[0].set("oncelldbclick", e => this.cellselect(e, true));
            el[0].set("data", cell);
        }
        if (flag) {
            return $(this.refs.grid).prepend(rowel[0]);
        } else {
            return rowel.appendTo(this.refs.grid);
        }
    }

    unshift(row) {
        return this.push(row, true);
    }

    multiselect() {
        return this.get("multiselect");
    }

    cellselect(e, flag) {
        e.id = this.aid();
        const selectedCell = this.get("selectedCell");
        // return if e.data.item is selectedCell and not flag
        if (selectedCell) { selectedCell.set("class", "afx-grid-cell"); }
        this.set("selectedCell", e.data.item);
        $(e.data.item).addClass("afx-grid-cell-selected");
        if (flag) {
            this.observable.trigger("celldbclick", e);
            return this.get("oncelldbclick")(e);
        } else {
            this.observable.trigger("cellselect", e);
            this.get("oncellselect")(e);
            return this.rowselect(e);
        }
    }

    rowselect(e) {
        if (!e.data.item) { return; }
        const selectedRow = this.get("selectedRow");
        const selectedRows = this.get("selectedRows");
        const evt = { id: this.aid(), data: {} };
        const row = $(e.data.item).parent()[0];
        if (this.multiselect()) {
            if (selectedRows.includes(row)) {
                selectedRows.splice(selectedRows.indexOf(row) , 1);
                $(row).removeClass();
            } else {
                selectedRows.push(row);
                $(row).removeClass().addClass("afx-grid-row-selected");
            }
            evt.data.items = this.get("selectedRows");
        } else {
            if (selectedRow === row) { return; }
            $(selectedRow).removeClass();
            this.set("selectedRow", row);
            this.set("selectedRows", [row]);
            evt.data.item = row;
            evt.data.items = [ row ];
            $(row).removeClass().addClass("afx-grid-row-selected");
        }
        this.get("onrowselect")(evt);
        return this.observable.trigger("rowselect", evt);
    }

    has_header() {
        const h = this.get("header");
        return h && (h.length > 0);
    }
    calibrate() {
        this.calibrate_header();
        if (this.has_header()) {
            return $(this.refs.container).css("height", ($(this.root).height() - $(this.refs.header).height()) + "px");
        } else {
            return $(this.refs.container).css("height", $(this.root).height() + "px");
        }
    }

    calibrate_header() {
        const header = this.get("header");
        if (!header || (header.length === 0)) { return; }
        const colssize = [];
        let ocw = 0;
        let nauto = 0;
        const totalw = $(this.root).parent().width();
        $.each(header, function(i, item) {
            if (item.width) {
                colssize.push(item.width);
                return ocw += item.width;
            } else {
                colssize.push(-1);
                return nauto++;
            }
        });
        if (nauto > 0) {
            const cellw = parseInt((totalw - ocw) / nauto);
            $.each(colssize, function(i, e) {
                if (e !== -1) { return; }
                return colssize[i] = cellw;
            });
        }
        let template = "";
        for (let v of Array.from(colssize)) { template += `${v}px `; }
        $(this.refs.grid).css("grid-template-columns", template);
        return $(this.refs.header).css("grid-template-columns", template);
    }

    mount() {
        $(this.root)
            .css("overflow", "hidden");
            
        $(this.refs.grid).css("display", "grid");
        $(this.refs.header).css("display", "grid");
        this.observable.on("resize", e => this.calibrate());
        $(this.refs.container)
            .css("width", "100%")
            .css("overflow-x", "hidden")
            .css("overflow-y", "auto");
        return this.calibrate();
    }

    layout() {
        return [
            { el: "div", ref: "header", class: "grid_row_header" },
            { el: "div", ref: "container", children: [
                { el: "div", ref: "grid" }
            ] }
        ];
    }
}
Ant.OS.GUI.define("afx-grid-view", GridViewTag);
Ant.OS.GUI.define("afx-grid-cell", SimpleGridCellTag);
Ant.OS.GUI.define("afx-grid-row", GridRowTag);
Ant.OS.GUI.define("afx-grid-cell-proto", GridCellPrototype);