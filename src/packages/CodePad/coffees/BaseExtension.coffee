class CodePad.BaseExtension

    constructor: (@app) ->

    preload: () ->
        Ant.OS.API.require @dependencies()

    import: (libs) ->
        Ant.OS.API.require libs

    basedir: () ->
        "#{@app.meta().path}/extensions"

    notify: (m) ->
        @app.notify m
    
    error: (m, e) ->
        @app.error m, e

    dependencies: () ->
        []

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
                        .catch (e) -> reject __e e
                .catch (e) -> reject __e e
    
    copy: (files, to) ->
        new Promise (resolve, reject) =>
            return resolve() if files.length is 0
            file = (files.splice 0, 1)[0].asFileHandle()
            tof = "#{to}/#{file.basename}".asFileHandle()
            file.onready().then (meta) =>
                if meta.type is "dir"
                    # copy directory
                    desdir = to.asFileHandle()
                    desdir.mk(file.basename).then () =>
                        # read the dir content
                        file.read().then (data) =>
                            list = (v.path for v in data.result)
                            @copy list, "#{desdir.path}/#{file.basename}"
                                .then () =>
                                    @copy files, to
                                        .then () -> resolve()
                                        .catch (e) -> reject __e e
                                .catch (e) ->
                                    reject __e e
                        .catch (e) -> reject __e e
                    .catch (e) ->
                        reject __e e
                else
                    # copy file
                    file.read("binary")
                        .then (data) =>
                            tof.setCache(new Blob [data], { type: file.info.mime })
                                .write(file.info.mime)
                                .then (d) =>
                                    @copy files, to
                                        .then () -> resolve()
                                        .catch (e) -> reject __e e
                        .catch (e) -> reject __e e
            .catch (e) ->
                reject __e e

    aradd: (list, zip, base) ->
        new Promise (resolve, reject) =>
            return resolve(zip) if list.length is 0
            path = (list.splice 0, 1)[0]
            file = path.asFileHandle()
            file.onready().then (meta) =>
                if meta.type is "dir"
                    file.read().then (d) =>
                        l = (v.path for v in d.result)
                        @aradd l, zip, "#{base}#{file.basename}/"
                            .then () =>
                                @aradd list, zip, base
                                    .then () -> resolve(zip)
                                    .catch (e) -> reject __e e
                            .catch (e) -> reject __e e
                    .catch (e) -> reject __e e
                else
                    file.read("binary").then (d) =>
                        zpath = "#{base}#{file.basename}".replace(/^\/+|\/+$/g, '')
                        zip.file zpath, d, { binary: true }
                        @aradd list, zip, base
                            .then () -> resolve(zip)
                            .catch (e) -> reject __e e
                    .catch (e) -> reject __e e
            .catch (e) -> reject __e e

    mkar: (src, dest) ->
        @notify __("Preparing for release")
        new Promise (resolve, reject) =>
            new Promise (r, e) =>
                @import(["os://scripts/jszip.min.js"]).then () ->
                    src.asFileHandle()
                    .read().then (d) ->
                        r d.result
                    .catch (ex) -> e __e ex
                .catch (ex) -> e __e ex
            .then (files) =>
                new Promise (r, e) =>
                    zip = new JSZip()
                    @aradd (v.path for v in files), zip, "/"
                        .then (z) -> r(z)
                        .catch (ex) -> e __e ex
            .then (zip) =>
                zip.generateAsync({ type: "base64" }).then (data) =>
                    dest.asFileHandle()
                    .setCache('data:application/zip;base64,' + data)
                    .write("base64").then (r) =>
                        @notify __("Archive is generated at: {0}", dest)
                    .catch (e) -> reject __e e
            .catch (e) -> reject __e e
    
    mkdirAll: (list) ->
        new Promise (resolve, reject) =>
            return resolve() if list.length is 0
            path = (list.splice 0, 1)[0].asFileHandle()
            path.parent().mk path.basename
                .then (d) =>
                    @app.trigger "filechange", { file: path.parent(), type: "dir" }
                    @mkdirAll list
                        .then () -> resolve()
                        .catch (e) -> reject __e e
                .catch (e) -> reject __e e
    
    mkfileAll: (list, path, name) ->
        new Promise (resolve, reject) =>
            return resolve() if list.length is 0
            item = (list.splice 0, 1)[0]
            "#{@basedir()}/#{item[0]}"
                .asFileHandle()
                .read()
                .then (data) =>
                    file = item[1].asFileHandle()
                    file
                        .setCache(data.format name, "#{path}/#{name}")
                        .write "text/plain"
                        .then () =>
                            @app.trigger "filechange", { file: file, type: "file" }
                            @mkfileAll list, path, name
                                .then () -> resolve()
                                .catch (e) -> reject __e e
                        .catch (e) -> reject __e e
                .catch (e) -> reject __e e

    metadata: (file) ->
        new Promise (resolve, reject) =>
            if not @app.currdir
                return reject @app._api.throwe __("Current folder is not found")
            "#{@app.currdir.path}/#{file}"
                .asFileHandle()
                .read("json")
                .then (data) ->
                    resolve data
                .catch (e) =>
                    reject @app._api.throwe __("Unable to read meta-data")

CodePad.extensions = {}