<afx-menu >
    <ul class={context: opts.context == "true"}>
        <li class="afx-corner-fix"></li>
        <li ref = "container" each={ data,i in items } class = {afx_submenu:data.child != null && data.child.length > 0, fix_padding:data.icon} no-reorder>
            <a href="#" onclick = {parent.onselect}>
                <afx-switch if = {data.switch || data.radio} class = {checked:parent.checkItem(data)} enable = false swon = {data.checked} ></afx-switch>
                <afx-label color = {data.color} iconclass = {data.iconclass} icon = {data.icon} text = {data.text} ></afx-label>
                <span if={data.shortcut} class = "shortcut">{data.shortcut}</span>
            </a>
            
            <afx-menu ref = "submenus" index = {i} if={data.child != null && data.child.length > 0} child={data.child} onmenuselect = {data.onmenuselect}  observable = {parent.root.observable} rootid = {parent.rid}></afx-menu>
        </li>
         <li class="afx-corner-fix"></li>
    </ul>
    <script>
        this.items = opts.child || []
        if(opts.index != undefined)
            this.index = opts.index
        else
            this.index = -1
        var isRoot
        var lastChecked = undefined
        if(opts.rootid)
        {
            this.rid = opts.rootid
            isRoot = false
        }
        else
        {
            this.rid = $(this.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
            isRoot = true
        }
        var self = this
        this.onmenuselect = opts.onmenuselect
        checkItem(d)
        {
            if(d.checked == true && d.radio)
            {
                if(lastChecked)
                    lastChecked.checked = false
                lastChecked = d
                lastChecked.checked = true
            } 
            return false
        }
        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            self.update()
        }
        
        self.root.push = function(e,u)
        {
            self.items.push(e)
            if(u)
                self.update()
        }
        self.root.unshift = function(e,u)
        {
            self.items.unshift(e)
            if(u)
                self.update()
        }
        self.root.remove = function(e,u)
        {
            var i = self.items.indexOf(e)
            if(i >= 0)
                self.items.splice(i, 1)
            if(u)
                self.update()
        }
        self.root.update = function()
        {
            self.update()
        }
        self.root.get = function(k)
        {
            return self[k]
        }
        self.root.show = function(e)
        {
            //only for menucontext
            if(opts.context != "true") return
            $(self.root)
                .css("top", e.clientY - 15 + "px")
                .css("left",e.clientX  -5 +  "px")
                .show()
            $(document).on("click",mnhide)
        }

        if(opts.observable)
        {
            this.root.observable = opts.observable
        }
        else
        {
            this.root.observable = riot.observable()
            this.root.observable.on('menuselect',function(data){
                if(self.onmenuselect)
                    self.onmenuselect(data)

                if(opts.context == "true")
                    $(self.root).hide()
                else if(!data.root && self.refs.container)
                {
                    var arr = self.refs.container.length?self.refs.container:[self.refs.container]
                    for( var i in arr)
                        $("afx-menu",arr[i]).first().hide()
                }
            })
        }

        var mnhide = function(event)
        {
            if(opts.context == "true")
            {
                if(!$(event.target).closest(self.root).length) {
                    $(self.root).hide()
                    $(document).unbind("click",mnhide)
                }
                return;
            }
            if(!$(event.target).closest(self.refs.container).length && self.refs.container) {
                var arr = self.refs.container.length?self.refs.container:[self.refs.container]
                for( var i in arr)
                    $("afx-menu",arr[i]).first().hide()
                $(document).unbind("click",mnhide)
            } 
            else 
            {
                if(self.refs.container && self.refs.container.length)
                    for(var i in self.refs.container)
                        if(!$(event.target).closest(self.refs.container[i]).length) {
                            $("afx-menu",self.refs.container[i]).first().hide()
                        } 
            }
        }

        onselect(event)
        {
            var data = {id:self.rid, root:isRoot, e:event, item:event.item}
            if(event.item.data.switch)
            {
                event.item.data.checked = !event.item.data.checked
            } else if(event.item.data.radio)
            {
                if(lastChecked)
                {
                    lastChecked.checked = false
                }
                event.item.data.checked = true   
                lastChecked = event.item.data
            }
            this.root.observable.trigger('menuselect',data)
            if( this.onmenuselect && !isRoot)  this.onmenuselect(data)
            event.preventDefault()
            $(document).unbind("click",mnhide)
            if(opts.context == "true") return
            if(isRoot && self.refs.container)
            {
                if(self.refs.container.length)
                    $("afx-menu",self.refs.container[event.item.i]).first().show()
                else 
                    $("afx-menu",self.refs.container).first().show()
                $(document).on("click",mnhide)
                return
            }
        }

    </script>
</afx-menu>