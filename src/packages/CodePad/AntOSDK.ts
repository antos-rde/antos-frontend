namespace OS {
    // import the CodePad application module
    const App = OS.application.CodePad;

    declare var CoffeeScript: any;
    declare var JSZip: any;
    declare var Terser: any;

    /**
     *
     *
     * @class AntOSDK
     * @extends {App.BaseExtension}
     */
    class AntOSDK extends App.BaseExtension {
        /**
         *Creates an instance of AntOSDK.
         * @param {application.CodePad} app
         * @memberof AntOSDK
         */
        constructor(app: application.CodePad) {
            super(app);
        }

        // public functions
        /**
         *
         *
         * @returns
         * @memberof AntOSDK
         */
        create(): void {
            this.app
                .openDialog("FileDialog", {
                    title: "__(New Project at)",
                    file: { basename: __("ProjectName") },
                    mimes: ["dir"],
                })
                .then((d) => {
                    return this.mktpl(d.file.path, d.name, true);
                });
        }

        /**
         *
         *
         * @returns {void}
         * @memberof AntOSDK
         */
        init(): void {
            const dir = this.app.currdir;
            if (!dir || !dir.basename) {
                return this.create();
            }
            dir.read().then((d) => {
                if (d.error) {
                    return this.notify(__("Cannot read folder: {0}", dir.path));
                }
                if (d.result.length !== 0) {
                    return this.notify(
                        __("The folder is not empty: {0}", dir.path)
                    );
                }
                this.mktpl(dir.parent().path, dir.basename);
            });
        }

        /**
         *
         *
         * @memberof AntOSDK
         */
        buildnrun(): void {
            this.metadata("project.json")
                .then(async (meta) => {
                    try {
                        await this.build(meta, true);
                        try {
                            return this.run(meta);
                        } catch (e) {
                            return this.error(__("Unable to run project"), e);
                        }
                    } catch (e_1) {
                        return this.error(__("Unable to build project"), e_1);
                    }
                })
                .catch((e) => this.error(__("Unable to read meta-data"), e));
        }

        /**
         *
         *
         * @memberof AntOSDK
         */
        release(): void {
            this.metadata("project.json")
                .then(async (meta) => {
                    try {
                        await this.build(meta, false);
                        try {
                            return this.mkar(
                                `${meta.root}/build/debug`,
                                `${meta.root}/build/release/${meta.name}.zip`
                            );
                        } catch (e) {
                            return this.error(
                                __("Unable to create package archive"),
                                e
                            );
                        }
                    } catch (e_1) {
                        return this.error(__("Unable to build project"), e_1);
                    }
                })
                .catch((e) => this.error(__("Unable to read meta-data"), e));
        }

        // private functions
        /**
         *
         *
         * @private
         * @param {string} path
         * @param {string} name
         * @param {boolean} [flag]
         * @memberof AntOSDK
         */
        private mktpl(path: string, name: string, flag?: boolean): void {
            const rpath = `${path}/${name}`;
            const dirs = [
                `${rpath}/javascripts`,
                `${rpath}/css`,
                `${rpath}/coffees`,
                `${rpath}/assets`,
            ];
            if (flag) {
                dirs.unshift(rpath);
            }
            const files = [
                ["templates/sdk-main.tpl", `${rpath}/coffees/main.coffee`],
                ["templates/sdk-package.tpl", `${rpath}/package.json`],
                ["templates/sdk-project.tpl", `${rpath}/project.json`],
                ["templates/sdk-README.tpl", `${rpath}/README.md`],
                ["templates/sdk-scheme.tpl", `${rpath}/assets/scheme.html`],
            ];
            this.mkdirAll(dirs)
                .then(async () => {
                    try {
                        await this.mkfileAll(files, path, name);
                        this.app.currdir = rpath.asFileHandle();
                        this.app.initSideBar();
                        return this.app.openFile(
                            `${rpath}/README.md`.asFileHandle() as application.CodePadFileHandle
                        );
                    } catch (e) {
                        return this.error(
                            __("Unable to create template files"),
                            e
                        );
                    }
                })
                .catch((e) =>
                    this.error(__("Unable to create project directory"), e)
                );
        }

        /**
         *
         *
         * @private
         * @param {string[]} list
         * @returns {Promise<any>}
         * @memberof AntOSDK
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
         * @memberof AntOSDK
         */
        private compile(meta: GenericObject<any>): Promise<any> {
            return new Promise(async (resolve, reject) => {
                try {
                    await this.import([
                        `${this.basedir()}/libs/coffeescript.js`,
                        `${this.basedir()}/libs/terser.min.js`,
                    ]);
                    const list = meta.coffees.map(
                        (v: string) => `${meta.root}/${v}`
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
         * @param {boolean} debug
         * @returns {Promise<any>}
         * @memberof AntOSDK
         */
        private build(meta: GenericObject<any>, debug: boolean): Promise<any> {
            const dirs = [
                `${meta.root}/build`,
                `${meta.root}/build/debug`,
                `${meta.root}/build/release`,
            ];
            return new Promise(async (resolve, reject) => {
                try {
                    await this.mkdirAll(dirs);
                    try {
                        const src = await this.compile(meta);
                        let v: string;
                        try {
                            let jsrc = await this.cat(
                                (() => {
                                    const result = [];
                                    for (v of meta.javascripts) {
                                        result.push(`${meta.root}/${v}`);
                                    }
                                    return result;
                                })(),
                                src
                            );
                            await new Promise(async function (r, e) {
                                let code = jsrc;
                                if (!debug) {
                                    const options = {
                                        toplevel: true,
                                        compress: {
                                            passes: 3,
                                        },
                                        mangle: true,
                                        output: {
                                            //beautify: true,
                                        },
                                    };
                                    const result_1 = Terser.minify(
                                        jsrc,
                                        options
                                    );
                                    if (result_1.error) {
                                        this.notify(
                                            __(
                                                "Unable to minify code: {0}",
                                                result_1.error
                                            )
                                        );
                                    } else {
                                        ({ code } = result_1);
                                    }
                                }
                                try {
                                    const d = await `${meta.root}/build/debug/main.js`
                                        .asFileHandle()
                                        .setCache(code)
                                        .write("text/plain");
                                    return r();
                                } catch (ex) {
                                    return e(__e(ex));
                                }
                            });
                            await new Promise(async (r, e) => {
                                const txt = await this.cat(
                                    (() => {
                                        const result1 = [];
                                        for (v of meta.css) {
                                            result1.push(`${meta.root}/${v}`);
                                        }
                                        return result1;
                                    })(),
                                    ""
                                );
                                if (txt === "") {
                                    return r();
                                }
                                try {
                                    const d_1 = await `${meta.root}/build/debug/main.css`
                                        .asFileHandle()
                                        .setCache(txt)
                                        .write("text/plain");
                                    return r();
                                } catch (ex_1) {
                                    return e(__e(ex_1));
                                }
                            });
                            await this.copy(
                                (() => {
                                    const result1_1 = [];
                                    for (v of meta.copies) {
                                        result1_1.push(`${meta.root}/${v}`);
                                    }
                                    return result1_1;
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
         * @memberof AntOSDK
         */
        private run(meta: GenericObject<any>): void {
            `${meta.root}/build/debug/package.json`
                .asFileHandle()
                .read("json")
                .then((v) => {
                    v.text = v.name;
                    v.path = `${meta.root}/build/debug`;
                    v.filename = meta.name;
                    v.type = "app";
                    v.mime = "antos/app";
                    if (v.icon) {
                        v.icon = `${v.path}/${v.icon}`;
                    }
                    if (!v.iconclass && !v.icon) {
                        v.iconclass = "fa fa-adn";
                    }
                    this.notify(__("Installing..."));
                    setting.system.packages[meta.name] = v;
                    this.notify(__("Running {0}...", meta.name));
                    return GUI.forceLaunch(meta.name, []);
                });
        }
    }
    App.extensions.AntOSDK = AntOSDK;
}
