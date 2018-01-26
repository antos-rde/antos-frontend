<afx-float-list ref = "container">
    <div each={item,i in items } class={float_list_item:true, float_list_item_selected: parent._autoselect(item,i)} ondblclick = {parent._dbclick}  onmousedown = {parent._select} oncontextmenu = {parent._select}>
        <afx-label color = {item.color} iconclass = {item.iconclass} icon = {item.icon} text = {item.text}></afx-label>
    </div>

    <script>
        this.items = opts.items || []
        var self = this
        self.selidx = -1
        self.onlistselect = opts.onlistselect
        self.onlistdbclick = opts.onlistdbclick
        self.fetch = undefined
        this.root.observable = opts.observable || riot.observable()
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        self.dir =  opts.dir || "horizontal"

        self.root.set = function(k,v)
        {
            if(k == "selected")
            {
                if(self.selidx != -1)
                    self.items[self.selidx].selected =false
                if(self.items[v]) self.items[v].selected = true
            }
            else if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            self.update()
        }
        self.root.get = function(k)
        {
            if(k == "selected")
                if(self.selidx == -1)
                    return undefined
                else
                    return self.items[self.selidx]
            return self[k]
        }
        self.root.push = function(e,u)
        {
            self.items.push(e)
            if(u) self.update()
        }
        self.root.unshift = function(e,u)
        {
            self.items.unshift(e)
            if(u) self.update()
        }
        self.root.remove = function(e,u)
        {
            var i = self.items.indexOf(e)
            if(i >= 0)
            {
                if(self.selidx != -1)
                {
                    self.items[self.selidx].selected =false
                    self.selidx = -1
                }
                self.items.splice(i, 1)
                if(u)
                    self.update()
            }
        }

        self.root.refresh = function()
        {
            _refresh()
        }

        this.on("mount", function(){
            if(self.root.ready)
                self.root.ready(self.root)
            // now refresh the list
            _refresh()  
        })

        var _refresh = function()
        {
            var ctop = 20
            var cleft = 20
            var gw = $(self.refs.container).width()
            var gh = $(self.refs.container).height()
            $(self.refs.container)
            .children()
            .each(function(e)
            {
                $(this).unbind("mousedown")
                _enable_drag($(this))
                var w = $(this).width()
                var h = $(this).height()
                $(this).css("top", ctop + "px").css("left", cleft + "px")
                if(self.dir == "horizontal")
                {
                    ctop += h + 20
                    if(ctop > gh)
                    {
                        ctop = 20
                        cleft += w + 20
                    } 
                }
                else
                {
                    cleft += w + 20
                    if(cleft > gw )
                    {
                        cleft = 20
                        ctop += h + 20
                    }
                }
            })
        }

        var _enable_drag = function(el)
        {
            var globalof = $(self.refs.container).offset()
            el
                .css("user-select","none")
                .css("cursor","default")
                .css("position",'absolute')
                .on("mousedown", function(e){
                    e.preventDefault()
                    offset = el.offset()
                    offset.top = e.clientY - offset.top
                    offset.left = e.clientX - offset.left
                    $(window).on("mousemove", function(e){
                        var top,left
                        top  = e.clientY - offset.top - globalof.top
                        left = e.clientX - globalof.top - offset.left
                        left = left < 0?0:left
                        top = top < 0?0:top
                        el.css("top", top +"px").css("left",left + "px")
                    })
                    $(window).on("mouseup", function(e){
                        //console.log("unbind mouse up")
                        $(window).unbind("mousemove", null)
                    })
                })
        }
        _autoselect(it,i)
        {
            if(!it.selected || it.selected == false) return false
            var data = {
                    id:self.rid, 
                    data:it, 
                    idx:i}
            //if(self.selidx != -1)
             //   self.items[self.selidx].selected =false
            self.selidx = i

            if(self.onlistselect)
                self.onlistselect(data)
            this.root.observable.trigger('listselect',data)
            return true
        }
        _select(event)
        {
            if(self.selidx != -1 && self.selidx < self.items.length)
                self.items[self.selidx].selected =false
            event.item.item.selected = true
            //self.update()
        }

        _dbclick(event)
        {
            data =  {
                    id:self.rid, 
                    data:event.item.item,
                    idx: event.item.i}
            if(self.onlistdbclick)
                self.onlistdbclick(data)
            self.root.observable.trigger('listdbclick', data)
        }
    </script>
</afx-float-list>