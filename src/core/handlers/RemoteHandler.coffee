self.OS.API.handler =
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

    readfile: (p, c) ->
        path = "lua-api/fs/get/"
        _API.get path + p, c, (e, s) ->
            _courrier.osfail "Fail to read file: #{p}",e , s

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