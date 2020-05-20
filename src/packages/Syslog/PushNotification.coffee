# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.

class PushNotification extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "PushNotification", args
        @iconclass = "fa fa-bars"
        @cb = undefined
        @pending = []
        @logs = []
        @logmon = undefined
    init: ->
        @view = false
        @_gui.htmlToScheme PushNotification.scheme, @, @host

    spin: (b) ->
        if b and @iconclass is "fa fa-bars"
            @iconclass = "fa fa-spinner fa-spin"
            @update()
        else if not b and @iconclass is "fa fa-spinner fa-spin"
            @iconclass = "fa fa-bars"
            @update()

    main: ->
        @mlist = @find "notifylist"
        @mfeed = @find "notifeed"
        @nzone = @find "notifyzone"
        @fzone = @find "feedzone"
        (@find "btclear").set "onbtclick", (e) => @mlist.set "data", []
        (@find "bterrlog").set "onbtclick", (e) => @showLogReport()
        @subscribe "notification", (o) => @pushout 'INFO', o
        @subscribe "fail", (o) => @pushout 'FAIL', o
        @subscribe "error", (o) => @pushout 'ERROR', o
        @subscribe "info", (o) => @pushout 'INFO', o
        

        @subscribe "loading", (o) =>
            @pending.push o.id
            @spin true

        @subscribe "loaded", (o) =>
            i = @pending.indexOf o.id
            @pending.splice i, 1 if i >= 0
            @spin false if @pending.length is 0
        
        @nzone.set "height", "100%"
        @fzone.set "height", "100%"

        ($ @nzone).css "right", 0
            .css "top", "0"
            .css "bottom", "0"
            .hide()
        ($ @fzone)
            #.css("z-index", 99999)
            .css("bottom", "0")
            .css "bottom", "0"
            .hide()

    showLogReport: () ->
        @_gui.launch "Syslog"

    addLog: (s, o) ->
        logtime = new Date()
        log = {
            type: s,
            name: o.name,
            text: "#{o.data.m}",
            id: o.id,
            icon: o.data.icon,
            iconclass: o.data.iconclass,
            error: o.data.e,
            time: logtime,
            closable: true,
            tag: "afx-bug-list-item"
        }
        if @logmon
            @logmon.addLog log
        else
            @logs.push log

    pushout: (s, o) ->
        d = {
            text: "[#{s}] #{o.name} (#{o.id}): #{o.data.m}",
            icon: o.data.icon,
            iconclass: o.data.iconclass,
            closable: true
        }
        @addLog s, o unless s is "INFO"
        @mlist.unshift d
        @notifeed d

    notifeed: (d) ->
        @mfeed.unshift d, true
        ($ @fzone).show()
        timer = setTimeout () =>
                @mfeed.remove d.domel
                ($ @fzone).hide() if @mfeed.get("data").length is 0
                clearTimeout timer
        , 3000

    awake: (evt) ->
        if  @view then ($ @nzone).hide() else ($ @nzone).show()
        @view = not @view
        if not @cb
            @cb = (e) =>
                if not ($ e.target).closest($ @nzone).length and not ($ e.target).closest(evt.data.item).length
                    ($ @nzone).hide()
                    $(document).unbind "click", @cb
                    @view = not @view
        if @view
            $(document).on "click", @cb
        else
            $(document).unbind "click", @cb
        
    cleanup: (evt) ->
        # do nothing
PushNotification.scheme = """
<div>
    <afx-overlay data-id = "notifyzone" width = "250px">
        <afx-hbox data-height="30">
            <afx-button text = "__(Clear all)" data-id = "btclear" ></afx-button>
            <afx-button iconclass = "fa fa-bug" data-id = "bterrlog" data-width = "25"></afx-button>
        </afx-hbox>
        <afx-list-view data-id="notifylist"></afx-list-view>
    </afx-overlay>
    <afx-overlay data-id = "feedzone" width = "250">
        <afx-list-view data-id = "notifeed">
        </afx-list-view>
    </afx-overlay>
</div>
"""
this.OS.register "PushNotification", PushNotification