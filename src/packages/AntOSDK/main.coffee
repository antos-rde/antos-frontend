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

class AntOSDK extends this.OS.GUI.BaseApplication
    constructor: ( args ) ->
        super "AntOSDK", args
        @prjfile = if @args and @args.length > 0 then @args[0].asFileHandler() else null
    loadScheme: () ->
        path = "#{@meta().path}/" + if @prjfile then "scheme.html" else "welcome.html"
        @render path
    main: () ->
        me = @
        @scheme.set "apptitle", "AntOSDK"
        @output = @find "output"
        if not @prjfile
            (@find "btnnewprj").set "onbtclick", () ->
                me.newProject (path) ->
                    me.prjfile = "#{path}/project.apj".asFileHandler()
                    me.init()
            (@find "btnopenprj").set "onbtclick", () ->
                me.actionProject "#{me.name}-Open"
            return
        @initWorkspace()

    initWorkspace: () ->
        me = @
        @dirty = true
        @fileview = @find "fileview"
        div = @find "datarea"
        @currfile = "Untitled".asFileHandler()
        ace.require "ace/ext/language_tools"

        @prjfile.dirty = false
        @.editor = ace.edit div
        @.editor.setOptions {
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            fontSize: "13px"
        }
        @.editor.completers.push { getCompletions: ( editor, session, pos, prefix, callback ) -> }
        @.editor.getSession().setUseWrapMode true

        @fileview.contextmenuHandler = (e, m) ->
            m.set "items", me.contextMenu()
            m.set "onmenuselect", (evt) ->
                me.contextAction evt
            m.show e

        @mlist = @find "modelist"
        @modes = ace.require "ace/ext/modelist"
        ldata = []
        f = (m, i) ->
            ldata.push {
                text: m.name,
                mode: m.mode,
                selected: if m.mode is 'ace/mode/text' then true else false
            }
            m.idx = i
        f(m, i) for m, i in @modes.modes
        @mlist.set "items", ldata
        @mlist.set "onlistselect", (e) ->
            me.editor.session.setMode e.data.mode

        themelist = @find "themelist"
        themes = ace.require "ace/ext/themelist"
        ldata = []
        ldata.push {
            text: m.caption,
            mode: m.theme,
            selected: if m.theme is "ace/theme/monokai" then true else false
        } for k, m of themes.themesByName
        themelist.set "onlistselect", (e) ->
            me.editor.setTheme e.data.mode
        themelist.set "items", ldata

        statbar = @find "editorstat"
        #status
        stup = (e) ->
            c = me.editor.session.selection.getCursor()
            l = me.editor.session.getLength()
            statbar.set "text", __("Row {0}, col {1}, lines: {2}", c.row, c.column, l)
        stup(0)
        @.editor.getSession().selection.on "changeCursor", (e) -> stup(e)
        @editormux = false
        @editor.on "input", () ->
            if me.editormux
                me.editormux = false
                return false
            if not me.currfile.dirty
                me.currfile.dirty = true
                me.currfile.text += "*"
                me.tabarea.update()

        @on "resize", () -> me.editor.resize()
        @on "vboxchange", () -> me.editor.resize()
        @on "focus", () -> me.editor.focus()

        @fileview.set "fetch", (e, f) ->
            return unless e.child
            return if e.child.filename is "[..]"
            e.child.path.asFileHandler().read (d) ->
                return me.error __("Resource not found {0}", e.child.path) if d.error
                f d.result
        @fileview.set "onfileopen", (e) ->
            return if e.type is "dir"
            me.open e.path.asFileHandler()
        @subscribe "VFS", (d) ->
            p = (me.fileview.get "path").asFileHandler()
            me.chdir p.path if  d.data.file.hash()  is p.hash() or d.data.file.parent().hash() is p.hash()

        @tabarea = @find "tabarea"
        @tabarea.set "ontabselect", (e) ->
            me.selecteTab e.idx
        @tabarea.set "onitemclose", (e) ->
            it = e.item.item
            return false unless it
            return me.closeTab it unless it.dirty
            me.openDialog "YesNoDialog", (d) ->
                return me.closeTab it if d
                me.editor.focus()
            , __("Close tab"), { text: __("Close without saving ?") }
            return false
        (@find "log-clear").set "onbtclick", (e) ->
            ($ me.output).empty()
        #@tabarea.set "closable", true
        @bindKey "ALT-N", () -> me.actionFile "#{me.name}-New"
        @bindKey "ALT-O", () -> me.actionFile "#{me.name}-Open"
        @bindKey "CTRL-S", () -> me.actionFile "#{me.name}-Save"
        @bindKey "ALT-W", () -> me.actionFile "#{me.name}-Saveas"
        @bindKey "CTRL-R", () -> me.bnR()
        @bindKey "ALT-C", () -> me.actionBuild "#{me.name}-Build"
        @bindKey "ALT-P", () -> me.buildAndRelease()
        @bindKey "ALT-Y", () ->
            me.actionBuild "#{me.name}-Options"
        @openProject @prjfile if @prjfile
        @trigger "calibrate"

    newProject: (f) ->
        me = @
        @openDialog "FileDiaLog", (d, n, p) ->
            rpath = "#{d}/#{n}"
            # create folder
            # create javascripts dir
            # create css dir
            # create coffees dir
            # create asset dir
            dirs = [
                rpath,
                "#{rpath}/build",
                "#{rpath}/build/release",
                "#{rpath}/build/debug",
                "#{rpath}/javascripts",
                "#{rpath}/css",
                "#{rpath}/coffees",
                "#{rpath}/assets"
            ]
            fn = (list, f1) ->
                return f1() if list.length is 0
                dir = (list.splice 0, 1)[0].asFileHandler()
                name = dir.basename
                dir = dir.parent().asFileHandler()
                dir.mk name, (r) ->
                    return me.error __("Error when create directory: {0}", r.error) if r.error
                    me.log "INFO", __("Created directory: {0}", dir.path + "/" + name)
                    #console.log "created", dir.path + "/" + name
                    fn list, f1
            
            fn dirs, () ->
                # create package.json
                # create README.md
                # create project.apj
                # create coffees/main.coffee
                # create shemes/scheme.html
                files =  [
                    {
                        path: "#{rpath}/package.json",
                        content: """
                            {
                                "app":"#{n}",
                                "name":"#{n}",
                                "description":"",
                                "info":{
                                    "author": "",
                                    "email": ""
                                },
                                "version":"0.0.1-a",
                                "category":"Other",
                                "iconclass":"fa fa-adn",
                                "mimes":["none"]
                            }"""
                    },
                    {
                        path: "#{rpath}/README.md",
                        content: """
                        # #{n}
                        This is an example project, generated by AntOS Development Kit

                        ## Howto

                        1. Open the project.apj file with AntOSDK (simply double Click on it)
                        2. Modify the UI in *assets/scheme.html*
                        3. Modify application code in *coffees/main.coffee*
                        4. Modify CSS style in *css/main.css*
                        5. Other files need to be copied: put in to assets

                        ## Set up build target

                        Click **Menu> Build > Build Option** or simply hit **ALT-Y**

                        In the build options dialog, add or remove files that need to be
                        included into the build

                        Click **Save**

                        ## Build application
                        * To build: **Menu > Build > Build** or **ALT-C**
                        * To build and run: **Menu > Build > Build and Run** or **CTRL-R**
                        * To release: **Menu > Build > Build release** or **ALT-P**
                        """
                    },
                    {
                        path: "#{rpath}/project.apj",
                        content: """
                        {
                            "name": "#{n}",
                            "root": "#{d}/#{n}",
                            "css": [],
                            "javascripts": [],
                            "coffees": ["coffees/main.coffee"],
                            "copies": ["assets/scheme.html", "package.json", "README.md"]
                        }
                        """
                    },
                    {
                        path: "#{rpath}/coffees/main.coffee",
                        content: """
                        class #{n} extends this.OS.GUI.BaseApplication
                            constructor: ( args ) ->
                                super "#{n}", args
                            
                            main: () ->
                        
                        this.OS.register "#{n}", #{n}
                        """
                    },
                    {
                        path: "#{rpath}/assets/scheme.html",
                        content: """
                        <afx-app-window apptitle="" width="600" height="500" data-id="#{n}">
                            <afx-hbox ></afx-hbox>
                        </afx-app-window>
                        """
                    }
                ]
                fn1 = (list, f2) ->
                    return f2(rpath) if list.length is 0
                    entry  = (list.splice 0, 1)[0]
                    file = entry.path.asFileHandler()
                    file.cache = entry.content
                    file.write "text/plain", (res) ->
                        return me.error __("Cannot create file: {0}", res.error) if res.error
                        me.log "INFO", __("Created file: {0}", file.path)
                        fn1 list, f2
                fn1 files, f
        , "__(New Project at)", { file: { basename: __("ProjectName") } }

    openProject: (file) ->
        me = @
        me.prjfile = file
        if(me.tabarea)
            file.read (d) ->
                me.log "INFO", __("Opening {0}", me.prjfile.path)
                me.tabarea.set "selected", -1
                me.tabarea.set "items", []
                me.currfile = "#{d.root}/README.md".asFileHandler()
                me.currfile.dirty = false
                me.chdir d.root if d.root
                me.prjfile.cache = d
                me.log "INFO", __("Opening {0}", me.currfile.path)
                me.open me.currfile
            ,"json"
        else
            me.init()

    open: (file) ->
        #find table
        i = @findTabByFile file
        return @tabarea.set "selected", i if i isnt -1
        return @newtab file if file.path.toString() is "Untitled"
        me = @
        file.read (d) ->
            file.cache = d or ""
            me.newtab file

    contextMenu: () ->
        [
            { text: __("New file"), dataid: "#{@name}-mkf" },
            { text: __("New folder"), dataid: "#{@name}-mkd" },
            { text: __("Delete"), dataid: "#{@name}-rm" }
            { text: __("Refresh"), dataid: "#{@name}-refresh" }
        ]

    contextAction: (e) ->
        me = @
        file = @fileview.get "selectedFile"
        dir = if file then file.path.asFileHandler() else (@fileview.get "path").asFileHandler()
        dir = dir.parent().asFileHandler() if file and file.type isnt "dir"
        switch e.item.data.dataid

            when "#{@name}-mkd"
                @openDialog "PromptDialog",
                    (d) ->
                        dir.mk d, (r) ->
                             me.error __("Fail to create {0}: {1}", d, r.error) if r.error
                    , "__(New folder)"
            
            when "#{@name}-mkf"
                @openDialog "PromptDialog",
                    (d) ->
                        fp = "#{dir.path}/#{d}".asFileHandler()
                        fp.write "", (r) ->
                            me.error __("Fail to create {0}: {1}", d, r.error) if r.error
                    , "__(New file)"
            when "#{@name}-rm"
                return unless file
                @openDialog "YesNoDialog",
                    (d) ->
                        return unless d
                        file.path.asFileHandler()
                            .remove (r) ->
                                me.error __("Fail to delete {0}: {1}", file.filename, r.error) if r.error
                , "__(Delete)" ,
                { iconclass: "fa fa-question-circle", text: __("Do you really want to delete: {0}?", file.filename) }
            when "#{@name}-refresh"
                @.chdir ( @fileview.get "path" )

    save: (file) ->
        me = @
        file.write "text/plain", (d) ->
            return me.error __("Error saving file {0}", file.basename) if d.error
            me.dirty = true
            file.dirty = false
            file.text = file.basename
            me.tabarea.update()

    findTabByFile: (file) ->
        lst = @tabarea.get "items"
        its = ( i for d, i in lst when d.hash() is file.hash() )
        return -1 if its.length is 0
        return its[0]

    closeTab: (it) ->
        @tabarea.remove it, false
        cnt = @tabarea.get "count"
        if cnt is 0
            @open "Untitled".asFileHandler()
            return false
        @tabarea.set "selected", cnt - 1
        return false

    newtab: (file) ->
        file.text = if file.basename then file.basename else file.path
        file.cache = "" unless file.cache
        file.um = new ace.UndoManager()
        @currfile.selected = false
        file.selected = true
        #console.log cnt
        @tabarea.push file, true
        #@currfile = @file
        #TODO: fix problem : @tabarea.set "selected", cnt

    selecteTab: (i) ->
        #return if i is @tabarea.get "selidx"
        file = (@tabarea.get "items")[i]
        return unless file
        @fileview.set "preventUpdate", true
        @scheme.set "apptitle", file.text.toString()
        #return if file is @currfile
        if @currfile isnt file
            @currfile.cache = @editor.getValue()
            @currfile.cursor = @editor.selection.getCursor()
            @currfile = file
        m = "ace/mode/text"
        m = (@modes.getModeForPath file.path) if file.path.toString() isnt "Untitled"
        @mlist.set "selected", m.idx
        
        @editormux = true
        @editor.setValue file.cache, -1
        @editor.session.setMode m.mode
        @editor.session.setUndoManager file.um
        if file.cursor
            @editor.renderer.scrollCursorIntoView { row: file.cursor.row, column: file.cursor.column }, 0.5
            @editor.selection.moveTo file.cursor.row, file.cursor.column
        @editor.focus()

    chdir: (pth) ->
        #console.log "called", @_api.throwe("FCK")
        return unless pth
        me = @
        dir = pth.asFileHandler()
        dir.read (d) ->
            if(d.error)
                return me.error __("Resource not found {0}", p)
            if not dir.isRoot()
                p = dir.parent().asFileHandler()
                p.filename = "[..]"
                p.type = "dir"
                #p.size = 0
                d.result.unshift p
            ($ me.navinput).val dir.path
            me.fileview.set "path", pth
            me.fileview.set "data", d.result

    menu: () ->
        me = @
        menu = [
            {
                text: "__(Project)",
                child: [
                    { text: "__(New)", dataid: "#{@name}-New", },
                    { text: "__(Open)", dataid: "#{@name}-Open" },
                    { text: "__(Save)", dataid: "#{@name}-Save" }
                ],
                onmenuselect: (e) -> me.actionProject e.item.data.dataid
            },
            {
                text: "__(File)",
                child: [
                    { text: "__(New)", dataid: "#{@name}-New", shortcut: "A-N" },
                    { text: "__(Open)", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "__(Save)", dataid: "#{@name}-Save", shortcut: "C-S" },
                    { text: "__(Save as)", dataid: "#{@name}-Saveas", shortcut: "A-W" }
                ],
                onmenuselect: (e) -> me.actionFile e.item.data.dataid
            },
            {
                text: "__(Build)",
                child: [
                    { text: "__(Build and Run)", dataid: "#{@name}-Run", shortcut: "C-R" },
                    { text: "__(Build release)", dataid: "#{@name}-Release", shortcut: "A-P" },
                    { text: "__(Build)", dataid: "#{@name}-Build", shortcut: "A-C" },
                    { text: "__(Build Options)", dataid: "#{@name}-Options", shortcut: "A-Y" }
                ],
                onmenuselect: (e) -> me.actionBuild e.item.data.dataid
            }
        ]
        menu
    
    actionFile: (e) ->
        me = @
        return unless @prjfile
        saveas = () ->
            me.openDialog "FileDiaLog", (d, n) ->
                file = "#{d}/#{n}".asFileHandler()
                file.cache = me.currfile.cache
                file.dirty = me.currfile.dirty
                file.um = me.currfile.um
                file.cursor = me.currfile.cursor
                file.selected = me.currfile.selected
                file.text = me.currfile.text
                me.tabarea.replaceItem me.currfile, file, false
                me.currfile = file
                me.save me.currfile
            , "__(Save as)", { file: me.currfile }
        switch e
            when "#{@name}-Open"
                @openDialog "FileDiaLog", ( d, f ) ->
                    me.open "#{d}/#{f}".asFileHandler()
                , "__(Open file)"
            when "#{@name}-Save"
                @currfile.cache = @editor.getValue()
                return @save @currfile if @currfile.basename
                saveas()
            when "#{@name}-Saveas"
                @currfile.cache = @editor.getValue()
                saveas()
            when "#{@name}-New"
                @open "Untitled".asFileHandler()
    
    actionProject: (e) ->
        me = @
        switch e
            when "#{@name}-Open"
                fn = () ->
                    me.openDialog "FileDiaLog", (d, f, p) ->
                        me.prjfile =  "#{d}/#{f}".asFileHandler()
                        me.log "clean"
                        me.openProject me.prjfile
                    , "__(Open Project)", { mimes: me.meta().mimes }
                return fn() unless @isDirty()
                @ask "__(Unsaved project)", "__(Ignore unsaved project ?)", () ->
                    fn()
            when "#{@name}-New"
                fn = () ->
                    me.log "clean"
                    me.newProject (p) ->
                        me.openProject "#{p}/project.apj".asFileHandler()
                return fn() unless @isDirty()
                @ask "__(Unsaved project)", "__(Ignore unsaved project ?)", () ->
                    fn()
            when "#{@name}-Save"
                return unless @prjfile
                @prjfile.write "object", (r) ->
                    return me.error __("Cannot save project: {0}", r.error) if r.error
                    me.notify __("project saved")
                    me.prjfile.dirty = false


    actionBuild: (e) ->
        me = @
        return unless @prjfile
        switch e
            when "#{@name}-Run" then me.bnR()
            when "#{@name}-Build"
                me.build().then(() ->).catch (ex) ->
                    me.log "ERROR", ex.toString()
            when "#{@name}-Release"
                me.buildAndRelease()
            when "#{@name}-Options"
                me.openDialog new BuildDialog(), (d) ->
                    me.prjfile.cache[k] = v for k, v of d
                    me.prjfile.dirty = true
                    me.dirty = true
                , "__(Add files to build target)"
                    
    isDirty: () ->
        return false unless @tabarea
        dirties = ( v for v in  @tabarea.get "items" when v.dirty )
        return true if dirties.length > 0 or @prjfile.dirty
        return false

    cleanup: (evt) ->
        return unless @currfile
        return unless @isDirty()
        me = @
        evt.preventDefault()
        dirties = ( v for v in  @tabarea.get "items" when v.dirty )
        m =  __("Ignore: {0} unsaved files {1}?", dirties.length, if @prjfile.dirty then "__(and unsaved project)" else "")
        @ask "__(Quit)", m, () ->
            v.dirty = false for v in dirties
            me.prjfile.dirty = false
            me.quit()

    log: (t, m) ->
        return $(@output).empty() if t is "clean"
        p = ($ "<p>").attr("class", t.toLowerCase())[0]
        $(p).html "#{t}: #{m.__()}"
        ($ @output).append p
        ($ @output).scrollTop @output.scrollHeight

    verify: () ->
        me = @
        return new Promise (r, e) ->
            return e me._api.throwe "Project not found" unless me.prjfile.cache
            # perform the verification on each coffee file
            list = ("#{me.prjfile.cache.root}/#{v}" for v in me.prjfile.cache.coffees)
            return r() if list.length is 0
            fn = (l) ->
                return r() if l.length is 0
                f = (l.splice 0, 1)[0].asFileHandler()
                me.log "INFO", __("Verifying {0}", f.path)
                f.read (d) ->
                    try
                        CoffeeScript.nodes d
                        fn l
                    catch ex
                        e ex
            return fn list
    
    cat: (files, t) ->
        me = @
        return new Promise (r, e) ->
            fn = (l) ->
                return r(t) if l.length is 0
                f = (l.splice 0, 1)[0].asFileHandler()
                f.read (d) ->
                    t = t + "\n" + d
                    fn l
            
            return fn files

    copy: (files, to) ->
        me = @
        return new Promise (r, e) ->
            fn = (l) ->
                return r() if l.length is 0
                f = (l.splice 0, 1)[0].asFileHandler()
                tof = "#{to}/#{f.basename}".asFileHandler()
                f.read (d) ->
                    tof.cache = new Blob [d], { type: f.info.mime }
                    tof.write f.info.mime, (res) ->
                        me.log "INFO", __("Copied {0} -> {1}", f.path, to)
                        return e res.error if res.error
                        fn(l)
                , "binary"
            
            return fn files

    compile: () ->
        me = @
        list = ("#{me.prjfile.cache.root}/#{v}" for v in me.prjfile.cache.coffees)
        t = ""
        @verify().then () ->
            me.cat(list, t)
        .then (code) ->
            return new Promise (r, e) ->
                try
                    jsrc = CoffeeScript.compile code
                    me.log "SUCCESS", __("Compiled successful")
                    r jsrc
                catch ex
                    e ex

    build: () ->
        me = @
        @log "clean"
        @compile().then (r) ->
            # cat to the javascript
            list = ("#{me.prjfile.cache.root}/#{v}" for v in me.prjfile.cache.javascripts)
            me.cat(list, r).then (jsrc) ->
                return new Promise (r, e) ->
                    r jsrc
            .then (jsrc) ->
                # write javascript src to file
                return new Promise (r, e) ->
                    fp = "#{me.prjfile.cache.root}/build/debug/main.js".asFileHandler()
                    fp.cache = jsrc
                    fp.write "text/plain", (res) ->
                        return e res.error if res.error
                        me.log "SUCCESS", __("Generated {0}", fp.path)
                        r()
            .then () ->
                # cat the css file
                csslist = ("#{me.prjfile.cache.root}/#{v}" for v in me.prjfile.cache.css)
                csstxt = ""
                me.cat(csslist, csstxt).then (txt) ->
                    return new Promise (r, e) ->
                        return r() if txt is ""
                        fp = "#{me.prjfile.cache.root}/build/debug/main.css".asFileHandler()
                        fp.cache = txt
                        fp.write "text/plain", (d) ->
                            return e d.error if d.error
                            me.log "SUCCESS", __("Generated {0}", fp.path)
                            r()
            .then () ->
                # copy the remain files
                copylist = ("#{me.prjfile.cache.root}/#{v}" for v in me.prjfile.cache.copies)
                me.copy copylist, "#{me.prjfile.cache.root}/build/debug"
            .then () ->
                me.log "SUCCESS", __("Build done")
                me.dirty = false
                return new Promise (r, e) -> r()

    run: () ->
        me = @
        fp = "#{me.prjfile.cache.root}/build/debug/package.json".asFileHandler()
        fp.read (v) ->
            me.log "INFO", __("Metadata found...")
            v.text = v.name
            v.path = "#{me.prjfile.cache.root}/build/debug"
            v.filename = me.prjfile.cache.name
            v.type = "app"
            v.mime = "antos/app"
            v.icon = "#{v.path}/#{v.icon}" if v.icon
            v.iconclass = "fa fa-adn" unless v.iconclass or v.icon
            me.log "INFO", __("Installing...")
            me.systemsetting.system.packages[me.prjfile.cache.name] = v
            # todo: auto matic refresh menu
            me._gui.refreshSystemMenu()
            #me._gui.buildSystemMenu()
            me.log "INFO", __("Running {0}...", me.prjfile.cache.name)
            me._gui.forceLaunch me.prjfile.cache.name
        , "json"
    
    bnR: () ->
        @log "clean"
        return @run() unless @dirty
        me = @
        @build().then () ->
            me.run()
        .catch (ex) ->
            me.log "ERROR", ex.toString()
    
    release: () ->
        me = @
        @log "INFO", __("Preparing for release")
        new Promise (r, e) ->
            me._api.require "jszip.min", () ->
                fp = "#{me.prjfile.cache.root}/build/debug".asFileHandler()
                fp.read (d) ->
                    return e d.error if d.error
                    r d.result
        .then (files) ->
            return new Promise (r, e) ->
                zip = new JSZip()
                fn = (list) ->
                    return r zip if list.length is 0
                    f = (list.splice 0, 1)[0].path.asFileHandler()
                    return fn list if f.type is "dir"
                    f.read (d) ->
                        zip.file f.basename, d, { binary: true }
                        me.log "INFO", __("add {0} to zip", f.basename)
                        fn list
                    , "binary"
                fn files
        .then (zip) ->
            zip.generateAsync({type:"base64"}).then (data) ->
                f = "#{me.prjfile.cache.root}/build/release/#{me.prjfile.cache.name}.zip".asFileHandler()
                f.cache = 'data:application/zip;base64,' + data
                f.write "base64", (r) ->
                    return me.log "ERROR", __("Cannot save the zip file {0} : {1}", f.path, r.error) if r.error
                    me.log "SUCCESS", __("zip file generated in release folder")

    buildAndRelease: () ->
        @log "clean"
        return @release() unless @dirty
        me = @
        @build().then () ->
            me.release()
        .catch (ex) ->
            me.log "ERROR", ex.toString()
AntOSDK.singleton = false
AntOSDK.dependencies = [
    "ace/ace",
    "ace/ext-language_tools",
    "ace/ext-modelist",
    "ace/ext-themelist"
]
this.OS.register "AntOSDK", AntOSDK