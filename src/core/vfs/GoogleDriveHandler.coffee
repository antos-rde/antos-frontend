
# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.

# GoogleDrive File Handler
G_CACHE = {"gdv://":{ id: "root", mime: 'dir' } }

class GoogleDriveHandler extends this.OS.API.VFS.BaseFileHandler
    constructor: (path) ->
        super path
        me = @
        @setting = _OS.setting.VFS.gdrive
        return  _courrier.oserror __("Unknown API setting for {0}", "GAPI"),   (_API.throwe "OS.VFS"), null unless @setting
        @gid = 'root' if @isRoot()
        @cache = ""

    oninit: (f) ->
        me = @
        return unless @setting
        fn = (r) ->
            return f() if r
            # perform the login
            G_CACHE = {"gdv://":{ id: "root", mime: 'dir' } }
            gapi.auth2.getAuthInstance().signIn()

        if _API.libready @setting.apilink
            gapi.auth2.getAuthInstance().isSignedIn.listen (r) ->
                fn(r)
            fn(gapi.auth2.getAuthInstance().isSignedIn.get())
        else
            _API.require @setting.apilink, () ->
                # avoid popup block
                q = _courrier.getMID()
                gapi.load "client:auth2", () ->
                    _API.loading q, "GAPI"
                    gapi.client.init {
                        apiKey: me.setting.API_KEY,
                        clientId: me.setting.CLIENT_ID,
                        discoveryDocs: me.setting.DISCOVERY_DOCS,
                        scope: me.setting.SCOPES
                    }
                    .then () ->
                        _API.loaded q, "OK"
                        gapi.auth2.getAuthInstance().isSignedIn.listen (r) ->
                            fn(r)
                        _GUI.openDialog "YesNoDialog", (d) ->
                            return _courrier.osinfo __("User abort the authentication") unless d
                            fn(gapi.auth2.getAuthInstance().isSignedIn.get())
                        , __("Authentication")
                        , { text: __("Would you like to login to {0}?", "Google Drive") }
                    .catch (err) ->
                        _API.loaded q, "FAIL"
                        _courrier.oserror __("VFS cannot init {0}: {1}", "GAPI",err.error), (_API.throwe "OS.VFS"), err

    meta: (f) ->
        me = @
        @oninit () ->
            q = _courrier.getMID()
            me.gid = G_CACHE[me.path].id if G_CACHE[me.path]
            if me.gid
                #console.log "Gid exists ", me.gid
                _API.loading q, "GAPI"
                gapi.client.drive.files.get {
                    fileId: me.gid,
                    fields: me.fields()
                }
                .then (r) ->
                    _API.loaded q, "OK"
                    return unless r.result
                    r.result.mime = r.result.mimeType
                    f(r)
                .catch (err) ->
                    _API.loaded q, "FAIL"
                    _courrier.oserror __("VFS cannot get meta data for {0}", me.gid), (_API.throwe "OS.VFS"), err
            else 
                #console.log "Find file in ", me.parent()
                fp = me.parent().asFileHandler()
                fp.meta (d) ->
                    file = d.result
                    q1 = _courrier.getMID()
                    _API.loading q1, "GAPI"
                    G_CACHE[fp.path] = { id: file.id, mime: file.mimeType }
                    gapi.client.drive.files.list {
                        q: "name = '#{me.basename}' and '#{file.id}' in parents and trashed = false",
                        fields: "files(#{me.fields()})"
                    }
                    .then (r) ->
                        #console.log r
                        _API.loaded q1, "OK"
                        return unless r.result.files and r.result.files.length > 0
                        G_CACHE[me.path] = { id: r.result.files[0].id, mime: r.result.files[0].mimeType }
                        r.result.files[0].mime = r.result.files[0].mimeType
                        f { result: r.result.files[0] }
                    .catch (err) ->
                        _API.loaded q1, "FAIL"
                        _courrier.oserror __("VFS cannot get meta data for {0}", me.path), (_API.throwe "OS.VFS"), err
    
    fields: () ->
        return "webContentLink, id, name,mimeType,description, kind, parents, properties, iconLink, createdTime, modifiedTime, owners, permissions, fullFileExtension, fileExtension, size"
    isFolder: () ->
        return @info.mimeType is "application/vnd.google-apps.folder"
    
    save: (id, m, f) ->
        me = @
        user = gapi.auth2.getAuthInstance().currentUser.get()
        oauthToken = user.getAuthResponse().access_token
        q = _courrier.getMID()
        xhr = new XMLHttpRequest()
        url = 'https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media'
        xhr.open('PATCH', url)
        xhr.setRequestHeader 'Authorization', 'Bearer ' + oauthToken
        xhr.setRequestHeader 'Content-Type', m
        xhr.setRequestHeader 'Content-Encoding', 'base64'
        xhr.setRequestHeader 'Content-Transfer-Encoding', 'base64'
        _API.loading q, "GAPI"
        error = (e, s) ->
            _API.loaded q, "FAIL"
            _courrier.oserror __("VFS cannot save : {0}", me.path), e, s
        xhr.onreadystatechange = () ->
            if ( xhr.readyState == 4 )
                if ( xhr.status == 200 )
                    _API.loaded q, "OK"
                    f { result: JSON.parse(xhr.responseText) }
                else
                    error xhr, xhr.status
        xhr.onerror = () ->
            error xhr, xhr.status
        return xhr.send me.cache.replace /^data:[^;]+;base64,/g, "" if m is "base64"
        @sendB64 m, (data) ->
            xhr.send data.replace /^data:[^;]+;base64,/g, ""

    getlink: () ->
        return @info.webContentLink if @ready
        return undefined

    action: (n, p, f) ->
        me = @
        q = _courrier.getMID()
        _API.loading q, "GAPI"
        switch n
            when "read"
                return unless @info.id
                if @isFolder()
                    gapi.client.drive.files.list {
                        q: "'#{me.info.id}' in parents and trashed = false",
                        fields: "files(#{me.fields()})"
                    }
                    .then (r) ->
                        _API.loaded q, "OK"
                        return unless r.result.files
                        for file in r.result.files
                            file.path = me.child file.name
                            file.mime = file.mimeType
                            file.filename = file.name
                            file.type = "file"
                            file.gid = file.id
                            if file.mimeType is  "application/vnd.google-apps.folder"
                                file.mime = "dir"
                                file.type = "dir"
                                file.size = 0
                            G_CACHE[file.path] = { id: file.gid, mime: file.mime }
                        f { result: r.result.files }
                    .catch (err) ->
                        _API.loaded q, "FAIL"
                        _courrier.oserror __("VFS cannot read : {0}", me.path), (_API.throwe "OS.VFS"), err
                else
                    gapi.client.drive.files.get {
                        fileId: me.info.id,
                        alt: 'media'
                    }
                    .then (r) ->
                        _API.loaded q, "OK"
                        return f r.body unless p is "binary"
                        f r.body.asUint8Array()
                    .catch (err) ->
                        _API.loaded q, "FAIL"
                        _courrier.oserror __("VFS cannot read : {0}", me.path), (_API.throwe "OS.VFS"), err
                
            when "mk"
                return f { error: __("{0} is not a directory", @path) } unless @isFolder()
                meta =
                    name: p,
                    parents: [@info.id],
                    mimeType: 'application/vnd.google-apps.folder'
                
                gapi.client.drive.files.create {
                    resource: meta,
                    fields: 'id'
                }
                .then (r) ->
                    _API.loaded q, "OK"
                    #console.log r
                    return _courrier.oserror __("VFS cannot create : {0}", p), (_API.throwe "OS.VFS"), r unless r and r.result
                    G_CACHE[me.child p] = { id: r.result.id, mime: "dir" }
                    f r
                .catch (err) ->
                    _API.loaded q, "FAIL"
                    _courrier.oserror __("VFS cannot create : {0}", p), (_API.throwe "OS.VFS"), err
                    
                return
            
            when "write"
                gid = undefined
                gid = G_CACHE[me.path].id if G_CACHE[me.path]
                if gid
                    _API.loaded q, "OK"
                    @save gid, p, f
                else
                    dir = @parent().asFileHandler()
                    dir.onready () ->
                        meta =
                            name: me.basename,
                            mimeType: p,
                            parents: [dir.info.id]

                        gapi.client.drive.files.create {
                            resource: meta,
                            fields: 'id'
                        }
                        .then (r) ->
                            _API.loaded q, "OK"
                            return _courrier.oserror __("VFS cannot write : {0}", me.path), (_API.throwe "OS.VFS"), r unless r and r.result
                            G_CACHE[me.path] = { id: r.result.id, mime: p }
                            me.save r.result.id, p, f
                        .catch (err) ->
                            _API.loaded q, "FAIL"
                            _courrier.oserror __("VFS cannot write : {0}", me.path), (_API.throwe "OS.VFS"), err
                            
            when "upload"
                return unless @isFolder()
                #insert a temporal file selector
                o = ($ '<input>').attr('type', 'file').css("display", "none")
                _API.loaded q, "OK"
                o.change () ->
                    #_API.loading q, p
                    fo = o[0].files[0]
                    file = (me.child fo.name).asFileHandler()
                    file.cache = fo
                    file.write fo.type, f
                    o.remove()
                    
                    #_API.loaded q, p, "OK"
                    #_API.loaded q, p, "FAIL"
                        
                o.click()
            
            when "remove"
                return unless @info.id
                gapi.client.drive.files.delete {
                    fileId: me.info.id
                }
                .then (r) ->
                    #console.log r
                    _API.loaded q, "OK"
                    return _courrier.oserror __("VFS cannot delete : {0}", me.path), (_API.throwe "OS.VFS"), r unless r
                    G_CACHE[me.path] = null
                    f { result: true }
                .catch (err) ->
                    _API.loaded q, "FAIL"
                    _courrier.oserror __("VFS cannot delete : {0}", me.path), (_API.throwe "OS.VFS"), err
            
            when "publish"
                _API.loaded q, "OK"
                return
            
            when "download"
                gapi.client.drive.files.get {
                    fileId: me.info.id,
                    alt: 'media'
                }
                .then (r) ->
                    _API.loaded q, "OK"
                    return _courrier.oserror __("VFS cannot download file : {0}", me.path), (_API.throwe "OS.VFS"), r unless r.body
                    bytes = []
                    for i in [0..(r.body.length - 1)]
                        bytes.push r.body.charCodeAt i
                    bytes = new Uint8Array(bytes)
                    blob = new Blob [bytes], { type: "octet/stream" }
                    _API.saveblob me.basename, blob
                .catch (err) ->
                    _API.loaded q, "FAIL"
                    _courrier.oserror __("VFS cannot download file : {0}", me.path), (_API.throwe "OS.VFS"), err
            
            when "move"
                dest = p.asFileHandler().parent().asFileHandler()
                dest.onready () ->
                    previousParents = me.info.parents.join ','
                    gapi.client.drive.files.update {
                        fileId: me.info.id,
                        addParents: dest.info.id,
                        removeParents: previousParents,
                        fields: "id"
                    }
                    .then (r) ->
                        _API.loaded q, "OK"
                        return _courrier.oserror __("VFS cannot move : {0}", me.path), (_API.throwe "OS.VFS"), r unless r
                        f r
                    .catch (err) ->
                        _API.loaded q, "FAIL"
                        _courrier.oserror __("VFS cannot move : {0}", me.gid), (_API.throwe "OS.VFS"), err
                , (err) ->
                    _API.loaded q, "FAIL"
            else
                _API.loaded q, "FAIL"
                return _courrier.osfail __("VFS unknown action: {0}", n), (_API.throwe "OS.VFS"), n


self.OS.API.VFS.register "^gdv$", GoogleDriveHandler
# search the cache for file
self.OS.API.onsearch "Google Drive", (t) ->
    arr = []
    term = new RegExp t, "i"
    for k, v of G_CACHE
        if (k.match term) or (v and v.mime.match term)
            file = k.asFileHandler()
            file.text = file.basename
            file.mime = v.mime
            file.iconclass = "fa fa-file"
            file.iconclass = "fa fa-folder" if file.mime is "dir"
            file.complex = true
            file.detail = [{ text: file.path }]
            arr.push file
    return arr

self.OS.onexit "cleanUpGoogleDrive", () ->
    G_CACHE = { "gdv://": { id: "root", mime: 'dir' } }
    return unless _OS.setting.VFS.gdrive and _API.libready _OS.setting.VFS.gdrive.apilink
    auth2 = gapi.auth2.getAuthInstance()
    return unless auth2
    if auth2.isSignedIn.get()
        el = $ '<iframe/>', {
            src: 'https://www.google.com/accounts/Logout',
            frameborder: 0,
            onload: () ->
                #console.log("disconnect")
                auth2.disconnect()
                #$(this).remove()
        }
        #($ "body").append(el)
            