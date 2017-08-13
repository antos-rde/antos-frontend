<afx-list-view class = {dropdown: opts.dropdown == "true"}>
    <div class = "list-container" ref = "container">
    <div if = {opts.dropdown == "true"} ref = "current" style = {opts.width?"min-width:" + opts.width + "px;":"min-width:150px;"}  onclick = {show_list}>
        {selectedText}
    </div>
    <ul  ref = "mlist">
        <li each={ items } class={selected: selected}  onclick = {parent._select}>
            <i if={iconclass} class = {iconclass} ></i>
            <i if={icon} class="icon-style" style = { "background: url("+icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
            { text }
        </li>
    </ul>
    </div>
    <script>
        this.items = opts.child
        var self = this
        self.selidx = -1
        self.selectedText = ""
        self.onlistselect = opts.onlistselect
        self.root.set = function(k,v)
        {
            if(k == "selected")
                self._select({item:self.items[v], preventDefault:function(){}})
            else if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            self.update()
        }
        self.root.update = function()
        {
            self.update()
        }
        self.root.get = function(k)
        {
            if(k == "selected")
                return self.items[self.selidx]
            return self[k]
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
        show_list()
        {
            var desktoph = $("#desktop").height()
            var off = $(self.root).offset().top + $(self.refs.mlist).height()
            console.log(desktoph,off)
            if( off > desktoph )
                $(self.refs.mlist)
                    .css("top","-" +  $(self.refs.mlist).outerHeight() + "px")
            else 
                $(self.refs.mlist).css("top","100%")
            $(self.refs.mlist).show()
        }
        _select(event)
        {
            var data = {
                    id:$(self.root).attr("data-id"), 
                    data:event.item, 
                    idx:self.items.indexOf(event.item)}
            if(self.selidx != -1)
                self.items[self.selidx].selected =false
            self.selidx = data.idx
            self.items[self.selidx].selected = true
            if(opts.dropdown  == "true")
            {
                $(self.refs.mlist).hide()
                self.selectedText = self.items[self.selidx].text
            }
            if(self.onlistselect)
                self.onlistselect(data)
            this.root.observable.trigger('listselect',data)
            event.preventDefault()
        }
    </script>
</afx-list-view>