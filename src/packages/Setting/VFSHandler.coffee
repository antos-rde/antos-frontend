class VFSHandler extends SettingHandler
    constructor:(scheme, parent) ->
        super(scheme, parent)
        me = @
        @mplist = @find "mplist"
        @dpath = @find "dpath"
        @ppath = @find "ppath"
        @mplist.set "buttons", [
            {
                text: "+",
                onbtclick: (e) ->
                    me.parent.openDialog me.mkdialog(), (d) ->
                        me.parent.systemsetting.VFS.mountpoints.push {
                            text: d.name, path: d.path, iconclass: "fa fa-folder", type: "fs"
                        }
                        me.render()
                    , "__(Add mount point)"
            },
            {
                text: "-",
                onbtclick: (e) ->
                    selidx = me.mplist.get "selidx"
                    sel = me.mplist.get "selected"
                    return unless selidx >= 0
                    me.parent.openDialog "YesNoDialog", (d) ->
                        return unless d
                        me.parent.systemsetting.VFS.mountpoints.splice selidx, 1
                        me.render()
                    , "__(Remove)", { text: __("Remove: {0}?", sel.text) }
            },
            {
                text: "",
                iconclass: "fa fa-pencil",
                onbtclick: (e) ->
                    sel = me.mplist.get "selected"
                    return unless sel
                    me.parent.openDialog me.mkdialog(), (d) ->
                        d.el.text = d.name
                        d.el.path = d.path 
                        me.render()
                    , "__(Edit mount point)", sel
            }
        ]
        (@find "btndpath").set 'onbtclick', (e) ->
            me.parent.openDialog "FileDiaLog", (d, n, p) ->
                me.parent.systemsetting.desktop.path = p
                me.parent._gui.refreshDesktop()
                me.render()
            , "__(Select a directory)", { mimes: ["dir"], hidden: true }
        
        (@find "btnppath").set 'onbtclick', (e) ->
            me.parent.openDialog "FileDiaLog", (d, n, p) ->
                me.parent.systemsetting.system.pkgpaths.user = p
                me.render()
            , "__(Select a directory)", { mimes: ["dir"], hidden: true }
    render: () ->
        me = @
        @mplist.set "items", @parent.systemsetting.VFS.mountpoints
        @dpath.set "text", @parent.systemsetting.desktop.path
        @ppath.set "text", @parent.systemsetting.system.pkgpaths.user

    mkdialog: () ->
        return @parent._gui.mkdialog {
            name: "MountPointDialog",
            layout: {
                tags: [
                    { tag: "afx-label", att: 'text="__(Name)" data-height="20"' },
                    { tag: "input", att: "type='text' data-height='25'" },
                    { tag: "afx-label", att: 'text="__(Path)" data-height="20"' },
                    { tag: "input", att: "type='text' data-height='25'" }
                ],
                width: 250,
                height: 150,
                resizable: false,
                buttons: [
                    {
                        label: "__(Ok)", onclick: (d) ->
                            data = {
                                name: (d.find "content1").value,
                                path: (d.find "content3").value,
                                el: d.data
                            }
                            return d.error __("Please enter mount point name") unless data.name and data.name isnt ""
                            return d.error __("Please select a directory") unless data.path and data.path isnt ""
                            d.handler(data) if d.handler
                            d.quit()
                    },
                    { label: "__(Cancel)", onclick: (d) -> d.quit() }
                ],
                filldata: (dia) ->
                    $(dia.find "content3").click (e) ->
                        dia.openDialog "FileDiaLog", (d, n, p) ->
                            (dia.find "content3").value = p
                        , "__(Select a directory)", { mimes: ["dir"], hidden: true }
                    return unless dia.data
                    (dia.find "content1").value = dia.data.text if dia.data.text
                    (dia.find "content3").value = dia.data.path if dia.data.path
            }
        }
