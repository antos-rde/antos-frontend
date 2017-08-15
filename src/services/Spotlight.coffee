class Spotlight extends this.OS.GUI.BaseService
    constructor: () ->
        super "Spotlight"
        @iconclass = "fa fa-search"

    init: ->
        # do nothing
    awake: ->
        console.log @name,@pid
    cleanup: ->
        # do nothing

this.OS.register "Spotlight",Spotlight