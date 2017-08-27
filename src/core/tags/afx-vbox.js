<afx-vbox style = "display:block;">
    <div ref = "container" class="afx-vbox-container">
         <yield/>
    </div>
    <script>
        var self = this
        this.on('mount', function(){
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
                }
        })
        var calibrate_size = function()
        {
            var auto_width = []
            var csize, ocwidth = 0, avaiheight;
            avaiheight = $(self.root).height()
            avaiWidth = $(self.root).width()
            $(self.refs.container).css("height",avaiheight + "px")
            $(self.refs.container)
                .children()
                .each(function(e)
                {
                    this.observable = self.root.observable
                    $(this)
                        .css("flex-grow","1")
                        //.css("height",avaiheight + "px")
                    var dw = $(this).attr("data-width")
                    if(dw)
                    {
                        $(this).css("width",dw + "px")
                        ocwidth += Number(dw)
                    }
                    else
                    {
                        auto_width.push(this)
                    }
                })
            csize = (avaiWidth - ocwidth)/ (auto_width.length)
            $.each(auto_width, function(i,v)
            {
                $(v).css("width", csize + "px")
            })
            self.root.observable.trigger("vboxchange",
                {id:$(self.root).attr("data-id"), w:csize, h:avaiheight})
        }
    </script>
</afx-vbox>