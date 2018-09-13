<afx-button >
    <button class= { btactive: selected } disabled={ enable == false } onclick="{ _onbtclick }" ref = "mybtn" > 
        <afx-label color = {color} icon={icon} iconclass = {iconclass} text = {text} ></afx-label>
    </button>
    <script>
        opts.enable = opts.enable || "true"
        this.enable = eval(opts.enable) || false
        this.icon = opts.icon
        this.iconclass = opts.iconclass
        this.color = opts.color
        this.text = opts.text || ""
        this.selected = eval(opts.selected) || false
        this.toggle = eval(opts.toggle) || false
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
        self.root.trigger = function()
        {
            $(self.refs.mybtn).trigger("click")
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
            if(self.toggle)
                self.root.set("selected",!self.selected)
        }
    </script>
</afx-button>