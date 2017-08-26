class Calendar extends this.OS.GUI.BaseService
    constructor: () ->
        super "Calendar"
        #@iconclass = "fa fa-commenting"
        @text = ""
        @iconclass = "fa fa-calendar"
    init: ->
        #update time each second
        me = @
        @watch 1000, () ->
            now = new Date
            me.text = "#{now.getDate()}/#{(now.getMonth()+1)}/#{now.getFullYear()} " +
                    "#{now.getHours()}:#{now.getMinutes()}:#{now.getSeconds()}"
            me.update()

    awake: (e) ->
        @.openDialog "CalendarDialog", (d) ->  console.log d
        # do nothing
    cleanup: (evt) ->
        console.log "cleanup for quit"
        # do nothing

this.OS.register "Calendar",Calendar