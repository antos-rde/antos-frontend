import * as JQuery from "../src/libs/jquery-3.2.1.min";
import { OS as _OS_ } from "../dist/antos";
// some global variable
const _w_ = window as any;
_w_.$ = JQuery;
const OS = _OS_ as any;
_w_.OS = OS;

interface GenericObject<T> {
    [propName: string]: T;
}
// an example tag
class ExampleTag extends OS.GUI.AFXTag {
    private _prop1: number;
    private _prop2: string;
    constructor() {
        super();
    }
    set prop1(v: number) {
        this._prop1 = v;
    }
    set prop2(v: string) {
        this._prop2 = v;
    }
    get prop1(): number {
        return this._prop1;
    }
    get prop2(): string {
        return this._prop2;
    }
    layout() {
        return [];
    }
    init() {
        this._prop1 = 0;
        this._prop2 = "test";
    }
    mount() {}
}

OS.GUI.tag.define("afx-example-tag", ExampleTag);

test("Test base tag getter/setter", () => {
    const tag = new ExampleTag();
    tag.uify();
    expect(tag.aid).toBeDefined();
    tag.aid = "test";
    expect(tag.aid).toBe("test");
    expect(tag.prop1).toBe(0);
    expect(tag.prop2).toBe("test");
    tag.set({
        prop1: 10,
        prop2: "Hello",
        prop3: "test",
    });
    expect(tag.prop1).toBe(10);
    expect(tag.prop2).toBe("Hello");
    expect(tag.prop3).toBeUndefined();
    tag.tooltip = "tooltip";
    expect(tag.tooltip).toBeUndefined();
    expect($(tag).attr("tooltip")).toBe("tooltip");
});

// Button test

test("Test button tag setter/getter", () => {
    const bt = new OS.GUI.tag.ButtonTag();
    bt.uify();
    expect(bt.enable).toBe(true);
    expect(bt.toggle).toBe(false);
    expect(bt).toBeDefined();
    bt.text = "test";
    expect(bt.text).toBe("test");
    bt.enable = true;
    expect(bt.enable).toBe(true);
    bt.enable = false;
    expect(bt.enable).toBe(false);
    bt.icon = "test";
    bt.iconclass = "test";
    expect(bt.icon).toBeUndefined();
    expect(bt.iconclass).toBeUndefined();
    bt.selected = true;
    expect(bt.selected).toBe(true);
    bt.selected = false;
    expect(bt.selected).toBe(false);

    bt.toggle = true;
    expect(bt.toggle).toBe(true);
    bt.toggle = false;
    expect(bt.toggle).toBe(false);
});

test("Test button tag behavior", () => {
    const bt = new OS.GUI.tag.ButtonTag();
    bt.uify();
    const cb = jest.fn();
    bt.onbtclick = cb;
    $("button", bt).trigger("click");
    expect(cb).toBeCalledTimes(1);
    const data = {
        text: "name",
        onbtclick: jest.fn(),
    };
    bt.set(data);
    $("button", bt).trigger("click");
    expect(data.onbtclick).toBeCalledTimes(1);
});

// Label test

test("Test label tag setter/getter", () => {
    const lbl = new OS.GUI.tag.LabelTag();
    expect(lbl).toBeDefined();
    lbl.uify();
    expect(lbl.icon).toBeUndefined();
    expect(lbl.iconclass).toBeUndefined();
    expect(lbl.text).toBeUndefined();
    lbl.icon = "test";
    lbl.iconclass = "test";
    lbl.text = "test";
    expect(lbl.icon).toBeUndefined();
    expect(lbl.iconclass).toBeUndefined();
    expect(lbl.text).toBe("test");
});

// switch test
test("Test switcher getter/setter", () => {
    const sw = new OS.GUI.tag.SwitchTag();
    sw.uify();
    expect(sw.swon).toBe(false);
    sw.swon = true;
    expect(sw.swon).toBe(true);
    sw.swon = false;
    expect(sw.swon).toBe(false);
    expect(sw.enable).toBe(true);
    sw.enable = false;
    expect(sw.enable).toBe(false);
});

test("Test switch behavior", () => {
    const sw = new OS.GUI.tag.SwitchTag();
    sw.uify();
    const cb = jest.fn();
    sw.onswchange = cb;
    $("span", sw).trigger("click");
    expect(cb).toBeCalledTimes(1);
    expect(sw.swon).toBe(true);
});

// List view item test
test("Test simple list view item setter/getter", () => {
    const item = new OS.GUI.tag.SimpleListItemTag();
    item.uify();
    expect(item.closable).toBe(false);
    expect(item.selected).toBe(false);
    item.closable = true;
    expect(item.closable).toBe(true);
    expect(item.data).toBeDefined();
    item.closable = false;
    item.selected = false;
    const data = { text: "Hello", closable: true, selected: true };
    item.data = data;
    expect(item.closable).toBe(true);
    expect(item.selected).toBe(true);
    expect(($("afx-label", item)[0] as any).text).toBe("Hello");
});

test("Test simple list view item behaviour", () => {
    const item = new OS.GUI.tag.SimpleListItemTag();
    item.uify();
    const cb = jest.fn();
    item.onitemselect = cb;
    item.onitemclick = cb;
    item.onitemdbclick = cb;
    item.onitemclose = cb;
    const data = { text: "hello", closable: true, selected: true };
    item.data = data;
    expect(cb).toBeCalledTimes(1);
    $("li", item).trigger("click");
    expect(cb).toBeCalledTimes(2);
    $("li", item).trigger("dblclick");
    expect(cb).toBeCalledTimes(3);
    $("i.closable", item).trigger("click");
    expect(cb).toBeCalledTimes(4);
});

// list view test
test("Test list view setter/getter", () => {
    const item = new OS.GUI.tag.ListViewTag();
    item.uify();
    expect(item.data).toBeDefined();
    expect(item.data.length).toBe(0);
    expect(item.multiselect).toBe(false);
    expect(item.dropdown).toBe(false);
    expect(item.selected).toBe(-1);
    expect(item.dragndrop).toBe(false);
    expect(item.itemtag).toBe("afx-list-item");
    expect(item.selectedItem).toBeUndefined();
    expect(item.selectedItems).toBeDefined();
    expect(item.selectedItems.length).toBe(0);
    item.multiselect = true;
    expect(item.multiselect).toBe(true);
    item.dragndrop = true;
    item.dropdown = true;
    item.itemtag = "afx-sample";
    expect(item.multiselect).toBe(false);
    expect(item.dropdown).toBe(true);
    expect(item.dragndrop).toBe(true);
    expect(item.itemtag).toBe("afx-sample");
    const data: GenericObject<string>[] = [{ text: "Item 1" }];
    item.data = data;
    expect(item.data).toBe(data);
    const dbot = { text: "bot" };
    const dtop = { text: "top" };
    item.push(dbot);
    item.unshift(dtop);
    expect(item.data[2]).toBe(dbot);
    expect(item.data[0]).toBe(dtop);
    item.delete(item.data[2].domel);
    expect(item.data.length).toBe(2);
});

test("Test list view behaviour", () => {
    const item = new OS.GUI.tag.ListViewTag();
    item.uify();
    const cb = jest.fn();
    item.onlistselect = cb;
    item.onlistdbclick = cb;
    item.onlist;
    const data = [
        { text: "Item 1", closable: true, selected: false },
        { text: "Item 2", closable: true, selected: true },
        { text: "Item 3", closable: true, selected: false },
    ];
    item.data = data;
    expect(item.data).toBe(data);
    expect(cb).toBeCalledTimes(1);
    expect(item.selectedItem).toBe((data[1] as any).domel);
    expect(item.selectedItems.length).toBe(1);
    expect(item.selectedItems[0]).toBe((data[1] as any).domel);
    expect(item.selected).toBe(1);
    item.multiselect = true;
    data[2].selected = true;
    item.data = data;
    expect(cb).toBeCalledTimes(3);
    expect(item.selectedItem).toBe((data[2] as any).domel);
    expect(item.selectedItems.length).toBe(2);
    var el = (data[0] as any).domel;
    $("li", el).trigger("click");
    expect(cb).toBeCalledTimes(4);
    expect(item.selectedItems.length).toBe(3);
    expect(item.selectedItem).toBe((data[0] as any).domel);
    item.unselect();
    expect(item.selectedItems.length).toBe(0);
    expect(item.selectedItem).toBeUndefined();
    item.multiselect = false;
    data[0].selected = true;
    data[2].selected = true;
    item.dragndrop = true;
    item.data = data;
    expect(item.selectedItem).toBe((data[2] as any).domel);
    expect(item.selectedItems.length).toBe(1);
    el = (data[1] as any).domel;
    $("li", el).trigger("dblclick");
    expect(cb).toBeCalledTimes(8);
    expect(item.selectedItem).toBe(el);
    item.selectPrev();
    expect(item.selectedItem).toBe((data[0] as any).domel);
    expect(item.selectedItems.length).toBe(1);
    item.selectNext();
    expect(item.selectedItem).toBe((data[1] as any).domel);
    expect(item.selectedItems.length).toBe(1);
    // close an element
    var close_cb = jest.fn((x) => false);
    item.onitemclose = close_cb;
    el = (data[0] as any).domel;
    $("i.closable", el).trigger("click");
    expect(close_cb).toBeCalledTimes(1);
    expect(item.data.length).toBe(3);
    expect(item.selectedItem).toBe((data[1] as any).domel);
    close_cb = jest.fn((x) => true);
    item.onitemclose = close_cb;
    $("i.closable", el).trigger("click");
    expect(item.data.length).toBe(2);
    expect(item.selectedItem).toBe((data[0] as any).domel);
    expect(close_cb).toBeCalledTimes(1);
    el = (data[0] as any).domel;
    $("i.closable", el).trigger("click");
    expect(item.data.length).toBe(1);
    expect(item.selectedItem).toBeUndefined();
    expect(close_cb).toBeCalledTimes(2);
});

// test Menu item
function get_treedata(): GenericObject<any> {
    return {
        name: "My Tree",
        nodes: [
            { name: "child 1", iconclass: "fa fa-car" },
            { name: "child 2" },
            {
                name: "sub tree 1",
                nodes: [
                    {
                        name: "sub sub tree 1",
                        nodes: [{ name: "leaf 1" }, { name: "leaf 2" }],
                    },
                    { name: "leaf 3" },
                    { name: "leaf 4" },
                ],
            },
        ],
    };
}
test("Test menu item setter/getter", () => {
    const treedata = get_treedata();
    const item = new OS.GUI.tag.SimpleMenuEntryTag();
    item.uify();
    expect(item.data).toBeUndefined();
    expect(item.switch).toBe(false);
    expect(item.radio).toBe(false);
    expect(item.checked).toBe(false);
    expect(item.nodes).toBeUndefined();
    expect(item.parent).toBeUndefined();
    expect(item.root).toBeUndefined();
    const leaf = { name: "child 1", switch: true, radio: true };
    item.data = leaf;
    expect(item.data).toBe(leaf);
    expect(item.data.nodes).toBeUndefined();
    expect(item.switch).toBe(true);
    expect(item.radio).toBe(true);
    item.data = treedata;
    expect(item.nodes).toBe(treedata.nodes);
});

test("Test menu item behaviour", () => {
    const item = new OS.GUI.tag.SimpleMenuEntryTag();
    item.uify();
    const treedata = get_treedata();
    item.data = treedata;
    const cb = jest.fn();
    item.onmenuselect = cb;
    item.onchildselect = cb;
    $(">li>a", item).trigger("click");
    expect(cb).toBeCalledTimes(1);
    const node0 = treedata.nodes[0].domel;
    const node1 = treedata.nodes[1].domel;
    node0.switch = true;
    node1.switch = true;
    expect(node0.checked).toBe(false);
    node1.checked = true;
    $(">li>a", node0).trigger("click");
    expect(cb).toBeCalledTimes(2);
    expect(node0.checked).toBe(true);
    expect(node1.checked).toBe(true);

    // check radio option
    node0.switch = false;
    node1.switch = false;
    node0.radio = true;
    node1.radio = true;
    node0.checked = false;
    expect(node0.parent).toBe(item);
    expect(node1.parent).toBe(item);
    expect(node0.checked).toBe(false);
    expect(node1.checked).toBe(true);
    $(">li>a", node0).trigger("click");
    expect(cb).toBeCalledTimes(3);
    expect(node0.checked).toBe(true);
    expect(node1.checked).toBe(false);
});

// test Menu
test("Test menu setter/getter", () => {
    const item = new OS.GUI.tag.MenuTag();
    item.uify();
    const treedata = get_treedata();
    item.items = [treedata];
    expect(item.items[0]).toBe(treedata);
    expect(item.context).toBe(false);
    item.context = true;
    expect(item.context).toBe(true);
    expect(item.contentag).toBe("afx-menu-entry");
    item.contentag = "afx-sample";
    expect(item.contentag).toBe("afx-sample");
    const extra_data_top: GenericObject<string> = { name: "test" };
    item.unshift(extra_data_top);
    expect(item.items.length).toBe(2);
    expect(item.items[0]).toBe(extra_data_top);
    const extra_data_bot: GenericObject<string> = { name: "test" };
    item.push(extra_data_bot);
    expect(item.items[2]).toBe(extra_data_bot);
    item.delete(extra_data_top.domel);
    expect(item.items[0] === extra_data_top).toBe(false);
});

test("Test menu behavior", () => {
    const item = new OS.GUI.tag.MenuTag();
    const treedata = get_treedata();
    item.uify();
    item.items = [treedata];
    const cb = jest.fn();
    item.onmenuselect = cb;
    const node0 = treedata.nodes[0].domel;
    $(">li>a", node0).trigger("click");
    expect(cb).toBeCalledTimes(1);
});

// Gridview tag
test("Test gridview cell setter/getter", () => {
    const cell = new OS.GUI.tag.SimpleGridCellTag();
    cell.uify();
    expect(cell.selected).toBe(false);
    cell.selected = true;
    expect(cell.selected).toBe(true);
    const celldata = { text: "test" };
    cell.data = celldata;
    expect(cell.data).toBe(celldata);
});

test("Test gridview cell behavior", () => {
    const cell = new OS.GUI.tag.SimpleGridCellTag();
    cell.uify();
    const celldata = { text: "test" };
    cell.data = celldata;
    const cb = jest.fn();
    cell.oncellselect = cb;
    cell.oncelldbclick = cb;
    cell.selected = true;
    expect(cb).toBeCalledTimes(1);
    $(cell).trigger("click");
    expect(cb).toBeCalledTimes(2);
    $(cell).trigger("dblclick");
    expect(cb).toBeCalledTimes(3);
});

function get_grid_data(): GenericObject<any> {
    return {
        header: [
            { text: "header 1" },
            { text: "header 2" },
            { text: "header 3" },
        ],
        rows: [
            [{ text: "text 1" }, { text: "text 2" }, { text: "text 3" }],
            [{ text: "text 4" }, { text: "text 5" }, { text: "text 6" }],
            [{ text: "text 7" }, { text: "text 8" }, { text: "text 9" }],
        ],
    };
}
test("Test gridview setter/getter", () => {
    const grid = new OS.GUI.tag.GridViewTag();
    grid.uify();
    expect(grid.headeritem).toBe("afx-grid-cell");
    expect(grid.cellitem).toBe("afx-grid-cell");
    expect(grid.selectedCell).toBe(undefined);
    expect(grid.selectedRow).toBe(undefined);
    expect(grid.selectedRows).toBeDefined();
    expect(grid.selectedRows.length).toBe(0);
    expect(grid.rows).toBeDefined();
    expect(grid.rows.length).toBe(0);
    expect(grid.multiselect).toBe(false);
    grid.multiselect = true;
    const data = get_grid_data();
    data.rows[1][0].selected = true;
    data.rows[2][0].selected = true;
    grid.set(data);
    const row = data.rows[2];
    const cell = row[0];
    expect(grid.rows).toBe(data.rows);
    expect(grid.header).toBe(data.header);
    expect(grid.selectedCell).toBe(cell.domel);
    expect(grid.selectedRow).toBe(row.domel);
    expect(grid.selectedRows.length).toBe(2);
    const toprow: any = [{ text: "text -3" }, { text: "text -2" }, { text: "text -1" }];
    const botrow: any = [{ text: "text 10" }, { text: "text 11" }, { text: "text 12" }];
    grid.unshift(toprow);
    grid.push(botrow);
    expect(grid.rows.length).toBe(5);
    grid.delete(toprow.domel);
    grid.delete(botrow.domel);
    expect(grid.rows.length).toBe(3);
    expect(grid.rows.includes(toprow.domel)).toBe(false);
    expect(grid.rows.includes(botrow.domel)).toBe(false);
    grid.headeritem = "afx-sample";
    grid.cellitem = "afx-sample";
    expect(grid.headeritem).toBe("afx-sample");
    expect(grid.cellitem).toBe("afx-sample");
});

test("Test gridview behavior", () => {
    const grid = new OS.GUI.tag.GridViewTag();
    grid.uify();
    const cb = jest.fn();
    grid.oncellselect = cb;
    grid.onrowselect = cb;
    grid.oncelldbclick = cb;
    const data = get_grid_data();
    const row0 = data.rows[0];
    const row1 = data.rows[1];
    row0[1].selected = true;
    grid.set(data);
    $(row1[0].domel).trigger("click");
    expect(cb).toBeCalledTimes(4);
    expect(grid.selectedCell).toBe(row1[0].domel);
    expect(grid.selectedRow).toBe(row1.domel);
    expect(grid.selectedRows.length).toBe(1);
    grid.multiselect = true;
    $(row0[1].domel).trigger("click");
    expect(cb).toBeCalledTimes(6);
    expect(grid.selectedRows.length).toBe(2);
    $(row0[1].domel).trigger("dblclick");
    expect(cb).toBeCalledTimes(7);
    expect(grid.selectedRows.length).toBe(2);
});

// Treeview
test("Treeview item setter/getter", ()=>{

});
test("Treeview item behavior", ()=>{

});
// Treeview
test("Treeview setter/getter", ()=>{

});
test("Treeview behavior", ()=>{

});