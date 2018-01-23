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
        
