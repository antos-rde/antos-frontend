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
        return new Promise (resolve, reject) =>
            Ant.OS.API.handle.dbquery "save", { table: @table, data: d }
                .then (r) ->
                    return reject(Ant.OS.API.throwe(r.error)) if r.error
                    resolve(r.result)
                .catch (e) -> reject __e e

    delete: (c) ->
        return new Promise (resolve, reject) =>
            rq = { table: @table }
            reject(Ant.OS.API.throwe("OS.DB: unkown condition")) unless c and c isnt ""
            if isNaN c
                rq.cond = c
            else
                rq.id = c
            Ant.OS.API.handle.dbquery "delete", rq
                .then (r) ->
                    return reject(Ant.OS.API.throwe(r.error)) if r.error
                    resolve(r.result)
                .catch (e) -> reject __e e

    get: (id) ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.dbquery "get", { table: @table, id: id }
                .then (r) ->
                    return reject(Ant.OS.API.throwe(r.error)) if r.error
                    resolve(r.result)
                .catch (e) -> reject __e e

    find: (cond) ->
        new Promise (resolve, reject) =>
            Ant.OS.API.handle.dbquery "select", { table: @table, cond: cond }
                .then (r) ->
                    return reject(Ant.OS.API.throwe(r.error)) if r.error
                    resolve(r.result)
                .catch (e) -> reject __e e

Ant.OS.API.DB = DB