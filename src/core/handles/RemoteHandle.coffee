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
Ant.OS.API.HOST = Ant.location.hostname+ (if Ant.location.port then":#{Ant.location.port}" else "")
Ant.OS.API.REST = "#{Ant.location.protocol}//#{Ant.OS.API.HOST}"

Ant.OS.API.handle =
    # get file, require authentification
    get: "#{Ant.OS.API.REST}/VFS/get"
    # get shared file with publish
    shared: "#{Ant.OS.API.REST}/VFS/shared"
    scandir: (p, c ) ->
        path = "#{Ant.OS.API.REST}/VFS/scandir"
        Ant.OS.API.post path, { path: p }, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to scan directory: {0}", p), e, s
    mkdir: (p, c ) ->
        path = "#{Ant.OS.API.REST}/VFS/mkdir"
        Ant.OS.API.post path, { path: p }, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to create directory: {0}", p), e, s
    sharefile: (p, pub , c) ->
        path = "#{Ant.OS.API.REST}/VFS/publish"
        Ant.OS.API.post path, { path: p , publish: pub }, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to publish file: {0}", p), e, s

    fileinfo: (p, c) ->
        path = "#{Ant.OS.API.REST}/VFS/fileinfo"
        Ant.OS.API.post path, { path: p }, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to get file meta data: {0}", p), e, s

    readfile: (p, c, t) ->
        path = "#{Ant.OS.API.REST}/VFS/get/"
        Ant.OS.API.get path + p, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to read file: {0}", p), e, s
        , t

    move: (s, d, c) ->
        path = "#{Ant.OS.API.REST}/VFS/move"
        Ant.OS.API.post path, { src: s, dest: d }, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to move file: {0} -> {1}", s, d), e, s

    delete: (p , c) ->
        path = "#{Ant.OS.API.REST}/VFS/delete"
        Ant.OS.API.post path, { path: p }, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to delete: {0}", p), e, s

    fileblob: (p, c) ->
        path = "#{Ant.OS.API.REST}/VFS/get/"
        Ant.OS.API.blob path + p, c, (e, s)  ->
            Ant.OS.announcer.osfail "Fail to read file: #{p}", e, s

    packages: (d, c) ->
        path = "#{Ant.OS.API.REST}/system/packages"
        Ant.OS.API.post path, d, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to {0} package", d.command), e, s

    upload: (d, c) ->
        path = "#{Ant.OS.API.REST}/VFS/upload"
        Ant.OS.API.upload path, d, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to upload file to: {0}", d), e, s

    write: (p, d , c) ->
        path = "#{Ant.OS.API.REST}/VFS/write"
        Ant.OS.API.post path, { path: p, data: d }, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to write to file: {0}", p), e, s

    scanapp: (p, c ) ->
        path = "#{Ant.OS.API.REST}/system/application"
    
    apigateway: (d, ws, c) ->
        if ws
            path = "#{Ant.OS.API.HOST}/system/apigateway?ws=1"
            proto = if window.location.protocol is "https:" then "wss://" else "ws://"
            socket = new WebSocket proto + path
            if c then c(socket)
            return socket
        else
            path = "#{Ant.OS.API.REST}/system/apigateway?ws=0"
            Ant.OS.API.post path, d, c, (e, s) ->
                Ant.OS.announcer.osfail __("Fail to invoke gateway api"), e, s
    
    auth: (c) ->
        p = "#{Ant.OS.API.REST}/user/auth"
        Ant.OS.API.post p, {}, c, (e, s) ->
            console.log e, s
            alert __("Resource not found: {0}", p)
    login: (d, c) ->
        p = "#{Ant.OS.API.REST}/user/login"
        Ant.OS.API.post p, d, c, () ->
            alert __("Resource not found: {0}", p)
    logout: () ->
        p = "#{Ant.OS.API.REST}/user/logout"
        Ant.OS.API.post p, {}, (d) ->
            Ant.OS.boot()
        , () ->
            alert __("Resource not found: {0}", p)
    setting: (f) ->
        p = "#{Ant.OS.API.REST}/system/settings"
        Ant.OS.API.post p, Ant.OS.setting, (d) ->
            Ant.OS.announcer.oserror __("Cannot save system setting"), d.error if d.error
            f(d) if f
        , (e, s) ->
            m = __("Fail to make request: {0}", p)
            Ant.OS.announcer.osfail m , e, s
            f({ error: m }) if f
    
    dbquery: (cmd, d, c) ->
        path = "#{Ant.OS.API.REST}/VDB/#{cmd}"
        Ant.OS.API.post path, d, c, (e, s) ->
            Ant.OS.announcer.osfail __("Fail to query data from database: {0}", path), e, s