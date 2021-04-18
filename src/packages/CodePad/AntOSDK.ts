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

        private sdk: any;
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
                        await this.run(meta);
                    } catch (e_1) {
                        return this.logger().error(__("Unable to build and run project: {0}", e_1.stack));
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
                        await API.VFS.mkar(
                            `${meta.root}/build/debug`,
                            `${meta.root}/build/release/${meta.name}.zip`
                        );
                        this.logger().info(__("Archive generate at: {0}", `${meta.root}/build/release/${meta.name}.zip`));
                    } catch (e_1) {
                        return this.logger().error(__("Unable to release project: {0}", e_1.stack));
                    }
                })
                .catch((e) => this.logger().error(__("Unable to read meta-data: {0}", e.stack)));
        }

        /**
         *
         *
         * @protected
         * @returns {string[]}
         * @memberof BaseExtension
         */
         protected dependencies(): string[] {
            return ["pkg://libantosdk/main.js"];
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
         * Build the project
         *
         * @private
         * @param {GenericObject<any>} meta
         * @param {boolean} debug
         * @returns {Promise<void>}
         * @memberof AntOSDK
         */
        private build(meta: GenericObject<any>, debug: boolean): Promise<void> {
            return new Promise(async (resolve, reject) => {
                try {
                    const options = {
                        root: meta.root,
                        targets: {}
                    }
                    if(!this.sdk)
                    {
                        this.sdk = new (OS.API as any).AntOSDKBuilder(this.logger(), "");
                    }
                    this.logger().info(__("Building the package", meta.name));
                    await API.VFS.mkdirAll([`${meta.root}/build`,]);
                    await API.VFS.mkdirAll([`${meta.root}/build/debug`, `${meta.root}/build/release`]);
                    if(!meta.coffees)
                        meta.coffees = [];
                    if(!meta.ts)
                        meta.ts = [];
                    options.targets["coffee"] = {
                        "require": ["coffee"],
                        "jobs":[
                            {
                                "name": "coffee-compile",
                                "data": {
                                    "src": meta.coffees,
                                    "dest": "build/debug/coffee-main.js"
                                }
                            }
                        ]
                    }

                    options.targets["ts"] = {
                        "require": ["ts"],
                        "jobs":[
                            {
                                "name": "ts-import",
                                "data": [
                                    "sdk://core/ts/core.d.ts",
                                    "sdk://core/ts/jquery.d.ts",
                                    "sdk://core/ts/antos.d.ts"
                                ]
                            },
                            {
                                "name": "ts-compile",
                                "data": {
                                    "src": meta.ts,
                                    "dest": "build/debug/ts-main.js"
                                }
                            }
                        ]
                    }

                    options.targets["cat"] = {
                        "jobs":[
                            {
                                "name": "vfs-cat",
                                "data": {
                                    "src": [
                                        "build/debug/ts-main.js", "build/debug/coffee-main.js"
                                    ].concat(meta.javascripts.map(v => `${meta.root}/${v}`)),
                                    "dest": "build/debug/main.js"
                                }
                            },
                            {
                                "name": "vfs-rm",
                                "data": ["build/debug/ts-main.js", "build/debug/coffee-main.js"]
                            }
                        ]
                    }

                    options.targets["uglify"] = {
                        "require": ["terser"],
                        "jobs":[
                            {
                                "name": "terser-uglify",
                                "data": ["build/debug/main.js"]
                            }
                        ]
                    }
                    console.log(options);
                    await this.sdk.batch(["coffee", "ts", "cat"], options);
                    if (!debug) {
                        await this.sdk.batch(["uglify"], options);
                    }
                    const txt = await API.VFS.cat(meta.css.map(v => `${meta.root}/${v}`), "");
                    if (txt != "")
                        await `${meta.root}/build/debug/main.css`
                            .asFileHandle()
                            .setCache(txt)
                            .write("text/plain");
                    await API.VFS.copy(
                        meta.copies.map(v => `${meta.root}/${v}`),
                        `${meta.root}/build/debug`
                    );
                    resolve();
                } catch (e) {
                    return reject(__e(e));
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
    App.extensions.AntOSDK = AntOSDK;
}
