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
    
    setCache: (v) ->
        @cache = v
        @
        
    asFileHandle: () -> @

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

    b64: (t) ->
        # t is object or mime type
        new Promise (resolve, reject) =>
            m = if t is "object" then "text/plain" else t
            return resolve "" unless @cache
            if t is "object" or typeof @cache is "string"
                if t is "object"
                    b64 = JSON.stringify(@cache, undefined, 4).asBase64()
                else
                    b64 = @cache.asBase64()
                b64 = "data:#{m};base64,#{b64}"
                resolve(b64)
            else
                reader = new FileReader()
                reader.readAsDataURL(@cache)
                reader.onload =  () ->
                    resolve reader.result
                reader.onerror = (e) ->
                    reject e
    
    parent: () ->
        return @ if @isRoot()
        return (@protocol + "://" + (@genealogy.slice 0 , @genealogy.length - 1).join "/")
            .asFileHandle()

    onready: () ->
        # read meta data
        new Promise (resolve, reject) =>
            return resolve(@info) if @ready
            @meta()
                .then (d) =>
                    return reject Ant.OS.API.throwe d.error if d.errors
                    @info = d.result
                    @ready = true
                    resolve(d.result)
                .catch (e) -> reject e

    read: (t) ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_rd(t)
                        .then (d) ->
                            # Ant.OS.announcer.ostrigger "VFS", { m: "read", file: me }
                            resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e

    write: (t) ->
        new Promise (resolve, reject) =>
            @_wr(t)
                .then (r) =>
                    Ant.OS.announcer.ostrigger "VFS", { m: "write", file: @ }
                    resolve r
                .catch (e) -> reject e
    
    mk: (d) ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_mk(d)
                        .then (d) =>
                            Ant.OS.announcer.ostrigger "VFS", { m: "mk", file: @ }
                            resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e
    
    remove: () ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_rm()
                        .then (d) =>
                            Ant.OS.announcer.ostrigger "VFS", { m: "remove", file: @ }
                            resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e

    upload: () ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_up()
                        .then (d) =>
                            Ant.OS.announcer.ostrigger "VFS", { m: "upload", file: @ }
                            resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e
        
    publish: () ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_pub()
                        .then (d) =>
                            Ant.OS.announcer.ostrigger "VFS", { m: "publish", file: @ }
                            resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e

    download: () ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_down()
                        .then (d) =>
                            Ant.OS.announcer.ostrigger "VFS", { m: "download", file: @ }
                            resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e

    move: (d) ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_mv(d)
                        .then (data) =>
                            Ant.OS.announcer.ostrigger "VFS", { m: "move", file: d.asFileHandle() }
                            resolve data
                        .catch (e) -> reject e
                .catch (e) -> reject e

    execute: () ->
        new Promise (resolve, reject) =>
            @onready()
                .then (r) =>
                    @_exec()
                        .then (d) =>
                            Ant.OS.announcer.ostrigger "VFS", { m: "execute", file: @ }
                            resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e

    getlink: () -> @path

    unsupported: (t) ->
        new Promise (resolve, reject) =>
            reject Ant.OS.API.throwe __("Action {0} is unsupported on: {1}", t, @path)
    # actions must be implemented by subclasses

    _rd: (t) ->     @unsupported "read"
    _wr: (d, t) ->  @unsupported "write"
    _mk: (d) ->     @unsupported "mk"
    _rm: () ->      @unsupported "remove"
    _mv: (d) ->     @unsupported "move"
    _up: () ->      @unsupported "upload"
    _down: () ->    @unsupported "download"
    _exec: () ->    @unsupported "execute"
    _pub: () ->     @unsupported "publish"

# now export the class
Ant.OS.API.VFS.BaseFileHandle = BaseFileHandle

# Remote file handle
class RemoteFileHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path

    meta: () ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.fileinfo @path
                .then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e

    
    getlink: () ->
        Ant.OS.API.handle.get + "/" + @path

    _rd: (t) ->
        # t: binary, text, any type
        if not @info
            return new Promise (resolve, reject) =>
                reject Ant.OS.API.throwe __(
                    "file meta-data not found: {0}", @path)
        return Ant.OS.API.handle.scandir @path if @info.type is "dir"
        #read the file
        return Ant.OS.API.handle.fileblob @path if t is "binary"
        Ant.OS.API.handle.readfile @path, if t then t else "text"

    _wr: (t) ->
        # t is base64 or undefined
        new Promise (resolve, reject) =>
            if t is "base64"
                Ant.OS.API.handle.write(@path, @cache).then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e
            else
                @b64(t)
                    .then (r) =>
                        Ant.OS.API.handle.write @path, r
                            .then (result) ->
                                return reject Ant.OS.API.throwe result.error if result.error
                                resolve result
                            .catch (e) -> reject e
                    .catch (e) -> reject e

    _mk: (d) ->
        new Promise (resolve, reject) =>
            if not @info
                return reject Ant.OS.API.throwe __(
                    "file meta-data not found: {0}", @path)
            if @info.type is "file"
                return  reject Ant.OS.API.throwe __("{0} is not a directory", @path)
            Ant.OS.API.handle.mkdir "#{@path}/#{d}"
                .then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e

    _rm: () ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.delete @path
                .then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e


    _mv: (d) ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.move @path, d
            .then (d) ->
                return reject Ant.OS.API.throwe d.error if d.error
                resolve d
            .catch (e) -> reject e


    _up: () ->
        new Promise (resolve, reject) =>
            if @info.type isnt "dir"
                return reject Ant.OS.API.throwe __("{0} is not a file", @path)
            Ant.OS.API.handle.upload @path
                .then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e

    _down: () ->
        new Promise (resolve, reject) =>
            if @info.type is "dir"
                return Ant.OS.API.throwe __("{0} is not a file", @path)
            Ant.OS.API.handle.fileblob(@path)
                .then (d) =>
                    blob = new Blob [d], { type: "octet/stream" }
                    Ant.OS.API.saveblob @basename, blob
                    resolve()
                .catch (e) ->
                    reject e

    _pub: () ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.sharefile @path, true
                .then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e

Ant.OS.API.VFS.register "^(home|desktop|os|Untitled)$", RemoteFileHandle

# Application Handle
class ApplicationHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path
        @info = Ant.OS.setting.system.packages[@basename] if @basename
        @ready = true
    
    _rd: (t) ->
        new Promise (resolve, reject) =>
            return resolve { result: @info } if @info
            return reject Ant.OS.API.throwe(__("Application meta data isnt found")) unless @isRoot()
            resolve { result: ( v for k, v of Ant.OS.setting.system.packages ) }


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
    
    _rd: (t) ->
        new Promise (resolve, reject) =>
            resolve { result: @cache }

    _wr: (d, t) ->
        @cache = d
        @onchange @ if @onchange
        new Promise (resolve, reject) ->
            resolve { result: true }

    _down: () ->
        new Promise (resolve,  reject) =>
            blob = new Blob [@cache], { type: "octet/stream" }
            Ant.OS.API.saveblob @basename, blob
            resolve()

    onchange: (f) ->
        @onchange = f

Ant.OS.API.VFS.register "^mem$", BufferFileHandle

class URLFileHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path
        @ready = true
    
    _rd: (t) ->
        Ant.OS.API.get @path, if t then t else "text"

Ant.OS.API.VFS.register "^(http|https|ftp)$", URLFileHandle


class SharedFileHandle extends Ant.OS.API.VFS.BaseFileHandle
    constructor: (path) ->
        super path
        @ready = true if @isRoot()

    meta: () ->
        Ant.OS.API.handle.fileinfo @path
    
    _rd: (t) ->
        return Ant.OS.API.get "#{Ant.OS.API.handle.shared}/all", t if @isRoot()
        #read the file
        return Ant.OS.API.handle.fileblob @path if t is "binary"
        Ant.OS.API.handle.readfile @path, if t then t else "text"
    
    _wr: (d, t) ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.write @path, d
                .then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e

    _rm: () ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.sharefile @basename, false
                .then (d) ->
                    return reject Ant.OS.API.throwe d.error if d.error
                    resolve d
                .catch (e) -> reject e

    _down: () ->
        new Promise (resolve, reject) =>
            if @info.type is "dir"
                return reject Ant.OS.API.throwe __("{0} is not a file", @path)
            Ant.OS.API.handle.fileblob @path
                .then (data) =>
                    blob = new Blob [data], { type: "octet/stream" }
                    Ant.OS.API.saveblob @basename, blob
                    resolve()
                .catch (e) -> reject e
    _pub: () ->
        return new Promise (resolve, reject) => resolve { result: @basename }

Ant.OS.API.VFS.register "^shared$", SharedFileHandle