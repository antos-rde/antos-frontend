namespace OS {
    // import the CodePad application module
    const App = OS.application.CodePad;

    declare var CoffeeScript: any;
    declare var JSZip: any;
    declare var Terser: any;
    declare var ts: any;
    /**
     *
     *
     * @class AntOSDK
     * @extends {App.BaseExtension}
     */
    class AntOSDK extends App.BaseExtension {


        /**
         * Core library for the transpiler stored here
         *
         * @static
         * @type {GenericObject<any>}
         * @memberof AntOSDK
         */
        static corelib: GenericObject<any>;

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
                    this.logger().clear();
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
            this.logger().clear();
            const dir = this.app.currdir;
            if (!dir || !dir.basename) {
                return this.create();
            }
            dir.read().then((d) => {
                if (d.error) {
                    return this.logger().error(__("Cannot read folder: {0}", dir.path));
                }
                if (d.result.length !== 0) {
                    return this.logger().error(
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
            this.logger().clear();
            this.metadata("project.json")
                .then(async (meta) => {
                    try {
                        await this.build(meta, true);
                        try {
                            return this.run(meta);
                        } catch (e) {
                            return this.logger().error(__("Unable to run project: {0}", e.stack));
                        }
                    } catch (e_1) {
                        return this.logger().error(__("Unable to build project: {0}", e_1.stack));
                    }
                })
                .catch((e) => this.logger().error(__("Unable to read meta-data: {0}", e.stack)));
        }

        /**
         *
         *
         * @memberof AntOSDK
         */
        release(): void {
            this.logger().clear();
            this.metadata("project.json")
                .then(async (meta) => {
                    try {
                        await this.build(meta, false);
                        try {
                            return API.VFS.mkar(
                                `${meta.root}/build/debug`,
                                `${meta.root}/build/release/${meta.name}.zip`
                            );
                        } catch (e) {
                            return this.logger().error(
                                __("Unable to create package archive: {0}",
                                    e.stack)
                            );
                        }
                    } catch (e_1) {
                        return this.logger().error(__("Unable to build project: {0}", e_1.stack));
                    }
                })
                .catch((e) => this.logger().error(__("Unable to read meta-data: {0}", e.stack)));
        }

        // private functions
        /**
         * Create project template
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
                `${rpath}/ts`,
                `${rpath}/assets`,
            ];
            if (flag) {
                dirs.unshift(rpath);
            }
            const files = [
                ["templates/sdk-main-coffee.tpl", `${rpath}/coffees/main.coffee`],
                ["templates/sdk-main-ts.tpl", `${rpath}/ts/main.ts`],
                ["templates/sdk-package.tpl", `${rpath}/package.json`],
                ["templates/sdk-project.tpl", `${rpath}/project.json`],
                ["templates/sdk-README.tpl", `${rpath}/README.md`],
                ["templates/sdk-scheme.tpl", `${rpath}/assets/scheme.html`],
            ];
            API.VFS.mkdirAll(dirs)
                .then(async () => {
                    try {
                        await API.VFS.mktpl(files, this.basedir(), (data) => {
                            return data.format(name, `${path}/${name}`);
                        });
                        this.app.currdir = rpath.asFileHandle();
                        this.app.toggleSideBar();
                        return this.app.eum.active.openFile(
                            `${rpath}/README.md`.asFileHandle() as application.EditorFileHandle
                        );
                    } catch (e) {
                        return this.logger().error(
                            __("Unable to create template files: {0}",
                                e.stack)
                        );
                    }
                })
                .catch((e) =>
                    this.logger().error(__("Unable to create project directory: {0}", e.stack))
                );
        }

        /**
         * Check coffeescript file validity
         *
         * @private
         * @param {string[]} list
         * @returns {Promise<void>}
         * @memberof AntOSDK
         */
        private verify_coffee(list: string[]): Promise<void> {
            return new Promise((resolve, reject) => {
                if (list.length === 0) {
                    return resolve();
                }
                const file = list.splice(0, 1)[0].asFileHandle();
                this.logger().info(__("Verifying: {0}", file.path));
                return file
                    .read()
                    .then((data) => {
                        try {
                            CoffeeScript.nodes(data);
                            return this.verify_coffee(list)
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
         * load typescript core lib
         *
         * @private
         * @param {string} path
         * @return {*}  {Promise<any>}
         * @memberof AntOSDK
         */
        private load_corelib(path: string): Promise<any> {
            return new Promise(async (resolve, reject) => {
                if (AntOSDK.corelib["ts"]) {
                    return resolve(AntOSDK.corelib["ts"]);
                }
                try {
                    const code = await API.VFS.readFileFromZip(`${path}.zip`, "text");
                    AntOSDK.corelib["ts"] = ts.createSourceFile(path, code, ts.ScriptTarget.Latest);
                    return resolve(AntOSDK.corelib["ts"]);
                } catch (e) {
                    return reject(__e(e));
                }
            });
        }

        /**
         * Compile typescript to javascript
         *
         * @private
         * @param {string[]} files
         * @return {*}  {Promise<string>}
         * @memberof AntOSDK
         */
        private compile_ts(files: string[]): Promise<string> {
            return new Promise(async (resolve, reject) => {
                if (files.length == 0) {
                    return resolve(undefined);
                }
                const core_lib = "os://packages/CodePad/libs/corelib.d.ts";
                try {
                    await this.load_corelib(core_lib);
                    const arr = [];
                    API.VFS.read_files(files, arr).then((_result) => {
                        const libs: string[] = arr.map((e) => e.path)
                        libs.unshift(core_lib);
                        const src_files: GenericObject<any> = {};
                        src_files[core_lib] = AntOSDK.corelib["ts"];
                        for (const el of arr) {
                            src_files[el.path] = ts.createSourceFile(el.path, el.content, ts.ScriptTarget.Latest);
                        }
                        let js_code = "";
                        const host = {
                            fileExists: (path: string) => {
                                return src_files[path] != undefined;
                            },
                            directoryExists: (path: string) => {
                                return true;
                            },
                            getCurrentDirectory: () => "/",
                            getDirectories: () => [],
                            getCanonicalFileName: (path: string) => path,
                            getNewLine: () => "\n",
                            getDefaultLibFileName: () => "",
                            getSourceFile: (path: string) => src_files[path],
                            readFile: (path: string) => undefined,
                            useCaseSensitiveFileNames: () => true,
                            writeFile: (path: string, data: string) => js_code = `${js_code}\n${data}`,
                        };
                        const program = ts.createProgram(libs, {
                            "target": "es6",
                            "skipLibCheck": true,
                        }, host);
                        const result = program.emit();
                        const diagnostics = result.diagnostics.concat((ts.getPreEmitDiagnostics(program)));
                        if (diagnostics.length > 0) {
                            diagnostics.forEach(diagnostic => {
                                if (diagnostic.file) {
                                    let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
                                    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
                                    this.logger().error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
                                } else {
                                    this.logger().error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
                                }
                            });
                            return reject(API.throwe(__("Typescript compile error")));
                        }
                        resolve(js_code);
                    })
                        .catch((e) => { reject(__e(e)) });
                } catch (e) {
                    return reject(__e(e));
                }
            })
        }

        private compile(meta: GenericObject<any>): Promise<any> {
            return new Promise(async (resolve, reject) => {
                const libs = [
                    `${this.basedir()}/libs/terser.min.js`,
                ];
                if (!meta.coffees)
                    meta.coffees = [];
                if (meta.coffees.length > 0) {
                    libs.push(`${this.basedir()}/libs/coffeescript.js`);
                }
                if (!meta.ts)
                    meta.ts = [];
                if (meta.ts && meta.ts.length > 0) {
                    libs.push("os://scripts/jszip.min.js");
                    libs.push(`${this.basedir()}/libs/typescript.min.js`)
                }
                try {
                    await this.import(libs);
                    const coffee_list = meta.coffees.map(
                        (v: string) => `${meta.root.trimBy("/")}/${v}`
                    );
                    const ts_list = meta.ts.map(
                        (v: string) => `${meta.root.trimBy("/")}/${v}`
                    );
                    Promise.all([
                        this.compile_ts(ts_list),
                        this.compile_coffee(coffee_list)
                    ]).then((js_codes: string[]) => {
                        resolve(js_codes.join("\n"));
                    }).catch((e_1) => reject(__e(e_1)));
                } catch (e_2) {
                    return reject(__e(e_2));
                }
            });
        }

        /**
         * Compile coffeescript to javascript
         *
         * @private
         * @param {GenericObject<any>} meta
         * @returns {Promise<string>}
         * @memberof AntOSDK
         */
        private compile_coffee(list: string[]): Promise<string> {
            return new Promise(async (resolve, reject) => {
                if (list.length == 0) {
                    return resolve("");
                }
                try {
                    await this.verify_coffee(list.map((x: string) => x));
                    try {
                        const code = await API.VFS.cat(list, "");
                        const jsrc = CoffeeScript.compile(code);
                        this.logger().info(__("Compiled successful"));
                        return resolve(jsrc);
                    } catch (e) {
                        return reject(__e(e));
                    }
                } catch (e_1) {
                    return reject(__e(e_1));
                }
            });
        }

        /**
         * Build the project
         *
         * @private
         * @param {GenericObject<any>} meta
         * @param {boolean} debug
         * @returns {Promise<void>}
         * @memberof AntOSDK
         */
        private build(meta: GenericObject<any>, debug: boolean): Promise<void> {
            const dirs = [
                `${meta.root}/build`,
                `${meta.root}/build/debug`,
                `${meta.root}/build/release`,
            ];
            return new Promise(async (resolve, reject) => {
                try {
                    await API.VFS.mkdirAll(dirs);
                    try {
                        const src = await this.compile(meta);
                        let v: string;
                        try {
                            let jsrc = await API.VFS.cat(
                                (() => {
                                    const result = [];
                                    for (v of meta.javascripts) {
                                        result.push(`${meta.root}/${v}`);
                                    }
                                    return result;
                                })(),
                                src
                            );
                            await new Promise<void>(async function (r, e) {
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
                                        this.logger().error(
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
                            await new Promise<void>(async (r, e) => {
                                const txt = await API.VFS.cat(
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
                            await API.VFS.copy(
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
         * Run the built project
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
                    this.logger().info(__("Installing..."));
                    setting.system.packages[meta.name] = v;
                    this.logger().info(__("Running {0}...", meta.name));
                    return GUI.forceLaunch(meta.name, []);
                });
        }
    }
    AntOSDK.corelib = {};
    App.extensions.AntOSDK = AntOSDK;
}
