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
        
        (@find "btadd").set "onbtclick", (e) ->
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
        (@find "btdel").set "onbtclick", (e) ->
            selidx = me.list.get "selidx"
            return unless  selidx >= 0
            me.systemsetting.system.repositories.splice selidx, selidx
            me.refreshList()
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
            <afx-hbox data-height = "30">
                <afx-button data-id = "btadd" text = "[+]" data-width="30"></afx-button>
                <afx-button data-id = "btdel" text = "[-]" data-width="30"></afx-button>
                <div></div>
                <afx-button data-id = "btquit" text = "__(Cancel)" data-width="50"></afx-button>
            </afx-hbox>
        </afx-vbox>
    </afx-app-window>
"""
this.OS.register "RepositoryDialog", RepositoryDialog