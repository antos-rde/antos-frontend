class BuildDialog extends this.OS.GUI.BasicDialog
    constructor: () ->
        super "BuildDialog", {
            tags: [
                { tag: "afx-label", att: 'text="__(Coffees)" data-height="23" class="header"' },
                { tag: "afx-list-view" }
                { tag: "afx-label", att: 'text="__(Javascripts)" data-height="23" class="header"' },
                { tag: "afx-list-view" }
                { tag: "afx-label", att: 'text="__(Css)" data-height="23" class="header"' },
                { tag: "afx-list-view" }
                { tag: "afx-label", att: 'text="__(Copied files)" data-height="23" class="header"' },
                { tag: "afx-list-view" }
                { tag: "div", att: ' data-height="5"' }
            ],
            width: 350,
            height: 450,
            resizable: true,
            buttons: [
                {
                    label: "__(Save)", onclick: (d) ->
                        data =
                            coffees: (v.text for v in (d.find "content1").get "items")
                            javascripts: (v.text for v in (d.find "content3").get "items")
                            css: (v.text for v in (d.find "content5").get "items")
                            copies: (v.text for v in (d.find "content7").get "items")
                        d.handler data if d.handler
                        d.quit()
                },
                { label: "__(Cancel)", onclick: (d) -> d.quit() }
            ],
            filldata: (d) ->
                lv = d.find "content1"
                lv.set "items", ({ text: v } for v in d.parent.prjfile.cache.coffees)
                lv.set "buttons", [
                    {
                        text: "+",
                        onbtclick: (e) ->
                            d.selectFile ["text/coffeescript"], (f) ->
                                lv.push { text: f }, true if f
                    },
                    {
                        text: "-",
                        onbtclick: (e) ->
                            sel = lv.get "selected"
                            return unless sel
                            lv.remove sel, true
                    }
                ]
            
                lv1 = d.find "content3"
                lv1.set "items", ({ text: v } for v in d.parent.prjfile.cache.javascripts)
                lv1.set "buttons", [
                    {
                        text: "+",
                        onbtclick: (e) ->
                            d.selectFile ["application/javascript"], (f) ->
                                lv1.push { text: f }, true if f
                    },
                    {
                        text: "-",
                        onbtclick: (e) ->
                            sel = lv1.get "selected"
                            return unless sel
                            lv1.remove sel, true
                    }
                ]

                lv2 = d.find "content5"
                lv2.set "items", ({ text: v } for v in d.parent.prjfile.cache.css)
                lv2.set "buttons", [
                    {
                        text: "+",
                        onbtclick: (e) ->
                            d.selectFile ["text/css"], (f) ->
                                lv2.push { text: f }, true if f
                    },
                    {
                        text: "-",
                        onbtclick: (e) ->
                            sel = lv2.get "selected"
                            return unless sel
                            lv2.remove sel, true
                    }
                ]

                lv3 = d.find "content7"
                lv3.set "items", ({ text: v } for v in d.parent.prjfile.cache.copies)
                lv3.set "buttons", [
                    {
                        text: "+",
                        onbtclick: (e) ->
                            d.selectFile [".*"], (f) ->
                                lv3.push { text: f }, true if f
                    },
                    {
                        text: "-",
                        onbtclick: (e) ->
                            sel = lv3.get "selected"
                            return unless sel
                            lv3.remove sel, true
                    }
                ]
        }
    
    selectFile: (mimes, f) ->
        me  = @
        @openDialog "FileDiaLog", (d, n, p) ->
            f p.replace me.parent.prjfile.cache.root + "/", ""
        , "__(Select a file)", { mimes: mimes, type: "file", root: @parent.prjfile.cache.root }