<afx-apps-dock>
    <afx-button class = {selected: parent.selectedApp && app.pid == parent.selectedApp.pid} each={ items } icon = {icon} text = {text} onbtclick = {onbtclick}>
    </afx-button>
    <script>
        this.items = opts.items || []
        var self = this
        self.selectedApp = null
        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
            {
                self[k] = v
                if(k == "selectedApp")
                { 
                    for(var i in self.items)
                        self.items[i].app.blur()
                    //v.show()
                }
            }
            self.update()
        }
        self.root.newapp = function(i)
        {
            self.items.push(i)
            self.selectedApp = i.app
            self.update()
            for(var i in self.items)
                self.items[i].app.blur()
        }
    
        self.root.removeapp = function(a)
        {
            var i = -1;
            for(var k in self.items)
                if(self.items[k].app.pid == a.pid)
                {
                    i = k; break;
                }
            if(i != -1)
            {
                delete self.items[i].app
                self.items.splice(i,1)
                
                self.update()
            }
        }
        self.root.get = function(k)
        {
            return self[k]
        }
        this.on("mount", function(){
            window.OS.courrier.trigger("sysdockloaded")
        })
        
    </script>
</afx-apps-dock>