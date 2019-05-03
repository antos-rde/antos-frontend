class RemoteRunExtension extends BaseExtension
    constructor: () ->
        super "RemoteRunExtension"

     init: () ->
        @_gui.htmlToScheme RemoteRunExtension.scheme, @, @host

    main: () ->
        me = @
        @output = @find "output"
        (@find "log-clear").set "onbtclick", (e) ->
            me.log "clean"
        (@find "restart").set "onbtclick", (e) ->
            me.run()
        @socket = null
        # Now run the file
        @run()
    
    log: (t, m) ->
        return $(@output).empty() if t is "clean"
        p = ($ "<p>").attr("class", t.toLowerCase())[0]
        $(p).html "#{t}: #{m.__()}"
        ($ @output).append p
        ($ @output).scrollTop @output.scrollHeight

    run: () ->
        me = @
        return @log "ERROR", __("No target file found") unless @data
        @gateway = @gw()
        return @log "ERROR", __("No backend found for file: {0}", @data.path) unless @gateway
        $((@find "stat")).html(@data.path)
        @socket.close() if @socket
        proto = if window.location.protocol is "https:" then "wss://" else "ws://"
        @socket = new WebSocket proto + @_api.HOST + @gateway
        @socket.onopen = () ->
            #send data to server
            me.socket.send( JSON.stringify {path:me.data.path} )

        @socket.onmessage =  (e) -> me.log "INFO", e.data if  e.data
        @socket.onclose = () ->
            me.socket = null
            console.log "socket closed"

    gw: () ->
        return unless @data
        for k,v of RemoteRunExtension.backends
            if @data.info.mime.match (new RegExp k, "g") then return v
        return null

    cleanup: (e)->
        @socket.close() if @socket

RemoteRunExtension.backends = {
    "text/lua": "/system/apigateway?ws=1"
}

RemoteRunExtension.scheme = """
<afx-app-window apptitle="RemoteRun Ouput" width="300" height="450" data-id="win-remote-run">
    <afx-vbox >
        <afx-hbox data-height="20" data-id="bottom-vbox">
            <afx-button data-id = "restart" data-width="25" iconclass="fa fa-repeat"></afx-button>
            <afx-button data-id = "log-clear" data-width="25" iconclass="fa fa-trash"></afx-button>
            <div data-id="stat"></div>
        </afx-hbox>
        <div data-id="output"></div>
    </afx-vbox>
</afx-app-window>
"""