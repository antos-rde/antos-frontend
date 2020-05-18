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

class RepositoryDialog extends this.OS.GUI.subwindows.SelectionDialog
    constructor: () ->
        super()
    main: () ->
        @list = @find "list"
        $((@find "btnOk")).hide()
        @list.set "buttons", [
            {
                text: "+",
                onbtclick: () =>
                    @openDialog("PromptDialog", {
                        title: __("Add repository"),
                        label: __("Format : [name] url")
                    }).then (e) =>
                        m = e.match /\[([^\]]*)\]\s*(.+)/
                        if not m or m.length isnt 3
                            return @error __("Wrong format: it should be [name] url")
                        repo = {
                            url: m[2],
                            text: m[1]
                        }
                        @systemsetting.system.repositories.push repo
                        @list.push repo
            },
            {
                text: "-",
                onbtclick: () =>
                    el = @list.get "selectedItem"
                    return unless el
                    selidx = $(el).index()
                    return unless  selidx >= 0
                    @systemsetting.system.repositories.splice selidx, selidx
                    @list.remove el
            },
            {
                iconclass: "fa fa-pencil",
                onbtclick: () => @editRepo()
            }

        ]

    editRepo: () ->
        el = @list.get "selectedItem"
        return unless el
        selidx = $(el).index()
        return unless  selidx >= 0
        data = el.get "data"
        sel = @systemsetting.system.repositories[selidx]
        @openDialog("PromptDialog", {
            title: __("Edit repository"),
            label: __("Format : [name] url"),
            value: "[#{data.text}] #{data.url}"
        }).then (e) =>
            m = e.match /\[([^\]]*)\]\s*(.+)/
            if not m or m.length isnt 3
                return @error __("Wrong format: it should be [name] url")
            data.text = m[1]
            data.url = m[2]
            @list.update()
            @list.unselect()

    onexit: (e) ->
        @parent.refreshRepoList()
        super.onexit e