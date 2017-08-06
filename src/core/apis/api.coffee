#define the base API functions
self = this
_API = self.OS.API
self.OS.API = 
    # the handler object could be a any remote or local handle to
    # fetch user data, used by the API to make requests
    # handlers are defined in /src/handlers
    handler: new Object()

    #request a user data
    request: (query,callback) ->
        # definition here
        handle.request query,callback

    systemConfig: ->
        _API.request 'config', (result) ->
            console.log  result
    
    resource: (resource,callback) ->
        path = "resources/#{resource}"
        $.get path 
        .done (data) -> 
            callback(data) 
        .fail ->
            alert "cannot get data"
            callback(null)
