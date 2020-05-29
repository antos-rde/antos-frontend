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

namespace OS {
    export namespace API {
        /**
         *
         *
         * @export
         * @class DB
         */
        export class DB {
            table: GenericObject<any>;

            /**
             *Creates an instance of DB.
             * @param {GenericObject<any>} table
             * @memberof DB
             */
            constructor(table: GenericObject<any>) {
                this.table = table;
            }

            /**
             *
             *
             * @param {*} d
             * @returns {Promise<API.RequestResult>}
             * @memberof DB
             */
            save(d: any): Promise<API.RequestResult> {
                return new Promise(async function (resolve, reject) {
                    try {
                        const r = await Ant.OS.API.handle.dbquery("save", {
                            table: this.table,
                            data: d,
                        });
                        if (r.error) {
                            return reject(
                                Ant.OS.API.throwe(r.error.toString())
                            );
                        }
                        return resolve(r);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }

            /**
             *
             *
             * @param {*} c
             * @returns {Promise<API.RequestResult>}
             * @memberof DB
             */
            delete(c: any): Promise<API.RequestResult> {
                return new Promise(async (resolve, reject) => {
                    const rq: any = { table: this.table };
                    if (!c || c === "") {
                        reject(Ant.OS.API.throwe("OS.DB: unkown condition"));
                    }
                    if (isNaN(c)) {
                        rq.cond = c;
                    } else {
                        rq.id = c;
                    }
                    try {
                        const r = await Ant.OS.API.handle.dbquery("delete", rq);
                        if (r.error) {
                            return reject(
                                Ant.OS.API.throwe(r.error.toString())
                            );
                        }
                        return resolve(r);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }

            /**
             *
             *
             * @param {number} id
             * @returns {Promise<GenericObject<any>>}
             * @memberof DB
             */
            get(id: number): Promise<GenericObject<any>> {
                return new Promise(async (resolve, reject) => {
                    try {
                        const r = await Ant.OS.API.handle.dbquery("get", {
                            table: this.table,
                            id: id,
                        });
                        if (r.error) {
                            return reject(
                                Ant.OS.API.throwe(r.error.toString())
                            );
                        }
                        return resolve(r.result as GenericObject<any>);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }

            /**
             *
             *
             * @param {GenericObject<any>} cond
             * @returns {Promise<GenericObject<any>[]>}
             * @memberof DB
             */
            find(cond: GenericObject<any>): Promise<GenericObject<any>[]> {
                return new Promise(async (resolve, reject) => {
                    try {
                        const r = await Ant.OS.API.handle.dbquery("select", {
                            table: this.table,
                            cond,
                        });
                        if (r.error) {
                            return reject(
                                Ant.OS.API.throwe(r.error.toString())
                            );
                        }
                        return resolve(r.result as GenericObject<any>[]);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }
        }
    }
}
