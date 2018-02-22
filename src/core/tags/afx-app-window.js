<afx-app-window ref = "window" >
    <div   class = "afx-window-wrapper">
        <ul class= "afx-window-top" >
            <li class = "afx-window-close" onclick = {close}></li>
             <li if = {minimizable == true} class = "afx-window-minimize" onclick = {minimize}></li>
             <li if = {resizable == true} class = "afx-window-maximize" onclick={maximize}></li>
             <li  ref = "dragger" class = "afx-window-title">{ apptitle }</li>
        </ul>
        <div class = "afx-clear"></div>
        <div ref = "content" class = "afx-window-content">
            <yield/>
        </div>
        <div if = {resizable == true} ref = "grip" class = "afx-window-grip">
    </div>

    <script>
        this.apptitle = opts.apptitle || ""
        if(opts.minimizable == undefined)
            this.minimizable = true
        else
            this.minimizable = eval(opts.minimizable)
        if(opts.resizable == undefined)
            this.resizable = true
        else
            this.resizable = eval(opts.resizable)
        var self = this
        var offset = {top:0,left:0}
        var desktop_pos = $("#desktop").offset()
        var isMaxi = false
        var history = {}
        var width = opts.width || 400
        var height = opts.height || 300
        this.root.observable = opts.observable || riot.observable()
        if(!window._zindex) window._zindex = 10
        this.shown = false

        self.root.contextmenuHandler = function (e) {}

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
        minimize()
        {
            this.root.observable.trigger("hide")
        }
        close()
        {
            this.root.observable.trigger("exit")
        }
        this.on('mount', function() {
            var left,top 
            //left = 20 + Math.floor(Math.random() *  ($("#desktop").width()  - width))
            //top = 20 + Math.floor(Math.random() *  ($("#desktop").height() - height))
            left = ($("#desktop").width()  - width)/2
            top = ($("#desktop").height() - height)/2
            $(self.refs.window)
                .css("position",'absolute')
                .css("left",left + "px")
                .css("top",top + "px")
                .css("width",width + "px")
                .css("height", height + "px")
                .css("z-index",window._zindex++)
            $(self.refs.window).on("mousedown", function(e){
                if(self.shown == false)
                    self.root.observable.trigger("focus")
            })
            $(self.refs.window).click(function(e) {
                //e.stopPropagation()
                //e.windowactive = true
                //self.root.observable.trigger("windowselect")
            })
            enable_dragging()
            if(self.resizable)
                enable_resize()
            $(self.refs.dragger).dblclick(function(e){
                toggle_window()
            })
            $(self.refs.content).children().each(function(e){
                this.observable = self.root.observable
            })
            var fn = function()
            {
                var ch = $(self.refs.content).height()/ $(self.refs.content).children().length
                $(self.refs.content).children().each(function(e){
                    $(this).css("height",ch+"px")
                })
            }
            fn()
            self.root.observable.on("resize", function(){ fn()})
            self.root.observable.on("focus",function(){
                window._zindex++
                $(self.refs.window)
                    .show()
                    .css("z-index",window._zindex)
                    .removeClass("unactive")

                self.shown = true
            })
            self.root.observable.on("blur", function(){
                self.shown = false
                $(self.refs.window)
                    .addClass("unactive")
                // add css to blur app :)
            })
            self.root.observable.on("hide", function()
            {
                $(self.refs.window).hide()
                self.shown = false
            })

            self.root.observable.on("toggle", function(){
                if(self.shown)
                    self.root.observable.trigger("hide")
                else 
                    self.root.observable.trigger("focus")
            })
            self.root.observable.trigger("rendered", self.root)
        })
        var enable_dragging = function()
        {
            $(self.refs.dragger)
                .css("user-select","none")
                .css("cursor","default")
            $(self.refs.dragger).on("mousedown", function(e){
                e.preventDefault()
                offset = $(self.refs.window).offset()
                offset.top = e.clientY - offset.top
                offset.left = e.clientX - offset.left
                $(window).on("mousemove", function(e){
                    var top,left
                    if(isMaxi)
                    {
                        toggle_window()
                        top = 0
                        letf = e.clientX - $(self.refs.window).width()/2
                        offset.top = 10 //center
                        offset.left = $(self.refs.window).width()/2
                    } else
                    {
                        top  = e.clientY - offset.top - desktop_pos.top
                        left = e.clientX - desktop_pos.top - offset.left
                        left = left < 0?0:left;
                        top = top < 0?0:top;
                    }
                    
                    $(self.refs.window).css("top", top +"px")
                    .css("left",left + "px")
                })
                $(window).on("mouseup", function(e){
                    //console.log("unbind mouse up")
                    $(window).unbind("mousemove", null)
                })
            })
        }

        var enable_resize = function()
        {
            if(!self.resizable) return
            $(self.refs.grip)
                .css("user-select","none")
                .css("cursor","default")
                .css("position","absolute")
                .css("bottom","0")
                .css("right","0")
                .css("cursor","nwse-resize")
            $(self.refs.grip).on("mousedown", function(e){
                e.preventDefault()
                offset.top = e.clientY
                offset.left = e.clientX
                $(window).on("mousemove", function(e){
                    var w,h
                    w  = $(self.refs.window).width() + e.clientX - offset.left
                    h  = $(self.refs.window).height() + e.clientY - offset.top
                    w  = w < 100 ? 100:w 
                    h = h < 100 ?100:h
                    offset.top = e.clientY
                    offset.left = e.clientX
                    $(self.refs.window)
                        .css("width", w +"px")
                        .css("height",h + "px")
                    isMaxi = false
                    self.root.observable.trigger('resize',
                        {id:$(self.root).attr("data-id"),w:w,h:h})
                })
                $(window).on("mouseup", function(e){
                    $(window).unbind("mousemove", null)
                })
            })
        }

        var toggle_window = function()
        {
            if(!self.resizable) return
            if(isMaxi == false)
            {
                history = {
                    top: $(self.refs.window).css("top"),
                    left:$(self.refs.window).css("left"),
                    width:$(self.refs.window).css("width"),
                    height:$(self.refs.window).css("height")
                }
                var w,h 
                w = ($("#desktop").width() - 5)
                h = ($("#desktop").height() - 10)
                $(self.refs.window)
                    .css("width", w + "px")
                    .css("height", h + "px")
                    .css("top","0").css("left","0")
                self.root.observable.trigger('resize',
                    {id:$(self.root).attr("data-id"),w:w,h:h})
                isMaxi = true
            }
            else
            {
                isMaxi = false
                $(self.refs.window)
                    .css("width",history.width)
                    .css("height",history.height)
                    .css("top",history.top).css("left",history.left)
                self.root.observable.trigger('resize',
                    {id:$(self.root).attr("data-id"),w:history.width,h:history.height} )
            }
            
        }
        maximize()
        {
            toggle_window()
        }
    </script>
</afx-app-window>