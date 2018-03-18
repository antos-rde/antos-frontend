<afx-hbox style = "display:block;">
    <div ref = "container" class="afx-hbox-container">
         <yield/>
    </div>
    <script>
        var self = this
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        this.on('mount', function(){
            self.root.observable =   (self.parent && self.parent.root && self.parent.root.observable) || opts.observable || riot.observable()
            $(self.refs.container)
                .css("display","flex")
                .css("flex-direction","row")
                .css("width","100%")

                calibrate_size()

                if(self.root.observable)
                {
                    self.root.observable.on("resize", function(w,h){
                        calibrate_size()
                    })
                    self.root.observable.on("calibrate", function(){
                        calibrate_size()
                    })
                }
        })
        self.root.update = function()
        {
            self.update()
        }
        var calibrate_size = function()
        {
            var auto_width = []
            var csize, ocwidth = 0, avaiheight;
            avaiheight = $(self.root).height()
            avaiWidth = $(self.root).width()
            /*if(avaiheight == 0)
            {
                avaiheight = $(self.parent.root).height()
                $(self.root).css("height", avaiheight+"px")
            }
            if(avaiWidth == 0)
            {
                avaiWidth = $(self.parent.root).width()
                $(self.root).css("height", avaiWidth+"px")
            }*/
            $(self.refs.container).css("height",avaiheight + "px")
            $(self.refs.container)
                .children()
                .each(function(e)
                {
                    this.observable = self.root.observable
                        //.css("height",avaiheight + "px")
                    var dw = $(this).attr("data-width")
                    if(dw)
                    {
                        if(dw == "grow") return
                        if(dw[dw.length-1] === "%")
	                        dw = Number(dw.slice(0,-1))*avaiWidth/100;
                        $(this).css("width",dw + "px")
                        ocwidth += Number(dw)
                    }
                    else
                    {
                        $(this).css("flex-grow","1")
                        auto_width.push(this)
                    }
                })
            csize = (avaiWidth - ocwidth)/ (auto_width.length)
            if(csize > 0)
                $.each(auto_width, function(i,v)
                {
                    $(v).css("width", csize + "px")
                })
            self.root.observable.trigger("hboxchange",
                {id:self.rid, w:csize, h:avaiheight})
        }
    </script>
</afx-hbox>