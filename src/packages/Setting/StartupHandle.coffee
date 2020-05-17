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

class StartupHandle extends SettingHandle
    constructor: (scheme, parent) ->
        super(scheme, parent)
        @srvlist = @find "srvlist"
        @applist = @find "applist"
        @srvlist.set "buttons", [
            {
                text: "+", onbtclick: (e) =>
                    services = []
                    for k, v of @parent.systemsetting.system.packages
                        if v.services
                            srvs = ({ text: "#{k}/#{x}", iconclass: "fa fa-tasks" } for x in v.services)
                            services = services.concat srvs
                    @parent.openDialog("SelectionDialog", {
                        title: "__(Add service)",
                        data: services
                    }).then (d) =>
                       @parent.systemsetting.system.startup.services.push d.text
                       @refresh()
            },
            {
                text: "-", onbtclick: (e) =>
                    item = @srvlist.get "selectedItem"
                    return unless item
                    selidx = $(item).index()
                    @parent.systemsetting.system.startup.services.splice selidx, 1
                    @refresh()
            }
        ]

        @applist.set "buttons", [
            {
                text: "+", onbtclick: (e) =>
                    apps = ( { text: k, iconclass: v.iconclass } for k, v of  @parent.systemsetting.system.packages )
                    @parent.openDialog("SelectionDialog", {
                        title: "__(Add application)",
                        data: apps
                    }).then (d) =>
                       @parent.systemsetting.system.startup.apps.push d.text
                       @refresh()
            },
            {
                text: "-", onbtclick: (e) =>
                    item = @applist.get "selectedItem"
                    return unless item
                    selidx = $(item).index()
                    @parent.systemsetting.system.startup.apps.splice selidx, 1
                    @refresh()
            }
        ]
        @refresh()
       
    refresh: () ->
        @srvlist.set "data", ( { text:v } for v in @parent.systemsetting.system.startup.services )
        @applist.set "data", ( { text:v } for v in @parent.systemsetting.system.startup.apps )
