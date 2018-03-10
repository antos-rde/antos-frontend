 self.OS.systemSetting = (conf) ->
    _OS.setting.desktop = conf.desktop if conf.desktop
    _OS.setting.applications = conf.applications if conf.applications
    _OS.setting.appearance = conf.appearance if conf.appearance
    _OS.setting.user = conf.user
    _OS.setting.VFS = conf.VFS if conf.VFS
    _OS.setting.desktop.path = "home:///.desktop" unless _OS.setting.desktop.path
    _OS.setting.desktop.menu = {} unless _OS.setting.desktop.menu
    _OS.setting.VFS.mountpoints = [
        #TODO: multi app try to write to this object, it neet to be cloned
        { text: __("Applications"), path: 'app:///', iconclass: "fa  fa-adn", type: "app" },
        { text: __("Home"), path: 'home:///', iconclass: "fa fa-home", type: "fs" },
        { text: __("Desktop"), path: _OS.setting.desktop.path , iconclass: "fa fa-desktop", type: "fs" },
        { text: __("OS"), path: 'os:///', iconclass: "fa fa-inbox", type: "fs" },
        { text: __("Google Drive"), path: 'gdv:///', iconclass: "fa fa-inbox", type: "fs" },
        { text: __("Shared"), path: 'shared:///' , iconclass: "fa fa-share-square", type: "fs" }
    ] if not _OS.setting.VFS.mountpoints

    _OS.setting.system = conf.system if conf.system
    _OS.setting.system.startup = {
        services: [
            "CoreServices/PushNotification",
            "CoreServices/UserService",
            "CoreServices/Calendar",
            "CoreServices/Spotlight"
        ],
        apps: []
    } if not _OS.setting.system.startup

    _OS.setting.system.pkgpaths = {
        user: "home:///.packages",
        system: "os:///packages"
     } unless _OS.setting.system.pkgpaths
    _OS.setting.system.locale = "en_GB" unless _OS.setting.system.locale
    _OS.setting.system.menu = {} unless _OS.setting.system.menu
    _OS.setting.system.repositories = [] unless _OS.setting.system.repositories
    _OS.setting.appearance.theme = "antos" unless _OS.setting.appearance.theme

    _OS.setting.VFS.gdrive = {
        CLIENT_ID: ""
        API_KEY: ""
        apilink: "https://apis.google.com/js/api.js"
        DISCOVERY_DOCS: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
        SCOPES: 'https://www.googleapis.com/auth/drive'
    } unless _OS.setting.VFS.gdrive

        #search for app
    _API.onsearch "__(Applications)", (t) ->
        ar = []
        term = new RegExp t, "i"
        for k, v of _OS.setting.system.packages when v.app
            if (v.name.match term) or (v.description and v.description.match term)
                v1 = {}
                v1[k1] = e for k1, e of v when k1 isnt "selected"
                v1.detail = [{ text: v1.path }]
                v1.complex = true
                ar.push v1
            else if v.mimes
                for m in v.mimes
                    if t.match (new RegExp m, "g")
                        v1 = {}
                        v1[k1] = v[k1] for k1, e of v when k1 isnt "selected"
                        v1.detail = [{ text: v1.path }]
                        v1.complex = true
                        ar.push v1
                        break
        return ar