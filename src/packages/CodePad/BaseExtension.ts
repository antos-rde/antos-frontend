/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    const CodePad = OS.application.CodePad;
    declare var JSZip: any;

    export namespace application {
        export type CodePadBaseExtension = typeof BaseExtension;
    }
    /**
     *
     *
     * @class BaseExtension
     */
    class BaseExtension {
        protected app: OS.application.CodePad;
        constructor(app: OS.application.CodePad) {
            this.app = app;
        }

        /**
         *
         *
         * @returns {Promise<any>}
         * @memberof BaseExtension
         */
        preload(): Promise<any> {
            return API.require(this.dependencies());
        }

        /**
         *
         *
         * @param {string[]} libs
         * @returns {Promise<any>}
         * @memberof BaseExtension
         */
        import(libs: string[]): Promise<any> {
            return API.require(libs);
        }

        /**
         *
         *
         * @protected
         * @returns {string}
         * @memberof BaseExtension
         */
        protected basedir(): string {
            return `${this.app.meta().path}`;
        }

        /**
         *
         *
         * @protected
         * @param {(string | FormattedString)} m
         * @returns {void}
         * @memberof BaseExtension
         */
        protected notify(m: string | FormattedString): void {
            return this.app.notify(m);
        }

        /**
         *
         *
         * @protected
         * @param {(string | FormattedString)} m
         * @param {Error} e
         * @returns {void}
         * @memberof BaseExtension
         */
        protected error(m: string | FormattedString, e: Error): void {
            return this.app.error(m, e);
        }

        /**
         *
         *
         * @protected
         * @returns {string[]}
         * @memberof BaseExtension
         */
        protected dependencies(): string[] {
            return [];
        }

        /**
         *
         *
         * @protected
         * @param {string[]} list
         * @param {string} data
         * @returns {Promise<string>}
         * @memberof BaseExtension
         */
        protected cat(list: string[], data: string): Promise<string> {
            return new Promise((resolve, reject) => {
                if (list.length === 0) {
                    return resolve(data);
                }
                const file = list.splice(0, 1)[0].asFileHandle();
                return file
                    .read()
                    .then((text: string) => {
                        data = data + "\n" + text;
                        return this.cat(list, data)
                            .then((d) => resolve(d))
                            .catch((e) => reject(__e(e)));
                    })
                    .catch((e: Error) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @protected
         * @param {string[]} files
         * @param {string} to
         * @returns {Promise<any>}
         * @memberof BaseExtension
         */
        protected copy(files: string[], to: string): Promise<any> {
            return new Promise((resolve, reject) => {
                if (files.length === 0) {
                    return resolve();
                }
                const file = files.splice(0, 1)[0].asFileHandle();
                const tof = `${to}/${file.basename}`.asFileHandle();
                return file
                    .onready()
                    .then((meta: { type: string }) => {
                        if (meta.type === "dir") {
                            // copy directory
                            const desdir = to.asFileHandle();
                            return desdir
                                .mk(file.basename)
                                .then(() => {
                                    // read the dir content
                                    return file
                                        .read()
                                        .then((data: API.RequestResult) => {
                                            const list = (data.result as API.FileInfoType[]).map(
                                                (v) => v.path
                                            );
                                            return this.copy(
                                                list,
                                                `${desdir.path}/${file.basename}`
                                            )
                                                .then(() => {
                                                    return this.copy(files, to)
                                                        .then(() => resolve())
                                                        .catch((e) =>
                                                            reject(__e(e))
                                                        );
                                                })
                                                .catch((e) => reject(__e(e)));
                                        })
                                        .catch((e: Error) => reject(__e(e)));
                                })
                                .catch((e: Error) => reject(__e(e)));
                        } else {
                            // copy file
                            return file
                                .read("binary")
                                .then(async (data: ArrayBuffer) => {
                                    const d = await tof
                                        .setCache(
                                            new Blob([data], {
                                                type: file.info.mime,
                                            })
                                        )
                                        .write(file.info.mime);
                                    try {
                                        await this.copy(files, to);
                                        return resolve();
                                    } catch (e) {
                                        return reject(__e(e));
                                    }
                                })
                                .catch((e: Error) => reject(__e(e)));
                        }
                    })
                    .catch((e: Error) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @private
         * @param {string[]} list
         * @param {*} zip
         * @param {string} base
         * @returns {Promise<any>}
         * @memberof BaseExtension
         */
        private aradd(list: string[], zip: any, base: string): Promise<any> {
            return new Promise((resolve, reject) => {
                if (list.length === 0) {
                    return resolve(zip);
                }
                const path = list.splice(0, 1)[0];
                const file = path.asFileHandle();
                return file
                    .onready()
                    .then((meta: { type: string }) => {
                        if (meta.type === "dir") {
                            return file
                                .read()
                                .then(
                                    (d: {
                                        result:
                                            | Iterable<unknown>
                                            | ArrayLike<unknown>;
                                    }) => {
                                        const l = (d.result as API.FileInfoType[]).map(
                                            (v) => v.path
                                        );
                                        return this.aradd(
                                            l,
                                            zip,
                                            `${base}${file.basename}/`
                                        )
                                            .then(() => {
                                                return this.aradd(
                                                    list,
                                                    zip,
                                                    base
                                                )
                                                    .then(() => resolve(zip))
                                                    .catch((e) =>
                                                        reject(__e(e))
                                                    );
                                            })
                                            .catch((e) => reject(__e(e)));
                                    }
                                )
                                .catch((e: Error) => reject(__e(e)));
                        } else {
                            return file
                                .read("binary")
                                .then(async (d: any) => {
                                    const zpath = `${base}${file.basename}`.replace(
                                        /^\/+|\/+$/g,
                                        ""
                                    );
                                    zip.file(zpath, d, { binary: true });
                                    try {
                                        await this.aradd(list, zip, base);
                                        return resolve(zip);
                                    }
                                    catch (e) {
                                        return reject(__e(e));
                                    }
                                })
                                .catch((e: Error) => reject(__e(e)));
                        }
                    })
                    .catch((e: Error) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @protected
         * @param {string} src
         * @param {string} dest
         * @returns {Promise<any>}
         * @memberof BaseExtension
         */
        protected mkar(src: string, dest: string): Promise<any> {
            this.notify(__("Preparing for release"));
            return new Promise((resolve, reject) => {
                return new Promise(async (r, e) => {
                    try {
                        await this.import(["os://scripts/jszip.min.js"]);
                        try {
                            const d = await src.asFileHandle().read();
                            return r(d.result);
                        } catch (ex) {
                            return e(__e(ex));
                        }
                    } catch (ex_1) {
                        return e(__e(ex_1));
                    }
                })
                    .then((files: API.FileInfoType[]) => {
                        return new Promise(async (r, e) => {
                            const zip = new JSZip();
                            try {
                                const z = await this.aradd(
                                    files.map((v: { path: any }) => v.path),
                                    zip,
                                    "/"
                                );
                                return r(z);
                            } catch (ex) {
                                return e(__e(ex));
                            }
                        });
                    })
                    .then((zip: any) => {
                        return zip
                            .generateAsync({ type: "base64" })
                            .then((data: string) => {
                                return dest
                                    .asFileHandle()
                                    .setCache(
                                        "data:application/zip;base64," + data
                                    )
                                    .write("base64")
                                    .then((r: any) => {
                                        resolve();
                                        return this.notify(
                                            __(
                                                "Archive is generated at: {0}",
                                                dest
                                            )
                                        );
                                    })
                                    .catch((e: Error) => reject(__e(e)));
                            });
                    })
                    .catch((e) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @protected
         * @param {string[]} list
         * @returns {Promise<any>}
         * @memberof BaseExtension
         */
        protected mkdirAll(list: string[]): Promise<any> {
            return new Promise((resolve, reject) => {
                if (list.length === 0) {
                    return resolve();
                }
                const path = list.splice(0, 1)[0].asFileHandle();
                return path
                    .parent()
                    .mk(path.basename)
                    .then((d: any) => {
                        this.app.observable.trigger("filechange", {
                            file: path.parent(),
                            type: "dir",
                        });
                        return this.mkdirAll(list)
                            .then(() => resolve())
                            .catch((e) => reject(__e(e)));
                    })
                    .catch((e: Error) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @protected
         * @param {string[]} list
         * @param {string} path
         * @param {string} name
         * @returns {Promise<any>}
         * @memberof BaseExtension
         */
        protected mkfileAll(
            list: Array<string[]>,
            path: string,
            name: string
        ): Promise<any> {
            return new Promise((resolve, reject) => {
                if (list.length === 0) {
                    return resolve();
                }
                const item = list.splice(0, 1)[0];
                return `${this.basedir()}/${item[0]}`
                    .asFileHandle()
                    .read()
                    .then((data) => {
                        const file = item[1].asFileHandle();
                        return file
                            .setCache(data.format(name, `${path}/${name}`))
                            .write("text/plain")
                            .then(() => {
                                this.app.trigger("filechange", {
                                    file,
                                    type: "file",
                                });
                                return this.mkfileAll(list, path, name)
                                    .then(() => resolve())
                                    .catch((e) => reject(__e(e)));
                            })
                            .catch((e: Error) => reject(__e(e)));
                    })
                    .catch((e) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @protected
         * @param {string} file
         * @returns {Promise<GenericObject<any>>}
         * @memberof BaseExtension
         */
        protected metadata(file: string): Promise<GenericObject<any>> {
            return new Promise((resolve, reject) => {
                if (!this.app.currdir) {
                    return reject(
                        API.throwe(__("Current folder is not found"))
                    );
                }
                `${this.app.currdir.path}/${file}`
                    .asFileHandle()
                    .read("json")
                    .then((data) => resolve(data))
                    .catch((e) => {
                        return reject(
                            API.throwe(__("Unable to read meta-data"))
                        );
                    });
            });
        }
    }

    CodePad.extensions = {};
    CodePad.BaseExtension = BaseExtension;
}
