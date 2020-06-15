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

"use strict";
/**
 * Reference to the global this
 */
const Ant = this;

/**
 * Extend the String prototype with some API
 * functions used by AntOS API
 *
 * @interface String
 */
interface String {
    /**
     * Simple string hash function
     *
     * @returns {number}
     * @memberof String
     */
    hash(): number;

    /**
     * Parse the current string and convert it
     * to an object of type [[Version]] if the string
     * is in the format recognized by [[Version]],
     * e.g.: `1.0.1-a`
     *
     * @returns {OS.Version}
     * @memberof String
     */
    __v(): OS.Version;

    /**
     * Convert the current string to base 64 string
     *
     * @returns {string}
     * @memberof String
     */
    asBase64(): string;

    /**
     * Unescape all escaped characters on the
     * string using `\`
     *
     * @returns {string}
     * @memberof String
     */
    unescape(): string;

    /**
     * Convert the current string to uint8 array
     *
     * @returns {Uint8Array}
     * @memberof String
     */
    asUint8Array(): Uint8Array;

    /**
     * Format the current using input parameters.
     * The current string should be a formatted string
     * in the following form:
     *
     * ```typescript
     * "example string: {0} and {1}".format("hello", "world")
     * // return "example string: hello and world"
     * ```
     *
     * @param {...any[]} args
     * @returns {string}
     * @memberof String
     */
    format(...args: any[]): string;

    /**
     * Create a [[FormattedString]] object using the current
     * string and the input parameters
     *
     * @param {...any[]} args
     * @returns {OS.FormattedString}
     * @memberof String
     */
    f(...args: any[]): OS.FormattedString;

    /**
     * Check if the current string is translatable, if it
     * is the case, translate the string to the language specified
     * in the current system locale setting.
     *
     * A translatable string is a string in the following
     * form: `"__(example string)"`
     *
     * @returns {string}
     * @memberof String
     */
    __(): string;

    /**
     * Translate current string to the language specified
     * by the system locale setting
     *
     * @returns {string}
     * @memberof String
     */
    l(): string;

    /**
     * Trim left of a string by a mask string
     *
     * @param {string} arg specifies a sub-string to be removed
     * @returns {string}
     * @memberof String
     */
    trimLeft(arg: string): string;

    /**
     * Trim right of a string by a mask string
     *
     * @param {string} arg specifies a sub-string to be removed
     * @returns {string}
     * @memberof String
     */
    trimRight(arg: string): string;

    /**
     * Trim both left and right of a string by a mask string
     *
     * @param {string} arg specifies a sub-string to be removed
     * @returns {string}
     * @memberof String
     */
    trimBy(arg: string): string;
}

/**
 * Extend the Data prototype with the
 * [[timestamp]] function
 *
 * @interface Date
 */
interface Date {
    /**
     * Return the timestamp of the current Date object
     *
     * @returns {number}
     * @memberof Date
     */
    timestamp(): number;
}

/**
 * Generic key-value pair object interface
 *
 * @interface GenericObject
 * @template T
 */
interface GenericObject<T> {
    [index: string]: T;
}

/**
 * Global function to create a [[FormattedString]] from
 * a formatted string and a list of parameters. Example
 *
 * ```typescript
 * __("hello {0}", world) // return a FormattedString object
 * ```
 *
 * @param {...any[]} args
 * @returns {(OS.FormattedString | string)}
 */
declare function __(...args: any[]): OS.FormattedString | string;

/**
 * This global function allow chaining stack trace from one error to
 * another. It is particular helping when tracking the source of
 * the error in promises chain which results in some obfuscated stack
 * traces as the stack resets on every new promise.
 *
 * @param {Error} e
 * @returns {Error}
 */
declare function __e(e: Error): Error;

/**
 * This namespace is the main entry point of AntOS
 * API
 */
namespace OS {
    /**
     * Return an range of numbers
     *
     * @param {number} left start of the range
     * @param {number} right end of the range
     * @param {boolean} inclusive specifies whether the
     * `right` of the range is included in the returned array
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

    Ant.__ = function (...args: any[]): FormattedString | string {
        if (!(args.length > 0)) {
            return "Undefined";
        }
        const d = args[0];
        d.l();
        return new FormattedString(
            d,
            __range__(1, args.length - 1, true).map((i) => args[i])
        );
    };

    Ant.__e = function (e: Error): Error {
        const reason = new Error(e.toString());
        reason.stack += "\nCaused By:\n" + e.stack;
        return reason;
    };

    /**
     * Represent a translatable formatted string
     *
     * @export
     * @class FormattedString
     */
    export class FormattedString {
        /**
         * Format string in the following form
         *
         * ```typescript
         * "format string with {0} and {1}"
         * // {[0-9]} is the format pattern
         * ```
         *
         * @type {string}
         * @memberof FormattedString
         */
        fs: string;

        /**
         * The value of the format pattern represented
         * in [[fs]]
         *
         * @type {any[]}
         * @memberof FormattedString
         */
        values: any[];

        /**
         * Creates an instance of FormattedString.
         * @param {string} fs format string
         * @param {any[]} args input values of the format patterns
         * @memberof FormattedString
         */
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
         * Convert FormattedString to String
         *
         * @returns {string}
         * @memberof FormattedString
         */
        toString(): string {
            return this.__();
        }

        /**
         * Translate the format string to the current system
         * locale language, format the string with values and
         * then converted it to normal `string`
         *
         * @returns {string}
         * @memberof FormattedString
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
         * Return the hash number of the formatted string
         *
         * @returns {number}
         * @memberof FormattedString
         */
        hash(): number {
            return this.__().hash();
        }

        /**
         * Match the formatted string against a regular expression
         * a string pattern
         *
         * @param {(string | RegExp)} t string or regular expression
         * @returns {RegExpMatchArray}
         * @memberof FormattedString
         */
        match(t: string | RegExp): RegExpMatchArray {
            return this.__().match(t);
        }

        /**
         * Convert the formatted string to Base^$
         *
         * @returns {string}
         * @memberof FormattedString
         */
        asBase64(): string {
            return this.__().asBase64();
        }

        /**
         * Un escape the formatted string
         *
         * @returns {string}
         * @memberof FormattedString
         */
        unescape(): string {
            return this.__().unescape();
        }

        /**
         * Convert the formatted string to uint8 array
         *
         * @returns {Uint8Array}
         * @memberof FormattedString
         */
        asUint8Array(): Uint8Array {
            return this.__().asUint8Array();
        }

        /**
         * Input values for the format string
         *
         * @param {...any[]} args
         * @memberof FormattedString
         */
        format(...args: any[]): void {
            __range__(0, args.length - 1, true).map(
                (i) => (this.values[i] = args[i])
            );
        }
    }

    /**
     * This class represents the Version number format used by AntOS. A typical
     * AntOS version number is in the following format:
     *
     * ```
     * [major_number].[minor_number].[patch]-[branch]
     *
     * e.g.: 1.2.3-r means that:
     * - version major number is 1
     * - version minor number is 2
     * - patch version is 3
     * - the current branch is release `r`
     * ```
     *
     * @export
     * @class Version
     */
    export class Version {
        /**
         * The version string
         *
         * @type {string}
         * @memberof Version
         */
        string: string;

        /**
         * The current branch
         * - 1: `a` - alpha branch
         * - 2: `b` - beta branch
         * - 3: `r` - release branch
         *
         * @private
         * @type {number}
         * @memberof Version
         */
        private branch: number;

        /**
         * Version major number
         *
         * @type {number}
         * @memberof Version
         */
        major: number;

        /**
         * Version minor number
         *
         * @type {number}
         * @memberof Version
         */
        minor: number;

        /**
         * Version patch number
         *
         * @type {number}
         * @memberof Version
         */
        patch: number;

        /**
         *Creates an instance of Version.
         * @param {string} string string represents the version
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
         * Compare the current version with another version.
         *
         * The comparison priority is `branch>major>minor>patch`.
         *
         * For the branch, the priority is `r>b>a`
         *
         * @param {(string | Version)} o version string or object
         * @returns {(0 | 1 | -1)}
         * Return 0 if the two versions are the same, 1 if
         * the current version is newer than the input version,
         * otherwise return -1
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
         * Check if the current version is newer than
         * the input version
         *
         * @param {(string | Version)} o version string or object
         * @returns {boolean}
         * @memberof Version
         */
        nt(o: string | Version): boolean {
            return this.compare(o) === 1;
        }

        /**
         * Check if the current version is older than
         * the input version
         *
         * @param {(string | Version)} o version string or object
         * @returns {boolean}
         * @memberof Version
         */
        ot(o: string | Version): boolean {
            return this.compare(o) === -1;
        }

        /**
         * Return itself
         *
         * @returns {Version}
         * @memberof Version
         */
        __v(): Version {
            return this;
        }

        /**
         * Convert Version object to string
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
            if (this) return this.toString();
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

    String.prototype.f = function (...args: any[]): FormattedString {
        return new FormattedString(this, args);
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
    String.prototype.trimLeft = function (charlist: string): string {
        if (charlist === undefined) charlist = "s";

        return this.replace(new RegExp("^[" + charlist + "]+"), "");
    };
    String.prototype.trimRight = function (charlist: string): string {
        if (charlist === undefined) charlist = "s";

        return this.replace(new RegExp("[" + charlist + "]+$"), "");
    };

    String.prototype.trimBy = function (charlist: string) {
        return this.trimLeft(charlist).trimRight(charlist);
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

    /**
     * Variable represents the current AntOS version, it
     * is an instance of [[Version]]
     */
    export const VERSION: Version = "1.0.0-a".__v();
    /**
     * Register a model prototype to the system namespace.
     * There are two types of model to be registered, if the model
     * is of type [[SubWindow]], its prototype will be registered
     * in the [[dialogs]] namespace, otherwise, if the model type
     * is [[Application]] or [[Service]], its prototype will be
     * registered in the [[application]] namespace.
     *
     * When a model is loaded in the system, its prototype is registered
     * for later uses
     *
     * @export
     * @param {string} name class name
     * @param {*} x the corresponding class
     * @returns {*}
     */
    export function register(name: string, x: PM.ModelTypeClass): void {
        if (((x as any) as typeof BaseModel).type === ModelType.SubWindow) {
            GUI.dialogs[name] = x;
        } else {
            application[name] = x;
        }
    }

    /**
     * This function cleans up the entire system and
     * makes sure the system is in a new and clean session.
     * It performs the following operations:
     *
     * - Kill all running processes
     * - Unregister all global events and reset the  global
     * announcement system
     * - Clear the current theme
     * - Reset process manager and all system settings
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
     * Booting up AntOS. This function checks whether the user
     * is successfully logged in, then call [[startAntOS]], otherwise
     * it shows the login screen
     *
     * @export
     */
    export function boot(): void {
        //first login
        console.log("Booting system");
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

    /**
     * Placeholder for all the callbacks that are called when the system
     * exits. These callbacks are useful when an application or service wants
     * to perform a particular task before shuting down the system
     */
    export const cleanupHandles: { [index: string]: () => void } = {};

    /**
     * Perform the system shutdown operation. This function calls all
     * clean up handles in [[cleanupHandles]], then save the system setting
     * before exiting
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
                return API.handle.logout().then((d: any) => boot());
            })
            .catch((e: Error) => console.error(e));
    }

    /**
     * Register a callback to the system [[cleanupHandles]]
     *
     * @export
     * @param {string} n callback string name
     * @param {() => void} f the callback handle
     * @returns
     */
    export function onexit(n: string, f: () => void) {
        if (!cleanupHandles[n]) {
            return (cleanupHandles[n] = f);
        }
    }
    /**
     *
     */
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
                        reject(API.throwe(__("Unable to get blob: {0}", p)));
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
         * Perform an REST GET request
         *
         * @export
         * @param {string} p the URI of the request
         * @param {string} [t=undefined] the response data type:
         * - jsonp: the response is an json object
         * - script: the response is a javascript code
         * - xm, html: the response is a XML/HTNL object
         * - text: plain text
         * @returns {Promise<any>} a Promise on the requested data
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
                                    announcer.trigger("sharedlibraryloaded", l);
                                    return resolve(undefined);
                                })
                                .catch((e: Error) => reject(__e(e)));
                        case "js":
                            return API.script(libfp.getlink())
                                .then(function (data: any) {
                                    API.shared[l] = true;
                                    console.log("Loaded :", l);
                                    announcer.trigger("sharedlibraryloaded", l);
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
                announcer.observable.one("sharedlibraryloaded", function (l) {
                    libs.splice(0, 1);
                    return API.require(libs)
                        .catch((e: Error) => reject(__e(e)))
                        .then((r: any) => resolve(r));
                });
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
         * @param {(string | FormattedString)} n
         * @returns {Error}
         */
        export function throwe(n: string | FormattedString): Error {
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
