self.OS.GUI =
    tagPath: "resources/tags/"
    init: () ->
        query = 
            path: 'VFS/get'
            data: "#{_GUI.tagPath}/tags.json"
        self.OS.API.request query, ()->
            
    loadScheme: (path, obs) ->
        _API.get path, (x) ->
            return null unless x
            scheme =  $.parseHTML x 
            ($ "#desktop").append scheme
            riot.mount ($ scheme), {observable:obs}
            scheme
    loadTheme: (name) ->
        path = "resources/themes/#{name}/#{name}.css"
        $ "head link#ostheme"
            .attr "href", path
    launch: (app) ->
        if not _APP[app]
            # first load it
            path = "packages/#{app}/main.js"
            $.getScript path
                .done (e,s) ->
                    #launch
                    _app = new _APP[app]
                    _app.init()
                    console.log "Fist time loading "+app
                .fail (e,s) ->
                    #BUG report here
                    console.log "bug report"
        else
        # now launch it
            _app = new _APP[app]
            _app.init()
    initDM: ->
        _API.resource "schemes/dm.html", (x) ->
            return null unless x
            scheme =  $.parseHTML x 
            ($ "#wrapper").append scheme
            #riot.mount $ "#button", $ "#wrapper"
            osmenu = {child:[
                {text:"",icon:"fa fa-circle", child:[
                    {text:"About"},
                    {text:"System Preferences", icon:"fa fa-commenting"},
                    {text:"Applications",child:[{text:"Terminal"},{text:"Text edit"}]},
                    {text:"Logout"}
                    ]}
                ],
            onmenuselect: (item)-> 
                console.log item
                _GUI.launch "NotePad"
            }
            appmenu = {child:[
                {text:"Text edit", child:[
                    {text:"About"},
                    {text:"Preferences"},
                    {text:"Exit"}
                    ]},
                {text:"File",child:[
                    {text:"Open"},{text:"Save"}]}
                ],
            onmenuselect: (item)-> console.log item}
            systray = {child:[
                {text:"Sun 22:57 6 August 2017"},
                {text:"",icon:"fa fa-search"},
                {text:"",icon:"fa fa-commenting"}
                
                ],
            onmenuselect: (item)-> 
                console.log item
            }

            riot.mount ($ "#syspanel", $ "#wrapper"),{osmenu:osmenu,appmenu:appmenu,systray:systray}

            docks = {items:[
                {icon:"fa fa-cogs"},
                {icon:"fa fa-life-ring"},
                {icon:"fa fa-cubes"}
            ]}
            riot.mount ($ "#sysdock", $ "#wrapper"), docks