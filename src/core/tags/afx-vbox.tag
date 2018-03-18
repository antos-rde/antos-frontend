<afx-vbox style = "display:block;">
    <div ref = "container" class="afx-vbox-container">
         <yield/>
    </div>
    <script>
        var self = this
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        this.on('mount', function(){
            self.root.observable =   (self.parent && self.parent.root && self.parent.root.observable) || opts.observable || riot.observable()
            $(self.refs.container)
                .css("display","flex")
                .css("flex-direction","column")
                .css("width","100%")
                //.css("background-color","red")
                //.css("overflow", "hidden")

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
            var auto_height = []
            var csize, ocheight = 0, avaiheight;
            avaiheight = $(self.root).height()
            avaiwidth = $(self.root).width()
            /*if(avaiheight == 0)
            {
                avaiheight = $(self.parent.root).height()
                $(self.root).css("height", avaiheight+"px")
            }
            if(avaiwidth == 0)
            {
                avaiwidth = $(self.parent.root).width()
                $(self.root).css("height", avaiwidth+"px")
            }*/
            $(self.refs.container).css("height",avaiheight + "px")
            $(self.refs.container)
                .children()
                .each(function(e)
                {
                    this.observable = self.root.observable
                        //.css("border","1px solid black")
                    var dw = $(this).attr("data-height")
                    if(dw)
                    {
                        if(dw == "grow") return
                        if(dw[dw.length-1] === "%")
	                        dw = Number(dw.slice(0,-1))*avaiheight/100;
                        $(this).css("height",dw + "px")
                        ocheight += Number(dw)
                    }
                    else
                    {
                        $(this).css("flex-grow","1")
                        auto_height.push(this)
                    }
                })
            csize = (avaiheight - ocheight)/ (auto_height.length)
            if(csize > 0)
                $.each(auto_height, function(i,v)
                {
                    $(v).css("height", csize + "px")
                })
            self.root.observable.trigger("vboxchange",
                {id:self.rid, w:avaiwidth, h:csize})
        }
    </script>
</afx-vbox>