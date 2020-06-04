/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS208: Avoid top-level this
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
type VFSFileHandleClass = { new (...args: any[]): OS.API.VFS.BaseFileHandle };
interface String {
    asFileHandle(): OS.API.VFS.BaseFileHandle;
}
namespace OS {
    export namespace API {

        /**
         *
         *
         * @export
         * @interface UserPermissionType
         */
        export interface UserPermissionType {
            read: boolean;
            write: boolean;
            exec: boolean;
        }

        /**
         *
         *
         * @export
         * @interface FileInfoType
         */
        export interface FileInfoType {
            mime: string;
            size: number;
            name: string;
            path: string;
            type: string;
            perm?: {
                group: UserPermissionType;
                owner: UserPermissionType;
                other: UserPermissionType;
            };
            ctime?: string;
            mtime?: string;
            gid?: number;
            uid?: number;
            [propName: string]: any;
        }

        export namespace VFS {
            
            String.prototype.asFileHandle = function (): BaseFileHandle {
                const list = this.split("://");
                const handles = API.VFS.findHandles(list[0]);
                if (!handles || handles.length === 0) {
                    announcer.osfail(
                        __("VFS unknown handle: {0}", this),
                        API.throwe("OS.VFS")
                    );
                    return null;
                }
                return new handles[0](this);
            };

            export const handles: GenericObject<VFSFileHandleClass> = {};

            /**
             *
             *
             * @export
             * @param {string} protos
             * @param {VFSFileHandleClass} cls
             */
            export function register(
                protos: string,
                cls: VFSFileHandleClass
            ): void {
                handles[protos] = cls;
            }

            /**
             *
             *
             * @export
             * @param {string} proto
             * @returns {VFSFileHandleClass[]}
             */
            export function findHandles(proto: string): VFSFileHandleClass[] {
                const l = (() => {
                    const result = [];
                    for (let k in handles) {
                        const v = handles[k];
                        if (proto.trim().match(new RegExp(k, "g"))) {
                            result.push(v);
                        }
                    }
                    return result;
                })();
                return l;
            }

            /**
             *
             *
             * @export
             * @abstract
             * @class BaseFileHandle
             */
            export abstract class BaseFileHandle {
                dirty: boolean;
                cache: any;
                ready: boolean;
                path: string;
                protocol: string;
                genealogy: string[];
                basename: string;
                info: FileInfoType;
                ext: string;
                type: string;
                /**
                 *Creates an instance of BaseFileHandle.
                 * @param {string} path
                 * @memberof BaseFileHandle
                 */
                constructor(path: string) {
                    this.dirty = false;
                    this.cache = undefined;
                    this.setPath(path);
                }

                /**
                 *
                 *
                 * @param {string} p
                 * @returns {void}
                 * @memberof BaseFileHandle
                 */
                setPath(p: string): void {
                    this.ready = false;
                    if (!p) {
                        return;
                    }
                    this.path = p.toString();
                    const list = this.path.split("://");
                    this.protocol = list[0];
                    if (!(list.length > 1)) {
                        return;
                    }
                    const re = list[1].replace(/^\/+|\/+$/g, "");
                    if (re === "") {
                        return;
                    }
                    this.genealogy = re.split("/");
                    if (!this.isRoot()) {
                        this.basename = this.genealogy[
                            this.genealogy.length - 1
                        ];
                    }
                    if (
                        this.basename.lastIndexOf(".") !== 0 &&
                        this.basename.indexOf(".") !== -1
                    ) {
                        this.ext = this.basename.split(".").pop();
                    }
                }

                /**
                 *
                 *
                 * @returns {string}
                 * @memberof BaseFileHandle
                 */
                get filename(): string {
                    if (!this.basename) {
                        return "Untitled";
                    }
                    return this.basename;
                }

                /**
                 *
                 *
                 * @memberof BaseFileHandle
                 */
                set filename(v: string)
                {
                    this.basename = v;
                }
                /**
                 *
                 *
                 * @param {*} v
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                setCache(v: any): BaseFileHandle {
                    this.cache = v;
                    return this;
                }

                /**
                 *
                 *
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                asFileHandle(): BaseFileHandle {
                    return this;
                }

                /**
                 *
                 *
                 * @returns {boolean}
                 * @memberof BaseFileHandle
                 */
                isRoot(): boolean {
                    return !this.genealogy || this.genealogy.length === 0;
                }

                /**
                 *
                 *
                 * @param {string} name
                 * @returns {string}
                 * @memberof BaseFileHandle
                 */
                child(name: string): string {
                    if (this.isRoot()) {
                        return this.path + name;
                    } else {
                        return this.path + "/" + name;
                    }
                }

                /**
                 *
                 *
                 * @returns {boolean}
                 * @memberof BaseFileHandle
                 */
                isHidden(): boolean {
                    if (!this.basename) {
                        return false;
                    }
                    return this.basename[0] === ".";
                }

                /**
                 *
                 *
                 * @returns {number}
                 * @memberof BaseFileHandle
                 */
                hash(): number {
                    if (!this.path) {
                        return -1;
                    }
                    return this.path.hash();
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {(Promise<string | ArrayBuffer>)}
                 * @memberof BaseFileHandle
                 */
                b64(t: string): Promise<string | ArrayBuffer> {
                    // t is object or mime type
                    return new Promise((resolve, reject) => {
                        const m = t === "object" ? "text/plain" : t;
                        if (!this.cache) {
                            return resolve("");
                        }
                        if (t === "object" || typeof this.cache === "string") {
                            let b64: string;
                            if (t === "object") {
                                b64 = JSON.stringify(
                                    this.cache,
                                    undefined,
                                    4
                                ).asBase64();
                            } else {
                                b64 = this.cache.asBase64();
                            }
                            b64 = `data:${m};base64,${b64}`;
                            return resolve(b64);
                        } else {
                            const reader = new FileReader();
                            reader.readAsDataURL(this.cache);
                            reader.onload = () => resolve(reader.result);
                            return (reader.onerror = (e) => reject(e));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                parent(): BaseFileHandle {
                    if (this.isRoot()) {
                        return this;
                    }
                    return (
                        this.protocol +
                        "://" +
                        this.genealogy
                            .slice(0, this.genealogy.length - 1)
                            .join("/")
                    ).asFileHandle();
                }

                /**
                 *
                 *
                 * @returns {Promise<FileInfoType>}
                 * @memberof BaseFileHandle
                 */
                onready(): Promise<FileInfoType> {
                    // read meta data
                    return new Promise((resolve, reject) => {
                        if (this.ready) {
                            return resolve(this.info);
                        }
                        return this.meta()
                            .then((d: RequestResult) => {
                                this.info = d.result as FileInfoType;
                                this.ready = true;
                                return resolve(d.result as FileInfoType);
                            })
                            .catch((e: Error) => reject(__e(e)));
                    });
                }

                /**
                 *
                 *
                 * @param {string} [t]
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                read(t?: string): Promise<any> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const d = await this._rd(t);
                                return resolve(d);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                write(t: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r: RequestResult = await this._wr(t);
                            announcer.ostrigger("VFS", {
                                m: "write",
                                file: this,
                            });
                            return resolve(r);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                /**
                 *
                 *
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                mk(d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const d_1 = await this._mk(d);
                                announcer.ostrigger("VFS", {
                                    m: "mk",
                                    file: this,
                                });
                                return resolve(d_1);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                remove(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const d = await this._rm();
                                announcer.ostrigger("VFS", {
                                    m: "remove",
                                    file: this,
                                });
                                return resolve(d);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                upload(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const d = await this._up();
                                announcer.ostrigger("VFS", {
                                    m: "upload",
                                    file: this,
                                });
                                return resolve(d);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                publish(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const d = await this._pub();
                                announcer.ostrigger("VFS", {
                                    m: "publish",
                                    file: this,
                                });
                                return resolve(d);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                download(): Promise<any> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const d = await this._down();
                                announcer.ostrigger("VFS", {
                                    m: "download",
                                    file: this,
                                });
                                return resolve(d);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                move(d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const data = await this._mv(d);
                                announcer.ostrigger("VFS", {
                                    m: "move",
                                    file: d.asFileHandle(),
                                });
                                return resolve(data);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                execute(): Promise<any> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            try {
                                const d = await this._exec();
                                announcer.ostrigger("VFS", {
                                    m: "execute",
                                    file: this,
                                });
                                return resolve(d);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {string}
                 * @memberof BaseFileHandle
                 */
                getlink(): string {
                    return this.path;
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                unsupported(t: string): Promise<RequestResult> {
                    return new Promise((resolve, reject) => {
                        return reject(
                            API.throwe(
                                __(
                                    "Action {0} is unsupported on: {1}",
                                    t,
                                    this.path
                                )
                            )
                        );
                    });
                }
                // actions must be implemented by subclasses

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _rd(t: string): Promise<RequestResult> {
                    return this.unsupported("read");
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @param {*} [d]
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _wr(t: string, d?: any): Promise<RequestResult> {
                    return this.unsupported("write");
                }
                /**
                 *
                 *
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _mk(d: string): Promise<RequestResult> {
                    return this.unsupported("mk");
                }
                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _rm(): Promise<RequestResult> {
                    return this.unsupported("remove");
                }

                /**
                 *
                 *
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _mv(d: string): Promise<RequestResult> {
                    return this.unsupported("move");
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _up(): Promise<RequestResult> {
                    return this.unsupported("upload");
                }

                /**
                 *
                 *
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                _down(): Promise<any> {
                    return this.unsupported("download");
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _exec(): Promise<RequestResult> {
                    return this.unsupported("execute");
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                _pub(): Promise<RequestResult> {
                    return this.unsupported("publish");
                }
                abstract meta(): Promise<RequestResult>;
            }

            // Remote file handle
            /**
             *
             *
             * @class RemoteFileHandle
             * @extends {BaseFileHandle}
             */
            export class RemoteFileHandle extends BaseFileHandle {
                constructor(path: string) {
                    super(path);
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                meta(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const d = await API.handle.fileinfo(
                                this.path
                            );
                            if (d.error) {
                                return reject(
                                    API.throwe(
                                        __("{0}: {1}", d.error, this.path)
                                    )
                                );
                            }
                            return resolve(d);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {string}
                 * @memberof RemoteFileHandle
                 */
                getlink(): string {
                    return API.handle.get + "/" + this.path;
                }

                _rd(t: string): Promise<any> {
                    // t: binary, text, any type
                    if (!this.info) {
                        return new Promise((resolve, reject) => {
                            return reject(
                                API.throwe(
                                    __(
                                        "file meta-data not found: {0}",
                                        this.path
                                    )
                                )
                            );
                        });
                    }
                    if (this.info.type === "dir") {
                        return API.handle.scandir(this.path);
                    }
                    //read the file
                    if (t === "binary") {
                        return API.handle.fileblob(this.path);
                    }
                    return API.handle.readfile(
                        this.path,
                        t ? t : "text"
                    );
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                _wr(t: string): Promise<RequestResult> {
                    // t is base64 or undefined
                    return new Promise(async (resolve, reject) => {
                        if (t === "base64") {
                            try {
                                const d = await API.handle.write(
                                    this.path,
                                    this.cache
                                );
                                if (d.error) {
                                    return reject(
                                        API.throwe(
                                            __("{0}: {1}", d.error, this.path)
                                        )
                                    );
                                }
                                return resolve(d);
                            } catch (e) {
                                return reject(__e(e));
                            }
                        } else {
                            try {
                                const r = await this.b64(t);
                                try {
                                    const result = await API.handle.write(
                                        this.path,
                                        r as string
                                    );
                                    if (result.error) {
                                        return reject(
                                            API.throwe(
                                                __(
                                                    "{0}: {1}",
                                                    result.error,
                                                    this.path
                                                )
                                            )
                                        );
                                    }
                                    return resolve(result);
                                } catch (e_1) {
                                    return reject(__e(e_1));
                                }
                            } catch (e_2) {
                                return reject(__e(e_2));
                            }
                        }
                    });
                }

                /**
                 *
                 *
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                _mk(d: string): Promise<RequestResult> {
                    return new Promise((resolve, reject) => {
                        if (!this.info) {
                            return reject(
                                API.throwe(
                                    __(
                                        "file meta-data not found: {0}",
                                        this.path
                                    )
                                )
                            );
                        }
                        if (this.info.type === "file") {
                            return reject(
                                API.throwe(
                                    __("{0} is not a directory", this.path)
                                )
                            );
                        }
                        return API.handle
                            .mkdir(`${this.path}/${d}`)
                            .then((d) => {
                                if (d.error) {
                                    return reject(
                                        API.throwe(
                                            __("{0}: {1}", d.error, this.path)
                                        )
                                    );
                                }
                                return resolve(d);
                            })
                            .catch((e) => reject(__e(e)));
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                _rm(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const d = await API.handle.remove(this.path);
                            if (d.error) {
                                return reject(
                                    API.throwe(
                                        __("{0}: {1}", d.error, this.path)
                                    )
                                );
                            }
                            return resolve(d);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                /**
                 *
                 *
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                _mv(d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await API.handle.move(
                                this.path,
                                d
                            );
                            if (r.error) {
                                return reject(
                                    API.throwe(
                                        __("{0}: {1}", r.error, this.path)
                                    )
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
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                _up(): Promise<RequestResult> {
                    return new Promise((resolve, reject) => {
                        if (this.info.type !== "dir") {
                            return reject(
                                API.throwe(
                                    __("{0} is not a file", this.path)
                                )
                            );
                        }
                        return API.handle
                            .upload(this.path)
                            .then((d) => {
                                if (d.error) {
                                    return reject(
                                        API.throwe(
                                            __("{0}: {1}", d.error, this.path)
                                        )
                                    );
                                }
                                return resolve(d);
                            })
                            .catch((e) => reject(__e(e)));
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<any>}
                 * @memberof RemoteFileHandle
                 */
                _down(): Promise<any> {
                    return new Promise((resolve, reject) => {
                        if (this.info.type === "dir") {
                            return API.throwe(
                                __("{0} is not a file", this.path)
                            );
                        }
                        return API.handle
                            .fileblob(this.path)
                            .then((d) => {
                                const blob = new Blob([d], {
                                    type: "octet/stream",
                                });
                                API.saveblob(this.basename, blob);
                                return resolve();
                            })
                            .catch((e) => reject(__e(e)));
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                _pub(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const d = await API.handle.sharefile(
                                this.path,
                                true
                            );
                            if (d.error) {
                                return reject(
                                    API.throwe(
                                        __("{0}: {1}", d.error, this.path)
                                    )
                                );
                            }
                            return resolve(d);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }
            }

            register("^(home|desktop|os|Untitled)$", RemoteFileHandle);

            // Application Handle
            /**
             *
             *
             * @class ApplicationHandle
             * @extends {BaseFileHandle}
             */
            export class ApplicationHandle extends BaseFileHandle {

                /**
                 *Creates an instance of ApplicationHandle.
                 * @param {string} path
                 * @memberof ApplicationHandle
                 */
                constructor(path: string) {
                    super(path);
                    if (this.basename) {
                        let v: any =
                            OS.setting.system.packages[this.basename];
                        v.type = "app";
                        v.mime = "antos/app";
                        v.size = 0;
                        this.info = v as FileInfoType;
                    }
                    this.ready = true;
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof ApplicationHandle
                 */
                meta(): Promise<RequestResult> {
                    return new Promise((resolve, reject) =>
                        resolve({
                            result: this.info,
                            error: false,
                        })
                    );
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {Promise<any>}
                 * @memberof ApplicationHandle
                 */
                _rd(t: string): Promise<any> {
                    return new Promise((resolve, reject) => {
                        if (this.info) {
                            return resolve({
                                result: this.info,
                                error: false,
                            });
                        }
                        if (!this.isRoot()) {
                            return reject(
                                API.throwe(
                                    __("Application meta data isnt found")
                                )
                            );
                        }
                        const result = [];
                        for (let k in OS.setting.system.packages) {
                            const v = OS.setting.system.packages[k];
                            result.push(v);
                        }
                        return resolve({
                            result: result,
                            error: false,
                        });
                    });
                }
            }

            register("^app$", ApplicationHandle);

            /**
             *
             *
             * @class BufferFileHandle
             * @extends {BaseFileHandle}
             */
            export class BufferFileHandle extends BaseFileHandle {
                constructor(path: string, mime: string, data: any) {
                    super(path);
                    if (data) {
                        this.cache = data;
                    }
                    this.info = {
                        mime: mime,
                        path: path,
                        size: data ? data.length : 0,
                        name: this.basename,
                        type: "file",
                    };
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                meta(): Promise<RequestResult> {
                    return new Promise((resolve, reject) =>
                        resolve({
                            result: this.info,
                            error: false,
                        })
                    );
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {Promise<any>}
                 * @memberof BufferFileHandle
                 */
                _rd(t: string): Promise<any> {
                    return new Promise((resolve, reject) => {
                        return resolve({
                            result: this.cache,
                            error: false,
                        });
                    });
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @param {*} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                _wr(t: string, d: any): Promise<RequestResult> {
                    this.cache = d;
                    return new Promise((resolve, reject) =>
                        resolve({
                            result: true,
                            error: false,
                        })
                    );
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                _down(): Promise<RequestResult> {
                    return new Promise((resolve, reject) => {
                        const blob = new Blob([this.cache], {
                            type: "octet/stream",
                        });
                        API.saveblob(this.basename, blob);
                        return resolve();
                    });
                }
            }

            API.VFS.register("^mem$", BufferFileHandle);

            /**
             *
             *
             * @class URLFileHandle
             * @extends {BaseFileHandle}
             */
            export class URLFileHandle extends BaseFileHandle {
                constructor(path: string) {
                    super(path);
                    this.ready = true;
                    this.info = {
                        path: path,
                        name: path,
                        mime: "url",
                        type: "url",
                        size: 0,
                    };
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof URLFileHandle
                 */
                meta(): Promise<RequestResult> {
                    return new Promise((resolve, reject) =>
                        resolve({
                            result: this.info,
                            error: false,
                        })
                    );
                }
                _rd(t: string): Promise<any> {
                    return API.get(this.path, t ? t : "text");
                }
            }

            API.VFS.register("^(http|https|ftp)$", URLFileHandle);

            /**
             *
             *
             * @class SharedFileHandle
             * @extends {API.VFS.BaseFileHandle}
             */
            export class SharedFileHandle extends API.VFS.BaseFileHandle {
                constructor(path: string) {
                    super(path);
                    if (this.isRoot()) {
                        this.ready = true;
                    }
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                meta(): Promise<RequestResult> {
                    return API.handle.fileinfo(this.path);
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @returns {Promise<any>}
                 * @memberof SharedFileHandle
                 */
                _rd(t: string): Promise<any> {
                    if (this.isRoot()) {
                        return API.get(
                            `${API.handle.shared}/all`,
                            t
                        );
                    }
                    //read the file
                    if (t === "binary") {
                        return API.handle.fileblob(this.path);
                    }
                    return API.handle.readfile(
                        this.path,
                        t ? t : "text"
                    );
                }

                /**
                 *
                 *
                 * @param {string} t
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                _wr(t: string, d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await API.handle.write(
                                this.path,
                                d
                            );
                            if (r.error) {
                                return reject(
                                    API.throwe(
                                        __("{0}: {1}", r.error, this.path)
                                    )
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
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                _rm(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const d = await API.handle.sharefile(
                                this.basename,
                                false
                            );
                            if (d.error) {
                                return reject(
                                    API.throwe(
                                        __("{0}: {1}", d.error, this.path)
                                    )
                                );
                            }
                            return resolve(d);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                _down(): Promise<RequestResult> {
                    return new Promise((resolve, reject) => {
                        if (this.info.type === "dir") {
                            return reject(
                                API.throwe(
                                    __("{0} is not a file", this.path)
                                )
                            );
                        }
                        return API.handle
                            .fileblob(this.path)
                            .then((data) => {
                                const blob = new Blob([data], {
                                    type: "octet/stream",
                                });
                                API.saveblob(this.basename, blob);
                                return resolve();
                            })
                            .catch((e) => reject(__e(e)));
                    });
                }

                /**
                 *
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                _pub(): Promise<RequestResult> {
                    return new Promise((resolve, reject) =>
                        resolve({
                            result: this.basename,
                            error: false,
                        })
                    );
                }
            }

            API.VFS.register("^shared$", SharedFileHandle);
        }
    }
}
