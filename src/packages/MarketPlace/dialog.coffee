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

class RepositoryDialog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "RepositoryDialog"

    init: () ->
        @_gui.htmlToScheme RepositoryDialog.scheme, @, @host
        #@render "#{@meta().path}/repositorydia.html"

    main: () ->
        me = @
        @list = @find "repo-list"
        @list.set "onlistdbclick", (e) ->
            selidx = me.list.get "selidx"
            return unless  selidx >= 0
            sel = me.systemsetting.system.repositories[selidx]
            me.openDialog "PromptDialog", (e) ->
                m = e.match /\[([^\]]*)\]\s*(.*)/
                return me.error "Wrong format: it should be [name] url" if not m or m.length isnt 3
                sel.name = m[1]
                sel.text = sel.name
                sel.url = m[2]
                me.refreshList()
            , __("Edit repository"), { label: __("Format : [name] url"), value: "[#{e.data.text}] #{e.data.url}" }
        
        @list.set "buttons", [
            {
                text: "+",
                onbtclick: () ->
                    me.openDialog "PromptDialog", (e) ->
                        m = e.match /\[([^\]]*)\]\s*(.*)/
                        return me.error __("Wrong format: it should be [name] url") if not m or m.length isnt 3
                        me.systemsetting.system.repositories.push {
                            name: m[1],
                            url: m[2],
                            text: m[1],
                            i: me.systemsetting.system.repositories.length
                        }
                        me.refreshList()
                    , __("Add repository"), { label: __("Format : [name] url") }
            },
            {
                text: "-",
                onbtclick: () ->
                    selidx = me.list.get "selidx"
                    return unless  selidx >= 0
                    me.systemsetting.system.repositories.splice selidx, selidx
                    me.refreshList()
            }

        ]

        (@find "btquit").set "onbtclick", (e) -> me.quit()
        @refreshList()
    refreshList: () ->
        ls = ({
            text: v.name,
            iconclass: "fa fa-link",
            url: v.url,
            complex: true,
            detail: [{ text: v.url }]
        } for v in @systemsetting.system.repositories)
        @list.set "items", ls
    onexit: (e) ->
        @parent.repo.set "items", @systemsetting.system.repositories
        @parent.dialog = undefined if @parent
RepositoryDialog.scheme = """
<afx-app-window data-id = "repository-dialog-win" apptitle="__(Repositories)" width="250" height="250">
        <afx-vbox >
            <afx-list-view data-id="repo-list"></afx-list-view>
            <div style = "text-align:right; padding:5px" data-height="30" >
                <afx-button data-id = "btquit" text = "__(Cancel)"></afx-button>
            </div>
        </afx-vbox>
    </afx-app-window>
"""