class Spotlight extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "Spotlight", args
        @iconclass = "fa fa-search"
    init: ->
        @child = [
            {
                text: "#{@.name} (#{@.pid}): dummy notif",
                child: [ { text: "submenu" } ]
            }
        ]
        # do nothing
    main: ->

    awake: (e) ->
        console.log @name ,@pid
    cleanup: (evt) ->
        # do nothing

this.OS.register "Spotlight",Spotlight