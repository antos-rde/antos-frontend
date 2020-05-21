Ant = this

class BugListItemTag extends this.OS.GUI.tag["afx-list-item-proto"]
    constructor: (r, o) ->
        super r, o
    
    __data__: (v) ->
        return unless v
        @refs.error.set "text", v.text
        @refs.time.set "text", v.time
        @refs.error.set "icon", v.icon if v.icon
        if not v.icon
            @refs.error.set "iconclass", if v.iconclass then v.iconclass else "fa fa-bug"
        @set "closable", v.closable

    __selected: (v) ->
        @get("data").selected = v


    itemlayout: () ->
        { el: "div", children: [
            { el: "afx-label", ref: "error", class: "afx-bug-list-item-error" },
            { el: "afx-label", ref: "time", class: "afx-bug-list-item-time" }

        ] }
        

this.OS.GUI.define "afx-bug-list-item", BugListItemTag

class Syslog extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Syslog", args

    main: () ->
        @loglist = @find "loglist"
        @logdetail = @find "logdetail"
        
        @_gui.pushService "Syslog/PushNotification"
            .then (srv) =>
                @srv = srv
                @loglist.set "data", @srv.logs if @srv and @srv.logs
                @srv.logmon = @
            .catch (e) =>
                @error __("Unable to load push notification service"), e
                @quit()

        $(@find("txturi")).val Ant.OS.setting.system.error_report
        @loglist.set "onlistselect", (e) =>
            data = e.data.item.get("data") if e and e.data
            return unless data
            stacktrace = "None"
            stacktrace = data.error.stack if data.error
            $(@logdetail).text Syslog.template.format(
                data.text,
                data.type,
                data.time,
                data.name,
                data.id,
               stacktrace
            )
        @loglist.set "onitemclose", (e) =>
            el = e.data.item if e and e.data
            return true unless el
            data = el.get "data"
            console.log data
            return true unless data.selected
            $(@logdetail).text("")
            return true

        @find("btnreport").set "onbtclick", (e) =>
            uri = $(@find("txturi")).val()
            return if uri is ""
            el = @loglist.get "selectedItem"
            return unless el
            data = el.get("data")
            return unless data
            Ant.OS.API.post uri, data
                .then (d) =>
                    @notify __("Error reported")
                .catch (e) =>
                    @notify __("Unable to report error: {0}", e.toString())

        @find("btclean").set "onbtclick", (e) =>
            return unless @srv
            @srv.logs = []
            @loglist.set "data", @srv.logs
            $(@logdetail).text("")

    addLog: (log) ->
        @loglist.push log
    
    cleanup: () ->
        @srv.logmon = undefined if @srv

Syslog.template = """
{0}
Log type: {1}
Log time: {2}
Process: {3} ({4})
detail:

{5}
"""
Syslog.singleton = true
this.OS.register "Syslog", Syslog