<afx-menu>
    <ul>
        <li class="afx-corner-fix"></li>
        <li each={ items } class = {child != null ? "afx-submenu":""}>
            <a href="#" onclick = {parent.onselect}>
                <i class = {icon} ></i>{ text }
            </a>
            
            <afx-menu if={child != null} child={child} observable = {parent.observable} ></afx-menu>
        </li>
         <li class="afx-corner-fix"></li>
    </ul>
    <script>
        this.items = opts.child
        if(opts.observable)
            this.observable = opts.observable
        else
        {
            this.observable = riot.observable()
            this.observable.on('select',function(data){
                if(opts.onselect)
                    opts.onselect(data)
            })
        }

        onselect(event)
        {
            
           this.observable.trigger('select',event.item)
           event.preventDefault()
        }

    </script>
</afx-menu>