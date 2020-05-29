import * as JQuery from "../src/libs/jquery-3.2.1.min"
import {OS as _OS_} from "../dist/antos";
// some global variable
const _w_ = window as any;
_w_.$ = JQuery;
const OS = _OS_ as  any;
_w_.OS = OS;

// an example tag
class ExampleTag extends OS.GUI.AFXTag
{
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

test("Test base tag getter/setter", ()=>{
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
        prop3: "test"
    });
    expect(tag.prop1).toBe(10);
    expect(tag.prop2).toBe("Hello");
    expect(tag.prop3).toBeUndefined();
    tag.tooltip = "tooltip";
    expect(tag.tooltip).toBeUndefined();
    expect($(tag).attr("tooltip")).toBe("tooltip");
});

// Button test

test("Test button tag setter/getter", () =>{
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

test("Test button tag behavior", () =>{
    const bt = new OS.GUI.tag.ButtonTag();
    bt.uify();
    const cb = jest.fn();
    bt.onbtclick = cb
    $("button",bt).trigger("click");
    expect(cb).toBeCalledTimes(1);
});
 
 // Label test

test("Test label tag setter/getter", () =>{
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
test("Test switcher getter/setter", () =>{
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

test("Test switch behavior", ()=>{
    const sw = new OS.GUI.tag.SwitchTag();
    sw.uify();
    const cb = jest.fn();
    sw.onswchange = cb;
    $("span", sw).trigger("click");
    expect(cb).toBeCalledTimes(1);
    expect(sw.swon).toBe(true);
})

// List view item test
test("Test simple list view item setter/getter", ()=>{
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
    expect(($("afx-label",item)[0] as any).text).toBe("Hello");
});


test("Test simple list view item behaviour", ()=>{
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
test("Test list view setter/getter", ()=>{
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
})

test("Test list view behaviour", () =>{
    const item = new OS.GUI.tag.ListViewTag();
    item.uify();
    const cb = jest.fn();
    item.onlistselect = cb;
    item.onlistdbclick = cb;
    item.onlist
    const data = [
        { text: "Item 1", closable: true, selected: false },
        { text: "Item 2", closable: true, selected: true },
        { text: "Item 3", closable: true, selected: false }
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
    var el = (data[0] as any).domel
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
    el = (data[1] as any).domel
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
    el = (data[0] as any).domel
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
})

// test Menu item
const tree_data  = {
    name: 'My Tree',
    nodes: [
        { name: 'child 1', iconclass:'fa fa-car'},
        { name: 'child 2' },
        {
            name: 'sub tree 1',
            nodes: [
                {
                    name: 'sub sub tree 1',
                    nodes: [
                        { name: 'leaf 1' },
                        { name: 'leaf 2' }
                    ]
                },
                { name: 'leaf 3' },
                { name: 'leaf 4' }
            ]
        }
    ]
}
test("Test menu item setter/getter",()=>{
    const item = new OS.GUI.tag.SimpleMenuEntryTag();
    item.uify();
    expect(item.data).toBeUndefined();
    expect(item.switch).toBe(false);
    expect(item.radio).toBe(false);
    expect(item.checked).toBe(false);
    expect(item.nodes).toBeUndefined();
    expect(item.parent).toBeUndefined();
    expect(item.root).toBeUndefined();
    const leaf = tree_data.nodes[0];
    item.data = leaf;
    expect(item.data).toBe(leaf);
    expect(item.data.nodes).toBeUndefined();
})

test("Test menu item behaviour",()=>{
    
})

// test Menu
test("Test menu setter/getter",()=>{
    
})

test("Test menu behavior",()=>{
    
})