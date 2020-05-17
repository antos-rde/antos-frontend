class ColorPickerTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @colorctx = undefined
        @setopt "oncolorselect", (e) ->
        @setopt "selectedColor", undefined

    mount: () ->
        $(@refs.wrapper)
            .css "width", "310px"
            .css "height", "190px"
            .css "display", "block"
            .css "padding", "3px"
        $(@refs.palette)
            .css "width", "284px"
            .css "height", "155px"
            .css "float", "left"
        $(@refs.colorval)
            .css "width", "15px"
            .css "height", "155px"
            .css "text-align", "center"
            .css "margin-left", "3px"
            .css "display", "block"
            .css "float", "left"

        $(@refs.inputwrp)
            .css "margin-top", "3px"
        
        $(@refs.hextext)
            .css "width", "70px"
            .css "margin-left", "3px"
            .css "margin-right", "5px"

        @build_palette()

    build_palette: () ->
        colorctx = $(@refs.palette).get(0).getContext('2d')
        gradient = colorctx.createLinearGradient(0, 0, $(@refs.palette).width(), 0)
        # fill color
        gradient.addColorStop(0,    "rgb(255,   0,   0)")
        gradient.addColorStop(0.15, "rgb(255,   0, 255)")
        gradient.addColorStop(0.33, "rgb(0,     0, 255)")
        gradient.addColorStop(0.49, "rgb(0,   255, 255)")
        gradient.addColorStop(0.67, "rgb(0,   255,   0)")
        gradient.addColorStop(0.84, "rgb(255, 255,   0)")
        gradient.addColorStop(1,    "rgb(255,   0,   0)")
        gradient.addColorStop(0,    "rgb(0,   0,   0)")
        # Apply gradient to canvas
        colorctx.fillStyle = gradient
        colorctx.fillRect(0, 0, colorctx.canvas.width, colorctx.canvas.height)
        
        # Create semi transparent gradient (white -> trans. -> black)
        gradient = colorctx.createLinearGradient(0, 0, 0, $(@refs.palette).width())
        gradient.addColorStop(0,   "rgba(255, 255, 255, 1)")
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)")
        gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)")
        gradient.addColorStop(1,   "rgba(0,     0,   0, 1)")
        # Apply gradient to canvas
        colorctx.fillStyle = gradient
        colorctx.fillRect(0, 0, colorctx.canvas.width, colorctx.canvas.height)
        # now add mouse move event
        getHex = (c) ->
            s = c.toString(16)
            s = "0" + s if s.length is 1
            s

        pick_color = (e) =>
            $(@refs.palette).css("cursor", "crosshair")
            offset = $(@refs.palette).offset()
            x = e.pageX - offset.left
            y = e.pageY - offset.top
            color = colorctx.getImageData(x, y, 1, 1)
            data = {
                r: color.data[0],
                g: color.data[1],
                b: color.data[2],
                text: 'rgb(' + color.data[0] + ', ' + color.data[1] + ', ' + color.data[2] + ')',
                hex: '#' + getHex(color.data[0]) + getHex(color.data[1]) + getHex(color.data[2])
            }
            data

        mouse_move_h = (e) =>
            data = pick_color(e)
            $(@refs.colorval).css("background-color", data.text)
        
        $(@refs.palette).mouseenter (e) =>
            $(@refs.palette).on("mousemove", mouse_move_h)
    
        $(@refs.palette).mouseout (e) =>
            $(@refs.palette).unbind("mousemove", mouse_move_h)
            if @get "selectedColor"
                $(@refs.colorval).css("background-color", @get("selectedColor").text)

        $(@refs.palette).on "click", (e) =>
            data = pick_color(e)
            $(@refs.rgbtext).html(data.text)
            $(@refs.hextext).val(data.hex)
            @set "selectedColor", data
            evt =  { id: @aid(), data: data }
            @get("oncolorselect") evt
            @observable.trigger "colorselect", data

    layout: () ->
        [{
            el: "div", ref: "wrapper", children: [
                { el: "canvas", class: "color-palette", ref: "palette" },
                { el: "color-sample", ref: "colorval" },
                { el: "div", class: "afx-clear" },
                { el: "div", ref: "inputwrp", children: [
                    { el: "input", ref: "hextext" },
                    { el: "span", ref: "rgbtext" }
                ] }
            ]
        }]

Ant.OS.GUI.define "afx-color-picker", ColorPickerTag