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

class Preview extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "Preview", args
    
    main: () ->
        me = @
        @currfile = @args[0].asFileHandler() if @args and @args.length > 0
        @view = @find "view"
        @status = @find "status"
        PDFJS.workerSrc = @_api.handler.get + "/#{@path()}/pdf.worker.js"
        @bindKey "ALT-O", () -> me.actionFile "#{me.name}-Open"
        @bindKey "CTRL-X", () -> me.actionFile "#{me.name}-Close"
        @open @currfile

    
    open: (file) ->
        me = @
        return unless file
        @currfile = file unless @currfile is file
        file.onready () ->
            file.info.size = (file.info.size / 1024).toFixed(2)
            me.renderFile file
        , (err) ->
            me.error __("File not found {0}", file.path)
    
    renderFile: (file) ->
        mime = file.info.mime
        return unless mime
        if mime.match /^[^\/]+\/.*pdf.*/g
            @renderPDF file
        else if mime.match /image\/.*svg.*/g
            @renderSVG file
        else if mime.match /image\/.*/g
            @renderImage file
        else
            @notify __("Mime type {0} is not supported", file.info.mime)

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
                me.error __("Cannot render the PDF file")
                me._api.loaded q, "FAIL"
        , "binary"

    renderSVG: (file) ->
        me = @
        ($ @view).attr("class", "image").empty()
        file.read (d) ->
            #console.log d
            me.view.innerHTML = d

    renderImage: (file) ->
        me = @
        ($ @view).attr("class", "image").empty()

        file.read (d) ->
            img = new Image()
            canvas = ($ "<canvas/>")[0]
            ($ me.view).append canvas

            #($ me.view).append img
            img.onload = () ->
                context = canvas.getContext '2d'
                canvas.height = img.height
                canvas.width = img.width
                #console.log canvas.width, canvas.height
                context.drawImage img, 0, 0
                me.setStatus "#{file.info.name} (#{file.info.size} Kb) - #{img.width}x#{img.height}"
            
            blob = new Blob [d], { type: file.info.mime }
            img.src = URL.createObjectURL blob
        , "binary"

    menu: () ->
        me = @
        menu = [{
                text: "__(File)",
                child: [
                    { text: "__(Open)", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "__(Close)", dataid: "#{@name}-Close", shortcut: "C-X" },
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
                , __("Open file"), { mimes: me.meta().mimes }
             when "#{@name}-Close"
                @quit()

this.OS.register "Preview", Preview