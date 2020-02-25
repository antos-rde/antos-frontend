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
        
        @refs = {}
        @setopt "data-id", Math.floor(Math.random() * 100000) + 1
        @wrapper = @mkui()
        if @refs["yield"]
            ($($(v).detach()[0].uify(@observable)).appendTo(@refs.yield)) for v in $(@root).children()
            $(@wrapper).appendTo(@root)
        else
            $(@root).empty()
            $(@wrapper).appendTo(@root)

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
        @opts[opt] = value
        @["on_#{opt}_changed"](value) if @["on_#{opt}_changed"]
    
    id: () ->
        @get "data-id"
    

    get: (opt) ->
        @opts[opt]
    
    layout: () ->
        # should be defined by subclasses

    mkui: (obj) ->
        tag = obj
        tag = @layout() unless tag
        dom = $("<#{tag.el}>")
        $(dom).addClass tag.class if tag.class
        if tag.children
            $(@mkui(v)).appendTo(dom) for v in tag.children
        if tag.ref
            @refs[tag.ref] = dom
        # dom.mount @observable
        return dom

Element.prototype.uify = (observable) ->
    tag = @tagName.toLowerCase()
    if RegExp('afx-*', "i" ).test(tag) and Ant.OS.GUI.tag[tag]
        return new Ant.OS.GUI.tag[tag](@, observable).root
    return @

Ant.OS.GUI.define = (name, cls) ->
    Ant.OS.GUI.tag[name] = cls

