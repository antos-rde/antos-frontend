<afx-file-view>
    <afx-list-view if = {view == 'icon'} child = {data.items}></afx-list-view>
    <afx-grid-view if = {view == 'list'} header = {data.header} rows = {data.items}></afx-grid-view>
    <afx-tree-view if = {view == 'tree'}></afx-tree-view>

    <script>
        var self = this
        self.root.observable = opts.observable
        self.view = opts.view || 'icon'
        self.data = opts.data
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
    </script>
</afx-file-view>