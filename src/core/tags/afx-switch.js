<afx-switch>
    <span class = {swon: swon} onclick = {toggle}></span>
    <script>
        this.swon = opts.swon || false
        var self = this
        this.root.observable = opts.observable
        this.enable = opts.enable || true
        this.onchange = opts.onchange
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    opts[i] = v[i]
            else
                opts[k] = v
            self.update()
        }
        self.root.get = function(k)
        {
            return self[k]
        }
        this.root.toggle = function()
        {
            opts.swon = !self.swon
            self.update()
        }
        this.on("update", function(e){
            self.swon = opts.swon
            self.onchange = opts.onchange
        })
        toggle(e)
        {
            if(!self.enable) return
            opts.swon = !self.swon
            var data = {
                id: self.rid,
                data: opts.swon
            }
            if(self.onchange)
                self.onchange(data)
            if(self.root.observable)
                self.root.observable.trigger("switch", data)
            
        }
    </script>
</afx-switch>