self.OS.API.VFS =
    readdir: (p, c, er) ->
        h = _API.VFS.pathHandler p
        h p,
            (d ) -> c d
            , (e, s) -> er e, s

    pathHandler: (p) ->
        list = p.split "///"
        switch list[0]
            when "app:"
                return _API.handler.scanapp
            else
                return _API.handler.scandir
    
