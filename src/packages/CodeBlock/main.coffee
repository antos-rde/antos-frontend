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
class CodeBlock extends this.OS.GUI.BaseApplication
    constructor: (args) ->
        super "CodeBlock", args
    
    main: () ->
        me = @
        @scheme.set "apptitle", "CodeBlock"
        @btnact = @find "btn-action"
        @container = @find "ws"

        #file = "#{@path()}/toolbox.xml".asFileHandler()
        #console.log file
        #file.read (d) ->
            # return me.error "Cannot load the toolbox" if d.error
            #console.log d
            #toolbox = $.parseHTML d
            #me.scheme.append toolbox

        me.workspace = Blockly.inject me.container,
        {
            grid:
                spacing: 25
                length: 3
                colour: '#ccc'
                snap: true
            zoom:
                controls: true
                wheel: true
            toolbox: @find "blockly_toolbox"
        }
      
        #if(Blockly.RpiControl)
        #  this.workspace.registerToolboxCategoryCallback('EXTRAS', function(workspace)
        #  {
        #    var xmlList = [];
        #    for (var i = 0; i < Blockly.RpiControl.length; i++) {
        #      var el = Blockly.RpiControl[i];
        #      if (Blockly.Blocks[el]) {
        #          var blockText = '<xml><block type="'+el+'"></block></xml>';
        #          var block = Blockly.Xml.textToDom(blockText).firstChild;
        #          xmlList.push(block);
        #      }
        #  }
        #  return xmlList;
        #});

        @blen = 1024
        #@btnact.set "onbtclick", (e) ->
            #me.openSession()
        #    code = Blockly.JavaScript.workspaceToCode me.workspace
        #    console.log code
        @on "resize", () ->
            Blockly.svgResize me.workspace
        @bindKey "ALT-N", () -> me.actionFile "#{me.name}-New"
        @bindKey "ALT-O", () -> me.actionFile "#{me.name}-Open"
        @bindKey "CTRL-S", () -> me.actionFile "#{me.name}-Save"
        @bindKey "ALT-W", () -> me.actionFile "#{me.name}-Saveas"

    menu: () ->
        me = @
        menu = [{
                text: "File",
                child: [
                    { text: __("New"), dataid: "#{@name}-New", shortcut: "A-N" },
                    { text: "__(Open)", dataid: "#{@name}-Open", shortcut: "A-O" },
                    { text: "__(Save)", dataid: "#{@name}-Save", shortcut: "C-S" },
                    { text: "__(Save as)", dataid: "#{@name}-Saveas", shortcut: "A-W" }
                ],
                onmenuselect: (e) -> me.actionFile e.item.data.dataid
            }]
        menu
    
    actionFile: (n) ->
        console.log n
    openSession: () ->
        me = @
        proto = if window.location.protocol is "https:" then "wss://" else "ws://"
        @socket = new WebSocket proto + @_api.HOST + "/ws/filestream.lua"
        @socket.binaryType = "arraybuffer"
        @socket.onopen = () ->
            console.log "socket open"
            enc = new TextEncoder "utf-8"
            me.socket.send enc.encode me.blen + "os://packages/packages.json"

        @socket.onmessage =  (e) ->
            console.log e.data
            console.log  new TextDecoder("utf-8").decode new Uint8Array e.data
            me.socket.close() if e.data.byteLength < me.blen

        @socket.onclose = () ->
            me.socket = null
            console.log "socket closed"
        
        

    cleanup: (e) ->
        @socket.close() if @socket

CodeBlock.singleton = true
this.OS.register "CodeBlock", CodeBlock