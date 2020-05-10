# Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

# AnTOS Web desktop is is licensed under the GNU General Public
# License v3.0, see the LICENCE file for more information

# This program is free software: you can redistribute it and/or
# modify it under the terms of the GNU General Public License as
# published by the Free Software Foundation, either version 3 of 
# the License, or (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# General Public License for more details.

# You should have received a copy of the GNU General Public License
#along with this program. If not, see https://www.gnu.org/licenses/.

class DB
    constructor: (@table) ->

    save: (d) ->
        Ant.OS.API.handle.dbquery "save", { table: @table, data: d }

    delete: (c) ->
        rq = { table: @table }
        return new Promise (resolve, reject) ->
            reject(Ant.OS.API.throwe("OS.DB: unkown condition")) unless c and c isnt ""
        if isNaN c
            rq.cond = c
        else
            rq.id = c
        Ant.OS.API.handle.dbquery "delete", rq

    get: (id) ->
        Ant.OS.API.handle.dbquery "get", { table: @table, id: id }

    find: (cond) ->
        Ant.OS.API.handle.dbquery "select", { table: @table, cond: cond }

Ant.OS.API.DB = DB