<afx-button>
    <button disabled={ enable == "false" } onclick="{ _onbtclick }"  > 
        <afx-label icon={icon} iconclass = {iconclass} text = {text} ></afx-label>
    </button>
    <script>
        this.enable = opts.enable
        this.icon = opts.icon
        this.iconclass = opts.iconclass
        this.text = opts.text || ""
        var self = this
        this.onbtclick = opts.onbtclick
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
        this._onbtclick = function(e)
        {
            if(typeof self.onbtclick == 'string')
                eval(self.onbtclick)
            else if(self.onbtclick)
                self.onbtclick(e)
            if(self.root.observable)
            {
                self.root.observable.trigger("btclick",{id:$(self.root).attr("data-id"),data:self.root})
            }
        }
    </script>
</afx-button>