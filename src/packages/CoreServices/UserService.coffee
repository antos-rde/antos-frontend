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

class UserService extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "UserService", args
        @text =@systemsetting.user.username
        @iconclass = undefined
    init: ->
        me = @
        @child = [
            {
                text: "__(About)", dataid: "user-about",
                iconclass: "fa fa-user-circle-o"
            },
            {
                text: "__(Logout)", dataid: "sys-logout",
                iconclass: "fa fa-user-times"
            }
        ]
        @onmenuselect = (d) ->
            return window.OS.exit() if d.item.data.dataid is "sys-logout"
            me.notify __("This feature is not implemented yet")
    awake: (e) ->
        
    cleanup: (evt) ->
        

this.OS.register "UserService",UserService