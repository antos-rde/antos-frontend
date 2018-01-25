self.OS.API =
    # the handler object could be a any remote or local handle to
    # fetch user data, used by the API to make requests
    # handlers are defined in /src/handlers
    handler: { }
    #request a user data
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
            .fail (e, s) ->
                _API.loaded q, p, "FAIL"
                f(e, s)
                
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
    get: (p, c, f) ->
        q = _courrier.getMID()
        _API.loading q, p
        $.get p
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

    throwe: (n) ->
        err = undefined
        try
            throw new Error(n)
        catch e
            err = e
        return "" if not err
        return err.stack
        
