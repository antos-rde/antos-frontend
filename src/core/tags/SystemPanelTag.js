/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class SystemPanelTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("osmenu", {
            text: __("Start"),
            iconclass: "fa fa-circle"
        });
        this.setopt("appmenu", []);
        this.setopt("systray", []);
        this.root.attachservice = s => this.attachservice(s);
        this.root.detachservice = s => this.detachservice(s);
        this.view = false;
    }

    __osmenu__(v) {
        return this.refs.osmenu.set("items", [v]);
    }

    __appmenu__(v) {
        return this.refs.appmenu.set("items", v);
    }

    __systray__(v) {
        return this.refs.systray.set("items", v);
    }

    attachservice(s) {
        this.refs.systray.unshift(s);
        return s.attach(this.refs.systray);
    }

    open() {
        const el = this.refs.applist.get("selectedItem");
        if (!el) { return; }
        const data = el.get("data");
        if (!data || (data.dataid === "header")) { return; }
        this.toggle(false);
        // launch the app or open the file
        Ant.OS.GUI.openWith(data);
        return this.refs.applist.unselect();
    }
    
    search(e) {
        switch (e.which) {
            case 27:
                // escape key
                return this.toggle(false);

            case 37:
                return e.preventDefault();
            case 38:
                this.refs.applist.selectPrev();
                return e.preventDefault();
            case 39:
                return e.preventDefault();
            case 40:
                this.refs.applist.selectNext();
                return e.preventDefault();
            case 13:
                e.preventDefault();
                return this.open();
            default:
                var text = this.refs.search.value;
                if (!(text.length >= 3)) { return this.refreshAppList(); }
                var result = Ant.OS.API.search(text);
                if (result.length === 0) { return; }
                return this.refs.applist.set("data", result);
        }
    }

    detachservice(s) {
        return this.refs.systray.remove(s.domel);
    }

    layout() {
        return [
            {
                el: "div", ref: "panel", children: [
                    { el: "afx-menu", ref: "osmenu", class: "afx-panel-os-menu" },
                    { el: "afx-menu", id: "appmenu", ref: "appmenu", class: "afx-panel-os-app" },
                    { el: "afx-menu", id: "systray", ref: "systray", class: "afx-panel-os-stray" }
                ]
            },
            {
                el: "afx-overlay", id: "start-panel", ref: "overlay", children: [
                    {
                        el: "afx-hbox", height: 30, children: [
                            { el: "div", width: 30, id: "searchicon" },
                            { el: "input", ref: "search" }
                        ]
                    },
                    { el: "afx-list-view", id: "applist", ref: "applist" },
                    {
                        el: "afx-hbox", id: "btlist", height: 30, children: [
                            {
                                el: "afx-button",
                                ref: "btscreen",
                                tooltip: __("ct:Toggle fullscreen")
                            },
                            {
                                el: "afx-button",
                                ref: "btuser",
                                tooltip: __("ct:User: {0}", Ant.OS.setting.user.username)
                            },
                            { el: "afx-button", ref: "btlogout", tooltip: __("ct:Logout") }
                        ]
                    }
                ]
            }
        ];
    }
    
    refreshAppList() {
        let k, v;
        const list = [];
        for (k in Ant.OS.setting.system.packages) { v = Ant.OS.setting.system.packages[k]; if (v && v.app) { list.push(v); } }
        for (k in Ant.OS.setting.system.menu) { v = Ant.OS.setting.system.menu[k]; list.push(v); }
        list.sort(function(a, b) {
            if (a.text < b.text) {
                return -1;
            } else if  (a.text > b.text) {
                return 1;
            } else {
                return 0;
            }
        });
        return this.refs.applist.set("data", list);
    }

    toggle(flag) {
        this.view = flag;
        if (flag) {
            this.refreshAppList();
            $(this.refs.overlay).show();
            this.calibrate();
            $(document).on("click", this.cb);
            this.refs.search.value = "";
            return $(this.refs.search).focus();
        } else {
            $(this.refs.overlay).hide();
            return $(document).unbind("click", this.cb);
        }
    }

    calibrate() {
        return this.refs.overlay.set("height", `${$(window).height() - $(this.refs.panel).height()}px`);
    }

    mount() {
        this.cb = e => {
            if (!($(e.target)).closest($(this.refs.overlay)).length && !($(e.target)).closest(this.refs.osmenu).length) {
                return this.toggle(false);
            } else {
                return $(this.refs.search).focus();
            }
        };
        $(this.refs.appmenu).css("z-index", 1000000);
        $(this.refs.systray).css("z-index", 1000000);
        this.refs.btscreen.set("*", {
            iconclass: "fa fa-tv",
            onbtclick: e => {
                this.toggle(false);
                return Ant.OS.GUI.toggleFullscreen();
            }
        });
        this.refs.btuser.set("*", {
            iconclass: "fa fa-user-circle-o",
            onbtclick: e => {
                this.toggle(false);
                return Ant.OS.GUI.openDialog("InfoDialog", Ant.OS.setting.user);
            }
        });
        this.refs.btlogout.set("*", {
            iconclass: "fa fa-power-off",
            onbtclick: e => {
                this.toggle(false);
                return Ant.OS.exit();
            }
        });
        this.refs.osmenu.set("onmenuselect", e => {
            return this.toggle(true);
        });
        
        ($(this.refs.overlay)).css("left", 0)
            .css("top", `${$(this.refs.panel).height()}px`)
            .css("bottom", "0")
            .hide();
        ($(this.refs.search)).keyup(e => {
            return this.search(e);
        });

        $(this.refs.applist).click(e => {
            return this.open();
        });
        Ant.OS.GUI.bindKey("CTRL- ", e => {
            if (this.view === false) {
                return this.toggle(true);
            } else {
                return this.toggle(false);
            }
        });
        return Ant.OS.announcer.trigger("syspanelloaded");
    }
}

Ant.OS.GUI.define("afx-sys-panel", SystemPanelTag);