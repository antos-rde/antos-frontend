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
        { text: "Applications", path: 'app:///', iconclass: "fa  fa-adn", type: "app" },
        { text: "Home", path: 'home:///', iconclass: "fa fa-home", type: "fs" },
        { text: "Desktop", path: _OS.setting.desktop.path , iconclass: "fa fa-desktop", type: "fs" },
        { text: "OS", path: 'os:///', iconclass: "fa fa-inbox", type: "fs" },
        { text: "Google Drive", path: 'gdv:///', iconclass: "fa fa-inbox", type: "fs" },
        { text: "Shared", path: 'shared:///' , iconclass: "fa fa-share-square", type: "fs" }
    ] if not _OS.setting.VFS.mountpoints

    _OS.setting.system = conf.system if conf.system
    _OS.setting.system.pkgpaths = [
        "home:///.packages",
        "os:///packages"
    ] unless _OS.setting.system.pkgpaths
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