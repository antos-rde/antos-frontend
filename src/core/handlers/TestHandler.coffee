self.OS.API.handler =
    scandir: (p, c ) ->
        path = 'resources/jsons/scandir.json'
        _API.get path , c, (e, s) ->
            _courrier.osfail "System fall: Cannot read #{path}", e, s
               