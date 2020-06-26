// Copyright 2017-2020 Xuan Sang LE <xsang.le AT gmail DOT com>

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
         * Interface for user login data
         *
         * @export
         * @interface UserLoginType
         */
        export interface UserLoginType {
            /**
             * The user credential
             *
             * @type {string}
             * @memberof UserLoginType
             */
            username: string;

            /**
             * The user password
             *
             * @type {string}
             * @memberof UserLoginType
             */
            password: string;
        }

        /**
         * Interface for a command sent to
         * server side package manage, it contains two field:
         *
         * @export
         * @interface PackageCommandType
         */
        export interface PackageCommandType {
            /**
             * Command name, should be: `init`, `cache`, `install`,
             * `uninstall` or `list`
             *
             * @type {string}
             * @memberof PackageCommandType
             */
            command: string;

            /**
             * Parameter object of each command
             *
             * @type {GenericObject<any>}
             * @memberof PackageCommandType
             */
            args: GenericObject<any>;
        }

        /**
         *
         * Interface for basic request result returned
         * from the server-side. A valid server-side response should
         * be in the following format
         * ```json
         * {
         *  "error": boolean or string_err,
         *  "result": JSON result object
         * }
         * ```
         *
         * @export
         * @interface RequestResult
         */
        export interface RequestResult {
            /**
             * Indicate whether the response is error
             *
             * @type {(boolean | string)}
             * @memberof RequestResult
             */
            error: boolean | string;

            /**
             * The response result, this value must be
             * set when `error` is false
             *
             * @type {(string
             *                 | boolean
             *                 | GenericObject<any>
             *                 | any[]
             *                 | FileInfoType
             *                 | FileInfoType[]
             *                 | setting.UserSettingType)}
             * @memberof RequestResult
             */
            result:
                | string
                | boolean
                | GenericObject<any>
                | any[]
                | FileInfoType
                | FileInfoType[]
                | setting.UserSettingType;
        }

        let loc: any = { hostname: "localhost", port: "80", protocol: "http" };

        if (Ant.location) loc = Ant.location;
        /**
         * The host name of the server-side
         */
        export var HOST: string =
            loc.hostname + (loc.port ? `:${loc.port}` : "");
        /**
         * The base REST URI of the server-side API
         */
        export var REST: string = `${loc.protocol}//${HOST}${loc.pathname}`;

        /**
         * The namespace `handle` contains some low level API to
         * communicate with the server side API. It is the only
         * API layer that communicate directly with the server.
         * To make AntOS compatible with any server side API,
         * all exported variable unctions defined in the `handle`
         * namespace should be re-implemented
         */
        export namespace handle {
            /**
             * Base URI for reading content of VFS file
             */
            export var get: string = `${REST}/VFS/get`;
            /**
             * Base URI for VFS file sharing
             */
            export var shared: string = `${REST}/VFS/shared`;

            /**
             * Send a request to the server-side API for a directory scanning
             * operation
             *
             * @export
             * @param {string} p a VFS file path e.g. home://test/
             * @returns {Promise<RequestResult>} A promise on a [[RequestResult]]
             * which contains an error or a list of FileInfoType
             */
            export function scandir(p: string): Promise<RequestResult> {
                const path = `${REST}/VFS/scandir`;
                return API.post(path, { path: p });
            }

            /**
             *
             * Send a request to the server-side API for directory creation
             *
             * @export
             * @param {string} p VFS path of the directory to be created
             * @returns {Promise<RequestResult>} A promise on a RequestResult
             * which contains an error or true on success
             */
            export function mkdir(p: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/mkdir`;
                return API.post(path, { path: p });
            }

            /**
             * Send a request to the server-side API for sharing/unsharing a VFS file,
             * once shared a VFS file will be publicly visible by everyone
             *
             * @export
             * @param {string} p VFS file path to be shared
             * @param {boolean} pub flag: share (true) or unshare (false)
             * @returns {Promise<RequestResult>} A promise on a RequestResult
             * which contains an error or true on success
             */
            export function sharefile(
                p: string,
                pub: boolean
            ): Promise<RequestResult> {
                const path = `${API.REST}/VFS/publish`;
                return API.post(path, { path: p, publish: pub });
            }

            /**
             * Get VFS file meta-data
             *
             * @export
             * @param {string} p VFS file path
             * @returns {Promise<RequestResult>} A promise on a [[RequestResult]]
             * which contains an error or an object of FileInfoType
             */
            export function fileinfo(p: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/fileinfo`;
                return API.post(path, { path: p });
            }

            /**
             * Read a VFS file content. There are many ways a VFS file can be read:
             * - Read as a raw text content
             * - Read as a javascript file, in this case the content of the
             * file will be executed
             * - Read as JSON object
             *
             * @export
             * @param {string} p path of the VFS file
             * @param {string} t return data type:
             * - jsonp: the response is an json object
             * - script: the response is a javascript code
             * - xml, html: the response is a XML/HTML object
             * - text: plain text
             *
             * @returns {Promise<any>}  A promise on a [[RequestResult]]
             * which contains an error or an object of [[FileInfoType]]
             */
            export function readfile(p: string, t: string): Promise<any> {
                const path = `${API.REST}/VFS/get/`;
                return API.get(path + p, t);
            }

            /**
             * Move a file to another location on server-side
             *
             * @export
             * @param {string} s VFS source file path
             * @param {string} d VFS destination file path
             * @returns {Promise<RequestResult>}  A promise on a [[RequestResult]]
             * which contains an error or a success response
             */
            export function move(s: string, d: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/move`;
                return API.post(path, { src: s, dest: d });
            }

            /**
             * Delete a VFS file on the server-side
             *
             * @export
             * @param {string} p VFS file path
             * @returns {Promise<RequestResult>}  A promise on a [[RequestResult]]
             * which contains an error or a success response
             */
            export function remove(p: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/delete`;
                return API.post(path, { path: p });
            }

            /**
             * Read the file as binary data
             *
             * @export
             * @param {string} p VFS file to be read
             * @returns {Promise<ArrayBuffer>} a Promise on an array buffer
             */
            export function fileblob(p: string): Promise<ArrayBuffer> {
                const path = `${API.REST}/VFS/get/`;
                return API.blob(path + p);
            }

            /**
             * Send a command to the serverside package manager
             *
             * @export
             * @param {PackageCommandType} d a package command of type PackageCommandType
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            export function packages(
                d: PackageCommandType
            ): Promise<RequestResult> {
                const path = `${API.REST}/system/packages`;
                return API.post(path, d);
            }

            /**
             * Upload file to the server via VFS interface
             *
             * @export
             * @param {string} d VFS destination directory path
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            export function upload(d: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/upload`;
                return API.upload(path, d);
            }

            /**
             * Write Base 64 encoded data to a VFS file
             *
             * @export
             * @param {string} p path to the VFS file
             * @param {string} d file data encoded in Base 64
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            export function write(
                p: string,
                d: string
            ): Promise<RequestResult> {
                const path = `${API.REST}/VFS/write`;
                return API.post(path, { path: p, data: d });
            }

            /**
             * An apigateway allows client side to execute a custom server-side
             * script and get back the result. This gateway is particularly
             * useful in case of performing a task that is not provided by the core
             * API
             *
             * @export
             * @param {GenericObject<any>} d execution indication, provided only when ws is `false`
             * otherwise, `d` should be written directly to the websocket stream as JSON object.
             * Two possible formats of `d`:
             * ```text
             * execute an server-side script file:
             *
             * {
             *  path: [VFS path],
             *  parameters: [parameters of the server-side script]
             * }
             *
             * or, execute directly a snippet of server-side script:
             *
             * { code: [server-side script code snippet as string] }
             *
             * ```
             *
             * @param {boolean} ws flag indicate whether to use websocket for the connection
             * to the gateway API. In case of streaming data, the websocket is preferred
             * @returns {Promise<any>} a promise on the result object (any)
             */
            export function apigateway(
                d: GenericObject<any>,
                ws: boolean
            ): Promise<any> {
                if (ws) {
                    return new Promise(function (resolve, reject) {
                        try {
                            const path = `${API.HOST}/system/apigateway?ws=1`;
                            const proto =
                                window.location.protocol === "https:"
                                    ? "wss://"
                                    : "ws://";
                            const socket = new WebSocket(proto + path);
                            return resolve(socket);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                } else {
                    const path = `${API.REST}/system/apigateway?ws=0`;
                    return API.post(path, d);
                }
            }

            /**
             *  Check if a user is logged in
             *
             * @export
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]] that
             * contains an error or a [[UserSettingType]] object
             */
            export function auth(): Promise<RequestResult> {
                const p = `${API.REST}/user/auth`;
                return API.post(p, {});
            }

            /**
             * Perform a login operation
             *
             * @export
             * @param {UserLoginType} d user data [[UserLoginType]]
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]] that
             * contains an error or a [[UserSettingType]] object
             */
            export function login(d: UserLoginType): Promise<RequestResult> {
                const p = `${API.REST}/user/login`;
                return API.post(p, d);
            }

            /**
             * Perform a logout operation
             *
             * @export
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            export function logout(): Promise<RequestResult> {
                const p = `${API.REST}/user/logout`;
                return API.post(p, {});
            }

            /**
             * Save the current user settings
             *
             * @export
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            export function setting(): Promise<RequestResult> {
                const p = `${API.REST}/system/settings`;
                return API.post(p, OS.setting);
            }

            /**
             * This is the low level function of AntOS VDB API.
             * It requests the server API to perform some simple
             * SQL query.
             *
             * @export
             * @param {string} cmd action to perform: save, delete, get, select
             * @param {GenericObject<any>} d data object of the request based on each action:
             * - save:
             * ```
             *  { table: "table name", data: [record data object]}
             * ```
             * - get:
             * ```
             *  { table: "table name", id: [record id]}
             * ```
             * - delete:
             * ```
             *  { table: "table name", id: [record id]}
             * or
             *  { table: "table name", cond: [conditional object]}
             * ```
             * - select:
             * ```
             * { table: "table name", cond: [conditional object]}
             * ```
             * @returns {Promise<RequestResult>} a promise of [[RequestResult]] on the
             * query data
             *
             * A conditional object represents a SQL condition statement as an object,
             * example: `pid = 10 AND cid = 2 ORDER BY date DESC`
             * ```
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
             */
            export function dbquery(
                cmd: string,
                d: GenericObject<any>
            ): Promise<RequestResult> {
                const path = `${API.REST}/VDB/${cmd}`;
                return API.post(path, d);
            }
        }
    }
}
