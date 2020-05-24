/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

// AnTOS Web desktop is is licensed under the GNU General Public
// License v3.0, see the LICENCE file for more information

// This program is free software: you can redistribute it and/or
// modify it under the terms of the GNU General Public License as
// published by the Free Software Foundation, either version 3 of 
// the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.

// You should have received a copy of the GNU General Public License
//along with this program. If not, see https://www.gnu.org/licenses/.

class DB {
    constructor(table) {
        this.table = table;
    }

    save(d) {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.dbquery("save", { table: this.table, data: d })
                .then(function(r) {
                    if (r.error) { return reject(Ant.OS.API.throwe(r.error)); }
                    return resolve(r.result);}).catch(e => reject(__e(e)));
        });
    }

    delete(c) {
        return new Promise((resolve, reject) => {
            const rq = { table: this.table };
            if (!c || (c === "")) { reject(Ant.OS.API.throwe("OS.DB: unkown condition")); }
            if (isNaN(c)) {
                rq.cond = c;
            } else {
                rq.id = c;
            }
            return Ant.OS.API.handle.dbquery("delete", rq)
                .then(function(r) {
                    if (r.error) { return reject(Ant.OS.API.throwe(r.error)); }
                    return resolve(r.result);}).catch(e => reject(__e(e)));
        });
    }

    get(id) {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.dbquery("get", { table: this.table, id })
                .then(function(r) {
                    if (r.error) { return reject(Ant.OS.API.throwe(r.error)); }
                    return resolve(r.result);}).catch(e => reject(__e(e)));
        });
    }

    find(cond) {
        return new Promise((resolve, reject) => {
            return Ant.OS.API.handle.dbquery("select", { table: this.table, cond })
                .then(function(r) {
                    if (r.error) { return reject(Ant.OS.API.throwe(r.error)); }
                    return resolve(r.result);}).catch(e => reject(__e(e)));
        });
    }
}

Ant.OS.API.DB = DB;