class DB
    constructor: (@table) ->

    save: (d, f) ->
        _API.handler.dbquery "save", { table: @table, data: d }, f
    delete: (c, f) ->
        rq = { table: @table }
        return  ( _courrier.oserror __("VDB Unknown condition for delete command"),
        (_API.throwe "OS.DB"), c ) unless c and c isnt ""
        if isNaN c
            rq.cond = c
        else
            rq.id = c
        _API.handler.dbquery "delete", rq, f
    get: (id, f) ->
        _API.handler.dbquery "get", { table: @table, id: id }, f
    find: (cond, f) ->
        _API.handler.dbquery "select", { table: @table, cond: cond }, f

self.OS.API.DB = DB