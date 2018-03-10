<afx-overlay>
    <yield/>
    <script>
        this.width = opts.width || 200
        this.height = opts.height || 400
        var self = this;
        self.commander = null
        this.root.observable = opts.observable || riot.observable()
        var id = $(self.root).attr("data-id")
        var calibre_size = function()
        {
            $(self.root)
                .css("width", self.width + "px")
                .css("height", self.height + "px")
            self.root.observable.trigger("resize", {id:id,w:self.width,h:self.height})
        }

        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            if( k == "width" || k == "height")
                calibre_size()
            self.update()
        }
        self.root.get = function(k)
        {
            return self[k]
        }
    
        self.on("mount", function(){
            $(self.root)
                .css("position", "absolute")
                //.css("z-index",1000000)
            $(self.root).children().each(function(e){
                this.observalbe = self.root.observalbe
            })
            calibre_size()
            self.root.observable.trigger("rendered", self.root)
        })
    </script>
</afx-overlay>