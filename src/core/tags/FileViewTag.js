/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class FileViewTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("onfileselect", function(){});
        this.setopt("onfileopen", function() {});
        this.setopt("ondragndrop", function() {});
        this.setopt("selectedFile", undefined);
        this.setopt("data", []);
        this.setopt("status", true);
        this.setopt("showhidden", false);
        this.setopt("fetch", undefined);
        this.setopt("path", undefined);
        this.setopt("chdir", true);
        this.setopt("view", "list");
        this.preventUpdate = false;
        this.header = [
            { text: "__(File name)" },
            { text: "__(Type)", width: 150 },
            { text: "__(Size)", width: 70 }
        ];
    }

    view() { return this.get("view"); }
    
    __view__(v) {
        return this.switchView();
    }

    __status__(v) {
        if (v) { return $(this.refs.status).show(); }
        return $(this.refs.status).hide();
    }

    __showhidden__(v) {
        if (!this.get("data")) { return; }
        return this.switchView();
    }

    __path__(v) {
        if (!v) { return; }
        if (!this.get("fetch")) { return; }
        return this.get("fetch")(v)
            .then(data => {
                if (!data) { return; }
                this.set("data", data);
                if (this.get("status")) { return this.refs.status.set("text", " "); }
        }).catch(e => // this should be handled by the OS
        Ant.OS.announcer.oserror(e.toString(), e));
    }
    
    __data__(v) {
        if (!v) { return; }
        return this.refreshData();
    }
    
    __ondragndrop__(v) {
        this.refs.treeview.set("ondragndrop", v);
        return this.refs.listview.set("ondragndrop", v);
    }

    sortByType(a, b) {
        if (a.type < b.type) {
            return -1;
        } else if  (a.type > b.type) {
             return 1;
        } else {
            return 0;
        }
    }

    calibrate() {
        let h = $(this.root).outerHeight();
        const w = $(this.root).width();
        if (this.get("status")) { h -= ($(this.refs.status).height() + 10); }
        $(this.refs.listview).css("height", h + "px");
        $(this.refs.gridview).css("height", h + "px");
        $(this.refs.treecontainer).css("height", h + "px");
        $(this.refs.listview).css("width", w + "px");
        $(this.refs.gridview).css("width", w + "px");
        return $(this.refs.treecontainer).css("width", w + "px");
    }

    refreshList() {
        const items = [];
        $.each(this.get("data"), (i, v) => {
            if ((v.filename[0] === '.') && !this.get("showhidden")) { return; }
            v.text = v.filename;
            if (v.text.length > 10) { v.text = v.text.substring(0, 9) + "..."; }
            v.iconclass = v.iconclass ? v.iconclass : v.type;
            v.icon = v.icon;
            return items.push(v);
        });
        return this.refs.listview.set("data", items);
    }

    refreshGrid() {
        const rows = [];
        $.each(this.get("data"), (i, v) => {
            if ((v.filename[0] === '.') && !this.get("showhidden")) { return; }
            v.text = v.filename;
            v.iconclass = v.iconclass ? v.iconclass : v.type;
            const row = [
                v,
                {
                    text: v.mime,
                    data: v
                },
                {
                    text: v.size,
                    data: v
                }
            ];
            return rows.push(row);
        });
        return this.refs.gridview.set("rows", rows);
    }

    refreshTree() {
        //@treeview.root.set("selectedItem", null)
        const tdata = {};
        tdata.name = this.get("path");
        tdata.path = tdata.name;
        tdata.open = true;
        tdata.nodes = this.getTreeData( this.get("data"));
        return this.refs.treeview.set("data", tdata);
    }

    getTreeData(data) {
        const nodes = [];
        const me = this;
        $.each(data, (i, v) => {
            if ((v.filename[0] === '.') && !this.get("showhidden")) { return; }
            v.name = v.filename;
            if (v.type === 'dir') {
                v.nodes = [];
                v.open = false;
            }
            v.iconclass = v.iconclass ? v.iconclass : v.type;
            v.icon = v.icon;
            return nodes.push(v);
        });
        return nodes;
    }

    refreshData() {
        if (!this.get("data")) { return; }
        this.get("data").sort(this.sortByType);
        switch (this.get("view")) {
            case "icon":
                return this.refreshList();
            case "list":
                return this.refreshGrid();
            default:
                return this.refreshTree();
        }
    }
                
    switchView() {
        $(this.refs.listview).hide();
        $(this.refs.gridview).hide();
        $(this.refs.treecontainer).hide();
        this.set("selectedFile", undefined);
        switch (this.get("view")) {
            case 'icon':
                $(this.refs.listview).show();
                break;
            case 'list':
                $(this.refs.gridview).show();
                break;
            default:
                $(this.refs.treecontainer).show();
        }
        this.refreshData();
        this.calibrate();
        if (this.get("status")) { return this.refs.status.set("text", " "); }
    }

    fileselect(e) {
        if (e.path === this.get("path")) {
            e.type = "dir";
            e.mime = "dir";
        }
        if (this.get("status")) {
            this.refs.status.set("text", __(
                "Selected: {0} ({1} bytes)",
                e.filename,
                e.size ? e.size : "0" )
            );
        }
        const evt  = { id: this.aid(), data: e };
        this.set("selectedFile", e);
        this.get("onfileselect")(evt);
        return this.observable.trigger("fileselect", evt);
    }

    filedbclick(e) {
        if (e.path === this.get("path")) {
            e.type = "dir";
            e.mime = "dir";
        }
        if ((e.type === "dir") && this.get("chdir")) {
            return this.set("path", e.path);
        } else {
            const evt  = { id: this.aid(), data: e };
            this.get("onfileopen")(evt);
            return this.observable.trigger("fileopen", evt);
        }
    }

    mount() {
        this.observable.on("resize", e => this.calibrate());
        this.refs.treeview.set("fetch", v => {
            return new Promise((resolve, reject) => {
                if (!this.get("fetch")) { return resolve(undefined); }
                if (!v.get("data").path) { return resolve(undefined); }
                return this.get("fetch")(v.get("data").path)
                    .then(d => resolve(this.getTreeData(d.sort(this.sortByType))))
                    .catch(e => reject(__e(e)));
            });
        });
        this.refs.gridview.set("header", this.header);
        this.refs.treeview.set("dragndrop", true);
        this.refs.listview.set("dragndrop", true);
        // even handles
        this.refs.listview.set("onlistselect", e => {
            return this.fileselect(e.data.item.get("data"));
        });
        this.refs.gridview.set("onrowselect", e => {
            return this.fileselect($(e.data.item).children()[0].get("data"));
        });
        this.refs.treeview.set("ontreeselect", e => {
            return this.fileselect(e.data.item.get("data"));
        });
        // dblclick
        this.refs.listview.set("onlistdbclick", e => {
            return this.filedbclick(e.data.item.get("data"));
        });
        this.refs.gridview.set("oncelldbclick", e => {
            return this.filedbclick(e.data.item.get("data"));
        });
        this.refs.treeview.set("ontreedbclick", e => {
            return this.filedbclick(e.data.item.get("data"));
        });
        return this.switchView();
    }

    layout() {
        return [
            { el: "afx-list-view", ref: "listview" },
            { el: "div", class: "treecontainer", ref: "treecontainer", children: [
                { el: "afx-tree-view", ref: "treeview" }
            ] },
            { el: "afx-grid-view", ref: "gridview" },
            { el: "afx-label", class: "status", ref: "status" }
        ];
    }
}

Ant.OS.GUI.define("afx-file-view", FileViewTag);