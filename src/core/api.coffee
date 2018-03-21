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
        me = @
        return @fs.l().replace /{(\d+)}/g, (match, number) ->
            return if typeof me.values[number] != 'undefined' then me.values[number].__() else match
    hash: () ->
        @__().hash()

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
    _API = window.OS.API
    _API.lang[@] = @ unless _API.lang[@]
    return _API.lang[@]
# language directive

this.__ = () ->
    _API = window.OS.API
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

self.OS.API =
    # the handler object could be a any remote or local handle to
    # fetch user data, used by the API to make requests
    # handlers are defined in /src/handlers
    handler: {}
    shared: {} # shared libraries
    searchHandler:{}
    lang:{}
    #request a user data
    mid: () ->
        return _courrier.getMID()
    post: (p, d, c, f) ->
        q = _courrier.getMID()
        _API.loading q, p
        
        $.ajax {
            type: 'POST',
            url: p,
            contentType: 'application/json',
            data: JSON.stringify d,
            dataType: 'json',
            success: null
        }
        #$.getJSON p, d
        .done (data) ->
            _API.loaded q, p, "OK"
            c(data)
        .fail (e, s) ->
            _API.loaded q, p, "FAIL"
            f(e, s)
    
    blob: (p, c, f) ->
        q = _courrier.getMID()
        r = new XMLHttpRequest()
        r.open "GET", p, true
        r.responseType = "arraybuffer"

        r.onload = (e) ->
           if @status is 200 and @readyState is 4
                c @response
                _API.loaded q, p, "OK"
            else
                f e, @
                _API.loaded q, p, "FAIL"
        
        _API.loading q, p
        r.send()

    upload: (p, d, c, f) ->
        q = _courrier.getMID()
        #insert a temporal file selector
        o = ($ '<input>').attr('type', 'file').css("display", "none")
        o.change () ->
            _API.loading q, p
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
                _API.loaded q, p, "OK"
                c(data)
                o.remove()
            .fail (e, s) ->
                _API.loaded q, p, "FAIL"
                f(e, s)
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

    systemConfig: ->
        _API.request 'config', (result) ->
            console.log  result
    loading: (q, p) ->
        _courrier.trigger "loading", { id: q, data: { m: "#{p}", s: true }, name: "OS" }
    loaded: (q, p, m ) ->
        _courrier.trigger "loaded", { id: q, data: { m: "#{m}: #{p}", s: false }, name: "OS" }
    get: (p, c, f, t) ->
        conf =
            type: 'GET',
            url: p,
        conf.dataType = t if t

        q = _courrier.getMID()
        _API.loading q, p
        $.ajax conf
            .done (data) ->
                _API.loaded q, p, "OK"
                c(data)
            .fail (e, s) ->
                _API.loaded q, p, "FAIL"
                f(e, s)
    script: (p, c, f) ->
        q = _courrier.getMID()
        _API.loading q, p
        $.getScript p
            .done (data) ->
                _API.loaded q, p, "OK"
                c(data)
            .fail (e, s) ->
                _API.loaded q, p, "FAIL"
                f(e, s)
    resource: (r, c, f) ->
        path = "resources/#{r}"
        _API.get path, c, f
    
    libready: (l) ->
        return _API.shared[l] || false

    require: (l,f) ->
        if not _API.shared[l]
            if l.match /^(https?:\/\/[^\s]+)/g
                _API.script l, () ->
                    _API.shared[l] = true
                    _courrier.trigger "sharedlibraryloaded", l
                    f() if f
                , (e, s) ->
                    _courrier.oserror __("Cannot load 3rd library at: {0}", l), e, r
            else
                path = "os://scripts/"
                js = "#{path}#{l}.js"
                js.asFileHandler().onready (d) ->
                    _API.shared[l] = true
                    el = $ '<script>', { src: "#{_API.handler.get}/#{js}" }
                            .appendTo 'head'
                    #load css file
                    css =  "#{path}#{l}.css"
                    css.asFileHandler().onready (d) ->
                        el = $ '<link>', { rel: 'stylesheet', type: 'text/css', 'href': "#{_API.handler.get}/#{css}" }
                            .appendTo 'head'
                    , () ->
                    console.log "loaded", l
                    _courrier.trigger "sharedlibraryloaded", l
                    f() if f
        else
            console.log l, "Library exist, no need to load"
            f() if f
            _courrier.trigger "sharedlibraryloaded", l

    requires:(libs, f) ->
        return f() unless libs.length > 0
        _courrier.observable.one "sharedlibraryloaded", (l) ->
            libs.splice 0, 1
            _API.requires libs, f
        _API.require libs[0], null
    packages:
        fetch: (f) ->
            _API.handler.packages {
                command: "list", args: { paths: (v for k, v of _OS.setting.system.pkgpaths) }
            }, f
        cache: (f) ->
            _API.handler.packages {
                command: "cache", args: { paths: (v for k, v of _OS.setting.system.pkgpaths) }
            }, f
    setting: (f) ->
        _API.handler.setting f
    search: (text) ->
        r = []
        
        for k, v of _API.searchHandler
            ret =  _API.searchHandler[k](text)
            if ret.length > 0
                ret.unshift { text: k, class: "search-header", dataid: "header" }
                r = r.concat ret
        return r

    onsearch: (name, fn) ->
        self.OS.API.searchHandler[name] = fn unless self.OS.API.searchHandler[name]

    setLocale: (name, f) ->
        path = "resources/languages/#{name}.json"
        _API.get path, (d) ->
            _OS.setting.system.locale = name
            _API.lang = d
            if f then f() else _courrier.trigger "systemlocalechange", name
        , (e, s) ->
            #_OS.setting.system.locale = "en_GB"
            _courrier.oserror __("Language file {0} not found", path), e, s
            f() if f
        , "json"

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
                    for k,l of @__p
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
                for k,v of o.__p
                    return k if v
        }
        return o