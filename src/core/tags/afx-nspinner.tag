<afx-nspinner>
<input ref = "holder" type="text" value = {value}></input>
<ul ref = "spinner">
    <li class = "incr" ref= "incr"  onclick="{ _incr }"> <i></i> </li>
    <li class = "decr" ref = "decr"  onclick="{ _decr }"> <i></i> </li>
</ul>
<script>

this.value = eval(opts.value) || 0
this.step = Number(opts.step) || 1
this.onchange = opts.onchange
var self = this
this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
self.root.set = function(k,v)
{
    if(k == "*")
        for(var i in v)
            self[i] = v[i]
    else
        self[k] = v
    self.update()
}
self.root.get = function(k)
{
    return self[k]
}

self._incr = function(e)
{
    self.value = self.value + self.step;
    self.update();
    if(self.onchange) self.onchange(self.value);
}

self.on("mount", function(){
    self.root.observable = opts.observable || (self.parent && self.parent.root && self.parent.root.observable) || riot.observable()
    $(self.refs.spinner).css("width", "20px" );
    var cl = function()
    {
        $(self.refs.holder).css("width", $(self.root).width() - 20 + "px" )
        $(self.refs.holder).css("height", $(self.root).height() + "px" )
        $(self.refs.spinner)
            .css("width","20px")
            .css("height", $(self.root).height() + "px" )

        $(self.refs.incr)
            .css("height", $(self.root).height()/2 - 2 + "px")
            .css("position", "relative")
        $(self.refs.decr).css("height", $(self.root).height()/2 -2 + "px")
            .css("position", "relative")
        $(self.refs.spinner).find("li")
            .css("display","block")
            .css("text-align", "center")
            .css("vertical-align", "middle")
        $(self.refs.spinner).find("i")
            .css("font-size", "16px")
            .css("position", "absolute")
        var fn = function(ie, pos)
        {
            var el = $(ie).find("i")
            el
            .css(pos,($(ie).height()-el.height()) /2 + "px" )
            .css("left", ($(ie).width()-el.width())/2 + "px" )
        }
        fn(self.refs.decr, "bottom")
        fn(self.refs.incr, "top")
    }
    cl()
    self.root.observable.on("calibrate", function(){
        cl()
    })
    self.root.observable.on("resize", function(){
        cl()
    });
    $(self.refs.holder).on('keyup', function (e) {
    if (e.keyCode == 13) {
        var val = self.refs.holder.value;
        if(!isNaN(val))
        {
            val = eval(val)
            if(val < 0)
                val = self.value;
            self.value = val;
        }
        self.refs.holder.value = self.value;
        if(self.onchange) self.onchange(self.value);
    }
});
})

self._decr = function(e)
{
    if(self.value == 0) return;
    self.value = self.value - self.step;
    self.update();
    if(self.onchange) self.onchange(self.value);
}

</script>
</afx-nspinner>