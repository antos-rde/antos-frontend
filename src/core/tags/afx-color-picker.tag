<afx-color-picker>
<div style = "width:310px; height:190px;display:block; padding:3px;">
    <canvas class = "color-palette" width="284" height="155" style ="float:left;" ref = "palette" ></canvas>
    <div class = "color-sample"  style= "width:15px; height:155px; text-align:center; margin-left:3px; display:block;float:left;" ref = "colorval"></div>
    <div class = "afx-clear"></div>
    <div style ="margin-top:3px;"> 
        <span>Hex:</span><input type = "text" ref = "hextext" style = "width:70px; margin-left:3px;margin-right:5px;"></input>
        <span ref = 'rgbtext'></span>
    </div>
</div>
<script>
    var self = this
    var colorctx = undefined
    self.root.observable = opts.observable
    self.oncolorsetect = opts.oncolorsetect
    self.selectedColor = undefined
    self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            self.update()
        }
    self.root.get = function(k)
    {
        return self[k]
    }

    var build_palette = function()
    {
        colorctx = $(self.refs.palette).get(0).getContext('2d')
        var gradient = colorctx.createLinearGradient(0,0,$(self.refs.palette).width(),0)
        // fill color
        gradient.addColorStop(0,    "rgb(255,   0,   0)")
        gradient.addColorStop(0.15, "rgb(255,   0, 255)")
        gradient.addColorStop(0.33, "rgb(0,     0, 255)")
        gradient.addColorStop(0.49, "rgb(0,   255, 255)")
        gradient.addColorStop(0.67, "rgb(0,   255,   0)")
        gradient.addColorStop(0.84, "rgb(255, 255,   0)")
        gradient.addColorStop(1,    "rgb(255,   0,   0)")
        gradient.addColorStop(0,    "rgb(0,   0,   0)")
        // Apply gradient to canvas
        colorctx.fillStyle = gradient;
        colorctx.fillRect(0, 0, colorctx.canvas.width, colorctx.canvas.height)
        
        // Create semi transparent gradient (white -> trans. -> black)
        gradient = colorctx.createLinearGradient(0, 0, 0, $(self.refs.palette).width())
        gradient.addColorStop(0,   "rgba(255, 255, 255, 1)")
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)")
        gradient.addColorStop(0.5, "rgba(0,     0,   0, 0)")
        gradient.addColorStop(1,   "rgba(0,     0,   0, 1)")
        // Apply gradient to canvas
        colorctx.fillStyle = gradient
        colorctx.fillRect(0, 0, colorctx.canvas.width, colorctx.canvas.height)
        //$(self.refs.palette).css("position", "absolute")
        // now add mouse move event
        var getHex = function(c)
        {
            s = c.toString(16)
            if(s.length == 1) s = "0" + s
            return s
        }
        var pick_color = function(e)
        {
            $(self.refs.palette).css("cursor","crosshair")
            var offset = $(self.refs.palette).offset()
            var x = e.pageX - offset.left
            var y = e.pageY - offset.top
            var color = colorctx.getImageData(x,y, 1, 1)
            var data = {
                r:color.data[0],
                g:color.data[1],
                b:color.data[2],
                text:'rgb(' + color.data[0] + ', ' + color.data[1] + ', ' + color.data[2] + ')',
                hex:'#' + getHex(color.data[0]) + getHex(color.data[1]) + getHex(color.data[2])
            }
            return data
        }
        var mouse_move_h = function(e)
        {
            var data = pick_color(e)
            $(self.refs.colorval).css("background-color", data.text)
        }
        $(self.refs.palette).mouseenter(function(e){
            $(self.refs.palette).on("mousemove",mouse_move_h)
        })
        $(self.refs.palette).mouseout(function(e){
            $(self.refs.palette).unbind("mousemove",mouse_move_h)
            if(self.selectedColor)
                $(self.refs.colorval).css("background-color", self.selectedColor.text)
        })
        $(self.refs.palette).on("click", function(e){
            data = pick_color(e)
            $(self.refs.rgbtext).html(data.text)
            $(self.refs.hextext).val(data.hex)
            self.selectedColor = data
            if(self.oncolorsetect)
                self.oncolorsetect(data)
            if(! self.root.observable) return 
            self.root.observable.trigger("colorselect",data)
        })
    }

    this.on("mount", function(){
        build_palette()
    })
</script>
</afx-color-picker>