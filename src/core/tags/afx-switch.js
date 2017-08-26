<afx-switch>
    <span class = {swon: swon} onclick = {toggle}></span>
    <script>
        this.swon = opts.swon || false
        var self = this
        this.root.observable = opts.observable
        this.onchange = opts.onchange
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        console.log(this.swon)
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
        this.root.toggle = function()
        {
            self.swon = !self.swon
            self.update()
        }

        toggle(e)
        {
            self.swon = !self.swon
            var data = {
                id: self.rid,
                data: self.swon
            }
            if(self.onchange)
                self.onchange(data)
            if(self.root.observable)
                self.root.observable.trigger("switch", data)
            
        }
    </script>
</afx-switch>