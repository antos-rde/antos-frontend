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
class FormatedString
    constructor: (@fs, args) ->
        @values = []
        return unless args
        @values[i] = args[i] for i in [0..args.length - 1]
    toString: () ->
        @__()
    __: () ->
        return @fs.l().replace /{(\d+)}/g, (match, number) =>
            return if typeof @values[number] != 'undefined' then @values[number].__() else match
    hash: () ->
        @__().hash()

    match: (t) ->
        @__().match t

    asBase64: () ->
        @__().asBase64()
    
    unescape: () ->
        @__().unescape()
    
    asUint8Array: () ->
        @__().asUint8Array()
    
    format: () ->
        args = arguments
        @values[i] = args[i] for i in [0..args.length - 1]

class Version
    constructor:(@string) ->
        arr = @string.split "-"
        br =
            "r": 3,
            "b": 2,
            "a": 1
        @branch = 3
        @branch = br[arr[1]] if arr.length is 2 and br[arr[1]]
        mt = arr[0].match /\d+/g
        throw new Error __("Version string is in invalid format: {0}", @string) if not mt
        @major = 0
        @minor = 0
        @patch = 0
        @major = Number mt[0] if mt.length >= 1
        @minor = Number mt[1]  if mt.length >= 2
        @patch = Number mt[2] if mt.length >= 3
    
    # this function return 
    #   0 if the version is unchanged
    #   1 if the current version is newer
    #   -1 if the current version is older
    compare: (o) ->
        other = o.__v()
        return 1 if @branch > other.branch
        return -1 if @branch < other.branch
        return 0 if @major is other.major and @minor is other.minor and @patch is other.patch
        return 1 if @major > other.major
        return -1 if @major < other.major
        return 1 if @minor > other.minor
        return -1 if @minor < other.minor
        return 1 if @patch > other.patch
        return -1
    nt: (o) ->
        return (@compare o) is 1
    ot: (o) ->
        return (@compare o) is -1
    __v: () -> @
    toString: () -> @string

Object.defineProperty Object.prototype, '__',
    value: () ->
        return @toString()
    enumerable: false
    writable: true

String.prototype.hash = () ->
    hash = 5381
    i = this.length
    hash = (hash * 33) ^ this.charCodeAt(--i) while i
    hash >>> 0
String.prototype.__v = () ->
    return new Version @
String.prototype.asBase64 = () ->
    tmp = encodeURIComponent this
    return btoa ( tmp.replace /%([0-9A-F]{2})/g, (match, p1) ->
        return String.fromCharCode (parseInt p1, 16)
    )
String.prototype.unescape = () ->
    d = @
    d = d.replace /\\\\/g, "\\"
    d = d.replace /\\"/g, '"'
    d = d.replace /\\n/g, "\n"
    d = d.replace /\\t/g, "\t"
    d = d.replace /\\b/g, "\b"
    d = d.replace /\\f/g, "\f"
    d = d.replace /\\r/g, "\r"
    d
String.prototype.asUint8Array = () ->
    bytes = []
    for i in [0..(@length - 1)]
        bytes.push @charCodeAt i
    bytes = new Uint8Array(bytes)
    return bytes

if not String.prototype.format
    String.prototype.format = () ->
        args = arguments
        return @replace /{(\d+)}/g, (match, number) ->
            return if typeof args[number] != 'undefined' then args[number].__() else match

String.prototype.f = () ->
    args = arguments
    return new FormatedString(@, args)

String.prototype.__ = () ->
    match = @match(/^__\((.*)\)$/)
    return match[1].l() if match
    return @
String.prototype.l = () ->
    Ant.OS.API.lang[@] = @ unless Ant.OS.API.lang[@]
    return Ant.OS.API.lang[@]
# language directive

this.__ = () ->
    args = arguments
    return "Undefined" unless args.length > 0
    d = args[0]
    d.l()
    return new FormatedString d, (args[i] for i in [1 .. args.length - 1])

Date.prototype.toString = () ->
    dd = @getDate()
    mm = @getMonth() + 1
    yyyy = @getFullYear()
    hh = @getHours()
    mi = @getMinutes()
    se = @getSeconds()

    dd = "0#{dd}" if dd < 10
    mm = "0#{mm}" if mm < 10
    hh = "0#{hh}" if hh < 10
    mi = "0#{mi}" if mi < 10
    se = "0#{se}" if se < 10
    return "#{dd}/#{mm}/#{yyyy} #{hh}:#{mi}:#{se}"

Date.prototype.timestamp = () ->
    return @getTime() / 1000 | 0

Ant.OS.API =
    # the handle object could be a any remote or local handle to
    # fetch user data, used by the API to make requests
    # handles are defined in /src/handles
    handle: {}
    shared: {} # shared libraries
    searchHandle: {}
    lang: {}
    #request a user data
    mid: () ->
        return Ant.OS.announcer.getMID()
    post: (p, d) ->
        new Promise (resolve, reject) ->
            q = Ant.OS.announcer.getMID()
            Ant.OS.API.loading q, p
            $.ajax {
                type: 'POST',
                url: p,
                contentType: 'application/json',
                data: JSON.stringify(d,
                (k, v) ->
                    return undefined if k is "domel"
                    return v
                , 4),
                dataType: 'json',
                success: null
            }
            .done (data) ->
                Ant.OS.API.loaded q, p, "OK"
                resolve(data)
            .fail (j, s, e) ->
                Ant.OS.API.loaded q, p, "FAIL"
                if e
                    reject e
                else
                    reject(Ant.OS.API.throwe s)
    
    blob: (p) ->
        new Promise (resolve, reject) ->
            q = Ant.OS.announcer.getMID()
            r = new XMLHttpRequest()
            r.open "GET", p, true
            r.responseType = "arraybuffer"
            r.onload = (e) ->
                if @status is 200 and @readyState is 4
                    Ant.OS.API.loaded q, p, "OK"
                    resolve @response
                else
                    Ant.OS.API.loaded q, p, "FAIL"
                    reject Ant.OS.API.throwe __("Unable to get blob: {0}", p)
            Ant.OS.API.loading q, p
            r.send()
        
    upload: (p, d) ->
        new Promise (resolve, reject) ->
            q = Ant.OS.announcer.getMID()
            #insert a temporal file selector
            o = ($ '<input>').attr('type', 'file').css("display", "none")
            o.change () ->
                Ant.OS.API.loading q, p
                formd = new FormData()
                formd.append 'path', d
                # TODO: only one file is selected at this time
                formd.append 'upload', o[0].files[0]

                $.ajax {
                    url: p,
                    data: formd,
                    type: 'POST',
                    contentType: false,
                    processData: false,
                }
                .done (data) ->
                    Ant.OS.API.loaded q, p, "OK"
                    resolve(data)
                    o.remove()
                .fail (j, s, e) ->
                    Ant.OS.API.loaded q, p, "FAIL"
                    if e
                        reject e
                    else
                        reject(Ant.OS.API.throwe s)
                    o.remove()
            o.click()

    saveblob: (name, b) ->
        url = window.URL.createObjectURL b
        o = ($ '<a>')
            .attr("href", url)
            .attr("download", name)
            .css("display", "none")
            .appendTo("body")
        o[0].click()
        window.URL.revokeObjectURL(url)
        o.remove()

    loading: (q, p) ->
        Ant.OS.announcer.trigger "loading", { id: q, data: { m: "#{p}", s: true }, name: "OS" }

    loaded: (q, p, m ) ->
        Ant.OS.announcer.trigger "loaded", {
            id: q, data: { m: "#{m}: #{p}", s: false }, name: "OS" }
    
    get: (p, t) ->
        new Promise (resolve, reject) ->
            conf =
                type: 'GET',
                url: p
            conf.dataType = t if t
            q = Ant.OS.announcer.getMID()
            Ant.OS.API.loading q, p
            $.ajax conf
                .done (data) ->
                    Ant.OS.API.loaded q, p, "OK"
                    resolve(data)
                .fail (j, s, e) ->
                    Ant.OS.API.loaded q, p, "FAIL"
                    if e
                        reject e
                    else
                        reject(Ant.OS.API.throwe s)
                
    script: (p) ->
            Ant.OS.API.get p, "script"

    resource: (r) ->
        path = "resources/#{r}"
        Ant.OS.API.get path
    
    libready: (l) ->
        return Ant.OS.API.shared[l] || false

    requires: (l) ->
        new Promise (resolve, reject) ->
            if not Ant.OS.API.shared[l]
                libfp = l.asFileHandle()
                switch libfp.ext
                    when "css"
                        libfp.onready()
                            .then () ->
                                $('<link>', {
                                    rel: 'stylesheet',
                                    type: 'text/css',
                                    'href': "#{libfp.getlink()}"
                                })
                                .appendTo 'head'
                                Ant.OS.API.shared[l] = true
                                console.log "Loaded :", l
                                Ant.OS.announcer.trigger "sharedlibraryloaded", l
                                resolve undefined
                            .catch (e) -> reject e
                    when "js"
                        Ant.OS.API.script libfp.getlink()
                        .then (data) ->
                            Ant.OS.API.shared[l] = true
                            console.log "Loaded :", l
                            Ant.OS.announcer.trigger "sharedlibraryloaded", l
                            resolve(data)
                        .catch (e) ->
                            reject e
                    else
                        reject Ant.OS.API.throwe __("Invalid library: {0}", l)
            else
                console.log l, "Library exist, no need to load"
                Ant.OS.announcer.trigger "sharedlibraryloaded", l
                resolve()

    require: (libs) ->
        new Promise (resolve, reject) ->
            return resolve() unless libs.length > 0
            Ant.OS.announcer.observable.one "sharedlibraryloaded", (l) ->
                libs.splice 0, 1
                Ant.OS.API.require libs
                    .catch (e) -> reject e
                    .then (r) -> resolve(r)
            Ant.OS.API.requires libs[0]
                .catch (e) -> reject e

    packages:
        fetch: () ->
            Ant.OS.API.handle.packages {
                command: "list", args: { paths: (v for k, v of Ant.OS.setting.system.pkgpaths) }
            }

        cache: () ->
            Ant.OS.API.handle.packages {
                command: "cache", args: { paths: (v for k, v of Ant.OS.setting.system.pkgpaths) }
            }

    setting: (f) ->
        Ant.OS.API.handle.setting f

    apigateway: (d, ws, c) ->
        return Ant.OS.API.handle.apigateway d, ws, c

    search: (text) ->
        r = []
        
        for k, v of Ant.OS.API.searchHandle
            ret =  Ant.OS.API.searchHandle[k](text)
            if ret.length > 0
                ret.unshift { text: k, class: "search-header", dataid: "header" }
                r = r.concat ret
        return r

    onsearch: (name, fn) ->
        Ant.OS.API.searchHandle[name] = fn unless Ant.OS.API.searchHandle[name]

    setLocale: (name) ->
        new Promise (resolve, reject) ->
            path = "resources/languages/#{name}.json"
            Ant.OS.API.get(path, "json")
                .then (d) ->
                    Ant.OS.setting.system.locale = name
                    Ant.OS.API.lang = d
                    Ant.OS.announcer.trigger "systemlocalechange", name
                    resolve d
                .catch (e) ->
                    reject e

    throwe: (n) ->
        err = undefined
        try
            throw new Error(n)
        catch e
            err = e
        return "" if not err
        return err
# utilities functioncs
    switcher: () ->
        o = {}
        p = {}
        p[arguments[i]] = false for i in [0..arguments.length - 1 ]
        Object.defineProperty o, "__p", {
            enumerable: false,
            value: p
        }
        fn = (o, v) ->
            Object.defineProperty o, v, {
                enumerable: true,
                set: (value) ->
                    for k, l of @__p
                        @__p[k] = false
                    o.__p[v] = value
                , get: () ->
                    return o.__p[v]
            }
        for k, v of o.__p
            fn o, k
        Object.defineProperty o, "selected", {
            configurable: true,
            enumerable: false,
            get: () ->
                for k, v of o.__p
                    return k if v
        }
        return o