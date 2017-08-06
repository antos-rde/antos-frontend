self = this
_API = self.OS.API

self.OS.API.handler =
    request: ( query ) ->
        $.ajax {}