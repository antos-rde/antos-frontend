<afx-sys-panel>
    <div>
        <afx-menu data-id = "os_menu" ref = "aOsmenu" child={osmenu.child} onmenuselect = {osmenu.onmenuselect} class="afx-panel-os-menu"></afx-menu>
        <afx-menu data-id = "appmenu" ref = "aAppmenu" child={appmenu.child} onmenuselect = {appmenu.onmenuselect} class = "afx-panel-os-app"></afx-menu>
        <afx-menu data-id = "sys_tray" ref = "aTray" child={systray.child} onmenuselect = {systray.onmenuselect} class = "afx-panel-os-stray"></afx-menu>
    </div>
    
    <script>
        this.osmenu = opts.osmenu
        this.appmenu = opts.appmenu
        this.systray = opts.systray
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
        this.on('mount', function() {
            //console.log(self.refs.aOsmenu.root)
            $(self.refs.aOsmenu.root).css("z-index",1000000)
            $(self.refs.aAppmenu.root).css("z-index",1000000)
            $(self.refs.aTray.root).css("z-index",1000000)
        })
    </script>
</afx-sys-panel>