class CodePad.BaseExtension

    constructor: (@app) ->

    preload: () ->
        Ant.OS.API.require @dependencies()

    import: (lib) ->
        Ant.OS.API.requires lib

    basedir: () ->
        "#{@app.meta().path}/extensions"

    notify: (m) ->
        @app.notify m
    
    error: (m) ->
        @app.error m

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

    mkar: (src, dest) ->
        @notify __("Preparing for release")
        new Promise (resolve, reject) =>
            new Promise (r, e) =>
                @import("os://scripts/jszip.min.js").then () ->
                    src.asFileHandle()
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
                    dest.asFileHandle()
                    .setCache('data:application/zip;base64,' + data)
                    .write("base64").then (r) =>
                        return reject r.error if r.error
                        @notify __("Package is generated in release folder")
                    .catch (e) -> reject e
            .catch (e) -> reject e
    
    mkdirAll: (list) ->
        new Promise (resolve, reject) =>
            return resolve() if list.length is 0
            path = (list.splice 0, 1)[0].asFileHandle()
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
            "#{@basedir()}/#{item[0]}"
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