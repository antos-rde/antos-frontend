class GridRowTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "data", []
        @refs.yield = @root

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
    
    __selected__: (v) ->
        @get("data").selected = v
        return unless v
        @cellseleck {}, false
    
    update: () ->
        @set "data", @get("data")

    mount: () ->
        $(@root).css "display", "block"
        $(@root).click (e) =>
            @cellseleck e, false
        $(@root).dblclick (e) =>
            @cellseleck e, true
    

    cellseleck: (e, flag) ->
        e.item = @root
        evt = { id: @aid(), data: e }
        return @get("oncellselect") evt unless flag
        @get("oncelldbclick") evt

    __class__: (v) ->
        $(@root).removeClass().addClass @get("class")

class SimpleGridCellTag extends GridCellPrototype
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
        @root.push = (r) => @push r, false
        @root.unshift = (r) => @unshift r
        @root.remove = (r) => @remove r

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
        $(@refs.grid).empty()
        for row in rows
            @push row, false

    remove: (row) ->
        return unless row
        rowdata = row.get "data"
        data = @get "rows"
        @set "selectedRow", undefined if @get("selectedRow") is row
        @set "selectedCell", undefined if $(@get("selectedCell")).parent()[0] is row
        list = @get("selectedRows")
        list.splice(list.indexOf(row), 1) if list.includes(row)
        if data.includes rowdata
            data.splice data.indexOf(rowdata), 1
        $(row).remove()


    push: (row, flag) ->
        rowel = $("<afx-grid-row>")
            .css "display", "contents"
        rowel[0].uify undefined
        rowel[0].set "data", row
        row.domel = rowel[0]

        for cell in row
            el = $("<#{@get("cellitem")}>").appendTo rowel
            cell.domel = el[0]
            el[0].uify undefined
            el[0].set "oncellselect", (e) => @cellselect e, false
            el[0].set "oncelldbclick", (e) => @cellselect e, true
            el[0].set "data", cell
        if flag
            $(@refs.grid).prepend rowel[0]
        else
            rowel.appendTo @refs.grid

    unshift: (row) ->
        @push row, true

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
        row = $(e.data.item).parent()[0]
        if @multiselect()
            if selectedRows.includes row
                selectedRows.splice selectedRows.indexOf(row) , 1
                $(row).removeClass()
            else
                selectedRows.push row
                $(row).removeClass().addClass("afx-grid-row-selected")
            evt.data.items = @get "selectedRows"
        else
            return if selectedRow is row
            $(selectedRow).removeClass()
            @set "selectedRow", row
            @set "selectedRows", [row]
            evt.data.item = row
            evt.data.items = [ row ]
            $(row).removeClass().addClass("afx-grid-row-selected")
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
        $(@root)
            .css "overflow", "hidden"
            
        $(@refs.grid).css "display", "grid"
        $(@refs.header).css "display", "grid"
        @observable.on "resize", (e) => @calibrate()
        $(@refs.container)
            .css "width", "100%"
            .css "overflow-x", "hidden"
            .css "overflow-y", "auto"
        @calibrate()

    layout: () ->
        [
            { el: "div", ref: "header", class: "grid_row_header" },
            { el: "div", ref: "container", children: [
                { el: "div", ref: "grid" }
            ] }
        ]
Ant.OS.GUI.define "afx-grid-view", GridViewTag
Ant.OS.GUI.define "afx-grid-cell", SimpleGridCellTag
Ant.OS.GUI.define "afx-grid-row", GridRowTag
Ant.OS.GUI.define "afx-grid-cell-proto", GridCellPrototype