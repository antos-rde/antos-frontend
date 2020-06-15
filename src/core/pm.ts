namespace OS {
    export namespace PM {
        export type ProcessType = application.BaseApplication | application.BaseService;
        export type ModelTypeClass = {
            new <T extends BaseModel>(args: AppArgumentsType[]): T;
        };
        export var pidalloc: number = 0;
        export var processes: GenericObject<BaseModel[]> = {};
        /**
         *
         *
         * @export
         * @param {string} app
         * @param {ProcessTypeClass} cls
         * @param {GUI.AppArgumentsType[]} [args]
         * @returns {Promise<ProcessType>}
         */
        export function createProcess(
            app: string,
            cls: ModelTypeClass,
            args?: AppArgumentsType[]
        ): Promise<ProcessType> {
            return new Promise(function (resolve, reject) {
                let metaclass = (cls as any) as typeof BaseModel;
                const f = function () {
                    //if it is single ton
                    // and a process is existing
                    // just return it
                    let obj: ProcessType;
                    if (
                        metaclass.singleton &&
                        PM.processes[app] &&
                        PM.processes[app].length === 1
                    ) {
                        obj = PM.processes[
                            app
                        ][0] as application.BaseApplication;
                        obj.show();
                    } else {
                        if (!PM.processes[app]) {
                            PM.processes[app] = [];
                        }
                        obj = new cls(args);
                        obj.birth = new Date().getTime();
                        PM.pidalloc++;
                        obj.pid = PM.pidalloc;
                        PM.processes[app].push(obj);
                        if (metaclass.type === ModelType.Application) {
                            GUI.dock(
                                obj as application.BaseApplication,
                                metaclass.meta
                            );
                        } else {
                            GUI.attachservice(obj as application.BaseService);
                        }
                    }
                    return obj;
                };
                if (metaclass.dependencies) {
                    const libs = metaclass.dependencies;
                    return API.require(libs)
                        .then(() => resolve(f()))
                        .catch((e: Error) => reject(__e(e)));
                } else {
                    return resolve(f());
                }
            });
        }

        /**
         *
         *
         * @export
         * @param {number} pid
         * @returns {BaseModel}
         */
        export function appByPid(pid: number): BaseModel {
            let app = undefined;
            const find = function (l: Array<any>) {
                for (let a of l) {
                    if (a.pid === pid) {
                        return a;
                    }
                }
            };
            for (let k in PM.processes) {
                const v = PM.processes[k];
                app = find(v);
                if (app) {
                    break;
                }
            }
            return app;
        }

        /**
         *
         *
         * @export
         * @param {OS.GUI.BaseModel} app
         * @returns {void}
         */
        export function kill(app: BaseModel): void {
            if (!app.name || !PM.processes[app.name]) {
                return;
            }

            const i = PM.processes[app.name].indexOf(app);
            if (i >= 0) {
                if (application[app.name].type === ModelType.Application) {
                    GUI.undock(app as application.BaseApplication);
                } else {
                    GUI.detachservice(app as application.BaseService);
                }
                announcer.unregister(app);
                delete PM.processes[app.name][i];
                PM.processes[app.name].splice(i, 1);
            }
        }

        /**
         *
         *
         * @export
         * @param {string} app
         * @param {boolean} force
         * @returns {void}
         */
        export function killAll(app: string, force: boolean): void {
            if (!PM.processes[app]) {
                return;
            }
            PM.processes[app].map((a) => a.quit(force));
        }
    }
}
