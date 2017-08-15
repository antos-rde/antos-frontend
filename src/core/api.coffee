self.OS.API = 
    # the handler object could be a any remote or local handle to
    # fetch user data, used by the API to make requests
    # handlers are defined in /src/handlers
    handler: new Object()

    #request a user data
    request: (query, callback) ->
        # definition here
        handle.request query, callback

    systemConfig: ->
        _API.request 'config', (result) ->
            console.log  result
    
    get: (p, c, f) ->
        $.get p
            .done (data) -> c(data)
            .fail -> f()
    resource: (resource, callback) ->
        path = "resources/#{resource}"
        _API.get path, callback
        
