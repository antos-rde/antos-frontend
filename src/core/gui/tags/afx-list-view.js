<afx-list-view>
    <ul>
        <li each={ items } class = {child != null ? "afx-sublist":""} onclick = {parent.onselect}>
            <afx-list-view if={child != null} child={child} observable = {parent.observable} ></afx-list-view>
        </li>
    </ul>
    <script>
        this.items = opts.child
        if(opts.observable)
            this.observable = opts.observable
        else if(this.root.observable)
            this.observable = this.root.observable
        else
        {
            this.observable = riot.observable()
            this.observable.on('listselect',function(data){
                if(opts.listselect)
                    opts.listselect(data)
            })
        }

        onselect(event)
        {
            
           this.observable.trigger('listselect',event.item)
           event.preventDefault()
        }
    </script>
</afx-list-view>