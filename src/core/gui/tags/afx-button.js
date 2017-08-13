<afx-button>
    <button disabled={ enable == "false" } onclick="{ _onbtclick }"  > 
        <i if={iconclass} class = {iconclass} ></i>
        <i if={icon} class="icon-style" style = { "background: url("+icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
        { opts.text }
    </button>
    <script>
        this.enable = opts.enable
        this.icon = opts.icon
        this.iconclass = opts.iconclass
        var self = this
        
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
        self.root.update = function()
        {
            self.update()
        }
        this._onbtclick = function(e)
        {
            if(typeof opts.onbtclick == 'string')
                eval(opts.onbtclick())
            else if(opts.onbtclick)
                opts.onbtclick()
            if(self.root.observable)
            {
                self.root.observable.trigger("btclick",{id:$(self.root).attr("data-id"),data:self.root})
            }
        }
    </script>
</afx-button>