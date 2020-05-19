# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.

class MarketPlace extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "MarketPlace", args
    
    main: () ->
        @installdir = @systemsetting.system.pkgpaths.user
        # test repository
        @apps_meta = []
        @repo = @find "repo"
        @repo.set "onlistselect", (e) =>
            data = e.data.item.get("data")
            return unless data
            @fetchApps data
        
        @refreshRepoList()
        
        @applist = @find "applist"
        @applist.set "onlistselect", (e) =>
            data = e.data.item.get("data")
            @appDetail data

        @container =  @find "container"
        @appname = @find "appname"
        @appdesc = @find "app-desc"
        @appdetail = @find "app-detail"
        @btinstall = @find "bt-install"
        @btremove = @find "bt-remove"
        @btexec = @find "bt-exec"
        @searchbox = @find "searchbox"
        ($ @container).css "visibility", "hidden"
        @btexec.set "onbtclick", (e) =>
            el = @applist.get "selectedItem"
            return unless el
            app = el.get("data")
            @_gui.launch app.className if app.className

        @btinstall.set "onbtclick", (e) =>
            if @btinstall.get "dirty"
                return @updatePackage()
                    .then () => @notify __("Package updated")
                    .catch (e) => @error e.toString(), e
            @remoteInstall()
                .then () => @notify __("Package installed")
                .catch (e) => @error e.toString(), e

        @btremove.set "onbtclick", (e) =>
            @uninstall()
                .then () => @notify __("Packaged uninstalled")
                .catch (e) => @error e.toString(), e

        @bindKey "CTRL-R", () =>
            @menuOptionsHandle "repos"
        
        $(@searchbox).keyup (e) => @search e

    refreshRepoList: () ->
        list = (v for v in @systemsetting.system.repositories)
        list.unshift {
            text: "Installed"
        }
        @repo.set "data", list

    search: (e) ->
        switch e.which
            when 37
                e.preventDefault()
            when 38
                @applist.selectPrev()
                e.preventDefault()
            when 39
                e.preventDefault()
            when 40
                @applist.selectNext()
                e.preventDefault()
            when 13
                e.preventDefault()
            else
                text = @searchbox.value
                @applist.set "data", (v for v in @apps_meta) if text.length is 2
                return if text.length < 3
                result = []
                term = new RegExp text, 'i'
                result.push v for v in @apps_meta when v.text.match term
                @applist.set "data", result


    fetchApps: (data) ->
        if not data.url
            pkgcache = @systemsetting.system.packages
            list = []
            for k, v of pkgcache
                list.push {
                    className: if v.app then v.app else v.className,
                    name: v.name,
                    text: v.name,
                    icon: v.icon,
                    iconclass: v.iconclass,
                    category: v.category,
                    author: v.info.author,
                    version: v.version,
                    description: "#{v.path}/REAME.md"
                }
            @apps_meta = list
            @applist.set "data", list
            return
        
        @_api.get data.url
            .then ( d ) =>
                for v in d
                    v.text = v.name
                    v.iconclass = "fa fa-adn"
                @apps_meta = d
                @applist.set "data", d
            .catch (e) ->
                @error __("Fail to fetch packages list from: {0}", data.url), e

    appDetail: (d) ->
        ($ @container).css "visibility", "visible"
        ( $ @appname ).html d.name
        (@find "vstat").set "text", ""
        if d.description
            d.description.asFileHandle().read().then (text) =>
                converter = new showdown.Converter()
                ($ @appdesc).html(converter.makeHtml text)
            .catch (e) => @notify __("Unable to read package description")
        else
            ($ @appdesc).empty()
        pkgcache = @systemsetting.system.packages
        @btinstall.set "text", "__(Install)"
        @btinstall.set "dirty", false
        if pkgcache[d.className]
            vs = pkgcache[d.className].version
            ovs = d.version
            ($ @btinstall).hide()
            if vs and ovs
                vs = vs.__v()
                ovs = ovs.__v()
                if ovs.nt vs
                    @btinstall.set "dirty", true
                    @btinstall.set "text", "__(Update)"
                    ($ @btinstall).show()
                    (@find "vstat").set "text",
                        __("Your application version is older ({0} < {1})", vs, ovs)
            ($ @btremove).show()
            ($ @btexec).show()
        else
            ($ @btinstall).show()
            ($ @btremove).hide()
            ($ @btexec).hide()
      
        ($ @appdetail).empty()
        for k, v of d when k isnt "name" and k isnt "description" and k isnt "domel"
            ($ @appdetail).append(
                $("<li>")
                    .append(($ "<span class= 'info-header'>").html k)
                    .append $("<span>").html v
            )
    
    menu: () ->
        return [
            {
                text: "__(Options)", child: [
                    { text: "__(Repositories)", shortcut: "C-R", id: "repos" },
                    { text: "__(Install from zip)", shortcut: "C-I", id: "install" }
                ] , onchildselect: (e) =>
                    @menuOptionsHandle e.data.item.get("data").id
            }
        ]
    
    menuOptionsHandle: (id) ->
        switch id
            when "repos"
                @openDialog new RepositoryDialog(), {
                    title: __("Repositories"),
                    data: @systemsetting.system.repositories
                }
            when "install"
                @localInstall().then () =>
                    @notify __("Package installed")
                .catch (e) => @error __("Unable to install package"), e
            else

    remoteInstall: () ->
        el = @applist.get "selectedItem"
        return unless el
        app = el.get "data"
        return unless app
        # get blob file
        new Promise (resolve, reject) =>
            @_api.blob app.download
            .then (data) =>
                @install data, app
                    .then () -> resolve()
                    .catch (e) -> reject(e)
            .catch (e) -> reject e

    localInstall: () ->
        new Promise (resolve, reject) =>
            @openDialog("FileDialog", {
                title: "__(Select package archive)",
                mimes: [".*/zip"]
            }).then (d) =>
                d.file.path.asFileHandle().read("binary").then (data) =>
                    @install data
                        .then (n) =>
                            @repo.unselect()
                            @repo.set "selected", 0
                            apps = (v.className for v in @applist.get("data"))
                            idx = apps.indexOf n
                            if idx >= 0
                                @applist.set "selected", idx
                            resolve()
                        .catch (e) -> reject(e)
                    .catch (e) -> reject e
                .catch (e) -> reject e

    install: (data, meta) ->
        new Promise (resolve, reject) =>
            JSZip.loadAsync(data).then (zip) =>
                zip.file("package.json").async("string").then (d) =>
                    v = JSON.parse d
                    pth = "#{@installdir}/#{v.app}"
                    dir = [pth]
                    files = []
                    for name, file of zip.files
                        if file.dir
                            dir.push(pth + "/" + name)
                        else
                            files.push name
                    # create all directory
                    @mkdirs(dir).then () =>
                        @installFile(v.app, zip, files).then () =>
                            app_meta = {
                                className: v.app,
                                name: v.name,
                                text: v.name,
                                icon: v.icon,
                                iconclass: v.iconclass,
                                category: v.category,
                                author: v.info.author,
                                version: v.version,
                                description: if meta then meta.description else undefined,
                                download: if meta then meta.download else undefined
                            }
                            v.text = v.name
                            v.filename = v.app
                            v.type = "app"
                            v.mime = "antos/app"
                            v.iconclass = "fa fa-adn" unless v.iconclass or v.icon
                            v.path = pth
                            @systemsetting.system.packages[v.app] = v
                            @notify __("Application installed")
                            @appDetail app_meta
                            resolve(v.name)
                        .catch (e) -> reject e
                    .catch (e) -> reject e
                .catch (err) -> reject err
            .catch (e) -> reject e

    uninstall: () ->
        new Promise (resolve, reject) =>
            el = @applist.get "selectedItem"
            return unless el
            sel = el.get "data"
            return unless sel
            name = sel.className
            app = @systemsetting.system.packages[sel.className]
            return unless app
            @openDialog("YesNoDialog", {
                title: __("Uninstall") ,
                text: __("Uninstall: {0}?", app.name)
            }).then (d) =>
                return unless d
                app.path.asFileHandle().remove().then (r) =>
                    if r.error
                        return reject @_api.throwe __("Cannot uninstall package: {0}", r.error)
                    @notify __("Package uninstalled")
                    # stop all the services if any
                    if app.services
                        for srv in app.services
                            @_gui.unloadApp srv
                            
                    delete @systemsetting.system.packages[name]
                    @_gui.unloadApp name
                    if sel.download
                        @appDetail sel
                    else
                        @applist.remove el
                        ($ @container).css "visibility", "hidden"
                    resolve()
                .catch (e) -> reject e
            .catch (e) -> reject e
    
    updatePackage: () ->
        new Promise (resolve, reject) =>
            @uninstall().then () =>
                @remoteInstall()
                    .then () -> resolve()
                    .catch (e) -> reject e
            .catch (e) -> reject e

    mkdirs: (list) ->
        new Promise (resolve, reject) =>
            return resolve() if list.length is 0
            dir = (list.splice 0, 1)[0].asFileHandle()
            path = dir.parent()
            dname = dir.basename
            path.asFileHandle().mk dname
                .then (r) =>
                    return reject(@_api.throwe __("Cannot create {0}", "#{path}/#{dir}")) if r.error
                    @mkdirs list
                        .then () -> resolve()
                        .catch (e) -> reject e
                .catch (e) -> reject e

    installFile: (n, zip, files) ->
        new Promise (resolve, reject) =>
            return resolve() if files.length is 0
            file = (files.splice 0, 1)[0]
            path = "#{@installdir}/#{n}/#{file}"
            zip.file(file).async("uint8array").then (d) =>
                fp = path.asFileHandle()
                fp.cache = new Blob [d], { type: "octet/stream" }
                fp.write "text/plain"
                .then (r) =>
                    return reject @_api.throwe(__("Cannot install {0}", path)) if r.error
                    @installFile n, zip, files
                        .then () -> resolve()
                        .catch (e) -> reject()
                .catch (e) -> reject e
            .catch (e) -> reject e

MarketPlace.dependencies = [
    "os://scripts/jszip.min.js",
    "os://scripts/showdown.min.js"
]
MarketPlace.singleton = true
this.OS.register "MarketPlace", MarketPlace