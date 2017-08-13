<afx-menu>
    <ul>
        <li class="afx-corner-fix"></li>
        <li each={ items } class = {afx_submenu:child != null, fix_padding:icon}>
            <a href="#" onclick = {parent.onselect}>
                <i if={iconclass} class = {iconclass} ></i>
                <i if={icon} class="icon-style" style = { "background: url("+icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
                { text }
            </a>
            
            <afx-menu if={child != null} child={child} onmenuselect={onmenuselect} observable = {parent.root.observable} rootid = {parent.rid}></afx-menu>
        </li>
         <li class="afx-corner-fix"></li>
    </ul>
    <script>
        this.items = opts.child
        if(opts.rootid)
            this.rid = opts.rootid
        else 
            this.rid = $(this.root).attr("data-id")
        var self = this
        this.onmenuselect = opts.onmenuselect
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
        if(opts.observable)
        {
            this.root.observable = opts.observable
        }
        else
        {
            this.root.observable = riot.observable()
            this.root.observable.on('menuselect',function(data){
                //console.log("From root",self.root)
                if(self.onmenuselect)
                {
                    self.onmenuselect(data)
                }
            })
        }

        

        onselect(event)
        {
            var data = {id:self.rid, data:event.item}
           /*if(self.onmenuselect)
            {
                self.onmenuselect(data)
            } else*/
            this.root.observable.trigger('menuselect',data)
           event.preventDefault()
        }

    </script>
</afx-menu>