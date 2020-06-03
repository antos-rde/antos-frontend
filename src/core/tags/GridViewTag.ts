/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
interface Array<T> {
    domel: GenericObject<any>;
}
namespace OS {
    export namespace GUI {
        export namespace tag {
            export class GridRowTag extends AFXTag {
                data: GenericObject<any>[];
                constructor() {
                    super();
                    
                    this.refs.yield = this;
                }

                protected mount(): void {}
                protected init(): void {this.data = [];}
                protected layout(): TagLayoutType[] {
                    return [];
                }
                protected calibrate(): void {}
                protected reload(d?: any): void {}
            }

            export abstract class GridCellPrototype extends AFXTag {
                private _oncellselect: TagEventCallback;
                private _oncelldbclick: TagEventCallback;
                private _data: GenericObject<any>;
                constructor() {
                    super();
                    
                }

                set oncellselect(v: TagEventCallback) {
                    this._oncellselect = v;
                }
                set oncelldbclick(v: TagEventCallback) {
                    this._oncelldbclick = v;
                }
                set data(v: GenericObject<any>) {
                    if(!v) return;
                    this._data = v;
                    this.ondatachange();
                    if (!v.selected) {
                        return;
                    }
                    this.selected = v.selected;
                }

                get data(): GenericObject<any> {
                    return this._data;
                }

                set selected(v: boolean) {
                    this.attsw(v, "selected");
                    if(this._data)
                        this._data.selected = v;
                    if (!v) {
                        return;
                    }
                    this.cellselect({ id: this.aid, data: this }, false);
                }

                get selected(): boolean {
                    return this.hasattr("selected");
                }
                protected reload(d: any): void {
                    this.data = this.data;
                }

                protected mount(): void {
                    $(this).attr("class", "afx-grid-cell");
                    this.oncelldbclick = this.oncellselect = (
                        e: TagEventType
                    ): void => {};
                    this.selected = false;
                    $(this).css("display", "block");
                    $(this).click((e) => {
                        let evt = { id: this.aid, data: this };
                        return this.cellselect(evt, false);
                    });
                    $(this).dblclick((e) => {
                        let evt = { id: this.aid, data: this };
                        return this.cellselect(evt, true);
                    });
                }

                private cellselect(e: TagEventType, flag: boolean): void {
                    const evt = { id: this.aid, data: { item: e.data } };
                    if (!flag) {
                        return this._oncellselect(evt);
                    }
                    return this._oncelldbclick(evt);
                }

                protected abstract ondatachange(): void;
            }

            export class SimpleGridCellTag extends GridCellPrototype {
                constructor() {
                    super();
                }

                protected ondatachange(): void {
                    (this.refs.cell as LabelTag).set(this.data);
                }
                protected init(): void {}
                protected calibrate(): void {}
                layout() {
                    return [
                        {
                            el: "afx-label",
                            ref: "cell",
                        },
                    ];
                }
            }

            export class GridViewTag extends AFXTag {
                private _header: GenericObject<any>[];
                private _rows: GenericObject<any>[][];
                private _selectedRow: GridRowTag;
                private _selectedRows: GridRowTag[];
                private _selectedCell: GridCellPrototype;
                private _oncellselect: TagEventCallback;
                private _onrowselect: TagEventCallback;
                private _oncelldbclick: TagEventCallback;
                constructor() {
                    super();
                }
                protected init(): void {
                    this._header = [];
                    this.headeritem = "afx-grid-cell";
                    this.cellitem = "afx-grid-cell";
                    this._selectedCell = undefined;
                    this._selectedRows = [];
                    this._selectedRow = undefined;
                    this._rows = [];
                    this._oncellselect = this._onrowselect = this._oncelldbclick = (
                        e: TagEventType
                    ): void => {};
                }
                protected reload(d?: any): void {}
                set oncellselect(v: TagEventCallback) {
                    this._oncellselect = v;
                }
                set onrowselect(v: TagEventCallback) {
                    this._onrowselect = v;
                }
                set oncelldbclick(v: TagEventCallback) {
                    this._oncelldbclick = v;
                }
                set headeritem(v: string) {
                    $(this).attr("headeritem", v);
                }

                get headeritem(): string {
                    return $(this).attr("headeritem");
                }

                set cellitem(v: string) {
                    $(this).attr("cellitem", v);
                }

                get cellitem(): string {
                    return $(this).attr("cellitem");
                }
                get header(): GenericObject<any>[] {
                    return this._header;
                }
                set header(v: GenericObject<any>[]) {
                    this._header = v;
                    if (!v || v.length === 0) {
                        $(this.refs.header).hide();
                        return;
                    }
                    $(this.refs.header).empty();
                    for (let item of v) {
                        const el = $(`<${this.headeritem}>`).appendTo(
                            this.refs.header
                        );
                        const element = el[0] as GridCellPrototype;
                        element.uify(this.observable);
                        element.data = item;
                        item.domel = element;
                    }
                    this.calibrate();
                }
                get selectedRows(): GridRowTag[] {
                    return this._selectedRows;
                }
                get selectedRow(): GridRowTag {
                    return this._selectedRow;
                }
                get selectedCell(): GridCellPrototype {
                    return this._selectedCell;
                }
                set rows(rows: GenericObject<any>[][]) {
                    $(this.refs.grid).empty();
                    this._rows = rows;
                    rows.map((row) => this.push(row, false));
                }
                get rows(): GenericObject<any>[][] {
                    return this._rows;
                }
                set multiselect(v: boolean) {
                    this.attsw(v, "multiselect");
                }
                get multiselect(): boolean {
                    return this.hasattr("multiselect");
                }
                delete(row: GridRowTag): void {
                    if (!row) {
                        return;
                    }
                    const rowdata = row.data;
                    const data = this.rows;
                    if (this.selectedRow === row) {
                        this._selectedRow = undefined;
                    }
                    let parentRow: any = $(this.selectedCell).parent()[0];
                    if ((parentRow as GridRowTag) === row) {
                        this._selectedCell = undefined;
                    }
                    const list = this.selectedRows;
                    if (list.includes(row)) {
                        list.splice(list.indexOf(row), 1);
                    }
                    if (data.includes(rowdata)) {
                        data.splice(data.indexOf(rowdata), 1);
                    }
                    $(row).remove();
                }

                push(row: GenericObject<any>[], flag: boolean): void {
                    
                    const rowel = $("<afx-grid-row>").css(
                        "display",
                        "contents"
                    );
                    if (flag) {
                        $(this.refs.grid).prepend(rowel[0]);
                        if(!this.rows.includes(row))
                        {
                            this.rows.unshift(row);
                        }
                    } else {
                        rowel.appendTo(this.refs.grid);
                        if(!this.rows.includes(row))
                        {
                            this.rows.push(row);
                        }
                    }
                    
                    const el = rowel[0] as GridRowTag;
                    rowel[0].uify(this.observable);
                    el.data = row;
                    row.domel = rowel[0];

                    for (let cell of row) {
                        let tag = this.cellitem;
                        if (cell.tag) {
                            ({ tag } = cell);
                        }
                        const el = $(`<${tag}>`).appendTo(rowel);
                        cell.domel = el[0];
                        const element = el[0] as GridCellPrototype;
                        element.uify(this.observable);
                        element.oncellselect = (e) => this.cellselect(e, false);
                        element.oncelldbclick = (e) => this.cellselect(e, true);
                        element.data = cell;
                    }
                }

                unshift(row: GenericObject<any>[]): void {
                    this.push(row, true);
                }

                cellselect(e: TagEventType, flag: boolean): void {
                    e.id = this.aid;
                    // return if e.data.item is selectedCell and not flag
                    if (this.selectedCell) {
                        $(this.selectedCell).attr("class", "afx-grid-cell");
                    }
                    this._selectedCell = e.data.item;
                    $(e.data.item).addClass("afx-grid-cell-selected");
                    if (flag) {
                        this.observable.trigger("celldbclick", e);
                        return this._oncelldbclick(e);
                    } else {
                        this.observable.trigger("cellselect", e);
                        this._oncellselect(e);
                        return this.rowselect(e);
                    }
                }

                rowselect(e: TagEventType): void {
                    if (!e.data.item) {
                        return;
                    }
                    const evt = {
                        id: this.aid,
                        data: {
                            item: undefined,
                            items: [],
                        },
                    };
                    const row = $(e.data.item).parent()[0];
                    if (this.multiselect) {
                        if (this.selectedRows.includes(row)) {
                            this.selectedRows.splice(
                                this.selectedRows.indexOf(row),
                                1
                            );
                            $(row).removeClass();
                        } else {
                            this.selectedRows.push(row);
                            $(row)
                                .removeClass()
                                .addClass("afx-grid-row-selected");
                        }
                        evt.data.items = this.selectedRows;
                    } else {
                        if (this.selectedRow === row) {
                            return;
                        }
                        $(this.selectedRow).removeClass();
                        this._selectedRows = [row];
                        evt.data.item = row;
                        evt.data.items = [row];
                        $(row).removeClass().addClass("afx-grid-row-selected");
                        this._selectedRows = [row];
                    }
                    this._selectedRow = row;
                    this._onrowselect(evt);
                    return this.observable.trigger("rowselect", evt);
                }

                private has_header(): boolean {
                    const h = this._header;
                    return h && h.length > 0;
                }
                protected calibrate(): void {
                    this.calibrate_header();
                    if (this.has_header()) {
                        $(this.refs.container).css(
                            "height",
                            $(this).height() -
                                $(this.refs.header).height() +
                                "px"
                        );
                    } else {
                        $(this.refs.container).css(
                            "height",
                            $(this).height() + "px"
                        );
                    }
                }

                private calibrate_header(): void {
                    if (!this.has_header()) {
                        return;
                    }
                    const colssize = [];
                    let ocw = 0;
                    let nauto = 0;
                    const totalw = $(this).parent().width();
                    $.each(this._header, function (i, item) {
                        if (item.width) {
                            colssize.push(item.width);
                            return (ocw += item.width);
                        } else {
                            colssize.push(-1);
                            return nauto++;
                        }
                    });
                    if (nauto > 0) {
                        const cellw = Math.round((totalw - ocw) / nauto);
                        $.each(colssize, function (i, e) {
                            if (e !== -1) {
                                return;
                            }
                            return (colssize[i] = cellw);
                        });
                    }
                    let template = "";
                    for (let v of colssize) {
                        template += `${v}px `;
                    }
                    $(this.refs.grid).css("grid-template-columns", template);
                    $(this.refs.header).css("grid-template-columns", template);
                }

                protected mount(): void {
                    $(this).css("overflow", "hidden");

                    $(this.refs.grid).css("display", "grid");
                    $(this.refs.header).css("display", "grid");
                    this.observable.on("resize", (e) => this.calibrate());
                    $(this.refs.container)
                        .css("width", "100%")
                        .css("overflow-x", "hidden")
                        .css("overflow-y", "auto");
                    return this.calibrate();
                }

                protected layout(): TagLayoutType[] {
                    return [
                        { el: "div", ref: "header", class: "grid_row_header" },
                        {
                            el: "div",
                            ref: "container",
                            children: [{ el: "div", ref: "grid" }],
                        },
                    ];
                }
            }
            define("afx-grid-view", GridViewTag);
            define("afx-grid-cell", SimpleGridCellTag);
            define("afx-grid-row", GridRowTag);
        }
    }
}
