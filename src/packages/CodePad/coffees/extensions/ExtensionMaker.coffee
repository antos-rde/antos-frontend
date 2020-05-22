# import the CodePad application module
App = this.OS.APP.CodePad

# define the extension
class App.extensions.ExtensionMaker extends App.BaseExtension
    constructor: (app) ->
        super app

    # public functions
    create: () ->
        @app.openDialog("FileDialog", {
            title: "__(New CodePad extension at)",
            file: { basename: __("ExtensionName") },
            mimes: ["dir"]
        }).then (d) =>
            @mktpl d.file.path, d.name
    
    buildnrun: () ->
        @metadata("extension.json").then (meta) =>
            @build(meta).then () =>
                @run(meta).catch (e) => @error __("Unable to run extension"), e
            .catch (e) =>
                @error __("Unable to build extension"), e
        .catch (e) => @error __("Unable to read meta-data"), e

    release: () ->
        @metadata("extension.json").then (meta) =>
            @build(meta).then () =>
                @mkar("#{meta.root}/build/debug",
                    "#{meta.root}/build/release/#{meta.meta.name}.zip")
                    .then () ->
                    .catch (e) => @error __("Unable to create archive"), e
            .catch (e) =>
                @error __("Unable to build extension"), e
        .catch (e) => @error __("Unable to read meta-data"), e

    install: () ->
        @app.openDialog("FileDialog", {
            title: "__(Select extension archive)",
            mimes: [".*/zip"]
        }).then (d) =>
            @installZip d.file.path
                .then () =>
                    @notify __("Extension installed")
                    @app.loadExtensionMetaData()
                .catch (e) => @error __("Unable to install extension"), e
    # private functions
    mktpl: (path, name) ->
        rpath = "#{path}/#{name}"
        dirs = [
            rpath,
            "#{rpath}/build",
            "#{rpath}/build/release",
            "#{rpath}/build/debug"
        ]
        files = [
            ["templates/ext-main.tpl", "#{rpath}/#{name}.coffee"],
            ["templates/ext-extension.tpl", "#{rpath}/extension.json"],
        ]
        @mkdirAll dirs
            .then () =>
                @mkfileAll(files, path, name)
                    .then () =>
                        @app.currdir = rpath.asFileHandle()
                        @app.initSideBar()
                        @app.openFile "#{rpath}/#{name}.coffee".asFileHandle()
                    .catch (e) => @error __("Unable to create extension template"), e
            .catch (e) => @error __("Unable to create extension directories"), e


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
            @import(["#{@basedir()}/coffeescript.js"]).then () =>
                list = ("#{meta.root}/#{v}" for v in meta.coffees)
                @verify((f for f in list)).then () =>
                    @cat(list).then (code) =>
                        jsrc = CoffeeScript.compile code
                        @notify __("Compiled successful")
                        resolve jsrc
                    .catch (e) -> reject __e e
                .catch (e) -> reject __e e
            .catch (e) -> reject __e e
    
    build: (meta) ->
        new Promise (resolve, reject) =>
            @compile(meta).then (src) =>
                @cat ("#{meta.root}/#{v}" for v in meta.javascripts), src
                .then (jsrc) ->
                    new Promise (r, e) ->
                        "#{meta.root}/build/debug/#{meta.meta.name}.js"
                            .asFileHandle()
                            .setCache jsrc
                            .write("text/plain")
                            .then (d) ->
                                r()
                            .catch (ex) -> e __e ex
                .then () ->
                    new Promise (r, e) ->
                        "#{meta.root}/build/debug/extension.json"
                        .asFileHandle()
                        .setCache meta.meta
                        .write("object")
                        .then (data) ->
                            r data
                        .catch (ex) -> e __e ex
                .then () =>
                    @copy ("#{meta.root}/#{v}" for v in meta.copies), "#{meta.root}/build/debug"
                .then () -> resolve()
                .catch (e) -> reject __e e
            .catch (e) -> reject __e e

    run: (meta) ->
        new Promise (resolve, reject) =>
            path = "#{meta.root}/build/debug/#{meta.meta.name}.js"
            delete @app._api.shared[path] if @app._api.shared[path]
            @app._api.requires path
                .then () =>
                    if @app.extensions[meta.meta.name]
                        @app.extensions[meta.meta.name].child = []
                        @app.extensions[meta.meta.name].addAction v for v in meta.meta.actions
                    else
                        @app.extensions[meta.meta.name] = new App.CMDMenu meta.meta.text
                        @app.extensions[meta.meta.name].name = meta.meta.name
                        @app.extensions[meta.meta.name].addAction v for v in meta.meta.actions
                        @app.spotlight.addAction @app.extensions[meta.meta.name]
                        @app.extensions[meta.meta.name].onchildselect (e) =>
                            @app.loadAndRunExtensionAction e.data.item.get "data"
                    @app.spotlight.run @app
                    resolve()
                .catch (e) -> reject __e e
    

    installExtension: (files, zip) ->
        new Promise (resolve, reject) =>
            idx = files.indexOf "extension.json"
            reject(@app._api.throwe __("No meta-data found")) if idx < 0
            metafile = (files.splice idx, 1)[0]
            # read the meta file
            zip.file(metafile).async("uint8array").then (d) =>
                meta = JSON.parse(new TextDecoder("utf-8").decode(d))
                @installFiles files, zip, meta
                    .then () -> resolve()
                    .catch (e) -> reject __e e
            .catch (e) -> reject __e e

    installFiles: (files, zip, meta) ->
        return @installMeta(meta) if files.length is 0
        new Promise (resolve, reject) =>
            file = (files.splice 0, 1)[0]
            path = "#{@basedir()}/#{file}"
            zip.file(file).async("uint8array").then (d) =>
                path.asFileHandle()
                    .setCache(new Blob [d], { type: "octet/stream" })
                    .write("text/plain").then (r) =>
                        return reject r.error if r.error
                        @installFiles files, zip, meta
                            .then () -> resolve()
                            .catch (e) -> reject __e e
                    .catch (e) -> reject __e e
            .catch (e) -> reject __e e

    installMeta: (meta) ->
        new Promise (resolve, reject) =>
            file = "#{@app.meta().path}/extensions.json".asFileHandle()
            file.read("json").then (data) ->
                names = (v.name) for v in data
                idx = name.indexOf meta.name
                data.splice idx, 1 if idx >= 0
                data.push meta
                file.setCache data
                .write("object")
                    .then () -> resolve()
                    .catch (e) -> reject __e e
            .catch (e) -> reject __e e

    installZip: (path) ->
        new Promise (resolve, reject) =>
            @import(["os://scripts/jszip.min.js"]).then () =>
                path.asFileHandle().read("binary").then (data) =>
                    JSZip.loadAsync(data).then (zip) =>
                        pth = @basedir()
                        dir = []
                        files = []
                        for name, file of zip.files
                            if file.dir
                                dir.push(pth + "/" + name)
                            else
                                files.push name
                        if dir.length > 0
                            @mkdirAll dir
                                .then () =>
                                    @installExtension files, zip
                                        .then () -> resolve()
                                        .catch(e) -> reject(__e e)
                                .catch (e) -> reject __e e
                        else
                            @installExtension files, zip
                                .then () -> resolve()
                                .catch (e) -> reject(__e e)
                    .catch (e) -> reject __e e
                .catch (e) -> reject __e e
            .catch (e) -> reject __e e