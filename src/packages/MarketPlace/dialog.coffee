class RepositoryDialog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "RepositoryDialog"

    init: () ->
        @_gui.htmlToScheme RepositoryDialog.scheme, @, @host
        #@render "#{@meta().path}/repositorydia.html"

    main: () ->
        me = @
        @list = @find "repo-list"
        ls = ({ text: v.name, iconclass: "fa fa-link", url: v.url
        } for v in @systemsetting.system.repositories)
        @url = @find "repo-url"
        @list.set "onlistselect", (e) ->
            ($ me.url).html e.data.url
        @list.set "items", ls
        
RepositoryDialog.scheme = """
<afx-app-window data-id = "repository-dialog-win" apptitle="Repositories" width="250" height="250">
        <afx-vbox >
            <afx-list-view data-id="repo-list"></afx-list-view>
            <div data-id="repo-url" data-height="grow"></div>
            <afx-hbox data-height = "30">
                <afx-button data-id = "btadd" text = "[+]" data-width="30"></afx-button>
                <afx-button data-id = "btdel" text = "[-]" data-width="30"></afx-button>
                <div></div>
                <afx-button data-id = "btquit" text = "Cancel" data-width="50"></afx-button>
            </afx-hbox>
        </afx-vbox>
    </afx-app-window>
"""
this.OS.register "RepositoryDialog", RepositoryDialog