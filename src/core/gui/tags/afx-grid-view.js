<afx-grid-view>
    <afx-grid-row ref="gridhead" rootid = {rid} observable = {root.observable} header="true" class = {grid_row_header:header} if = {header} cols = {header}> </afx-grid-row>
    <div ref = "scroller" style="width:100%; overflow:auto;">
        <div ref = "container">
            <afx-grid-row each={ child, i in rows } class = {selected: child.selected}  rootid = {parent.rid} observable = {parent.root.observable}  cols = {child}  onclick = {parent._select}></afx-grid-row>
        </div>
    </div>
    <script>
        this.rows= []
        if(opts.data)
        {
            this.header = opts.data.header 
            this.rows = opts.data.data
        }
        var self = this 
        this.rid = $(self.root).attr("data-id")
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
        var calibrate_size = function()
        {
            if(self.header)
            {
                $(self.refs.scroller).css("height",
                    $(self.root).height() - $(self.refs.gridhead.root).height()
                + "px")
            }
            else
                $(self.refs.scroller).css("height","100%")
            
        }
        self.root.get = function(k)
        {
            if(k == "selected")
                return (self.selidx == -1?null:self.rows[self.selidx])
            return self[k]
        }

        if(opts.observable)
            this.root.observable = opts.observable
        else
        {
            this.root.observable = riot.observable()
        }

        this.on("mount", function(){
            $(self.refs.container)
                .css("display","flex")
                .css("flex-direction","column")
                .css("width","100%")
            calibrate_size()

            this.root.observable.on("resize",function(){
                calibrate_size()
                if(self.refs.gridhead)
                    self.refs.gridhead.calibrate_size()
            })
        })
        this.on("updated",function(){
            if(self.selidx >= self.rows.length)
                self.selidx = -1
            if(self.nrow == self.rows.length) return
            self.nrow = self.rows.length
            calibrate_size()
            if(self.refs.gridhead)
                self.refs.gridhead.calibrate_size()
        })
        _select(event)
        {
            var data = {
                    id:self.rid, 
                    data:event.item}
            if(opts.onlistselect)
                opts.onlistselect(data)
            console.log(data)
            if(self.selidx != -1)
                self.rows[self.selidx].selected =false
            self.selidx = event.item.i
            self.rows[self.selidx].selected = true
            this.root.observable.trigger('gridselect',data)
            event.preventUpdate = true
           self.update()
           event.preventDefault()
        }
    </script>
</afx-grid-view>

<afx-grid-row>
    <div style = "flex-grow:1;" each = { child,i in cols } class = {string:typeof child.value == "string", number: typeof child.value == "number"} >
        <i if={child.iconclass} class = {child.iconclass} ></i>
        <i if={child.icon} class="icon-style" style = { "background: url("+child.icon+");background-size: 100% 100%;background-repeat: no-repeat;" }></i>
        {child.value}
    </div>
    <script>
        this.cols = opts.cols || []
        var self = this
        this.rid = opts.rootid
        this.observable = opts.observable
        this.header = opts.header||false
        this.calibrate_size = function()
        {
            if(!self.cols || self.cols.length == 0 || !self.observable) return
            var totalw = $(self.root).parent().width()
            var ocw = 0
            var nauto = 0
            var dist = []
            $.each(self.cols, function(i,e){
                if(e.width)
                {
                    dist.push(e.width)
                    ocw += e.width
                }
                else
                {
                    dist.push(-1)
                    nauto++
                }
            })
            if(nauto > 0)
            {
                var cellw = (totalw - ocw)/ nauto
                $.each(dist,function(i,e){
                    if(e == -1) dist[i] = cellw
                })
            }

            self.observable.trigger("cellresize",{id:self.rid,data:dist})
        }

        self.observable.on("cellresize",function(d){
            if(d.id && d.id == self.rid)
            {
                var i = 0
                $(self.root)
                    .children()
                    .each(function(){
                        $(this).css("width", d.data[i]+"px")
                        i++
                    })
            }
        })

        this.on("mount", function(){
            $(self.root)
                .css("display","flex")
                .css("flex-direction","row")
                .css("width","100%")
            if(self.header)
                self.calibrate_size()
        })
    </script>
</afx-grid-row>