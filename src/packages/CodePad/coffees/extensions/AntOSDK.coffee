# import the CodePad application module
App = this.OS.APP.CodePad

# define the extension
class App.extensions.AntOSDK extends App.BaseExtension
    constructor: (app) ->
        super app

    # public functions
    create: () ->
        @app.openDialog("FileDialog", {
            title: "__(New Project at)",
            file: { basename: __("ProjectName") },
            mimes: ["dir"]
        }).then (d) =>
            @mktpl d.file.path, d.name, true
    
    init: () ->
        dir = @app.currdir
        return @create() unless dir and dir.basename
        dir.read()
            .then (d) =>
                return @notify __("Cannot read folder: {0}", dir.path) if d.error
                return @notify __("The folder is not empty: {0}", dir.path) unless d.result.length is 0
                @mktpl dir.parent().path, dir.basename
    
    buildnrun: () ->
        @metadata("project.json").then (meta) =>
            @build(meta, true).then () =>
                @run(meta).catch (e) => @error __("Unable to run project"), e
            .catch (e) =>
                @error __("Unable to build project"), e
        .catch (e) => @error __("Unable to read meta-data"), e

    release: () ->
        @metadata("project.json").then (meta) =>
            @build(meta, false).then () =>
                @mkar("#{meta.root}/build/debug", "#{meta.root}/build/release/#{meta.name}.zip")
                    .then () ->
                    .catch (e) => @error __("Unable to create package archive"), e
            .catch (e) =>
                @error __("Unable to build project"), e
        .catch (e) => @error __("Unable to read meta-data"), e


    # private functions
    mktpl: (path, name, flag) ->
        rpath = "#{path}/#{name}"
        dirs = [
            "#{rpath}/javascripts",
            "#{rpath}/css",
            "#{rpath}/coffees",
            "#{rpath}/assets"
        ]
        dirs.unshift rpath if flag
        files = [
            ["templates/sdk-main.tpl", "#{rpath}/coffees/main.coffee"],
            ["templates/sdk-package.tpl", "#{rpath}/package.json"],
            ["templates/sdk-project.tpl", "#{rpath}/project.json"],
            ["templates/sdk-README.tpl", "#{rpath}/README.md"],
            ["templates/sdk-scheme.tpl", "#{rpath}/assets/scheme.html"]
        ]
        @mkdirAll dirs
            .then () =>
                @mkfileAll(files, path, name)
                    .then () =>
                        @app.currdir = rpath.asFileHandle()
                        @app.initSideBar()
                        @app.openFile "#{rpath}/README.md".asFileHandle()
                    .catch (e) => @error __("Unable to create template files"), e
            .catch (e) => @error __("Unable to create project directory"), e

    verify: (list) ->
        new Promise (resolve, reject) =>
            return resolve() if list.length is 0
            file = (list.splice 0, 1)[0].asFileHandle()
            @notify __("Verifying: {0}", file.path)
            file.read().then (data) =>
                try
                    CoffeeScript.nodes data
                    @verify list
                        .then () -> resolve()
                        .catch (e) -> reject __e e
                catch ex
                    reject __e ex
            .catch (e) -> reject __e e

    compile: (meta) ->
        new Promise (resolve, reject) =>
            @import([
                "#{@basedir()}/coffeescript.js",
                "#{@basedir()}/terser.min.js"
            ]).then () =>
                list = ("#{meta.root}/#{v}" for v in meta.coffees)
                @verify((f for f in list)).then () =>
                    @cat(list).then (code) =>
                        jsrc = CoffeeScript.compile code
                        @notify __("Compiled successful")
                        resolve jsrc
                    .catch (e) -> reject __e e
                .catch (e) -> reject __e e
            .catch (e) -> reject __e e
    
    build: (meta, debug) ->
        dirs = [
            "#{meta.root}/build",
            "#{meta.root}/build/debug",
            "#{meta.root}/build/release"
        ]
        new Promise (resolve, reject) =>
            @mkdirAll(dirs).then =>
                @compile(meta).then (src) =>
                    @cat ("#{meta.root}/#{v}" for v in meta.javascripts), src
                    .then (jsrc) ->
                        new Promise (r, e) ->
                            code = jsrc
                            if not debug
                                options = {
                                    toplevel: true,
                                    compress: {
                                        passes: 3,
                                        #pure_getters: true,
                                        #unsafe: true,
                                    },
                                    mangle: true,
                                    output: {
                                        #beautify: true,
                                    },
                                }
                                result = Terser.minify(jsrc, options)
                                if result.error
                                    @notify __("Unable to minify code: {0}", result.error)
                                else
                                    code = result.code
                            "#{meta.root}/build/debug/main.js"
                                .asFileHandle()
                                .setCache code
                                .write("text/plain")
                                .then (d) ->
                                    r()
                                .catch (ex) -> e __e ex
                    .then () =>
                        new Promise (r, e) =>
                            @cat ("#{meta.root}/#{v}" for v in meta.css), ""
                            .then (txt) ->
                                return r() if txt is ""
                                "#{meta.root}/build/debug/main.css"
                                .asFileHandle()
                                .setCache txt
                                .write("text/plain")
                                .then (d) ->
                                    r()
                                .catch (ex) -> e __e ex
                    .then () =>
                        @copy ("#{meta.root}/#{v}" for v in meta.copies), "#{meta.root}/build/debug"
                    .then () -> resolve()
                    .catch (e) -> reject __e e
                .catch (e) -> reject __e e
            .catch (e) -> reject __e e

    run: (meta) ->
        "#{meta.root}/build/debug/package.json"
            .asFileHandle()
            .read("json")
            .then (v) =>
                v.text = v.name
                v.path = "#{meta.root}/build/debug"
                v.filename = meta.name
                v.type = "app"
                v.mime = "antos/app"
                v.icon = "#{v.path}/#{v.icon}" if v.icon
                v.iconclass = "fa fa-adn" unless v.iconclass or v.icon
                @notify __("Installing...")
                @app.systemsetting.system.packages[meta.name] = v
                @notify __("Running {0}...", meta.name)
                @app._gui.forceLaunch meta.name