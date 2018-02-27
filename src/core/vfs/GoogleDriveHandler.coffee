
# GoogleDrive File Handler
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
        @oninit () ->
            gapi.client.drive.files.list {
                q: 'parents = "root" and trashed = false ',
                fields: "nextPageToken, files(id, name)"
            }
            .then (r) ->
                console.log(r)
                f()
    
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return
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