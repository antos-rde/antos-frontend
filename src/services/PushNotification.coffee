class PushNotification extends this.OS.GUI.BaseService
    constructor: () ->
        super "PushNotification"
        @iconclass = "fa fa-commenting"

    init: ->
        # do nothing
    awake: ->
        console.log @name,@pid
    cleanup: ->
        # do nothing

this.OS.register "PushNotification",PushNotification