class NotePad extends this.OS.GUI.BaseApplication
    constructor: () ->
        super "NotePad"
    event: () ->
        console.log @scheme
        @on "btclick", (e)->
            alert "Happy pola"
        @on "resize", (w,h)->
            console.log "resize"
this.OS.register "NotePad",NotePad