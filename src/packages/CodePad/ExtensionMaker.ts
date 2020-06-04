namespace OS {
    // import the CodePad application module
    const App = OS.application.CodePad;

    declare var CoffeeScript: any;
    declare var JSZip: any;
    /**
     *
     *
     * @class ExtensionMaker
     * @extends {App.BaseExtension}
     */
    class ExtensionMaker extends App.BaseExtension {
        constructor(app: application.CodePad) {
            super(app);
        }

        // public functions
        /**
         *
         *
         * @memberof ExtensionMaker
         */
        create(): void {
            this.app
                .openDialog("FileDialog", {
                    title: "__(New CodePad extension at)",
                    file: { basename: __("ExtensionName") },
                    mimes: ["dir"],
                })
                .then((d) => {
                    return this.mktpl(d.file.path, d.name);
                });
        }

        /**
         *
         *
         * @memberof ExtensionMaker
         */
        buildnrun(): void {
            this.metadata("extension.json")
                .then(async (meta) => {
                    try {
                        await this.build(meta);
                        try {
                            return this.run(meta);
                        } catch (e) {
                            return this.error(__("Unable to run extension"), e);
                        }
                    } catch (e_1) {
                        return this.error(__("Unable to build extension"), e_1);
                    }
                })
                .catch((e) => this.error(__("Unable to read meta-data"), e));
        }

        /**
         *
         *
         * @memberof ExtensionMaker
         */
        release(): void {
            this.metadata("extension.json")
                .then(async (meta) => {
                    try {
                        await this.build(meta);
                        try {
                            return this.mkar(
                                `${meta.root}/build/debug`,
                                `${meta.root}/build/release/${meta.meta.name}.zip`
                            );
                        } catch (e) {
                            return this.error(
                                __("Unable to create archive"),
                                e
                            );
                        }
                    } catch (e_1) {
                        return this.error(__("Unable to build extension"), e_1);
                    }
                })
                .catch((e) => this.error(__("Unable to read meta-data"), e));
        }

        /**
         *
         *
         * @memberof ExtensionMaker
         */
        install(): void {
            this.app
                .openDialog("FileDialog", {
                    title: "__(Select extension archive)",
                    mimes: [".*/zip"],
                })
                .then(async (d) => {
                    try {
                        await this.installZip(d.file.path);
                        this.notify(__("Extension installed"));
                        return this.app.loadExtensionMetaData();
                    } catch (e) {
                        return this.error(__("Unable to install extension"), e);
                    }
                });
        }

        /**
         *
         *
         * @private
         * @param {string} path
         * @param {string} name
         * @memberof ExtensionMaker
         */
        private mktpl(path: string, name: string): void {
            const rpath = `${path}/${name}`;
            const dirs = [
                rpath,
                `${rpath}/build`,
                `${rpath}/build/release`,
                `${rpath}/build/debug`,
            ];
            const files = [
                ["templates/ext-main.tpl", `${rpath}/${name}.coffee`],
                ["templates/ext-extension.tpl", `${rpath}/extension.json`],
            ];
            this.mkdirAll(dirs)
                .then(async () => {
                    try {
                        await this.mkfileAll(files, path, name);
                        this.app.currdir = rpath.asFileHandle();
                        this.app.initSideBar();
                        return this.app.openFile(
                            `${rpath}/${name}.coffee`.asFileHandle() as application.CodePadFileHandle
                        );
                    } catch (e) {
                        return this.error(
                            __("Unable to create extension template"),
                            e
                        );
                    }
                })
                .catch((e) =>
                    this.error(__("Unable to create extension directories"), e)
                );
        }

        /**
         *
         *
         * @private
         * @param {string[]} list
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private verify(list: string[]): Promise<any> {
            return new Promise((resolve, reject) => {
                if (list.length === 0) {
                    return resolve();
                }
                const file = list.splice(0, 1)[0].asFileHandle();
                this.notify(__("Verifying: {0}", file.path));
                return file
                    .read()
                    .then((data) => {
                        try {
                            CoffeeScript.nodes(data);
                            return this.verify(list)
                                .then(() => resolve())
                                .catch((e) => reject(__e(e)));
                        } catch (ex) {
                            return reject(__e(ex));
                        }
                    })
                    .catch((e) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @private
         * @param {GenericObject<any>} meta
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private compile(meta: GenericObject<any>): Promise<any> {
            return new Promise(async (resolve, reject) => {
                try {
                    await this.import([`${this.basedir()}/libs/coffeescript.js`]);
                    const list = meta.coffees.map(
                        (v) => `${meta.root}/${v}`
                    );
                    try {
                        await this.verify(list.map((x: string) =>x));
                        try {
                            const code = await this.cat(list, "");
                            const jsrc = CoffeeScript.compile(code);
                            this.notify(__("Compiled successful"));
                            return resolve(jsrc);
                        } catch (e) {
                            return reject(__e(e));
                        }
                    } catch (e_1) {
                        return reject(__e(e_1));
                    }
                } catch (e_2) {
                    return reject(__e(e_2));
                }
            });
        }

        /**
         *
         *
         * @private
         * @param {GenericObject<any>} meta
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private build(meta: GenericObject<any>): Promise<any> {
            return new Promise(async (resolve, reject) => {
                try {
                    const src = await this.compile(meta);
                    let v: string;
                    try {
                        const jsrc = await this.cat(
                            (() => {
                                const result = [];
                                for (v of meta.javascripts) {
                                    result.push(`${meta.root}/${v}`);
                                }
                                return result;
                            })(),
                            src
                        );
                        await new Promise((r, e) =>
                            `${meta.root}/build/debug/${meta.meta.name}.js`
                                .asFileHandle()
                                .setCache(jsrc)
                                .write("text/plain")
                                .then((d) => r())
                                .catch((ex) => e(__e(ex)))
                        );
                        await new Promise((r, e) =>
                            `${meta.root}/build/debug/extension.json`
                                .asFileHandle()
                                .setCache(meta.meta)
                                .write("object")
                                .then((data) => r(data))
                                .catch((ex_1) => e(__e(ex_1)))
                        );
                        await this.copy(
                            (() => {
                                const result1 = [];
                                for (v of meta.copies) {
                                    result1.push(`${meta.root}/${v}`);
                                }
                                return result1;
                            })(),
                            `${meta.root}/build/debug`
                        );
                        return resolve();
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
         * @private
         * @param {GenericObject<any>} meta
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private run(meta: GenericObject<any>): Promise<any> {
            return new Promise(async (resolve, reject) => {
                const path = `${meta.root}/build/debug/${meta.meta.name}.js`;
                if (API.shared[path]) {
                    delete API.shared[path];
                }
                try {
                    await API.requires(path);
                    let v: GenericObject<any>;
                    if (this.app.extensions[meta.meta.name]) {
                        this.app.extensions[meta.meta.name].child = [];
                        for (v of meta.meta.actions) {
                            this.app.extensions[meta.meta.name].addAction(v);
                        }
                    } else {
                        this.app.extensions[meta.meta.name] = new App.CMDMenu(
                            meta.meta.text
                        );
                        this.app.extensions[meta.meta.name].name =
                            meta.meta.name;
                        for (v of meta.meta.actions) {
                            this.app.extensions[meta.meta.name].addAction(v);
                        }
                        this.app.spotlight.addAction(
                            this.app.extensions[meta.meta.name]
                        );
                        this.app.extensions[meta.meta.name].onchildselect(
                            (e: GUI.TagEventType<GUI.tag.ListItemEventData>) => {
                                return this.app.loadAndRunExtensionAction(
                                    e.data.item.data as any
                                );
                            }
                        );
                    }
                    this.app.spotlight.run(this.app);
                    return resolve();
                } catch (e) {
                    return reject(__e(e));
                }
            });
        }

        /**
         *
         *
         * @private
         * @param {string[]} files
         * @param {*} zip
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private installExtension(files: string[], zip: any): Promise<any> {
            return new Promise((resolve, reject) => {
                const idx = files.indexOf("extension.json");
                if (idx < 0) {
                    reject(API.throwe(__("No meta-data found")));
                }
                const metafile = files.splice(idx, 1)[0];
                // read the meta file
                return zip
                    .file(metafile)
                    .async("uint8array")
                    .then((d: Uint8Array) => {
                        const meta = JSON.parse(
                            new TextDecoder("utf-8").decode(d)
                        );
                        return this.installFiles(files, zip, meta)
                            .then(() => resolve())
                            .catch((e) => reject(__e(e)));
                    })
                    .catch((e: Error) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @private
         * @param {string[]} files
         * @param {*} zip
         * @param {GenericObject<any>} meta
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private installFiles(
            files: string[],
            zip: any,
            meta: GenericObject<any>
        ): Promise<any> {
            if (files.length === 0) {
                return this.installMeta(meta);
            }
            return new Promise((resolve, reject) => {
                const file = files.splice(0, 1)[0];
                const path = `${this.basedir()}/${file}`;
                return zip
                    .file(file)
                    .async("uint8array")
                    .then((d: Uint8Array) => {
                        return path
                            .asFileHandle()
                            .setCache(new Blob([d], { type: "octet/stream" }))
                            .write("text/plain")
                            .then((r) => {
                                if (r.error) {
                                    return reject(r.error);
                                }
                                return this.installFiles(files, zip, meta)
                                    .then(() => resolve())
                                    .catch((e) => reject(__e(e)));
                            })
                            .catch((e) => reject(__e(e)));
                    })
                    .catch((e: Error) => reject(__e(e)));
            });
        }

        /**
         *
         *
         * @private
         * @param {GenericObject<any>} meta
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private installMeta(meta: GenericObject<any>): Promise<any> {
            return new Promise(async (resolve, reject) => {
                const file = `${
                    this.app.meta().path
                }/extensions.json`.asFileHandle();
                try {
                    const data = await file.read("json");
                    const names = [];
                    for (let v of data) {
                        names.push(v.name);
                    }
                    const idx = names.indexOf(meta.name);
                    if (idx >= 0) {
                        data.splice(idx, 1);
                    }
                    data.push(meta);
                    try {
                        await file.setCache(data).write("object");
                        return resolve();
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
         * @private
         * @param {string} path
         * @returns {Promise<any>}
         * @memberof ExtensionMaker
         */
        private installZip(path: string): Promise<any> {
            return new Promise((resolve, reject) => {
                this.import(["os://scripts/jszip.min.js"])
                    .then(() => {
                        path.asFileHandle()
                            .read("binary")
                            .then((data) => {
                                JSZip.loadAsync(data)
                                    .then((zip: any) => {
                                        const pth = this.basedir();
                                        const dir = [];
                                        const files = [];
                                        for (let name in zip.files) {
                                            const file = zip.files[name];
                                            if (file.dir) {
                                                dir.push(pth + "/" + name);
                                            } else {
                                                files.push(name);
                                            }
                                        }
                                        if (dir.length > 0) {
                                            this.mkdirAll(dir)
                                                .then(() => {
                                                    this.installExtension(
                                                        files,
                                                        zip
                                                    )
                                                        .then(() => resolve())
                                                        .catch((e) =>
                                                            reject(__e(e))
                                                        );
                                                })
                                                .catch((e) => reject(__e(e)));
                                        } else {
                                            this.installExtension(files, zip)
                                                .then(() => resolve())
                                                .catch((e) => reject(__e(e)));
                                        }
                                    })
                                    .catch((e: Error) => reject(__e(e)));
                            })
                            .catch((e) => reject(__e(e)));
                    })
                    .catch((e) => reject(__e(e)));
            });
        }
    }

    App.extensions.ExtensionMaker = ExtensionMaker;
}
