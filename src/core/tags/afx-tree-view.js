<afx-tree-view>

  <div ref = namediv class={afx_tree_item_selected:treeroot.selectedItem && treeroot.selectedItem.path == path, afx_folder_item: isFolder(), afx_tree_item_odd: index%2 != 0  } click={select}>
    <i if={ !isFolder() && iconclass} class = {iconclass} ></i>
    <i if={!isFolder() && icon} class="icon-style" style = { "background: url("+icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>

    <span onclick={ toggle } if={ isFolder() } class={open ? 'afx-tree-view-folder-open' : 'afx-tree-view-folder-close'}></span>
    { name }
  </div>


  <ul if={ isFolder() } show={ isFolder() && open }>
    <li each={ child, i in nodes }>
      <afx-tree-view data={child} indent={indent+1} observable = {parent.root.observable} path = {parent.path + ">" + i} treeroot= {parent.treeroot}></afx-tree-view>
    </li>
  </ul>

    <script>
        var self = this
        if(opts.data)
        {
            self.name = opts.data.name
            self.nodes = opts.data.nodes
            self.icon = opts.data.icon   
        }
        self.indent = opts.indent || 1
        self.open = true
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
        self.path = opts.path || 0
        self.selected = false
        self.selectedItem = null
        self.index = this.treeroot.counter
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

        if(opts.observable)
            this.root.observable = opts.observable
        else
        {
            this.root.observable = riot.observable()
        }
        
        this.on("mount", function(){
            $(self.refs.namediv).css("padding-left", self.indent*15 + "px" )
        })

        isFolder() {
            return self.nodes && self.nodes.length
        }

        toggle(e) {
            self.open = !self.open
            e.preventDefault()
            istoggle = true
        }

        select(event)
        {
            if(istoggle)
            {
                istoggle = false 
                return
            }
            var data = {
                id:$(self.treeroot.root).attr("data-id"), 
                data:event.item,
                path:self.path
            } 
            if(opts.ontreeselect)
                opts.ontreeselect(data)
            self.treeroot.selectedItem = data
           this.root.observable.trigger('treeselect',data)
           event.preventUpdate = true
           self.treeroot.update()
           event.preventDefault()
        }
    </script>
</afx-tree-view>