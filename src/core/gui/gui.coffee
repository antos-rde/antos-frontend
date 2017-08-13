self.OS.GUI =
    init: () ->
        query = 
            path: 'VFS/get'
            data: "#{_GUI.tagPath}/tags.json"
        self.OS.API.request query, ()->
            
    loadScheme: (path,app) ->
        _API.get path, 
        (x) ->
            return null unless x
            scheme =  $.parseHTML x
            ($ "#desktop").append scheme
            riot.mount ($ scheme), {observable:app.observable}
            app.scheme = scheme[0]
            app.show()
            app.main()
        , (f) ->
            alert "cannot load scheme"

    loadTheme: (name) ->
        path = "resources/themes/#{name}/#{name}.css"
        $ "head link#ostheme"
            .attr "href", path

    launch: (app) ->
        if not _APP[app]
            # first load it
            path = "packages/#{app}/"
            $.getScript path + "main.js"
                .done (e,s) ->
                    #load css file
                    $.get "#{path}main.css", () ->
                        $ '<link>', {rel:'stylesheet', type:'text/css', 'href':"#{path}main.css"}
                            .appendTo 'head'
                    #launch
                    if _APP[app]
                        # load app meta data
                        _API.get "#{path}package.json",
                            (data) ->
                                _APP[app].meta = data 
                                _PM.createProcess app, _APP[app]
                                console.log "Fist time loading "+app
                            ,(e,s)->
                                alert "cannot read application, meta-data"   
                .fail (e,s) ->
                    #BUG report here
                    console.log "bug report"
        else
            # now launch it
            if _APP[app]
                _PM.createProcess app, _APP[app]
    dock: (app,meta) ->
        # dock an application to a dock
        # create a data object
        data = 
            icon:null
            iconclass:meta.iconclass||""
            app:app
            onbtclick:() ->
                app.toggle()
        data.icon = "packages/#{meta.app}/#{meta.icon}" if meta.icon
        data.iconclass = "fa fa-cogs" if (not meta.icon) and (not meta.iconclass)
        dock = $ "#sysdock"
        dock.get(0).newapp data
        app.sysdock = dock.get(0)
        app.appmenu = ($ "[data-id = 'appmenu']","#syspanel")[0]
        app.init()
        #app.show() -- notwork, sice the scheme is not loaded yet

    undock: (app) ->
        ($ "#sysdock").get(0).removeapp app

    initDM: ->
        _API.resource "schemes/dm.html", (x) ->
            return null unless x
            scheme =  $.parseHTML x 
            ($ "#wrapper").append scheme
            ($ "#desktop").on "click", (e)->
                return if e.target isnt ($ "#desktop").get(0)
                ($ "#sysdock").get(0).set "selectedApp",null
            
            osmenu = {child:[
                {text:"",iconclass:"fa fa-eercast", child:[
                    {text:"About"},
                    {text:"System Preferences", iconclass:"fa fa-commenting"},
                    {text:"Applications",child:[
                            {text:"Terminal",type:"app"},
                            {text:"NotePad",type:"app", icon:"packages/NotePad/icon.png"},
                            {text:"ActivityMonitor",type:"app"}
                        ]},
                    {text:"Logout"}
                    ]}
                ],onmenuselect: (item)-> 
                    switch item.data.type
                        when "app" then _GUI.launch item.data.text
            }
            appmenu = {child:[]}
            systray = {child:[
                {text:"Sun 22:57 6 August 2017"},
                {text:"",iconclass:"fa fa-search"},
                {text:"",iconclass:"fa fa-commenting"}
                
                ],onmenuselect: (item)-> 
                    console.log item
            }

            riot.mount ($ "#syspanel", $ "#wrapper"),{osmenu:osmenu,appmenu:appmenu,systray:systray}
            riot.mount ($ "#sysdock", $ "#wrapper"), {items:[]}