class DB
    constructor: (@table) ->

    save: (d, f) ->
        _API.handler.dbquery "save", { table: @table, data: d }, f
    delete: (id, f) ->
        _API.handler.dbquery "delete", { table: @table, id: id }, f
    get: (id, f) ->
        _API.handler.dbquery "get", { table: @table, id: id }, f
    find: (cond, f) ->
        _API.handler.dbquery "select", { table: @table, cond: cond }, f

self.OS.API.DB = DB