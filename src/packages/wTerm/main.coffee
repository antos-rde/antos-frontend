class wTerm extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "wTerm", args
    
    main: () ->
        me = @
        @scheme.set "apptitle", "Terminal"
        @mterm = @find "myterm"
        @term = new Terminal { cursorBlink: true }
        @term.on "key", (d, e) ->
            me.socket.send "i#{d}" if me.socket
        @term.on 'title', () -> console.log "title change"
        @term.open @mterm
        @socket = null
        #@on "resize", () -> me.resizeContent()
        @on "focus", () -> me.term.focus()
        # handle the paste event
        area = ($ ".xterm-helper-textarea", @mterm)[0]
        area.onpaste = (e) ->
            #ifreturn false unless @socket
            pastedText = undefined
            if window.clipboardData and window.clipboardData.getData  #IE
                pastedText = window.clipboardData.getData 'Text'
            else if e.clipboardData and e.clipboardData.getData
                pastedText = e.clipboardData.getData 'text/plain'
            return false unless pastedText
            # send by chunk, to ease the handle on server side
            len = pastedText.length
            chunklen = len / 1000 + if (len % 1000 == 0) then 0 else 1
            for i in [0..(len - 1)]
                end = if (i + 1) * 1000 > len then len else (i + 1) * 1000
                me.term.write pastedText.substring i * 1000, end
        #self.socket.send("i"+ substr.replace(/\n/g,"\r\n"))
        # make desktop menu if not exist
        @systemsetting.desktop.menu[@name] = { text: "Open terminal", app: "wTerm" } unless @systemsetting.desktop.menu[@name]
        @openSession()
        @on "hboxchange", (e) -> me.resizeContent e.w, e.h

    resizeContent: (w, h) ->
        ex = @term.rowContainer.firstElementChild
        oldhtml = ($ ex).html()
        ($ ex).css "display", "inline"
        ($ ex).html "W"
        ncol = parseInt (w / ($ ex).width())
        nrow = parseInt (h / ($ ex).height())
        ($ ex).css "display", ""
        ($ ex).html oldhtml
        @term.resize ncol, nrow
        return if not @socket or (@socket.readyState isnt @socket.OPEN)
        #initialGeometry = @.term.proposeGeometry()
        #cols = initialGeometry.cols
        #rows = initialGeometry.rows
        #console.log "send", "s#{ncol}:#{nrow}"
        @socket.send "s#{ncol}:#{nrow}"

    openSession: () ->
        me = @
        @term.clear()
        @term.focus()
        @socket = new WebSocket "ws://" + @_api.HOST + "/wterm"
        @socket.onopen = () ->
            #el.style.display = "none"
            me.resizeContent (($ me.mterm).width()) ,  (($ me.mterm).height())
            me.term.focus()

        @socket.onmessage =  (e) -> me.term.write e.data if me.term and e.data
        @socket.onclose = () ->
            me.socket = null
            me.quit()
            console.log "socket closed"
            #el.style.display = "block"
    cleanup: (e)->
        @socket.close() if @socket
this.OS.register "wTerm", wTerm