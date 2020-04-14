class FloatListTag extends ListViewTag
    constructor: (r, o) ->
        super r, o
        me = @
        @root.refresh = () ->
            me.refresh()
    
    # disable some uneccessary functions
    __dropdown__: (v) ->
        @set "dropdown", false if v
    __buttons__: (v) ->
    showlist: (e) ->
    dropoff: (e) ->
    calibrate: (e) ->
        @refresh()
    mount: () ->
        @refresh()

    refresh: () ->


    layout: () ->
        [{
            el: "div", ref: "mlist"
        }]