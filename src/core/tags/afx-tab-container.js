<afx-tab-container>
    <afx-list-view   ref = "list" />
    <script>
        var self = this
        this.closable = opts.closable || false
        self.root.observable = opts.observable || riot.observable()
        get_observable(){
            return self.root.observable
        }

        self.root.get = function (k) {
            return self.refs.list.root.get(k)
        }


        self.on("mount", function(){
            self.refs.list.root.observable = self.root.observable
            /*self.root.observable.on("listselect", function(){
                console.log("list select")
            })*/
            self.refs.list.root.set ("onlistselect",function (e) {
                self.root.observable.trigger("tabselect", e)
            })
        })

        self.root.set = function (k,v){
            if( k == "*")
                for(var i in v)
                    self.refs.list.root.set(i,v[i])
            else if(k == "closable")
            {
                self.closable = v
            }
            else
            {
                if(k == "items")
                {
                    for(var i in v)
                        v[i].closable = self.closable
                }
                self.refs.list.root.set(k,v)
            }
            //self.update()
        }

        self.root.push = function(e,u)
        {
            e.closable = self.closable
            self.refs.list.root.push(e,u)
        }
        self.root.unshift = function(e,u)
        {
            self.refs.list.root.unshift(e,u)
        }
        self.root.remove = function(e,u)
        {
            self.refs.list.root.remove(e,u)
        }
    </script>
</afx-tab-container>