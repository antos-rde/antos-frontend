namespace OS {
    /**
     * This namespace dedicated to all operations related to system
     * process management
     */
    export namespace PM {
        /**
         * A process is either an instance of an application or a service
         */
        export type ProcessType =
            | application.BaseApplication
            | application.BaseService;
        /**
         * Alias to  all classes that extends [[BaseModel]]
         */
        export type ModelTypeClass = {
            new <T extends BaseModel>(args: AppArgumentsType[]): T;
        };
        /**
         * Process id allocator, when a new process is created, the value of
         * this variable is increased
         */
        export var pidalloc: number = 0;
        /**
         * All running processes is stored in this variables
         */
        export var processes: GenericObject<BaseModel[]> = {};
        /**
         * Create a new process of application or service
         *
         * @export
         * @param {string} app class name string
         * @param {ProcessTypeClass} cls prototype class
         * @param {GUI.AppArgumentsType[]} [args] process arguments
         * @returns {Promise<ProcessType>} a promise on the created process
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
                        obj.subscribe("systemlocalechange", (d) => {
                            obj.updateLocale(d.message as string);
                            return obj.update();
                        });
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
         * Get the reference to a process using its id
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
         * Kill a process
         *
         * @export
         * @param {OS.GUI.BaseModel} app reference to the process
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
         * Kill all process of an application or service
         *
         * @export
         * @param {string} app process class name
         * @param {boolean} force force exit all process
         * @returns {void}
         */
        export function killAll(app: string, force: boolean): void {
            if (!PM.processes[app]) {
                return;
            }
            const arr = PM.processes[app].map( e => e);
            for(const p of arr)
            {
                p.quit(force);
            }
        }
    }
}
