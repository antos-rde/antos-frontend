<afx-list-view class = {dropdown: opts.dropdown == "true"}>
    <div class = "list-container" ref = "container">
    <div if = {opts.dropdown == "true"} ref = "current" style = {opts.width?"min-width:" + opts.width + "px;":"min-width:150px;"}  onclick = {show_list}>
    </div>
    <ul  ref = "mlist">
        <li each={item,i in items } class={selected: parent._autoselect(item,i)}  onclick = {parent._select}>
            <i if={item.iconclass} class = {item.iconclass} ></i>
            <i if={item.icon} class="icon-style" style = { "background: url("+item.icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
            { item.text }
            <i if = {item.closable} class = "closable" click = {parent._remove}></i>
        </li>
    </ul>
    </div>
    <script>
        this.items = opts.child || []
        var self = this
        self.selidx = -1
        self.onlistselect = opts.onlistselect
        var onclose = false
        self.root.set = function(k,v)
        {
            if(k == "selected")
            {
                if(self.selidx != -1)
                    self.items[self.selidx].selected =false
                self.items[v].selected = true
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
            if(self.selidx != -1)
            {
                self.items[self.selidx].selected =false
                self.selidx = -1
            }
            self.items.splice(self.items.indexOf(event.item),1)
            self.update()
            onclose = true
        }
        _autoselect(it,i)
        {
            if(!it.selected || it.selected == false) return false
            var data = {
                    id:$(self.root).attr("data-id"), 
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
            if(self.selidx != -1)
                self.items[self.selidx].selected =false
            event.item.item.selected = true
            /*var data = {
                    id:$(self.root).attr("data-id"), 
                    data:event.item.item, 
                    idx:event.item.i}
            
            self.selidx = data.idx
            if(!self.items[self.selidx])
                return 
            
            self.items[self.selidx].selected = true    
            if(opts.dropdown  == "true")
            {
                $(self.refs.mlist).hide()
                self.selectedText = self.items[self.selidx].text
            }
            
            this.root.observable.trigger('listselect',data)
            //event.preventDefault()*/

        }
    </script>
</afx-list-view>