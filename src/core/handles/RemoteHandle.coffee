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
Ant.OS.API.HOST = Ant.location.hostname + (if Ant.location.port then":#{Ant.location.port}" else "")
Ant.OS.API.REST = "#{Ant.location.protocol}//#{Ant.OS.API.HOST}"

Ant.OS.API.handle =
    # get file, require authentification
    get: "#{Ant.OS.API.REST}/VFS/get"
    # get shared file with publish
    shared: "#{Ant.OS.API.REST}/VFS/shared"
    scandir: (p) ->
        path = "#{Ant.OS.API.REST}/VFS/scandir"
        Ant.OS.API.post path, { path: p }

    mkdir: (p) ->
        path = "#{Ant.OS.API.REST}/VFS/mkdir"
        Ant.OS.API.post path, { path: p }

    sharefile: (p, pub) ->
        path = "#{Ant.OS.API.REST}/VFS/publish"
        Ant.OS.API.post path, { path: p , publish: pub }

    fileinfo: (p) ->
        path = "#{Ant.OS.API.REST}/VFS/fileinfo"
        Ant.OS.API.post path, { path: p }

    readfile: (p, t) ->
        path = "#{Ant.OS.API.REST}/VFS/get/"
        Ant.OS.API.get path + p, t

    move: (s, d) ->
        path = "#{Ant.OS.API.REST}/VFS/move"
        Ant.OS.API.post path, { src: s, dest: d }

    delete: (p) ->
        path = "#{Ant.OS.API.REST}/VFS/delete"
        Ant.OS.API.post path, { path: p }

    fileblob: (p) ->
        path = "#{Ant.OS.API.REST}/VFS/get/"
        Ant.OS.API.blob path + p

    packages: (d) ->
        path = "#{Ant.OS.API.REST}/system/packages"
        Ant.OS.API.post path, d

    upload: (d) ->
        path = "#{Ant.OS.API.REST}/VFS/upload"
        Ant.OS.API.upload path, d

    write: (p, d) ->
        path = "#{Ant.OS.API.REST}/VFS/write"
        Ant.OS.API.post path, { path: p, data: d }

    scanapp: (p, c ) ->
        path = "#{Ant.OS.API.REST}/system/application"
    
    apigateway: (d, ws) ->
        if ws
            new Promise (resolve, reject) ->
                try
                    path = "#{Ant.OS.API.HOST}/system/apigateway?ws=1"
                    proto = if window.location.protocol is "https:" then "wss://" else "ws://"
                    socket = new WebSocket proto + path
                    resolve(socket)
                catch e
                    reject __e e
        else
            path = "#{Ant.OS.API.REST}/system/apigateway?ws=0"
            Ant.OS.API.post path, d
    
    auth: () ->
        p = "#{Ant.OS.API.REST}/user/auth"
        Ant.OS.API.post p, {}

    login: (d) ->
        p = "#{Ant.OS.API.REST}/user/login"
        Ant.OS.API.post p, d

    logout: () ->
        p = "#{Ant.OS.API.REST}/user/logout"
        Ant.OS.API.post p, {}

    setting: () ->
        p = "#{Ant.OS.API.REST}/system/settings"
        Ant.OS.API.post p, Ant.OS.setting
    
    dbquery: (cmd, d) ->
        path = "#{Ant.OS.API.REST}/VDB/#{cmd}"
        Ant.OS.API.post path, d