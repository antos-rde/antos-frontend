
self = this
_GUI = self.OS.GUI
_API = self.OS.API
self.OS.GUI =
    tagPath: "resources/tags/"
    init: () ->
        query = 
            path: 'VFS/get'
            data: "#{_GUI.tagPath}/tags.json"
        self.OS.API.request query, ()->
            
    loadScheme: (name, call) ->
        path = _GUI.tagPath + name + ".html"
        $.getScript path
        .done (script, status) ->
            call(script, status)
        .fail (jqxhr, settings, exception) ->
            _GUI.systemReport exception
    loadTheme: (name) ->
        path = "resources/themes/#{name}/#{name}.css"
        $ "<link/>", { rel: "stylesheet", type: "text/css", href: path}
        .appendTo "head"