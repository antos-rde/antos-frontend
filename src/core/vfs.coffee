String.prototype.hash = () ->
    hash = 5381
    i = this.length
    hash = (hash * 33) ^ this.charCodeAt(--i) while i
    hash >>> 0

String.prototype.asFileHandler = () ->
    list = this.split ":///"
    switch list[0]
        when "app"
            return new ApplicationHandler(this)
        else
            return new RemoteFileHandler(this)

this.OS.API.VFS = {}

class BasicFileHandler
    constructor: (@path) ->
        list = @path.split ":///"
        @protocol = list[0]
        return unless list.length > 1
        re = list[1].replace(/^\/+|\/+$/g, '')
        return if re is ""
        @genealogy = re.split("/")
        @basename = @genealogy[@genealogy.length - 1] unless @isRoot()
        @ext = @basename.split( "." ).pop() unless @basename.lastIndexOf(".") is 0 or @basename.indexOf( "." ) is -1
        @ready = false


    isRoot: () -> (not @genealogy) or (@genealogy.size is 0)
    
    isHidden: () ->
        return false if not @basename
        @basename[0] is "."

    hash: () -> @path.hash()

    parent: () ->
        return @ if @isRoot()
        (@protocol + ":///" + (@genealogy.slice 0 , @genealogy.length - 1).join "/").asFileHandler()

    onready: (f) ->
        # read meta data
        return f() if @ready
        me = @
        me.meta (d) ->
            return _courrier.osfail d.error, (_API.throwe "OS.VFS"), d.error  if d.error
            me.meta = d.result
            me.ready = true
            f()

    #public interface for all action on file
    do: (a, f) ->
        return _courrier.osfail "VFS unknown action: #{a}", (_API.throwe "OS.VFS"), a if not @[a]
        me = @
        @onready (() -> me[a] f)

    
    # methods implemented by subclasses used as private methods
    meta: (f) ->

    read: (f) ->

    write: (f) ->

    remove: (f) ->

    execute: (f) ->
    
    mk: (f) ->

# now export the class
self.OS.API.VFS.BasicFileHandler = BasicFileHandler

# Remote file handle
class RemoteFileHandler extends self.OS.API.VFS.BasicFileHandler
    constructor: (path) ->
        super path

    meta: (f) ->
        _API.handler.fileinfo @path, f
    
    read: (f) ->
        return _API.handler.scandir @path, f if @meta.type is "dir"
        #read the file
        _API.handler.readfile @path, f

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