/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
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

// GoogleDrive File Handle
let G_CACHE = {"gdv://":{ id: "root", mime: 'dir' } };

class GoogleDriveHandle extends this.OS.API.VFS.BaseFileHandle {
    constructor(path) {
        super(path);
        const me = this;
        this.setting = Ant.OS.setting.VFS.gdrive;
        if (!this.setting) { return  Ant.OS.announcer.oserror(__("Unknown API setting for {0}", "GAPI"),   (Ant.OS.API.throwe("OS.VFS")), null); }
        if (this.isRoot()) { this.gid = 'root'; }
        this.cache = "";
    }

    oninit(f) {
        const me = this;
        if (!this.setting) { return; }
        const fn = function(r) {
            if (r) { return f(); }
            // perform the login
            G_CACHE = {"gdv://":{ id: "root", mime: 'dir' } };
            return gapi.auth2.getAuthInstance().signIn();
        };

        if (Ant.OS.API.libready(this.setting.apilink)) {
            gapi.auth2.getAuthInstance().isSignedIn.listen(r => fn(r));
            return fn(gapi.auth2.getAuthInstance().isSignedIn.get());
        } else {
            return Ant.OS.API.require(this.setting.apilink, function() {
                // avoid popup block
                const q = Ant.OS.announcer.getMID();
                return gapi.load("client:auth2", function() {
                    Ant.OS.API.loading(q, "GAPI");
                    return gapi.client.init({
                        apiKey: me.setting.API_KEY,
                        clientId: me.setting.CLIENT_ID,
                        discoveryDocs: me.setting.DISCOVERY_DOCS,
                        scope: me.setting.SCOPES
                    })
                    .then(function() {
                        Ant.OS.API.loaded(q, "OK");
                        gapi.auth2.getAuthInstance().isSignedIn.listen(r => fn(r));
                        return _GUI.openDialog("YesNoDialog", function(d) {
                            if (!d) { return Ant.OS.announcer.osinfo(__("User abort the authentication")); }
                            return fn(gapi.auth2.getAuthInstance().isSignedIn.get());
                        }
                        , __("Authentication")
                        , { text: __("Would you like to login to {0}?", "Google Drive") });})
                    .catch(function(err) {
                        Ant.OS.API.loaded(q, "FAIL");
                        return Ant.OS.announcer.oserror(__("VFS cannot init {0}: {1}", "GAPI",err.error), (Ant.OS.API.throwe("OS.VFS")), err);
                    });
                });
            });
        }
    }

    meta(f) {
        const me = this;
        return this.oninit(function() {
            const q = Ant.OS.announcer.getMID();
            if (G_CACHE[me.path]) { me.gid = G_CACHE[me.path].id; }
            if (me.gid) {
                //console.log "Gid exists ", me.gid
                Ant.OS.API.loading(q, "GAPI");
                return gapi.client.drive.files.get({
                    fileId: me.gid,
                    fields: me.fields()
                })
                .then(function(r) {
                    Ant.OS.API.loaded(q, "OK");
                    if (!r.result) { return; }
                    r.result.mime = r.result.mimeType;
                    return f(r);}).catch(function(err) {
                    Ant.OS.API.loaded(q, "FAIL");
                    return Ant.OS.announcer.oserror(__("VFS cannot get meta data for {0}", me.gid), (Ant.OS.API.throwe("OS.VFS")), err);
                });
            } else { 
                //console.log "Find file in ", me.parent()
                const fp = me.parent().asFileHandle();
                return fp.meta(function(d) {
                    const file = d.result;
                    const q1 = Ant.OS.announcer.getMID();
                    Ant.OS.API.loading(q1, "GAPI");
                    G_CACHE[fp.path] = { id: file.id, mime: file.mimeType };
                    return gapi.client.drive.files.list({
                        q: `name = '${me.basename}' and '${file.id}' in parents and trashed = false`,
                        fields: `files(${me.fields()})`
                    })
                    .then(function(r) {
                        //console.log r
                        Ant.OS.API.loaded(q1, "OK");
                        if (!r.result.files || !(r.result.files.length > 0)) { return; }
                        G_CACHE[me.path] = { id: r.result.files[0].id, mime: r.result.files[0].mimeType };
                        r.result.files[0].mime = r.result.files[0].mimeType;
                        return f({ result: r.result.files[0] });})
                    .catch(function(err) {
                        Ant.OS.API.loaded(q1, "FAIL");
                        return Ant.OS.announcer.oserror(__("VFS cannot get meta data for {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), err);
                    });
                });
            }
        });
    }
    
    fields() {
        return "webContentLink, id, name,mimeType,description, kind, parents, properties, iconLink, createdTime, modifiedTime, owners, permissions, fullFileExtension, fileExtension, size";
    }
    isFolder() {
        return this.info.mimeType === "application/vnd.google-apps.folder";
    }
    
    save(id, m, f) {
        const me = this;
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const oauthToken = user.getAuthResponse().access_token;
        const q = Ant.OS.announcer.getMID();
        const xhr = new XMLHttpRequest();
        const url = 'https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media';
        xhr.open('PATCH', url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + oauthToken);
        xhr.setRequestHeader('Content-Type', m);
        xhr.setRequestHeader('Content-Encoding', 'base64');
        xhr.setRequestHeader('Content-Transfer-Encoding', 'base64');
        Ant.OS.API.loading(q, "GAPI");
        const error = function(e, s) {
            Ant.OS.API.loaded(q, "FAIL");
            return Ant.OS.announcer.oserror(__("VFS cannot save : {0}", me.path), e, s);
        };
        xhr.onreadystatechange = function() {
            if ( xhr.readyState === 4 ) {
                if ( xhr.status === 200 ) {
                    Ant.OS.API.loaded(q, "OK");
                    return f({ result: JSON.parse(xhr.responseText) });
                } else {
                    return error(xhr, xhr.status);
                }
            }
        };
        xhr.onerror = () => error(xhr, xhr.status);
        if (m === "base64") { return xhr.send(me.cache.replace(/^data:[^;]+;base64,/g, "")); }
        return this.sendB64(m, data => xhr.send(data.replace(/^data:[^;]+;base64,/g, "")));
    }

    getlink() {
        if (this.ready) { return this.info.webContentLink; }
        return undefined;
    }

    action(n, p, f) {
        const me = this;
        const q = Ant.OS.announcer.getMID();
        Ant.OS.API.loading(q, "GAPI");
        switch (n) {
            case "read":
                if (!this.info.id) { return; }
                if (this.isFolder()) {
                    return gapi.client.drive.files.list({
                        q: `'${me.info.id}' in parents and trashed = false`,
                        fields: `files(${me.fields()})`
                    })
                    .then(function(r) {
                        Ant.OS.API.loaded(q, "OK");
                        if (!r.result.files) { return; }
                        for (let file of Array.from(r.result.files)) {
                            file.path = me.child(file.name);
                            file.mime = file.mimeType;
                            file.filename = file.name;
                            file.type = "file";
                            file.gid = file.id;
                            if (file.mimeType ===  "application/vnd.google-apps.folder") {
                                file.mime = "dir";
                                file.type = "dir";
                                file.size = 0;
                            }
                            G_CACHE[file.path] = { id: file.gid, mime: file.mime };
                        }
                        return f({ result: r.result.files });})
                    .catch(function(err) {
                        Ant.OS.API.loaded(q, "FAIL");
                        return Ant.OS.announcer.oserror(__("VFS cannot read : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), err);
                    });
                } else {
                    return gapi.client.drive.files.get({
                        fileId: me.info.id,
                        alt: 'media'
                    })
                    .then(function(r) {
                        Ant.OS.API.loaded(q, "OK");
                        if (p !== "binary") { return f(r.body); }
                        return f(r.body.asUint8Array());}).catch(function(err) {
                        Ant.OS.API.loaded(q, "FAIL");
                        return Ant.OS.announcer.oserror(__("VFS cannot read : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), err);
                    });
                }
                
            case "mk":
                if (!this.isFolder()) { return f({ error: __("{0} is not a directory", this.path) }); }
                var meta = {
                    name: p,
                    parents: [this.info.id],
                    mimeType: 'application/vnd.google-apps.folder'
                };
                
                gapi.client.drive.files.create({
                    resource: meta,
                    fields: 'id'
                })
                .then(function(r) {
                    Ant.OS.API.loaded(q, "OK");
                    //console.log r
                    if (!r || !r.result) { return Ant.OS.announcer.oserror(__("VFS cannot create : {0}", p), (Ant.OS.API.throwe("OS.VFS")), r); }
                    G_CACHE[me.child(p)] = { id: r.result.id, mime: "dir" };
                    return f(r);}).catch(function(err) {
                    Ant.OS.API.loaded(q, "FAIL");
                    return Ant.OS.announcer.oserror(__("VFS cannot create : {0}", p), (Ant.OS.API.throwe("OS.VFS")), err);
                });
                    
                return;
            
            case "write":
                var gid = undefined;
                if (G_CACHE[me.path]) { gid = G_CACHE[me.path].id; }
                if (gid) {
                    Ant.OS.API.loaded(q, "OK");
                    return this.save(gid, p, f);
                } else {
                    const dir = this.parent().asFileHandle();
                    return dir.onready(function() {
                        meta = {
                            name: me.basename,
                            mimeType: p,
                            parents: [dir.info.id]
                        };

                        return gapi.client.drive.files.create({
                            resource: meta,
                            fields: 'id'
                        })
                        .then(function(r) {
                            Ant.OS.API.loaded(q, "OK");
                            if (!r || !r.result) { return Ant.OS.announcer.oserror(__("VFS cannot write : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), r); }
                            G_CACHE[me.path] = { id: r.result.id, mime: p };
                            return me.save(r.result.id, p, f);}).catch(function(err) {
                            Ant.OS.API.loaded(q, "FAIL");
                            return Ant.OS.announcer.oserror(__("VFS cannot write : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), err);
                        });
                    });
                }
                            
            case "upload":
                if (!this.isFolder()) { return; }
                //insert a temporal file selector
                var o = ($('<input>')).attr('type', 'file').css("display", "none");
                Ant.OS.API.loaded(q, "OK");
                o.change(function() {
                    //Ant.OS.API.loading q, p
                    const fo = o[0].files[0];
                    const file = (me.child(fo.name)).asFileHandle();
                    file.cache = fo;
                    file.write(fo.type, f);
                    return o.remove();
                });
                    
                    //Ant.OS.API.loaded q, p, "OK"
                    //Ant.OS.API.loaded q, p, "FAIL"
                        
                return o.click();
            
            case "remove":
                if (!this.info.id) { return; }
                return gapi.client.drive.files.delete({
                    fileId: me.info.id
                })
                .then(function(r) {
                    //console.log r
                    Ant.OS.API.loaded(q, "OK");
                    if (!r) { return Ant.OS.announcer.oserror(__("VFS cannot delete : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), r); }
                    G_CACHE[me.path] = null;
                    return f({ result: true });})
                .catch(function(err) {
                    Ant.OS.API.loaded(q, "FAIL");
                    return Ant.OS.announcer.oserror(__("VFS cannot delete : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), err);
                });
            
            case "publish":
                Ant.OS.API.loaded(q, "OK");
                return;
            
            case "download":
                return gapi.client.drive.files.get({
                    fileId: me.info.id,
                    alt: 'media'
                })
                .then(function(r) {
                    Ant.OS.API.loaded(q, "OK");
                    if (!r.body) { return Ant.OS.announcer.oserror(__("VFS cannot download file : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), r); }
                    let bytes = [];
                    for (let i = 0, end = r.body.length - 1, asc = 0 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
                        bytes.push(r.body.charCodeAt(i));
                    }
                    bytes = new Uint8Array(bytes);
                    const blob = new Blob([bytes], { type: "octet/stream" });
                    return Ant.OS.API.saveblob(me.basename, blob);}).catch(function(err) {
                    Ant.OS.API.loaded(q, "FAIL");
                    return Ant.OS.announcer.oserror(__("VFS cannot download file : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), err);
                });
            
            case "move":
                var dest = p.asFileHandle().parent().asFileHandle();
                return dest.onready(function() {
                    const previousParents = me.info.parents.join(',');
                    return gapi.client.drive.files.update({
                        fileId: me.info.id,
                        addParents: dest.info.id,
                        removeParents: previousParents,
                        fields: "id"
                    })
                    .then(function(r) {
                        Ant.OS.API.loaded(q, "OK");
                        if (!r) { return Ant.OS.announcer.oserror(__("VFS cannot move : {0}", me.path), (Ant.OS.API.throwe("OS.VFS")), r); }
                        return f(r);}).catch(function(err) {
                        Ant.OS.API.loaded(q, "FAIL");
                        return Ant.OS.announcer.oserror(__("VFS cannot move : {0}", me.gid), (Ant.OS.API.throwe("OS.VFS")), err);
                    });
                }
                , err => Ant.OS.API.loaded(q, "FAIL"));
            default:
                Ant.OS.API.loaded(q, "FAIL");
                return Ant.OS.announcer.osfail(__("VFS unknown action: {0}", n), (Ant.OS.API.throwe("OS.VFS")), n);
        }
    }
}


self.OS.API.VFS.register("^gdv$", GoogleDriveHandle);
// search the cache for file
self.OS.API.onsearch("Google Drive", function(t) {
    const arr = [];
    const term = new RegExp(t, "i");
    for (let k in G_CACHE) {
        const v = G_CACHE[k];
        if ((k.match(term)) || (v && v.mime.match(term))) {
            const file = k.asFileHandle();
            file.text = file.basename;
            file.mime = v.mime;
            file.iconclass = "fa fa-file";
            if (file.mime === "dir") { file.iconclass = "fa fa-folder"; }
            file.complex = true;
            file.detail = [{ text: file.path }];
            arr.push(file);
        }
    }
    return arr;
});

self.OS.onexit("cleanUpGoogleDrive", function() {
    G_CACHE = { "gdv://": { id: "root", mime: 'dir' } };
    if (!Ant.OS.setting.VFS.gdrive || !Ant.OS.API.libready(Ant.OS.setting.VFS.gdrive.apilink)) { return; }
    const auth2 = gapi.auth2.getAuthInstance();
    if (!auth2) { return; }
    if (auth2.isSignedIn.get()) {
        let el;
        return el = $('<iframe/>', {
            src: 'https://www.google.com/accounts/Logout',
            frameborder: 0,
            onload() {
                //console.log("disconnect")
                return auth2.disconnect();
            }
                //$(this).remove()
        });
    }
});
        //($ "body").append(el)
            