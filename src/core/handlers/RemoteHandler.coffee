self.OS.API.HOST = self.location.hostname+ (if self.location.port then":#{self.location.port}" else "")
self.OS.API.REST = "#{self.location.protocol}//#{self.OS.API.HOST}/lua-api"

_REST = self.OS.API.REST
self.OS.API.handler =
    get: "#{_REST}/fs/get/"
    scandir: (p, c ) ->
        path = "#{_REST}/fs/scandir"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to scan directory: #{p}", e, s
    mkdir: (p, c ) ->
        path = "#{_REST}/fs/mkdir"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to create directory: #{p}", e, s

    fileinfo: (p, c) ->
        path = "#{_REST}/fs/fileinfo"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to get file metadata: #{p}", e, s

    readfile: (p, c, t) ->
        path = "#{_REST}/fs/get/"
        _API.get path + p, c, (e, s) ->
            _courrier.osfail "Fail to read file: #{p}", e, s
        , t

    move: (s, d, c) ->
        path = "#{_REST}/fs/move"
        _API.post path, { src: s, dest: d }, c, (e, s) ->
            _courrier.osfail "Fail to move file: #{s} -> #{d}", e, s

    delete: (p , c) ->
        path = "#{_REST}/fs/delete"
        _API.post path, { path: p }, c, (e, s) ->
            _courrier.osfail "Fail to delete: #{p}", e, s

    fileblob: (p, c) ->
        path = "#{_REST}/fs/get/"
        _API.blob path + p, c, (e, s)  ->
            _courrier.osfail "Fail to read file: #{p}", e, s

    packages: (d, c) ->
        path = "#{_REST}/system/packages"
        _API.post path, d, c, (e, s) ->
            _courrier.osfail "Fail to #{d.command} package", e, s

    upload: (d, c) ->
        path = "#{_REST}/fs/upload"
        _API.upload path, d, c, (e, s) ->
            _courrier.osfail "Fail to upload file to: #{d}", e, s

    write: (p, d , c) ->
        path = "#{_REST}/fs/write"
        _API.post path, { path: p, data: d }, c, (e, s) ->
            _courrier.osfail "Fail to write to file: #{p}", e, s

    scanapp: (p, c ) ->
        path = "#{_REST}/system/application"
    auth: (c) ->
        p = "#{_REST}/system/auth"
        _API.post p, {}, c, () ->
            alert "Resource not found: #{p}"
    login: (d, c) ->
        p = "#{_REST}/system/login"
        _API.post p, d, c, () ->
            alert "Resource not found: #{p}"
    logout: () ->
        p = "#{_REST}/system/logout"
        _API.post p, {}, (d) ->
                _OS.boot()
            , () ->
                alert "Resource not found #{p}"
    setting: () ->
        p = "#{_REST}/system/settings"
        _API.post p, _OS.setting, (d) ->
            _courrier.oserror "Cannot save system setting", d.error if d.error
        , (e, s) ->
            _courrier.osfail "Fail to make request: #{p}", e, s
    
    dbquery: (cmd,d, c) ->
        path = "#{_REST}/db/#{cmd}"
        _API.post path, d, c, (e, s) ->
            _courrier.osfail "Fail to query data from database: #{path}", e, s