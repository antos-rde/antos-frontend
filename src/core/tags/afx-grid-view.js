<afx-grid-view>
    <afx-grid-row ref="gridhead" rootid = {rid} observable = {root.observable} header="true" class = {grid_row_header:header} if = {header} cols = {header}> </afx-grid-row>
    <div ref = "scroller" style="width:100%; overflow:auto;">
        <div ref = "container">
            <afx-grid-row each={ child, i in rows } class = {selected: child.selected}  rootid = {parent.rid} observable = {parent.root.observable} index = {i}  cols = {child}  onclick = {parent._select} head = {parent.refs.gridhead} ></afx-grid-row>
        </div>
    </div>
    <script>
        this.header = opts.header 
        this.rows = opts.rows || []
        var self = this 
        this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
        self.selidx = -1
        self.nrow = 0
        self.root.set = function(k,v)
        {
            if(k == "selected")
                self._select({item:self.rows[v], preventDefault:function(){}})
            else if(k == "*")
                for(var i in v)
                    self[i] = v[i]
            else
                self[k] = v
            self.update()
        }
        this.calibrate_size = function()
        {
            if(self.header)
            {
                $(self.refs.scroller).css("height",
                    $(self.root).height() - $(self.refs.gridhead.root).children().first().height()
                + "px")
            }
            else
                $(self.refs.scroller).css("height",
                    $(self.root).height() + "px")
            
        }
        self.root.get = function(k)
        {
            if(k == "selected")
                return (self.selidx == -1?null:self.rows[self.selidx])
            return self[k]
        }

        this.root.observable = opts.observable || riot.observable()

        this.on("mount", function(){
            $(self.refs.container)
                .css("display","table")
                //.css("flex-direction","column")
                .css("width","100%")
            self.calibrate_size()

            this.root.observable.on("resize",function(){
                self.calibrate_size()
            })
        })
        this.on("updated",function(){
            if(self.selidx >= self.rows.length)
                self.selidx = -1
            if(self.nrow == self.rows.length) return
            self.nrow = self.rows.length
            self.calibrate_size()
        })
        _select(event)
        {
            var data = {
                    id:self.rid, 
                    data:event.item}
            if(opts.onlistselect)
                opts.onlistselect(data)
            if(self.selidx != -1)
                self.rows[self.selidx].selected =false
            self.selidx = event.item.i
            self.rows[self.selidx].selected = true
            this.root.observable.trigger('gridselect',data)
            event.preventUpdate = true
            self.update()
            //event.preventDefault()
        }
        
    </script>
</afx-grid-view>

<afx-grid-row>
    <div style = {!header? "display: table-cell;" :""} onclick = {parent._cell_select}  each = { child,i in cols } class = {string:typeof child.value == "string", number: typeof child.value == "number", cellselected: parent._auto_cell_select(child,i)} >
        <i if={child.iconclass} class = {child.iconclass} ></i>
        <i if={child.icon} class="icon-style" style = { "background: url("+child.icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
        {child.value}
    </div>
    <script>
        this.cols = opts.cols || []
        var self = this
        this.rid = opts.rootid
        this.index = opts.index
        this.header = opts.header||false
        this.head = opts.head
        this.selidx = -1;
        self.observable = opts.observable
        this.colssize = []
        var update_header_size = function()
        {
            if(!self.cols || self.cols.length == 0) return
            var totalw = $(self.root).parent().width()
            if(totalw == 0) return
            var ocw = 0
            var nauto = 0
            self.colssize = []
            $.each(self.cols, function(i,e){
                if(e.width)
                {
                    self.colssize.push(e.width)
                    ocw += e.width
                }
                else
                {
                    self.colssize.push(-1)
                    nauto++
                }
            })
            if(nauto > 0)
            {
                var cellw = parseInt((totalw - ocw)/ nauto)
                $.each(self.colssize,function(i,e){if(e == -1) self.colssize[i] = cellw})
            }
            calibrate_size()
        }
        var calibrate_size = function()
        {
            var i = 0
            $(self.root)
                .children()
                .each(function(){
                    $(this).css("width", self.colssize[i]+"px")
                    i++
                })
        }
        this.on("updated", function(){
            if(self.header)
                update_header_size()
            else if(self.head && self.index == 0)
            {
                self.colssize = self.head.colssize
                calibrate_size()
            }
            
        })
        this.on("mount", function(){
            if (self.header)
            {
                $(self.root)
                    .css("display", "flex")
                    .css("flex-direction", "row")
                update_header_size()
            }
             else 
             {
                $(self.root)
                .css("display","table-row")
                //.css("flex-direction","row")
                .css("width","100%")
                if(self.head && self.index == 0)
                {
                    self.colssize = self.head.colssize
                    calibrate_size()
                }
             }
             self.observable.on("gridcellselect", function(data){
                if(data.id != self.rid || self.selidx == -1) return;
                if(data.row != self.index)
                {
                    self.cols[self.selidx].selected = false
                    self.selidx = -1
                }
            })
        })
        _cell_select(event)
        {
            if(self.header) return;
            if(self.selidx != -1)
            {
                self.cols[self.selidx].selected = false
                self.selidx = -1
            }
            self.cols[event.item.i].selected = true
            
        }
        _auto_cell_select(child,i)
        {
            if(!child.selected || self.header) return false;
            if(self.selidx == i) return true;
            var data = {
                    id:self.rid, 
                    data:child, 
                    col:i,
                    row:self.index}
            
            self.selidx = i
            self.observable.trigger("gridcellselect",data)
            return true;
        }
    </script>
</afx-grid-row>