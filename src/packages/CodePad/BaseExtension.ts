
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
         * @return {Logger} editor logger 
         * @memberof BaseExtension
         */
        protected logger(): any {
            if (!this.app.setting.showBottomBar) {
                this.app.showOutput(true);
            }
            else {
                this.app.showOutput(false);
            }
            return this.app.logger;
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
                    .then((data) => {
                        if (!data.root && this.app.currdir) {
                            data.root = this.app.currdir.path;
                        }
                        resolve(data);
                    })
                    .catch((e) => {
                        // try to ask user to select a folder
                        this.app.openDialog("FileDialog", {
                            title: __("Select build directory"),
                            root: this.app.currdir.path,
                            mimes: ["dir"]
                        })
                            .then((d) => {
                                `${d.file.path}/${file}`
                                    .asFileHandle()
                                    .read("json")
                                    .then((data) => {
                                        if (!data.root) {
                                            data.root = d.file.path;
                                        }
                                        resolve(data);
                                    })
                                    .catch((e1) => reject(e1))
                            })
                            .catch(
                                (e1) => reject(API.throwe(__("Unable to read meta-data"))
                                ))
                    });
            });
        }
    }

    CodePad.extensions = {};
    CodePad.BaseExtension = BaseExtension;
}
