class StartupHandler extends SettingHandler
    constructor:(scheme, parent) ->
        super(scheme, parent)
        me = @
        @srvlist = @find "srvlist"
        @applist = @find "applist"
        @srvlist.set "buttons", [
            {
                text: "+", onbtclick: (e) ->
                    services = []
                    for k, v of me.parent.systemsetting.system.packages
                        if v.services
                            srvs = ({ text: "#{k}/#{x}", iconclass:"fa fa-tasks" } for x in v.services)
                            services = services.concat srvs
                    me.parent.openDialog me.mkdialog(), (d) ->
                       me.parent.systemsetting.system.startup.services.push d
                       me.render()
                    , "__(Add service)", services
            },
            {
                text: "-", onbtclick: (e) ->
                    selidx = me.srvlist.get "selidx"
                    return unless selidx >= 0
                    me.parent.systemsetting.system.startup.services.splice selidx,1
                    me.render()
            }
        ]

        @applist.set "buttons", [
            {
                text: "+", onbtclick: (e) ->
                    apps = ( { text: k, iconclass: v.iconclass } for k, v of  me.parent.systemsetting.system.packages )
                    me.parent.openDialog me.mkdialog(), (d) ->
                       me.parent.systemsetting.system.startup.apps.push d
                       me.render()
                    , "__(Add application)", apps
            },
            {
                text: "-", onbtclick: (e) ->
                    selidx = me.applist.get "selidx"
                    return unless selidx >= 0
                    me.parent.systemsetting.system.startup.apps.splice selidx,1
                    me.render()
            }
        ]
       
    render: () ->
        @srvlist.set "items", ( { text:v } for v in @parent.systemsetting.system.startup.services )
        @applist.set "items", ( { text:v } for v in @parent.systemsetting.system.startup.apps )
        

    mkdialog: () ->
        return @parent._gui.mkdialog {
            name: "StartupDialog",
            layout: {
                tags: [
                    { tag: "afx-list-view" }
                ],
                width: 250,
                height: 200,
                resizable: false,
                buttons: [
                    {
                        label: "__(Ok)", onclick: (d) ->
                            sel = (d.find "content0").get "selected"
                            return d.error __("Please select an entry") unless sel
                            d.handler(sel.text) if d.handler
                            d.quit()
                    },
                    { label: "__(Cancel)", onclick: (d) -> d.quit() }
                ],
                filldata: (dia) ->

                    (dia.find "content0").set "items", dia.data if dia.data
            }
        }
