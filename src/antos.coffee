# run the code
_API = this.OS.API
_GUI = this.OS.GUI
this.OS.boot()
_GUI.loadTheme "antos"
scheme = null
_API.resource "schemes/test.html", (x) ->
    return null unless x
    scheme =  $.parseHTML x 
    ($ "#wrapper").append scheme
    riot.mount $ "#button", $ "#wrapper"
    osmenu = {child:[
        {text:"",icon:"fa fa-circle", child:[
            {text:"About"},
            {text:"System Preferences", icon:"fa fa-commenting"},
             {text:"Applications",child:[{text:"Terminal"},{text:"Text edit"}]},
             {text:"Logout"}
             ]}
        ],
    onselect: (item)-> console.log item}
    appmenu = {child:[
        {text:"Text edit", child:[
            {text:"About"},
            {text:"Preferences"},
             {text:"Exit"}
             ]},
        {text:"File",child:[
            {text:"Open"},{text:"Save"}]}
        ],
    onselect: (item)-> console.log item}
    systray = {child:[
        {text:"Sun 22:57 6 August 2017"},
        {text:"",icon:"fa fa-search"},
        {text:"",icon:"fa fa-commenting"}
        
    ],
    onselect: (item)-> console.log item}

    riot.mount ($ "#syspanel", $ "#wrapper"),{osmenu:osmenu,appmenu:appmenu,systray:systray}

    docks = {items:[
        {icon:"fa fa-cogs"},
        {icon:"fa fa-life-ring"},
        {icon:"fa fa-cubes"}
    ]}
    riot.mount ($ "#sysdock", $ "#wrapper"), docks