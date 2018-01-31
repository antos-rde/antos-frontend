self.OS.API.handler =
    get: "lua-api/fs/get"
    
    scandir: (p, c ) ->
        path = "lua-api/fs/scandir"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to scan directory: #{p}", e, s
    mkdir: (p, c ) ->
        path = "lua-api/fs/mkdir"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to create directory: #{p}", e, s

    fileinfo: (p, c) ->
        path = "lua-api/fs/fileinfo"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to get file metadata: #{p}", e, s

    readfile: (p, c, t) ->
        path = "lua-api/fs/get/"
        _API.get path + p, c, (e, s) ->
            _courrier.osfail "Fail to read file: #{p}", e, s
        , t

    move: (s, d, c) ->
        path = "lua-api/fs/move"
        _API.post path, { src: s, dest: d }, c, (e, s) ->
            _courrier.osfail "Fail to move file: #{s} -> #{d}", e, s

    delete: (p , c) ->
        path = "lua-api/fs/delete"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to delete: #{p}", e, s

    fileblob: (p, c) ->
        path = "lua-api/fs/get/"
        _API.blob path + p, c, (e, s)  ->
            _courrier.osfail "Fail to read file: #{p}", e, s

    packages: (d, c) ->
        path = "lua-api/system/packages"
        _API.post path, d, c, (e, s) ->
            _courrier.osfail "Fail to #{d.command} package", e, s

    upload: (d, c) ->
        path = "lua-api/fs/upload"
        _API.upload path, d, c, (e, s) ->
            _courrier.osfail "Fail to upload file to: #{d}", e, s

    write: (p, d , c) ->
        path = "lua-api/fs/write"
        _API.post path, { path: p, data: d }, c, (e, s) ->
            _courrier.osfail "Fail to write to file: #{p}", e, s

    scanapp: (p, c ) ->
        path = "lua-api/system/application"
    auth: (c) ->
        p = "lua-api/system/auth"
        _API.post p, {}, c, () ->
            alert "Resource not found: #{p}"
    login: (d, c) ->
        p = "lua-api/system/login"
        _API.post p, d, c, () ->
            alert "Resource not found: #{p}"
    logout: () ->
        p = "lua-api/system/logout"
        _API.post p, {}, (d) ->
                _OS.boot()
            , () ->
                alert "Resource not found #{p}"
    setting: () ->
        p = "lua-api/system/settings"
        _API.post p, _OS.setting, (d) ->
            _courrier.oserror "Cannot save system setting", d.error if d.error
        , (e, s) ->
            _courrier.osfail "Fail to make request: #{p}", e, s