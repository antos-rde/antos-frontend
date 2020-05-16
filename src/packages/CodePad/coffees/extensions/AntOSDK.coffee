# import the CodePad application module
App = this.OS.APP.CodePad

# define the extension
class App.extensions.AntOSDK extends App.BaseExtension
    constructor: (app) ->
        super app

    # public functions
    create: () ->
        me = @
        @app.openDialog("FileDialog", {
            title: "__(New Project at)",
            file: { basename: __("ProjectName") },
            mimes: ["dir"]
        }).then (d) ->
            me.mktpl d.file.path, d.name, true
    
    init: () ->
        me = @
        dir = @app.currdir
        return @create() unless dir and dir.basename
        dir.read()
            .then (d) ->
                return me.notify __("Cannot read folder: {0}", dir.path) if d.error
                return me.notify __("The folder is not empty: {0}", dir.path) unless d.result.length is 0
                me.mktpl dir.parent().path, dir.basename
    
    build: () ->
        console.log "build"
    
    release: () ->
        console.log "release"
    
    options: () ->
        console.log "options"

    dependencies: () ->
        [
            "AntOSDK/coffeescript.js"
        ]

    # private functions
    mktpl: (path, name, flag) ->
        me = @
        rpath = "#{path}/#{name}"
        dirs = [
            "#{rpath}/build",
            "#{rpath}/build/release",
            "#{rpath}/build/debug",
            "#{rpath}/javascripts",
            "#{rpath}/css",
            "#{rpath}/coffees",
            "#{rpath}/assets"
        ]
        dirs.unshift rpath if flag
        files = [
            ["main.tpl", "#{rpath}/coffees/main.coffee"],
            ["package.tpl", "#{rpath}/package.json"],
            ["project.tpl", "#{rpath}/project.apj"],
            ["README.tpl", "#{rpath}/README.md"],
            ["scheme.tpl", "#{rpath}/assets/scheme.html"]
        ]
        @mkdirAll dirs
            .then () ->
                me.mkfileAll(files, path, name)
                    .then () ->
                        me.app.currdir = rpath.asFileHandle()
                        me.app.initSideBar()
                        me.app.openFile "#{rpath}/README.md".asFileHandle()
                    .catch (e) -> me.error e.stack
            .catch (e) -> me.error e.stack
    
    mkdirAll: (list) ->
        me = @
        new Promise (resolve, reject) ->
            return resolve() if list.length is 0
            path = (list.splice 0, 1)[0].asFileHandle()
            path.parent().mk path.basename
                .then () ->
                    me.mkdirAll list
                        .then () -> resolve()
                        .catch (e) -> reject e
                .catch (e) -> reject e
    
    mkfileAll: (list, path, name) ->
        me = @
        new Promise (resolve, reject) ->
            return resolve() if list.length is 0
            item = (list.splice 0, 1)[0]
            "#{me.basedir()}/AntOSDK/templates/#{item[0]}"
                .asFileHandle()
                .read()
                .then (data) ->
                    file = item[1].asFileHandle()
                        .setCache(data.format name, "#{path}/#{name}")
                        .write "text/plain"
                        .then () ->
                            me.mkfileAll list, path, name
                                .then () -> resolve()
                                .catch (e) -> reject e
                        .catch (e) -> reject e
                .catch (e) -> reject e


