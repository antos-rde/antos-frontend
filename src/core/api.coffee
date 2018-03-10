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
String.prototype.asUnit8Array = () ->
    bytes = []
    for i in [0..(@length - 1)]
        bytes.push @charCodeAt i
    bytes = new Uint8Array(bytes)
    return bytes

if not String.prototype.format
    String.prototype.format = () ->
        args = arguments
        return @replace /{(\d+)}/g, (match, number) ->
            return if typeof args[number] != 'undefined' then args[number] else match
# language directive
this.__ = () ->
    _API = window.OS.API
    args = arguments
    return "Undefined" unless args.length > 0
    d = args[0]
    _API.lang[d] = d unless _API.lang[d]
    return _API.lang[d] unless args.length > 1
    return String.prototype.format.apply _API.lang[d], (args[i] for i in [1 .. args.length - 1])

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
                path = "os:///scripts/"
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

    setLocale: (name) ->
        path = "resources/languages/#{name}.json"
        _API.get path, (d) ->
            _OS.setting.user.language = name
            _API.lang = d
        , (e, s) ->
            _OS.setting.user.language = "en_GB"
            _courrier.oserror __("Language file {0} not found", path), e, s
        , "json"

    throwe: (n) ->
        err = undefined
        try
            throw new Error(n)
        catch e
            err = e
        return "" if not err
        return err