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
String.prototype.asFileHandle = () ->
    list = @split "://"
    handles = Ant.OS.API.VFS.findHandles list[0]
    if not handles or handles.length is 0
        Ant.OS.announcer.osfail __("VFS unknown handle: {0}", @), (Ant.OS.API.throwe "OS.VFS"), @
        return null
    return new handles[0](@)

this.OS.API.VFS =
    handles: { }
    register: ( protos, cls ) ->
        return Ant.OS.API.VFS.handles[protos] = cls # if typeof protos is "string"
        #Ant.OS.API.VFS.handles[v] = cls for v in protos
    findHandles: (proto) ->
        l = (v for k, v of Ant.OS.API.VFS.handles when proto.trim().match (new RegExp k , "g"))
        return l

class BaseFileHandle
    constructor: (path) ->
        @dirty = false
        @cache = undefined
        @setPath path

    setPath: (p) ->
        @ready = false
        return unless p
        @path = p.toString()
        list = @path.split "://"
        @protocol = list[0]
        return unless list.length > 1
        re = list[1].replace(/^\/+|\/+$/g, '')
        return if re is ""
        @genealogy = re.split("/")
        @basename = @genealogy[@genealogy.length - 1] unless @isRoot()
        @ext = @basename.split( "." ).pop() unless @basename.lastIndexOf(".") is 0 or @basename.indexOf( "." ) is -1
    asFileHandle: () ->
        @
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

    sendB64: (p, f) ->
        me = @
        m = if p is "object" then "text/plain" else p
        return f "" unless @cache
        if p is "object" or typeof @cache is "string"
            b64 = if p is "object" then (JSON.stringify @cache).asBase64() else @cache.asBase64()
            b64 = "data:#{m};base64,#{b64}"
            f(b64)
        else
            reader = new FileReader()
            reader.readAsDataURL(@cache)
            reader.onload =  () ->
                f reader.result
            reader.onerror = (e) ->
                return Ant.OS.announcer.osfail __("VFS Cannot encode file: {0}", me.path), (Ant.OS.API.throwe "OS.VFS"), e
    parent: () ->
        return @ if @isRoot()
        return (@protocol + "://" + (@genealogy.slice 0 , @genealogy.length - 1).join "/")

    onready: (f, err) ->
        # read meta data
        return f() if @ready
        me = @
        me.meta (d) ->
            if d.error
                return if err then err d else Ant.OS.announcer.osfail "#{me.path}: #{d.error}", (Ant.OS.API.throwe "OS.VFS"), d.error
            me.info = d.result
            me.ready = true
            f()

    read: (f, t) ->
        me = @
        @onready (() -> me.action "read", t, f)

    write: (d, f) ->
        me = @
        @action "write", d, (r) ->
            Ant.OS.announcer.ostrigger "VFS", { m: "write", file: me } if r.result
            f r
    
    mk: (d, f) ->
        me = @
        @onready (() -> me.action "mk", d, (r) ->
            Ant.OS.announcer.ostrigger "VFS", { m: "mk", file: me } if r.result
            f r)
    
    remove: (f) ->
        me = @
        @onready (() -> me.action "remove", null, (r) ->
            Ant.OS.announcer.ostrigger "VFS", { m: "remove", file: me } if r.result
            f r)

    upload: (f) ->
        me = @
        @onready (() -> me.action "upload", null, (r) ->
            Ant.OS.announcer.ostrigger "VFS", { m: "upload", file: me } if r.result
            f r)
    publish: (f) ->
        me = @
        @onready (() -> me.action "publish", null, (r) ->
            Ant.OS.announcer.ostrigger "VFS", { m: "publish", file: me } if r.result
            f r)
    download: (f) ->
        me = @
        @onready (() -> me.action "download", null, f)

    move: (d, f) ->
        me = @
        @onready (() -> me.action "move", d, (r) ->
            Ant.OS.announcer.ostrigger "VFS", { m: "move", file: d.asFileHandle() } if r.result
            f r)

    execute: (f) ->
        me = @
        @onready (() -> me.action "execute", null, f)

    #mk: (f) ->

    meta: (f) ->

    getlink: () -> @path
    # for main action read, write, remove, execute
    # must be implemented by subclasses
    action: (n, p, f) ->
        return Ant.OS.announcer.osfail __("VFS unknown action: {0}", n), (Ant.OS.API.throwe "OS.VFS"), n

# now export the class
Ant.OS.API.VFS.BaseFileHandle = BaseFileHandle

# Remote file handle
class RemoteFileHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path

    meta: (f) ->
        Ant.OS.API.handle.fileinfo @path, f
    
    getlink: () ->
        Ant.OS.API.handle.get + "/" + @path

    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return Ant.OS.API.handle.scandir @path, f if @info.type is "dir"
                #read the file
                return Ant.OS.API.handle.fileblob @path, f if p is "binary"
                Ant.OS.API.handle.readfile @path, f, if p then p else "text"
            when "mk"
                return f { error: __("{0} is not a directory", @path) } if @info.type is "file"
                Ant.OS.API.handle.mkdir "#{@path}/#{p}", f
            when "write"
                return Ant.OS.API.handle.write me.path, me.cache, f if p is "base64"
                @sendB64 p, (data) ->
                    Ant.OS.API.handle.write me.path, data, f
            when "upload"
                return if @info.type is "file"
                Ant.OS.API.handle.upload @path, f
            when "remove"
                Ant.OS.API.handle.delete @path, f
            when "publish"
                Ant.OS.API.handle.sharefile @path, true , f
            when "download"
                return if @info.type is "dir"
                Ant.OS.API.handle.fileblob @path, (d) ->
                    blob = new Blob [d], { type: "octet/stream" }
                    Ant.OS.API.saveblob me.basename, blob
            when "move"
                Ant.OS.API.handle.move @path, p, f
            else
                return Ant.OS.announcer.osfail __("VFS unknown action: {0}", n), (Ant.OS.API.throwe "OS.VFS"), n

Ant.OS.API.VFS.register "^(home|desktop|os|Untitled)$", RemoteFileHandle

# Application Handle
class ApplicationHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path
        @info = Ant.OS.setting.system.packages[@basename] if @basename
        @ready = true
    
    meta: (f) ->
        f()
    
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return f { result: @info } if @info
                return unless @isRoot()
                f { result: ( v for k, v of Ant.OS.setting.system.packages ) }

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
                return Ant.OS.announcer.osfail __("VFS unknown action: {0}", n), (Ant.OS.API.throwe "OS.VFS"), n

Ant.OS.API.VFS.register "^app$", ApplicationHandle

class BufferFileHandle extends Ant.OS.API.VFS.BaseFileHandle
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
                Ant.OS.API.saveblob me.basename, blob

            when "move"
                return
            else
                return Ant.OS.announcer.osfail __("VFS unknown action: {0}", n), (Ant.OS.API.throwe "OS.VFS"), n
    
Ant.OS.API.VFS.register "^mem$", BufferFileHandle

class URLFileHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path
        @ready = true
    meta: (f) ->
        f { result: true }
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                Ant.OS.API.get @path, (d) ->
                    f(d)
                , (e, s) ->
                    Ant.OS.announcer.oserror __("VFS cannot read : {0}", me.path), e, s
                , if p then p else "text"
            else
                return Ant.OS.announcer.oserror __("VFS unknown action: {0}", n), (Ant.OS.API.throwe "OS.VFS"), n
Ant.OS.API.VFS.register "^(http|https)$", URLFileHandle

class SharedFileHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path
        @ready = true if @isRoot()
    meta: (f) ->
        Ant.OS.API.handle.fileinfo @path, f
    
    action: (n, p, f) ->
        me = @
        switch n
            when "read"
                return Ant.OS.API.get "#{Ant.OS.API.handle.shared}/all", f, ((e, s)->) if @isRoot()
                #read the file
                return Ant.OS.API.handle.fileblob @path, f if p is "binary"
                Ant.OS.API.handle.readfile @path, f, if p then p else "text"
            when "mk"
                return

            when "write"
               Ant.OS.API.handle.write @path, p, f

            when "remove"
                Ant.OS.API.handle.sharefile @basename, false, f
                
            when "upload"
                return

            when "publish"
                return f { result: @basename }

            when "download"
                return if @info.type is "dir"
                Ant.OS.API.handle.fileblob @path, (d) ->
                    blob = new Blob [d], { type: "octet/stream" }
                    Ant.OS.API.saveblob me.basename, blob
            when "move"
                return
            else
                return Ant.OS.announcer.osfail __("VFS unknown action: {0}", n), (Ant.OS.API.throwe "OS.VFS"), n
    
Ant.OS.API.VFS.register "^shared$", SharedFileHandle