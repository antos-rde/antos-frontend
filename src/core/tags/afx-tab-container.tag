<afx-tab-container>
    <afx-hbox ref = "mybox" if = {bar == "left"}>
    <afx-tab-bar data-ref="tabbar" ></afx-tab-bar>
    <div data-ref="container"></div>
    </afx-hbox>
    <afx-vbox ref = "mybox" if = { bar == "top"}>
    <afx-tab-bar data-ref="tabbar" ></afx-tab-bar>
    <div data-ref="container"></div>
    </afx-vbox>
    <script>
        this.bar = opts.bar || "top"
        this.barwidth = opts.barwidth
        this.barheight = opts.barheight
        var schemes = []
        var self = this
        var calibrate = function()
        {
            $(self.refs.mybox.root).css("width", $(self.root).width()+"px")
            $(self.refs.mybox.root).css("height", $(self.root).height()+"px")
            self.root.observable.trigger("calibrate")
        }
        self.on("mount", function () {
            self.tabbar = $("[data-ref='tabbar']", self.root)[0]
            self.container = $("[data-ref='container']", self.root)[0]
            if(self.barwidth)
                $(self.tabbar).attr("data-width", self.barwidth)
            if(self.barheight)
                $(self.tabbar).attr("data-height", self.barheight)
            self.root.observable =   (self.parent && self.parent.root && self.parent.root.observable) || opts.observable || riot.observable()
            self.tabbar.set("ontabselect", function(e){
                $(self.container).children().each(function(el){
                    $(this).hide()
                })
                $(e.data.scheme).show()
                e.data.f()
                calibrate()
            })
            self.root.observable.on("resize", function(){
                calibrate()
            })
        })
        var render = function(el)
        {
            var sch = $.parseHTML(el.scheme)
            $(self.container).append(sch)
            el.scheme = sch
            riot.mount(sch, {observable: self.root.observable})
            $(sch).hide()
            el.f()
            self.root.observable.trigger("tabrendered")
            //self.root.observable.trigger("calibrate")
        }
        var addTab = function(el)
        {
            if(!el.f)
                el.f = (function(){})
            self.tabbar.push(el)
            if(el.url)
            {
                el.url.asFileHandler().read(function(d){
                    el.scheme = d
                    render(el)
                })
            }
            else
            {
                render(el)
            }
        }
        self.root.setTabs = function(arr)
        {
            if(arr.length <= 0)
            {
                self.tabbar.set("selected", 0)
                return
            }
            self.root.observable.one("tabrendered", function(){
                arr.splice(0,1)
                self.root.setTabs(arr)
            })
            addTab(arr[0])
        }
    </script>
</afx-tab-container>