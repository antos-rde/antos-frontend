Ant.OS.GUI.tag = {}
Ant.OS.GUI.zindex = 10
class Ant.OS.GUI.BaseTag
    constructor: (@root,  @observable) ->
        @opts = {}
        me = @
        @observable = new Ant.OS.API.Announcer() unless @observable
        # export to rootnode
        @root.observable = @observable
        @root.set = (k, v) -> me.set k, v
        @root.get = (k) -> me.get k
        @root.aid = () -> me.aid()
        @refs = {}
        @setopt "data-id", Math.floor(Math.random() * 100000) + 1
        @children = []

        for obj in @layout()
            dom = @mkui obj
            if dom
                if @refs.yield
                    @children = $(@root).children()
                    $(v).detach().appendTo @refs.yield for v in @children
                    $(dom).appendTo(@root)
                else
                    # $(@root).empty()
                    $(dom).appendTo(@root)

    setopt: (name, val) ->
        value = val
        if ($(@root).attr name)
            v = $(@root).attr name
            try
                value = JSON.parse(v)
            catch e
                value = v
        @set name, value
    
    set: (opt, value) ->
        if opt is "*"
            @set k, v for k, v of value
        else
            @opts[opt] = value
            @["on_#{opt}_changed"](value) if @["on_#{opt}_changed"]
        @
    
    aid: () ->
        @get "data-id"
    

    get: (opt) ->
        return @opts if opt is "*"
        @opts[opt]
    
    uify: () ->
        @mount()
        v.uify(@observable) for v in @children
        @root

    mount: () ->

    layout: () ->
        []
        # should be defined by subclasses

    mkui: (tag) ->
        return undefined unless tag
        dom = $("<#{tag.el}>")
        $(dom).addClass tag.class if tag.class
        if tag.children
            $(@mkui(v)).appendTo(dom) for v in tag.children
        if tag.ref
            @refs[tag.ref] = dom[0]
        # dom.mount @observable
        dom[0].uify(@observable)

Element.prototype.uify = (observable) ->
    tag = @tagName.toLowerCase()
    if RegExp("afx-*", "i" ).test(tag) and Ant.OS.GUI.tag[tag]
        o = new Ant.OS.GUI.tag[tag](@, observable)
        return o.uify()
    ### else
        $(@).children().each () ->
            @uify(observable) ###
    return @

Ant.OS.GUI.define = (name, cls) ->
    Ant.OS.GUI.tag[name] = cls

