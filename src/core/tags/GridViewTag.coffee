class GridCellPrototype extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "class", "afx-grid-cell"
        @setopt "oncellselect", (e) ->
        @setopt "oncelldbclick", (e) ->
        @setopt "data", {}
        @setopt "selected", false
    
    __data__: (v) ->
        return unless v.selected
        @set "selected", v.selected
        delete v.selected
    
    __selected__: (v) ->
        return unless v
        @cellseleck {}, false

    mount: () ->
        me = @
        $(@root).css "display", "block"
        $(@root).click (e) ->
            me.cellseleck e, false
        $(@root).dblclick (e) ->
            me.cellseleck e, true
    

    cellseleck: (e, flag) ->
        e.item = @root
        evt = { id: @aid(), data: e }
        return @get("oncellselect") evt unless flag
        @get("oncelldbclick") evt

    __class__: (v) ->
        $(@root).removeClass().addClass @get("class")

class SimpleGridCell extends GridCellPrototype
    constructor: (r, o) ->
        super r, o
        @setopt "header", false

    __header__: (v) ->


    __data: (d) ->
        @refs.cell.set  k, v for k, v of d

    layout: () ->
        [{
            el: "afx-label", ref: "cell"
        }]

class GridViewTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "header", []
        @setopt "headeritem", "afx-grid-cell"
        @setopt "cellitem", "afx-grid-cell"
        @setopt "selectedCell", undefined
        @setopt "selectedRows", []
        @setopt "selectedRow", undefined
        @setopt "rows", []
        @setopt "oncellselect", (e) ->
        @setopt "onrowselect", (e) ->
        @setopt "oncelldbclick", (e) ->
        @setopt "multiselect", false

    __header__: (v) ->
        return $(@refs.header).hide() if not v or v.length is 0
        $(@refs.header).empty()
        for item in v
            el = $("<#{@get("headeritem")}>").appendTo @refs.header
            el[0].uify undefined
            el[0].set "data", item
            item.domel = el[0]
        @calibrate()

    __rows__: (rows) ->
        me = @
        $(@refs.grid).empty()
        for row in rows
            div = $("<div>")
                .addClass("afx-grid-row")
                .css "display", "contents"
                .appendTo @refs.grid
            for cell in row
                el = $("<#{@get("cellitem")}>").appendTo div
                el[0].uify undefined
                cell.domel = el[0]
                el[0].set "oncellselect", (e) -> me.cellselect e, false
                el[0].set "oncelldbclick", (e) -> me.cellselect e, true
                el[0].set "data", cell

    multiselect: () ->
        @get "multiselect"

    cellselect: (e, flag) ->
        e.id = @aid()
        selectedCell = @get "selectedCell"
        # return if e.data.item is selectedCell and not flag
        selectedCell.set "class", "afx-grid-cell" if selectedCell
        @set "selectedCell", e.data.item
        $(e.data.item).addClass "afx-grid-cell-selected"
        if flag
            @observable.trigger "celldbclick", e
            @get("oncelldbclick") e
        else
            @observable.trigger "cellselect", e
            @get("oncellselect") e
            @rowselect e

    rowselect: (e) ->
        return unless e.data.item
        selectedRow = @get "selectedRow"
        selectedRows = @get "selectedRows"
        evt = { id: @aid(), data: {} }
        div = $(e.data.item).parent()[0]
        if @multiselect()
            if selectedRows.includes div
                selectedRows.splice selectedRows.indexOf(div) , 1
                $(div).removeClass()
            else
                selectedRows.push div
                $(div).removeClass().addClass("afx-grid-row-selected")
            evt.data.items = @get "selectedRows"
        else
            return if selectedRow is div
            $(selectedRow).removeClass()
            @set "selectedRow", div
            @set "selectedRows", [div]
            evt.data.item = div
            evt.data.items = [ div ]
            $(div).removeClass().addClass("afx-grid-row-selected")
        @get("onrowselect") evt
        @observable.trigger "rowselect", evt

    has_header: () ->
        h = @get("header")
        return h and h.length > 0
    calibrate: () ->
        @calibrate_header()
        if @has_header()
            $(@refs.container).css "height", $(@root).height() - $(@refs.header).height() + "px"
        else
            $(@refs.container).css "height", $(@root).height() + "px"

    calibrate_header: () ->
        header = @get "header"
        return  if not header or header.length is 0
        colssize = []
        ocw = 0
        nauto = 0
        totalw = $(@root).parent().width()
        $.each header, (i, item) ->
            if item.width
                colssize.push item.width
                ocw += item.width
            else
                colssize.push -1
                nauto++
        if nauto > 0
            cellw = parseInt((totalw - ocw) / nauto)
            $.each colssize, (i, e) ->
                return unless e is -1
                colssize[i] = cellw
        template = ""
        template += "#{v}px " for v in colssize
        $(@refs.grid).css "grid-template-columns", template
        $(@refs.header).css "grid-template-columns", template

    mount: () ->
        me = @
        $(@root)
            .css "overflow", "hidden"
            .css "display", "block"
            .css "padding", "5px"
            
        $(@refs.grid).css "display", "grid"
        $(@refs.header).css "display", "grid"
        @observable.on "resize", (e) -> me.calibrate()
        $(@refs.container)
            .css "width", "100%"
            .css "overflow-x", "hidden"
            .css "overflow-y", "auto"
        @calibrate()

    layout: () ->
        [
            { el: "div", ref: "header" },
            { el: "div", ref: "container", children: [
                { el: "div", ref: "grid" }
            ] }
        ]
Ant.OS.GUI.define "afx-grid-view", GridViewTag
Ant.OS.GUI.define "afx-grid-cell", SimpleGridCell
Ant.OS.GUI.define "afx-grid-cell-proto", GridCellPrototype