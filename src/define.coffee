#define the OS object
self = this
self.OS or=
    API: new Object()
    GUI: new Object()
    APP: new Object()
    PM: new Object()
    register: (name,x)->
        # load the metadata first
        _APP[name] = x
        
    boot: ->
        #first load the configuration
        #then load the theme
        _GUI = self.OS.GUI
        _GUI.loadTheme "antos"
        _GUI.initDM()
        #_GUI.loadScheme "resources/schemes/test.html",null 