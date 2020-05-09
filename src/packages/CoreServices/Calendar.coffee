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
class Calendar extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "Calendar", args
        #@iconclass = "fa fa-commenting"
        @text = ""
        @iconclass = "fa fa-calendar"
    init: ->
        #update time each second
        me = @
        @watch 1000, () ->
            now = new Date
            me.text = now.toString()
            me.domel.set "text", me.text


    awake: (e) ->
        @.openDialog "CalendarDialog", (d) ->
            console.log d
        , "Calendar"
        # do nothing
    cleanup: (evt) ->
        console.log "cleanup for quit"
        # do nothing

this.OS.register "Calendar", Calendar