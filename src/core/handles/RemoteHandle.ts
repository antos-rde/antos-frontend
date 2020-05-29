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
        export interface UserLoginType {
            username: string;
            password: string;
        }
        export interface PackageCommandType {
            command: string;
            args: GenericObject<any>;
        }
        export interface RequestResult {
            error: boolean | string;
            result:
                | string
                | boolean
                | GenericObject<any>
                | any[]
                | FileInfoType
                | FileInfoType[];
        }

        let loc: any = { hostname: "localhost", port: "80", protocol: "http" };

        if (Ant.location) loc = Ant.location;

        export var HOST: string =
            loc.hostname + (loc.port ? `:${loc.port}` : "");
        export var REST: string = `${loc.protocol}//${HOST}`;

        export namespace handle {
            // get file, require authentification
            export var get: string = `${REST}/VFS/get`;
            // get shared file with publish
            export var shared: string = `${REST}/VFS/shared`;
            export function scandir(p: string): Promise<RequestResult> {
                const path = `${REST}/VFS/scandir`;
                return API.post(path, { path: p });
            }

            export function mkdir(p: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/mkdir`;
                return API.post(path, { path: p });
            }

            export function sharefile(
                p: string,
                pub: boolean
            ): Promise<RequestResult> {
                const path = `${API.REST}/VFS/publish`;
                return API.post(path, { path: p, publish: pub });
            }

            export function fileinfo(p: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/fileinfo`;
                return API.post(path, { path: p });
            }

            export function readfile(p: string, t: string): Promise<any> {
                const path = `${API.REST}/VFS/get/`;
                return API.get(path + p, t);
            }

            export function move(s: string, d: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/move`;
                return API.post(path, { src: s, dest: d });
            }

            export function remove(p: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/delete`;
                return API.post(path, { path: p });
            }

            export function fileblob(p: string): Promise<ArrayBuffer> {
                const path = `${API.REST}/VFS/get/`;
                return API.blob(path + p);
            }

            export function packages(
                d: PackageCommandType
            ): Promise<RequestResult> {
                const path = `${API.REST}/system/packages`;
                return API.post(path, d);
            }

            export function upload(d: string): Promise<RequestResult> {
                const path = `${API.REST}/VFS/upload`;
                return API.upload(path, d);
            }

            export function write(
                p: string,
                d: string
            ): Promise<RequestResult> {
                const path = `${API.REST}/VFS/write`;
                return API.post(path, { path: p, data: d });
            }
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

            export function auth(): Promise<RequestResult> {
                const p = `${API.REST}/user/auth`;
                return API.post(p, {});
            }

            export function login(d: UserLoginType): Promise<RequestResult> {
                const p = `${API.REST}/user/login`;
                return API.post(p, d);
            }

            export function logout(): Promise<RequestResult> {
                const p = `${API.REST}/user/logout`;
                return API.post(p, {});
            }

            export function setting(): Promise<RequestResult> {
                const p = `${API.REST}/system/settings`;
                return API.post(p, setting);
            }

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
