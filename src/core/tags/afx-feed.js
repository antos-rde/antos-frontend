<afx-feed>
    <div>
        <p>
            <i if={iconclass} class = {iconclass} ></i>
            <i if={icon} class="icon-style" style = { "background: url("+icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
            {header}
            <i if={closable} class = "closable"></i>
        </p>
        <div>
            <p>{text}</p> 
            <yield/>
        </div>
    </div>
    <script>
        var self = this
        this.icon = opts.icon
        this.iconclass = opts.iconclass
        this.closable = opts.closable
        this.header = opts.header||""
        this.text = opts.text || ""
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
    </script>
</afx-feed>