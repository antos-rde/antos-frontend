#define the OS object
self = this
self.OS or=
    API: new Object()
    GUI: new Object()
    boot: ->
        #first load the configuration
        #then load the theme
        