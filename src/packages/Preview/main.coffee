class Preview extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Preview", args
    
    main: () ->
        me = @
        @currfile = @args[0].asFileHandler() if @args and @args.length > 0
        @view = @find "view"
        @status = @find "status"
        PDFJS.workerSrc = @_api.handler.get + "/#{@path()}/pdf.worker.js"
        @binKey "ALT-O", () -> me.actionFile "#{@name}-Open"
        @binKey "CTRL-O", () -> me.actionFile "#{@name}-Close"
        @open @currfile

    
    open: (file) ->
        me = @
        return unless file
        @currfile = file unless @currfile is file
        file.onready () ->
            file.info.size = (file.info.size / 1024).toFixed(2)
            me.renderFile file
        , (err) ->
            me.error "File not found #{file.path}"
    
    renderFile: (file) ->
        mime = file.info.mime
        return unless mime
        if mime.match /^[^\/]+\/.*pdf.*/g
            @renderPDF file
        else if mime.match /image\/.*/g
            @renderImage file
        else
            @notify "Mime type #{file.info.mime} is not support"

    setStatus: (t) ->
        ($ @status).html t

    renderPDF: (file) ->
        me = @
        status = "#{file.info.name} (#{file.info.size} Kb)"
        ($ me.view).empty()
        file.read (d) ->
            q = me._api.mid()
            me._api.loading q, "RENDERING"
            PDFJS.getDocument { data: d }
            #PDFJS.getDocument(url)
            .then (pdf) ->
                fn = (p) ->
                    if p > pdf.numPages
                        me.setStatus "#{status} - loaded"
                        return me._api.loaded q, "OK"
                    pdf.getPage(p).then (page) ->
                        scale = 1.5
                        viewport = page.getViewport scale
                        div = ($ "<div/>").attr("id", "page-" + (page.pageIndex + 1))
                        ($ me.view).append div
                        canvas = ($ "<canvas/>")[0]
                        div.append canvas
                        context = canvas.getContext '2d'
                        canvas.height = viewport.height
                        canvas.width = viewport.width
                        renderContext =
                            canvasContext: context
                            viewport: viewport
                        page.render renderContext
                        me.setStatus "#{status} - #{p}/#{pdf.numPages} loaded"
                        fn(p+1)
                fn(1)
            .catch (err) ->
                me.error "Cannot render the PDF file"
                me._api.loaded q, "FAIL"
        , "binary"

    renderImage: (file) ->
        me = @
        ($ @view).attr("class", "image").empty()

        file.read (d) ->
            blob = new Blob [d], { type: file.mime }
            img = new Image()
            img.src = URL.createObjectURL blob
            canvas = ($ "<canvas/>")[0]
            ($ me.view).append canvas

            #($ me.view).append img
            img.onload = () ->
                context = canvas.getContext '2d'
                canvas.height = img.height
                canvas.width = img.width
                console.log canvas.width, canvas.height
                context.drawImage img, 0, 0
                me.setStatus "#{file.info.name} (#{file.info.size} Kb) - #{img.width}x#{img.height}"
        , "binary"

    menu: () ->
        me = @
        menu = [{
                text: "File",
                child: [
                    { text: "Open", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "Close", dataid: "#{@name}-Close", shortcut: "C-X" },
                ],
                onmenuselect: (e) -> me.actionFile e.item.data.dataid
            }]
        menu
    
    actionFile: (e) ->
        me = @
        switch e
            when "#{@name}-Open"
                @openDialog "FileDiaLog", ( d, f ) ->
                    me.open "#{d}/#{f}".asFileHandler()
                , "Open file", { mimes: me.meta().mimes }
             when "#{@name}-Close"
                @quit()

this.OS.register "Preview", Preview