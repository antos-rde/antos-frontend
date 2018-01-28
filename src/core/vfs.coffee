String.prototype.hash = () ->
    hash = 5381
    i = this.length
    hash = (hash * 33) ^ this.charCodeAt(--i) while i
    hash >>> 0

String.prototype.asBase64 = () ->
    tmp = encodeURIComponent this
    return btoa ( tmp.replace /%([0-9A-F]{2})/g, (match, p1) ->
        return String.fromCharCode (parseInt p1, 16)
    )

String.prototype.asFileHandler = () ->
    list = this.split ":///"
    switch list[0]
        when "app"
            return new ApplicationHandler(this)
        else
            return new RemoteFileHandler(this)

this.OS.API.VFS = {}

class BasicFileHandler
    constructor: (path) ->
        @dirty = false
        @cache = undefined
        @setPath path

    setPath: (p) ->
        @ready = false
        return unless p
        @path = p
        list = @path.split ":///"
        @protocol = list[0]
        return unless list.length > 1
        re = list[1].replace(/^\/+|\/+$/g, '')
        return if re is ""
        @genealogy = re.split("/")
        @basename = @genealogy[@genealogy.length - 1] unless @isRoot()
        @ext = @basename.split( "." ).pop() unless @basename.lastIndexOf(".") is 0 or @basename.indexOf( "." ) is -1

    isRoot: () -> (not @genealogy) or (@genealogy.size is 0)
    
    isHidden: () ->
        return false if not @basename
        @basename[0] is "."

    hash: () ->
        return -1 unless @path
        return @path.hash()

    getb64: (m) ->
        return "" unless @cache
        b64 = @cache.asBase64()
        return "data:#{m};base64,#{b64}"
    parent: () ->
        return @ if @isRoot()
        return (@protocol + ":///" + (@genealogy.slice 0 , @genealogy.length - 1).join "/")

    onready: (f, err) ->
        # read meta data
        return f() if @ready
        me = @
        me.meta (d) ->
            if d.error
                return if err then err d else _courrier.osfail d.error, (_API.throwe "OS.VFS"), d.error
            me.meta = d.result
            me.ready = true
            f()

    read: (f) ->
        me = @
        @onready (() -> me.action "read", null, f)

    write: (d, f) ->
        @action "write", d, f
    
    mk: (d, f) ->
        me = @
        @onready (() -> me.action "mk", d, f)
    
    remove: (f) ->
        me = @
        @onready (() -> me.action "remove", null, f)

    upload: (f) ->
        me = @
        @onready (() -> me.action "upload", null, f)

    download: (f) ->
        me = @
        @onready (() -> me.action "download", null, f)

    move: (d, f) ->
        me = @
        @onready (() -> me.action "move", d, f)

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
self.OS.API.VFS.BasicFileHandler = BasicFileHandler

# Remote file handle
class RemoteFileHandler extends self.OS.API.VFS.BasicFileHandler
    constructor: (path) ->
        super path

    meta: (f) ->
        _API.handler.fileinfo @path, f
    
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return _API.handler.scandir @path, f if @meta.type is "dir"
                #read the file
                _API.handler.readfile @path, f
            when "mk"
                return f { error: "#{@path} is not a directory" } if @meta.type is "file"
                _API.handler.mkdir "#{@path}/#{p}", f
            when "write"
                _API.handler.write @path, p, f
            when "upload"
                return if @meta.type is "file"
                _API.handler.upload @path, f
            when "remove"
                _API.handler.delete @path, f
            when "download"
                return if @meta.type is "dir"
                _API.handler.fileblob @path, (d) ->
                    blob = new Blob [d], { type: "octet/stream" }
                    _API.saveblob me.basename, blob
            when "move"
                _API.handler.move @path, p, f
            else
                return _courrier.osfail "VFS unknown action: #{n}", (_API.throwe "OS.VFS"), n

self.OS.API.VFS.RemoteFileHandler = RemoteFileHandler

# Application Handler
class ApplicationHandler extends self.OS.API.VFS.BasicFileHandler
    constructor: (path) ->
        super path

self.OS.API.VFS.ApplicationHandler = ApplicationHandler


# GoogleDrive File Handler
class GoogleDriveHandler extends self.OS.API.VFS.BasicFileHandler
    constructor: (path) ->
        super path

self.OS.API.VFS.GoogleDriveHandler = GoogleDriveHandler