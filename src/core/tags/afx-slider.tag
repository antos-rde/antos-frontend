<afx-slider>
<div class= "container" ref="container">
    <div class = "progress" ref ="prg"></div>
    <div if = {dragable} class = "dragpoint" ref = "point"></div>
</div>
<script>
    this.value = Number(opts.value) || 0
    this.max = Number(opts.max) || 100
    if(opts.dragable != undefined)
        this.dragable = eval(opts.dragable)
    else
        this.dragable = true
    this.onchanging = opts.onchanging
    this.onchange = opts.onchange
    //this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
    var self = this
    self.root.set = function(k,v)
    {
        if(k == "*")
            for(var i in v)
                self[i] = v[i]
        else
            self[k] = v
        /*if(k == "value")
        {
            if(self.onchange) self.onchange(self.value)
            if(self.onchanging) self.onchanging(self.value)
        }*/
        self.update()
    }
    self.root.get = function(k)
    {
        return self[k]
    }
    
    var calibrate = function() {
        if(self.value > self.max) self.value = self.max
        $(self.refs.container).css("width", $(self.root).width() + "px")
        var w = $(self.refs.container).width()*self.value/ self.max
        $(self.refs.prg).css("width", w + "px").css("height", $(self.refs.container).height()+"px")
        if(self.dragable)
        {
            var ow = w - $(self.refs.point).width()/2
            var top = Math.floor(($(self.refs.prg).height() - $(self.refs.point).height())/2)
            $(self.refs.point).css("left", ow + "px").css("top", top + "px")
        }
    }
    self.on("update", function(){
        calibrate()
    })
    var enable_dragging = function()
    {
        $(self.refs.point)
            .css("user-select","none")
            .css("cursor","default")
        $(self.refs.point).on("mousedown", function(e){
            e.preventDefault()
            offset = $(self.refs.container).offset()
            $(window).on("mousemove", function(e){
                var left
                left = e.clientX  - offset.left
                left = left < 0?0:left
                var maxw = $(self.refs.container).width();
                left = left > maxw?maxw : left
                self.value = left*self.max/maxw
                calibrate()
                if(self.onchanging) self.onchanging(self.value)
            })
            $(window).on("mouseup", function(e){
                if(self.onchange) self.onchange(self.value)
                $(window).unbind("mousemove", null)
            })
        })
    }
    self.on("mount", function(){
        self.root.observable = opts.observable || (self.parent && self.parent.root && self.parent.root.observable) || riot.observable()
        if(self.dragable)
        {
            $(self.refs.point).css("position", "absolute")
            $(self.refs.point).hide()
            $(self.root).mouseover(function(){
                $(self.refs.point).show()
            }).mouseout(function(){
                $(self.refs.point).hide()
            })
            enable_dragging()
        }
        $(self.refs.container).click( function(e){
            var offset = $(self.refs.container).offset()
            var left = e.clientX  - offset.left
            var maxw = $(self.refs.container).width()
            self.value = left*self.max/maxw
            calibrate()
            if(self.onchange) self.onchange(self.value)
            if(self.onchanging) self.onchanging(self.value)
        })
        self.root.observable.on("calibrate",function(){
            calibrate()
        })
        self.root.observable.on("resize", function(){
            calibrate()
        })
        calibrate()
    })
</script>
</afx-slider>