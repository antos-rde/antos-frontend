<afx-button>
    <button disabled={ enable == "false" } onclick="{ _onbtclick }"  > 
        <i class = { icon } ></i> 
        { opts.text }
    </button>
    <script>
        this.enable = opts.enable
        this.icon = opts.icon
        var self = this
        this._onbtclick = function(e)
        {
            if(opts.onbtclick)
                eval(opts.onbtclick)
            if(self.root.observable)
            {
                console.log("btclick")
                self.root.observable.trigger("btclick",this)
            }
        }
    </script>
</afx-button>