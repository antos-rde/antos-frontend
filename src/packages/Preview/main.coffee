class Preview extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Preview", args
    
    main: () ->
        me = @
        url = "https://os.localhost:9195/test.pdf"
        @view = @find "view"
        PDFJS.workerSrc = @_api.handler.get + "/#{@path()}/pdf.worker.js"
        #PDFJS.workerSrc = "packages/Preview/pdf.worker.js"
        #PDFJS.disableWorker = true
        console.log PDFJS.workerSrc
        PDFJS.getDocument(url)
        .then (pdf) ->
            fn = (p) ->
                return if p > pdf.numPages
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
                    fn(p+1)
            fn(1)


this.OS.register "Preview", Preview