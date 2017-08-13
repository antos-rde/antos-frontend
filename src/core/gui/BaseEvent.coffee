class BaseEvent 
    constructor: (@name) ->
        @prevent = false
    preventDefault:()->
        @prevent = true

this.OS.GUI.BaseEvent = BaseEvent