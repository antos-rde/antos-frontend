String.prototype.asFileHandler = () ->
    list = @split ":///"
    handlers = _API.VFS.findHandlers list[0]
    if not handlers or handlers.length is 0
        _courrier.osfail "VFS unknown handler: #{@}", (_API.throwe "OS.VFS"), @
        return null
    return new handlers[0](@)

this.OS.API.VFS =
    handlers: { }
    register: ( protos, cls ) ->
        return self.OS.API.VFS.handlers[protos] = cls # if typeof protos is "string"
        #_API.VFS.handlers[v] = cls for v in protos
    findHandlers: (proto) ->
        l = (v for k, v of _API.VFS.handlers when proto.trim().match (new RegExp k , "g"))
        return l

class BaseFileHandler
    constructor: (path) ->
        @dirty = false
        @cache = undefined
        @setPath path

    setPath: (p) ->
        @ready = false
        return unless p
        @path = p.toString()
        list = @path.split ":///"
        @protocol = list[0]
        return unless list.length > 1
        re = list[1].replace(/^\/+|\/+$/g, '')
        return if re is ""
        @genealogy = re.split("/")
        @basename = @genealogy[@genealogy.length - 1] unless @isRoot()
        @ext = @basename.split( "." ).pop() unless @basename.lastIndexOf(".") is 0 or @basename.indexOf( "." ) is -1

    isRoot: () -> (not @genealogy) or (@genealogy.size is 0)
    
    child: (name) ->
        if @isRoot()
            return @path + name
        else
            return @path + "/" + name

    isHidden: () ->
        return false if not @basename
        @basename[0] is "."

    hash: () ->
        return -1 unless @path
        return @path.hash()

    sendB64: (m, f) ->
        me = @
        return f "" unless @cache
        if typeof @cache is "string"
            b64 = @cache.asBase64()
            b64 = "data:#{m};base64,#{b64}"
            f(b64)
        else
            reader = new FileReader()
            reader.readAsDataURL(@cache)
            reader.onload =  () ->
                f reader.result
            reader.onerror = (e) ->
                return _courrier.osfail "Cannot ecode file: #{me.path}", (_API.throwe "OS.VFS"), e
    parent: () ->
        return @ if @isRoot()
        return (@protocol + ":///" + (@genealogy.slice 0 , @genealogy.length - 1).join "/")

    onready: (f, err) ->
        # read meta data
        return f() if @ready
        me = @
        me.meta (d) ->
            if d.error
                return if err then err d else _courrier.osfail "#{me.path}: #{d.error}", (_API.throwe "OS.VFS"), d.error
            me.info = d.result
            me.ready = true
            f()

    read: (f, t) ->
        me = @
        @onready (() -> me.action "read", t, f)

    write: (d, f) ->
        me = @
        @action "write", d, (r) ->
            _courrier.ostrigger "VFS", { m: "write", file: me } if r.result
            f r
    
    mk: (d, f) ->
        me = @
        @onready (() -> me.action "mk", d, (r) ->
            _courrier.ostrigger "VFS", { m: "mk", file: me } if r.result
            f r)
    
    remove: (f) ->
        me = @
        @onready (() -> me.action "remove", null, (r) ->
            _courrier.ostrigger "VFS", { m: "remove", file: me } if r.result
            f r)

    upload: (f) ->
        me = @
        @onready (() -> me.action "upload", null, (r) ->
            _courrier.ostrigger "VFS", { m: "upload", file: me } if r.result
            f r)
    publish: (f) ->
        me = @
        @onready (() -> me.action "publish", null, (r) ->
            _courrier.ostrigger "VFS", { m: "publish", file: me } if r.result
            f r)
    download: (f) ->
        me = @
        @onready (() -> me.action "download", null, f)

    move: (d, f) ->
        me = @
        @onready (() -> me.action "move", d, (r) ->
            _courrier.ostrigger "VFS", { m: "move", file: d.asFileHandler() } if r.result
            f r)

    execute: (f) ->
        me = @
        @onready (() -> me.action "execute", null, f)

    #mk: (f) ->

    meta: (f) ->

    # for main action read, write, remove, execute
    # must be implemented by subclasses
    action: (n, p, f) ->
        return _courrier.osfail "VFS unknown action: #{n}", (_API.throwe "OS.VFS"), n

# now export the class
self.OS.API.VFS.BaseFileHandler = BaseFileHandler

# Remote file handle
class RemoteFileHandler extends self.OS.API.VFS.BaseFileHandler
    constructor: (path) ->
        super path

    meta: (f) ->
        _API.handler.fileinfo @path, f
    
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return _API.handler.scandir @path, f if @info.type is "dir"
                #read the file
                return _API.handler.fileblob @path, f if p is "binary"
                _API.handler.readfile @path, f, if p then p else "text"
            when "mk"
                return f { error: "#{@path} is not a directory" } if @info.type is "file"
                _API.handler.mkdir "#{@path}/#{p}", f
            when "write"
                @sendB64 p, (data) ->
                    _API.handler.write me.path, data, f
            when "upload"
                return if @info.type is "file"
                _API.handler.upload @path, f
            when "remove"
                _API.handler.delete @path, f
            when "publish"
                _API.handler.sharefile @path, true , f
            when "download"
                return if @info.type is "dir"
                _API.handler.fileblob @path, (d) ->
                    blob = new Blob [d], { type: "octet/stream" }
                    _API.saveblob me.basename, blob
            when "move"
                _API.handler.move @path, p, f
            else
                return _courrier.osfail "VFS unknown action: #{n}", (_API.throwe "OS.VFS"), n

self.OS.API.VFS.register "^(home|desktop|os|Untitled)$", RemoteFileHandler

# Application Handler
class ApplicationHandler extends self.OS.API.VFS.BaseFileHandler
    constructor: (path) ->
        super path
        @info = _OS.setting.system.packages[@basename] if @basename
        @ready = true
    
    meta: (f) ->
        f()
    
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return f { result: @info } if @info
                return unless @isRoot()
                f { result: ( v for k, v of _OS.setting.system.packages ) }

            when "mk"
                return

            when "write"
                return

            when "upload"
                # install
                return

            when "remove"
                #uninstall
                return
            when "publish"
                return
            when "download"
                return

            when "move"
                return
            else
                return _courrier.osfail "VFS unknown action: #{n}", (_API.throwe "OS.VFS"), n

self.OS.API.VFS.register "^app$", ApplicationHandler

class BufferFileHandler extends self.OS.API.VFS.BaseFileHandler
    constructor: (path, mime, data) ->
        super path
        @cache = data if data
        @info =
            mime: mime
            path: path
            size: if data then data.length else 0
            name: @basename
            type: "file"
    meta: (f) ->
        f()
    
    onchange: (f) ->
        @onchange = f

    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return f { result: @cache }

            when "mk"
                return

            when "write"
                @cache = p
                @onchange @ if @onchange
                f { result: true }

            when "upload"
                # install
                return

            when "remove"
                #uninstall
                return
             when "publish"
                return
            when "download"
                blob = new Blob [@cache], { type: "octet/stream" }
                _API.saveblob me.basename, blob

            when "move"
                return
            else
                return _courrier.osfail "VFS unknown action: #{n}", (_API.throwe "OS.VFS"), n
    
self.OS.API.VFS.register "^mem$", BufferFileHandler

class SharedFileHandler extends self.OS.API.VFS.BaseFileHandler
    constructor: (path) ->
        super path
        @ready = true if @isRoot()
    meta: (f) ->
        _API.handler.fileinfo @path, f
    
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return _API.get "#{_API.handler.shared}/all", f, ((e, s)->) if @isRoot()
                #read the file
                return _API.handler.fileblob @path, f if p is "binary"
                _API.handler.readfile @path, f, if p then p else "text"
            when "mk"
                return

            when "write"
               _API.handler.write @path, p, f

            when "remove"
                _API.handler.sharefile @basename, false, f
                
            when "upload"
                return

            when "publish"
                return f { result: @basename }

            when "download"
                return if @info.type is "dir"
                _API.handler.fileblob @path, (d) ->
                    blob = new Blob [d], { type: "octet/stream" }
                    _API.saveblob me.basename, blob
            when "move"
                return
            else
                return _courrier.osfail "VFS unknown action: #{n}", (_API.throwe "OS.VFS"), n
    
self.OS.API.VFS.register "^shared$", SharedFileHandler