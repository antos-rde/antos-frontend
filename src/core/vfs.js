/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
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
String.prototype.asFileHandle = function() {
    const list = this.split("://");
    const handles = Ant.OS.API.VFS.findHandles(list[0]);
    if (!handles || (handles.length === 0)) {
        Ant.OS.announcer.osfail(__("VFS unknown handle: {0}", this), (Ant.OS.API.throwe("OS.VFS")), this);
        return null;
    }
    return new (handles[0])(this);
};

this.OS.API.VFS = {
    handles: { },
    register( protos, cls ) {
        return Ant.OS.API.VFS.handles[protos] = cls;
    }, // if typeof protos is "string"
        //Ant.OS.API.VFS.handles[v] = cls for v in protos
    findHandles(proto) {
        const l = ((() => {
            const result = [];
            for (let k in Ant.OS.API.VFS.handles) {
                const v = Ant.OS.API.VFS.handles[k];
                if (proto.trim().match((new RegExp(k , "g")))) {
                    result.push(v);
                }
            }
            return result;
        })());
        return l;
    }
};

class BaseFileHandle {
    constructor(path) {
        this.dirty = false;
        this.cache = undefined;
        this.setPath(path);
    }

    setPath(p) {
        this.ready = false;
        if (!p) { return; }
        this.path = p.toString();
        const list = this.path.split("://");
        this.protocol = list[0];
        if (!(list.length > 1)) { return; }
        const re = list[1].replace(/^\/+|\/+$/g, '');
        if (re === "") { return; }
        this.genealogy = re.split("/");
        if (!this.isRoot()) { this.basename = this.genealogy[this.genealogy.length - 1]; }
        if ((this.basename.lastIndexOf(".") !== 0) && (this.basename.indexOf( "." ) !== -1)) { return this.ext = this.basename.split( "." ).pop(); }
    }
    
    filename() {
        if (!this.basename) { return "Untitled"; }
        return this.basename;
    }

    setCache(v) {
        this.cache = v;
        return this;
    }
        
    asFileHandle() { return this; }

    isRoot() { return (!this.genealogy) || (this.genealogy.size === 0); }
    
    child(name) {
        if (this.isRoot()) {
            return this.path + name;
        } else {
            return this.path + "/" + name;
        }
    }

    isHidden() {
        if (!this.basename) { return false; }
        return this.basename[0] === ".";
    }

    hash() {
        if (!this.path) { return -1; }
        return this.path.hash();
    }

    b64(t) {
        // t is object or mime type
        return new Promise((resolve, reject) => {
            const m = t === "object" ? "text/plain" : t;
            if (!this.cache) { return resolve(""); }
            if ((t === "object") || (typeof this.cache === "string")) {
                let b64;
                if (t === "object") {
                    b64 = JSON.stringify(this.cache, undefined, 4).asBase64();
                } else {
                    b64 = this.cache.asBase64();
                }
                b64 = `data:${m};base64,${b64}`;
                return resolve(b64);
            } else {
                const reader = new FileReader();
                reader.readAsDataURL(this.cache);
                reader.onload =  () => resolve(reader.result);
                return reader.onerror = e => reject(e);
            }
        });
    }
    
    parent() {
        if (this.isRoot()) { return this; }
        return (this.protocol + "://" + (this.genealogy.slice(0 , this.genealogy.length - 1)).join("/"))
            .asFileHandle();
    }

    onready() {
        // read meta data
        return new Promise((resolve, reject) => {
            if (this.ready) { return resolve(this.info); }
            return this.meta()
                .then(d => {
                    if (d.errors) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    this.info = d.result;
                    this.ready = true;
                    return resolve(d.result);
            }).catch(e => reject(__e(e)));
        });
    }

    read(t) {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._rd(t)
                        .then(d => // Ant.OS.announcer.ostrigger "VFS", { m: "read", file: me }
                    resolve(d)).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    write(t) {
        return new Promise((resolve, reject) => {
            return this._wr(t)
                .then(r => {
                    Ant.OS.announcer.ostrigger("VFS", { m: "write", file: this });
                    return resolve(r);
            }).catch(e => reject(__e(e)));
        });
    }
    
    mk(d) {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._mk(d)
                        .then(d => {
                            Ant.OS.announcer.ostrigger("VFS", { m: "mk", file: this });
                            return resolve(d);
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }
    
    remove() {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._rm()
                        .then(d => {
                            Ant.OS.announcer.ostrigger("VFS", { m: "remove", file: this });
                            return resolve(d);
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    upload() {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._up()
                        .then(d => {
                            Ant.OS.announcer.ostrigger("VFS", { m: "upload", file: this });
                            return resolve(d);
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }
        
    publish() {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._pub()
                        .then(d => {
                            Ant.OS.announcer.ostrigger("VFS", { m: "publish", file: this });
                            return resolve(d);
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    download() {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._down()
                        .then(d => {
                            Ant.OS.announcer.ostrigger("VFS", { m: "download", file: this });
                            return resolve(d);
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    move(d) {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._mv(d)
                        .then(data => {
                            Ant.OS.announcer.ostrigger("VFS", { m: "move", file: d.asFileHandle() });
                            return resolve(data);
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    execute() {
        return new Promise((resolve, reject) => {
            return this.onready()
                .then(r => {
                    return this._exec()
                        .then(d => {
                            Ant.OS.announcer.ostrigger("VFS", { m: "execute", file: this });
                            return resolve(d);
                    }).catch(e => reject(__e(e)));
            }).catch(e => reject(__e(e)));
        });
    }

    getlink() { return this.path; }

    unsupported(t) {
        return new Promise((resolve, reject) => {
            return reject(Ant.OS.API.throwe(__("Action {0} is unsupported on: {1}", t, this.path)));
        });
    }
    // actions must be implemented by subclasses

    _rd(t) {     return this.unsupported("read"); }
    _wr(d, t) {  return this.unsupported("write"); }
    _mk(d) {     return this.unsupported("mk"); }
    _rm() {      return this.unsupported("remove"); }
    _mv(d) {     return this.unsupported("move"); }
    _up() {      return this.unsupported("upload"); }
    _down() {    return this.unsupported("download"); }
    _exec() {    return this.unsupported("execute"); }
    _pub() {     return this.unsupported("publish"); }
}

// now export the class
Ant.OS.API.VFS.BaseFileHandle = BaseFileHandle;

// Remote file handle
class RemoteFileHandle extends Ant.OS.API.VFS.BaseFileHandle {
    constructor(path) {
        super(path);
    }

    meta() {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.fileinfo(this.path)
                .then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
        });
    }

    
    getlink() {
        return Ant.OS.API.handle.get + "/" + this.path;
    }

    _rd(t) {
        // t: binary, text, any type
        if (!this.info) {
            return new Promise((resolve, reject) => {
                return reject(Ant.OS.API.throwe(__(
                    "file meta-data not found: {0}", this.path)
                )
                );
            });
        }
        if (this.info.type === "dir") { return Ant.OS.API.handle.scandir(this.path); }
        //read the file
        if (t === "binary") { return Ant.OS.API.handle.fileblob(this.path); }
        return Ant.OS.API.handle.readfile(this.path, t ? t : "text");
    }

    _wr(t) {
        // t is base64 or undefined
        return new Promise((resolve, reject) => {
            if (t === "base64") {
                return Ant.OS.API.handle.write(this.path, this.cache).then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
            } else {
                return this.b64(t)
                    .then(r => {
                        return Ant.OS.API.handle.write(this.path, r)
                            .then(result => {
                                if (result.error) {
                                    return reject(Ant.OS.API.throwe(__(
                                            "{0}: {1}", result.error, this.path)
                                    )
                                    );
                                }
                                return resolve(result);
                        }).catch(e => reject(__e(e)));
                }).catch(e => reject(__e(e)));
            }
        });
    }

    _mk(d) {
        return new Promise((resolve, reject) => {
            if (!this.info) {
                return reject(Ant.OS.API.throwe(__(
                    "file meta-data not found: {0}", this.path)
                )
                );
            }
            if (this.info.type === "file") {
                return  reject(Ant.OS.API.throwe(__("{0} is not a directory", this.path)));
            }
            return Ant.OS.API.handle.mkdir(`${this.path}/${d}`)
                .then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
        });
    }

    _rm() {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.delete(this.path)
                .then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
        });
    }


    _mv(d) {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.move(this.path, d)
            .then(d => {
                if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                return resolve(d);
        }).catch(e => reject(__e(e)));
        });
    }


    _up() {
        return new Promise((resolve, reject) => {
            if (this.info.type !== "dir") {
                return reject(Ant.OS.API.throwe(__("{0} is not a file", this.path)));
            }
            return Ant.OS.API.handle.upload(this.path)
                .then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
        });
    }

    _down() {
        return new Promise((resolve, reject) => {
            if (this.info.type === "dir") {
                return Ant.OS.API.throwe(__("{0} is not a file", this.path));
            }
            return Ant.OS.API.handle.fileblob(this.path)
                .then(d => {
                    const blob = new Blob([d], { type: "octet/stream" });
                    Ant.OS.API.saveblob(this.basename, blob);
                    return resolve();
            }).catch(e => reject(__e(e)));
        });
    }

    _pub() {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.sharefile(this.path, true)
                .then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
        });
    }
}

Ant.OS.API.VFS.register("^(home|desktop|os|Untitled)$", RemoteFileHandle);

// Application Handle
class ApplicationHandle extends Ant.OS.API.VFS.BaseFileHandle {
    constructor(path) {
        super(path);
        if (this.basename) { this.info = Ant.OS.setting.system.packages[this.basename]; }
        this.ready = true;
    }
    
    _rd(t) {
        return new Promise((resolve, reject) => {
            if (this.info) { return resolve({ result: this.info }); }
            if (!this.isRoot()) { return reject(Ant.OS.API.throwe(__("Application meta data isnt found"))); }
            return resolve({ result: ((() => {
                const result = [];
                 for (let k in Ant.OS.setting.system.packages) {
                    const v = Ant.OS.setting.system.packages[k];
                    result.push(v);
                } 
                return result;
            })()) });
    });
    }
}


Ant.OS.API.VFS.register("^app$", ApplicationHandle);

class BufferFileHandle extends Ant.OS.API.VFS.BaseFileHandle {
    constructor(path, mime, data) {
        super(path);
        if (data) { this.cache = data; }
        this.info = {
            mime,
            path,
            size: data ? data.length : 0,
            name: this.basename,
            type: "file"
        };
    }
    
    _rd(t) {
        return new Promise((resolve, reject) => {
            return resolve({ result: this.cache });
    });
    }

    _wr(d, t) {
        this.cache = d;
        if (this.onchange) { this.onchange(this); }
        return new Promise((resolve, reject) => resolve({ result: true }));
    }

    _down() {
        return new Promise((resolve,  reject) => {
            const blob = new Blob([this.cache], { type: "octet/stream" });
            Ant.OS.API.saveblob(this.basename, blob);
            return resolve();
        });
    }

    onchange(f) {
        return this.onchange = f;
    }
}

Ant.OS.API.VFS.register("^mem$", BufferFileHandle);

class URLFileHandle extends Ant.OS.API.VFS.BaseFileHandle {
    constructor(path) {
        super(path);
        this.ready = true;
    }
    
    _rd(t) {
        return Ant.OS.API.get(this.path, t ? t : "text");
    }
}

Ant.OS.API.VFS.register("^(http|https|ftp)$", URLFileHandle);


class SharedFileHandle extends Ant.OS.API.VFS.BaseFileHandle {
    constructor(path) {
        super(path);
        if (this.isRoot()) { this.ready = true; }
    }

    meta() {
        return Ant.OS.API.handle.fileinfo(this.path);
    }
    
    _rd(t) {
        if (this.isRoot()) { return Ant.OS.API.get(`${Ant.OS.API.handle.shared}/all`, t); }
        //read the file
        if (t === "binary") { return Ant.OS.API.handle.fileblob(this.path); }
        return Ant.OS.API.handle.readfile(this.path, t ? t : "text");
    }
    
    _wr(d, t) {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.write(this.path, d)
                .then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
        });
    }

    _rm() {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.sharefile(this.basename, false)
                .then(d => {
                    if (d.error) { return reject(Ant.OS.API.throwe(__("{0}: {1}", d.error, this.path))); }
                    return resolve(d);
            }).catch(e => reject(__e(e)));
        });
    }

    _down() {
        return new Promise((resolve, reject) => {
            if (this.info.type === "dir") {
                return reject(Ant.OS.API.throwe(__("{0} is not a file", this.path)));
            }
            return Ant.OS.API.handle.fileblob(this.path)
                .then(data => {
                    const blob = new Blob([data], { type: "octet/stream" });
                    Ant.OS.API.saveblob(this.basename, blob);
                    return resolve();
            }).catch(e => reject(__e(e)));
        });
    }
    _pub() {
        return new Promise((resolve, reject) => resolve({ result: this.basename }));
    }
}

Ant.OS.API.VFS.register("^shared$", SharedFileHandle);