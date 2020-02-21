Ant.OS.GUI.tag = {}

Element.prototype.mount = () ->
    Ant.OS.GUI.tag[@tagName](@) if RegExp('afx-*').test(@tagName) and Ant.OS.GUI.tag[@tagName]

Ant.OS.GUI.tag.define = (name, fn) ->
    Ant.OS.GUI.tag[name] = fn

Ant.OS.GUI.tag.mount = (obj) ->
