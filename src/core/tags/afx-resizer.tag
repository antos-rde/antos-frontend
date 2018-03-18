<afx-resizer>
    <script>
        var self = this
        self.dir = "hz"
        self.resizable = undefined
        self.parent = undefined
        self.minsize = 0
        self.on("mount", function(){
            //self.parent = $(self.root).parent().parent()
            var tagname = $(self.parent.root).prop("tagName")
            self.resizable = $(self.root).prev().length == 1 ?  $(self.root).prev()[0]: undefined
            //self.nextel = $(self.root).next().length == 1 ? $(self.root).next()[0]: undefined
            if(tagname == "AFX-HBOX")
            {
                self.dir = "hz"
                $(self.root).css("cursor", "col-resize")
                if(self.resizable)
                {
                    self.minsize = parseInt($(self.resizable).attr("min-width"))
                }
            }
            else if(tagname == "AFX-VBOX")
            {
                self.dir = "ve"
                $(self.root).css("cursor", "row-resize")
                if(self.resizable)
                {
                    self.minsize = parseInt($(self.resizable).attr("min-height"))
                }
            }
            else
            {
                //$(self.root).css("cursor", "normal")
                self.dir = "none"
            }
            if(!self.minsize)
                self.minsize = 10
            enable_dragging()
        })

    var enable_dragging = function()
        {
            $(self.root)
                .css("user-select","none")
            $(self.root).on("mousedown", function(e){
                e.preventDefault()

                $(window).on("mousemove", function(evt){
                    if(!self.resizable) return
                    if(self.dir == "hz")
                        horizontalResize(evt)
                    else if (self.dir == "ve")
                        verticalResize(evt)
                })
                $(window).on("mouseup", function(evt){
                    //console.log("unbind mouse up")
                    $(window).unbind("mousemove", null)
                })
            })
        }

    var horizontalResize = function(e)
    {
        if(!self.resizable) return
        var offset = $(self.resizable).offset()
        w = Math.round(e.clientX - offset.left)
        if(w < self.minsize) w = self.minsize
        $(self.resizable).attr("data-width", w.toString())
        self.parent.root.observable.trigger("calibrate", self.resizable)
    }

    var verticalResize = function(e)
    {
        //console.log("vboz")
        if(!self.resizable) return
        var offset = $(self.resizable).offset()
        //console.log($(self.resizable).innerHeight())
        //console.log(e.clientY, offset.top)
        h = Math.round(e.clientY - offset.top)
        if(h < self.minsize) h = minsize
        $(self.resizable).attr("data-height", h.toString())
        self.parent.root.observable.trigger("calibrate", self.resizable)
    }
    </script>
</afx-resizer>
