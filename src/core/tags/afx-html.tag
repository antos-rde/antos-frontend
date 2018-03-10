<afx-html ref = "container">
    <script>
        this.content = opts.content
        this.root.innerHTML = this.content
        this.updateContent = undefined
        var self = this
        this.root.set = function(k, v)
        {
            self[k] = v
            if(k == "content")
                self.root.innerHTML = v
            else if(k == "updateContent")
                self.update()
        }
        this.on("update", function(){
            if(self.updateContent)
                self.root.innerHTML = self.updateContent()
        })
    </script>
</afx-html>