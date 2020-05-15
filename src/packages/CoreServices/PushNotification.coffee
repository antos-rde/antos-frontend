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
    init: ->
        @view = false
        @_gui.htmlToScheme PushNotification.scheme, @, @host

    spin: (b) ->
        if b and @iconclass is "fa fa-bars"
            @iconclass = "fa fa-spinner fa-spin"
            @color = "#f90e00"
            @update()
        else if not b and @iconclass is "fa fa-spinner fa-spin"
            @iconclass = "fa fa-bars"
            @color = "#414339"
            @update()

    main: ->
        me = @
        @mlist = @find "notifylist"
        @mfeed = @find "notifeed"
        @nzone = @find "notifyzone"
        @fzone = @find "feedzone"
        (@find "btclear").set "onbtclick", (e) -> me.mlist.set "data", []
        #@subscribe "fail", (e) -> console.log e
        @subscribe "notification", (o) -> me.pushout 'INFO', o
        @subscribe "fail", (o) -> me.pushout 'FAIL', o
        @subscribe "error", (o) -> me.pushout 'ERROR', o
        @subscribe "info", (o) -> me.pushout 'INFO', o
        @subscribe "VFS", (o) -> me.pushout 'INFO', o

        @subscribe "loading", (o) ->
            me.pending.push o.id
            me.spin true

        @subscribe "loaded", (o) ->
            i = me.pending.indexOf o.id
            me.pending.splice i, 1 if i >= 0
            me.spin false if me.pending.length is 0
        
        @nzone.set "height", "100%"
        @fzone.set "height", "100%"

        ($ @nzone).css "right", 0
            .css "top", "-3px"
            .css "bottom", "0"
            .hide()
        ($ @fzone)
            #.css("z-index", 99999)
            .css("bottom", "0")
            .css "bottom", "0"
            .hide()

    pushout: (s, o) ->
        d = {
            text: "[#{s}] #{o.name} (#{o.id}): #{o.data.m}",
            icon: o.data.icon,
            iconclass: o.data.iconclass,
            closable: true }
        console.log o.data.e
        @mlist.unshift d
        @notifeed d

    notifeed: (d) ->
        me = @
        @mfeed.unshift d, true
        ($ @fzone).show()
        timer = setTimeout () ->
                me.mfeed.remove d.domel
                ($ me.fzone).hide() if me.mfeed.get("data").length is 0
                clearTimeout timer
        , 3000

    awake: (evt) ->
        if  @view then ($ @nzone).hide() else ($ @nzone).show()
        @view = not @view
        me = @
        if not @cb
            @cb = (e) ->
                if not ($ e.target).closest($ me.nzone).length and not ($ e.target).closest(evt.data.item).length
                    ($ me.nzone).hide()
                    $(document).unbind "click", me.cb
                    me.view = not me.view
        if @view
            $(document).on "click", @cb
        else
            $(document).unbind "click", @cb
        
    cleanup: (evt) ->
        # do nothing
PushNotification.scheme = """
<div>
    <afx-overlay data-id = "notifyzone" width = "250px">
        <afx-button text = "__(Clear all)" data-id = "btclear" data-height="30"></afx-button>
        <afx-list-view data-id="notifylist"></afx-list-view>
    </afx-overlay>
    <afx-overlay data-id = "feedzone" width = "250">
        <afx-list-view data-id = "notifeed">
        </afx-list-view>
    </afx-overlay>
</div>
"""
this.OS.register "PushNotification", PushNotification