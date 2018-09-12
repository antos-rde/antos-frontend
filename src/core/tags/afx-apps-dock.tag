<afx-apps-dock>
    <afx-button class = {selected: parent.selectedApp && it.app.pid == parent.selectedApp.pid} each={ it,i in items} iconclass = {it.iconclass} icon = {it.icon} appindex = {i} text = {it.text} onbtclick = {it.onbtclick} tooltip= {"cr:" + it.app.title()} >
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
                    if(v)
                        $("#desktop")[0].set("selected", -1)
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
        self.root.update = function()
        {
            self.update()
        }
        self.root.get = function(k)
        {
            return self[k]
        }
        this.on("mount", function(){
            window.OS.courrier.trigger("sysdockloaded")
        })
        
        self.root.contextmenuHandler = function(e, m) 
        {
            if(e.target == self.root) return;
            var appidx = $(e.target).closest( "afx-button" ).attr("appindex")
            var app = self.items[appidx].app
            m.set("items", [
                { text: "__(Show)", dataid:"show" },
                { text: "__(Hide)", dataid:"hide" },
                { text: "__(Close)", dataid:"quit" }
            ])
            m.set("onmenuselect", function(evt)
            {
                if(app[evt.item.data.dataid])
                    app[evt.item.data.dataid]()
            })
            m.show(e)
        }

    </script>
</afx-apps-dock>