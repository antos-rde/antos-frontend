/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

// AnTOS Web desktop is is licensed under the GNU General Public
// License v3.0, see the LICENCE file for more information

// This program is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of 
// the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
//along with this program. If not, see https://www.gnu.org/licenses/.

Ant.OS.GUI = {
    subwindows: new Object(),
    dialog: undefined,
    fullscreen: false,
    workspace: "#desktop",
    shortcut: {
        ALT: {},
        CTRL: {},
        SHIFT: {},
        META: {}
    },
    htmlToScheme(html, app, parent) {
        const scheme =  $.parseHTML(html);
            
        if (app.scheme) { $(app.scheme).remove(); }
        ($(parent)).append(scheme);
        app.scheme = scheme[0];
        scheme[0].uify(app.observable);
        app.main();
        return app.show();
    },
    loadScheme(path, app, parent) {
        return path.asFileHandle().read()
            .then(function(x) {
                if (!x) { return null; }
                return Ant.OS.GUI.htmlToScheme(x, app, parent);})
            .catch(
                (e) =>{
                    Ant.OS.announcer.oserror(__("Cannot load scheme: {0}", path), e);
                    console.log(e);
                });
    },
    clearTheme() {
         return $("head link#ostheme")
            .attr("href", "");
     },

    loadTheme(name, force) {
        if (force) { Ant.OS.GUI.clearTheme(); }
        const path = `resources/themes/${name}/${name}.css`;
        return $("head link#ostheme")
            .attr("href", path);
    },

    pushServices(srvs) {
        return new Promise(function(resolve, reject) {
            if (!(srvs.length > 0)) { return resolve(); }
            const srv = srvs.splice(0, 1)[0];
            return Ant.OS.GUI.pushService(srv)
                .then(d => Ant.OS.GUI.pushServices(srvs)
                .then(() => resolve())
                .catch(e => reject(__e(e)))).catch(function(e) {
                    Ant.OS.announcer.osfail(__("Unable to load: {0}", srv), e);
                    return Ant.OS.GUI.pushServices(srvs)
                        .then(() => resolve())
                        .catch(e => reject(__e(e)));
            });
        });
    },
    
    openDialog(d, data) {
        return new Promise(function(resolve, reject) {
            if (Ant.OS.GUI.dialog) {
                Ant.OS.GUI.dialog.show();
                return resolve();
            }
            if (!Ant.OS.GUI.subwindows[d]) {
                const ex = Ant.OS.API.throwe("Dialog");
                return reject(ex);
            }
            Ant.OS.GUI.dialog = new (Ant.OS.GUI.subwindows[d])();
            Ant.OS.GUI.dialog.parent = Ant.OS.GUI;
            Ant.OS.GUI.dialog.handle = resolve;
            Ant.OS.GUI.dialog.reject = reject;
            Ant.OS.GUI.dialog.pid = -1;
            Ant.OS.GUI.dialog.data = data;
            return Ant.OS.GUI.dialog.init();
        });
    },

    pushService(ph) {
        return new Promise(function(resolve, reject) {
            const arr = ph.split("/");
            const srv = arr[1];
            const app = arr[0];
            if (Ant.OS.APP[srv]) {
                return Ant.OS.PM.createProcess(srv, Ant.OS.APP[srv])
                    .then(d => resolve(d))
                    .catch(e => reject(__e(e)));
            } else {
                return Ant.OS.GUI.loadApp(app)
                    .then(function(a) {
                        if (!Ant.OS.APP[srv]) {
                            return reject(Ant.OS.API.throwe(__("Service not found: {0}", ph)));
                        }
                        return Ant.OS.PM.createProcess(srv, Ant.OS.APP[srv])
                            .then(d => resolve(d))
                            .catch(e => reject(__e(e)));}).catch(e => reject(__e(e)));
            }
        });
    },

    appsByMime(mime) {
        let m;
        const metas = ((() => {
            const result = [];
             for (let k in Ant.OS.setting.system.packages) {
                const v = Ant.OS.setting.system.packages[k];
                if (v && v.app) {
                    result.push(v);
                }
            } 
            return result;
        })());
        const mimes = ((() => {
            const result1 = [];
             for (m of Array.from(metas)) {                 if (m) {
                    result1.push(m.mimes);
                }
            }
            return result1;
        })());
        const apps = [];
        // search app by mimes
        const f = function( arr, idx ) {
            try {
                return arr.filter(function(m, i) {
                    if (mime.match((new RegExp(m, "g")))) {
                        if ((apps.indexOf(metas[idx])) >= 0) { return false; }
                        apps.push(metas[idx]);
                        return false;
                    }
                    return false;
                });
            } catch (e) {
                return Ant.OS.announcer.osfail(__("Error find app by mimes {0}", mime), e);
            }
        };

        for (let i = 0; i < mimes.length; i++) { m = mimes[i];  if (m) { f(m, i); }  }
        return apps;
    },
    
    appsWithServices() {
        const o = {};
        for (let k in Ant.OS.setting.system.packages) { const v = Ant.OS.setting.system.packages[k]; if (v && v.services && (v.services.length > 0)) { o[k] = v; } }
        return o;
    },

    openWith(it) {
        if (!it) { return; }
        if ((it.type === "app") && it.app) { return Ant.OS.GUI.launch(it.app); }
        if (it.type === "app") { return Ant.OS.announcer.osinfo(__("Application {0} is not executable", it.text)); }
        const apps = Ant.OS.GUI.appsByMime(( it.type === "dir" ? "dir" : it.mime ));
        if (apps.length === 0) { return Ant.OS.announcer.osinfo(__("No application available to open {0}", it.filename)); }
        if (apps.length === 1) { return Ant.OS.GUI.launch(apps[0].app, [it]); }
        const list = ( Array.from(apps).map((e) => ({ text: e.app, icon: e.icon, iconclass: e.iconclass })) );
        return Ant.OS.GUI.openDialog("SelectionDialog", {
            title: __("Open with"),
            data: list
        }).then(d => Ant.OS.GUI.launch(d.text, [ { path: it.path, type: it.type }]));
    },

    forceLaunch(app, args) {
        console.warn("This method is used for developing only, please use the launch method instead");
        Ant.OS.GUI.unloadApp(app);
        return Ant.OS.GUI.launch(app, args);
    },

    unloadApp(app) {
        Ant.OS.PM.killAll(app, true);
        if (Ant.OS.APP[app] && Ant.OS.APP[app].style) { ($(Ant.OS.APP[app].style)).remove(); }
        return delete Ant.OS.APP[app];
    },
    
    loadApp(app) {
        return new Promise(function(resolve, reject) {
            let path;
            if (Ant.OS.setting.system.packages[app].path) { ({
                path
            } = Ant.OS.setting.system.packages[app]); }
            const js = path + "/main.js";
            
            return js.asFileHandle().read("script")
                .then(d => // load app meta data
            `${path}/package.json`.asFileHandle().read("json")
                .then(function(data) {
                    data.path = path;
                    if (Ant.OS.APP[app]) { Ant.OS.APP[app].meta = data; }
                    if (data.services) { for (let v of Array.from(data.services)) { Ant.OS.APP[v].meta = data; } }
                    //load css file
                    const css =  `${path}/main.css`;
                    return css.asFileHandle().onready()
                        .then(function(d) {
                            const stamp = (new Date).timestamp();
                            const el = $('<link>', { rel: 'stylesheet', type: 'text/css', 'href': `${Ant.OS.API.handle.get}/${css}?stamp=${stamp}` })
                                .appendTo('head');
                            if (Ant.OS.APP[app]) { Ant.OS.APP[app].style = el[0]; }
                            return resolve(app);}).catch(e => resolve(app));}).catch(e => reject(__e(e)))).catch(e => reject(__e(e)));
        });
    },
    launch(app, args) {
        if (!Ant.OS.APP[app]) {
            // first load it
            return Ant.OS.GUI.loadApp(app).then(a => Ant.OS.PM.createProcess(a, Ant.OS.APP[a], args)).catch(e => Ant.OS.announcer.osfail(__("Unable to launch: {0}", app), e));
        } else {
            // now launch it
            if (Ant.OS.APP[app]) {
                return Ant.OS.PM.createProcess(app, Ant.OS.APP[app], args)
                    .catch(e => Ant.OS.announcer.osfail(__("Unable to launch: {0}", app), e));
            }
        }
    },
    dock(app, meta) {
        // dock an application to a dock
        // create a data object
        const data = {
            icon: null,
            iconclass: meta.iconclass || "",
            app,
            onbtclick() { return app.toggle(); }
        };
        // TODO: this path is not good, need to create a blob of it
        if (meta.icon) { data.icon = `${meta.path}/${meta.icon}`; }
        // TODO: add default app icon class in system setting
        // so that it can be themed
        if ((!meta.icon) && (!meta.iconclass)) { data.iconclass = "fa fa-cogs"; }
        const dock = $("#sysdock");
        app.init();
        return app.one("rendered", function() {
            dock.get(0).newapp(data);
            app.sysdock = dock.get(0);
            app.appmenu = ($("[data-id = 'appmenu']", "#syspanel"))[0];
            app.subscribe("systemlocalechange", function(name) {
                app.updateLocale(name);
                return app.update();
            });
            return app.subscribe("appregistry", function( m ) {
                if (m.name === app.name) { return app.applySetting(m.data.m); }
            });
        });
    },

    toggleFullscreen() {
        const el = document.documentElement;
        if (Ant.OS.GUI.fullscreen) {
            if (document.exitFullscreen) { return document.exitFullscreen(); }
            if (document.mozCancelFullScreen) { return document.mozCancelFullScreen(); }
            if (document.webkitExitFullscreen) { return document.webkitExitFullscreen(); }
            if (document.cancelFullScreen) { return document.cancelFullScreen(); }
        } else {
            if (el.requestFullscreen) { return el.requestFullscreen(); }
            if (el.mozRequestFullScreen) { return el.mozRequestFullScreen(); }
            if (el.webkitRequestFullscreen) { return el.webkitRequestFullscreen(); }
            if (el.msRequestFullscreen) { return el.msRequestFullscreen(); }
        }
    },

    undock(app) {
        return ($("#sysdock")).get(0).removeapp(app);
    },

    attachservice(srv) {
        ($("#syspanel"))[0].attachservice(srv);
        srv.init();
        return srv.subscribe("systemlocalechange", name => srv.update());
    },
    detachservice(srv) {
        return ($("#syspanel"))[0].detachservice(srv);
    },
    bindContextMenu(event) {
        var handle  = function(e) {
            if (e.contextmenuHandle) {
                return e.contextmenuHandle(event, ($("#contextmenu"))[0]);
            } else {
                const p = $(e).parent().get(0);
                if (p !== ($("#workspace")).get(0)) { return handle(p); }
            }
        };
        handle(event.target);
        return event.preventDefault();
    },

    bindKey(k, f) {
        const arr = k.split("-");
        if (arr.length !== 2) { return; }
        const fnk = arr[0].toUpperCase();
        const c = arr[1].toUpperCase();
        if (!Ant.OS.GUI.shortcut[fnk]) { return; }
        return Ant.OS.GUI.shortcut[fnk][c] = f;
    },

    wallpaper(obj) {
        if (obj) {
            Ant.OS.setting.appearance.wp = obj;
        }
        const {
            wp
        } = Ant.OS.setting.appearance;
        return $("body").css("background-image", `url(${Ant.OS.API.handle.get}/${wp.url})` )
            .css("background-size", wp.size)
            .css("background-repeat", wp.repeat);
    },

    showTooltip(el, text, e) {
        let left, top;
        el = el[0];
        const label = ($("#systooltip"))[0];
        var cb = function(ev) {
            if ($(ev.target).closest(el).length === 0) {
                $(label).hide();
                return $(document).off("mousemove", cb);
            }
        };
        $(document).on("mousemove", cb);
        const arr = text.split(/:(.+)/);
        let tip = text;
        if (arr.length > 1) { tip = arr[1]; }
        const offset = $(el).offset();
        const w = $(el).width();
        const h = $(el).height();
        label.set("text", tip);
        $(label).show();
        switch (arr[0]) {
            case "cr": // center right of the element
                left = offset.left + w + 5;
                top = (offset.top + (h / 2)) - ($(label).height() / 2);
                break;
            case "ct": //ceter top
                left = (offset.left + (w / 2)) - ($(label).width() / 2);
                top = offset.top - $(label).height() - 5;
                break;
            default:
                if (!e) { return; }
                top = e.clientY + 5;
                left = e.clientX + 5;
        }
        return $(label).css("top", top + "px")
                .css("left", left + "px");
    },

    initDM() {
        const scheme =  $.parseHTML(Ant.OS.GUI.schemes.ws);
        ($("#wrapper")).append(scheme);
        
        Ant.OS.announcer.observable.one("sysdockloaded", () => ($(window)).bind('keydown', function(event) {
            const dock = ($("#sysdock"))[0];
            if (!dock) { return; }
            const app = dock.get("selectedApp");
            //return true unless app
            const c = String.fromCharCode(event.which).toUpperCase();
            let fnk = undefined;
            if (event.ctrlKey) {
                fnk = "CTRL";
            } else if (event.metaKey) {
                fnk = "META";
            } else if (event.shiftKey) {
                fnk = "SHIFT";
            } else if (event.altKey) {
                fnk = "ALT";
            }
            
            if (!fnk) { return; }
            const r = app ?  app.shortcut(fnk, c, event) : true;
            if (!r) { return  event.preventDefault(); }
            if (!Ant.OS.GUI.shortcut[fnk]) { return; }
            if (!Ant.OS.GUI.shortcut[fnk][c]) { return; }
            Ant.OS.GUI.shortcut[fnk][c](event);
            return event.preventDefault();
        }));
        // system menu and dock
        $("#syspanel")[0].uify();
        $("#sysdock")[0].uify();
        $("#systooltip")[0].uify();
        $("#contextmenu")[0].uify();
       
        ($("#workspace")).contextmenu(e => Ant.OS.GUI.bindContextMenu(e));
        // tooltip
        ($(document)).mouseover(function(e) {
            const el = $(e.target).closest("[tooltip]");
            if (!(el.length > 0)) { return; }
            return Ant.OS.GUI.showTooltip(el, ($(el).attr("tooltip")), e);
        });
        
        const fp = Ant.OS.setting.desktop.path.asFileHandle();
        // desktop default file manager
        const desktop = $(Ant.OS.GUI.workspace);
        desktop[0].fetch = function() {
            const file = Ant.OS.setting.desktop.path.asFileHandle();
            const fn = () => file.read().then(function(d) {
                if (d.error) { return Ant.OS.announcer.osfail(d.error, (Ant.OS.API.throwe("OS.VFS")), d.error); }
                const items = [];
                $.each(d.result,  function(i, v) {
                    if ((v.filename[0] === '.') &&  !Ant.OS.setting.desktop.showhidden) { return; }
                    v.text = v.filename;
                    //v.text = v.text.substring(0,9) + "..." ifv.text.length > 10
                    v.iconclass = v.type;
                    return items.push(v);
                });
                desktop[0].set("data", items);
                return desktop[0].refresh();
            });

            return file.onready()
                .then(() => fn())
                .catch(function( e ) { // try to create the path
                    console.log(`${file.path} not found`);
                    const name = file.basename;
                    return file.parent().asFileHandle().mk(name).then(function(r) {
                        let ex;
                        return ex = Ant.OS.API.throwe("OS.VFS");}).catch(e => Ant.OS.announcer.osfail(e.toString(), e));
            });
        };

        desktop[0].ready = function(e) {
            e.observable = Ant.OS.announcer;
            window.onresize = function() {
                Ant.OS.announcer.trigger("desktopresize");
                return e.refresh();
            };

            desktop[0].set("onlistselect", d => ($("#sysdock")).get(0).set("selectedApp", null));
        
            desktop[0].set("onlistdbclick", function( d ) {
                ($("#sysdock")).get(0).set("selectedApp", null);
                const it = desktop[0].get("selectedItem");
                return Ant.OS.GUI.openWith(it.get("data"));
            });

            //($ "#workingenv").on "click", (e) ->
            //     desktop[0].set "selected", -1

            desktop.on("click", function(e) {
                let el = $(e.target).parent();
                if (!(el.length > 0)) { return; }
                el = el.parent();
                if (!(el.length > 0)) { return; }
                if (el[0] !== desktop[0]) { return; }
                desktop[0].unselect();
                return ($("#sysdock")).get(0).set("selectedApp", null);
            });
        
            desktop[0].contextmenuHandle = function(e, m) {
                if (e.target.tagName.toUpperCase() === "UL") { desktop[0].unselect(); }
                ($("#sysdock")).get(0).set("selectedApp", null);
                let menu = [
                    { text: __("Open"), dataid: "desktop-open" },
                    { text: __("Refresh"), dataid: "desktop-refresh" }
                ];
                menu = menu.concat(((() => {
                    const result = [];
                     for (let k in Ant.OS.setting.desktop.menu) {
                        const v = Ant.OS.setting.desktop.menu[k];
                        result.push(v);
                    }
                    return result;
                })()));
                m.set("items", menu);
                m.set("onmenuselect", function(evt) {
                    const item = evt.data.item.get("data");
                    switch (item.dataid) {
                        case "desktop-open":
                            var it = desktop[0].get("selectedItem");
                            if (it) { return Ant.OS.GUI.openWith(it.get("data")); }
                            it = Ant.OS.setting.desktop.path.asFileHandle();
                            it.mime = "dir";
                            it.type = "dir";
                            return Ant.OS.GUI.openWith(it);
                        case "desktop-refresh":
                            return desktop[0].fetch();
                        default:
                            if (item.app) { return Ant.OS.GUI.launch(item.app, item.args); }
                    }
                });
                return m.show(e);
            };
            
            desktop[0].fetch();
            Ant.OS.announcer.observable.on("VFS", function(d) {
                if  (["read", "publish", "download"].includes(d.data.m)) { return; }
                if ((d.data.file.hash() === fp.hash()) || (d.data.file.parent().hash() === fp.hash())) { return desktop[0].fetch(); }
            });
            return Ant.OS.announcer.ostrigger("desktoploaded");
        };
        // mount it
        return desktop[0].uify();
    },
            
    refreshDesktop() {
        return ($(Ant.OS.GUI.workspace))[0].fetch();
    },
        
    login() {
        const scheme = $.parseHTML(Ant.OS.GUI.schemes.login);
        ($("#wrapper")).append(scheme);
        ($("#btlogin")).click(function() {
            const data = {
                username: ($("#txtuser")).val(),
                password: ($("#txtpass")).val()
            };
            return Ant.OS.API.handle.login(data)
                .then(function(d) {
                    if (d.error) { return ($("#login_error")).html(d.error); }
                    return Ant.OS.GUI.startAntOS(d.result);}).catch(e => ($("#login_error")).html("Login: server error"));
        });
        ($("#txtpass")).keyup(function(e) {
            if (e.which === 13) { return ($("#btlogin")).click(); }
        });
        return ($("#txtuser")).keyup(function(e) {
            if (e.which === 13) { return ($("#btlogin")).click(); }
        });
    },
    
    startAntOS(conf) {
        // clean up things
        Ant.OS.cleanup();
        // get setting from conf
        Ant.OS.systemSetting(conf);
        //console.log Ant.OS.setting
        // load theme
        Ant.OS.GUI.loadTheme(Ant.OS.setting.appearance.theme);
        Ant.OS.GUI.wallpaper();
        Ant.OS.announcer.observable.one("syspanelloaded", function() {
            // TODO load packages list then build system menu
            Ant.OS.announcer.observable.on("systemlocalechange", name => ($("#syspanel"))[0].update());

            return Ant.OS.API.packages.cache().then(function(ret) {
                if (ret.result) {
                    return Ant.OS.API.packages.fetch().then(function(r) {
                        let v;
                        if (r.result) {
                            for (let k in r.result) {
                                v = r.result[k];
                                v.text = v.name;
                                v.filename = k;
                                v.type = "app";
                                v.mime = "antos/app";
                                if (v.icon) { v.icon = `${v.path}/${v.icon}`; }
                                if (!v.iconclass && !v.icon) { v.iconclass = "fa fa-adn"; }
                            }
                        }
                        Ant.OS.setting.system.packages = r.result ? r.result  : undefined;
                        // Ant.OS.GUI.refreshSystemMenu()
                        // Ant.OS.GUI.buildSystemMenu()
                        // push startup services
                        // TODO: get services list from user setting
                        Ant.OS.GUI.pushServices(((() => {
                            const result = [];
                            for (v of Array.from(Ant.OS.setting.system.startup.services)) {                                 result.push(v);
                            }
                            return result;
                        })()));
                        return Array.from(Ant.OS.setting.system.startup.apps).map((a) => (Ant.OS.GUI.launch(a)));
                    });
                }
            });
        });
                //Ant.OS.GUI.launch "DummyApp"
        // initDM
        return Ant.OS.API.setLocale(Ant.OS.setting.system.locale)
            .then(() => Ant.OS.GUI.initDM());
    }
};
    

Ant.OS.GUI.schemes = {};
Ant.OS.GUI.schemes.ws = `\
<afx-sys-panel id = "syspanel"></afx-sys-panel>
<div id = "workspace">
    <afx-apps-dock id="sysdock"></afx-apps-dock>
    <afx-float-list id = "desktop" dir="vertical" ></afx-float-list>
</div>
<afx-menu id="contextmenu" data-id="contextmenu" context="true" style="display:none;"></afx-menu>
<afx-label id="systooltip" data-id="systooltip" style="display:none;position:absolute;"></afx-label>
<textarea id="clipboard"></textarea>\
`;

Ant.OS.GUI.schemes.login = `\
<div id = "login_form">
    <p>Welcome to AntOS, please login</p>
    <input id = "txtuser" type = "text" value = "demo" />
    <input id = "txtpass" type = "password" value = "demo" />
    <button id = "btlogin">Login</button>
    <div id = "login_error"></div>
</div>\
`;