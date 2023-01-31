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
type VFSFileHandleClass = { new(...args: any[]): OS.API.VFS.BaseFileHandle };
interface String {
    /**
     * Convert a string to VFS file handle.
     *
     * This function will create a file handle object from the string
     * with the help of [[VFS.findHandles]]
     *
     * @returns {OS.API.VFS.BaseFileHandle}
     * @memberof String
     */
    asFileHandle(): OS.API.VFS.BaseFileHandle;
}
namespace OS {
    export namespace API {
        /**
         * User permission data type
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
         * VFS file meta-data data type
         *
         * @export
         * @interface FileInfoType
         */
        export interface FileInfoType {
            /**
             * File mime type
             *
             * @type {string}
             * @memberof FileInfoType
             */
            mime: string;

            /**
             * File size
             *
             * @type {number}
             * @memberof FileInfoType
             */
            size: number;

            /**
             * File name
             *
             * @type {string}
             * @memberof FileInfoType
             */
            name: string;

            /**
             * File path
             *
             * @type {string}
             * @memberof FileInfoType
             */
            path: string;

            /**
             * File type:
             * - `file`
             * - `dir`
             * - `app`
             *
             * @type {string}
             * @memberof FileInfoType
             */
            type: string;

            /**
             * File permission
             *
             * @type {{
             *                 group: UserPermissionType;
             *                 owner: UserPermissionType;
             *                 other: UserPermissionType;
             *             }}
             * @memberof FileInfoType
             */
            perm?: {
                /**
                 * Group permission
                 *
                 * @type {UserPermissionType}
                 */
                group: UserPermissionType;

                /**
                 * Owner permission
                 *
                 * @type {UserPermissionType}
                 */
                owner: UserPermissionType;

                /**
                 * Other permission
                 *
                 * @type {UserPermissionType}
                 */
                other: UserPermissionType;
            };

            /**
             * Creation time
             *
             * @type {string}
             * @memberof FileInfoType
             */
            ctime?: string;

            /**
             * Modification time
             *
             * @type {string}
             * @memberof FileInfoType
             */
            mtime?: string;

            /**
             * Group id
             *
             * @type {number}
             * @memberof FileInfoType
             */
            gid?: number;

            /**
             * User id
             *
             * @type {number}
             * @memberof FileInfoType
             */
            uid?: number;
            [propName: string]: any;
        }

        /**
         * This namespace is dedicated to all APIs related to
         * AntOS Virtual File System (VFS)
         */
        export namespace VFS {
            declare var JSZip: any;
            /** path for custom VFS protocol handles */
            const VFSX_PATH = "pkg://vfsx/vfsx.js";
            
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

            /**
             * Placeholder stores VFS file protocol patterns and its attached file handle class.
             *
             */
            export const handles: GenericObject<VFSFileHandleClass> = {};

            /**
             * Register a protocol to a handle class
             *
             * @export
             * @param {string} protos VFS protocol pattern
             * @param {VFSFileHandleClass} cls handle class
             */
            export function register(
                protos: string,
                cls: VFSFileHandleClass
            ): void {
                handles[protos] = cls;
            }
            /**
             * Load custom VFS handles if the package vfsx available
             *
             * @export
             * @param {boolean} [force] force load the file
             * @return {*}  {Promise<any>}
             */
            export function loadVFSX(force?: boolean): Promise<any>
            {
                return new Promise(async (resolve, reject) => {
                    try {
                        await API.requires(VFSX_PATH, force);
                        resolve(true);
                    }
                    catch(e)
                    {
                        console.warn("No custom VFS protocol loaded");
                        resolve(true);
                    }
                })
            }
            /**
             * Looking for a attached file handle class of a string protocol
             *
             * When converting a string to file handle, the system will look
             * for a protocol pattern in the string, if the protocol found,
             * its attached handle class (found in [[VFS.handles]]) will be
             * used to initialize a file handle object from the string
             *
             * ```typescript
             *  "home://data/test.txt".asFileHandle() // -> an instance of RemoteFileHandle
             * ```
             * @export
             * @param {string} proto protocol string
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
             * Abstract prototype of all all VFS file handle definition.
             *
             * This prototype provides a standardized interface to access
             * to different underlay file systems such as remote file,
             * cloud file (Dropbox, Google drive, etc.), URL or memory-based file
             *
             * @export
             * @abstract
             * @class BaseFileHandle
             */
            export abstract class BaseFileHandle {
                /**
                 * Flag indicates whether the file is dirty
                 *
                 * @type {boolean}
                 * @memberof BaseFileHandle
                 */
                dirty: boolean;

                /**
                 * Once read, file content will be cached in this placeholder
                 * 
                 * @private
                 * @type {*}
                 * @memberof BaseFileHandle
                 */
                private _cache: any;

                /**
                 * Flag indicated whether the file meta-data is loaded
                 *
                 * @type {boolean}
                 * @memberof BaseFileHandle
                 */
                ready: boolean;

                /**
                 * File path
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                path: string;

                /**
                 * File protocol e.g:
                 * - `os://`
                 * - `home://`
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                protocol: string;

                /**
                 * List of path segments
                 *
                 * @type {string[]}
                 * @memberof BaseFileHandle
                 */
                genealogy: string[];

                /**
                 * File base name
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                basename: string;

                /**
                 * Once loaded, [[ready]] will be set to true and
                 * file meta-data will be stored in this place holder
                 *
                 * @type {FileInfoType}
                 * @memberof BaseFileHandle
                 */
                info: FileInfoType;

                /**
                 * File extension
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                ext: string;

                /**
                 *
                 * File type
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                type: string;
                /**
                 *Creates an instance of BaseFileHandle.
                 * @param {string} path file path
                 * @memberof BaseFileHandle
                 */
                constructor(path: string) {
                    this.dirty = false;
                    this.cache = undefined;
                    this.setPath(path);
                }



                /**
                 * Set a file path to the current file handle
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
                    this.genealogy = re.split("/").filter(s => s != "");
                    this.path = `${this.protocol}://${this.genealogy.join("/")}`;
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
                 * Getter: Get the file basename
                 * Setter: set the file name
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
                set filename(v: string) {
                    this.basename = v;
                }

                /**
                 * Getter: Get the file cache
                 * Setter: set the file cache
                 *
                 * @returns {any}
                 * @memberof BaseFileHandle
                 */
                get cache(): any {
                    return this._cache;
                }
                set cache(v: any) {
                    this._cache = v;
                    this._cache_changed();
                }

                /**
                 * Set data to the file cache
                 *
                 * @param {*} v data object
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                setCache(v: any): BaseFileHandle {
                    this.cache = v;
                    return this;
                }

                /**
                 * Return the object itself
                 *
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                asFileHandle(): BaseFileHandle {
                    return this;
                }

                /**
                 * Check whether the current file is the root of the file tree
                 *
                 * @returns {boolean}
                 * @memberof BaseFileHandle
                 */
                isRoot(): boolean {
                    return !this.genealogy || this.genealogy.length === 0;
                }

                /**
                 * Check whether the current file is a hidden file
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
                 * Get hash number of the current file path
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
                 * Convert the current file cache to Base64
                 *
                 * @protected
                 * @param {string} t type of the file cache:
                 * - `object`
                 * - `mime type`
                 * @returns {(Promise<string | ArrayBuffer>)} promise on the converted data
                 * @memberof BaseFileHandle
                 */
                protected b64(t: string): Promise<string | ArrayBuffer> {
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
                 * Get the parent file handle of the current file
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
                 * Load the file meta-data before performing
                 * any task
                 *
                 * @returns {Promise<FileInfoType>} a promise on file meta-data
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
                 * Public read operation
                 *
                 * This function calls the [[_rd]] function to perform the operation.
                 *
                 * If the current file is a directory, then the operation
                 * will return the meta-data of all files inside of the directory.
                 * Otherwise, file content will be returned
                 *
                 * @param {any} formal t data type
                 * - jsonp: the response is an json object
                 * - script: the response is a javascript code
                 * - xml, html: the response is a XML/HTML object
                 * - text: plain text
                 * - binary
                 * - other user case may be user specific data
                 * 
                 * @returns {Promise<any>} a promise on the file content
                 * @memberof BaseFileHandle
                 */
                read(t?: any): Promise<any> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const d = await this._rd(t);
                            resolve(d);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Write the file cache to the actual file
                 *
                 * This function calls the [[_wr]] function to perform the operation
                 * 
                 * @param {string} t data type
                 * - `base64`
                 * - `object`
                 * - `mime type`
                 * 
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                write(t: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r: RequestResult = await this._wr(t);
                            announcer.ostrigger("VFS", "write",this);
                            return resolve(r);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                /**
                 * Sub-directory creation
                 *
                 * This function calls the [[_mk]] function to perform the operation
                 *
                 * @param {string} d sub directory name
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                mk(d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const d_1 = await this._mk(d);
                            announcer.ostrigger("VFS","mk",this);
                            return resolve(d_1);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Delete the file
                 *
                 * This function calls the [[_rm]] function to perform the operation
                 * @param {any} d user data
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                remove(data?: any): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const d = await this._rm(data);
                            announcer.ostrigger("VFS", "remove",this);
                            return resolve(d);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Upload a file to the current directory
                 *
                 * Only work when the current file is a directory
                 *
                 * This function calls the [[_up]] function to perform the operation
                 *
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                upload(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const d = await this._up();
                            announcer.ostrigger("VFS", "upload", this);
                            return resolve(d);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Share the file by publish it.
                 *
                 * Only work with file
                 *
                 * This function calls the [[_pub]] function to perform the operation
                 *
                 * @returns {Promise<RequestResult>} promise on operation result
                 * @memberof BaseFileHandle
                 */
                publish(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const d = await this._pub();
                            announcer.ostrigger("VFS", "publish",this);
                            return resolve(d);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Download the file.
                 *
                 * Only work with file
                 *
                 * This function calls the [[_down]] function to perform the operation
                 *
                 * @returns {Promise<any>} Promise on the operation result
                 * @memberof BaseFileHandle
                 */
                download(): Promise<any> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const d = await this._down();
                            announcer.ostrigger("VFS", "download",this);
                            return resolve(d);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Move the current file to another location
                 *
                 * This function calls the [[_mv]] function to perform the operation
                 *
                 * @param {string} d destination location
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                move(d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const data = await this._mv(d);
                            announcer.ostrigger("VFS", "move",d.asFileHandle());
                            return resolve(data);

                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Execute the current file.
                 *
                 * This action depends on each file protocol
                 *
                 * This function calls the [[_exec]] function to perform the operation
                 *
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                execute(): Promise<any> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await this.onready();
                            const d = await this._exec();
                            announcer.ostrigger("VFS", "execute", this);
                            return resolve(d);
                        } catch (e_1) {
                            return reject(__e(e_1));
                        }
                    });
                }

                /**
                 * Get an accessible link to the file
                 * that can be accessed from the browser
                 *
                 * @returns {string}
                 * @memberof BaseFileHandle
                 */
                getlink(): string {
                    return this.path;
                }

                /**
                 * Helper function returns a promise on unsupported action
                 *
                 * @param {string} t action name
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected unsupported(t: string): Promise<RequestResult> {
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

                /**
                 * trigger cache changed event
                 *
                 * This function triggered when the file cached changed
                 *
                 * @protected
                 * @memberof BaseFileHandle
                 */
                protected _cache_changed():void {
                }

                /**
                 * Low level protocol-specific read operation
                 *
                 * This function should be overridden on the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {any} t data type, see [[read]]
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _rd(t: any): Promise<RequestResult> {
                    return this.unsupported("read");
                }

                /**
                 * Low level protocol-specific write operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {string} t data type, see [[write]]
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _wr(t: string): Promise<RequestResult> {
                    return this.unsupported("write");
                }

                /**
                 * Low level protocol-specific sub-directory creation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {string} d sub directory name
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _mk(d: string): Promise<RequestResult> {
                    return this.unsupported("mk");
                }
                /**
                 * Low level protocol-specific delete operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @param {*} [d] any user data
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _rm(d: any): Promise<RequestResult> {
                    return this.unsupported("remove");
                }

                /**
                 * Low level protocol-specific move operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _mv(d: string): Promise<RequestResult> {
                    return this.unsupported("move");
                }

                /**
                 * Low level protocol-specific upload operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _up(): Promise<RequestResult> {
                    return this.unsupported("upload");
                }

                /**
                 * Low level protocol-specific download operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                protected _down(): Promise<any> {
                    return this.unsupported("download");
                }

                /**
                 * Low level protocol-specific execute operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _exec(): Promise<RequestResult> {
                    return this.unsupported("execute");
                }

                /**
                 * Low level protocol-specific share operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _pub(): Promise<RequestResult> {
                    return this.unsupported("publish");
                }

                /**
                 * Read the current file meta-data
                 *
                 * should be implemented by subclasses
                 *
                 * @abstract
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                abstract meta(): Promise<RequestResult>;
            }

            /**
             * Remote file handle allows to perform file operation
             * on AntOS remote server files. Its protocol is defined
             * by the following pattern:
             *
             * ```
             * ^(home|desktop|os|Untitled)$
             * ```
             *
             * @class RemoteFileHandle
             * @extends {BaseFileHandle}
             */
            export class RemoteFileHandle extends BaseFileHandle {
                /**
                 *Creates an instance of RemoteFileHandle.
                 * @param {string} path file path
                 * @memberof RemoteFileHandle
                 */
                constructor(path: string) {
                    super(path);
                }

                /**
                 * Read remote file meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                meta(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const d = await API.handle.fileinfo(this.path);
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
                 * Remote file access link
                 *
                 * @returns {string}
                 * @memberof RemoteFileHandle
                 */
                getlink(): string {
                    return API.handle.get + "/" + this.path;
                }

                /**
                 * Read remote file content.
                 *
                 * If the current file is a directory, then the operation
                 * will return the meta-data of all files inside of the directory.
                 * Otherwise, file content will be returned
                 *
                 * @protected
                 * @param {string} t data type see [[read]]
                 * @returns {Promise<any>}
                 * @memberof RemoteFileHandle
                 */
                protected _rd(t: string): Promise<any> {
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
                    return API.handle.readfile(this.path, t ? t : "text");
                }

                /**
                 * Write file cache to the remote file
                 *
                 * @protected
                 * @param {string} t data type see [[write]]
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _wr(t: string): Promise<RequestResult> {
                    // t is base64 or undefined
                    return new Promise(async (resolve, reject) => {
                        try {
                            if (t === "base64") {
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
                            } else {
                                const r = await this.b64(t);
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
                            }
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                /**
                 * Create sub directory
                 *
                 * Only work on directory file handle
                 *
                 * @protected
                 * @param {string} d sub directory name
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _mk(d: string): Promise<RequestResult> {
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
                 * Delete file/folder
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _rm(): Promise<RequestResult> {
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
                 * Move file/folder
                 *
                 * @protected
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _mv(d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const r = await API.handle.move(this.path, d);
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
                 * Upload a file
                 *
                 * Only work with directory file handle
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _up(): Promise<RequestResult> {
                    return new Promise((resolve, reject) => {
                        if (this.info.type !== "dir") {
                            return reject(
                                API.throwe(__("{0} is not a file", this.path))
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
                 * Download a file
                 *
                 * only work with file
                 *
                 * @protected
                 * @returns {Promise<void>}
                 * @memberof RemoteFileHandle
                 */
                protected _down(): Promise<void> {
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
                 * Publish a file
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _pub(): Promise<RequestResult> {
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


            /**
             * Package file is remote file ([[RemoteFileHandle]]) located either in
             * the local user packages location or system packages
             * location, it should be in the following format:
             * 
             * ```
             * pkg://PKG_NAME/path/to/file
             * 
             * ```
             * 
             * The system will locale the package name PKG_NAME either in the system domain
             * or in user domain and return the correct path to the package
             *
             * @export
             * @class PackageFileHandle
             * @extends {RemoteFileHandle}
             */
            export class PackageFileHandle extends RemoteFileHandle {

                /**
                 *Creates an instance of PackageFileHandle.
                 * @param {string} pkg_path package path in string
                 * @memberof PackageFileHandle
                 */
                constructor(pkg_path: string) {
                    var error: FormattedString | string;
                    var pkg_name: string;
                    super(pkg_path);
                    // now find the correct path
                    if (!this.genealogy || this.genealogy.length == 0) {
                        error = __("Invalid package path");
                        announcer.oserror(error, API.throwe(error));
                        throw new Error(error.__());
                    }
                    else {
                        // get the correct path of the package
                        pkg_name = this.genealogy.shift();
                        if (OS.setting.system.packages[pkg_name]) {
                            this.setPath(OS.setting.system.packages[pkg_name].path + "/" + this.genealogy.join("/"));
                        }
                        else {
                            error = __("Package not found {0}", pkg_name);
                            announcer.oserror(error, API.throwe(error));
                            throw new Error(error.__());
                        }
                    }
                }
            }
            register("^pkg$", PackageFileHandle);

            /**
             * Application file is an AntOS special file allowing to
             * refer to an application as a regular file. Its protocol
             * pattern is defined as:
             *
             * ```typescript
             * "^app$" // e.g. app://Setting
             * ```
             *
             * @class ApplicationHandle
             * @extends {BaseFileHandle}
             */
            export class ApplicationHandle extends BaseFileHandle {
                /**
                 *Creates an instance of ApplicationHandle.
                 * @param {string} path file path
                 * @memberof ApplicationHandle
                 */
                constructor(path: string) {
                    super(path);
                    if (this.basename) {
                        let v = OS.setting.system.packages[this.basename];
                        this.info = {} as FileInfoType;
                        for(const p in v)
                        {
                            this.info[p] = v[p];
                        }

                        this.info.type = "app";
                        this.info.mime = "antos/app";
                        this.info.size = 0;
                        this.info.text = v.name;
                    }
                    this.ready = true;
                }

                /**
                 * Read application meta-data
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
                 * If the current file is root (e.g. `app://`), the operation
                 * will return all system packages meta-data.
                 *
                 * Otherwise, an error will be thrown
                 *
                 * @protected
                 * @param {string} t
                 * @returns {Promise<any>}
                 * @memberof ApplicationHandle
                 */
                protected _rd(t: string): Promise<any> {
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
                            if (v.app) {
                                result.push(v);
                            }
                        }
                        return resolve({
                            result: result,
                            error: false,
                        });
                    });
                }
            }

            register("^app$", ApplicationHandle);

            
            var MEM_PARTITION: BufferFileHandle = undefined;
            /**
             * A buffer file handle represents a virtual file that is stored
             * on the system memory. Its protocol pattern is defined as:
             *
             * ```typescript
             * "^mem$" // e.g. mem://test.txt
             * ```
             *
             * @class BufferFileHandle
             * @extends {BaseFileHandle}
             */
            export class BufferFileHandle extends BaseFileHandle {
                /**
                 *Creates an instance of BufferFileHandle.
                 * @param {string} path file path
                 * @param {string} mime file mime-type
                 * @param {*} data file data
                 * @memberof BufferFileHandle
                 */
                constructor(path: string, mime: string, data: any) {
                    super(path);
                    this.info = {
                        mime: mime?mime:'application/octet-stream',
                        path: path,
                        size: data ? data.length : 0,
                        name: this.basename,
                        filename:this.basename,
                        ctime: (new Date()).toGMTString(),
                        mtime: (new Date()).toGMTString(),
                        type: 'file',
                    };
                    if (data) {
                        this.cache = data;
                    }
                    return this.init_file_tree();
                }
                /**
                 * init the mem file tree if necessary
                 */
                private init_file_tree(): BufferFileHandle
                {
                    if(this.isRoot())
                    {
                        if(!MEM_PARTITION)
                        {
                            this.cache = {};
                            MEM_PARTITION = this;
                        }
                        return MEM_PARTITION;
                    }
                    let curr_level = "mem://".asFileHandle(); 
                    for(let i = 0;i<this.genealogy.length - 1;i++)
                    {
                        const segment = this.genealogy[i];
                        let handle = undefined;
                        if(segment == "..")
                        {
                            curr_level = curr_level.parent();
                            continue;
                        }

                        handle = curr_level.cache[segment];
                        if(!handle)
                        {
                            handle = new BufferFileHandle(`${curr_level.path}/${segment}`, 'dir', {});
                            curr_level.cache[segment] = handle;
                        }
                        curr_level = handle;
                        if(!curr_level.cache)
                        {
                            curr_level.cache = {};
                        }
                    }
                    if(this.basename == "..")
                    {
                        return curr_level.parent() as BufferFileHandle;
                    }
                    if(!curr_level.cache[this.basename])
                        curr_level.cache[this.basename] = this;
                    return curr_level.cache[this.basename];
                }

                /**
                 * cache changed handle
                 */
                protected _cache_changed(): void
                {
                    if(!this.cache)
                    {
                        return;
                    }
                    this.info.mime =  (new Date()).toGMTString();
                    if(typeof this.cache === "string" || this.cache instanceof Blob || this.cache instanceof Uint8Array)
                    {
                        this.info.type = "file";
                        if(typeof this.cache === "string")
                        {
                            this.info.mime = "text/plain";
                        }
                        else
                        {
                            this.info.mime = "application/octet-stream";
                        }
                    }
                    else
                    {
                        this.info.type = "dir";
                        this.info.mime = "dir";
                    }
                    this.info.size = this.cache.length;
                }
                /**
                 * Read the file meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                meta(): Promise<RequestResult> {
                    return new Promise((resolve, reject) =>
                    {
                        const data = {};
                        for(const k in this.info)
                        {
                            data[k] = this.info[k];
                        }
                        resolve({
                            result: data,
                            error: false,
                        })
                    });
                }

                /**
                 * Load the file meta-data before performing
                 * any task
                 *
                 * @returns {Promise<FileInfoType>} a promise on file meta-data
                 * @memberof BufferFileHandle
                 */
                onready(): Promise<FileInfoType> {
                    // read meta data
                    return new Promise(async (resolve, reject) => {
                        try
                        {
                            const d = await this.meta();
                            resolve(d.result as FileInfoType);
                        }
                        catch(e)
                        {
                            reject(__e(e));
                        }
                    });
                }
                
                /**
                 * Read file content stored in the file cached
                 *
                 * @protected
                 * @param {string} t data type see [[read]]
                 * @returns {Promise<any>}
                 * @memberof BufferFileHandle
                 */
                protected _rd(t: string): Promise<any> {
                    return new Promise((resolve, reject) => {
                        // read dir
                        if (this.info.type === "dir") {
                            return resolve({
                                result: (Object.values(this.cache) as BufferFileHandle[]).map(o=>o.info),
                                error: false,
                            });
                        }
                        return resolve(this.cache);
                    });
                }

                /**
                 * Write data to the file cache
                 *
                 * @protected
                 * @param {string} t data type, see [[write]]
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                protected _wr(t: string): Promise<RequestResult> {
                    return new Promise((resolve, reject) =>
                        resolve({
                            result: true,
                            error: false,
                        })
                    );
                }
                
                /**
                 * Create sub directory
                 *
                 * Only work on directory file handle
                 *
                 * @protected
                 * @param {string} d sub directory name
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                protected _mk(d: string): Promise<RequestResult> {
                    return new Promise((resolve, reject) => {
                        if (this.info.type === "file") {
                            return reject(
                                API.throwe(
                                    __("{0} is not a directory", this.path)
                                )
                            );
                        }
                        const handle = `${this.path}/${d}`.asFileHandle();
                        if(handle.info.type === "file")
                        {
                            handle.cache = {};
                        }
                        resolve({result: true, error: false});
                    });
                }

                /**
                 * Delete file/folder
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                protected _rm(): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            const parent = this.parent();
                            parent.cache[this.basename] = undefined;
                            delete parent.cache[this.basename];
                            return resolve({result: true, error: false});
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                setPath(p: string): void
                {
                    super.setPath(p);
                    if(this.info)
                        this.info.path = this.path;
                }

                private updatePath(path: string)
                {
                    this.setPath(path);
                    if(this.info.type == "file")
                    {
                        return;
                    }
                    for(const k in this.cache)
                    {
                        const child = this.cache[k];
                        child.updatePath(`${this.path}/${child.basename}`);
                    }
                }

                /**
                 * Move file/folder
                 *
                 * @protected
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                protected _mv(d: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {
                            if(d.includes(this.path))
                            {
                                return reject(API.throwe(__("Unable to move file/folder from {0} to {1}", this.path, d)));
                            }
                            const parent = this.parent()
                            parent.cache[this.basename] = undefined;
                            delete parent.cache[this.basename];

                            const dest = d.asFileHandle();
                            this.updatePath(dest.path);
                            dest.parent().cache[dest.basename] = this;
                            return resolve({result: true, error: false});
                        } catch (e) {
                            console.log(this);
                            return reject(__e(e));
                        }
                    });
                }


                /**
                 * Download the buffer file
                 *
                 * @protected
                 * @returns {Promise<void>}
                 * @memberof BufferFileHandle
                 */
                protected _down(): Promise<void> {
                    return new Promise((resolve, reject) => {
                        if(this.info.type == "dir")
                        {
                            return reject(API.throwe(__("{0} is a directory", this.path)));
                        }
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
             * URL file handle represents a HTTP/HTTPs link url
             * as an AntOS VFS file handle. Its protocol is defined as
             *
             * ```
             * ^(http|https|ftp)$
             * ```
             *
             * @class URLFileHandle
             * @extends {BaseFileHandle}
             */
            export class URLFileHandle extends BaseFileHandle {
                /**
                 *Creates an instance of URLFileHandle.
                 * @param {string} path
                 * @memberof URLFileHandle
                 */
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
                 * Read file meta-data
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

                /**
                 * Read URL content
                 *
                 * @protected
                 * @param {string} t data type see [[read]]
                 * @returns {Promise<any>}
                 * @memberof URLFileHandle
                 */
                protected _rd(t: string): Promise<any> {
                    //read the file
                    if (t === "binary") {
                        //return API.handle.fileblob(this.path);
                        return API.blob(this.path + "?_=" + new Date().getTime());
                    }
                    return API.get(this.path, t ? t : "text");
                }
            }

            API.VFS.register("^(http|https|ftp)$", URLFileHandle);

            /**
             * Shared file handle represents all AntOS shared file.
             * Its protocol is defined as:
             *
             * ```
             * ^shared$
             * ```
             *
             * @class SharedFileHandle
             * @extends {API.VFS.BaseFileHandle}
             */
            export class SharedFileHandle extends API.VFS.BaseFileHandle {
                /**
                 *Creates an instance of SharedFileHandle.
                 * @param {string} path file path
                 * @memberof SharedFileHandle
                 */
                constructor(path: string) {
                    super(path);
                    if (this.isRoot()) {
                        this.ready = true;
                    }
                }

                /**
                 * Read file meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                meta(): Promise<RequestResult> {
                    return API.handle.fileinfo(this.path);
                }

                /**
                 * Read file content
                 *
                 * @protected
                 * @param {string} t data type, see [[read]]
                 * @returns {Promise<any>}
                 * @memberof SharedFileHandle
                 */
                protected _rd(t: string): Promise<any> {
                    if (this.isRoot()) {
                        return API.get(`${API.handle.shared}/all`, t);
                    }
                    //read the file
                    if (t === "binary") {
                        return API.handle.fileblob(this.path);
                    }
                    return API.handle.readfile(this.path, t ? t : "text");
                }

                /**
                 * write data to shared file
                 *
                 * @protected
                 * @param {string} t data type, see [[write]]
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                protected _wr(t: string): Promise<RequestResult> {
                    return new Promise(async (resolve, reject) => {
                        try {

                            if (t === "base64") {
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
                            } else {
                                const r = await this.b64(t);
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
                            }
                        } catch (e) {
                            return reject(__e(e));
                        }
                    });
                }

                /**
                 * Un-publish the file
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                protected _rm(): Promise<RequestResult> {
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
                 * Download shared file
                 *
                 * @protected
                 * @returns {Promise<void>}
                 * @memberof SharedFileHandle
                 */
                protected _down(): Promise<void> {
                    return new Promise((resolve, reject) => {
                        if (this.info.type === "dir") {
                            return reject(
                                API.throwe(__("{0} is not a file", this.path))
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
                 * Un publish the file
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                protected _pub(): Promise<RequestResult> {
                    return new Promise((resolve, reject) =>
                        resolve({
                            result: this.basename,
                            error: false,
                        })
                    );
                }
            }

            API.VFS.register("^shared$", SharedFileHandle);

            /**Utilities global functions */

            /**
             * Read a file content from a zip archive
             *
             * The content type should be:
             * - base64 : the result will be a string, the binary in a base64 form.
             * - text (or string): the result will be an unicode string.
             * - binarystring: the result will be a string in “binary” form, using 1 byte per char (2 bytes).
             * - array: the result will be an Array of bytes (numbers between 0 and 255).
             * - uint8array : the result will be a Uint8Array. This requires a compatible browser.
             * - arraybuffer : the result will be a ArrayBuffer. This requires a compatible browser.
             * - blob : the result will be a Blob. This requires a compatible browser.             * 
             * If file_name is not specified, the first file_name in the zip archive will be read
             * @export
             * @param {string} file zip file
             * @param {string} type content type to read
             * @param {string} [file_name] the file should be read from the zip archive 
             * @return {*}  {Promise<any>}
             */
            export function readFileFromZip(file: string, type: string, file_name?: string): Promise<any> {
                return new Promise(async (resolve, reject) => {
                    try {
                        await API.requires("os://scripts/jszip.min.js");
                        const data = await file.asFileHandle().read("binary");
                        const zip = await JSZip.loadAsync(data);
                        if (!file_name) {
                            for (let name in zip.files) {
                                file_name = name;
                                break;
                            }
                        }
                        const udata = await zip.file(file_name).async(type);
                        resolve(udata);
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }


            /**
             * Cat all files to a single out-put
             *
             * @export
             * @param {string[]} list list of VFS files
             * @param {string} data input data string that will be cat to the files content
             * @param {string} join_by join on files content by this string
             * @return {*}  {Promise<string>}
             */
            export function cat(list: string[], data: string, join_by: string = "\n"): Promise<string> {
                return new Promise(async (resolve, reject) => {
                    if (list.length === 0) {
                        return resolve(data);
                    }
                    const promises = [];
                    for (const file of list) {
                        promises.push(file.asFileHandle().read("text"));
                    }
                    try {
                        const results = await Promise.all(promises);
                        resolve(`${data}${join_by}${results.join(join_by)}`);
                    } catch (error) {
                        reject(__e(error));
                    }
                });
            }


            /**
             * Read all files content on the list
             *
             * @export
             * @param {string[]} list list of VFS files
             * @param {GenericObject<string>[]} contents content array
             * @return {void}
             */
            export function read_files(list: string[]): Promise<GenericObject<string>[]> {
                const promises = [];
                for (const file of list) {
                    promises.push(file.asFileHandle().read("text"));
                }
                return Promise.all(promises);
            }


            /**
             * Copy files to a folder
             *
             * @export
             * @param {string[]} files list of files
             * @param {string} to destination folder
             * @return {*}  {Promise<any[]>}
             */
            export function copy(files: string[], to: string): Promise<any[]> {
                const promises = [];
                for (const path of files) {
                    promises.push(new Promise(async (resolve, reject) => {
                        try {
                            const file = path.asFileHandle();
                            const meta = await file.onready();
                            if (meta.type === "dir") {
                                const desdir = to.asFileHandle();
                                await desdir.mk(file.basename);
                                console.log(desdir, to);
                                const ret = await file.read();
                                const files = ret.result.map((v: API.FileInfoType) => v.path);
                                if (files.length > 0) {
                                    await copy(files, `${desdir.path}/${file.basename}`);
                                    resolve(undefined);
                                }
                                else {
                                    resolve(undefined);
                                }
                            }
                            else {
                                const tof = `${to}/${file.basename}`.asFileHandle();
                                const content = await file.read("binary");
                                await tof
                                    .setCache(
                                        new Blob([content], {
                                            type: file.info.mime,
                                        }))
                                    .write(file.info.mime);
                                resolve(undefined);
                            }
                        } catch (error) {
                            reject(__e(error));
                        }
                    }));
                }
                return Promise.all(promises);
            }

            /**
             * Add a list of files to the zip archive
             *
             * @param {string[]} list list of VFS files
             * @param {*} zip JSZip handle
             * @param {string} base root path of all added files in the zip
             * @return {*}  {Promise<any>}
             */
            function aradd(list: string[], zip: any, base: string): Promise<any> {
                const promises = [];
                for (const path of list) {
                    promises.push(new Promise(async (resolve, reject) => {
                        const file = path.asFileHandle();
                        try {
                            const meta = await file.asFileHandle().onready();
                            if (meta.type == "dir") {
                                const ret = await file.read();
                                const dirs: string[] = ret.result.map((v: API.FileInfoType) => v.path);
                                if (dirs.length > 0) {
                                    await aradd(dirs, zip, `${base}${file.basename}/`);
                                    resolve(undefined);
                                }
                                else {
                                    resolve(undefined);
                                }
                            }
                            else {
                                const u_data = await file.read("binary");
                                const z_path = `${base}${file.basename}`.replace(
                                    /^\/+|\/+$/g,
                                    ""
                                );
                                zip.file(z_path, u_data, { binary: true });
                                resolve(undefined);
                            }
                        } catch (error) {
                            reject(__e(error));
                        }
                    }));
                }
                return Promise.all(promises);
            }


            /**
             * Create a zip archive from a folder
             *
             * @export
             * @param {string} src source file/folder
             * @param {string} dest destination archive
             * @return {*}  {Promise<void>}
             */
            export function mkar(src: string, dest: string): Promise<void> {
                return new Promise(async (resolve, reject) => {
                    try {
                        await API.requires("os://scripts/jszip.min.js");
                        const zip = new JSZip();
                        const fhd = src.asFileHandle();
                        const meta = await fhd.onready();
                        if (meta.type === "file") {
                            await aradd([src], zip, "/");
                        }
                        else {
                            const ret = await fhd.read();
                            await aradd(
                                ret.result.map((v: API.FileInfoType) => v.path), zip, "/");
                        }
                        const z_data = await zip.generateAsync({ type: "base64" });
                        await dest.asFileHandle()
                            .setCache("data:application/zip;base64," + z_data)
                            .write("base64");
                        resolve();
                    } catch (error) {
                        reject(__e(error));
                    }
                });
            }

            /**
             * Create a list of directories
             *
             * @export
             * @param {string[]} list of directories to be created
             * @param {boolen} sync sync/async of directory creation
             * @return {*}  {Promise<any>}
             */
            export function mkdirAll(list: string[], sync?: boolean): Promise<any> {
                if (!sync) {
                    const promises = [];
                    for (const dir of list) {
                        const path = dir.asFileHandle()
                        promises.push(path.parent().mk(path.basename));
                    }
                    return Promise.all(promises);
                }
                else {
                    return new Promise(async (resolve, reject) => {
                        try {
                            if (list.length === 0) {
                                return resolve(true);
                            }
                            const dir = list.splice(0, 1)[0].asFileHandle();
                            const path = dir.parent();
                            const dname = dir.basename;
                            const r = await path.asFileHandle().mk(dname);
                            if (r.error) {
                                return reject(
                                    this._api.throwe(
                                        __(
                                            "Cannot create {0}",
                                            `${path}/${dir}`
                                        )
                                    )
                                );
                            }
                            await mkdirAll(list, sync);
                            resolve(true);
                        }
                        catch (e) {
                            reject(__e(e));
                        }
                    });
                }
            }



            /**
             *
             *
             * @export Extract a zip fle
             * @param {string} zfile zip file to extract
             * @param {(zip:any) => Promise<string>} [dest_callback] a callback to get extraction destination
             * @return {*}  {Promise<void>}
             */
            export function extractZip(zfile: string | API.VFS.BaseFileHandle, dest_callback: (zip: any) => Promise<string>): Promise<void> {
                return new Promise(async (resolve, reject) => {
                    try {
                        await API.requires("os://scripts/jszip.min.js");
                        const data = await zfile.asFileHandle().read("binary");
                        const zip = await JSZip.loadAsync(data);
                        const to = await dest_callback(zip);
                        const dirs = [];
                        const files = [];
                        for (const name in zip.files) {
                            const file = zip.files[name];
                            if (file.dir) {
                                dirs.push(to + "/" + name);
                            } else {
                                files.push(name);
                            }
                        }
                        await mkdirAll(dirs, true);
                        const promises = [];
                        for (const file of files) {
                            promises.push(new Promise(async (res, rej) => {
                                try {
                                    const data = await zip.file(file).async("uint8array");
                                    const path = `${to}/${file}`;
                                    const fp = path.asFileHandle();
                                    fp.cache = new Blob([data], { type: "octet/stream" });
                                    const r = await fp.write("text/plain");
                                    if (r.error) {
                                        return rej(
                                            API.throwe(
                                                __("Cannot extract file to {0}", path)
                                            )
                                        );
                                    }
                                    return res(path);
                                } catch (error) {
                                    rej(__e(error));
                                }
                            }));
                        }
                        await Promise.all(promises);
                        resolve();
                    } catch (e) {
                        return reject(__e(e));
                    }
                });
            }

            /**
             * Make files from a set of template files
             *
             * @export
             * @param {Array<string[]>} list mapping paths between templates files and created files
             * @param {string} path files destination
             * @param {(data: string) => string} callback: pre-processing files content before writing to destination files
             * @return {*}  {Promise<any[]>}
             */
            export function mktpl(
                list: Array<string[]>,
                path: string,
                callback: (data: string) => string
            ): Promise<any[]> {
                const promises = [];
                for (const tpl of list) {
                    promises.push(new Promise(async (resolve, reject) => {
                        try {
                            const data = await `${path}/${tpl[0]}`.asFileHandle().read();
                            const file = tpl[1].asFileHandle();
                            file.setCache(callback(data));
                            await file.write("text/plain");
                            resolve(undefined);
                        } catch (error) {
                            reject(__e(error));
                        }
                    }));
                }
                return Promise.all(promises);
            }
        }
    }
}
