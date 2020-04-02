class GridCellPrototype extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "class", "afxgridcell"
        @setopt "data", {}
    

    __class__: (v) ->
        $(@root).removeClass().addClass @get("class")

class SimpleGridCell extends GridCellPrototype
    constructor: (r, o) ->
        super r, o
        @setopt "header", false

    __header__: (v) ->


    __data__: (d) ->
        @refs.cell.set  k, v for k, v of d

    mount: () ->
        $(@root).css "display", "block"
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
        @setopt "cellclass", "afxgridcell"
        @setopt "rows", []

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
            for cell in row
                el = $("<#{@get("cellitem")}>").appendTo @refs.grid
                el[0].uify undefined
                el[0].set "data", cell
                cell.domel = el[0]

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
        $(@refs.grid).css "display", "grid"
        $(@refs.header).css "display", "grid"
        @observable.on "resize", (e) -> me.calibrate()
        $(@refs.container)
            .css "width", "100%"
            .css "overflow-x", "hidden"
            .css "overflow-y", "auto"

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