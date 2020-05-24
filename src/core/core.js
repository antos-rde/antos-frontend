/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS208: Avoid top-level this
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

'use strict';
const Ant = this;

class FormatedString {
    constructor(fs, args) {
        this.fs = fs;
        this.values = [];
        if (!args) { return; }
        for (let i = 0, end = args.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) { this.values[i] = args[i]; }
    }
    toString() {
        return this.__();
    }
    __() {
        return this.fs.l().replace(/{(\d+)}/g, (match, number) => {
            if (typeof this.values[number] !== 'undefined') { return this.values[number].__(); } else { return match; }
        });
    }
    hash() {
        return this.__().hash();
    }

    match(t) {
        return this.__().match(t);
    }

    asBase64() {
        return this.__().asBase64();
    }
    
    unescape() {
        return this.__().unescape();
    }
    
    asUint8Array() {
        return this.__().asUint8Array();
    }
    
    format() {
        const args = arguments;
        return __range__(0, args.length - 1, true).map((i) => (this.values[i] = args[i]));
    }
}

class Version {
    constructor(string) {
        this.string = string;
        const arr = this.string.split("-");
        const br = {
            "r": 3,
            "b": 2,
            "a": 1
        };
        this.branch = 3;
        if ((arr.length === 2) && br[arr[1]]) { this.branch = br[arr[1]]; }
        const mt = arr[0].match(/\d+/g);
        if (!mt) { throw new Error(__("Version string is in invalid format: {0}", this.string)); }
        this.major = 0;
        this.minor = 0;
        this.patch = 0;
        if (mt.length >= 1) { this.major = Number(mt[0]); }
        if (mt.length >= 2) { this.minor = Number(mt[1]); }
        if (mt.length >= 3) { this.patch = Number(mt[2]); }
    }
    
    // this function return 
    //   0 if the version is unchanged
    //   1 if the current version is newer
    //   -1 if the current version is older
    compare(o) {
        const other = o.__v();
        if (this.branch > other.branch) { return 1; }
        if (this.branch < other.branch) { return -1; }
        if ((this.major === other.major) && (this.minor === other.minor) && (this.patch === other.patch)) { return 0; }
        if (this.major > other.major) { return 1; }
        if (this.major < other.major) { return -1; }
        if (this.minor > other.minor) { return 1; }
        if (this.minor < other.minor) { return -1; }
        if (this.patch > other.patch) { return 1; }
        return -1;
    }
    nt(o) {
        return (this.compare(o)) === 1;
    }
    ot(o) {
        return (this.compare(o)) === -1;
    }
    __v() { return this; }
    toString() { return this.string; }
}

Object.defineProperty(Object.prototype, '__', {
    value() {
        return this.toString();
    },
    enumerable: false,
    writable: true
}
);

String.prototype.hash = function() {
    let hash = 5381;
    let i = this.length;
    while (i) { hash = (hash * 33) ^ this.charCodeAt(--i); }
    return hash >>> 0;
};
String.prototype.__v = function() {
    return new Version(this);
};
String.prototype.asBase64 = function() {
    const tmp = encodeURIComponent(this);
    return btoa(( tmp.replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode((parseInt(p1, 16)))))
    );
};
String.prototype.unescape = function() {
    let d = this;
    d = d.replace(/\\\\/g, "\\");
    d = d.replace(/\\"/g, '"');
    d = d.replace(/\\n/g, "\n");
    d = d.replace(/\\t/g, "\t");
    d = d.replace(/\\b/g, "\b");
    d = d.replace(/\\f/g, "\f");
    d = d.replace(/\\r/g, "\r");
    return d;
};
String.prototype.asUint8Array = function() {
    let bytes = [];
    for (let i = 0, end = this.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
        bytes.push(this.charCodeAt(i));
    }
    bytes = new Uint8Array(bytes);
    return bytes;
};

if (!String.prototype.format) {
    String.prototype.format = function() {
        const args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            if (typeof args[number] !== 'undefined') { return args[number].__(); } else { return match; }
        });
    };
}

String.prototype.f = function() {
    const args = arguments;
    return new FormatedString(this, args);
};

String.prototype.__ = function() {
    const match = this.match(/^__\((.*)\)$/);
    if (match) { return match[1].l(); }
    return this;
};
String.prototype.l = function() {
    if (!Ant.OS.API.lang[this]) { Ant.OS.API.lang[this] = this; }
    return Ant.OS.API.lang[this];
};
// language directive

this.__ = function() {
    const args = arguments;
    if (!(args.length > 0)) { return "Undefined"; }
    const d = args[0];
    d.l();
    return new FormatedString(d, (__range__(1, args.length - 1, true).map((i) => args[i])));
};

Date.prototype.toString = function() {
    let dd = this.getDate();
    let mm = this.getMonth() + 1;
    const yyyy = this.getFullYear();
    let hh = this.getHours();
    let mi = this.getMinutes();
    let se = this.getSeconds();

    if (dd < 10) { dd = `0${dd}`; }
    if (mm < 10) { mm = `0${mm}`; }
    if (hh < 10) { hh = `0${hh}`; }
    if (mi < 10) { mi = `0${mi}`; }
    if (se < 10) { se = `0${se}`; }
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${se}`;
};

Date.prototype.timestamp = function() {
    return (this.getTime() / 1000) | 0;
};

// chaning error
this.__e = function(e) {
    const reason = new Error(e.toString());
    reason.stack += "\nCaused By:\n" + e.stack;
    return reason;
};


//define the OS object
if (!Ant.OS) { Ant.OS =  {

    API: {},
    GUI: {},
    APP: {},
    setting: {
        user: {},
        applications: {},
        desktop: {},
        appearance: {},
        VFS: {},
        system: {}
    },
    register(name, x) {
        if (x.type === 3) { return Ant.OS.GUI.subwindows[name] = x; } else { return Ant.OS.APP[name] = x; }
    },
        
    // import proprety from an App
    

    PM: {
        pidalloc: 0,
        processes: {},
        createProcess(app, cls, args) {
            return new Promise(function(resolve, reject) {
                const f = function() {
                    //if it is single ton
                    // and a process is existing
                    // just return it
                    let obj;
                    if (cls.singleton && Ant.OS.PM.processes[app] && (Ant.OS.PM.processes[app].length === 1)) {
                        obj = Ant.OS.PM.processes[app][0];
                        obj.show();
                    } else {
                        if (!Ant.OS.PM.processes[app]) { Ant.OS.PM.processes[app] = []; }
                        obj = new cls(args);
                        obj.birth = (new Date).getTime();
                        Ant.OS.PM.pidalloc++;
                        obj.pid = Ant.OS.PM.pidalloc;
                        Ant.OS.PM.processes[app].push(obj);
                        if (cls.type === 1) { Ant.OS.GUI.dock(obj, cls.meta); } else { Ant.OS.GUI.attachservice(obj); }
                    }
                    return obj;
                };
                if (cls.dependencies) {
                    const libs = (Array.from(cls.dependencies));
                    return Ant.OS.API.require(libs)
                        .then(() => resolve(f())).catch(e => reject(__e(e)));
                } else {
                    return resolve(f());
                }
            });
        },
        appByPid(pid) {
            let app = undefined;
            const find = function(l) {
                for (let a of Array.from(l)) { if (a.pid === pid) { return a; } }
            };
            for (let k in Ant.OS.PM.processes) {
                const v = Ant.OS.PM.processes[k];
                app = find(v);
                if (app) { break; }
            }
            return app;
        },
            
        kill(app) {
            if (!app.name || !Ant.OS.PM.processes[app.name]) { return; }

            const i = Ant.OS.PM.processes[app.name].indexOf(app);
            if (i >= 0) {
                if (Ant.OS.APP[app.name].type === 1) { Ant.OS.GUI.undock(app); } else { Ant.OS.GUI.detachservice(app); }
                Ant.OS.announcer.unregister(app);
                delete Ant.OS.PM.processes[app.name][i];
                return Ant.OS.PM.processes[app.name].splice(i, 1);
            }
        },
        
        killAll(app, force) {
            if (!Ant.OS.PM.processes[app]) { return; }
            return Array.from(Ant.OS.PM.processes[app]).map((a) => a.quit(force));
        }
    },

    cleanup() {
        console.log("Clean up system");
        for (let a in Ant.OS.PM.processes) { const v = Ant.OS.PM.processes[a]; Ant.OS.PM.killAll(a, true); }
        if (Ant.OS.announcer.observable) { Ant.OS.announcer.observable.off("*"); }
        $(window).off('keydown');
        ($("#workspace")).off("mouseover");
        delete Ant.OS.announcer.observable;
        ($("#wrapper")).empty();
        Ant.OS.GUI.clearTheme();
        Ant.OS.announcer.observable = new Ant.OS.API.Announcer();
        Ant.OS.announcer.quota = 0;
        Ant.OS.APP = {};
        Ant.OS.setting = {
            user: {},
            applications: {},
            desktop: {},
            appearance: {},
            VFS: {},
            system: {}
        };
        Ant.OS.PM.processes = {};
        return Ant.OS.PM.pidalloc = 0;
    },
        
    boot() {
        //first login
        console.log("Booting sytem");
        return Ant.OS.API.handle.auth()
            .then(function(d) {
                // in case someone call it more than once :)
                if (d.error) {
                    // show login screen
                    return Ant.OS.GUI.login();
                } else {
                    // startX :)
                    return Ant.OS.GUI.startAntOS(d.result);
                }}).catch(e => console.error(e));
    },
    
    cleanupHandles: {},

    exit() {
        //do clean up first
        for (let n in Ant.OS.cleanupHandles) { const f = Ant.OS.cleanupHandles[n]; f(); }
        return Ant.OS.API.handle.setting()
            .then(function(r) {
                Ant.OS.cleanup();
                return Ant.OS.API.handle.logout()
                    .then(d => Ant.OS.boot());}).catch(e => console.error(e));
    },

    onexit(n, f) {
        if (!Ant.OS.cleanupHandles[n]) { return Ant.OS.cleanupHandles[n] = f; }
    }
}; }



Ant.OS.API = {
    // the handle object could be a any remote or local handle to
    // fetch user data, used by the API to make requests
    // handles are defined in /src/handles
    handle: {},
    shared: {}, // shared libraries
    searchHandle: {},
    lang: {},
    //request a user data
    mid() {
        return Ant.OS.announcer.getMID();
    },
    post(p, d) {
        return new Promise(function(resolve, reject) {
            const q = Ant.OS.announcer.getMID();
            Ant.OS.API.loading(q, p);
            return $.ajax({
                type: 'POST',
                url: p,
                contentType: 'application/json',
                data: JSON.stringify(d,
                function(k, v) {
                    if (k === "domel") { return undefined; }
                    return v;
                }
                , 4),
                dataType: 'json',
                success: null
            })
            .done(function(data) {
                Ant.OS.API.loaded(q, p, "OK");
                return resolve(data);}).fail(function(j, s, e) {
                Ant.OS.API.loaded(q, p, "FAIL");
                if (e) {
                    return reject(__e(e));
                } else {
                    return reject(Ant.OS.API.throwe(s));
                }
            });
        });
    },
    
    blob(p) {
        return new Promise(function(resolve, reject) {
            const q = Ant.OS.announcer.getMID();
            const r = new XMLHttpRequest();
            r.open("GET", p, true);
            r.responseType = "arraybuffer";
            r.onload = function(e) {
                if ((this.status === 200) && (this.readyState === 4)) {
                    Ant.OS.API.loaded(q, p, "OK");
                    return resolve(this.response);
                } else {
                    Ant.OS.API.loaded(q, p, "FAIL");
                    return reject(Ant.OS.API.throwe(__("Unable to get blob: {0}", p)));
                }
            };
            Ant.OS.API.loading(q, p);
            return r.send();
        });
    },
        
    upload(p, d) {
        return new Promise(function(resolve, reject) {
            const q = Ant.OS.announcer.getMID();
            //insert a temporal file selector
            const o = ($('<input>')).attr('type', 'file').css("display", "none");
            o.change(function() {
                Ant.OS.API.loading(q, p);
                const formd = new FormData();
                formd.append('path', d);
                // TODO: only one file is selected at this time
                formd.append('upload', o[0].files[0]);

                return $.ajax({
                    url: p,
                    data: formd,
                    type: 'POST',
                    contentType: false,
                    processData: false,
                })
                .done(function(data) {
                    Ant.OS.API.loaded(q, p, "OK");
                    resolve(data);
                    return o.remove();}).fail(function(j, s, e) {
                    Ant.OS.API.loaded(q, p, "FAIL");
                    if (e) {
                        reject(__e(e));
                    } else {
                        reject(Ant.OS.API.throwe(s));
                    }
                    return o.remove();
                });
            });
            return o.click();
        });
    },

    saveblob(name, b) {
        const url = window.URL.createObjectURL(b);
        const o = ($('<a>'))
            .attr("href", url)
            .attr("download", name)
            .css("display", "none")
            .appendTo("body");
        o[0].click();
        window.URL.revokeObjectURL(url);
        return o.remove();
    },

    loading(q, p) {
        return Ant.OS.announcer.trigger("loading", { id: q, data: { m: `${p}`, s: true }, name: "OS" });
    },

    loaded(q, p, m ) {
        return Ant.OS.announcer.trigger("loaded", {
            id: q, data: { m: `${m}: ${p}`, s: false }, name: "OS" });
    },
    
    get(p, t) {
        return new Promise(function(resolve, reject) {
            const conf = {
                type: 'GET',
                url: p
            };
            if (t) { conf.dataType = t; }
            const q = Ant.OS.announcer.getMID();
            Ant.OS.API.loading(q, p);
            return $.ajax(conf)
                .done(function(data) {
                    Ant.OS.API.loaded(q, p, "OK");
                    return resolve(data);}).fail(function(j, s, e) {
                    Ant.OS.API.loaded(q, p, "FAIL");
                    if (e) {
                        return reject(__e(e));
                    } else {
                        return reject(Ant.OS.API.throwe(s));
                    }
            });
        });
    },
                
    script(p) {
            return Ant.OS.API.get(p, "script");
        },

    resource(r) {
        const path = `resources/${r}`;
        return Ant.OS.API.get(path);
    },
    
    libready(l) {
        return Ant.OS.API.shared[l] || false;
    },

    requires(l) {
        return new Promise(function(resolve, reject) {
            if (!Ant.OS.API.shared[l]) {
                const libfp = l.asFileHandle();
                switch (libfp.ext) {
                    case "css":
                        return libfp.onready()
                            .then(function() {
                                $('<link>', {
                                    rel: 'stylesheet',
                                    type: 'text/css',
                                    'href': `${libfp.getlink()}`
                                })
                                .appendTo('head');
                                Ant.OS.API.shared[l] = true;
                                console.log("Loaded :", l);
                                Ant.OS.announcer.trigger("sharedlibraryloaded", l);
                                return resolve(undefined);}).catch(e => reject(__e(e)));
                    case "js":
                        return Ant.OS.API.script(libfp.getlink())
                        .then(function(data) {
                            Ant.OS.API.shared[l] = true;
                            console.log("Loaded :", l);
                            Ant.OS.announcer.trigger("sharedlibraryloaded", l);
                            return resolve(data);}).catch(e => reject(__e(e)));
                    default:
                        return reject(Ant.OS.API.throwe(__("Invalid library: {0}", l)));
                }
            } else {
                console.log(l, "Library exist, no need to load");
                Ant.OS.announcer.trigger("sharedlibraryloaded", l);
                return resolve();
            }
        });
    },

    require(libs) {
        return new Promise(function(resolve, reject) {
            if (!(libs.length > 0)) { return resolve(); }
            Ant.OS.announcer.observable.one("sharedlibraryloaded", function(l) {
                libs.splice(0, 1);
                return Ant.OS.API.require(libs)
                    .catch(e => reject(__e(e)))
                    .then(r => resolve(r));
            });
            return Ant.OS.API.requires(libs[0])
                .catch(e => reject(__e(e)));
        });
    },

    packages: {
        fetch() {
            return Ant.OS.API.handle.packages({
                command: "list", args: { paths: ((() => {
                    const result = [];
                    for (let k in Ant.OS.setting.system.pkgpaths) {
                        const v = Ant.OS.setting.system.pkgpaths[k];
                        result.push(v);
                    }
                    return result;
                })()) }
            });
        },

        cache() {
            return Ant.OS.API.handle.packages({
                command: "cache", args: { paths: ((() => {
                    const result = [];
                    for (let k in Ant.OS.setting.system.pkgpaths) {
                        const v = Ant.OS.setting.system.pkgpaths[k];
                        result.push(v);
                    }
                    return result;
                })()) }
            });
        }
    },

    setting(f) {
        return Ant.OS.API.handle.setting(f);
    },

    apigateway(d, ws) {
        return Ant.OS.API.handle.apigateway(d, ws);
    },

    search(text) {
        let r = [];
        
        for (let k in Ant.OS.API.searchHandle) {
            const v = Ant.OS.API.searchHandle[k];
            const ret =  Ant.OS.API.searchHandle[k](text);
            if (ret.length > 0) {
                ret.unshift({ text: k, class: "search-header", dataid: "header" });
                r = r.concat(ret);
            }
        }
        return r;
    },

    onsearch(name, fn) {
        if (!Ant.OS.API.searchHandle[name]) { return Ant.OS.API.searchHandle[name] = fn; }
    },

    setLocale(name) {
        return new Promise(function(resolve, reject) {
            const path = `resources/languages/${name}.json`;
            return Ant.OS.API.get(path, "json")
                .then(function(d) {
                    Ant.OS.setting.system.locale = name;
                    Ant.OS.API.lang = d;
                    Ant.OS.announcer.trigger("systemlocalechange", name);
                    return resolve(d);}).catch(e => reject(__e(e)));
        });
    },

    throwe(n) {
        let err = undefined;
        try {
            throw new Error(n);
        } catch (e) {
            err = e;
        }
        if (!err) { return ""; }
        return err;
    },
    
    setClipboard(v) {
        const $el = $("#clipboard");
        $el.val(v);
        $el[0].select();
        $el[0].setSelectionRange(0, 99999);
        return document.execCommand("copy");
    },

    getClipboard() {
        return new Promise(function(resolve, reject) {
            const $el = $("#clipboard");
            if (!navigator.clipboard) { return resolve($el.val()); }
            return navigator.clipboard.readText().then(d => resolve(d)).catch(e => reject(__e(e)));
        });
    },


// utilities functioncs
    switcher() {
        let k, v;
        const o = {};
        const p = {};
        for (let i = 0, end = arguments.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) { p[arguments[i]] = false; }
        Object.defineProperty(o, "__p", {
            enumerable: false,
            value: p
        });
        const fn = function(o, v) {
            return Object.defineProperty(o, v, {
                enumerable: true,
                set(value) {
                    for (let k in this.__p) {
                        const l = this.__p[k];
                        this.__p[k] = false;
                    }
                    return o.__p[v] = value;
                }
                , get() {
                    return o.__p[v];
                }
            });
        };
        for (k in o.__p) {
            v = o.__p[k];
            fn(o, k);
        }
        Object.defineProperty(o, "selected", {
            configurable: true,
            enumerable: false,
            get() {
                for (k in o.__p) {
                    v = o.__p[k];
                    if (v) { return k; }
                }
            }
        });
        return o;
    }
};
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}