<afx-list-view class = {dropdown: opts.dropdown == "true"}>
    <div class = "list-container" ref = "container">
    <div if = {opts.dropdown == "true"} ref = "current" style = {opts.width?"min-width:" + opts.width + "px;":"min-width:150px;"}  onclick = {show_list}>
    </div>
    <ul  ref = "mlist">
        <li each={item,i in items } class={selected: parent._autoselect(item,i)} ondblclick = {parent._dbclick}  onclick = {parent._select} oncontextmenu = {parent._select}>
            <afx-label color = {item.color} iconclass = {item.iconclass} icon = {item.icon} text = {item.text}></afx-label>
            <i if = {item.closable} class = "closable" click = {parent._remove}></i>
            <ul if = {item.complex} class = "complex-content">
                <li each = {ctn,j in item.content} class = {ctn.class}>{ctn.text}</li>
            </ul>
        </li>
    </ul>
    </div>
    <script>
        this.items = opts.items || []
        var self = this
        self.selidx = -1
        self.onlistselect = opts.onlistselect
        self.onlistdbclick = opts.onlistdbclick
        self.onitemclose = opts.onitemclose
        var onclose = false
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        self.root.set = function(k,v)
        {
            if(k == "selected")
            {
                if(self.selidx != -1)
                    self.items[self.selidx].selected =false
                if(v == -1)
                    self.selidx = -1
                else
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
                if(self.selidx != -1)
                    return self.items[self.selidx]
                else
                    return undefined
            else if(k == "count")
                return self.items.length
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
                onclose = true
            }
        }
        if(opts.observable)
            this.root.observable = opts.observable
        else
        {
            this.root.observable = riot.observable()
        }
        
        this.on("mount", function(){
            if(opts.dropdown == "true")
            {
                $(document).click(function(event) { 
                    if(!$(event.target).closest(self.refs.container).length) {
                        $(self.refs.mlist).hide()
                    }
                })
                //$(self.root).css("position","relative")
                $(self.refs.container)
                        .css("position","absolute")
                        .css("display","inline-block")
                        
                $(self.refs.mlist)
                    .css("position","absolute")
                    .css("display","none")
                    .css("top","100%")
                    .css("left","0")
                
                self.root.observable.on("vboxchange", function(e){
                   if(e.id == self.parent.rid)
                        $(self.refs.container).css("width", $(self.root).parent().innerWidth() + "px" )
                })
            }
        })
        show_list(event)
        {
            var desktoph = $("#desktop").height()
            var off = $(self.root).offset().top + $(self.refs.mlist).height()
            if( off > desktoph )
                $(self.refs.mlist)
                    .css("top","-" +  $(self.refs.mlist).outerHeight() + "px")
            else 
                $(self.refs.mlist).css("top","100%")
            $(self.refs.mlist).show()
            //event.preventDefault()
            event.preventUpdate = true
        }
        _remove(event)
        {
            r = true
            if(self.onitemclose)
                r = self.onitemclose(event)
            if(r)
                self.root.remove(event.item.item, true)
        }
        _autoselect(it,i)
        {
            if(!it.selected || it.selected == false) return false
            if(self.selidx == i) return true 
            var data = {
                    id:self.rid, 
                    data:it, 
                    idx:i}
            //if(self.selidx != -1)
             //   self.items[self.selidx].selected =false
            self.selidx = i
            if(opts.dropdown  == "true")
            {
                $(self.refs.mlist).hide()
                $(self.refs.current).html(it.text)
            }
            
            if(self.onlistselect)
                self.onlistselect(data)
            this.root.observable.trigger('listselect',data)
            //console.log("list select")
            return true
        }
        _select(event)
        {
            if(onclose)
            {
                onclose = false
                event.preventUpdate = true
                return
            }
            if(self.selidx != -1 && self.selidx < self.items.length)
                self.items[self.selidx].selected =false
            event.item.item.selected = true
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
</afx-list-view>