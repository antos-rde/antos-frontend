<afx-feed>
    <div each = {items}>
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
        self.items = opts.items || []
        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            self.update()
        }
        self.root.push = function(i,u)
        {
            self.items.push(i)
            if(u) self.update()
        }
        self.root.remove = function(e,u)
        {
            var i = self.items.indexOf(e)
            if(i >= 0)
                self.items.splice(i, 1)
            if(u)
                self.update()
        }
        self.root.unshift = function(i,u)
        {
            self.items.unshift(i)
            if(u) self.update()
        }
        self.root.get = function(k)
        {
            return self[k]
        }
    </script>
</afx-feed>