<afx-vbox style = "display:block;">
    <div ref = "container" class="afx-hbox-container">
         <yield/>
    </div>
    <script>
        var self = this
        this.on('mount', function(){
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
            }
        })

        var calibrate_size = function()
        {
            var auto_height = []
            var csize, ocheight = 0, avaiheight;
            avaiheight = $(self.root).height()
            avaiwidth = $(self.root).width()
            $(self.refs.container).css("height",avaiheight + "px")
            $(self.refs.container)
                .children()
                .each(function(e)
                {
                    this.observable = self.root.observable
                    $(this)
                        .css("flex-grow","1")
                        //.css("border","1px solid black")
                    var dw = $(this).attr("data-height")
                    if(dw)
                    {
                        $(this).css("height",dw + "px")
                        ocheight += Number(dw)
                    }
                    else
                    {
                        auto_height.push(this)
                    }
                })
            csize = (avaiheight - ocheight)/ (auto_height.length)
            $.each(auto_height, function(i,v)
            {
                $(v).css("height", csize + "px")
            })
            self.root.observable.trigger("hboxchange",
                {id:$(self.root).attr("data-id"), w:avaiwidth, h:csize})
        }
    </script>
</afx-vbox>