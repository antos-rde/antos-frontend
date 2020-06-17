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
// along with this program. If not, see https://www.gnu.org/licenses/.

namespace OS {
    export namespace API {
        /**
         * Simple Virtual Database (VDB) application API.
         *
         * This API abstracts and provides a standard way to
         * connect to a server-side relational database (e.g. sqlite).
         *
         * Each user when connected has their own database previously
         * created. All VDB operations related to that user will be
         * performed on this database.
         *
         * The creation of user database need to be managed by the server-side API.
         * The VDB API assumes that the database already exist. All operations
         * is performed in tables level
         *
         * @export
         * @class DB
         */
        export class DB {
            /**
             * A table name on the user's database
             *
             * @private
             * @type {string}
             * @memberof DB
             */
            private table: string;

            /**
             *Creates an instance of DB.
             * @param {string} table table name
             * @memberof DB
             */
            constructor(table: string) {
                this.table = table;
            }

            /**
             * Save data to the current table. The input
             * data must conform to the table record format.
             *
             * On the server side, if the table doest not
             * exist yet, it should be created automatically
             * by inferring the data structure of the input
             * object
             *
             * @param {GenericObject<any>} d data object represents a current table record
             * @returns {Promise<API.RequestResult>}
             * @memberof DB
             */
            save(d: GenericObject<any>): Promise<API.RequestResult> {
                return new Promise(async (resolve, reject) => {
                    try {
                        const r = await API.handle.dbquery("save", {
                            table: this.table,
                            data: d,
                        });
                        if (r.error) {
                            return reject(API.throwe(r.error.toString()));
                        }
                        return resolve(r);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }

            /**
             * delete record(s) from the current table by
             * a conditional object
             *
             * @param {*} c conditional object, c can be:
             *
             * * a `number`: the operation will delete the record with `id = c`
             * * a `string`: The SQL string condition that selects record to delete
             * * a conditional object represents a SQL condition statement as an object,
             * example: `pid = 10 AND cid = 2` is represented by:
             *
             * ```typescript
             *  {
             *      exp: {
             *          "and": {
             *              pid: 10,
             *              cid: 2
             *          }
             *  }
             * ```
             *
             * @returns {Promise<API.RequestResult>}
             * @memberof DB
             */
            delete(
                c: GenericObject<any> | number | string
            ): Promise<API.RequestResult> {
                return new Promise(async (resolve, reject) => {
                    const rq: any = { table: this.table };
                    if (!c || c === "") {
                        reject(API.throwe("OS.DB: unknown condition"));
                    }
                    if (isNaN(c as number)) {
                        rq.cond = c;
                    } else {
                        rq.id = c;
                    }
                    try {
                        const r = await API.handle.dbquery("delete", rq);
                        if (r.error) {
                            return reject(API.throwe(r.error.toString()));
                        }
                        return resolve(r);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }

            /**
             * Get a record in the table by its primary key
             *
             * @param {number} id the primary key value
             * @returns {Promise<GenericObject<any>>} Promise on returned record data
             * @memberof DB
             */
            get(id: number): Promise<GenericObject<any>> {
                return new Promise(async (resolve, reject) => {
                    try {
                        const r = await API.handle.dbquery("get", {
                            table: this.table,
                            id: id,
                        });
                        if (r.error) {
                            return reject(API.throwe(r.error.toString()));
                        }
                        return resolve(r.result as GenericObject<any>);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }

            /**
             * Find records by a condition
             *
             * @param {GenericObject<any>} cond conditional object
             *
             * a conditional object represents a SQL condition statement as an object,
             * example: `pid = 10 AND cid = 2 ORDER BY date DESC` is represented by:
             *
             * ```typescript
             *  {
             *      exp: {
             *          "and": {
             *              pid: 10,
             *              cid: 2
             *          }
             *      },
             *      order: {
             *          date: "DESC"
             *      }
             *  }
             * ```
             * @returns {Promise<GenericObject<any>[]>}
             * @memberof DB
             */
            find(cond: GenericObject<any>): Promise<GenericObject<any>[]> {
                return new Promise(async (resolve, reject) => {
                    try {
                        const r = await API.handle.dbquery("select", {
                            table: this.table,
                            cond,
                        });
                        if (r.error) {
                            return reject(API.throwe(r.error.toString()));
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
