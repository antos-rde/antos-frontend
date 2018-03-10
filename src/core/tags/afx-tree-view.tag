<afx-tree-view>

  <div class={afx_tree_item_selected:treeroot.selectedItem && treeroot.selectedItem.treepath == data.treepath, afx_folder_item: isFolder(), afx_tree_item_odd: index%2 != 0  } onclick={select} ondblclick = {_dbclick} oncontextmenu = {select}>
    <ul style = "padding:0;margin:0;white-space: nowrap;">
        <li ref = "padding" ></li>
        <li class = "itemname" style="display:inline-block;" >
            <i if={ !isFolder() && data.iconclass} class = {data.iconclass} ></i>
            <i if={!isFolder() && data.icon} class="icon-style" style = { "background: url("+data.icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>

            <span onclick={ toggle } if={ isFolder() } class={open ? 'afx-tree-view-folder-open' : 'afx-tree-view-folder-close'}></span>
            { data.name }
        </li>
    </ul>
  </div>


  <ul if={ isFolder() } show={ isFolder() && open }>
    <li each={ child, i in data.nodes }>
      <afx-tree-view ontreeselect = {parent.ontreeselect} index = {i} fetch = {parent.fetch} ontreedbclick = {parent.ontreedbclick} data={child} indent={indent+1} observable = {parent.root.observable} path = {parent.data.treepath + ">" + i} treeroot= {parent.treeroot}></afx-tree-view>
    </li>
  </ul>

    <script>
        var self = this
        self.open = true
        self.data = { name:"", nodes:null, treepath: opts.path, i:-1}
        if(opts.data)
        {
            self.data = opts.data
            //self.name = opts.data.name
            //self.nodes = opts.data.nodes
            //self.icon = opts.data.icon
            self.open = opts.data.open == undefined?true:opts.data.open
            //self.iconclass = opts.data.iconclass  
        }
        self.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        self.data.rid = self.rid
        self.data.i = opts.index
        self.ontreeselect = opts.ontreeselect
        self.ontreedbclick = opts.ontreedbclick
        self.fetch = opts.fetch
        self.indent = opts.indent || 0
        var istoggle = false
        if(opts.treeroot)
        {
            this.treeroot = opts.treeroot
            this.treeroot.counter++
        }
        else
        {
            this.treeroot = self
            this.treeroot.counter = 0
        }
        self.data.treepath = opts.path || 0
        //self.selected = false
        self.selectedItem = null
        self.index = this.treeroot.counter
        
        var _dfind = function(l,d, k, v)
        {
            if( d[k] == v ) return l.push(d)
            if(d.nodes && d.nodes.length > 0)
                for(var i in d.nodes)
                    _dfind(l, d.nodes[i],k,v)
        }
        self.root.find = function(k, v)
        {
            var l = []
            _dfind(l,self.data,k,v)
            return l
        }

        self.root.set = function(k,v)
        {
            if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else if (k == "data")
                for(var i in v)
                    self.data[i] = v[i]
            else if (k == "selectedItem")
            {
                if(self.ontreeselect)
                    self.ontreeselect(self.data)
                self.treeroot.selectedItem = v
                self.root.observable.trigger('treeselect',self.data)
            }
            else
                self[k] = v
            self.update()
        }
        self.root.get = function(k)
        {
            //if(k == "data")
            //    return {name:self.name, nodes: self.nodes, icon:self.icon, iconclass: self.iconclass, selectedItem:self.selectedItem}
            return self[k]
        }

        if(opts.observable)
            this.root.observable = opts.observable
        else
        {
            this.root.observable = riot.observable()
        }
        
        this.on("mount", function(){
            $(self.refs.padding)
                .css("display", "inline-block")
                .css("height","1px")
                .css("padding",0)
                .css("margin", 0)
                .css("background-color","transparent")
                .css("width", self.indent*15 + "px" )
        })

        isFolder() {
            return self.data.nodes //&& self.nodes.length
        }

        toggle(e) {
            self.open = !self.open
            e.preventDefault()
            istoggle = true

            if(self.open && self.data.nodes.length == 0 && self.fetch)
            {
                self.fetch(e.item, function(d){
                    self.data.nodes = d
                    self.update()
                })
            }
        }
        
        select(event)
        {
            if(istoggle)
            {
                istoggle = false 
                return
            }
            /*var data = {
                id:self.rid, 
                data:event.item,
                path:self.data.path
            } */
            if(self.ontreeselect)
                self.ontreeselect(self.data)
            self.treeroot.selectedItem = self.data
           this.root.observable.trigger('treeselect',self.data)
           event.preventUpdate = true
           self.treeroot.update()
           event.preventDefault()
        }
        _dbclick(event)
        {
            if(istoggle)
            {
                istoggle = false 
                return
            }
            /*data =  {
                    id:self.rid, 
                    data:event.item,
                    path: self.data.path}*/
            if(self.ontreedbclick)
            {
                self.ontreedbclick(self.data)
            }
            self.root.observable.trigger('treedbclick', self.data)
        }
    </script>
</afx-tree-view>