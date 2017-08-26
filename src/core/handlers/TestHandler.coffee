self.OS.API.handler =
    request: ( p, d, c, f) ->
        path = switch p
            when 'scandir' then 'resources/jsons/scandir.json'
            else undefined
        return unless path
        _API.get path, c, f
                