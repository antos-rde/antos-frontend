<afx-menu>
    <ul>
        <li class="afx-corner-fix"></li>
        <li each={ items } class = {child != null ? "afx-submenu":""}>
            <a href="#" onclick = {parent.onselect}>
                <i class = {icon} ></i>{ text }
            </a>
            
            <afx-menu if={child != null} child={child} observable = {parent.root.observable} ></afx-menu>
        </li>
         <li class="afx-corner-fix"></li>
    </ul>
    <script>
        this.items = opts.child
        if(opts.observable)
        {
            this.root.observable = opts.observable
        }
        else
        {
            this.root.observable = riot.observable()
            this.root.observable.on('menuselect',function(data){
                if(opts.onmenuselect)
                {
                    opts.onmenuselect(data)
                }
            })
        }


        onselect(event)
        {
           this.root.observable.trigger('menuselect',event.item)
           event.preventDefault()
        }

    </script>
</afx-menu>