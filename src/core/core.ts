/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
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

"use strict";
const Ant = this;

/**
 *
 *
 * @interface String
 */
interface String {
    hash(): number;
    __v(): OS.Version;
    asBase64(): string;
    unescape(): string;
    asUint8Array(): Uint8Array;
    format(...args: any[]): string;
    f(...args: any[]): OS.FormatedString;
    __(): string;
    l(): string;
}

/**
 *
 *
 * @interface Date
 */
interface Date {
    timestamp(): number;
}

/**
 *
 *
 * @interface GenericObject
 * @template T
 */
interface GenericObject<T> {
    [index: string]: T;
}

/**
 *
 *
 * @param {...any[]} args
 * @returns {(OS.FormatedString | string)}
 */
declare function __(...args: any[]): OS.FormatedString | string;

/**
 *
 *
 * @param {Error} e
 * @returns {Error}
 */
declare function __e(e: Error): Error;

//define the OS object
namespace OS {
    /**
     *
     *
     * @param {number} left
     * @param {number} right
     * @param {boolean} inclusive
     * @returns {number[]}
     */
    function __range__(
        left: number,
        right: number,
        inclusive: boolean
    ): number[] {
        let range = [];
        let ascending = left < right;
        let end = !inclusive ? right : ascending ? right + 1 : right - 1;
        for (
            let i = left;
            ascending ? i < end : i > end;
            ascending ? i++ : i--
        ) {
            range.push(i);
        }
        return range;
    }

    Ant.__ = function (...args: any[]): FormatedString | string {
        if (!(args.length > 0)) {
            return "Undefined";
        }
        const d = args[0];
        d.l();
        return new FormatedString(
            d,
            __range__(1, args.length - 1, true).map((i) => args[i])
        );
    };

    // chaning error
    Ant.__e = function (e: Error): Error {
        const reason = new Error(e.toString());
        reason.stack += "\nCaused By:\n" + e.stack;
        return reason;
    };

    /**
     *
     *
     * @export
     * @class FormatedString
     */
    export class FormatedString {
        fs: string;
        values: any[];
        constructor(fs: string, args: any[]) {
            this.fs = fs;
            this.values = [];
            if (!args) {
                return;
            }
            for (
                let i = 0, end = args.length - 1, asc = 0 <= end;
                asc ? i <= end : i >= end;
                asc ? i++ : i--
            ) {
                this.values[i] = args[i];
            }
        }

        /**
         *
         *
         * @returns {string}
         * @memberof FormatedString
         */
        toString(): string {
            return this.__();
        }

        /**
         *
         *
         * @returns {string}
         * @memberof FormatedString
         */
        __(): string {
            return this.fs
                .l()
                .replace(/{(\d+)}/g, (match: string, n: number) => {
                    if (typeof this.values[n] !== "undefined") {
                        return this.values[n].__();
                    } else {
                        return match;
                    }
                });
        }

        /**
         *
         *
         * @returns {number}
         * @memberof FormatedString
         */
        hash(): number {
            return this.__().hash();
        }

        /**
         *
         *
         * @param {(string | RegExp)} t
         * @returns {RegExpMatchArray}
         * @memberof FormatedString
         */
        match(t: string | RegExp): RegExpMatchArray {
            return this.__().match(t);
        }

        /**
         *
         *
         * @returns {string}
         * @memberof FormatedString
         */
        asBase64(): string {
            return this.__().asBase64();
        }

        /**
         *
         *
         * @returns {string}
         * @memberof FormatedString
         */
        unescape(): string {
            return this.__().unescape();
        }

        /**
         *
         *
         * @returns {Uint8Array}
         * @memberof FormatedString
         */
        asUint8Array(): Uint8Array {
            return this.__().asUint8Array();
        }

        /**
         *
         *
         * @param {...any[]} args
         * @memberof FormatedString
         */
        format(...args: any[]): void {
            __range__(0, args.length - 1, true).map(
                (i) => (this.values[i] = args[i])
            );
        }
    }

    /**
     *
     *
     * @export
     * @class Version
     */
    export class Version {
        string: string;
        private branch: number;
        major: number;
        minor: number;
        patch: number;

        /**
         *Creates an instance of Version.
         * @param {string} string
         * @memberof Version
         */
        constructor(string: string) {
            this.string = string;
            const arr = this.string.split("-");
            const br = {
                r: 3,
                b: 2,
                a: 1,
            };
            this.branch = 3;
            if (arr.length === 2 && br[arr[1]]) {
                this.branch = br[arr[1]];
            }
            const mt = arr[0].match(/\d+/g);
            if (!mt) {
                API.throwe(
                    __("Version string is in invalid format: {0}", this.string)
                );
            }
            this.major = 0;
            this.minor = 0;
            this.patch = 0;
            if (mt.length >= 1) {
                this.major = Number(mt[0]);
            }
            if (mt.length >= 2) {
                this.minor = Number(mt[1]);
            }
            if (mt.length >= 3) {
                this.patch = Number(mt[2]);
            }
        }

        /**
         *
         *
         * @param {(string | Version)} o
         * @returns {(0 | 1 | -1)}
         * @memberof Version
         */
        compare(o: string | Version): 0 | 1 | -1 {
            const other = o.__v();
            if (this.branch > other.branch) {
                return 1;
            }
            if (this.branch < other.branch) {
                return -1;
            }
            if (
                this.major === other.major &&
                this.minor === other.minor &&
                this.patch === other.patch
            ) {
                return 0;
            }
            if (this.major > other.major) {
                return 1;
            }
            if (this.major < other.major) {
                return -1;
            }
            if (this.minor > other.minor) {
                return 1;
            }
            if (this.minor < other.minor) {
                return -1;
            }
            if (this.patch > other.patch) {
                return 1;
            }
            return -1;
        }

        /**
         *
         *
         * @param {(string | Version)} o
         * @returns {boolean}
         * @memberof Version
         */
        nt(o: string | Version): boolean {
            return this.compare(o) === 1;
        }

        /**
         *
         *
         * @param {(string | Version)} o
         * @returns {boolean}
         * @memberof Version
         */
        ot(o: string | Version): boolean {
            return this.compare(o) === -1;
        }

        /**
         *
         *
         * @returns {Version}
         * @memberof Version
         */
        __v(): Version {
            return this;
        }

        /**
         *
         *
         * @returns {string}
         * @memberof Version
         */
        toString(): string {
            return this.string;
        }
    }

    Object.defineProperty(Object.prototype, "__", {
        value() {
            if(this)
                return this.toString();
        },
        enumerable: false,
        writable: true,
    });

    String.prototype.hash = function (): number {
        let hash = 5381;
        let i = this.length;
        while (i) {
            hash = (hash * 33) ^ this.charCodeAt(--i);
        }
        return hash >>> 0;
    };
    String.prototype.__v = function (): Version {
        return new Version(this);
    };
    String.prototype.asBase64 = function (): string {
        const tmp = encodeURIComponent(this);
        return btoa(
            tmp.replace(/%([0-9A-F]{2})/g, (match, p1) =>
                String.fromCharCode(parseInt(p1, 16))
            )
        );
    };
    String.prototype.unescape = function (): string {
        let d = this;
        d = d.replace(/\\\\/g, "\\");
        d = d.replace(/\\"/g, '"');
        d = d.replace(/\\n/g, "\n");
        d = d.replace(/\\t/g, "\t");
        d = d.replace(/\\b/g, "\b");
        d = d.replace(/\\f/g, "\f");
        d = d.replace(/\\r/g, "\r");
        return d;
    };
    String.prototype.asUint8Array = function (): Uint8Array {
        let bytes = [];
        for (
            let i = 0, end = this.length - 1, asc = 0 <= end;
            asc ? i <= end : i >= end;
            asc ? i++ : i--
        ) {
            bytes.push(this.charCodeAt(i));
        }
        return new Uint8Array(bytes);
    };

    if (!String.prototype.format) {
        String.prototype.format = function (...args: any[]): string {
            return this.replace(/{(\d+)}/g, function (
                match: string,
                number: number
            ) {
                if (typeof args[number] !== "undefined") {
                    return args[number].__();
                } else {
                    return match;
                }
            });
        };
    }

    String.prototype.f = function (...args: any[]): FormatedString {
        return new FormatedString(this, args);
    };

    String.prototype.__ = function (): string {
        const match = this.match(/^__\((.*)\)$/);
        if (match) {
            return match[1].l();
        }
        return this;
    };
    String.prototype.l = function (): string {
        if (!API.lang[this]) {
            API.lang[this] = this;
        }
        return API.lang[this];
    };

    Date.prototype.toString = function (): string {
        let dd = this.getDate();
        let mm = this.getMonth() + 1;
        const yyyy = this.getFullYear();
        let hh = this.getHours();
        let mi = this.getMinutes();
        let se = this.getSeconds();

        if (dd < 10) {
            dd = `0${dd}`;
        }
        if (mm < 10) {
            mm = `0${mm}`;
        }
        if (hh < 10) {
            hh = `0${hh}`;
        }
        if (mi < 10) {
            mi = `0${mi}`;
        }
        if (se < 10) {
            se = `0${se}`;
        }
        return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${se}`;
    };

    Date.prototype.timestamp = function (): number {
        return (this.getTime() / 1000) | 0;
    };

    export const VERSION:Version = "1.0.0-a".__v();
    /**
     *
     *
     * @export
     * @param {string} name
     * @param {*} x
     * @returns {*}
     */
    export function register(name: string, x: PM.ProcessTypeClass): void {
        if ((x as any as typeof BaseModel).type === ModelType.SubWindow) {
            GUI.dialog[name] = x;
        } else {
            (application[name] = x);
        }
    }

    /**
     *
     *
     * @export
     */
    export function cleanup(): void {
        console.log("Clean up system");
        for (let a in PM.processes) {
            const v = PM.processes[a];
            PM.killAll(a, true);
        }
        if (announcer.observable) {
            announcer.observable.off("*");
        }
        $(window).off("keydown");
        $("#workspace").off("mouseover");
        delete announcer.observable;
        $("#wrapper").empty();
        GUI.clearTheme();
        announcer.observable = new API.Announcer();
        announcer.quota = 0;
        resetSetting();
        PM.processes = {};
        PM.pidalloc = 0;
    }

    /**
     *
     *
     * @export
     */
    export function boot(): void {
        //first login
        console.log("Booting sytem");
        API.handle
            .auth()
            .then(function (d: API.RequestResult) {
                // in case someone call it more than once :)
                if (d.error) {
                    // show login screen
                    return GUI.login();
                } else {
                    // startX :)
                    return GUI.startAntOS(d.result);
                }
            })
            .catch((e: Error) => console.error(e));
    }

    export const cleanupHandles: { [index: string]: () => void } = {};

    /**
     *
     *
     * @export
     */
    export function exit(): void {
        //do clean up first
        for (let n in cleanupHandles) {
            const f = cleanupHandles[n];
            f();
        }
        API.handle
            .setting()
            .then(function (r: any) {
                cleanup();
                return API.handle
                    .logout()
                    .then((d: any) => boot());
            })
            .catch((e: Error) => console.error(e));
    }

    /**
     *
     *
     * @export
     * @param {string} n
     * @param {() => void} f
     * @returns
     */
    export function onexit(n: string, f: () => void) {
        if (!cleanupHandles[n]) {
            return (cleanupHandles[n] = f);
        }
    }

    export namespace API {
        /**
         *
         *
         * @export
         * @interface PackageType
         */
        export interface PackageMetaType {
            app: string;
            category: string;
            description: string;
            services?: string[];
            iconclass?: string;
            info: {
                author: string;
                email: string;
                [propName: string]: any;
            };
            locales: { [index: string]: GenericObject<string> };
            mimes: string[];
            name: string;
            path: string;
            version: string;
            [propName: string]: any;
        }
        export const shared: GenericObject<boolean> = {};

        export const searchHandle: GenericObject<(text: string) => any[]> = {};

        export var lang: GenericObject<string> = {};

        
        /**
         *
         *
         * @export
         * @returns {number}
         */
        export function mid(): number {
            return announcer.getMID();
        }

        /**
         *
         *
         * @export
         * @param {string} p
         * @param {*} d
         * @returns {Promise<any>}
         */
        export function post(p: string, d: any): Promise<any> {
            return new Promise(function (resolve, reject) {
                const q = announcer.getMID();
                API.loading(q, p);
                return $.ajax({
                    type: "POST",
                    url: p,
                    contentType: "application/json",
                    data: JSON.stringify(
                        d,
                        function (k, v) {
                            if (k === "domel") {
                                return undefined;
                            }
                            return v;
                        },
                        4
                    ),
                    dataType: "json",
                    success: null,
                })
                    .done(function (data) {
                        API.loaded(q, p, "OK");
                        return resolve(data);
                    })
                    .fail(function (j, s, e) {
                        API.loaded(q, p, "FAIL");
                        return reject(API.throwe(s));
                    });
            });
        }

        /**
         *
         *
         * @export
         * @param {string} p
         * @returns {Promise<ArrayBuffer>}
         */
        export function blob(p: string): Promise<ArrayBuffer> {
            return new Promise(function (resolve, reject) {
                const q = announcer.getMID();
                const r = new XMLHttpRequest();
                r.open("GET", p, true);
                r.responseType = "arraybuffer";
                r.onload = function (e) {
                    if (this.status === 200 && this.readyState === 4) {
                        API.loaded(q, p, "OK");
                        resolve(this.response);
                    } else {
                        API.loaded(q, p, "FAIL");
                        reject(
                            API.throwe(__("Unable to get blob: {0}", p))
                        );
                    }
                };
                API.loading(q, p);
                r.send();
            });
        }

        /**
         *
         *
         * @export
         * @param {string} p
         * @param {string} d
         * @returns {Promise<any>}
         */
        export function upload(p: string, d: string): Promise<any> {
            return new Promise(function (resolve, reject) {
                const q = announcer.getMID();
                //insert a temporal file selector
                const o = $("<input>")
                    .attr("type", "file")
                    .css("display", "none");
                o.change(function () {
                    API.loading(q, p);
                    const formd = new FormData();
                    formd.append("path", d);
                    // TODO: only one file is selected at this time
                    formd.append("upload", (o[0] as HTMLInputElement).files[0]);

                    return $.ajax({
                        url: p,
                        data: formd,
                        type: "POST",
                        contentType: false,
                        processData: false,
                    })
                        .done(function (data) {
                            API.loaded(q, p, "OK");
                            resolve(data);
                            return o.remove();
                        })
                        .fail(function (j, s, e) {
                            API.loaded(q, p, "FAIL");
                            reject(API.throwe(s));
                            return o.remove();
                        });
                });
                return o.click();
            });
        }

        /**
         *
         *
         * @export
         * @param {string} name
         * @param {*} b
         */
        export function saveblob(name: string, b: any): void {
            const url = window.URL.createObjectURL(b);
            const o = $("<a>")
                .attr("href", url)
                .attr("download", name)
                .css("display", "none")
                .appendTo("body");
            o[0].click();
            window.URL.revokeObjectURL(url);
            o.remove();
        }

        /**
         *
         *
         * @export
         * @param {number} q
         * @param {string} p
         */
        export function loading(q: number, p: string): void {
            announcer.trigger("loading", {
                id: q,
                data: { m: `${p}`, s: true },
                name: "OS",
            });
        }

        /**
         *
         *
         * @export
         * @param {number} q
         * @param {string} p
         * @param {string} m
         */
        export function loaded(q: number, p: string, m: string): void {
            announcer.trigger("loaded", {
                id: q,
                data: { m: `${m}: ${p}`, s: false },
                name: "OS",
            });
        }

        /**
         *
         *
         * @export
         * @param {string} p
         * @param {string} [t=undefined]
         * @returns {Promise<any>}
         */
        export function get(p: string, t: string = undefined): Promise<any> {
            return new Promise(function (resolve, reject) {
                const conf: any = {
                    type: "GET",
                    url: p,
                };
                if (t) {
                    conf.dataType = t;
                }
                const q = announcer.getMID();
                API.loading(q, p);
                return $.ajax(conf)
                    .done(function (data) {
                        API.loaded(q, p, "OK");
                        return resolve(data);
                    })
                    .fail(function (j, s, e) {
                        API.loaded(q, p, "FAIL");
                        return reject(API.throwe(s));
                    });
            });
        }

        /**
         *
         *
         * @export
         * @param {string} p
         * @returns {Promise<any>}
         */
        export function script(p: string): Promise<any> {
            return API.get(p, "script");
        }

        /**
         *
         *
         * @export
         * @param {string} r
         * @returns {Promise<any>}
         */
        export function resource(r: string): Promise<any> {
            const path = `resources/${r}`;
            return API.get(path);
        }

        /**
         *
         *
         * @export
         * @param {string} l
         * @returns {boolean}
         */
        export function libready(l: string): boolean {
            return API.shared[l] || false;
        }

        /**
         *
         *
         * @export
         * @param {string} l
         * @returns {Promise<any>}
         */
        export function requires(l: string): Promise<any> {
            return new Promise(function (resolve, reject) {
                if (!API.shared[l]) {
                    const libfp = l.asFileHandle();
                    switch (libfp.ext) {
                        case "css":
                            return libfp
                                .onready()
                                .then(function () {
                                    $("<link>", {
                                        rel: "stylesheet",
                                        type: "text/css",
                                        href: `${libfp.getlink()}`,
                                    }).appendTo("head");
                                    API.shared[l] = true;
                                    console.log("Loaded :", l);
                                    announcer.trigger(
                                        "sharedlibraryloaded",
                                        l
                                    );
                                    return resolve(undefined);
                                })
                                .catch((e: Error) => reject(__e(e)));
                        case "js":
                            return API.script(libfp.getlink())
                                .then(function (data: any) {
                                    API.shared[l] = true;
                                    console.log("Loaded :", l);
                                    announcer.trigger(
                                        "sharedlibraryloaded",
                                        l
                                    );
                                    return resolve(data);
                                })
                                .catch((e: Error) => reject(__e(e)));
                        default:
                            return reject(
                                API.throwe(__("Invalid library: {0}", l))
                            );
                    }
                } else {
                    console.log(l, "Library exist, no need to load");
                    announcer.trigger("sharedlibraryloaded", l);
                    return resolve();
                }
            });
        }

        /**
         *
         *
         * @export
         * @param {string[]} libs
         * @returns {Promise<any>}
         */
        export function require(libs: string[]): Promise<any> {
            return new Promise(function (resolve, reject) {
                if (!(libs.length > 0)) {
                    return resolve();
                }
                announcer.observable.one(
                    "sharedlibraryloaded",
                    function (l) {
                        libs.splice(0, 1);
                        return API.require(libs)
                            .catch((e: Error) => reject(__e(e)))
                            .then((r: any) => resolve(r));
                    }
                );
                return API.requires(libs[0]).catch((e: Error) =>
                    reject(__e(e))
                );
            });
        }
        export namespace packages {

            /**
             *
             *
             * @export
             * @returns {Promise<RequestResult>}
             */
            export function fetch(): Promise<RequestResult> {
                return API.handle.packages({
                    command: "list",
                    args: {
                        paths: (() => {
                            const result = [];
                            for (let k in OS.setting.system.pkgpaths) {
                                const v = OS.setting.system.pkgpaths[k];
                                result.push(v);
                            }
                            return result;
                        })(),
                    },
                });
            }

            /**
             *
             *
             * @export
             * @returns {Promise<RequestResult>}
             */
            export function cache(): Promise<RequestResult> {
                return API.handle.packages({
                    command: "cache",
                    args: {
                        paths: (() => {
                            const result = [];
                            for (let k in OS.setting.system.pkgpaths) {
                                const v = OS.setting.system.pkgpaths[k];
                                result.push(v);
                            }
                            return result;
                        })(),
                    },
                });
            }
        }

        
        /**
         *
         *
         * @export
         * @returns {Promise<RequestResult>}
         */
        export function setting(): Promise<RequestResult> {
            return API.handle.setting();
        }

        /**
         *
         *
         * @export
         * @param {GenericObject<any>} d
         * @param {boolean} ws
         * @returns {Promise<any>}
         */
        export function apigateway(
            d: GenericObject<any>,
            ws: boolean
        ): Promise<any> {
            return API.handle.apigateway(d, ws);
        }

        /**
         *
         *
         * @export
         * @param {string} text
         * @returns {any[]}
         */
        export function search(text: string): any[] {
            let r = [];

            for (let k in searchHandle) {
                const ret = searchHandle[k](text);
                if (ret.length > 0) {
                    ret.unshift({
                        text: k,
                        class: "search-header",
                        dataid: "header",
                    });
                    r = r.concat(ret);
                }
            }
            return r;
        }

        /**
         *
         *
         * @export
         * @param {string} name
         * @param {(text: string) => any[]} fn
         */
        export function onsearch(
            name: string,
            fn: (text: string) => any[]
        ): void {
            if (!searchHandle[name]) {
                searchHandle[name] = fn;
            }
        }

        /**
         *
         *
         * @export
         * @param {string} name
         * @returns {Promise<any>}
         */
        export function setLocale(name: string): Promise<any> {
            return new Promise(async function (resolve, reject) {
                const path = `resources/languages/${name}.json`;
                try {
                    const d = await API.get(path, "json");
                    OS.setting.system.locale = name;
                    API.lang = d;
                    announcer.trigger("systemlocalechange", name);
                    return resolve(d);
                } catch (e) {
                    return reject(__e(e));
                }
            });
        }

        /**
         *
         *
         * @export
         * @param {(string | FormatedString)} n
         * @returns {Error}
         */
        export function throwe(n: string | FormatedString): Error {
            let err = undefined;
            try {
                throw new Error(n.__());
            } catch (e) {
                err = e;
            }
            return err;
        }

        /**
         *
         *
         * @export
         * @param {string} v
         * @returns {boolean}
         */
        export function setClipboard(v: string): boolean {
            const $el = $("#clipboard");
            $el.val(v);
            ($el[0] as HTMLInputElement).select();
            ($el[0] as HTMLInputElement).setSelectionRange(0, 99999);
            return document.execCommand("copy");
        }

        /**
         *
         *
         * @export
         * @returns {Promise<any>}
         */
        export function getClipboard(): Promise<any> {
            return new Promise(function (resolve, reject) {
                const $el = $("#clipboard");
                if (!navigator.clipboard) {
                    return resolve($el.val());
                }
                return navigator.clipboard
                    .readText()
                    .then((d: string) => resolve(d))
                    .catch((e) => reject(__e(e)));
            });
        }
        
        /**
         *
         *
         * @export
         * @returns {*}
         */
        export function switcher(...args: string[]): any {
            let k: any, v: any;
            const o: any = {};
            const p = {};
            for (
                let i = 0, end = arguments.length - 1, asc = 0 <= end;
                asc ? i <= end : i >= end;
                asc ? i++ : i--
            ) {
                p[arguments[i]] = false;
            }
            Object.defineProperty(o, "__p", {
                enumerable: false,
                value: p,
            });
            const fn = function (o: any, v: any) {
                return Object.defineProperty(o, v, {
                    enumerable: true,
                    set(value) {
                        for (let k in this.__p) {
                            const l = this.__p[k];
                            this.__p[k] = false;
                        }
                        return (o.__p[v] = value);
                    },
                    get() {
                        return o.__p[v];
                    },
                });
            };
            for (k in o.__p) {
                v = o.__p[k];
                fn(o, k);
            }
            Object.defineProperty(o, "selected", {
                configurable: true,
                enumerable: false,
                get() {
                    for (k in o.__p) {
                        v = o.__p[k];
                        if (v) {
                            return k;
                        }
                    }
                },
            });
            return o;
        }
    }
}
