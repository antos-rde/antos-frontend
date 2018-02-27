
# GoogleDrive File Handler
G_CACHE = {"gdv:///":"root"}

class GoogleDriveHandler extends this.OS.API.VFS.BaseFileHandler
    constructor: (path) ->
        super path
        me = @
        @setting = _OS.setting.VFS.gdrive
        return  _courrier.oserror "Unknown API setting for google drive VFS",   (_API.throwe "OS.VFS"), null unless @setting
        @gid = 'root' if @isRoot()

    oninit: (f) ->
        me = @
        return unless @setting
        if _API.libready @setting.apilink
            f()
        else
            _API.require @setting.apilink, () ->
                gapi.load "client:auth2", () ->
                    gapi.client.init {
                        apiKey: me.setting.API_KEY,
                        clientId: me.setting.CLIENT_ID,
                        discoveryDocs: me.setting.DISCOVERY_DOCS,
                        scope: me.setting.SCOPES
                    }
                    .then () ->
                        fn = (r) ->
                            return f() if r
                            # perform the login
                            gapi.auth2.getAuthInstance().signIn()

                        gapi.auth2.getAuthInstance().isSignedIn.listen (r) ->
                            fn(r)
                        fn(gapi.auth2.getAuthInstance().isSignedIn.get())

    meta: (f) ->
        me = @
        @oninit () ->
            me.gid = G_CACHE[me.path] if G_CACHE[me.path]
            if me.gid
                #console.log "Gid exists ", me.gid
                gapi.client.drive.files.get {
                    fileId: me.gid,
                    fields: me.fields()
                }
                .then (r) ->
                    return unless r.result
                    f(r)
            else 
                #console.log "Find file in ", me.parent()
                fp = me.parent().asFileHandler()
                fp.meta (d) ->
                    file = d.result
                    G_CACHE[fp.path] = file.id
                    gapi.client.drive.files.list {
                        q: "name = '#{me.basename}' and '#{file.id}' in parents and trashed = false",
                        fields: "files(#{me.fields()})"
                    }
                    .then (r) ->
                        #console.log r
                        return unless r.result.files and r.result.files.length > 0
                        G_CACHE[me.path] = r.result.files[0].id
                        f { result: r.result.files[0] }
    
    fields: () ->
        return "webContentLink, id, name,mimeType,description, kind, parents, properties, iconLink, createdTime, modifiedTime, owners, permissions, fullFileExtension, fileExtension, size"

    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return unless @info.id
                if @info.mimeType is "application/vnd.google-apps.folder"
                    gapi.client.drive.files.list {
                        q: "'#{me.info.id}' in parents and trashed = false",
                        fields: "files(#{me.fields()})"
                    }
                    .then (r) ->
                        return unless r.result.files and r.result.files.length > 0
                        for file in r.result.files
                            file.path = me.path + "/" + file.name
                            file.mime = file.mimeType
                            file.filename = file.name
                            file.type = "file"
                            file.gid = file.id
                            if file.mimeType is  "application/vnd.google-apps.folder"
                                file.mime = "dir"
                                file.type = "dir"
                        f { result: r.result.files }
                else
                    gapi.client.drive.files.get {
                        fileId: me.info.id,
                        alt: 'media'
                    }
                    .then (r) ->
                        f r.body
                
            when "mk"
                return
            when "write"
                return
            when "upload"
                return
            when "remove"
                return
            when "publish"
                return
            when "download"
                return
            when "move"
                return
            else
                return _courrier.osfail "VFS unknown action: #{n}", (_API.throwe "OS.VFS"), n


self.OS.API.VFS.register "^gdv$", GoogleDriveHandler