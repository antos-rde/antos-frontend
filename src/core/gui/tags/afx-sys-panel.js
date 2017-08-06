<afx-sys-panel>
    <div>
        <afx-menu child={osmenu.child} onselect = {osmenu.onselect} class="afx-panel-os-menu"></afx-menu>
        <afx-menu child={appmenu.child} onselect = {appmenu.onselect} class = "afx-panel-os-app"></afx-menu>
        <afx-menu child={systray.child} onselect = {systray.onselect} class = "afx-panel-os-stray"></afx-menu>
    </div>
    
    <script>
        this.osmenu = opts.osmenu
        this.appmenu = opts.appmenu
        this.systray = opts.systray
    </script>
</afx-sys-panel>