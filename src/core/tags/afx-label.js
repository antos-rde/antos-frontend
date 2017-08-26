<afx-label>
    <span>
        <i if={iconclass} class = {iconclass} ></i>
        <i if={icon} class="icon-style" style = { "background: url("+icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
        { text }
    </span>
    <script>
        this.iconclass = opts.iconclass
        this.icon = opts.icon
        this.text = opts.text
        var self = this
        this.on("update",function(){
            self.iconclass = opts.iconclass
            self.icon = opts.icon
            self.text = opts.text
        })
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
    </script>
</afx-label>