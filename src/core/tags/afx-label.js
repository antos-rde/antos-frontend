<afx-label>
    <span style = {color?"color:" + color:""} >
        <i if={iconclass} class = {iconclass} ></i>
        <i if={icon} class="icon-style" style = { "background: url("+icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
        { parse(text) }
    </span>
    <script>
        this.iconclass = opts.iconclass
        this.icon = opts.icon
        this.text = opts.text
        this.color = opts.color
        var self = this
        this.on("update",function(){
            self.iconclass = opts.iconclass
            self.icon = opts.icon
            self.text = opts.text
            self.color = opts.color
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
        parse(text)
        {
            if(!text) return ""
            match = text.match(/^__\(([^\)]*)\)$/)
            if(match)
            {
                return window.__(match[1])
            }
            else
                return text
        }
    </script>
</afx-label>