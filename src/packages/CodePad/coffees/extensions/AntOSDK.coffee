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
        @metadata().then (meta) =>
            @build(meta).then () =>
                @run(meta).catch (e) => @error.toString()
            .catch (e) =>
                @error e.toString()
        .catch (e) => @error e.toString()

    release: () ->
        @metadata().then (meta) =>
            @build(meta).then () =>
                @mkar(meta)
                    .then () ->
                    .catch (e) => @error.toString()
            .catch (e) =>
                @error e.toString()
        .catch (e) => @error e.toString()


    # private functions
    mktpl: (path, name, flag) ->
        rpath = "#{path}/#{name}"
        console.log rpath
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
            ["project.tpl", "#{rpath}/project.json"],
            ["README.tpl", "#{rpath}/README.md"],
            ["scheme.tpl", "#{rpath}/assets/scheme.html"]
        ]
        @mkdirAll dirs
            .then () =>
                @mkfileAll(files, path, name)
                    .then () =>
                        @app.currdir = rpath.asFileHandle()
                        @app.initSideBar()
                        @app.openFile "#{rpath}/README.md".asFileHandle()
                    .catch (e) => @error e.stack
            .catch (e) => @error e.stack
    
    mkdirAll: (list) ->
        new Promise (resolve, reject) =>
            return resolve() if list.length is 0
            path = (list.splice 0, 1)[0].asFileHandle()
            console.log path.parent().path, path.basename
            path.parent().mk path.basename
                .then (d) =>
                    @mkdirAll list
                        .then () -> resolve()
                        .catch (e) -> reject e
                .catch (e) -> reject e
    
    mkfileAll: (list, path, name) ->
        new Promise (resolve, reject) =>
            return resolve() if list.length is 0
            item = (list.splice 0, 1)[0]
            "#{@basedir()}/AntOSDK/templates/#{item[0]}"
                .asFileHandle()
                .read()
                .then (data) =>
                    file = item[1].asFileHandle()
                        .setCache(data.format name, "#{path}/#{name}")
                        .write "text/plain"
                        .then () =>
                            @mkfileAll list, path, name
                                .then () -> resolve()
                                .catch (e) -> reject e
                        .catch (e) -> reject e
                .catch (e) -> reject e

    metadata: () ->
        new Promise (resolve, reject) =>
            if not @app.currdir
                return reject @app._api.throwe __("Project folder is not found")
            "#{@app.currdir.path}/project.json"
                .asFileHandle()
                .read("json")
                .then (data) ->
                    resolve data
                .catch (e) =>
                    reject @app._api.throwe __("Unable to read project meta-data")

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
                        .catch (e) -> reject e
                catch ex
                    reject ex
            .catch (e) -> reject e

    compile: (meta) ->
        new Promise (resolve, reject) =>
            @import("#{@basedir()}/AntOSDK/coffeescript.js").then () =>
                list = ("#{meta.root}/#{v}" for v in meta.coffees)
                @verify((f for f in list)).then () =>
                    @cat(list).then (code) =>
                        jsrc = CoffeeScript.compile code
                        @notify __("Compiled successful")
                        resolve jsrc
                    .catch (e) -> reject e
                .catch (e) -> reject e
            .catch (e) -> reject e
    
    build: (meta) ->
        new Promise (resolve, reject) =>
            @compile(meta).then (src) =>
                @cat ("#{meta.root}/#{v}" for v in meta.javascripts), src
                .then (jsrc) ->
                    new Promise (r, e) ->
                        "#{meta.root}/build/debug/main.js"
                            .asFileHandle()
                            .setCache jsrc
                            .write("text/plain")
                            .then (d) ->
                                return e d if d.error
                                r()
                            .catch (ex) -> e ex
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
                                return e d if d.error
                                r()
                            .catch (ex) -> e ex
                .then () =>
                    @copy ("#{meta.root}/#{v}" for v in meta.copies), "#{meta.root}/build/debug"
                .then () -> resolve()
                .catch (e) -> reject e
            .catch (e) -> reject e

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

    cat: (list, data) ->
        new Promise (resolve, reject) =>
            return resolve data if list.length is 0
            file = (list.splice 0, 1)[0].asFileHandle()
            file
                .read()
                .then (text) =>
                    data = data + "\n" + text
                    @cat list, data
                        .then (d) -> resolve d
                        .catch (e) -> reject e
                .catch (e) -> reject e
    
    copy: (files, to) ->
        new Promise (resolve, reject) =>
            return resolve() if files.length is 0
            file = (files.splice 0, 1)[0].asFileHandle()
            tof = "#{to}/#{file.basename}".asFileHandle()
            file.read("binary")
                .then (data) =>
                    tof.setCache(new Blob [data], { type: file.info.mime })
                        .write(file.info.mime)
                        .then (d) =>
                            @copy files, to
                                .then () -> resolve()
                                .catch (e) -> reject e
                .catch (e) -> reject e

    mkar: (meta) ->
        @notify __("Preparing for release")
        new Promise (r, e) =>
            @import("os://scripts/jszip.min.js").then () ->
                "#{meta.root}/build/debug".asFileHandle()
                .read().then (d) ->
                    return e d.error if d.error
                    r d.result
                .catch (ex) -> e ex
            .catch (ex) -> e ex
        .then (files) =>
            new Promise (r, e) =>
                zip = new JSZip()
                fn = (list) =>
                    return r zip if list.length is 0
                    f = (list.splice 0, 1)[0].path.asFileHandle()
                    return fn list if f.type is "dir"
                    f.read("binary").then (d) =>
                        zip.file f.basename, d, { binary: true }
                        @notify __("add {0} to zip", f.basename)
                        fn list
                    .catch (ex) -> e ex
                fn files
        .then (zip) =>
            zip.generateAsync({ type: "base64" }).then (data) =>
                "#{meta.root}/build/release/#{meta.name}.zip"
                    .asFileHandle()
                    .setCache('data:application/zip;base64,' + data)
                    .write("base64").then (r) =>
                        return @error __("Cannot save the zip file: {0}", r.error) if r.error
                        @notify __("Package is generated in release folder")
                    .catch (e) => @error e.toString()
        .catch (e) => @error e.toString()