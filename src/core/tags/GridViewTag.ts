/**
 * Extend the Array interface with some
 * property needed by AFX API
 *
 * @interface Array
 * @template T
 */
interface Array<T> {
    /**
     * Reference to a DOM element created by AFX API,
     * this property is used by some AFX tags to refer
     * to its child element in it data object
     *
     * @type {GenericObject<any>}
     * @memberof Array
     */
    domel?: GenericObject<any>;
}
namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * A grid Row is a simple element that
             * contains a group of grid cell
             *
             * @export
             * @class GridRowTag
             * @extends {AFXTag}
             */
            export class GridRowTag extends AFXTag {
                /**
                 * Data placeholder for a collection of cell data
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof GridRowTag
                 */
                data: GenericObject<any>[];

                /**
                 *Creates an instance of GridRowTag.
                 * @memberof GridRowTag
                 */
                constructor() {
                    super();

                    this.refs.yield = this;
                }

                /**
                 * Mount the tag, do nothing
                 *
                 * @protected
                 * @memberof GridRowTag
                 */
                protected mount(): void {}

                /**
                 * Init the tag before mounting: reset the data placeholder
                 *
                 * @protected
                 * @memberof GridRowTag
                 */
                protected init(): void {
                    this.data = [];
                }

                /**
                 * Empty layout
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof GridRowTag
                 */
                protected layout(): TagLayoutType[] {
                    return [];
                }

                /**
                 * This function does nothing in this tag
                 *
                 * @protected
                 * @memberof GridRowTag
                 */
                protected calibrate(): void {}

                /**
                 * This function does nothing in this tag
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof GridRowTag
                 */
                protected reload(d?: any): void {}
            }

            /**
             * Event data used by grid cell
             */
            export type CellEventData = TagEventDataType<GridCellPrototype>;

            /**
             * Prototype of any grid cell, custom grid cell
             * definition should extend and implement this
             * abstract prototype
             *
             * @export
             * @abstract
             * @class GridCellPrototype
             * @extends {AFXTag}
             */
            export abstract class GridCellPrototype extends AFXTag {
                /**
                 * placeholder for cell selected event callback
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridCellPrototype
                 */
                private _oncellselect: TagEventCallback<CellEventData>;

                /**
                 * placeholder for cell double click event callback
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridCellPrototype
                 */
                private _oncelldbclick: TagEventCallback<CellEventData>;

                /**
                 * Data placeholder of the current cell
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof GridCellPrototype
                 */
                private _data: GenericObject<any>;

                /**
                 *Creates an instance of GridCellPrototype.
                 * @memberof GridCellPrototype
                 */
                constructor() {
                    super();
                }

                /**
                 * Set the cell selected event callback
                 *
                 * @memberof GridCellPrototype
                 */
                set oncellselect(v: TagEventCallback<CellEventData>) {
                    this._oncellselect = v;
                }

                /**
                 * Set the cell double click event callback
                 *
                 * @memberof GridCellPrototype
                 */
                set oncelldbclick(v: TagEventCallback<CellEventData>) {
                    this._oncelldbclick = v;
                }

                /**
                 * Setter:
                 *
                 * Set the data of the cell, this will trigger
                 * the [[ondatachange]] function
                 *
                 * Getter:
                 *
                 * Get the current cell data placeholder
                 *
                 * @memberof GridCellPrototype
                 */
                set data(v: GenericObject<any>) {
                    if (!v) return;
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

                /**
                 * Setter:
                 *
                 * Set/unset the current cell as selected.
                 * This will trigger the [[cellselect]]
                 * event
                 *
                 * Getter:
                 *
                 * Check whether the current cell is selected
                 *
                 * @memberof GridCellPrototype
                 */
                set selected(v: boolean) {
                    this.attsw(v, "selected");
                    if (this._data) this._data.selected = v;
                    if (!v) {
                        return;
                    }
                    this.cellselect({ id: this.aid, data: this }, false);
                }
                get selected(): boolean {
                    return this.hasattr("selected");
                }

                /**
                 * Update the current cell. This will
                 * reset the cell data
                 *
                 * @protected
                 * @param {*} d
                 * @memberof GridCellPrototype
                 */
                protected reload(d: any): void {
                    this.data = this.data;
                }

                /**
                 * Mount the current cell to the grid
                 *
                 * @protected
                 * @memberof GridCellPrototype
                 */
                protected mount(): void {
                    $(this).attr("class", "afx-grid-cell");
                    this.oncelldbclick = this.oncellselect = (
                        e: TagEventType<GridCellPrototype>
                    ): void => {};
                    this.selected = false;
                    $(this).css("display", "block");
                    $(this).on("click",(e) => {
                        let evt = { id: this.aid, data: this };
                        return this.cellselect(evt, false);
                    });
                    $(this).on("dblclick", (e) => {
                        let evt = { id: this.aid, data: this };
                        return this.cellselect(evt, true);
                    });
                }

                /**
                 * This function triggers the cell select
                 * event
                 *
                 * @private
                 * @param {TagEventType<GridCellPrototype>} e
                 * @param {boolean} flag
                 * @returns {void}
                 * @memberof GridCellPrototype
                 */
                private cellselect(
                    e: TagEventType<GridCellPrototype>,
                    flag: boolean
                ): void {
                    const evt = { id: this.aid, data: { item: e.data } };
                    if (!flag) {
                        return this._oncellselect(evt);
                    }
                    return this._oncelldbclick(evt);
                }

                /**
                 * Abstract function called when the cell data changed.
                 * This should be implemented by subclasses
                 *
                 * @protected
                 * @abstract
                 * @memberof GridCellPrototype
                 */
                protected abstract ondatachange(): void;
            }

            /**
             * Simple grid cell defines a grid cell with
             * an [[LabelTag]] as it cell layout
             *
             * @export
             * @class SimpleGridCellTag
             * @extends {GridCellPrototype}
             */
            export class SimpleGridCellTag extends GridCellPrototype {
                /**
                 *Creates an instance of SimpleGridCellTag.
                 * @memberof SimpleGridCellTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Reset the label of the cell with its data
                 *
                 * @protected
                 * @memberof SimpleGridCellTag
                 */
                protected ondatachange(): void {
                    (this.refs.cell as LabelTag).set(this.data);
                }

                /**
                 * This function do nothing in this tag
                 *
                 * @protected
                 * @memberof SimpleGridCellTag
                 */
                protected init(): void {}

                /**
                 * This function do nothing in this tag
                 *
                 * @protected
                 * @memberof SimpleGridCellTag
                 */
                protected calibrate(): void {}

                /**
                 * The layout of the cell with a simple [[LabelTag]]
                 *
                 * @returns
                 * @memberof SimpleGridCellTag
                 */
                layout() {
                    return [
                        {
                            el: "afx-label",
                            ref: "cell",
                        },
                    ];
                }
            }

            /**
             * A Grid contains a header and a collection grid rows
             * which has the same number of cells as the number of
             * the header elements
             *
             * @export
             * @class GridViewTag
             * @extends {AFXTag}
             */
            export class GridViewTag extends AFXTag {
                /**
                 * Grid header definition
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof GridViewTag
                 */
                private _header: GenericObject<any>[];

                /**
                 * Grid rows data placeholder
                 *
                 * @private
                 * @type {GenericObject<any>[][]}
                 * @memberof GridViewTag
                 */
                private _rows: GenericObject<any>[][];

                /**
                 * Reference to the current selected row DOM element
                 *
                 * @private
                 * @type {GridRowTag}
                 * @memberof GridViewTag
                 */
                private _selectedRow: GridRowTag;

                /**
                 * A collection of selected grid rows DOM element
                 *
                 * @private
                 * @type {GridRowTag[]}
                 * @memberof GridViewTag
                 */
                private _selectedRows: GridRowTag[];

                /**
                 * Reference to the current selected cell
                 *
                 * @private
                 * @type {GridCellPrototype}
                 * @memberof GridViewTag
                 */
                private _selectedCell: GridCellPrototype;

                /**
                 * Cell select event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridViewTag
                 */
                private _oncellselect: TagEventCallback<CellEventData>;

                /**
                 * Row select event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridViewTag
                 */
                private _onrowselect: TagEventCallback<CellEventData>;

                /**
                 * Cell double click event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridViewTag
                 */
                private _oncelldbclick: TagEventCallback<CellEventData>;

                /**
                 * Creates an instance of GridViewTag.
                 * @memberof GridViewTag
                 */
                constructor() {
                    super();
                }

                /**
                 * Init the grid view before mounting.
                 * Reset all the placeholders to default values
                 *
                 * @protected
                 * @memberof GridViewTag
                 */
                protected init(): void {
                    this._header = [];
                    this.headeritem = "afx-grid-cell";
                    this.cellitem = "afx-grid-cell";
                    this._selectedCell = undefined;
                    this._selectedRows = [];
                    this._selectedRow = undefined;
                    this._rows = [];
                    this.resizable = false;
                    this._oncellselect = this._onrowselect = this._oncelldbclick = (
                        e: TagEventType<CellEventData>
                    ): void => {};
                }

                /**
                 * This function does nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof GridViewTag
                 */
                protected reload(d?: any): void {}

                /**
                 * set the cell select event callback
                 *
                 * @memberof GridViewTag
                 */
                set oncellselect(v: TagEventCallback<CellEventData>) {
                    this._oncellselect = v;
                }

                /**
                 * set the row select event callback
                 *
                 * @memberof GridViewTag
                 */
                set onrowselect(v: TagEventCallback<CellEventData>) {
                    this._onrowselect = v;
                }

                /**
                 * set the cell double click event callback
                 *
                 * @memberof GridViewTag
                 */
                set oncelldbclick(v: TagEventCallback<CellEventData>) {
                    this._oncelldbclick = v;
                }

                /**
                 * Setter: set the tag name of the header cells
                 *
                 * Getter: get the grid header tag name
                 *
                 * @memberof GridViewTag
                 */
                set headeritem(v: string) {
                    $(this).attr("headeritem", v);
                }
                get headeritem(): string {
                    return $(this).attr("headeritem");
                }

                /**
                 * Setter: set the tag name of the grid cell
                 *
                 * Getter: get the tag name of the grid cell
                 *
                 * @memberof GridViewTag
                 */
                set cellitem(v: string) {
                    $(this).attr("cellitem", v);
                }
                get cellitem(): string {
                    return $(this).attr("cellitem");
                }

                /**
                 * Setter: set the header data
                 *
                 * Getter: get the header data placeholder
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof GridViewTag
                 */
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
                    let i = 0;
                    for (let item of v) {
                        const element = $(`<${this.headeritem}>`).appendTo(
                            this.refs.header
                        )[0] as GridCellPrototype;
                        element.uify(this.observable);
                        element.data = item;
                        item.domel = element;
                        i++;
                        if (this.resizable) {
                            if (i != v.length) {
                                const rz = $(`<afx-resizer>`).appendTo(
                                    this.refs.header
                                )[0] as ResizerTag;
                                $(rz).css("width", "3px");
                                let next_item = undefined;
                                if (i < v.length) {
                                    next_item = v[i];
                                }
                                rz.onelresize = (e) => {
                                    item.width = e.data.w + 3;
                                    if (next_item) {
                                        delete next_item.width;
                                    }
                                };
                                rz.uify(this.observable);
                            }
                        }
                    }
                    this.calibrate();
                }

                /**
                 * Get all the selected rows
                 *
                 * @readonly
                 * @type {GridRowTag[]}
                 * @memberof GridViewTag
                 */
                get selectedRows(): GridRowTag[] {
                    return this._selectedRows;
                }

                /**
                 * Get the latest selected row
                 *
                 * @readonly
                 * @type {GridRowTag}
                 * @memberof GridViewTag
                 */
                get selectedRow(): GridRowTag {
                    return this._selectedRow;
                }

                /**
                 * Get the current selected cell
                 *
                 * @readonly
                 * @type {GridCellPrototype}
                 * @memberof GridViewTag
                 */
                get selectedCell(): GridCellPrototype {
                    return this._selectedCell;
                }

                /**
                 * Setter: set the rows data
                 *
                 * Getter: get the rows data
                 *
                 * @memberof GridViewTag
                 */
                set rows(rows: GenericObject<any>[][]) {
                    $(this.refs.grid).empty();
                    this._rows = rows;
                    rows.map((row) => this.push(row, false));
                }
                get rows(): GenericObject<any>[][] {
                    return this._rows;
                }

                /**
                 * Setter: activate deactivate multi-select
                 *
                 * Getter: check whether the `multiselect` option is activated
                 *
                 * @memberof GridViewTag
                 */
                set multiselect(v: boolean) {
                    this.attsw(v, "multiselect");
                }
                get multiselect(): boolean {
                    return this.hasattr("multiselect");
                }

                /**
                 * Set and Get the resizable attribute
                 *
                 * This allows to enable/disable column resize feature
                 *
                 * @memberof GridViewTag
                 */
                set resizable(v: boolean) {
                    this.attsw(v, "resizable");
                }
                get resizable(): boolean {
                    return this.hasattr("resizable");
                }

                /**
                 * Delete a grid rows
                 *
                 * @param {GridRowTag} row row DOM element
                 * @returns {void}
                 * @memberof GridViewTag
                 */
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

                /**
                 * Push a row to the grid
                 *
                 * @param {GenericObject<any>[]} row list of cell data
                 * @param {boolean} flag indicates where the row is add to beginning or end
                 * of the row
                 * @memberof GridViewTags
                 */
                push(row: GenericObject<any>[], flag: boolean): void {
                    const rowel = $("<afx-grid-row>").css(
                        "display",
                        "contents"
                    );
                    if (flag) {
                        $(this.refs.grid).prepend(rowel[0]);
                        if (!this.rows.includes(row)) {
                            this.rows.unshift(row);
                        }
                    } else {
                        rowel.appendTo(this.refs.grid);
                        if (!this.rows.includes(row)) {
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

                /**
                 * Unshift a row to the grid
                 *
                 * @param {GenericObject<any>[]} row list of cell data in the row
                 * @memberof GridViewTag
                 */
                unshift(row: GenericObject<any>[]): void {
                    this.push(row, true);
                }

                /**
                 * This function triggers the cell select event
                 *
                 * @private
                 * @param {TagEventType<CellEventData>} e event contains cell event data
                 * @param {boolean} flag indicates whether the event is double clicked
                 * @returns {void}
                 * @memberof GridViewTag
                 */
                private cellselect(
                    e: TagEventType<CellEventData>,
                    flag: boolean
                ): void {
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

                /**
                 * This function triggers the row select event, a cell select
                 * event will also trigger this event
                 *
                 * @param {TagEventType<CellEventData>} e
                 * @returns {void}
                 * @memberof GridViewTag
                 */
                private rowselect(e: TagEventType<CellEventData>): void {
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
                    const row = ($(
                        e.data.item
                    ).parent()[0] as any) as GridRowTag;
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

                /**
                 * Check whether the grid has header
                 *
                 * @private
                 * @returns {boolean}
                 * @memberof GridViewTag
                 */
                private has_header(): boolean {
                    const h = this._header;
                    return h && h.length > 0;
                }

                /**
                 * Calibrate the grid
                 *
                 * @protected
                 * @memberof GridViewTag
                 */
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

                /**
                 * Recalculate the size of each header cell, changing
                 * in header cell size will also resize the entire
                 * related column
                 *
                 * @private
                 * @returns {void}
                 * @memberof GridViewTag
                 */
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
                    let template_header = "";
                    let i = 0;
                    for (let v of colssize) {
                        template += `${v}px `;
                        i++;
                        template_header += `${v}px `;
                        if (i < colssize.length && this.resizable) {
                            template_header += "3px ";
                        }
                    }
                    $(this.refs.grid).css("grid-template-columns", template);
                    $(this.refs.header).css(
                        "grid-template-columns",
                        template_header
                    );
                }

                /**
                 * Mount the grid view tag
                 *
                 * @protected
                 * @returns {void}
                 * @memberof GridViewTag
                 */
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

                /**
                 * Layout definition of the grid view
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof GridViewTag
                 */
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
