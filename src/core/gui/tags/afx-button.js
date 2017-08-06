<afx-button>
    <button disabled={ enable == "false" } onclick="{ onclick }"  > 
        <i class = { icon } ></i> 
        { opts.text }
    </button>
    <script>
        this.enable = opts.enable
        this.icon = opts.icon
        this.onclick = function(e) {
            if(opts.onclick)
            {
                e.preventDefault()
            } 
        }
    </script>
</afx-button>