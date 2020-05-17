Ant.OS.GUI.tag = {}
Ant.OS.GUI.zindex = 10
class Ant.OS.GUI.BaseTag
    constructor: (@root,  @observable) ->
        @opts = {}
        @observable = new Ant.OS.API.Announcer() unless @observable
        # export to rootnode
        @root.observable = @observable
        @root.set = (k, v) => @set k, v
        @root.get = (k) => @get k
        @root.aid = () => @aid()
        @root.calibrate = () => @calibrate()
        @root.sync = () => @sync()
        @mounted = false
        @root.setup = () => @setup()
        @refs = {}
        @setopt "data-id", (Math.floor(Math.random() * 100000) + 1).toString()
        @setopt "tooltip", undefined
        #$(@root).attr "data-id", @get("data-id")
        @children = $(@root).children()

        for obj in @layout()
            dom = @mkui obj
            if dom
                $(dom).appendTo(@root)
        if @refs.yield
            $(v).detach().appendTo @refs.yield for v in @children
        else
            @children = []
        $(@root).children().each (i, e) => e.mkui @observable

    __: (k, v) ->
            @set k, v if v
            @get k

    __tooltip__: (v) ->
        return unless v
        $(@root).attr "tooltip", v

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
            @["__#{opt}"](value) if @["__#{opt}"]
            @opts[opt] = value
            @["__#{opt}__"](value) if @["__#{opt}__"]
        @
    
    aid: () ->
        @get "data-id"
    
    calibrate: () ->

    update: () ->
    
    get: (opt) ->
        return @opts if opt is "*"
        @opts[opt]

    sync: () ->
        @update()
        $(@root).children().each () -> @update()
        @root

    setup: () ->
        return if @mounted
        @mounted = true
        @mount()
        $(@root).children().each () -> @.mount()
        @root

    mount: () ->

    layout: () ->
        []
        # should be defined by subclasses

    mkui: (tag) ->
        return undefined unless tag
        dom = $("<#{tag.el}>")
        $(dom).addClass tag.class if tag.class
        $(dom).attr "data-id", tag.id if tag.id
        $(dom).attr "data-height", tag.height if tag.height
        $(dom).attr "data-width", tag.width if tag.width
        $(dom).attr "tooltip", tag.tooltip if tag.tooltip
        if tag.children
            $(@mkui(v)).appendTo(dom) for v in tag.children
        if tag.ref
            @refs[tag.ref] = dom[0]
        # dom.mount @observable
        dom[0] #.uify(@observable)

Element.prototype.mkui = (observable) ->
    tag = @tagName.toLowerCase()
    if RegExp("afx-*", "i" ).test(tag) and Ant.OS.GUI.tag[tag]
        o = new Ant.OS.GUI.tag[tag](@, observable)
        return o.root
    else
        $(@).children().each () ->
            @mkui(observable)
    return @


Element.prototype.mount = () ->
    return @setup() if @setup
    $(@).children().each () -> @mount()
    @

Element.prototype.update = () ->
    return @sync() if @sync
    $(@).children().each () -> @update()
    @

Element.prototype.uify = (observable) ->
    @mkui(observable)
    @mount()

Ant.OS.GUI.define = (name, cls) ->
    Ant.OS.GUI.tag[name] = cls

