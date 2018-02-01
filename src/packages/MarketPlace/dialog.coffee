class RepositoryDialog extends this.OS.GUI.BaseDialog
    constructor: () ->
        super "RepositoryDialog"

    init: () ->
        @render "#{@meta().path}/repositorydia.html"

    main: () ->
        me = @
        @list = @find "repo-list"
        ls = ({ text: v.name, iconclass: "fa fa-link", url: v.url
        } for v in @systemsetting.system.repositories)
        @url = @find "repo-url"
        @list.set "onlistselect", (e) ->
            ($ me.url).html e.data.url
        @list.set "items", ls
        
this.OS.register "RepositoryDialog", RepositoryDialog