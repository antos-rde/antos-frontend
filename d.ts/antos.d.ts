declare namespace OS {
    namespace GUI {
        /**
         * the SubWindow class is the abstract prototype of all
         * modal windows or dialogs definition in AntOS
         *
         * @export
         * @abstract
         * @class SubWindow
         * @extends {BaseModel}
         */
        abstract class SubWindow extends BaseModel {
            /**
             * Placeholder indicates whether the sub window is in
             * modal mode. This value is reserver for future use
             *
             * @type {boolean}
             * @memberof SubWindow
             */
            modal: boolean;
            /**
             * Reference to the parent of the current sub-window
             *
             * @type {(BaseModel | typeof GUI)}
             * @memberof SubWindow
             */
            parent: BaseModel | typeof GUI;
            /**
             *Creates an instance of SubWindow.
             * @param {string} name SubWindow (class) name
             * @memberof SubWindow
             */
            constructor(name: string);
            /**
             * Exit the sub-window
             *
             * @returns {void}
             * @memberof SubWindow
             */
            quit(): void;
            /**
             * Init the sub-window, this function is called
             * on creation of the sub-window object. It is used
             * to render the sub-window UI.
             *
             * Need to be implemented by subclasses
             *
             * @abstract
             * @memberof SubWindow
             */
            abstract init(): void;
            /**
             * Main entry point after rendering of the sub-window
             *
             * @abstract
             * @memberof SubWindow
             */
            abstract main(): void;
            /**
             * Return the parent meta-data of the current
             * sub-window
             *
             * @returns {API.PackageMetaType}
             * @memberof SubWindow
             */
            meta(): API.PackageMetaType;
            /**
             * Show the sub-window
             *
             * @memberof SubWindow
             */
            show(): void;
            /**
             * Hide the sub-window
             *
             * @returns {void}
             * @memberof SubWindow
             */
            hide(): void;
        }
        /**
         * Abstract prototype of all AntOS dialogs widget
         *
         * @export
         * @abstract
         * @class BaseDialog
         * @extends {SubWindow}
         */
        abstract class BaseDialog extends SubWindow {
            /**
             * Placeholder for the dialog callback on exit
             *
             * @memberof BaseDialog
             */
            handle: (d: any) => void;
            /**
             * Placeholder of the dialog input data
             *
             * @type {GenericObject<any>}
             * @memberof BaseDialog
             */
            data: GenericObject<any>;
            /**
             *Creates an instance of BaseDialog.
             * @param {string} name Dialog (class) name
             * @memberof BaseDialog
             */
            constructor(name: string);
            /**
             * Function called when dialog exits
             *
             * @protected
             * @param {BaseEvent} _e
             * @returns {void}
             * @memberof BaseDialog
             */
            protected onexit(_e: BaseEvent): void;
        }
        /**
         * A basic dialog renders a dialog widget using the UI
         * scheme provided in it constructor or defined in its
         * class variable `scheme`
         *
         * @export
         * @class BasicDialog
         * @extends {BaseDialog}
         */
        class BasicDialog extends BaseDialog {
            /**
             * Placeholder for the UI scheme to be rendered. This can
             * be either the string definition of the scheme or
             * the VFS file handle of the scheme file
             *
             * @protected
             * @type {(string | OS.API.VFS.BaseFileHandle)}
             * @memberof BasicDialog
             */
            protected markup: string | OS.API.VFS.BaseFileHandle;
            /**
             * If the `markup` variable is not provided, then
             * the [[init]] function will find the scheme definition
             * in this class variable
             *
             * @static
             * @type {string}
             * @memberof BasicDialog
             */
            static scheme: string;
            /**
             *Creates an instance of BasicDialog.
             * @param {string} name dialog name
             * @param {(string | OS.API.VFS.BaseFileHandle)} [markup] UI scheme definition
             * @memberof BasicDialog
             */
            constructor(name: string, markup?: string | OS.API.VFS.BaseFileHandle);
            /**
             * Render the dialog using the UI scheme provided by either
             * the `markup` instance variable or the `scheme` class variable
             *
             * @returns {void}
             * @memberof BasicDialog
             */
            init(): void;
            /**
             * Main entry point for the dialog
             *
             * @memberof BasicDialog
             */
            main(): void;
        }
        /**
         * The namespace `dialogs` is dedicated to all Dialog definition
         * in AntOS
         */
        namespace dialogs {
            /**
             * Simple prompt dialog to get user input text.
             * The input data of the dialog:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      label: string, // label text
             *      value: string,   // user input text
             *      type: string // input type: text or password
             * }
             * ```
             *
             * The data passing from the dialog to the callback function is
             * in the string text of the user input value
             *
             * @export
             * @class PromptDialog
             * @extends {BasicDialog}
             */
            class PromptDialog extends BasicDialog {
                /**
                 *Creates an instance of PromptDialog.
                 * @memberof PromptDialog
                 */
                constructor();
                /**
                 * Main entry point
                 *
                 * @memberof PromptDialog
                 */
                main(): void;
            }
            /**
             * A text dialog is similar to a [[PromptDialog]] nut allows
             * user to input multi-line text.
             *
             * Refer to [[PromptDialog]] for the definition of input and callback data
             * of the dialog
             *
             * @export
             * @class TextDialog
             * @extends {BasicDialog}
             */
            class TextDialog extends BasicDialog {
                /**
                 *Creates an instance of TextDialog.
                 * @memberof TextDialog
                 */
                constructor();
                /**
                 * Main entry point
                 *
                 * @memberof TextDialog
                 */
                main(): void;
            }
            /**
             * A Calendar dialog allows user to select a date
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string // window title
             * }
             * ```
             *
             * @export
             * @class CalendarDialog
             * @extends {BasicDialog}
             */
            class CalendarDialog extends BasicDialog {
                /**
                 * Creates an instance of CalendarDialog.
                 *
                 * Callback data: a Date object represent the selected date
                 *
                 *
                 * @memberof CalendarDialog
                 */
                constructor();
                /**
                 *
                 *
                 * @memberof CalendarDialog
                 */
                main(): void;
            }
            /**
             * Color picker dialog
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string // window title
             * }
             * ```
             * Callback data: [[ColorType]] object
             *
             * @export
             * @class ColorPickerDialog
             * @extends {BasicDialog}
             */
            class ColorPickerDialog extends BasicDialog {
                /**
                 *Creates an instance of ColorPickerDialog.
                 * @memberof ColorPickerDialog
                 */
                constructor();
                /**
                 *
                 *
                 * @memberof ColorPickerDialog
                 */
                main(): void;
            }
            /**
             * Show key-value pair of the input object
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      [propName:string]: any
             * }
             * ```
             *
             * No data for callback
             *
             * @export
             * @class InfoDialog
             * @extends {BasicDialog}
             */
            class InfoDialog extends BasicDialog {
                /**
                 *Creates an instance of InfoDialog.
                 * @memberof InfoDialog
                 */
                constructor();
                /**
                 *
                 *
                 * @memberof InfoDialog
                 */
                main(): void;
            }
            /**
             * A simple confirm dialog
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      icon?: string, // label icon
             *      iconclass?: string, // label iconclass
             *      text: string // label text
             * }
             * ```
             *
             * Callback data: `boolean`
             *
             * @export
             * @class YesNoDialog
             * @extends {BasicDialog}
             */
            class YesNoDialog extends BasicDialog {
                /**
                 *Creates an instance of YesNoDialog.
                 * @memberof YesNoDialog
                 */
                constructor();
                /**
                 * Main entry point
                 *
                 * @memberof YesNoDialog
                 */
                main(): void;
            }
            /**
             * A selection dialog provide user with a list of options to
             * select.
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      data:
             *      {
             *          text: string,
             *          [propName:string]: any
             *      } [] // list data
             * ```
             *
             * Callback data: the selected data in the input list
             *
             * @export
             * @class SelectionDialog
             * @extends {BasicDialog}
             */
            class SelectionDialog extends BasicDialog {
                /**
                 *Creates an instance of SelectionDialog.
                 * @memberof SelectionDialog
                 */
                constructor();
                /**
                 * Main entry
                 *
                 * @memberof SelectionDialog
                 */
                main(): void;
            }
            /**
             * An About dialog is dedicated to show the parent
             * application meta-data
             *
             * Input data: no
             *
             * Callback data: no
             *
             * @export
             * @class AboutDialog
             * @extends {BasicDialog}
             */
            class AboutDialog extends BasicDialog {
                /**
                 *Creates an instance of AboutDialog.
                 * @memberof AboutDialog
                 */
                constructor();
                /**
                 * Main entry point
                 *
                 * @returns {void}
                 * @memberof AboutDialog
                 */
                main(): void;
            }
            /**
             * File dialog allows user to select a file/folder
             *
             * Input data:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      root?: string, // the root path folder of the file view
             *      type?: "file"|"dir"|"app", // file type to be selected
             *      mimes?: string[], // mime types of file to be selected
             *      hidden?: boolean, // show/hide hidden file
             *      file?: string // file name
             *
             * }
             * ```
             *
             * Callback data:
             *
             * ```typescript
             * {
             *      file: string, // selected file path
             *      name: string // user input file name
             * }
             * ```
             *
             * @export
             * @class FileDialog
             * @extends {BasicDialog}
             */
            class FileDialog extends BasicDialog {
                /**
                 *Creates an instance of FileDialog.
                 * @memberof FileDialog
                 */
                constructor();
                /**
                 * Store the last opened directory
                 *
                 * @static
                 * @type {string}
                 * @memberof FileDialog
                 */
                static last_opened: string;
                /**
                 *
                 *
                 * @returns {void}
                 * @memberof FileDialog
                 */
                main(): void;
            }
            /**
             * Generic & dynamic key-value dialog. The content
             * of the dialog consist of an array of label and input elements
             * which are generated based on the input model
             *
             * The input data of the dialog should be:
             *
             * ```typescript
             * {
             *      title: string, // window title
             *      model: {
             *          [propName:string]: string
             *      },
             *      data: {
             *          [propName:string]: string
             *      },
             *      allow_empty: boolean
             * }
             * ```
             * Where:
             * - keys of `model` are data fields, each key correspond to an input element
             * - values of `model` are description texts of fields, each value correspond to a label text
             * - data is the input data object in the format of model (optional)
             *
             * ```
             * Example:
             * {
             *      title: "Greeting",
             *      model: {
             *          name: "Your name",
             *          email: "Your email"
             *      },
             *      allow_empty: false
             * }
             *```

             * The data passing from the dialog to the callback function is
             * the user input data corresponding to the input model
             *
             * Example of callback data for the above model:
             *
             * ```
             * {
             *      name: "John Doe",
             *      email: "jd@mail.com"
             * }
             * ```
             *
             * @export
             * @class MultiInputDialog
             * @extends {BasicDialog}
             */
            class MultiInputDialog extends BasicDialog {
                /**
                 * References to all the input fields in the
                 * dialog
                 *
                 * @private
                 * @type {HTMLElement[]}
                 * @memberof MultiInputDialog
                 */
                private inputs;
                /**
                 *Creates an instance of MultiInputDialog.
                 * @memberof MultiInputDialog
                 */
                constructor();
                /**
                 * Generate the scheme before rendering
                 *
                 * @memberof MultiInputDialog
                 */
                init(): void;
                /**
                 * Main entry point
                 *
                 * @memberof MultiInputDialog
                 */
                main(): void;
            }
            /**
             * Generic dynamic key-value dialog
             *
             * Allow user to input any data key-value based object:
             *
             * {
             *      [prop:string]: string;
             * }
             *
             * @export
             * @class KeyValueDialog
             * @extends {BasicDialog}
             */
            class KeyValueDialog extends BasicDialog {
                /**
                 * Reference to the form container
                 *
                 * @private
                 * @type {HTMLDivElement}
                 * @memberof KeyValueDialog
                 */
                private container;
                /**
                 * Creates an instance of KeyValueDialog.
                 * @memberof KeyValueDialog
                 */
                constructor();
                /**
                 * Main entry point
                 *
                 * @memberof KeyValueDialog
                 */
                main(): void;
                /**
                 * Add new input key-value field to the dialog
                 *
                 * @private
                 * @memberof KeyValueDialog
                 */
                private addField;
            }
        }
    }
}
/// <reference types="jquery" />
declare namespace OS {
    /**
     * This namespace is dedicated to all APIs related to AntOS UI system,
     * these API are called AFX APIs which handle:
     * - The mouse and keyboard interaction with the UI system
     * - UI rendering
     * - Custom tags definition
     * - Load/unload system, applications and services UI
     * - System dialogs definition
     */
    namespace GUI {
        /**
         * AntOS keyboard shortcut type definition
         *
         * @export
         * @interface ShortcutType
         */
        interface ShortcutType {
            /**
             * Placeholder for all shortcut callbacks, example:
             * ```typescript
             *      fn_193462204.c = function() {..}
             *      // this function will be called when the hotkey `ALT-C` is triggered
             *      // fn_${"ALT".hash()} is fn_193462204
             * ```
             *
             * @memberof ShortcutType
             */
            [propName: string]: GenericObject<(e: JQuery.KeyDownEvent) => void>;
        }
        /**
         * Basic item type definition which is usually used by some UI element
         * such as list view, tree view, menu and grid view
         *
         *
         * @export
         * @interface BasicItemType
         */
        interface BasicItemType {
            /**
             * Item text
             *
             * @type {(string | FormattedString)}
             * @memberof BasicItemType
             */
            text: string | FormattedString;
            /**
             * Item children, usually used by tree view or menu item
             * This property is keep for compatibility purposes only.
             * Otherwise, the [[nodes]] property should be used
             *
             * @type {BasicItemType[]}
             * @memberof BasicItemType
             */
            children?: BasicItemType[];
            /**
             * Item children, usually used by tree view or menu item
             *
             * @type {BasicItemType[]}
             * @memberof BasicItemType
             */
            nodes?: BasicItemType[];
            [propName: string]: any;
        }
        /**
         * Element id of the virtual desktop, used by JQuery
         */
        var workspace: string;
        /**
         * Indicate whether the system is in fullscreen mode
         */
        var fullscreen: boolean;
        /**
         * Reference to the current system dialog, only one dialog
         * is allowed at a time. A dialog may have sub dialog
         */
        var dialog: BaseDialog;
        /**
         * Convert an application html scheme to
         * UI elements, then insert this UI scheme to the DOM tree.
         *
         * This function renders the UI of the application before calling the
         * application's [[main]] function
         *
         * @export
         * @param {string} html html scheme string
         * @param {BaseModel} app reference to the target application
         * @param {(Element | string)} parent
         * The parent HTML element where the application is rendered.
         * This is usually the reference to the virtual desktop element.
         */
        function htmlToScheme(html: string, app: BaseModel, parent: Element | string): void;
        /**
         * Load an application scheme file then render
         * it with [[htmlToScheme]]
         *
         * @export
         * @param {string} path VFS path to the scheme file
         * @param {BaseModel} app the target application
         * @param {(HTMLElement | string)} parent The parent HTML element where the application is rendered.
         */
        function loadScheme(path: string, app: BaseModel, parent: HTMLElement | string): void;
        /**
         * Clear the current system theme
         *
         * @export
         */
        function clearTheme(): void;
        /**
         * Load a theme based on its name, then refresh the
         * system UI theme
         *
         * @export
         * @param {string} name name of the theme e.g. `antos_dark`
         * @param {boolean} force force to clear the system theme before applying the new one
         */
        function loadTheme(name: string, force: boolean): void;
        /**
         * Get the system dock tag
         *
         * @export
         * @return {*}  {GUI.tag.AppDockTag}
         */
        function systemDock(): GUI.tag.AppDockTag;
        /**
         * Get the current virtual desktop
         *
         * @export
         * @return {*}  {GUI.tag.DesktopTag}
         */
        function desktop(): GUI.tag.DesktopTag;
        /**
         * Open a system dialog.
         *
         * @export
         * @param {(BaseDialog | string)} d a dialog object or a dialog class name
         * @param {GenericObject<any>} [data] input data of the dialog, refer to each
         * dialog definition for the format of the input data
         * @returns {Promise<any>} A promise on the callback data of the dialog, refer
         * to each dialog definition for the format of the callback data
         */
        function openDialog(d: string | BaseDialog, data: GenericObject<any>): Promise<any>;
        /**
         * Find a list of applications that support a specific mime
         * type in the system packages meta-data
         *
         * @export
         * @param {string} mime the mime type
         * @returns {API.PackageMetaType[]}
         */
        function appsByMime(mime: string): API.PackageMetaType[];
        /**
         * Find all applications that have services attached to it.
         * This function allows to collect all the services available
         * on the system. These services may or may not be running.
         *
         * @export
         * @returns {GenericObject<API.PackageMetaType>} result in forme of:
         * `service_name:service-meta-data` key-value pairs
         */
        function appsWithServices(): GenericObject<API.PackageMetaType>;
        /**
         * Find an launch an application using input application argument
         * such as VFS file meta-data.
         *
         * Based on the input application argument, the function will try
         * to find all applications that is compatible with that argument.
         * Three cases possible:
         * - There is no application that can handle the argument, a message will
         * be notified to user.
         * - There is one application that can handle the argument, the application
         * will be launched with the argument
         * - There are many applications that can handle the arguments, a selection
         * dialog will be popped up and allows user to select an application to launch.
         *
         * @export
         * @param {AppArgumentsType} it application argument
         * @returns {void}
         */
        function openWith(it: AppArgumentsType): void;
        /**
         * Kil all processes related to an application, reload the application
         * prototype definition and launch a new process of this application.
         *
         * This function is used only for debug purpose or used by
         * AntOSDK during in-browser application development
         *
         * @export
         * @param {string} app the application class name
         * @param {AppArgumentsType[]} args application arguments
         * @returns {void}
         */
        function forceLaunch(app: string, args: AppArgumentsType[]): void;
        /**
         * Kill an running processes of an application, then
         * unregister the application prototype definition
         * from the [[application]] namespace.
         *
         * This process is similar to uninstall the application
         * from the current system state
         *
         * @export
         * @param {string} app
         */
        function unloadApp(app: string): void;
        /**
         * Create a service process.
         *
         * Services are singleton processes, there is only
         * one process of a service at a time
         *
         * @export
         * @param {string} ph
         * @returns {Promise<PM.ProcessType>}
         */
        function pushService(ph: string): Promise<PM.ProcessType>;
        /**
         * Synchronously start a list of services
         *
         * @export
         * @param {string[]} srvs list of service class names
         * @returns {Promise<void>}
         */
        function pushServices(srvs: string[]): Promise<void>;
        /**
         * Launch an application with arguments
         *
         * @export
         * @param {string} app application class name
         * @param {AppArgumentsType[]} args application arguments
         */
        function launch(app: string, args: AppArgumentsType[]): Promise<OS.PM.ProcessType>;
        /**
         * Dock an application to the system application dock
         *
         * @export
         * @param {BaseApplication} app reference to the application process
         * @param {API.PackageMetaType} meta Application meta-data
         * @returns {void}
         */
        function dock(app: OS.application.BaseApplication, meta: API.PackageMetaType): void;
        /**
         * Toggle system fullscreen
         *
         * @export
         */
        function toggleFullscreen(): void;
        /**
         * Remove an application process from the system application
         * dock. This action will also exit the process
         *
         * @export
         * @param {BaseApplication} app
         * @returns
         */
        function undock(app: application.BaseApplication): void;
        /**
         * Attach a running service process to the system tray
         *
         * @export
         * @param {BaseService} srv reference to the running service process
         * @returns {void}
         */
        function attachservice(srv: application.BaseService): void;
        /**
         * Detach a running process from the system tray
         *
         * @export
         * @param {BaseService} srv reference to the running service process
         * @returns {void}
         */
        function detachservice(srv: application.BaseService): void;
        /**
         * Register a hot key and its handle in the
         * system  shortcut
         *
         * @export
         * @param {string} k the hotkey e.g. `ALT-C`
         * @param {(e: JQuery.KeyPressEvent) => void} f handle function
         * @param {boolean} force force to rebind the hotkey
         * @returns {void}
         */
        function bindKey(k: string, f: (e: JQuery.KeyDownEvent) => void, force?: boolean): void;
        /**
         * Load and apply system wallpaper from the setting object
         *
         * @export
         * @param {setting.WPSettingType} obj wallpaper setting object
         */
        function wallpaper(obj?: setting.WPSettingType): void;
        /**
         * Refresh the virtual desktop
         *
         * @export
         */
        function refreshDesktop(): void;
        /**
         * Show the login screen and perform the login operation.
         *
         * Once login successfully, the [[startAntOS]] will be called
         *
         * @export
         */
        function login(): void;
        /**
         * Start AntOS after a successful login.
         *
         * This function performs the following operations:
         *
         * - System cleanup
         * - Apply system setting
         * - Load desktop wallpaper and the current theme from the system setting
         * - Load system package meta-data
         * - Load and apply system locale and language
         *
         *
         * @export
         * @param {*} conf
         */
        function startAntOS(conf: any): void;
        /**
         * HTML schemes used by the system:
         * - The login screen scheme
         * - The workspace including:
         *  - System panel
         *  - Virtual desktop
         *  - Context menu
         *  - System tooltip
         */
        const schemes: GenericObject<string>;
    }
}
declare namespace OS {
    namespace API {
        /**
        * Data type exchanged via
        * the global Announcement interface
        *
        * @export
        * @interface AnnouncementDataType
        */
        interface AnnouncementDataType<T> {
            /**
             *  message string
             *
             * @type {string| FormattedString}
             * @memberof AppAnnouncementDataType
             */
            message: string | FormattedString;
            /**
             * Process ID
             *
             * @type {number}
             * @memberof AppAnnouncementDataType
             */
            id: number;
            /**
             * App name
             *
             * @type {string | FormattedString}
             * @memberof AppAnnouncementDataType
             */
            name: string | FormattedString;
            /**
             * Icon file
             *
             * @type {string}
             * @memberof AppAnnouncementDataType
             */
            icon?: string;
            /**
             * App icon class
             *
             * @type {string}
             * @memberof AppAnnouncementDataType
             */
            iconclass?: string;
            /**
             * User specific data
             *
             * @type {*}
             * @memberof AppAnnouncementDataType
             */
            u_data?: T;
        }
        /**
         * Observable entry type definition
         *
         * @export
         * @interface ObservableEntryType
         */
        interface ObservableEntryType {
            /**
             * A Set of callbacks that should be called only once.
             * These callbacks will be removed after the first
             * occurrence of the corresponding event
             *
             * @memberof ObservableEntryType
             */
            one: Set<(d: any) => void>;
            /**
             * A Set of callbacks that should be called
             * every time the corresponding event is triggered
             *
             * @memberof ObservableEntryType
             */
            many: Set<(d: any) => void>;
        }
        /**
         * Announcement listener type definition
         *
         * @export
         * @interface AnnouncerListenerType
         */
        interface AnnouncerListenerType {
            [index: number]: {
                /**
                 * The event name
                 *
                 * @type {string}
                 */
                e: string;
                /**
                 * The event callback
                 *
                 */
                f: (d: any) => void;
            }[];
        }
        /**
         * This class is the based class used in AntOS event
         * announcement system.
         * It implements the observer pattern using simple
         * subscribe/publish mechanism
         * @export
         * @class Announcer
         */
        class Announcer {
            /**
             * The observable object that stores event name
             * and its corresponding callback in [[ObservableEntryType]]
             *
             * @type {GenericObject<ObservableEntryType>}
             * @memberof Announcer
             */
            observable: GenericObject<ObservableEntryType>;
            /**
             * Enable/disable the announcer
             *
             * @type {boolean}
             * @memberof Announcer
             */
            enable: boolean;
            /**
             *Creates an instance of Announcer.
             * @memberof Announcer
             */
            constructor();
            /**
             * Disable the announcer, when this function is called
             * all events and their callbacks will be removed
             *
             * @returns
             * @memberof Announcer
             */
            disable(): boolean;
            /**
             * Subscribe to an event, the callback will be called
             * every time the corresponding event is trigged
             *
             * @param {string} evtName event name
             * @param {(d: any) => void} callback The corresponding callback
             * @returns {void}
             * @memberof Announcer
             */
            on(evtName: string, callback: (d: any) => void): void;
            /**
             * Subscribe to an event, the callback will
             * be called only once and then removed from the announcer
             *
             * @param {string} evtName event name
             * @param {(d: any) => void} callback the corresponding callback
             * @returns {void}
             * @memberof Announcer
             */
            one(evtName: string, callback: (d: any) => void): void;
            /**
             * Unsubscribe the callback from an event
             *
             * @param {string} evtName event name
             * @param {(d: any) => void} [callback] the callback to be unsubscribed.
             * When the `callback` is `*`, all callbacks related to `evtName` will be
             * removed
             * @memberof Announcer
             */
            off(evtName: string, callback?: (d: any) => void): void;
            /**
             * Trigger an event
             *
             * @param {string} evtName event name
             * @param {*} data data object that will be send to all related callback
             * @returns {void}
             * @memberof Announcer
             */
            trigger(evtName: string, data: any): void;
        }
    }
    /**
     * This namespace defines every thing related to the system announcement.
     *
     * The system announcement provides a global way to communicate between
     * processes (applications/services) using the subscribe/publish
     * mechanism
     */
    namespace announcer {
        /**
         * The global announcer object that manages global events
         * and callbacks
         */
        var observable: API.Announcer;
        /**
         * This variable is used to allocate the `id` of all messages
         * passing between publishers and subscribers in the
         * system announcement
         */
        var quota: 0;
        /**
         * Placeholder of all global events listeners
         */
        var listeners: API.AnnouncerListenerType;
        /**
         * Subscribe to a global event
         *
         * @export
         * @param {string} e event name
         * @param {(d: API.AnnouncementDataType<any>) => void} f event callback
         * @param {GUI.BaseModel} a the process  (Application/service) related to the callback
         */
        function on(e: string, f: (d: API.AnnouncementDataType<any>) => void, a: BaseModel): void;
        /**
         * Trigger a global event
         *
         * @export
         * @param {string} e event name
         * @param {*} d data passing to all related callback
         */
        function trigger(e: string, d: any): void;
        /**
         * Report system fail. This will trigger the global `fail`
         * event
         *
         * @export
         * @param {(string | FormattedString)} m message string
         * @param {Error} e error to be reported
         */
        function osfail(m: string | FormattedString, e: Error): void;
        /**
         * Report system error. This will trigger the global `error`
         * event
         *
         * @export
         * @param {(string | FormattedString)} m message string
         * @param {Error} e error to be reported
         */
        function oserror(m: string | FormattedString, e: Error): void;
        /**
         * Trigger system notification (`info` event)
         *
         * @export
         * @param {(string | FormattedString)} m notification message
         */
        function osinfo(m: string | FormattedString): void;
        /**
         *
         *
         * @export
         * @param {string} e event name
         * @param {(string| FormattedString)} m event message
         * @param {*} [d] user data
         */
        function ostrigger(e: string, m: string | FormattedString, d?: any): void;
        /**
         * Unregister a process (application/service) from
         * the global announcement system
         *
         * @export
         * @param {GUI.BaseModel} app reference to the process
         * @returns {void}
         */
        function unregister(app: BaseModel): void;
        /**
         * Allocate message id
         *
         * @export
         * @returns {number}
         */
        function getMID(): number;
    }
}
declare namespace OS {
    /**
     * This namespace dedicated to all operations related to system
     * process management
     */
    namespace PM {
        /**
         * A process is either an instance of an application or a service
         */
        type ProcessType = application.BaseApplication | application.BaseService;
        /**
         * Alias to  all classes that extends [[BaseModel]]
         */
        type ModelTypeClass = {
            new <T extends BaseModel>(args: AppArgumentsType[]): T;
        };
        /**
         * Process id allocator, when a new process is created, the value of
         * this variable is increased
         */
        var pidalloc: number;
        /**
         * All running processes is stored in this variables
         */
        var processes: GenericObject<BaseModel[]>;
        /**
         * Create a new process of application or service
         *
         * @export
         * @param {string} app class name string
         * @param {ProcessTypeClass} cls prototype class
         * @param {GUI.AppArgumentsType[]} [args] process arguments
         * @returns {Promise<ProcessType>} a promise on the created process
         */
        function createProcess(app: string, cls: ModelTypeClass, args?: AppArgumentsType[]): Promise<ProcessType>;
        /**
         * Get the reference to a process using its id
         *
         * @export
         * @param {number} pid
         * @returns {BaseModel}
         */
        function appByPid(pid: number): BaseModel;
        /**
         * Kill a process
         *
         * @export
         * @param {OS.GUI.BaseModel} app reference to the process
         * @returns {void}
         */
        function kill(app: BaseModel): void;
        /**
         * Kill all process of an application or service
         *
         * @export
         * @param {string} app process class name
         * @param {boolean} force force exit all process
         * @returns {void}
         */
        function killAll(app: string, force: boolean): void;
    }
}
declare namespace OS {
    namespace API {
        /**
         * Interface for user login data
         *
         * @export
         * @interface UserLoginType
         */
        interface UserLoginType {
            /**
             * The user credential
             *
             * @type {string}
             * @memberof UserLoginType
             */
            username: string;
            /**
             * The user password
             *
             * @type {string}
             * @memberof UserLoginType
             */
            password: string;
        }
        /**
         * Interface for a command sent to
         * server side package manage, it contains two field:
         *
         * @export
         * @interface PackageCommandType
         */
        interface PackageCommandType {
            /**
             * Command name, should be: `init`, `cache`, `install`,
             * `uninstall` or `list`
             *
             * @type {string}
             * @memberof PackageCommandType
             */
            command: string;
            /**
             * Parameter object of each command
             *
             * @type {GenericObject<any>}
             * @memberof PackageCommandType
             */
            args: GenericObject<any>;
        }
        /**
         *
         * Interface for basic request result returned
         * from the server-side. A valid server-side response should
         * be in the following format
         * ```json
         * {
         *  "error": boolean or string_err,
         *  "result": JSON result object
         * }
         * ```
         *
         * @export
         * @interface RequestResult
         */
        interface RequestResult {
            /**
             * Indicate whether the response is error
             *
             * @type {(boolean | string)}
             * @memberof RequestResult
             */
            error: boolean | string;
            /**
             * The response result, this value must be
             * set when `error` is false
             *
             * @type {(string
             *                 | boolean
             *                 | GenericObject<any>
             *                 | any[]
             *                 | FileInfoType
             *                 | FileInfoType[]
             *                 | setting.UserSettingType)}
             * @memberof RequestResult
             */
            result: string | boolean | GenericObject<any> | any[] | FileInfoType | FileInfoType[] | setting.UserSettingType;
        }
        /**
         * The host name of the server-side
         */
        var HOST: string;
        /**
         * The base URI of the server-side API
         */
        var BASE_URI: string;
        /**
         * The base REST URI of the server-side API
         */
        var REST: string;
        /**
         * The namespace `handle` contains some low level API to
         * communicate with the server side API. It is the only
         * API layer that communicate directly with the server.
         * To make AntOS compatible with any server side API,
         * all exported variable unctions defined in the `handle`
         * namespace should be re-implemented
         */
        namespace handle {
            /**
             * Base URI for reading content of VFS file
             */
            var get: string;
            /**
             * Base URI for VFS file sharing
             */
            var shared: string;
            /**
             * Send a request to the server-side API for a directory scanning
             * operation
             *
             * @export
             * @param {string} p a VFS file path e.g. home://test/
             * @returns {Promise<RequestResult>} A promise on a [[RequestResult]]
             * which contains an error or a list of FileInfoType
             */
            function scandir(p: string): Promise<RequestResult>;
            /**
             *
             * Send a request to the server-side API for directory creation
             *
             * @export
             * @param {string} p VFS path of the directory to be created
             * @returns {Promise<RequestResult>} A promise on a RequestResult
             * which contains an error or true on success
             */
            function mkdir(p: string): Promise<RequestResult>;
            /**
             * Send a request to the server-side API for sharing/unsharing a VFS file,
             * once shared a VFS file will be publicly visible by everyone
             *
             * @export
             * @param {string} p VFS file path to be shared
             * @param {boolean} pub flag: share (true) or unshare (false)
             * @returns {Promise<RequestResult>} A promise on a RequestResult
             * which contains an error or true on success
             */
            function sharefile(p: string, pub: boolean): Promise<RequestResult>;
            /**
             * Get VFS file meta-data
             *
             * @export
             * @param {string} p VFS file path
             * @returns {Promise<RequestResult>} A promise on a [[RequestResult]]
             * which contains an error or an object of FileInfoType
             */
            function fileinfo(p: string): Promise<RequestResult>;
            /**
             * Read a VFS file content. There are many ways a VFS file can be read:
             * - Read as a raw text content
             * - Read as a javascript file, in this case the content of the
             * file will be executed
             * - Read as JSON object
             *
             * @export
             * @param {string} p path of the VFS file
             * @param {string} t return data type:
             * - jsonp: the response is an json object
             * - script: the response is a javascript code
             * - xml, html: the response is a XML/HTML object
             * - text: plain text
             *
             * @returns {Promise<any>}  A promise on a [[RequestResult]]
             * which contains an error or an object of [[FileInfoType]]
             */
            function readfile(p: string, t: string): Promise<any>;
            /**
             * Move a file to another location on server-side
             *
             * @export
             * @param {string} s VFS source file path
             * @param {string} d VFS destination file path
             * @returns {Promise<RequestResult>}  A promise on a [[RequestResult]]
             * which contains an error or a success response
             */
            function move(s: string, d: string): Promise<RequestResult>;
            /**
             * Delete a VFS file on the server-side
             *
             * @export
             * @param {string} p VFS file path
             * @returns {Promise<RequestResult>}  A promise on a [[RequestResult]]
             * which contains an error or a success response
             */
            function remove(p: string): Promise<RequestResult>;
            /**
             * Read the file as binary data
             *
             * @export
             * @param {string} p VFS file to be read
             * @returns {Promise<ArrayBuffer>} a Promise on an array buffer
             */
            function fileblob(p: string): Promise<ArrayBuffer>;
            /**
             * Send a command to the serverside package manager
             *
             * @export
             * @param {PackageCommandType} d a package command of type PackageCommandType
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            function packages(d: PackageCommandType): Promise<RequestResult>;
            /**
             * Upload file to the server via VFS interface
             *
             * @export
             * @param {string} d VFS destination directory path
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            function upload(d: string): Promise<RequestResult>;
            /**
             * Write Base 64 encoded data to a VFS file
             *
             * @export
             * @param {string} p path to the VFS file
             * @param {string} d file data encoded in Base 64
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            function write(p: string, d: string): Promise<RequestResult>;
            /**
             * An apigateway allows client side to execute a custom server-side
             * script and get back the result. This gateway is particularly
             * useful in case of performing a task that is not provided by the core
             * API
             *
             * @export
             * @param {GenericObject<any>} d execution indication, provided only when ws is `false`
             * otherwise, `d` should be written directly to the websocket stream as JSON object.
             * Two possible formats of `d`:
             * ```text
             * execute an server-side script file:
             *
             * {
             *  path: [VFS path],
             *  parameters: [parameters of the server-side script]
             * }
             *
             * or, execute directly a snippet of server-side script:
             *
             * { code: [server-side script code snippet as string] }
             *
             * ```
             *
             * @param {boolean} ws flag indicate whether to use websocket for the connection
             * to the gateway API. In case of streaming data, the websocket is preferred
             * @returns {Promise<any>} a promise on the result object (any)
             */
            function apigateway(d: GenericObject<any>, ws: boolean): Promise<any>;
            /**
             *  Check if a user is logged in
             *
             * @export
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]] that
             * contains an error or a [[UserSettingType]] object
             */
            function auth(): Promise<RequestResult>;
            /**
             * Perform a login operation
             *
             * @export
             * @param {UserLoginType} d user data [[UserLoginType]]
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]] that
             * contains an error or a [[UserSettingType]] object
             */
            function login(d: UserLoginType): Promise<RequestResult>;
            /**
             * Perform a logout operation
             *
             * @export
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            function logout(): Promise<RequestResult>;
            /**
             * Save the current user settings
             *
             * @export
             * @returns {Promise<RequestResult>} a promise on a [[RequestResult]]
             */
            function setting(): Promise<RequestResult>;
            /**
             * This is the low level function of AntOS VDB API.
             * It requests the server API to perform some simple
             * SQL query.
             *
             * @export
             * @param {string} cmd action to perform: save, delete, get, select
             * @param {GenericObject<any>} d data object of the request based on each action:
             * - save:
             * ```
             *  { table: "table name", data: [record data object]}
             * ```
             * - get:
             * ```
             *  { table: "table name", id: [record id]}
             * ```
             * - delete:
             * ```
             *  { table: "table name", id: [record id]}
             * or
             *  { table: "table name", cond: [conditional object]}
             * ```
             * - select:
             * ```
             * { table: "table name", cond: [conditional object]}
             * ```
             * @returns {Promise<RequestResult>} a promise of [[RequestResult]] on the
             * query data
             *
             * A conditional object represents a SQL condition statement as an object,
             * example: `pid = 10 AND cid = 2 ORDER BY date DESC`
             * ```
             *  {
             *      exp: {
             *          "and": {
             *              pid: 10,
             *              cid: 2
             *          }
             *      },
             *      order: {
             *          date: "DESC"
             *      }
             *  }
             * ```
             */
            function dbquery(cmd: string, d: GenericObject<any>): Promise<RequestResult>;
        }
    }
}
declare namespace OS {
    /**
     * This namespace is dedicated to everything related to the
     * global system settings
     */
    namespace setting {
        /**
         * User setting type definition
         *
         * @export
         * @interface UserSettingType
         */
        interface UserSettingType {
            /**
             * User full name
             *
             * @type {string}
             * @memberof UserSettingType
             */
            name: string;
            /**
             * User name
             *
             * @type {string}
             * @memberof UserSettingType
             */
            username: string;
            /**
             * User id
             *
             * @type {number}
             * @memberof UserSettingType
             */
            id: number;
            /**
             * User groups
             *
             * @type {{ [index: number]: string }}
             * @memberof UserSettingType
             */
            group?: {
                [index: number]: string;
            };
            [propName: string]: any;
        }
        /**
         * Virtual desktop setting data type
         *
         * @export
         * @interface DesktopSettingType
         */
        interface DesktopSettingType {
            /**
             * Desktop VFS path
             *
             * @type {string}
             * @memberof DesktopSettingType
             */
            path: string;
            /**
             * Desktop menu, can be added automatically by applications
             *
             * @type {GUI.BasicItemType[]}
             * @memberof DesktopSettingType
             */
            menu: GUI.BasicItemType[];
            /**
             * Show desktop hidden files
             *
             * @type {boolean}
             * @memberof DesktopSettingType
             */
            showhidden: boolean;
            [propName: string]: any;
        }
        /**
         * Wallpaper setting data type
         *
         * @export
         * @interface WPSettingType
         */
        interface WPSettingType {
            /**
             * Repeat wallpaper:
             * - `repeat`
             * - `repeat-x`
             * - `repeat-y`
             * - `no-repeat`
             *
             * @type {string}
             * @memberof WPSettingType
             */
            repeat: string;
            /**
             * Wallpaper size
             * - `contain`
             * - `cover`
             * - `auto`
             *
             * @type {string}
             * @memberof WPSettingType
             */
            size: string;
            /**
             * VFS path to the wallpaper image
             *
             * @type {string}
             * @memberof WPSettingType
             */
            url: string;
        }
        /**
         * Theme setting data type
         *
         * @export
         * @interface ThemeSettingType
         */
        interface ThemeSettingType {
            /**
             * Theme name, this value is used for looking
             * theme file in system asset
             *
             * @type {string}
             * @memberof ThemeSettingType
             */
            name: string;
            /**
             * Theme user-friendly text
             *
             * @type {string}
             * @memberof ThemeSettingType
             */
            text: string;
        }
        /**
         * Appearance setting data type
         *
         * @export
         * @interface AppearanceSettingType
         */
        interface AppearanceSettingType {
            /**
             * Current theme name
             *
             * @type {string}
             * @memberof AppearanceSettingType
             */
            theme: string;
            /**
             * All themes available in the system
             *
             * @type {ThemeSettingType[]}
             * @memberof AppearanceSettingType
             */
            themes: ThemeSettingType[];
            /**
             * Current wallpaper setting
             *
             * @type {WPSettingType}
             * @memberof AppearanceSettingType
             */
            wp: WPSettingType;
            /**
             * All wallpapers available in the system
             *
             * @type {string[]}
             * @memberof AppearanceSettingType
             */
            wps: string[];
        }
        /**
         * VFS Mount points setting data type
         *
         * @export
         * @interface VFSMountPointSettingType
         */
        interface VFSMountPointSettingType {
            /**
             * Path to the mount point
             *
             * @type {string}
             * @memberof VFSMountPointSettingType
             */
            path: string;
            /**
             * User friendly mount point name
             *
             * @type {string}
             * @memberof VFSMountPointSettingType
             */
            text: string;
            [propName: string]: any;
        }
        /**
         * VFS setting data type
         *
         * @export
         * @interface VFSSettingType
         */
        interface VFSSettingType {
            /**
             * mount points setting
             *
             * @type {VFSMountPointSettingType[]}
             * @memberof VFSSettingType
             */
            mountpoints: VFSMountPointSettingType[];
            [propName: string]: any;
        }
        /**
         * Global system setting data type
         *
         * @export
         * @interface SystemSettingType
         */
        interface SystemSettingType {
            /**
             * System error report URL
             *
             * @type {string}
             * @memberof SystemSettingType
             */
            error_report: string;
            /**
             * Current system locale e.g. `en_GB`
             *
             * @type {string}
             * @memberof SystemSettingType
             */
            locale: string;
            /**
             * System menus
             *
             * @type {API.PackageMetaType[]}
             * @memberof API.PackageMetaType
             */
            menu: API.PackageMetaType[];
            /**
             * Packages meta-data
             *
             * @type {{ [index: string]: API.PackageMetaType }}
             * @memberof SystemSettingType
             */
            packages: {
                [index: string]: API.PackageMetaType;
            };
            /**
             * Path to the installed packages
             *
             * @type {{
             *                 user: string;
             *                 system: string;
             *             }}
             * @memberof SystemSettingType
             */
            pkgpaths: {
                /**
                 * User specific packages install location
                 *
                 * @type {string}
                 */
                user: string;
                /**
                 * System packages install location
                 *
                 * @type {string}
                 */
                system: string;
            };
            /**
             * Package repositories setting.
             * This configuration is used by [[MarketPlace]]
             * for package management
             *
             * @type {{
             *                 text: string;
             *                 url: string;
             *             }[]}
             * @memberof SystemSettingType
             */
            repositories: {
                /**
                 * Repository name
                 *
                 * @type {string}
                 */
                text: string;
                /**
                 * Repository uri
                 *
                 * @type {string}
                 */
                url: string;
            }[];
            /**
             * Startup applications and services
             *
             * @type {{
             *                 apps: string[];
             *                 services: string[];
             *             }}
             * @memberof SystemSettingType
             */
            startup: {
                /**
                 * List of application names
                 *
                 * @type {string[]}
                 */
                apps: string[];
                /**
                 * List of service names
                 *
                 * @type {string[]}
                 */
                services: string[];
                /**
                 * List of pinned applications
                 *
                 * @type {string[]}
                 */
                pinned: string[];
            };
        }
        /**
         * User settings
         */
        var user: UserSettingType;
        /**
         * Application settings
         */
        var applications: GenericObject<any>;
        /**
         * Desktop settings
         */
        var desktop: DesktopSettingType;
        /**
         * Appearance settings
         */
        var appearance: AppearanceSettingType;
        /**
         * VFS settings
         */
        var VFS: VFSSettingType;
        /**
         * System settings
         */
        var system: SystemSettingType;
    }
    /**
     * Reset the system settings to default values
     *
     * @export
     */
    function resetSetting(): void;
    /**
     * Apply the input parameter object to system settings.
     * This object could be an object loaded from
     * setting JSON file saved on the server.
     *
     * @export
     * @param {*} conf
     */
    function systemSetting(conf: any): void;
}
/// <reference types="jquery" />
declare namespace OS {
    namespace application {
        /**
         * Services are processes that run in the background and
         * are waken up in certain circumstances such as by global
         * events or user interactions.
         *
         * Each service takes an entry in the system tray menu
         * located on the system panel. This menu entry is used
         * to access to service visual contents such as: options,
         * task performing based on user interaction, etc.
         *
         * Services are singleton processes, there is only
         * one process of a service at a time
         *
         * @export
         * @abstract
         * @class BaseService
         * @extends {BaseModel}
         */
        abstract class BaseService extends BaseModel {
            /**
             * The service icon shown in the system tray
             *
             * @type {string}
             * @memberof BaseService
             */
            icon: string;
            /**
             * CSS class of the service icon shown in the system tray
             *
             * @type {string}
             * @memberof BaseService
             */
            iconclass: string;
            /**
             * Text of the service shown in the system tray
             *
             * @type {string}
             * @memberof BaseService
             */
            text: string;
            /**
             * Reference to the menu entry DOM element attached
             * to the service
             *
             * @type {HTMLElement}
             * @memberof BaseService
             */
            domel: HTMLElement;
            /**
             * Reference to the timer that periodically executes the callback
             * defined in [[watch]].
             *
             * @private
             * @type {number}
             * @memberof BaseService
             */
            private timer;
            /**
             * Reference to the system tray menu
             *
             * @type {HTMLElement}
             * @memberof BaseService
             */
            holder: HTMLElement;
            /**
             * Placeholder for service select callback
             *
             * @memberof BaseService
             */
            onmenuselect: (d: OS.GUI.TagEventType<GUI.tag.MenuEventData>) => void;
            /**
             *Creates an instance of BaseService.
             * @param {string} name service class name
             * @param {AppArgumentsType[]} args service arguments
             * @memberof BaseService
             */
            constructor(name: string, args: AppArgumentsType[]);
            /**
             * Do nothing
             *
             * @memberof BaseService
             */
            hide(): void;
            /**
             * Init the service before attaching it to
             * the system tray: event subscribe, scheme
             * loading.
             *
             * Should be implemented by all subclasses
             *
             * @abstract
             * @memberof BaseService
             */
            abstract init(): void;
            /**
             * Refresh the service menu entry in the
             * system tray
             *
             * @memberof BaseService
             */
            update(): void;
            /**
             * Get the service meta-data
             *
             * @returns {API.PackageMetaType}
             * @memberof BaseService
             */
            meta(): API.PackageMetaType;
            /**
             * Attach the service to a menu element
             * such as the system tray menu
             *
             * @param {HTMLElement} h
             * @memberof BaseService
             */
            attach(h: HTMLElement): void;
            /**
             * Set the callback that will be called periodically
             * after a period of time.
             *
             * Each service should only have at most one watcher
             *
             * @protected
             * @param {number} t period time in seconds
             * @param {() => void} f callback function
             * @returns {number}
             * @memberof BaseService
             */
            protected watch(t: number, f: () => void): number;
            /**
             * This function is called when the service
             * is exited
             *
             * @protected
             * @param {BaseEvent} evt exit event
             * @returns
             * @memberof BaseService
             */
            protected onexit(evt: BaseEvent): JQuery<HTMLElement>;
            /**
             * Do nothing
             *
             * @memberof BaseService
             */
            main(): void;
            /**
             * Do nothing
             *
             * @memberof BaseService
             */
            show(): void;
            /**
             * Awake the service, this function is usually called when
             * the system tray menu entry attached to the service is
             * selected.
             *
             * This function should be implemented by all subclasses
             *
             * @abstract
             * @param {GUI.TagEventType} e
             * @memberof BaseService
             */
            abstract awake(e: GUI.TagEventType<GUI.tag.MenuEventData>): void;
            /**
             * Do nothing
             *
             * @protected
             * @param {BaseEvent} evt
             * @memberof BaseService
             */
            protected cleanup(evt: BaseEvent): void;
        }
    }
}
declare type VFSFileHandleClass = {
    new (...args: any[]): OS.API.VFS.BaseFileHandle;
};
interface String {
    /**
     * Convert a string to VFS file handle.
     *
     * This function will create a file handle object from the string
     * with the help of [[VFS.findHandles]]
     *
     * @returns {OS.API.VFS.BaseFileHandle}
     * @memberof String
     */
    asFileHandle(): OS.API.VFS.BaseFileHandle;
}
declare namespace OS {
    namespace API {
        /**
         * User permission data type
         *
         * @export
         * @interface UserPermissionType
         */
        interface UserPermissionType {
            read: boolean;
            write: boolean;
            exec: boolean;
        }
        /**
         * VFS file meta-data data type
         *
         * @export
         * @interface FileInfoType
         */
        interface FileInfoType {
            /**
             * File mime type
             *
             * @type {string}
             * @memberof FileInfoType
             */
            mime: string;
            /**
             * File size
             *
             * @type {number}
             * @memberof FileInfoType
             */
            size: number;
            /**
             * File name
             *
             * @type {string}
             * @memberof FileInfoType
             */
            name: string;
            /**
             * File path
             *
             * @type {string}
             * @memberof FileInfoType
             */
            path: string;
            /**
             * File type:
             * - `file`
             * - `dir`
             * - `app`
             *
             * @type {string}
             * @memberof FileInfoType
             */
            type: string;
            /**
             * File permission
             *
             * @type {{
             *                 group: UserPermissionType;
             *                 owner: UserPermissionType;
             *                 other: UserPermissionType;
             *             }}
             * @memberof FileInfoType
             */
            perm?: {
                /**
                 * Group permission
                 *
                 * @type {UserPermissionType}
                 */
                group: UserPermissionType;
                /**
                 * Owner permission
                 *
                 * @type {UserPermissionType}
                 */
                owner: UserPermissionType;
                /**
                 * Other permission
                 *
                 * @type {UserPermissionType}
                 */
                other: UserPermissionType;
            };
            /**
             * Creation time
             *
             * @type {string}
             * @memberof FileInfoType
             */
            ctime?: string;
            /**
             * Modification time
             *
             * @type {string}
             * @memberof FileInfoType
             */
            mtime?: string;
            /**
             * Group id
             *
             * @type {number}
             * @memberof FileInfoType
             */
            gid?: number;
            /**
             * User id
             *
             * @type {number}
             * @memberof FileInfoType
             */
            uid?: number;
            [propName: string]: any;
        }
        /**
         * This namespace is dedicated to all APIs related to
         * AntOS Virtual File System (VFS)
         */
        namespace VFS {
            /**
             * Placeholder stores VFS file protocol patterns and its attached file handle class.
             *
             */
            const handles: GenericObject<VFSFileHandleClass>;
            /**
             * Register a protocol to a handle class
             *
             * @export
             * @param {string} protos VFS protocol pattern
             * @param {VFSFileHandleClass} cls handle class
             */
            function register(protos: string, cls: VFSFileHandleClass): void;
            /**
             * Load custom VFS handles if the package vfsx available
             *
             * @export
             * @param {boolean} [force] force load the file
             * @return {*}  {Promise<any>}
             */
            function loadVFSX(force?: boolean): Promise<any>;
            /**
             * Looking for a attached file handle class of a string protocol
             *
             * When converting a string to file handle, the system will look
             * for a protocol pattern in the string, if the protocol found,
             * its attached handle class (found in [[VFS.handles]]) will be
             * used to initialize a file handle object from the string
             *
             * ```typescript
             *  "home://data/test.txt".asFileHandle() // -> an instance of RemoteFileHandle
             * ```
             * @export
             * @param {string} proto protocol string
             * @returns {VFSFileHandleClass[]}
             */
            function findHandles(proto: string): VFSFileHandleClass[];
            /**
             * Abstract prototype of all all VFS file handle definition.
             *
             * This prototype provides a standardized interface to access
             * to different underlay file systems such as remote file,
             * cloud file (Dropbox, Google drive, etc.), URL or memory-based file
             *
             * @export
             * @abstract
             * @class BaseFileHandle
             */
            abstract class BaseFileHandle {
                /**
                 * Flag indicates whether the file is dirty
                 *
                 * @type {boolean}
                 * @memberof BaseFileHandle
                 */
                dirty: boolean;
                /**
                 * Once read, file content will be cached in this placeholder
                 *
                 * @type {*}
                 * @memberof BaseFileHandle
                 */
                cache: any;
                /**
                 * Flag indicated whether the file meta-data is loaded
                 *
                 * @type {boolean}
                 * @memberof BaseFileHandle
                 */
                ready: boolean;
                /**
                 * File path
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                path: string;
                /**
                 * File protocol e.g:
                 * - `os://`
                 * - `home://`
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                protocol: string;
                /**
                 * List of path segments
                 *
                 * @type {string[]}
                 * @memberof BaseFileHandle
                 */
                genealogy: string[];
                /**
                 * File base name
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                basename: string;
                /**
                 * Once loaded, [[ready]] will be set to true and
                 * file meta-data will be stored in this place holder
                 *
                 * @type {FileInfoType}
                 * @memberof BaseFileHandle
                 */
                info: FileInfoType;
                /**
                 * File extension
                 *
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                ext: string;
                /**
                 *
                 * File type
                 * @type {string}
                 * @memberof BaseFileHandle
                 */
                type: string;
                /**
                 *Creates an instance of BaseFileHandle.
                 * @param {string} path file path
                 * @memberof BaseFileHandle
                 */
                constructor(path: string);
                /**
                 * Set a file path to the current file handle
                 *
                 * @param {string} p
                 * @returns {void}
                 * @memberof BaseFileHandle
                 */
                setPath(p: string): void;
                /**
                 * Getter: Get the file basename
                 * Setter: set the file name
                 *
                 * @returns {string}
                 * @memberof BaseFileHandle
                 */
                get filename(): string;
                set filename(v: string);
                /**
                 * Set data to the file cache
                 *
                 * @param {*} v data object
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                setCache(v: any): BaseFileHandle;
                /**
                 * Return the object itself
                 *
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                asFileHandle(): BaseFileHandle;
                /**
                 * Check whether the current file is the root of the file tree
                 *
                 * @returns {boolean}
                 * @memberof BaseFileHandle
                 */
                isRoot(): boolean;
                /**
                 * Check whether the current file is a hidden file
                 *
                 * @returns {boolean}
                 * @memberof BaseFileHandle
                 */
                isHidden(): boolean;
                /**
                 * Get hash number of the current file path
                 *
                 * @returns {number}
                 * @memberof BaseFileHandle
                 */
                hash(): number;
                /**
                 * Convert the current file cache to Base64
                 *
                 * @protected
                 * @param {string} t type of the file cache:
                 * - `object`
                 * - `mime type`
                 * @returns {(Promise<string | ArrayBuffer>)} promise on the converted data
                 * @memberof BaseFileHandle
                 */
                protected b64(t: string): Promise<string | ArrayBuffer>;
                /**
                 * Get the parent file handle of the current file
                 *
                 * @returns {BaseFileHandle}
                 * @memberof BaseFileHandle
                 */
                parent(): BaseFileHandle;
                /**
                 * Load the file meta-data before performing
                 * any task
                 *
                 * @returns {Promise<FileInfoType>} a promise on file meta-data
                 * @memberof BaseFileHandle
                 */
                onready(): Promise<FileInfoType>;
                /**
                 * Public read operation
                 *
                 * This function calls the [[_rd]] function to perform the operation.
                 *
                 * If the current file is a directory, then the operation
                 * will return the meta-data of all files inside of the directory.
                 * Otherwise, file content will be returned
                 *
                 * @param {string} t data type
                 * - jsonp: the response is an json object
                 * - script: the response is a javascript code
                 * - xml, html: the response is a XML/HTML object
                 * - text: plain text
                 * - binary
                 *
                 * @returns {Promise<any>} a promise on the file content
                 * @memberof BaseFileHandle
                 */
                read(t?: string): Promise<any>;
                /**
                 * Write the file cache to the actual file
                 *
                 * This function calls the [[_wr]] function to perform the operation
                 *
                 * @param {string} t data type
                 * - `base64`
                 * - `object`
                 * - `mime type`
                 *
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                write(t: string): Promise<RequestResult>;
                /**
                 * Sub-directory creation
                 *
                 * This function calls the [[_mk]] function to perform the operation
                 *
                 * @param {string} d sub directory name
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                mk(d: string): Promise<RequestResult>;
                /**
                 * Delete the file
                 *
                 * This function calls the [[_rm]] function to perform the operation
                 *
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                remove(): Promise<RequestResult>;
                /**
                 * Upload a file to the current directory
                 *
                 * Only work when the current file is a directory
                 *
                 * This function calls the [[_up]] function to perform the operation
                 *
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                upload(): Promise<RequestResult>;
                /**
                 * Share the file by publish it.
                 *
                 * Only work with file
                 *
                 * This function calls the [[_pub]] function to perform the operation
                 *
                 * @returns {Promise<RequestResult>} promise on operation result
                 * @memberof BaseFileHandle
                 */
                publish(): Promise<RequestResult>;
                /**
                 * Download the file.
                 *
                 * Only work with file
                 *
                 * This function calls the [[_down]] function to perform the operation
                 *
                 * @returns {Promise<any>} Promise on the operation result
                 * @memberof BaseFileHandle
                 */
                download(): Promise<any>;
                /**
                 * Move the current file to another location
                 *
                 * This function calls the [[_mv]] function to perform the operation
                 *
                 * @param {string} d destination location
                 * @returns {Promise<RequestResult>} promise on the operation result
                 * @memberof BaseFileHandle
                 */
                move(d: string): Promise<RequestResult>;
                /**
                 * Execute the current file.
                 *
                 * This action depends on each file protocol
                 *
                 * This function calls the [[_exec]] function to perform the operation
                 *
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                execute(): Promise<any>;
                /**
                 * Get an accessible link to the file
                 * that can be accessed from the browser
                 *
                 * @returns {string}
                 * @memberof BaseFileHandle
                 */
                getlink(): string;
                /**
                 * Helper function returns a promise on unsupported action
                 *
                 * @param {string} t action name
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected unsupported(t: string): Promise<RequestResult>;
                /**
                 * Low level protocol-specific read operation
                 *
                 * This function should be overridden on the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {string} t data type, see [[read]]
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _rd(t: string): Promise<RequestResult>;
                /**
                 * Low level protocol-specific write operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {string} t data type, see [[write]]
                 * @param {*} [d]
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _wr(t: string, d?: any): Promise<RequestResult>;
                /**
                 * Low level protocol-specific sub-directory creation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {string} d sub directory name
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _mk(d: string): Promise<RequestResult>;
                /**
                 * Low level protocol-specific delete operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _rm(): Promise<RequestResult>;
                /**
                 * Low level protocol-specific move operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @protected
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _mv(d: string): Promise<RequestResult>;
                /**
                 * Low level protocol-specific upload operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _up(): Promise<RequestResult>;
                /**
                 * Low level protocol-specific download operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<any>}
                 * @memberof BaseFileHandle
                 */
                protected _down(): Promise<any>;
                /**
                 * Low level protocol-specific execute operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _exec(): Promise<RequestResult>;
                /**
                 * Low level protocol-specific share operation
                 *
                 * This function should be overridden by the file handle class
                 * that supports the operation
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                protected _pub(): Promise<RequestResult>;
                /**
                 * Read the current file meta-data
                 *
                 * should be implemented by subclasses
                 *
                 * @abstract
                 * @returns {Promise<RequestResult>}
                 * @memberof BaseFileHandle
                 */
                abstract meta(): Promise<RequestResult>;
            }
            /**
             * Remote file handle allows to perform file operation
             * on AntOS remote server files. Its protocol is defined
             * by the following pattern:
             *
             * ```
             * ^(home|desktop|os|Untitled)$
             * ```
             *
             * @class RemoteFileHandle
             * @extends {BaseFileHandle}
             */
            class RemoteFileHandle extends BaseFileHandle {
                /**
                 *Creates an instance of RemoteFileHandle.
                 * @param {string} path file path
                 * @memberof RemoteFileHandle
                 */
                constructor(path: string);
                /**
                 * Read remote file meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                meta(): Promise<RequestResult>;
                /**
                 * Remote file access link
                 *
                 * @returns {string}
                 * @memberof RemoteFileHandle
                 */
                getlink(): string;
                /**
                 * Read remote file content.
                 *
                 * If the current file is a directory, then the operation
                 * will return the meta-data of all files inside of the directory.
                 * Otherwise, file content will be returned
                 *
                 * @protected
                 * @param {string} t data type see [[read]]
                 * @returns {Promise<any>}
                 * @memberof RemoteFileHandle
                 */
                protected _rd(t: string): Promise<any>;
                /**
                 * Write file cache to the remote file
                 *
                 * @protected
                 * @param {string} t data type see [[write]]
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _wr(t: string): Promise<RequestResult>;
                /**
                 * Create sub directory
                 *
                 * Only work on directory file handle
                 *
                 * @protected
                 * @param {string} d sub directory name
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _mk(d: string): Promise<RequestResult>;
                /**
                 * Delete file/folder
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _rm(): Promise<RequestResult>;
                /**
                 * Move file/folder
                 *
                 * @protected
                 * @param {string} d
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _mv(d: string): Promise<RequestResult>;
                /**
                 * Upload a file
                 *
                 * Only work with directory file handle
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _up(): Promise<RequestResult>;
                /**
                 * Download a file
                 *
                 * only work with file
                 *
                 * @protected
                 * @returns {Promise<void>}
                 * @memberof RemoteFileHandle
                 */
                protected _down(): Promise<void>;
                /**
                 * Publish a file
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof RemoteFileHandle
                 */
                protected _pub(): Promise<RequestResult>;
            }
            /**
             * Package file is remote file ([[RemoteFileHandle]]) located either in
             * the local user packages location or system packages
             * location, it should be in the following format:
             *
             * ```
             * pkg://PKG_NAME/path/to/file
             *
             * ```
             *
             * The system will locale the package name PKG_NAME either in the system domain
             * or in user domain and return the correct path to the package
             *
             * @export
             * @class PackageFileHandle
             * @extends {RemoteFileHandle}
             */
            class PackageFileHandle extends RemoteFileHandle {
                /**
                 *Creates an instance of PackageFileHandle.
                 * @param {string} pkg_path package path in string
                 * @memberof PackageFileHandle
                 */
                constructor(pkg_path: string);
            }
            /**
             * Application file is an AntOS special file allowing to
             * refer to an application as a regular file. Its protocol
             * pattern is defined as:
             *
             * ```typescript
             * "^app$" // e.g. app://Setting
             * ```
             *
             * @class ApplicationHandle
             * @extends {BaseFileHandle}
             */
            class ApplicationHandle extends BaseFileHandle {
                /**
                 *Creates an instance of ApplicationHandle.
                 * @param {string} path file path
                 * @memberof ApplicationHandle
                 */
                constructor(path: string);
                /**
                 * Read application meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof ApplicationHandle
                 */
                meta(): Promise<RequestResult>;
                /**
                 * If the current file is root (e.g. `app://`), the operation
                 * will return all system packages meta-data.
                 *
                 * Otherwise, an error will be thrown
                 *
                 * @protected
                 * @param {string} t
                 * @returns {Promise<any>}
                 * @memberof ApplicationHandle
                 */
                protected _rd(t: string): Promise<any>;
            }
            /**
             * A buffer file handle represents a virtual file that is stored
             * on the system memory. Its protocol pattern is defined as:
             *
             * ```typescript
             * "^mem$" // e.g. mem://test.txt
             * ```
             *
             * @class BufferFileHandle
             * @extends {BaseFileHandle}
             */
            class BufferFileHandle extends BaseFileHandle {
                /**
                 *Creates an instance of BufferFileHandle.
                 * @param {string} path file path
                 * @param {string} mime file mime-type
                 * @param {*} data file data
                 * @memberof BufferFileHandle
                 */
                constructor(path: string, mime: string, data: any);
                /**
                 * Read the file meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                meta(): Promise<RequestResult>;
                /**
                 * Read file content stored in the file cached
                 *
                 * @protected
                 * @param {string} t data type see [[read]]
                 * @returns {Promise<any>}
                 * @memberof BufferFileHandle
                 */
                protected _rd(t: string): Promise<any>;
                /**
                 * Write data to the file cache
                 *
                 * @protected
                 * @param {string} t data type, see [[write]]
                 * @param {*} d data
                 * @returns {Promise<RequestResult>}
                 * @memberof BufferFileHandle
                 */
                protected _wr(t: string, d: any): Promise<RequestResult>;
                /**
                 * Download the buffer file
                 *
                 * @protected
                 * @returns {Promise<void>}
                 * @memberof BufferFileHandle
                 */
                protected _down(): Promise<void>;
            }
            /**
             * URL file handle represents a HTTP/HTTPs link url
             * as an AntOS VFS file handle. Its protocol is defined as
             *
             * ```
             * ^(http|https|ftp)$
             * ```
             *
             * @class URLFileHandle
             * @extends {BaseFileHandle}
             */
            class URLFileHandle extends BaseFileHandle {
                /**
                 *Creates an instance of URLFileHandle.
                 * @param {string} path
                 * @memberof URLFileHandle
                 */
                constructor(path: string);
                /**
                 * Read file meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof URLFileHandle
                 */
                meta(): Promise<RequestResult>;
                /**
                 * Read URL content
                 *
                 * @protected
                 * @param {string} t data type see [[read]]
                 * @returns {Promise<any>}
                 * @memberof URLFileHandle
                 */
                protected _rd(t: string): Promise<any>;
            }
            /**
             * Shared file handle represents all AntOS shared file.
             * Its protocol is defined as:
             *
             * ```
             * ^shared$
             * ```
             *
             * @class SharedFileHandle
             * @extends {API.VFS.BaseFileHandle}
             */
            class SharedFileHandle extends API.VFS.BaseFileHandle {
                /**
                 *Creates an instance of SharedFileHandle.
                 * @param {string} path file path
                 * @memberof SharedFileHandle
                 */
                constructor(path: string);
                /**
                 * Read file meta-data
                 *
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                meta(): Promise<RequestResult>;
                /**
                 * Read file content
                 *
                 * @protected
                 * @param {string} t data type, see [[read]]
                 * @returns {Promise<any>}
                 * @memberof SharedFileHandle
                 */
                protected _rd(t: string): Promise<any>;
                /**
                 * write data to shared file
                 *
                 * @protected
                 * @param {string} t data type, see [[write]]
                 * @param {string} d file data
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                protected _wr(t: string, d: string): Promise<RequestResult>;
                /**
                 * Un-publish the file
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                protected _rm(): Promise<RequestResult>;
                /**
                 * Download shared file
                 *
                 * @protected
                 * @returns {Promise<void>}
                 * @memberof SharedFileHandle
                 */
                protected _down(): Promise<void>;
                /**
                 * Un publish the file
                 *
                 * @protected
                 * @returns {Promise<RequestResult>}
                 * @memberof SharedFileHandle
                 */
                protected _pub(): Promise<RequestResult>;
            }
            /**Utilities global functions */
            /**
             * Read a file content from a zip archive
             *
             * The content type should be:
             * - base64 : the result will be a string, the binary in a base64 form.
             * - text (or string): the result will be an unicode string.
             * - binarystring: the result will be a string in “binary” form, using 1 byte per char (2 bytes).
             * - array: the result will be an Array of bytes (numbers between 0 and 255).
             * - uint8array : the result will be a Uint8Array. This requires a compatible browser.
             * - arraybuffer : the result will be a ArrayBuffer. This requires a compatible browser.
             * - blob : the result will be a Blob. This requires a compatible browser.             *
             * If file_name is not specified, the first file_name in the zip archive will be read
             * @export
             * @param {string} file zip file
             * @param {string} type content type to read
             * @param {string} [file_name] the file should be read from the zip archive
             * @return {*}  {Promise<any>}
             */
            function readFileFromZip(file: string, type: string, file_name?: string): Promise<any>;
            /**
             * Cat all files to a single out-put
             *
             * @export
             * @param {string[]} list list of VFS files
             * @param {string} data input data string that will be cat to the files content
             * @param {string} join_by join on files content by this string
             * @return {*}  {Promise<string>}
             */
            function cat(list: string[], data: string, join_by?: string): Promise<string>;
            /**
             * Read all files content on the list
             *
             * @export
             * @param {string[]} list list of VFS files
             * @param {GenericObject<string>[]} contents content array
             * @return {void}
             */
            function read_files(list: string[]): Promise<GenericObject<string>[]>;
            /**
             * Copy files to a folder
             *
             * @export
             * @param {string[]} files list of files
             * @param {string} to destination folder
             * @return {*}  {Promise<any[]>}
             */
            function copy(files: string[], to: string): Promise<any[]>;
            /**
             * Create a zip archive from a folder
             *
             * @export
             * @param {string} src source file/folder
             * @param {string} dest destination archive
             * @return {*}  {Promise<void>}
             */
            function mkar(src: string, dest: string): Promise<void>;
            /**
             * Create a list of directories
             *
             * @export
             * @param {string[]} list of directories to be created
             * @param {boolen} sync sync/async of directory creation
             * @return {*}  {Promise<any>}
             */
            function mkdirAll(list: string[], sync?: boolean): Promise<any>;
            /**
             *
             *
             * @export Extract a zip fle
             * @param {string} zfile zip file to extract
             * @param {(zip:any) => Promise<string>} [dest_callback] a callback to get extraction destination
             * @return {*}  {Promise<void>}
             */
            function extractZip(zfile: string | API.VFS.BaseFileHandle, dest_callback: (zip: any) => Promise<string>): Promise<void>;
            /**
             * Make files from a set of template files
             *
             * @export
             * @param {Array<string[]>} list mapping paths between templates files and created files
             * @param {string} path files destination
             * @param {(data: string) => string} callback: pre-processing files content before writing to destination files
             * @return {*}  {Promise<any[]>}
             */
            function mktpl(list: Array<string[]>, path: string, callback: (data: string) => string): Promise<any[]>;
        }
    }
}
/// <reference types="jquery" />
declare namespace OS {
    /**
     * This namespace is dedicated to application and service definition.
     * When an application is loaded, its prototype definition will be
     * inserted to this namespace for reuse lately
     */
    namespace application {
        /**
         * Abstract prototype of all AntOS applications.
         * Any new application definition should extend
         * this prototype
         *
         * @export
         * @abstract
         * @class BaseApplication
         * @extends {BaseModel}
         */
        abstract class BaseApplication extends BaseModel {
            /**
             * Placeholder of all settings specific to the application.
             * The settings stored in this object will be saved to system
             * setting when logout and can be reused in the next login session
             *
             * @type {GenericObject<any>}
             * @memberof BaseApplication
             */
            setting: GenericObject<any>;
            /**
             * Hotkeys (shortcuts) defined for this application
             *
             * @protected
             * @type {GUI.ShortcutType}
             * @memberof BaseApplication
             */
            protected keycomb: GUI.ShortcutType;
            /**
             * Reference to the system dock
             *
             * @type {GUI.tag.AppDockTag}
             * @memberof BaseApplication
             */
            sysdock: GUI.tag.AppDockTag;
            /**
             * Reference to the system application menu located
             * on the system panel
             *
             * @type {GUI.tag.MenuTag}
             * @memberof BaseApplication
             */
            appmenu: GUI.tag.MenuTag;
            /**
             *Creates an instance of BaseApplication.
             * @param {string} name application name
             * @param {AppArgumentsType[]} args application arguments
             * @memberof BaseApplication
             */
            constructor(name: string, args: AppArgumentsType[]);
            /**
             * Init the application, this function is called when the
             * application process is created and docked in the application
             * dock.
             *
             * The application UI will be rendered after the execution
             * of this function.
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            init(): void;
            /**
             * Render the application UI by first loading its scheme
             * and then mount this scheme to the DOM tree
             *
             * @protected
             * @returns {void}
             * @memberof BaseApplication
             */
            protected loadScheme(): void;
            /**
             * API function to perform an heavy task.
             * This function will trigger the global `loading`
             * event at the beginning of the task, and the `loaded`
             * event after finishing the task
             *
             * @protected
             * @param {Promise<any>} promise the promise on a task to be performed
             * @returns {Promise<void>}
             * @memberof BaseApplication
             */
            protected load(promise: Promise<any>): Promise<void>;
            /**
             * Bind a hotkey to the application, this function
             * is used to define application keyboard shortcut
             *
             * @protected
             * @param {string} k the hotkey to bind, should be in the following
             * format: `[ALT|SHIFT|CTRL|META]-KEY`, e.g. `CTRL-S`
             * @param {(e: JQuery.KeyboardEventBase) => void} f the callback function
             * @returns {void}
             * @memberof BaseApplication
             */
            protected bindKey(k: string, f: (e: JQuery.KeyboardEventBase) => void): void;
            /**
             * Update the application local from the system
             * locale or application specific locale configuration
             *
             * @param {string} name locale name e.g. `en_GB`
             * @returns {void}
             * @memberof BaseApplication
             */
            updateLocale(name: string): void;
            /**
             * Execute the callback subscribed to a
             * keyboard shortcut
             *
             * @param {string} fnk meta or modifier key e.g. `CTRL`, `ALT`, `SHIFT` or `META`
             * @param {string} c a regular key
             * @param {JQuery.KeyDownEvent} e JQuery keyboard event
             * @returns {boolean} return whether the shortcut is executed
             * @memberof BaseApplication
             */
            shortcut(fnk: string, c: string, e: JQuery.KeyDownEvent): boolean;
            /**
             * Apply a setting to the application
             *
             * @protected
             * @param {string} k the setting name
             * @memberof BaseApplication
             */
            protected applySetting(k: string): void;
            /**
             * Apply all settings to the application
             *
             * @protected
             * @memberof BaseApplication
             */
            protected applyAllSetting(): void;
            /**
             * Set a setting value to the application setting
             * registry
             *
             * @protected
             * @param {string} k setting name
             * @param {*} v setting value
             * @returns {void}
             * @memberof BaseApplication
             */
            protected registry(k: string, v: any): void;
            /**
             * Show the appliation
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            show(): void;
            /**
             * Blur the application
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            blur(): void;
            /**
             * Hide the application
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            hide(): void;
            /**
             * Maximize or restore the application window size
             * and its position
             *
             * @returns {void}
             * @memberof BaseApplication
             */
            toggle(): void;
            /**
             * Get the application title
             *
             * @returns {(string| FormattedString)}
             * @memberof BaseApplication
             */
            title(): string | FormattedString;
            /**
             * Function called when the application exit.
             * If the input exit event is prevented, the application
             * process will not be killed
             *
             *
             * @protected
             * @param {BaseEvent} evt exit event
             * @memberof BaseApplication
             */
            protected onexit(evt: BaseEvent): void;
            /**
             * Get the application meta-data
             *
             * @returns {API.PackageMetaType}
             * @memberof BaseApplication
             */
            meta(): API.PackageMetaType;
            /**
             * Base menu definition. This function
             * returns the based menu definition of all applications.
             * Other application specific menu entries
             * should be defined in [[menu]] function
             *
             * @protected
             * @returns {GUI.BasicItemType[]}
             * @memberof BaseApplication
             */
            protected baseMenu(): GUI.BasicItemType[];
            /**
             * The main application entry that is called after
             * the application UI is rendered. This application
             * must be implemented by all subclasses
             *
             * @abstract
             * @memberof BaseApplication
             */
            abstract main(): void;
            /**
             * Application specific menu definition
             *
             * @protected
             * @returns {GUI.BasicItemType[]}
             * @memberof BaseApplication
             */
            protected menu(): GUI.BasicItemType[];
            /**
             * The cleanup function that is called by [[onexit]] function.
             * Application need to override this function to perform some
             * specific task before exiting or to prevent the application
             * to be exited
             *
             * @protected
             * @param {BaseEvent} e
             * @memberof BaseApplication
             */
            protected cleanup(e: BaseEvent): void;
        }
    }
}
/**
 * Reference to the global this
 */
declare const Ant: typeof globalThis;
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
     * Escape the current string using backslash
     *
     * @returns {string}
     * @memberof String
     */
    escape(): string;
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
    trimFromLeft(arg: string): string;
    /**
     * Trim right of a string by a mask string
     *
     * @param {string} arg specifies a sub-string to be removed
     * @returns {string}
     * @memberof String
     */
    trimFromRight(arg: string): string;
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
declare namespace OS {
    /**
     * Represent a translatable formatted string
     *
     * @export
     * @class FormattedString
     */
    class FormattedString {
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
        constructor(fs: string, args: any[]);
        /**
         * Convert FormattedString to String
         *
         * @returns {string}
         * @memberof FormattedString
         */
        toString(): string;
        /**
         * Translate the format string to the current system
         * locale language, format the string with values and
         * then converted it to normal `string`
         *
         * @returns {string}
         * @memberof FormattedString
         */
        __(): string;
        /**
         * Return the hash number of the formatted string
         *
         * @returns {number}
         * @memberof FormattedString
         */
        hash(): number;
        /**
         * Match the formatted string against a regular expression
         * a string pattern
         *
         * @param {(string | RegExp)} t string or regular expression
         * @returns {RegExpMatchArray}
         * @memberof FormattedString
         */
        match(t: string | RegExp): RegExpMatchArray;
        /**
         * Convert the formatted string to Base^$
         *
         * @returns {string}
         * @memberof FormattedString
         */
        asBase64(): string;
        /**
         * Un escape the formatted string
         *
         * @returns {string}
         * @memberof FormattedString
         */
        unescape(): string;
        /**
         * Escape the formatted string
         *
         * @returns {string}
         * @memberof FormattedString
         */
        escape(): string;
        /**
         * Convert the formatted string to uint8 array
         *
         * @returns {Uint8Array}
         * @memberof FormattedString
         */
        asUint8Array(): Uint8Array;
        /**
         * Input values for the format string
         *
         * @param {...any[]} args
         * @memberof FormattedString
         */
        format(...args: any[]): void;
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
    class Version {
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
        private branch;
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
        constructor(string: string);
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
        compare(o: string | Version): 0 | 1 | -1;
        /**
         * Check if the current version is newer than
         * the input version
         *
         * @param {(string | Version)} o version string or object
         * @returns {boolean}
         * @memberof Version
         */
        nt(o: string | Version): boolean;
        /**
         * Check if the current version is older than
         * the input version
         *
         * @param {(string | Version)} o version string or object
         * @returns {boolean}
         * @memberof Version
         */
        ot(o: string | Version): boolean;
        /**
         * Return itself
         *
         * @returns {Version}
         * @memberof Version
         */
        __v(): Version;
        /**
         * Convert Version object to string
         *
         * @returns {string}
         * @memberof Version
         */
        toString(): string;
    }
    /**
     * Variable represents the current AntOS version, it
     * is an instance of [[Version]]
     */
    const VERSION: Version;
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
    function register(name: string, x: PM.ModelTypeClass): void;
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
    function cleanup(): void;
    /**
     * Booting up AntOS. This function checks whether the user
     * is successfully logged in, then call [[startAntOS]], otherwise
     * it shows the login screen
     *
     * @export
     */
    function boot(): void;
    /**
     * Placeholder for all the callbacks that are called when the system
     * exits. These callbacks are useful when an application or service wants
     * to perform a particular task before shuting down the system
     */
    const cleanupHandles: {
        [index: string]: () => Promise<any>;
    };
    /**
     * Perform the system shutdown operation. This function calls all
     * clean up handles in [[cleanupHandles]], then save the system setting
     * before exiting
     *
     * @export
     */
    function exit(): void;
    /**
     * Register a callback to the system [[cleanupHandles]]
     *
     * @export
     * @param {string} n callback string name
     * @param {() => void} f the callback handle
     * @returns
     */
    function onexit(n: string, f: () => Promise<any>): () => Promise<any>;
    /**
     * The namespace API is dedicated to the definition of the core system APIs
     * used by AntOS and its applications. The following core APIs are defined:
     *
     * - The AntOS announcement system
     * - Virtual File system
     * - Virtual Database
     * - Low-level REST based client-server communication
     * - Dependencies management
     * - System utilities
     *
     * These APIs are considered as middle-ware that abstracts the client-server
     * communication and provide the application layer with a standardized APIs
     * for file/database access, system events handling (announcement), automatic
     * dependencies resolving, etc.
     */
    namespace API {
        /**
         * AntOS package meta-data type definition
         *
         * @export
         * @interface PackageMetaType
         */
        interface PackageMetaType {
            /**
             * The application class name, if the package has only services
             * this property is ignored and [[pkgname]] should be specified
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            app?: string;
            /**
             * Package name, in case of [[app]] being undefined, this property
             * need to be specified
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            pkgname?: string;
            /**
             * Package category
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            category: string;
            /**
             * Package description string
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            description: string;
            /**
             * List of services that is attached to the
             * package
             *
             * @type {string[]}
             * @memberof PackageMetaType
             */
            services?: string[];
            /**
             * CSS icon class of the package
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            iconclass?: string;
            /**
             * VFS application icon path
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            icon?: string;
            /**
             * Package information
             *
             * @type {{
             *                 author: string;
             *                 email: string;
             *                 [propName: string]: any;
             *             }}
             * @memberof PackageMetaType
             */
            info: {
                /**
                 * Author of the package
                 *
                 * @type {string}
                 */
                author: string;
                /**
                 * Author's email
                 *
                 * @type {string}
                 */
                email: string;
                [propName: string]: any;
            };
            /**
             * Application-specific locale definition. When the system locale changes,
             * translatable texts inside the application will be first translated using
             * the locale dictionary defined in the package meta-data. If no translation
             * found, the system locale dictionary is used instead.
             *
             * A local dictionary definition should be in the following format:
             *
             * ```typescript
             * {
             *      [locale_name: string]: {
             *          [origin_string]: string // translation string
             *      }
             * }
             * ```
             *
             * Example of locale dictionaries:
             *
             * ```typescript
             * {
             *      "en_GB": {
             *          "Cancel": "Cancel",
             *          "Modify": "Modify"
             *      },
             *      "fr_FR": {
             *          "Cancel": "Annuler",
             *          "Modify": "Modifier"
             *      }
             * }
             * ```
             *
             * @type {{ [index: string]: GenericObject<string> }} locale dictionaries
             * @memberof PackageMetaType
             */
            locales: {
                [index: string]: GenericObject<string>;
            };
            /**
             * Mime types supported by the packages, regular expression can be used
             * to specified a range of mimes in common
             *
             * @type {string[]}
             * @memberof PackageMetaType
             */
            mimes: string[];
            /**
             * Package (application) name
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            name: string;
            /**
             * VFS path to package installation location
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            path: string;
            /**
             * Package version, should be in a format conforming
             * to the version definition in [[Version]] class
             *
             * @type {string}
             * @memberof PackageMetaType
             */
            version: string;
            /**
             * Package dependencies, each entry is in the following format
             *
             * `package_name@version`
             *
             * Example:
             *
             * ```json
             * [
             *  "File@0.1.5-b"
             * ]
             * ```
             *
             * @type {string[]}
             * @memberof PackageMetaType
             */
            dependencies: string[];
            [propName: string]: any;
        }
        /**
         * Placeholder to store all loaded shared libraries. Once
         * a shared library is firstly loaded, its identity will be
         * stored in this variable. Based on this information, in
         * the next use of the library, the system knows that the
         * library is already loaded and ready to use.
         *
         * A shared library can be a javascript or a CSS file.
         */
        const shared: GenericObject<boolean>;
        /**
         * Placeholder for all global search handles registered to the system.
         * These callbacks will be called when user performs the search operation
         * in the spotlight UI.
         *
         * Applications can define their own search handle to provide the spotlight UI
         * with additional search results
         *
         */
        const searchHandle: GenericObject<(text: string) => any[]>;
        /**
         * Placeholder of the current system locale dictionary, the system uses
         * this dictionary to translate all translatable texts to the current
         * locale language
         */
        var lang: GenericObject<string>;
        /**
         * Re-export the system announcement [[getMID]] function to the
         * core API
         *
         * @export
         * @returns {number}
         */
        function mid(): number;
        /**
         * REST-based API.
         *
         * Perform a POST request to the server. Data exchanged
         * is in `application/json`
         *
         * @export
         * @param {string} p the server URI
         * @param {*} d data object that will be converted to JSON
         * @returns {Promise<any>} a promise on the result data
         */
        function post(p: string, d: any): Promise<any>;
        /**
         * REST-based API.
         *
         * Perform a GET request and read back the data in
         * `ArrayBuffer` (binary) format. This is useful for
         * binary data reading
         *
         * @export
         * @param {string} p resource URI
         * @returns {Promise<ArrayBuffer>} a promise on the returned binary data
         */
        function blob(p: string): Promise<ArrayBuffer>;
        /**
         * REST-based API.
         *
         * Send file to server
         *
         * @export
         * @param {string} p resource URI
         * @param {string} d VFS path of the destination file
         * @returns {Promise<any>}
         */
        function upload(p: string, d: string): Promise<any>;
        /**
         * REST-based API.
         *
         * Download a file
         *
         * @export
         * @param {string} name file name
         * @param {*} b file content
         */
        function saveblob(name: string, b: any): void;
        /**
         * Helper function to trigger the global `loading`
         * event. This event should be triggered in the
         * beginning of a heavy task
         *
         * @export
         * @param {number} q message id, see [[mid]]
         * @param {string} p message string
         */
        function loading(q: number, p: string): void;
        /**
         * Helper function to trigger the global `loaded`
         * event: This event should be triggered in the
         * end of a heavy task that has previously triggered
         * the `loading` event
         *
         * @export
         * @param {number} q the message id of the corresponding `loading` event
         * @param {string} p the message string
         * @param {string} m message status  (`OK` of `FAIL`)
         */
        function loaded(q: number, p: string, m: string): void;
        /**
         * Perform an REST GET request
         *
         * @export
         * @param {string} p the URI of the request
         * @param {string} [t=undefined] the response data type:
         * - jsonp: the response is an json object
         * - script: the response is a javascript code
         * - xm, html: the response is a XML/HTML object
         * - text: plain text
         * @returns {Promise<any>} a Promise on the requested data
         */
        function get(p: string, t?: string): Promise<any>;
        /**
         * REST-based API
         *
         * Perform a GET operation and executed the returned
         * content as javascript
         *
         * @export
         * @param {string} p URI resource
         * @returns {Promise<any>} promise on the executed content
         */
        function script(p: string): Promise<any>;
        /**
         * REST-based API
         *
         * Get the content of a global asset resource stored
         * in `os://resources/`
         *
         * @export
         * @param {string} r relative path to the resource
         * @returns {Promise<any>} promise on the returned content
         */
        function resource(r: string): Promise<any>;
        /**
         * Helper function to verify whether a shared library
         * is loaded and ready to use
         *
         * @export
         * @param {string} l path to the library
         * @returns {boolean}
         */
        function libready(l: string): boolean;
        /**
         * Load a shared library if not ready
         *
         * @export
         * @param {string} l VFS path to the library
         * @param {string} force force reload library
         * @returns {Promise<void>} a promise on the result data
         */
        function requires(l: string, force?: boolean): Promise<void>;
        /**
         * Synchronously load a list of shared libraries
         *
         * @export
         * @param {string[]} libs list of shared libraries
         * @returns {Promise<void>}
         */
        function require(libs: string[]): Promise<void>;
        /**
         * The namespace packages is dedicated to all package management
         * related APIs.
         */
        namespace packages {
            /**
             * Fetch the package meta-data from the server
             *
             * @export
             * @returns {Promise<RequestResult>} Promise on a [[RequestResult]].
             * A success request result should contain a list of [[PackageMetaType]]
             */
            function fetch(): Promise<RequestResult>;
            /**
             * Request the server to regenerate the package
             * caches
             *
             * @export
             * @returns {Promise<RequestResult>}
             */
            function cache(): Promise<RequestResult>;
        }
        /**
         * Save the current user setting
         *
         * @export
         * @returns {Promise<RequestResult>} promise on a [[RequestResult]]
         */
        function setting(): Promise<RequestResult>;
        /**
         * An apigateway allows client side to execute a custom server-side
         * script and get back the result. This gateway is particularly
         * useful in case of performing a task that is not provided by the core
         * API
         *
         * @export
         * @param {GenericObject<any>} d execution indication, provided only when ws is `false`
         * otherwise, `d` should be written directly to the websocket stream as JSON object.
         * Two possible formats of `d`:
         * ```text
         * execute an server-side script file:
         *
         * {
         *  path: [VFS path],
         *  parameters: [parameters of the server-side script]
         * }
         *
         * or, execute directly a snippet of server-side script:
         *
         * { code: [server-side script code snippet as string] }
         *
         * ```
         *
         * @param {boolean} ws flag indicate whether to use websocket for the connection
         * to the gateway API. In case of streaming data, the websocket is preferred
         * @returns {Promise<any>} a promise on the result object (any)
         */
        function apigateway(d: GenericObject<any>, ws: boolean): Promise<any>;
        /**
         * Perform the global search operation when user enter
         * text in spotlight.
         *
         * This function will call all the search handles stored
         * in [[searchHandle]] and build the search result based
         * on output of these handle
         *
         * @export
         * @param {string} text text to search
         * @returns {any[]}
         */
        function search(text: string): any[];
        /**
         * Register a search handle to the global [[searchHandle]]
         *
         * @export
         * @param {string} name handle name string
         * @param {(text: string) => any[]} fn search handle
         */
        function onsearch(name: string, fn: (text: string) => any[]): void;
        /**
         * Set the current system locale: This function will
         * find and load the locale dictionary definition file in the
         * system asset resource, then trigger the global event
         * `systemlocalechange` to translated all translatable text
         * to the target language
         *
         * @export
         * @param {string} name locale name, e.g. `en_GB`
         * @returns {Promise<any>}
         */
        function setLocale(name: string): Promise<any>;
        /**
         * Return an error Object: AntOS use this function to
         * collect information (stack trace) from user reported
         * error.
         *
         * @export
         * @param {(string | FormattedString)} n error string
         * @returns {Error}
         */
        function throwe(n: string | FormattedString): Error;
        /**
         * Set value to the system clipboard
         *
         * @export
         * @param {string} v clipboard value
         * @returns {boolean}
         */
        function setClipboard(v: string): boolean;
        /**
         * Get the clipboard data
         *
         * @export
         * @returns {Promise<any>} Promise on the clipboard data
         */
        function getClipboard(): Promise<any>;
        /**
         * A switcher object is a special object in which
         * each object's property is a boolean option. All object's
         * properties are mutual exclusive. It means that when a property
         * is set to true, all other properties will be reset to false.
         *
         * Example:
         *
         * ```typescript
         * let view = API.switcher("tree", "list", "icon")
         * view.tree = true // view.list = false and view.icon = false
         * view.list = true // view.tree = false and view.icon = false
         * ```
         *
         * @export
         * @returns {*}
         */
        function switcher(...args: string[]): any;
    }
}
/// <reference types="jquery" />
declare namespace OS {
    /**
     * Application argument type definition
     *
     * @export
     * @interface AppArgumentsType
     */
    interface AppArgumentsType {
        /**
         * File type to be open by the app
         *
         * @type {string}
         * @memberof AppArgumentsType
         */
        type?: string;
        /**
         * File path to be opened
         *
         * @type {string}
         * @memberof AppArgumentsType
         */
        path: string;
        /**
         * Any other object
         */
        [propName: string]: any;
    }
    /**
     * Enum definition of different model types
     *
     * @export
     * @enum {number}
     */
    enum ModelType {
        /**
         * Applications
         */
        Application = 0,
        /**
         * Services
         */
        Service = 1,
        /**
         * Sub-window such as dialogs
         */
        SubWindow = 2
    }
    /**
     * Base AntOS event definition
     *
     * @export
     * @class BaseEvent
     */
    class BaseEvent {
        /**
         * The event name placeholder
         *
         * @type {string}
         * @memberof BaseEvent
         */
        name: string;
        /**
         * Placeholder indicates whether the event is forced to
         * be happen
         *
         * @private
         * @type {boolean}
         * @memberof BaseEvent
         */
        private force;
        /**
         * Placeholder indicates whether the event is prevented.
         * This value has not effect if `force` is set to `true`
         *
         * @type {boolean}
         * @memberof BaseEvent
         */
        prevent: boolean;
        /**
         *Creates an instance of BaseEvent.
         * @param {string} name event name
         * @param {boolean} force indicates whether the event is forced
         * @memberof BaseEvent
         */
        constructor(name: string, force: boolean);
        /**
         * Prevent the current event. This function
         * has no effect if `force` is set to true
         *
         * @memberof BaseEvent
         */
        preventDefault(): void;
    }
    /**
     * The root model of all applications, dialogs or services
     * in the system
     *
     * @export
     * @abstract
     * @class BaseModel
     */
    abstract class BaseModel {
        /**
         * The class name
         *
         * @type {string}
         * @memberof BaseModel
         */
        name: string;
        /**
         * The argument of the model
         *
         * @type {AppArgumentsType[]}
         * @memberof BaseModel
         */
        args: AppArgumentsType[];
        /**
         * Each model has its own local announcement system
         * to handle all local events inside that model.
         *
         * This observable object is propagate to all the
         * UI elements ([[AFXTag]]) inside the model
         *
         * @protected
         * @type {API.Announcer}
         * @memberof BaseModel
         */
        protected _observable: API.Announcer;
        /**
         * Reference to the core API namespace
         *
         * @protected
         * @type {typeof API}
         * @memberof BaseModel
         */
        protected _api: typeof API;
        /**
         * Reference to the core GUI namespace
         *
         * @protected
         * @type {typeof GUI}
         * @memberof BaseModel
         */
        protected _gui: typeof GUI;
        /**
         * Reference to the model's dialog
         *
         * @type {GUI.BaseDialog}
         * @memberof BaseModel
         */
        dialog: GUI.BaseDialog;
        /**
         * The HTML element ID of the virtual desktop
         *
         * @protected
         * @type {HTMLElement}
         * @memberof BaseModel
         */
        protected host: HTMLElement;
        /**
         * The process number of the current model.
         * For sub-window this number is the number
         * of the parent window
         *
         * @type {number}
         * @memberof BaseModel
         */
        pid: number;
        /**
         * Reference the DOM element of the UI scheme belong to
         * this model
         *
         * @type {HTMLElement}
         * @memberof BaseModel
         */
        scheme: HTMLElement;
        /**
         * Reference to the system setting
         *
         * @protected
         * @type {typeof setting}
         * @memberof BaseModel
         */
        protected systemsetting: typeof setting;
        /**
         * Placeholder for the process creation timestamp
         *
         * @type {number}
         * @memberof BaseModel
         */
        birth: number;
        /**
         * Different model type
         *
         * @static
         * @type {ModelType}
         * @memberof BaseModel
         */
        static type: ModelType;
        /**
         * Allow singleton on this model
         *
         * @static
         * @type {boolean}
         * @memberof BaseModel
         */
        static singleton: boolean;
        /**
         * The javascript or css files that the model depends on. All dependencies
         * will be loaded before the model is rendered
         *
         * @static
         * @type {string[]} list of VFS paths of dependencies
         * @memberof BaseModel
         */
        static dependencies: string[];
        /**
         * Reference to the CSS Element of the model
         *
         * @static
         * @type {(HTMLElement | string)}
         * @memberof BaseModel
         */
        static style: HTMLElement | string;
        /**
         * Place holder for model meta-data
         *
         * @static
         * @type {API.PackageMetaType}
         * @memberof BaseModel
         */
        static meta: API.PackageMetaType;
        /**
         *Creates an instance of BaseModel.
         * @param {string} name class name
         * @param {AppArgumentsType[]} args arguments
         * @memberof BaseModel
         */
        constructor(name: string, args: AppArgumentsType[]);
        /**
         * Getter: get the local announcer object
         *
         * @readonly
         * @type {API.Announcer}
         * @memberof BaseModel
         */
        get observable(): API.Announcer;
        /**
         * Update the model locale
         *
         * @param {string} name
         * @memberof BaseModel
         */
        updateLocale(name: string): void;
        /**
         * Render the model's UI
         *
         * @protected
         * @param {string} p VFS path to the UI scheme definition
         * @returns {void}
         * @memberof BaseModel
         */
        protected render(p: string): void;
        /**
         * Exit the model
         *
         * @param {boolean} force set this value to `true` will bypass the prevented exit event by user
         * @returns {void}
         * @memberof BaseModel
         */
        quit(force: boolean): void;
        /**
         * Model meta data, need to be implemented by
         * subclasses
         *
         * @abstract
         * @returns {API.PackageMetaType}
         * @memberof BaseModel
         */
        abstract meta(): API.PackageMetaType;
        /**
         * VFS path to the model asset
         *
         * @returns {string}
         * @memberof BaseModel
         */
        path(): string;
        /**
         * Execute a server side script and get back the result
         *
         * @protected
         * @param {GenericObject<any>} cmd execution indication, should be:
         *
         * ```
         * {
         *      path?: string, // VFS path to the server side script
         *      code: string, // or server side code to be executed
         *      parameters: any // the parameters of the server side execution
         * }
         * ```
         *
         * @returns {Promise<any>}
         * @memberof BaseModel
         */
        protected call(cmd: GenericObject<any>): Promise<any>;
        /**
         * Connect to the server side api using a websocket connection
         *
         * Server side script can be execute inside the stream by writing
         * data in JSON format with the following interface
         *
         * ```
         * {
         *      path?: string, // VFS path to the server side script
         *      code: string, // or server side code to be executed
         *      parameters: any // the parameters of the server side execution
         * }
         * ```
         *
         * @protected
         * @returns {Promise<WebSocket>}
         * @memberof BaseModel
         */
        protected stream(): Promise<WebSocket>;
        /**
         * Init the model before  UI rendering
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract init(): void;
        /**
         * Main entry point after UI rendering
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract main(): void;
        /**
         * Show the model
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract show(): void;
        /**
         * Hide the model
         *
         * @abstract
         * @memberof BaseModel
         */
        abstract hide(): void;
        /**
         * Function called when the model exits
         *
         * @protected
         * @abstract
         * @param {BaseEvent} e exit event
         * @memberof BaseModel
         */
        protected abstract onexit(e: BaseEvent): void;
        /**
         * subscribe once to a local event
         *
         * @protected
         * @param {string} e name of the event
         * @param {(d: any) => void} f event callback
         * @returns {void}
         * @memberof BaseModel
         */
        protected one(e: string, f: (d: any) => void): void;
        /**
         * Subscribe to a local event
         *
         * @protected
         * @param {string} e event name
         * @param {(d: any) => void} f event callback
         * @returns {void}
         * @memberof BaseModel
         */
        protected on(e: string, f: (d: any) => void): void;
        /**
         * Unsubscribe an event
         *
         * @protected
         * @param {string} e event name or `*` (all events)
         * @param {(d: any) => void} [f] callback to be unsubscribed, can be `undefined`
         * @returns {void}
         * @memberof BaseModel
         */
        protected off(e: string, f?: (d: any) => void): void;
        /**
         * trigger a local event
         *
         * @param {string} e event name
         * @param {*} [d] event data
         * @returns {void}
         * @memberof BaseModel
         */
        trigger(e: string, d?: any): void;
        /**
         * subscribe to an event on the global announcement system
         *
         * @protected
         * @param {string} e event name
         * @param {(d: API.AnnouncementDataType<any>) => void} f event callback
         * @returns {void}
         * @memberof BaseModel
         */
        subscribe(e: string, f: (d: API.AnnouncementDataType<any>) => void): void;
        /**
         * Open a dialog
         *
         * @param {(GUI.BaseDialog | string)} d a dialog object or a dialog class name
         * @param {GenericObject<any>} [data] input data of the dialog, refer to each
         * dialog definition for the format of the input data
         * @returns {Promise<any>} A promise on the callback data of the dialog, refer
         * to each dialog definition for the format of the callback data
         * @memberof BaseModel
         */
        openDialog(d: GUI.BaseDialog | string, data?: GenericObject<any>): Promise<any>;
        /**
         * Open a [[YesNoDialog]] to confirm a task
         *
         * @protected
         * @param {GenericObject<any>} data [[YesNoDialog]] input data
         * @returns {Promise<boolean>}
         * @memberof BaseModel
         */
        protected ask(data: GenericObject<any>): Promise<boolean>;
        /**
         * Trigger a global event
         *
         * @protected
         * @param {string} t event name
         * @param {(string | FormattedString)} m event message
         * @param {any} u_data user data object if any
         * @returns {void}
         * @memberof BaseModel
         */
        protected publish(t: string, m: string | FormattedString, u_data?: any): void;
        /**
         * Publish a global notification
         *
         * @param {(string | FormattedString)} m notification string
         * @param {any} u_data user data object if any
         * @returns {void}
         * @memberof BaseModel
         */
        notify(m: string | FormattedString, data?: any): void;
        /**
         * Publish a global warning
         *
         * @param {(string | FormattedString)} m warning string
         * @returns {void}
         * @memberof BaseModel
         */
        warn(m: string | FormattedString): void;
        /**
         * Report a global error
         *
         * @param {(string | FormattedString)} m error message
         * @param {Error} [e] error object if any
         * @returns
         * @memberof BaseModel
         */
        error(m: string | FormattedString, e?: Error): void;
        /**
         * Report a global fail event
         *
         * @param {string} m fail message
         * @param {Error} [e] error object if any
         * @returns
         * @memberof BaseModel
         */
        fail(m: string, e?: Error): void;
        /**
         * Throw an error inside the model
         *
         * @returns {Error}
         * @memberof BaseModel
         */
        throwe(): Error;
        /**
         * Update the model, this will update all its UI elements
         *
         * @returns {void}
         * @memberof BaseModel
         */
        update(): void;
        /**
         * Find a HTMLElement in the UI of the model
         * using the `data-id` attribute of the element
         *
         * @protected
         * @param {string} id
         * @returns {HTMLElement}
         * @memberof BaseModel
         */
        protected find(id: string): HTMLElement;
        /**
         * Select all DOM Element inside the UI of the model
         * using JQuery selector
         *
         * @protected
         * @param {string} sel
         * @returns {HTMLElement}
         * @memberof BaseModel
         */
        protected select(sel: string): JQuery<HTMLElement>;
    }
}
declare namespace OS {
    namespace API {
        /**
         * Simple Virtual Database (VDB) application API.
         *
         * This API abstracts and provides a standard way to
         * connect to a server-side relational database (e.g. sqlite).
         *
         * Each user when connected has their own database previously
         * created. All VDB operations related to that user will be
         * performed on this database.
         *
         * The creation of user database need to be managed by the server-side API.
         * The VDB API assumes that the database already exist. All operations
         * is performed in tables level
         *
         * @export
         * @class DB
         */
        class DB {
            /**
             * A table name on the user's database
             *
             * @private
             * @type {string}
             * @memberof DB
             */
            private table;
            /**
             *Creates an instance of DB.
             * @param {string} table table name
             * @memberof DB
             */
            constructor(table: string);
            /**
             * Save data to the current table. The input
             * data must conform to the table record format.
             *
             * On the server side, if the table doest not
             * exist yet, it should be created automatically
             * by inferring the data structure of the input
             * object
             *
             * @param {GenericObject<any>} d data object represents a current table record
             * @returns {Promise<API.RequestResult>}
             * @memberof DB
             */
            save(d: GenericObject<any>): Promise<API.RequestResult>;
            /**
             * delete record(s) from the current table by
             * a conditional object
             *
             * @param {*} c conditional object, c can be:
             *
             * * a `number`: the operation will delete the record with `id = c`
             * * a `string`: The SQL string condition that selects record to delete
             * * a conditional object represents a SQL condition statement as an object,
             * example: `pid = 10 AND cid = 2` is represented by:
             *
             * ```typescript
             *  {
             *      exp: {
             *          "and": {
             *              pid: 10,
             *              cid: 2
             *          }
             *  }
             * ```
             *
             * @returns {Promise<API.RequestResult>}
             * @memberof DB
             */
            delete(c: GenericObject<any> | number | string): Promise<API.RequestResult>;
            /**
             * Get a record in the table by its primary key
             *
             * @param {number} id the primary key value
             * @returns {Promise<GenericObject<any>>} Promise on returned record data
             * @memberof DB
             */
            get(id: number): Promise<GenericObject<any>>;
            /**
             * Find records by a condition
             *
             * @param {GenericObject<any>} cond conditional object
             *
             * a conditional object represents a SQL condition statement as an object,
             * example: `pid = 10 AND cid = 2 ORDER BY date DESC` is represented by:
             *
             * ```typescript
             *  {
             *      exp: {
             *          "and": {
             *              pid: 10,
             *              cid: 2
             *          }
             *      },
             *      order: {
             *          date: "DESC"
             *      }
             *  }
             * ```
             * @returns {Promise<GenericObject<any>[]>}
             * @memberof DB
             */
            find(cond: GenericObject<any>): Promise<GenericObject<any>[]>;
        }
    }
}
declare namespace OS {
    namespace GUI {
        /**
         *
         * Interface for an application dock item
         *
         * @export
         * @interface AppDockItemType
         */
        interface AppDockItemType {
            /**
             * Reference to the application process represented
             * by the dock item
             *
             * @type {application.BaseApplication}
             * @memberof AppDockItemType
             */
            app: application.BaseApplication;
            /**
             * Reference to the DOM element of
             * the owner dock item
             *
             * @type {AFXTag}
             * @memberof AppDockItemType
             */
            domel?: AFXTag;
            [propName: string]: any;
        }
        namespace tag {
            /**
             * This class define the AntOS system application dock tag
             *
             * @export
             * @class AppDockTag
             * @extends {AFXTag}
             */
            class AppDockTag extends AFXTag {
                /**
                 * variable holds the application select event
                 * callback handle
                 *
                 * @private
                 * @type {TagEventCallback<any>}
                 * @memberof AppDockTag
                 */
                private _onappselect;
                /**
                 * Items data of the dock
                 *
                 * @private
                 * @type {AppDockItemType[]}
                 * @memberof AppDockTag
                 */
                private _items;
                /**
                 * Reference to the currently select application
                 * process in the dock
                 *
                 * @private
                 * @type {AppDockItemType}
                 * @memberof AppDockTag
                 */
                private _selectedItem;
                /**
                 *Creates an instance of AppDockTag.
                 * @memberof AppDockTag
                 */
                constructor();
                /**
                 * Implementation of the abstract function: Update the current tag.
                 * It do nothing for this tag
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof AppDockTag
                 */
                protected reload(d?: any): void;
                /**
                 * Init the tag before mounting
                 *
                 * @protected
                 * @memberof AppDockTag
                 */
                protected init(): void;
                /**
                 * The tag layout, it is empty on creation but elements will
                 * be added automatically to it in operation
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof AppDockTag
                 */
                protected layout(): TagLayoutType[];
                /**
                 * getter to get the dock items
                 *
                 * @readonly
                 * @type {AppDockItemType[]}
                 * @memberof AppDockTag
                 */
                get items(): AppDockItemType[];
                /**
                 * Setter:
                 *
                 * set the selected application in the dock
                 * this will trigger two event:
                 * - `focus`: on the selected application
                 * - `blur`: on all other applications on the dock
                 *
                 * Getter:
                 *
                 *  Get the current selected application
                 * on the dock
                 *
                 * @memberof AppDockTag
                 */
                set selectedApp(v: application.BaseApplication);
                get selectedApp(): application.BaseApplication;
                /**
                 * Get selected item of the dock
                 *
                 * @readonly
                 * @type {AppDockItemType}
                 * @memberof AppDockTag
                 */
                get selectedItem(): AppDockItemType;
                /**
                 * When a new application process is created, this function
                 * will be called to add new application entry to the dock.
                 * The added application will becomes the current selected
                 * application
                 *
                 * @param {AppDockItemType} item an application dock item entry
                 * @memberof AppDockTag
                 */
                newapp(item: AppDockItemType): void;
                /**
                 * Delete and application entry from the dock.
                 * This function will be called when an application
                 * is exit
                 *
                 * @param {BaseApplication} a the application to be removed from the dock
                 * @memberof AppDockTag
                 */
                removeapp(a: application.BaseApplication): void;
                /**
                 * Mount the current dock tag
                 *
                 * @protected
                 * @memberof AppDockTag
                 */
                protected mount(): void;
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A simple number sinner tag
             *
             * @export
             * @class NSpinnerTag
             * @extends {AFXTag}
             */
            class NSpinnerTag extends AFXTag {
                /**
                 * Placeholder for value change event handle
                 *
                 * @private
                 * @type {TagEventCallback<number>}
                 * @memberof NSpinnerTag
                 */
                private _onchange;
                /**
                 * Placeholder for the spinner data
                 *
                 * @private
                 * @type {number}
                 * @memberof NSpinnerTag
                 */
                private _value;
                /**
                 * Place holder for the spinner step
                 *
                 * @type {number}
                 * @memberof NSpinnerTag
                 */
                step: number;
                /**
                 *Creates an instance of NSpinnerTag.
                 * @memberof NSpinnerTag
                 */
                constructor();
                /**
                 * Init the spinner value to `0` and step to `1`
                 *
                 * @protected
                 * @memberof NSpinnerTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof NSpinnerTag
                 */
                protected reload(d?: any): void;
                /**
                 * Set the value change event handle
                 *
                 * @memberof NSpinnerTag
                 */
                set onvaluechange(f: TagEventCallback<number>);
                /**
                 * Mount the tag and bind basic events
                 *
                 * @protected
                 * @memberof NSpinnerTag
                 */
                protected mount(): void;
                /**
                 * Calibrate the layout of the spinner
                 *
                 * @memberof NSpinnerTag
                 */
                calibrate(): void;
                /**
                 * Setter: Set the spinner value
                 *
                 * Getter: Get the spinner value
                 *
                 * @memberof NSpinnerTag
                 */
                set value(v: number);
                get value(): number;
                /**
                 * Spinner layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof NSpinnerTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * This class defines basic AFX label tag.
             * A label contains a text and an icon (optional)
             *
             * @export
             * @class LabelTag
             * @extends {AFXTag}
             */
            class LabelTag extends AFXTag {
                /**
                 * placeholder of the text to be displayed
                 *
                 * @private
                 * @type {(string | FormattedString)}
                 * @memberof LabelTag
                 */
                private _text;
                /**
                 *Creates an instance of LabelTag.
                 * @memberof LabelTag
                 */
                constructor();
                /**
                 * this implementation does nothing in this tag
                 *
                 * @protected
                 * @memberof LabelTag
                 */
                protected mount(): void;
                /**
                 * Refresh the text in the label
                 *
                 * @protected
                 * @param {*} d
                 * @memberof LabelTag
                 */
                protected reload(d: any): void;
                /**
                 * Reset to default some property value
                 *
                 * @protected
                 * @memberof LabelTag
                 */
                protected init(): void;
                /**
                 * This implementation of the function does nothing
                 *
                 * @protected
                 * @memberof LabelTag
                 */
                protected calibrate(): void;
                /**
                 * Set the VFS path of the label icon
                 *
                 * @memberof LabelTag
                 */
                set icon(v: string);
                /**
                 * Set the CSS class of the label icon
                 *
                 * @memberof LabelTag
                 */
                set iconclass(v: string);
                /**
                 * Setter: Set the text of the label
                 *
                 * Getter: Get the text displayed on the label
                 *
                 * @memberof LabelTag
                 */
                set text(v: string | FormattedString);
                get text(): string | FormattedString;
                /**
                 * Lqbel layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof LabelTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A switch tag is basically used to visualize an boolean data value.
             *
             * @export
             * @class SwitchTag
             * @extends {AFXTag}
             */
            class SwitchTag extends AFXTag {
                /**
                 * Placeholder for the onchange event handle
                 *
                 * @private
                 * @type {TagEventCallback<boolean>}
                 * @memberof SwitchTag
                 */
                private _onchange;
                /**
                 * Setter: Turn on/off the switch
                 *
                 * Getter: Check whether the switch is turned on
                 *
                 * @memberof SwitchTag
                 */
                set swon(v: boolean);
                get swon(): boolean;
                /**
                 * Setter: Enable the switch
                 *
                 * Getter: Check whether the switch is enabled
                 *
                 * @memberof SwitchTag
                 */
                set enable(v: boolean);
                get enable(): boolean;
                /**
                 * Set the onchange event handle
                 *
                 * @memberof SwitchTag
                 */
                set onswchange(v: TagEventCallback<boolean>);
                /**
                 * Mount the tag and bind the click event to the switch
                 *
                 * @protected
                 * @memberof SwitchTag
                 */
                protected mount(): void;
                /**
                 * This function will turn the switch (on/off)
                 * and trigger the onchange event
                 *
                 * @private
                 * @param {JQuery.ClickEvent} e
                 * @returns
                 * @memberof SwitchTag
                 */
                private makechange;
                /**
                 * Tag layout definition
                 *
                 * @protected
                 * @returns
                 * @memberof SwitchTag
                 */
                protected layout(): {
                    el: string;
                    ref: string;
                }[];
                /**
                 * Init the tag:
                 * - switch is turn off
                 * - switch is enabled
                 *
                 * @protected
                 * @memberof SwitchTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SwitchTag
                 */
                protected calibrate(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SwitchTag
                 */
                protected reload(d?: any): void;
            }
        }
    }
}
/// <reference types="jquery" />
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A `resizer` tag is basically used to dynamically resize an element using mouse.
             * It is usually put inside a [[TileLayoutTag]] an can be attached to any element. Example:
             *
             * The resizer tag in the following example  will be attached to the first `afx-vbox`,
             * and allows to resize this element using mouse
             *
             * ```xml
             * <afx-hbox>
             *      <afx-vbox>...</afx-vbox>
             *      <afx-resizer></afx-resizer>
             *      <afx-vbox>...</afx-vbox>
             * </afx-hbox>
             * ```
             *
             * @export
             * @class ResizerTag
             * @extends {AFXTag}
             */
            class ResizerTag extends AFXTag {
                /**
                 * Reference to the element that this tag is attached to
                 *
                 * @private
                 * @type {*}
                 * @memberof ResizerTag
                 */
                private _resizable_el;
                /**
                 * Reference to the resize event callback
                 *
                 * @private
                 * @type {TagEventCallback<any>}
                 * @memberof ResizerTag
                 */
                private _onresize;
                /**
                 * Reference to the parent tag of the current tag.
                 * The parent tag should be an instance of a [[TileLayoutTag]]
                 * such as [[VBoxTag]] or [[HBoxTag]]
                 *
                 * @private
                 * @type {*}
                 * @memberof ResizerTag
                 */
                private _parent;
                /**
                 * Placeholder of the minimum value that
                 * the attached element can be resized
                 *
                 * @private
                 * @type {number}
                 * @memberof ResizerTag
                 */
                private _minsize;
                /**
                 *Creates an instance of ResizerTag.
                 * @memberof ResizerTag
                 */
                constructor();
                /**
                 * Set the properties of the tag to default values
                 *
                 * @protected
                 * @memberof ResizerTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ResizerTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter:
                 *
                 * Set resize direction, two possible values:
                 * - `hz` - horizontal direction, resize by width
                 * - `ve` - vertical direction, resize by height
                 *
                 * Getter:
                 *
                 * Get the resize direction
                 *
                 * @memberof ResizerTag
                 */
                set dir(v: string);
                get dir(): string;
                /**
                 * Getter : Check whether the resizer should attach to its next or previous element
                 *
                 * Setter: if `v=true` select next element as attached element of the resizer, otherwise
                 * select the previous element
                 * @readonly
                 * @type {boolean}
                 * @memberof ResizerTag
                 */
                get attachnext(): boolean;
                set attachnext(v: boolean);
                /**
                 * Setter:
                 * - set the resize event callback
                 *
                 * Getter:
                 * - get the resize event callback
                 *
                 * @memberof ResizerTag
                 */
                set onelresize(v: TagEventCallback<any>);
                get onelresize(): TagEventCallback<any>;
                /**
                 * Mount the tag to the DOM tree
                 *
                 * @protected
                 * @memberof ResizerTag
                 */
                protected mount(): void;
                /**
                 * Enable draggable on the element
                 *
                 * @private
                 * @memberof ResizerTag
                 */
                private make_draggable;
                /**
                 * Resize the attached element in the horizontal direction (width)
                 *
                 * @private
                 * @param {JQuery.MouseEventBase} e JQuery mouse event
                 * @returns {void}
                 * @memberof ResizerTag
                 */
                private horizontalResize;
                /**
                 * Resize the attached element in the vertical direction (height)
                 *
                 * @protected
                 * @param {JQuery.MouseEventBase} e JQuery mouse event
                 * @returns {void}
                 * @memberof ResizerTag
                 */
                protected verticalResize(e: JQuery.MouseEventBase): void;
                /**
                 * Layout definition of the tag, empty layout
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ResizerTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * Meta tag that represents the  virtual desktop environment.
             * In near future, we may have multiple virtual desktop environments.
             * Each desktop environment has a simple file manager and a window
             * manager that render the window in a specific order.
             *
             * @export
             * @class DesktopTag
             * @extends {FloatListTag}
             */
            class DesktopTag extends FloatListTag {
                /**
                 * internal handle to the desktop file location
                 *
                 * @private
                 * @type {API.VFS.BaseFileHandle}
                 * @memberof DesktopTag
                 */
                private file;
                /**
                 * local observer that detect if a new child element is
                 * added or removed
                 *
                 * @private
                 * @type {MutationObserver}
                 * @memberof DesktopTag
                 */
                private observer;
                /**
                 * Internal list of the current opened window
                 *
                 * @private
                 * @type {Set<WindowTag>}
                 * @memberof DesktopTag
                 */
                private window_list;
                /**
                 * Creates an instance of DesktopTag.
                 * @memberof DesktopTag
                 */
                constructor();
                /**
                 * Mount the virtual desktop to the DOM tree
                 *
                 * @protected
                 * @memberof DesktopTag
                 */
                protected mount(): void;
                /**
                 * Display all files and folders in the specific desktop location
                 *
                 * @return {*}  {Promise<any>}
                 * @memberof DesktopTag
                 */
                refresh(): Promise<any>;
                /**
                 * Remove this element from its parent
                 *
                 * @memberof DesktopTag
                 */
                remove(): void;
                /**
                 * Active a window above all other windows
                 *
                 * @private
                 * @param {WindowTag} win
                 * @memberof DesktopTag
                 */
                private selectWindow;
                /**
                 * Render all windows in order from bottom to top
                 *
                 * @private
                 * @memberof DesktopTag
                 */
                private render;
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * Tree view data type definition
             *
             * @export
             * @interface TreeViewDataType
             */
            interface TreeViewDataType {
                /**
                 * The child nodes data of the current tree node
                 *
                 * @type {TreeViewDataType[]}
                 * @memberof TreeViewDataType
                 */
                nodes?: TreeViewDataType[];
                /**
                 * Boolean indicates whether the current node is opened.
                 * Only work when the current node is not a leaf node
                 *
                 * @type {boolean}
                 * @memberof TreeViewDataType
                 */
                open?: boolean;
                /**
                 * The node's path from the root node
                 *
                 * @type {string}
                 * @memberof TreeViewDataType
                 */
                path?: string;
                /**
                 * Indicates whether this node should be selected
                 *
                 * @type {boolean}
                 * @memberof TreeViewDataType
                 */
                selected?: boolean;
                [propName: string]: any;
            }
            /**
             * Tree node event data type definition
             */
            type TreeItemEventData = TagEventDataType<TreeViewItemPrototype>;
            /**
             * Abstract prototype of a tree node. All tree node definition should
             * extend this class
             *
             * @class TreeViewItemPrototype
             * @extends {AFXTag}
             */
            abstract class TreeViewItemPrototype extends AFXTag {
                /**
                 * Node data placeholder
                 *
                 * @private
                 * @type {TreeViewDataType}
                 * @memberof TreeViewItemPrototype
                 */
                private _data;
                /**
                 * Placeholder for the indent level of the current node from root node
                 *
                 * @private
                 * @type {number}
                 * @memberof TreeViewItemPrototype
                 */
                private _indent;
                /**
                 * private event object used by current node event
                 *
                 * @private
                 * @type {TagEventType<TreeItemEventData>}
                 * @memberof TreeViewItemPrototype
                 */
                private _evt;
                /**
                 * Reference to the root node
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewItemPrototype
                 */
                treeroot: TreeViewTag;
                /**
                 * The tree path from the root node
                 *
                 * @type {string}
                 * @memberof TreeViewItemPrototype
                 */
                treepath: string;
                /**
                 * Reference to the parent node of the current node
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewItemPrototype
                 */
                parent: TreeViewTag;
                /**
                 * Placeholder for the `fetch` function of the node.
                 * This function is used to fetch the child nodes of the
                 * current nodes. This function should return a promise on
                 * a list of [[TreeViewDataType]]
                 *
                 * @memberof TreeViewItemPrototype
                 */
                fetch: (d: TreeViewItemPrototype) => Promise<TreeViewDataType[]>;
                /**
                 *Creates an instance of TreeViewItemPrototype.
                 * @memberof TreeViewItemPrototype
                 */
                constructor();
                /**
                 * Update the tree, this function
                 * is used to refresh/expand/collapse the
                 * current node based on the input parameter
                 *
                 * @protected
                 * @param {*} p string indication, the value should be:
                 * - `expand`: expand the current node
                 * - `collapse`: collapse the current node
                 * - other string: this string is considered as a tree path of a node. If this value
                 * is the value of current node tree path, the node will be refreshed. Otherwise, nothing
                 * happens
                 * @returns {void}
                 * @memberof TreeViewItemPrototype
                 */
                protected reload(p: any): void;
                /**
                 * Setter:
                 *
                 * Set the data of the current node. This will trigger the
                 * [[ondatachange]] function
                 *
                 * Getter:
                 *
                 * Get the current node's data
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set data(v: TreeViewDataType);
                get data(): TreeViewDataType;
                /**
                 * Setter:
                 *
                 * Select or unselect the current node.
                 * This will trigger the item select event
                 * on the tree root if the parameter is `true`
                 *
                 * Getter:
                 *
                 * Check whether the current node is selected
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set selected(v: boolean);
                get selected(): boolean;
                /**
                 * Setter:
                 *
                 * Refresh the current node and expands its sub tree.
                 * This function only works if the current node is not
                 * a leaf node
                 *
                 * Getter:
                 *
                 * Check whether the current node is expanded
                 *
                 * @memberof TreeViewItemPrototype
                 */
                set open(v: boolean);
                get open(): boolean;
                /**
                 * Setter: Set the current indent level of this node from the root node
                 *
                 * Getter: Get the current indent level
                 *
                 * @type {number}
                 * @memberof TreeViewItemPrototype
                 */
                get indent(): number;
                set indent(v: number);
                /**
                 * Check whether the current node is not a leaf node
                 *
                 * @private
                 * @returns {boolean}
                 * @memberof TreeViewItemPrototype
                 */
                private is_folder;
                /**
                 * Getter: Get the child nodes data of the current node
                 *
                 * Setter: Set the child nodes data of the current node
                 *
                 * @type {TreeViewDataType[]}
                 * @memberof TreeViewItemPrototype
                 */
                get nodes(): TreeViewDataType[];
                set nodes(nodes: TreeViewDataType[]);
                /**
                 * Init the tag with default properties data
                 *
                 * @protected
                 * @memberof TreeViewItemPrototype
                 */
                protected init(): void;
                /**
                 * Mount the tag and bind basic events
                 *
                 * @protected
                 * @memberof TreeViewItemPrototype
                 */
                protected mount(): void;
                /**
                 * Layout definition of a node. This function
                 * returns the definition of the base outer layout
                 * of a node. Custom inner layout of the node should
                 * be defined in the [[itemlayout]] function
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewItemPrototype
                 */
                protected layout(): TagLayoutType[];
                /**
                 * This function need to be implemented by all subclasses
                 * to define the inner layout of the node
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewItemPrototype
                 */
                protected abstract itemlayout(): TagLayoutType[];
                /**
                 * This function is called when the node data change.
                 * It needs to be implemented on all subclasses of this
                 * class
                 *
                 * @protected
                 * @abstract
                 * @memberof TreeViewItemPrototype
                 */
                protected abstract ondatachange(): void;
            }
            /**
             * SimpleTreeViewItem extends [[TreeViewItemPrototype]] and
             * define it inner layout using a [[LabelTag]]
             *
             * @export
             * @class SimpleTreeViewItem
             * @extends {TreeViewItemPrototype}
             */
            class SimpleTreeViewItem extends TreeViewItemPrototype {
                /**
                 *Creates an instance of SimpleTreeViewItem.
                 * @memberof SimpleTreeViewItem
                 */
                constructor();
                /**
                 * Refresh the label when data changed
                 *
                 * @protected
                 * @returns {void}
                 * @memberof SimpleTreeViewItem
                 */
                protected ondatachange(): void;
                /**
                 * Inner layout definition
                 *
                 * @protected
                 * @returns
                 * @memberof SimpleTreeViewItem
                 */
                protected itemlayout(): {
                    el: string;
                    ref: string;
                }[];
            }
            /**
             * A tree view widget presents a hierarchical list of nodes.
             *
             * @export
             * @class TreeViewTag
             * @extends {AFXTag}
             */
            class TreeViewTag extends AFXTag {
                /**
                 * Reference to the selected node
                 *
                 * @private
                 * @type {TreeViewItemPrototype}
                 * @memberof TreeViewTag
                 */
                private _selectedItem;
                /**
                 * Placeholder for tree select event handle
                 *
                 * @private
                 * @type {TagEventCallback<TreeItemEventData>}
                 * @memberof TreeViewTag
                 */
                private _ontreeselect;
                /**
                 * Place holder for tree double click event handle
                 *
                 * @private
                 * @type {TagEventCallback<TreeItemEventData>}
                 * @memberof TreeViewTag
                 */
                private _ontreedbclick;
                /**
                 * Placeholder for drag and drop event handle
                 *
                 * @private
                 * @type {TagEventCallback<DnDEventDataType<TreeViewTag>>}
                 * @memberof TreeViewTag
                 */
                private _ondragndrop;
                /**
                 * Tree data placeholder
                 *
                 * @private
                 * @type {TreeViewDataType}
                 * @memberof TreeViewTag
                 */
                private _data;
                /**
                 * Placeholder for private dragndrop mouse down event handle
                 *
                 * @private
                 * @memberof TreeViewTag
                 */
                private _treemousedown;
                /**
                 * Placeholder for private dragndrop mouse up event handle
                 *
                 * @private
                 * @memberof TreeViewTag
                 */
                private _treemouseup;
                /**
                 * Placeholder for private dragndrop mouse move event handle
                 *
                 * @private
                 * @memberof TreeViewTag
                 */
                private _treemousemove;
                /**
                 * Private data object passing between dragndrop mouse event
                 *
                 * @private
                 * @type {{ from: TreeViewTag; to: TreeViewTag }}
                 * @memberof TreeViewTag
                 */
                private _dnd;
                /**
                 * Reference to parent tree of the current tree.
                 * This value is undefined if the current tree is the root
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewTag
                 */
                parent: TreeViewTag;
                /**
                 * Reference to the root tree, this value is undefined
                 * if the curent tree is root
                 *
                 * @type {TreeViewTag}
                 * @memberof TreeViewTag
                 */
                treeroot: TreeViewTag;
                /**
                 * tree path of the current tree from the root
                 *
                 * @type {string}
                 * @memberof TreeViewTag
                 */
                treepath: string;
                /**
                 * Indent level of the current tree
                 *
                 * @type {number}
                 * @memberof TreeViewTag
                 */
                indent: number;
                /**
                 * Indicates whether the tree should be expanded
                 *
                 * @type {boolean}
                 * @memberof TreeViewTag
                 */
                open: boolean;
                /**
                 * Placeholder for the `fetch` function of the tree.
                 * This function is used to fetch the child nodes of the
                 * current tree. This function should return a promise on
                 * a list of [[TreeViewDataType]]
                 *
                 * @memberof TreeViewItemPrototype
                 */
                fetch: (d: TreeViewItemPrototype) => Promise<TreeViewDataType[]>;
                /**
                 *Creates an instance of TreeViewTag.
                 * @memberof TreeViewTag
                 */
                constructor();
                /**
                 * Init the tree view before mounting:
                 *
                 * @protected
                 * @memberof TreeViewTag
                 */
                protected init(): void;
                /**
                 * Layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TreeViewTag
                 */
                protected layout(): TagLayoutType[];
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TreeViewTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter: Enable/disable drag and drop event on the tree
                 *
                 * Getter: Check whether the drag and drop event is enabled
                 *
                 * @memberof TreeViewTag
                 */
                set dragndrop(v: boolean);
                get dragndrop(): boolean;
                /**
                 * Set the tree select event handle
                 *
                 * @memberof TreeViewTag
                 */
                set ontreeselect(v: TagEventCallback<TreeItemEventData>);
                /**
                 * Set the tree double click event handle
                 *
                 * @memberof TreeViewTag
                 */
                set ontreedbclick(v: TagEventCallback<TreeItemEventData>);
                /**
                 * Setter:
                 *
                 * Set the default tag name of the tree node.
                 * If there is no tag name in the node data,
                 * this value will be used when creating node.
                 *
                 * Defaut to `afx-tree-view-item`
                 *
                 * Getter:
                 *
                 * Get the default node tag name
                 *
                 * @memberof TreeViewTag
                 */
                set itemtag(v: string);
                get itemtag(): string;
                /**
                 * Unselect the selected element in the tree
                 *
                 * @memberof TreeViewTag
                 */
                unselect(): void;
                /**
                 * Setter: Set the selected node using its DOM element
                 *
                 * Getter: Get the DOM element of the selected node
                 *
                 * @type {TreeViewItemPrototype}
                 * @memberof TreeViewTag
                 */
                get selectedItem(): TreeViewItemPrototype;
                set selectedItem(v: TreeViewItemPrototype);
                /**
                 * Expand all nodes in the tree
                 *
                 * @returns {void}
                 * @memberof TreeViewTag
                 */
                expandAll(): void;
                /**
                 * Collapse all nodes in the tree
                 *
                 * @returns {void}
                 * @memberof TreeViewTag
                 */
                collapseAll(): void;
                /**
                 * This function will trigger the tree select or tree double click
                 * event
                 *
                 * @param {TagEventType} e
                 * @returns {void}
                 * @memberof TreeViewTag
                 */
                itemclick(e: TagEventType<TreeItemEventData>): void;
                /**
                 * Check whether the current tree is a root tree
                 *
                 * @returns {boolean}
                 * @memberof TreeViewTag
                 */
                is_root(): boolean;
                /**
                 * Check whether the current tree tag is a leaf
                 *
                 * @returns {boolean}
                 * @memberof TreeViewTag
                 */
                is_leaf(): boolean;
                /**
                 * Set drag and drop event handle
                 *
                 * @memberof TreeViewTag
                 */
                set ondragndrop(v: TagEventCallback<DnDEventDataType<TreeViewTag>>);
                /**
                 * Setter:
                 *
                 * Set the tree data. This operation will create
                 * all tree node elements of the current tree
                 *
                 * Getter:
                 *
                 * Get the tree data
                 *
                 * @memberof TreeViewTag
                 */
                set data(v: TreeViewDataType);
                get data(): TreeViewDataType;
                /**
                 * Mount the tree view
                 *
                 * @protected
                 * @memberof TreeViewTag
                 */
                protected mount(): void;
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * An overlay tag is a layout tag that alway stay on top of
             * the virtual desktop environment. Tile layout elements ([[VBoxTag]], [[HboxTag]])
             * can be used inside this tag to compose elements
             *
             * @export
             * @class OverlayTag
             * @extends {AFXTag}
             */
            class OverlayTag extends AFXTag {
                /**
                 * Tag width placeholder
                 *
                 * @private
                 * @type {string}
                 * @memberof OverlayTag
                 */
                private _width;
                /**
                 * Tag height place holder
                 *
                 * @private
                 * @type {string}
                 * @memberof OverlayTag
                 */
                private _height;
                /**
                 *Creates an instance of OverlayTag.
                 * @memberof OverlayTag
                 */
                constructor();
                /**
                 * Put the tag on top of the virtual desktop environment
                 *
                 * @protected
                 * @memberof OverlayTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof OverlayTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter:
                 *
                 * Set the width of the tag, the tag width should be in form of:
                 * `100px` of `80%`
                 *
                 * Getter:
                 *
                 * Get the tag width
                 *
                 * @memberof OverlayTag
                 */
                set width(v: string);
                get width(): string;
                /**
                 * Setter:
                 *
                 * Set the tag height, the tag height should be in form of:
                 * `100px` of `80%`
                 *
                 * Getter:
                 *
                 * Get the tag height
                 *
                 * @memberof OverlayTag
                 */
                set height(v: string);
                get height(): string;
                /**
                 * Calibrate the element when mounting
                 *
                 * @protected
                 * @returns {void}
                 * @memberof OverlayTag
                 */
                protected mount(): void;
                /**
                 * Calibrate the width and height of the tag
                 *
                 * @returns {void}
                 * @memberof OverlayTag
                 */
                calibrate(): void;
                /**
                 * Layout definition of the tag
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof OverlayTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        /**
         * Color type used by AFX API
         *
         * @export
         * @interface ColorType
         */
        interface ColorType {
            /**
             * Red chanel
             *
             * @type {number}
             * @memberof ColorType
             */
            r: number;
            /**
             * Green chanel
             *
             * @type {number}
             * @memberof ColorType
             */
            g: number;
            /**
             * Blue chanel
             *
             * @type {number}
             * @memberof ColorType
             */
            b: number;
            /**
             * Alpha chanel
             *
             * @type {number}
             * @memberof ColorType
             */
            a?: number;
            /**
             * color text in CSS format
             *
             * @type {string}
             * @memberof ColorType
             */
            text?: string;
            /**
             * Color in hex format
             *
             * @type {string}
             * @memberof ColorType
             */
            hex?: string;
        }
        namespace tag {
            /**
             * Class definition of Color picker widget
             *
             * @export
             * @class ColorPickerTag
             * @extends {AFXTag}
             */
            class ColorPickerTag extends AFXTag {
                /**
                 * The current selected color object
                 *
                 * @private
                 * @type {ColorType}
                 * @memberof ColorPickerTag
                 */
                private _selectedColor;
                /**
                 * placeholder for the color select event callback
                 *
                 * @private
                 * @type {TagEventCallback<ColorType>}
                 * @memberof ColorPickerTag
                 */
                private _oncolorselect;
                /**
                 * Creates an instance of ColorPickerTag.
                 * @memberof ColorPickerTag
                 */
                constructor();
                /**
                 * Init tag before mounting, do nothing
                 *
                 * @protected
                 * @memberof ColorPickerTag
                 */
                protected init(): void;
                /**
                 * Reload tag, do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ColorPickerTag
                 */
                protected reload(d?: any): void;
                /**
                 * Get selected color value
                 *
                 * @readonly
                 * @type {ColorType}
                 * @memberof ColorPickerTag
                 */
                get selectedColor(): ColorType;
                /**
                 * Set the color select event handle
                 *
                 * @memberof ColorPickerTag
                 */
                set oncolorselect(v: TagEventCallback<ColorType>);
                /**
                 * Mount the widget to DOM tree
                 *
                 * @protected
                 * @memberof ColorPickerTag
                 */
                protected mount(): void;
                /**
                 * Build the color palette
                 *
                 * @private
                 * @memberof ColorPickerTag
                 */
                private build_palette;
                /**
                 * layout definition of the widget
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ColorPickerTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
/// <reference types="jquery" />
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * Menu event data interface definition
             */
            type MenuEventData = TagEventDataType<MenuEntryTag>;
            /**
             * This class defines the abstract prototype of an menu entry.
             * Any implementation of menu entry tag should extend this class
             *
             * @export
             * @abstract
             * @class MenuEntryTag
             * @extends {AFXTag}
             */
            abstract class MenuEntryTag extends AFXTag {
                /**
                 * Data placeholder of the menu entry
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof MenuEntryTag
                 */
                private _data;
                /**
                 * placeholder of `menu entry select` event handle
                 *
                 * @private
                 * @type {TagEventCallback<MenuEventData>}
                 * @memberof MenuEntryTag
                 */
                private _onmenuselect;
                /**
                 * placeholder of `sub-menu entry select event` handle
                 *
                 * @private
                 * @type {TagEventCallback<MenuEventData>}
                 * @memberof MenuEntryTag
                 */
                private _onchildselect;
                /**
                 * Reference to the parent menu entry of current one
                 *
                 * @type {MenuEntryTag}
                 * @memberof MenuEntryTag
                 */
                parent: MenuEntryTag;
                /**
                 * Reference to the root menu entry
                 *
                 * @type {MenuTag}
                 * @memberof MenuEntryTag
                 */
                root: MenuTag;
                /**
                 *Creates an instance of MenuEntryTag.
                 * @memberof MenuEntryTag
                 */
                constructor();
                /**
                 * Init the tag before mounting
                 *
                 * @protected
                 * @memberof MenuEntryTag
                 */
                protected init(): void;
                /**
                 * Set the `menu entry select` event handle
                 *
                 * @memberof MenuEntryTag
                 */
                set onmenuselect(v: TagEventCallback<MenuEventData>);
                /**
                 * Setter: Set the `sub menu entry select` event handle
                 *
                 * Getter: get the current `sub menu entry select` event handle
                 *
                 * @memberof MenuEntryTag
                 */
                set onchildselect(v: TagEventCallback<MenuEventData>);
                get onchildselect(): TagEventCallback<MenuEventData>;
                /**
                 * Setter: Set data to the entry
                 *
                 * Getter: Get data of the current menu entry
                 *
                 * @memberof MenuEntryTag
                 */
                set data(data: GenericObject<any>);
                get data(): GenericObject<any>;
                /**
                 * Check whether the current menu entry has sub-menu
                 *
                 * @protected
                 * @returns {boolean}
                 * @memberof MenuEntryTag
                 */
                protected has_nodes(): boolean;
                /**
                 * Check whether the current menu entry is the root entry
                 *
                 * @protected
                 * @returns
                 * @memberof MenuEntryTag
                 */
                protected is_root(): boolean;
                /**
                 * Layout definition of the menu entry
                 * This function define the outer layout of the menu entry.
                 * Custom inner layout of each item implementation should
                 * be defined in [[itemlayout]]
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof MenuEntryTag
                 */
                protected layout(): TagLayoutType[];
                /**
                 * Setter: Set the sub-menu data
                 *
                 * Getter: Get the sub-menu data
                 *
                 * @memberof MenuEntryTag
                 */
                set nodes(v: GenericObject<any>[]);
                get nodes(): GenericObject<any>[];
                /**
                 * Bind some base event to the menu entry
                 *
                 * @protected
                 * @memberof MenuEntryTag
                 */
                protected mount(): void;
                /**
                 * Hide the sub-menu of the current menu entry
                 *
                 * @private
                 * @returns {void}
                 * @memberof MenuEntryTag
                 */
                private submenuoff;
                /**
                 * This function trigger two event:
                 * - the `onmenuselect` event on the current entry
                 * - the `onchildselect` event on the parent of the current entry
                 *
                 * @protected
                 * @param {JQuery.ClickEvent} e
                 * @memberof MenuEntryTag
                 */
                protected select(e: JQuery.ClickEvent): void;
                /**
                 * custom inner layout of a menu entry
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType[]}
                 * @memberof MenuEntryTag
                 */
                protected abstract itemlayout(): TagLayoutType[];
            }
            /**
             * This class extends the [[MenuEntryTag]] prototype. It inner layout is
             * defined with the following elements:
             * - a [[SwitchTag]] acts as checker or radio
             * - a [[LabelTag]] to display the content of the menu entry
             * - a `span` element that display the keyboard shortcut of the entry
             *
             * @class SimpleMenuEntryTag
             * @extends {MenuEntryTag}
             */
            class SimpleMenuEntryTag extends MenuEntryTag {
                /**
                 *Creates an instance of SimpleMenuEntryTag.
                 * @memberof SimpleMenuEntryTag
                 */
                constructor();
                /**
                 * Reset some properties to default value
                 *
                 * @protected
                 * @memberof SimpleMenuEntryTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SimpleMenuEntryTag
                 */
                protected calibrate(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SimpleMenuEntryTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter: Turn on/off the checker feature of the menu entry
                 *
                 * Getter: Check whether the checker feature is enabled on this menu entry
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set switch(v: boolean);
                get switch(): boolean;
                /**
                 * Setter: Turn on/off the radio feature of the menu entry
                 *
                 * Getter: Check whether the radio feature is enabled
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set radio(v: boolean);
                get radio(): boolean;
                /**
                 * Setter:
                 *
                 * Toggle the switch on the menu entry, this setter
                 * only works when the `checker` or `radio` feature is
                 * enabled
                 *
                 * Getter:
                 *
                 * Check whether the switch is turned on
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set checked(v: boolean);
                get checked(): boolean;
                /**
                 * Set the label icon using a VFS path
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set icon(v: string);
                /**
                 * Set the label CSS icon class
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set iconclass(v: string);
                /**
                 * Set the label text
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set text(v: string);
                /**
                 * Set the keyboard shortcut text
                 *
                 * @memberof SimpleMenuEntryTag
                 */
                set shortcut(v: string);
                /**
                 * Uncheck all sub-menu items of the current menu entry
                 * that have the radio feature enabled
                 *
                 * @returns {void}
                 * @memberof SimpleMenuEntryTag
                 */
                protected reset_radio(): void;
                /**
                 * Mount the current tag
                 *
                 * @protected
                 * @memberof SimpleMenuEntryTag
                 */
                protected mount(): void;
                /**
                 * Trigger the onmenuselect and onchildselect events
                 *
                 * @protected
                 * @param {JQuery.ClickEvent} e Mouse click event
                 * @returns {void}
                 * @memberof SimpleMenuEntryTag
                 */
                protected select(e: JQuery.ClickEvent): void;
                /**
                 * Inner item layout of the menu entry
                 *
                 * @returns
                 * @memberof SimpleMenuEntryTag
                 */
                itemlayout(): ({
                    el: string;
                    ref: string;
                    class?: undefined;
                } | {
                    el: string;
                    class: string;
                    ref: string;
                })[];
            }
            /**
             * A menu tag contains a collection of menu entries in which each
             * entry maybe a leaf entry or may contain a submenu
             *
             * @export
             * @class MenuTag
             * @extends {AFXTag}
             */
            class MenuTag extends AFXTag {
                /**
                 * Reference to the parent menu entry of the current value.
                 * This value is `undefined` in case of the current menu is
                 * the root menu
                 *
                 * @type {MenuEntryTag}
                 * @memberof MenuTag
                 */
                parent: MenuEntryTag;
                /**
                 * Reference to the root menu
                 *
                 * @type {MenuTag}
                 * @memberof MenuTag
                 */
                root: MenuTag;
                /**
                 * The `pid` of the application that attached to this menu.
                 * This value is optional
                 *
                 * @type {number}
                 * @memberof MenuTag
                 */
                pid?: number;
                /**
                 * placeholder for menu select event handle
                 *
                 * @private
                 * @type {TagEventCallback<MenuEventData>}
                 * @memberof MenuTag
                 */
                private _onmenuselect;
                /**
                 * Menu data placeholder
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof MenuTag
                 */
                private _items;
                /**
                 *Creates an instance of MenuTag.
                 * @memberof MenuTag
                 */
                constructor();
                /**
                 * Reset some properties to  default value
                 *
                 * @protected
                 * @memberof MenuTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof MenuTag
                 */
                protected calibrate(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof MenuTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter: Set the menu items data
                 *
                 * Getter: Get menu items data
                 *
                 * @memberof MenuTag
                 */
                set items(data: GenericObject<any>[]);
                get items(): GenericObject<any>[];
                /**
                 * Setter: Set whether the current menu is a context menu
                 *
                 * Getter: Check whether the current menu is a context menu
                 *
                 * @memberof MenuTag
                 */
                set context(v: boolean);
                get context(): boolean;
                /**
                 * Set menu select event handle
                 *
                 * @memberof MenuTag
                 */
                set onmenuselect(v: TagEventCallback<MenuEventData>);
                /**
                 * Setter:
                 *
                 * Set the default tag name of the menu item.
                 * If the tag is not specified in an item data,
                 * this value will be used
                 *
                 * Getter:
                 *
                 * Get the default menu entry tag name
                 *
                 * @memberof MenuTag
                 */
                set contentag(v: string);
                get contentag(): string;
                /**
                 * Get the reference to the function that triggers
                 * the menu select event
                 *
                 * @readonly
                 * @type {TagEventCallback}
                 * @memberof MenuTag
                 */
                get onmenuitemselect(): TagEventCallback<MenuEventData>;
                /**
                 * This function triggers the menu select event
                 *
                 * @private
                 * @param {TagEventType} e
                 * @memberof MenuTag
                 */
                private handleselect;
                /**
                 * Show the current menu. This function is called
                 * only if the current menu is a context menu
                 *
                 * @param {JQuery.MouseEventBase} e JQuery mouse event
                 * @returns {void}
                 * @memberof MenuTag
                 */
                show(e: JQuery.MouseEventBase): void;
                /**
                 * Test whether the current menu is the root menu
                 *
                 * @private
                 * @returns {boolean}
                 * @memberof MenuTag
                 */
                private is_root;
                /**
                 * Mount the menu tag and bind some basic events
                 *
                 * @protected
                 * @returns {void}
                 * @memberof MenuTag
                 */
                protected mount(): void;
                /**
                 * Add a menu entry to the beginning of the current
                 * menu
                 *
                 * @param {GenericObject<any>} item menu entry data
                 * @memberof MenuTag
                 */
                unshift(item: GenericObject<any>): void;
                /**
                 * Delete a menu entry
                 *
                 * @param {MenuEntryTag} item reference to the DOM element of an menu entry
                 * @memberof MenuTag
                 */
                delete(item: MenuEntryTag): void;
                /**
                 * Add an menu entry to the beginning or end of the menu
                 *
                 * @param {GenericObject<any>} item menu entry data
                 * @param {boolean} flag indicates whether the entry should be added to the beginning of the menu
                 * @returns {MenuEntryTag}
                 * @memberof MenuTag
                 */
                push(item: GenericObject<any>, flag: boolean): MenuEntryTag;
                /**
                 * Menu tag layout definition
                 *
                 * @returns
                 * @memberof MenuTag
                 */
                layout(): {
                    el: string;
                    ref: string;
                    children: ({
                        el: string;
                        class: string;
                        ref?: undefined;
                    } | {
                        el: string;
                        ref: string;
                        class?: undefined;
                    })[];
                }[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * Tag event data type definition
             */
            type TabEventData = TagEventDataType<ListViewItemTag>;
            /**
             * a TabBar allows to control a collection of tabs
             *
             * @export
             * @class TabBarTag
             * @extends {AFXTag}
             */
            export class TabBarTag extends AFXTag {
                /**
                 * Placeholder of currently selected tab index
                 *
                 * @private
                 * @type {number}
                 * @memberof TabBarTag
                 */
                private _selected;
                /**
                 * Placeholder of tab close event handle
                 *
                 * @private
                 * @memberof TabBarTag
                 */
                private _ontabclose;
                /**
                 * Placeholder of tab select event handle
                 *
                 * @private
                 * @type {TagEventCallback<TabEventData>}
                 * @memberof TabBarTag
                 */
                private _ontabselect;
                /**
                 *Creates an instance of TabBarTag.
                 * @memberof TabBarTag
                 */
                constructor();
                /**
                 * Init the tag
                 *
                 * @protected
                 * @memberof TabBarTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TabBarTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter: Enable/disable a tab to be closed
                 *
                 * Getter: Check whether tabs can be closed
                 *
                 * @memberof TabBarTag
                 */
                set closable(v: boolean);
                get closable(): boolean;
                /**
                 * Add a tab in the end of the tab bar
                 *
                 * @param {GenericObject<any>} item tab data
                 * @memberof TabBarTag
                 */
                push(item: GenericObject<any>): ListViewItemTag;
                /**
                 * Delete a tab
                 *
                 * @param {ListViewItemTag} el reference to DOM element of a tab
                 * @memberof TabBarTag
                 */
                delete(el: ListViewItemTag): void;
                /**
                 * Add a tab to the beginning of the tab bar
                 *
                 * @param {GenericObject<any>} item tab data
                 * @memberof TabBarTag
                 */
                unshift(item: GenericObject<any>): ListViewItemTag;
                /**
                 * Setter: Set tabs data
                 *
                 * Getter: Get all tabs data
                 *
                 * @memberof TabBarTag
                 */
                set items(v: GenericObject<any>[]);
                get items(): GenericObject<any>[];
                /**
                 * Setter: Select a tab by its index
                 *
                 * Getter: Get the currently selected tab
                 *
                 * @memberof TabBarTag
                 */
                set selected(v: number | number[]);
                get selected(): number | number[];
                /**
                 * Set the tab close event handle
                 *
                 * @memberof TabBarTag
                 */
                set ontabclose(v: (e: TagEventType<TabEventData>) => boolean);
                /**
                 * Set the tab select event handle
                 *
                 * @memberof TabBarTag
                 */
                set ontabselect(v: TagEventCallback<TabEventData>);
                /**
                 * Mount the tab bar and bind some basic events
                 *
                 * @protected
                 * @memberof TabBarTag
                 */
                protected mount(): void;
                /**
                 * TabBar layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TabBarTag
                 */
                protected layout(): TagLayoutType[];
            }
            export {};
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A float list is a list of items in which each
             * item can be moved (drag and drop) freely
             *
             * @export
             * @class FloatListTag
             * @extends {ListViewTag}
             */
            class FloatListTag extends ListViewTag {
                /**
                 * Update the current tag, do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof FloatListTag
                 */
                protected reload(d?: any): void;
                /**
                 * Variable that hold the onready callback of
                 * the tag. This callback will be called after
                 * the tag is mounted
                 *
                 * @private
                 * @memberof FloatListTag
                 */
                private _onready;
                /**
                 *Creates an instance of FloatListTag.
                 * @memberof FloatListTag
                 */
                constructor();
                /**
                 * set the onready callback function to the tag.
                 * This callback will be called after
                 * the tag is mounted
                 *
                 * @memberof FloatListTag
                 */
                set onready(v: (e: FloatListTag) => void);
                /**
                 * Setter:
                 *
                 * Set the direction of the list item layout.
                 * Two directions are available:
                 * - `vertical`
                 * - `horizontal`
                 *
                 * This setter acts as a DOM attribute
                 *
                 * Getter:
                 *
                 * Get the currently set direction of list
                 * item layout
                 *
                 * @memberof FloatListTag
                 */
                set dir(v: string);
                get dir(): string;
                /**
                 * Disable the dropdown option in this list
                 *
                 * @memberof FloatListTag
                 */
                set dropdown(v: boolean);
                /**
                 * Disable the list buttons configuration in this
                 * list
                 *
                 * @memberof FloatListTag
                 */
                set buttons(v: GenericObject<any>[]);
                /**
                 * Disable the `showlist` behavior in this list
                 *
                 * @protected
                 * @param {*} e
                 * @memberof FloatListTag
                 */
                protected showlist(e: any): void;
                /**
                 * Disable the `dropoff` behavior in this list
                 *
                 * @protected
                 * @param {*} e
                 * @memberof FloatListTag
                 */
                protected dropoff(e: any): void;
                /**
                 * Function called when the data of the list
                 * is changed
                 *
                 * @protected
                 * @memberof FloatListTag
                 */
                protected ondatachange(): void;
                /**
                 * Mount the list to the DOM tree
                 *
                 * @protected
                 * @returns {void}
                 * @memberof FloatListTag
                 */
                protected mount(): void;
                /**
                 * Push an element to the list
                 *
                 * @param {GenericObject<any>} v an element data
                 * @returns
                 * @memberof FloatListTag
                 */
                push(v: GenericObject<any>): ListViewItemTag;
                /**
                 * Enable drag and drop on the list
                 *
                 * @private
                 * @param {ListViewItemTag} el the list item DOM element
                 * @memberof FloatListTag
                 */
                private enable_drag;
                /**
                 * Calibrate the view of the list
                 *
                 * @memberof FloatListTag
                 */
                calibrate(): void;
            }
        }
    }
}
/**
 * Extend the Array interface with some
 * property needed by AFX API
 *
 * @interface Array
 * @template T
 */
interface Array<T> {
    /**
     * Reference to a DOM element created by AFX API,
     * this property is used by some AFX tags to refer
     * to its child element in it data object
     *
     * @type {GenericObject<any>}
     * @memberof Array
     */
    domel?: GenericObject<any>;
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A grid Row is a simple element that
             * contains a group of grid cell
             *
             * @export
             * @class GridRowTag
             * @extends {AFXTag}
             */
            class GridRowTag extends AFXTag {
                /**
                 * Data placeholder for a collection of cell data
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof GridRowTag
                 */
                data: GenericObject<any>[];
                /**
                 *Creates an instance of GridRowTag.
                 * @memberof GridRowTag
                 */
                constructor();
                /**
                 * Mount the tag, do nothing
                 *
                 * @protected
                 * @memberof GridRowTag
                 */
                protected mount(): void;
                /**
                 * Init the tag before mounting: reset the data placeholder
                 *
                 * @protected
                 * @memberof GridRowTag
                 */
                protected init(): void;
                /**
                 * Empty layout
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof GridRowTag
                 */
                protected layout(): TagLayoutType[];
                /**
                 * This function does nothing in this tag
                 *
                 * @protected
                 * @memberof GridRowTag
                 */
                protected calibrate(): void;
                /**
                 * This function does nothing in this tag
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof GridRowTag
                 */
                protected reload(d?: any): void;
            }
            /**
             * Event data used by grid cell
             */
            type CellEventData = TagEventDataType<GridCellPrototype>;
            /**
             * Prototype of any grid cell, custom grid cell
             * definition should extend and implement this
             * abstract prototype
             *
             * @export
             * @abstract
             * @class GridCellPrototype
             * @extends {AFXTag}
             */
            abstract class GridCellPrototype extends AFXTag {
                /**
                 * placeholder for cell selected event callback
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridCellPrototype
                 */
                private _oncellselect;
                /**
                 * placeholder for cell double click event callback
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridCellPrototype
                 */
                private _oncelldbclick;
                /**
                 * Data placeholder of the current cell
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof GridCellPrototype
                 */
                private _data;
                /**
                 *Creates an instance of GridCellPrototype.
                 * @memberof GridCellPrototype
                 */
                constructor();
                /**
                 * Set the cell selected event callback
                 *
                 * @memberof GridCellPrototype
                 */
                set oncellselect(v: TagEventCallback<CellEventData>);
                /**
                 * Set the cell double click event callback
                 *
                 * @memberof GridCellPrototype
                 */
                set oncelldbclick(v: TagEventCallback<CellEventData>);
                /**
                 * Setter:
                 *
                 * Set the data of the cell, this will trigger
                 * the [[ondatachange]] function
                 *
                 * Getter:
                 *
                 * Get the current cell data placeholder
                 *
                 * @memberof GridCellPrototype
                 */
                set data(v: GenericObject<any>);
                get data(): GenericObject<any>;
                /**
                 * Setter:
                 *
                 * Set/unset the current cell as selected.
                 * This will trigger the [[cellselect]]
                 * event
                 *
                 * Getter:
                 *
                 * Check whether the current cell is selected
                 *
                 * @memberof GridCellPrototype
                 */
                set selected(v: boolean);
                get selected(): boolean;
                /**
                 * Update the current cell. This will
                 * reset the cell data
                 *
                 * @protected
                 * @param {*} d
                 * @memberof GridCellPrototype
                 */
                protected reload(d: any): void;
                /**
                 * Mount the current cell to the grid
                 *
                 * @protected
                 * @memberof GridCellPrototype
                 */
                protected mount(): void;
                /**
                 * This function triggers the cell select
                 * event
                 *
                 * @private
                 * @param {TagEventType<GridCellPrototype>} e
                 * @param {boolean} flag
                 * @returns {void}
                 * @memberof GridCellPrototype
                 */
                private cellselect;
                /**
                 * Abstract function called when the cell data changed.
                 * This should be implemented by subclasses
                 *
                 * @protected
                 * @abstract
                 * @memberof GridCellPrototype
                 */
                protected abstract ondatachange(): void;
            }
            /**
             * Simple grid cell defines a grid cell with
             * an [[LabelTag]] as it cell layout
             *
             * @export
             * @class SimpleGridCellTag
             * @extends {GridCellPrototype}
             */
            class SimpleGridCellTag extends GridCellPrototype {
                /**
                 *Creates an instance of SimpleGridCellTag.
                 * @memberof SimpleGridCellTag
                 */
                constructor();
                /**
                 * Reset the label of the cell with its data
                 *
                 * @protected
                 * @memberof SimpleGridCellTag
                 */
                protected ondatachange(): void;
                /**
                 * This function do nothing in this tag
                 *
                 * @protected
                 * @memberof SimpleGridCellTag
                 */
                protected init(): void;
                /**
                 * This function do nothing in this tag
                 *
                 * @protected
                 * @memberof SimpleGridCellTag
                 */
                protected calibrate(): void;
                /**
                 * The layout of the cell with a simple [[LabelTag]]
                 *
                 * @returns
                 * @memberof SimpleGridCellTag
                 */
                layout(): {
                    el: string;
                    ref: string;
                }[];
            }
            /**
             * A Grid contains a header and a collection grid rows
             * which has the same number of cells as the number of
             * the header elements
             *
             * @export
             * @class GridViewTag
             * @extends {AFXTag}
             */
            class GridViewTag extends AFXTag {
                /**
                 * Grid header definition
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof GridViewTag
                 */
                private _header;
                /**
                 * Grid rows data placeholder
                 *
                 * @private
                 * @type {GenericObject<any>[][]}
                 * @memberof GridViewTag
                 */
                private _rows;
                /**
                 * Reference to the current selected row DOM element
                 *
                 * @private
                 * @type {GridRowTag}
                 * @memberof GridViewTag
                 */
                private _selectedRow;
                /**
                 * A collection of selected grid rows DOM element
                 *
                 * @private
                 * @type {GridRowTag[]}
                 * @memberof GridViewTag
                 */
                private _selectedRows;
                /**
                 * Reference to the current selected cell
                 *
                 * @private
                 * @type {GridCellPrototype}
                 * @memberof GridViewTag
                 */
                private _selectedCell;
                /**
                 * Cell select event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridViewTag
                 */
                private _oncellselect;
                /**
                 * Row select event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridViewTag
                 */
                private _onrowselect;
                /**
                 * Cell double click event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<CellEventData>}
                 * @memberof GridViewTag
                 */
                private _oncelldbclick;
                /**
                 * Creates an instance of GridViewTag.
                 * @memberof GridViewTag
                 */
                constructor();
                /**
                 * Init the grid view before mounting.
                 * Reset all the placeholders to default values
                 *
                 * @protected
                 * @memberof GridViewTag
                 */
                protected init(): void;
                /**
                 * This function does nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof GridViewTag
                 */
                protected reload(d?: any): void;
                /**
                 * set the cell select event callback
                 *
                 * @memberof GridViewTag
                 */
                set oncellselect(v: TagEventCallback<CellEventData>);
                /**
                 * set the row select event callback
                 *
                 * @memberof GridViewTag
                 */
                set onrowselect(v: TagEventCallback<CellEventData>);
                /**
                 * set the cell double click event callback
                 *
                 * @memberof GridViewTag
                 */
                set oncelldbclick(v: TagEventCallback<CellEventData>);
                /**
                 * Setter: set the tag name of the header cells
                 *
                 * Getter: get the grid header tag name
                 *
                 * @memberof GridViewTag
                 */
                set headeritem(v: string);
                get headeritem(): string;
                /**
                 * Setter: set the tag name of the grid cell
                 *
                 * Getter: get the tag name of the grid cell
                 *
                 * @memberof GridViewTag
                 */
                set cellitem(v: string);
                get cellitem(): string;
                /**
                 * Setter: set the header data
                 *
                 * Getter: get the header data placeholder
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof GridViewTag
                 */
                get header(): GenericObject<any>[];
                set header(v: GenericObject<any>[]);
                /**
                 * Get all the selected rows
                 *
                 * @readonly
                 * @type {GridRowTag[]}
                 * @memberof GridViewTag
                 */
                get selectedRows(): GridRowTag[];
                /**
                 * Get the latest selected row
                 *
                 * @readonly
                 * @type {GridRowTag}
                 * @memberof GridViewTag
                 */
                get selectedRow(): GridRowTag;
                /**
                 * Get the current selected cell
                 *
                 * @readonly
                 * @type {GridCellPrototype}
                 * @memberof GridViewTag
                 */
                get selectedCell(): GridCellPrototype;
                /**
                 * Setter: set the rows data
                 *
                 * Getter: get the rows data
                 *
                 * @memberof GridViewTag
                 */
                set rows(rows: GenericObject<any>[][]);
                get rows(): GenericObject<any>[][];
                /**
                 * Setter: activate deactivate multi-select
                 *
                 * Getter: check whether the `multiselect` option is activated
                 *
                 * @memberof GridViewTag
                 */
                set multiselect(v: boolean);
                get multiselect(): boolean;
                /**
                 * Set and Get the resizable attribute
                 *
                 * This allows to enable/disable column resize feature
                 *
                 * @memberof GridViewTag
                 */
                set resizable(v: boolean);
                get resizable(): boolean;
                /**
                 * Delete a grid rows
                 *
                 * @param {GridRowTag} row row DOM element
                 * @returns {void}
                 * @memberof GridViewTag
                 */
                delete(row: GridRowTag): void;
                /**
                 * Push a row to the grid
                 *
                 * @param {GenericObject<any>[]} row list of cell data
                 * @param {boolean} flag indicates where the row is add to beginning or end
                 * of the row
                 * @memberof GridViewTags
                 */
                push(row: GenericObject<any>[], flag: boolean): void;
                /**
                 * Unshift a row to the grid
                 *
                 * @param {GenericObject<any>[]} row list of cell data in the row
                 * @memberof GridViewTag
                 */
                unshift(row: GenericObject<any>[]): void;
                /**
                 * This function triggers the cell select event
                 *
                 * @private
                 * @param {TagEventType<CellEventData>} e event contains cell event data
                 * @param {boolean} flag indicates whether the event is double clicked
                 * @returns {void}
                 * @memberof GridViewTag
                 */
                private cellselect;
                /**
                 * This function triggers the row select event, a cell select
                 * event will also trigger this event
                 *
                 * @param {TagEventType<CellEventData>} e
                 * @returns {void}
                 * @memberof GridViewTag
                 */
                private rowselect;
                /**
                 * Check whether the grid has header
                 *
                 * @private
                 * @returns {boolean}
                 * @memberof GridViewTag
                 */
                private has_header;
                /**
                 * Calibrate the grid
                 *
                 * @protected
                 * @memberof GridViewTag
                 */
                protected calibrate(): void;
                /**
                 * Recalculate the size of each header cell, changing
                 * in header cell size will also resize the entire
                 * related column
                 *
                 * @private
                 * @returns {void}
                 * @memberof GridViewTag
                 */
                private calibrate_header;
                /**
                 * Mount the grid view tag
                 *
                 * @protected
                 * @returns {void}
                 * @memberof GridViewTag
                 */
                protected mount(): void;
                /**
                 * Layout definition of the grid view
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof GridViewTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A slider or track bar is a graphical control element with which
             * a user may set a value by moving an indicator, usually horizontally
             *
             * @class SliderTag
             * @extends {AFXTag}
             */
            class SliderTag extends AFXTag {
                /**
                 * Slider max value placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof SliderTag
                 */
                private _max;
                /**
                 * Current slider value placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof SliderTag
                 */
                private _value;
                /**
                 * Placeholder of the on change event handle
                 *
                 * @private
                 * @type {TagEventCallback<number>}
                 * @memberof SliderTag
                 */
                private _onchange;
                /**
                 * Placeholder of the on changing event handle
                 *
                 * @private
                 * @type {TagEventCallback<number>}
                 * @memberof SliderTag
                 */
                private _onchanging;
                /**
                 * Creates an instance of SliderTag.
                 * @memberof SliderTag
                 */
                constructor();
                /**
                 *  Init the default value of the slider:
                 * - `max`: 100
                 * - `value`: 0
                 *
                 * @protected
                 * @memberof SliderTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SliderTag
                 */
                protected reload(d?: any): void;
                /**
                 * Set value change event handle.
                 * This handle will be triggered when the
                 * slider indicator is released
                 *
                 * @memberof SliderTag
                 */
                set onvaluechange(f: TagEventCallback<number>);
                /**
                 * Set value changing event handle.
                 * This handle is triggered when moving the
                 * slider indicator
                 *
                 * @memberof SliderTag
                 */
                set onvaluechanging(f: TagEventCallback<number>);
                /**
                 * Setter: Enable/disable the slider
                 *
                 * Getter: Check whether the slider is enabled
                 *
                 * @memberof SliderTag
                 */
                set enable(v: boolean);
                get enable(): boolean;
                /**
                 * Setter: Set the slider value
                 *
                 * Getter: Get the current slider value
                 *
                 * @memberof SliderTag
                 */
                set value(v: number);
                get value(): number;
                /**
                 * Setter: Set the maximum value of the slider
                 *
                 * Getter: Get the maximum value of the slider
                 *
                 * @memberof SliderTag
                 */
                set max(v: number);
                get max(): number;
                /**
                 * Mount the tag and bind some basic events
                 *
                 * @protected
                 * @memberof SliderTag
                 */
                protected mount(): void;
                /**
                 * Calibrate the slide based on its value and max value
                 *
                 * @memberof SliderTag
                 */
                calibrate(): void;
                /**
                 * enable dragging on the slider indicator
                 *
                 * @private
                 * @memberof SliderTag
                 */
                private enable_dragging;
                /**
                 * Layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof SliderTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
/// <reference types="jquery" />
/**
 *
 * Extend the HTMLElement interface with some utility function need
 * by AFX API
 *
 * @interface HTMLElement
 */
interface HTMLElement {
    /**
     * Recursively update a tag and all its children
     *
     * @param {*} [d] data to send to all element in the DOM subtree
     * @memberof HTMLElement
     */
    update(d?: any): void;
    /**
     *
     * AFX will automatically bind the context menu on an HTMLElement
     * if this function is defined on that element. The function should
     * define the content of the context menu and its action
     *
     * Once the context menu is bound to the element, all context menu handle
     * defined on any child of this element will be ignored.
     *
     * @param {JQuery.MouseEventBase} e a mouse event
     * @param {OS.GUI.tag.MenuTag} m The context menu element [[MenuTag]]
     * @memberof HTMLElement
     */
    contextmenuHandle(e: JQuery.MouseEventBase, m: OS.GUI.tag.MenuTag): void;
    /**
     * Mount the element and all the children on its DOM subtree. This action
     * is performed in a top-down manner
     *
     * @memberof HTMLElement
     */
    sync(): void;
    /**
     *
     * This action allows to generated all the DOM nodes defined by all AFX tags
     * in its hierarchy.
     * It performs two operations, one top-down operation to generate all the
     * necessary DOM nodes, another bottom-up operation to init all the AFX tag
     * in the current element DOM hierarchy
     *
     * @param {OS.API.Announcer} o an AntOS observable object
     * @memberof HTMLElement
     */
    afxml(o: OS.API.Announcer): void;
    /**
     * Perform DOM generation ([[afxml]]) then mount ([[sync]]) all the
     * elements.
     *
     * @param {OS.API.Announcer} o an AntOS observable object
     * @param {boolean} [flag] indicates whether this is the top-most call of the operation
     * @memberof HTMLElement
     */
    uify(o: OS.API.Announcer, flag?: boolean): void;
    /**
     *
     *
     * @type {*}
     * @memberof HTMLElement
     */
    mozRequestFullScreen: any;
    /**
     *
     *
     * @type {*}
     * @memberof HTMLElement
     */
    webkitRequestFullscreen: any;
    /**
     *
     *
     * @type {*}
     * @memberof HTMLElement
     */
    msRequestFullscreen: any;
}
/**
 *
 *
 * @interface Document
 */
interface Document {
    mozCancelFullScreen: any;
    webkitExitFullscreen: any;
    cancelFullScreen: any;
}
declare namespace OS {
    namespace GUI {
        /**
         * [[TagLayoutType]] interface using by AFX tags to defined
         * its internal DOM hierarchy
         *
         * @export
         * @interface TagLayoutType
         */
        interface TagLayoutType {
            /**
             * Element tag name
             *
             * @type {string}
             * @memberof TagLayoutType
             */
            el: string;
            /**
             * Children layout of the current element
             *
             * @type {TagLayoutType[]}
             * @memberof TagLayoutType
             */
            children?: TagLayoutType[];
            /**
             * Reference name of the element used by AFX Tag
             *
             * @type {string}
             * @memberof TagLayoutType
             */
            ref?: string;
            /**
             * CSS class of the element
             *
             * @type {string}
             * @memberof TagLayoutType
             */
            class?: string;
            /**
             * this is the `data-id` attribute of the element,
             * can be query by the [[aid]] Tag API function.
             * Not to be confused with the DOM `id` attribute
             *
             * @type {(string | number)}
             * @memberof TagLayoutType
             */
            id?: string | number;
            /**
             * Tooltip text of the element
             *
             * @type {(string | FormattedString)}
             * @memberof TagLayoutType
             */
            tooltip?: string | FormattedString;
            /**
             * `data-width` of the element, not to be confused with
             * the `width` attribute of the DOM element
             *
             * @type {number|string}
             * @memberof TagLayoutType
             */
            width?: number | string;
            /**
             ** `data-height` of the element, not to be confused with
             * the `height` attribute of the DOM element
             *
             * @type {number|string}
             * @memberof TagLayoutType
             */
            height?: number | string;
        }
        /**
         * Data type for event issued by AFX tags
         *
         * @export
         * @interface TagEventDataType
         * @template T item template
         */
        interface TagEventDataType<T> {
            /**
             * Reference to the item involved in the event
             *
             * @type {T}
             * @memberof TagEventDataType
             */
            item?: T;
            [propName: string]: any;
        }
        /**
         * Format of the event issued by AFX tags
         *
         * @export
         * @interface TagEventType
         * @template T data type
         */
        interface TagEventType<T> {
            /**
             * `data-id` of the tag that trigger the
             * event
             *
             * @type {(number | string)}
             * @memberof TagEventType
             */
            id: number | string;
            /**
             * Data object of the event
             *
             * @type {T}
             * @memberof TagEventType
             */
            data: T;
        }
        /**
         * Drag and Drop data type sent between mouse events
         *
         * @export
         * @interface DnDEventDataType
         * @template T
         */
        interface DnDEventDataType<T> {
            /**
             * Reference to the source DOM element
             *
             * @type {T}
             * @memberof DnDEventDataType
             */
            from: T;
            /**
             * Reference to the target DOM element
             *
             * @type {T}
             * @memberof DnDEventDataType
             */
            to: T;
        }
        /**
         * Tag event callback type
         */
        type TagEventCallback<T> = (e: TagEventType<T>) => void;
        /**
         * Base abstract class for tag implementation, any AFX tag should be
         * subclass of this class
         *
         * @export
         * @abstract
         * @class AFXTag
         * @extends {HTMLElement}
         */
        abstract class AFXTag extends HTMLElement {
            /**
             * The announcer object of the tag
             *
             * @type {API.Announcer}
             * @memberof AFXTag
             */
            observable: API.Announcer;
            /**
             * Reference to some of the tag's children
             * element. This reference object is built
             * based on the `ref` property found in the
             * tag layout [[TagLayoutType]]
             *
             * @protected
             * @type {GenericObject<HTMLElement>}
             * @memberof AFXTag
             */
            protected refs: GenericObject<HTMLElement>;
            /**
             * boolean value indicated whether the tag
             * is already mounted in the DOM tree
             *
             * @protected
             * @type {boolean}
             * @memberof AFXTag
             */
            protected _mounted: boolean;
            /**
             *Creates an instance of AFXTag.
             * @memberof AFXTag
             */
            constructor();
            /**
             * This function verifies if a property name of the input object
             * corresponds to a setter of the current tag. If this is the
             * case, it sets the value of that property to the setter
             *
             * @param {GenericObject<any>} v input object
             * @memberof AFXTag
             */
            set(v: GenericObject<any>): void;
            /**
             * Setter to set the tooltip text to the current tag.
             * The text should be in the following format:
             * ```text
             * cr|cl|ct|cb: tooltip text
             * ```
             *
             * @memberof AFXTag
             */
            set tooltip(v: string);
            /**
             *
             * This function looking for a property name of the tag
             * in its prototype chain. The descriptor of the property
             * will be returned if it exists
             *
             * @private
             * @param {string} k the property name to be queried
             * @returns {PropertyDescriptor} the property descriptor or undefined
             * @memberof AFXTag
             */
            private descriptor_of;
            /**
             * Setter: set the id of the tag in string or number
             *
             * Getter: get the id of the current tag
             *
             * @memberof AFXTag
             */
            set aid(v: string | number);
            get aid(): string | number;
            /**
             * Implementation from HTMLElement interface,
             * this function mount the current tag hierarchy
             *
             * @returns {void}
             * @memberof AFXTag
             */
            sync(): void;
            /**
             * Generate the DOM hierarchy of the current tag
             *
             * @param {API.Announcer} o observable object
             * @memberof AFXTag
             */
            afxml(o: API.Announcer): void;
            /**
             * Update the current tag hierarchy
             *
             * @param {*} d any data object
             * @memberof AFXTag
             */
            update(d: any): void;
            /**
             * Init the current tag, this function
             * is called before the [[mount]] function
             *
             * @protected
             * @abstract
             * @memberof AFXTag
             */
            protected abstract init(): void;
            /**
             * Mount only the current tag
             *
             * @protected
             * @abstract
             * @memberof AFXTag
             */
            protected abstract mount(): void;
            /**
             * Layout definition of a tag
             *
             * @protected
             * @abstract
             * @returns {TagLayoutType[]} tag layout object
             * @memberof AFXTag
             */
            protected abstract layout(): TagLayoutType[];
            /**
             * Update only the current tag, this function is
             * called by [[update]] before chaining the
             * update process to its children
             *
             * @protected
             * @abstract
             * @param {*} [d]
             * @memberof AFXTag
             */
            protected abstract reload(d?: any): void;
            /**
             * This function is used to re-render the current
             * tag
             *
             * @protected
             * @memberof AFXTag
             */
            protected calibrate(): void;
            /**
             * This function parses the input layout object
             * and generates all the elements defined by
             * the tag
             *
             * @private
             * @param {TagLayoutType} tag tag layout object
             * @returns {Element} the DOM element specified by the tag layout
             * @memberof AFXTag
             */
            private mkui;
            /**
             * This function inserts or removes an attribute name
             * to/from the target element based on the input `flag`.
             *
             * @protected
             * @param {boolean} flag indicates whether the attribute name should be inserted o removed
             * @param {string} v the attribute name
             * @param {HTMLElement} [el] the target element
             * @memberof AFXTag
             */
            protected attsw(flag: boolean, v: string, el?: HTMLElement): void;
            /**
             * Insert the attribute name to the target element
             *
             * @protected
             * @param {string} v the attribute name
             * @param {HTMLElement} [el] the target element
             * @memberof AFXTag
             */
            protected atton(v: string, el?: HTMLElement): void;
            /**
             * Remove the attribute name from the target element
             *
             * @protected
             * @param {string} v attribute name
             * @param {HTMLElement} [el] the target element
             * @memberof AFXTag
             */
            protected attoff(v: string, el?: HTMLElement): void;
            /**
             * Verify if the target element has an attribute name
             *
             * @protected
             * @param {string} v attribute name
             * @param {HTMLElement} [el] target element
             * @returns {boolean}
             * @memberof AFXTag
             */
            protected hasattr(v: string, el?: HTMLElement): boolean;
        }
        /**
         * All the AFX tags are defined in this namespace,
         * these tags are defined as custom DOM elements and will be
         * stored in the `customElements` registry of the browser
         */
        namespace tag {
            /**
             * Define an AFX tag as a custom element and add it to the
             * global `customElements` registry. If the tag is redefined, i.e.
             * the tag already exists, its behavior will be updated with the
             * new definition
             *
             * @export
             * @template T all classes that extends [[AFXTag]]
             * @param {string} name name of the tag
             * @param {{ new (): T }} cls the class that defines the tag
             * @returns {void}
             */
            function define<T extends AFXTag>(name: string, cls: {
                new (): T;
            }): void;
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A WindowTag represents a virtual window element
             * used by AntOS applications and dialogs.
             *
             * @export
             * @class WindowTag
             * @extends {AFXTag}
             */
            class WindowTag extends AFXTag {
                /**
                 * The element ID of the virtual desktop element
                 *
                 * @type {string}
                 * @memberof WindowTag
                 */
                desktop: string;
                /**
                 * Window width placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof WindowTag
                 */
                private _width;
                /**
                 * Window height placeholder
                 *
                 * @private
                 * @type {number}
                 * @memberof WindowTag
                 */
                private _height;
                /**
                 * Placeholder indicates whether the current window is shown
                 *
                 * @private
                 * @type {boolean}
                 * @memberof WindowTag
                 */
                private _shown;
                /**
                 * Placeholder indicates whether the current window is maximized
                 *
                 * @private
                 * @type {boolean}
                 * @memberof WindowTag
                 */
                private _isMaxi;
                /**
                 * This placeholder stores the latest offset of the current window.
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof WindowTag
                 */
                private _history;
                /**
                 * This placeholder stores the offset of the virtual desktop element
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof WindowTag
                 */
                private _desktop_pos;
                /**
                 * Creates an instance of WindowTag.
                 * @memberof WindowTag
                 */
                constructor();
                /**
                 * blur overlay: If active the window overlay will be shown
                 * on inactive (blur event)
                 *
                 * Setter: Enable the switch
                 *
                 * Getter: Check whether the switch is enabled
                 *
                 * @memberof WindowTag
                 */
                set blur_overlay(v: boolean);
                get blur_overlay(): boolean;
                /**
                 * Init window tag
                 * - `shown`: false
                 * - `isMaxi`: false
                 * - `minimizable`: false
                 * - `resizable`: true
                 * - `apptitle`: Untitled
                 *
                 * @protected
                 * @memberof WindowTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof WindowTag
                 */
                protected calibrate(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof WindowTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter: Set the window width
                 *
                 * Getter: Get the window width
                 *
                 * @memberof WindowTag
                 */
                set width(v: number);
                get width(): number;
                /**
                 * Setter: Set the window height
                 *
                 * Getter: Get the window height
                 *
                 * @memberof WindowTag
                 */
                set height(v: number);
                get height(): number;
                /**
                 * Setter: enable/disable window minimizable
                 *
                 * getter: Check whether the window is minimizable
                 *
                 * @memberof WindowTag
                 */
                set minimizable(v: boolean);
                get minimizable(): boolean;
                /**
                 * Setter: enable/disable widow resizable
                 *
                 * Getter: Check whether the current window is resizable
                 *
                 * @memberof WindowTag
                 */
                set resizable(v: boolean);
                get resizable(): boolean;
                /**
                 * Setter: Set the window title
                 *
                 * Getter: Get window title
                 *
                 * @memberof WindowTag
                 */
                set apptitle(v: string | FormattedString);
                get apptitle(): string | FormattedString;
                /**
                 * Resize all the children of the window based on its width and height
                 *
                 * @private
                 * @memberof WindowTag
                 */
                private resize;
                /**
                 * Mount the window tag and bind basic events
                 *
                 * @protected
                 * @returns {void}
                 * @memberof WindowTag
                 */
                protected mount(): void;
                /**
                 * Set the window size
                 *
                 * @private
                 * @param {GenericObject<any>} o format: `{ w: window_width, h: window_height }`
                 * @returns {void}
                 * @memberof WindowTag
                 */
                private setsize;
                /**
                 * Enable to drag window on the virtual desktop
                 *
                 * @private
                 * @memberof WindowTag
                 */
                private enable_dragging;
                /**
                 * Enable window resize, this only works if the window
                 * is resizable
                 *
                 * @private
                 * @memberof WindowTag
                 */
                private enable_resize;
                /**
                 * Maximize the window or restore its previous width, height,
                 * and position
                 *
                 * @private
                 * @returns {void}
                 * @memberof WindowTag
                 */
                private toggle_window;
                /**
                 * Layout definition of the window tag
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof WindowTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A tile layout organize it child elements
             * in a fixed horizontal or vertical direction.
             *
             * The size of each child element is attributed based
             * on its configuration of automatically based on the
             * remaining space in the layout
             *
             *
             * @export
             * @class TileLayoutTag
             * @extends {AFXTag}
             */
            class TileLayoutTag extends AFXTag {
                /**
                 *C reates an instance of TileLayoutTag.
                 * @memberof TileLayoutTag
                 */
                constructor();
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof TileLayoutTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TileLayoutTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter: Set the name of the tile container, should be: `hbox` or `vbox`
                 *
                 * Getter: Get the name of the tile container
                 *
                 * @memberof TileLayoutTag
                 */
                set name(v: string);
                get name(): string;
                /**
                 * Setter:
                 *
                 * SET the layout direction, should be:
                 * - `row`: horizontal direction
                 * - `column`: vertical direction
                 *
                 * Getter:
                 *
                 * Get layout direction
                 *
                 * @memberof TileLayoutTag
                 */
                set dir(v: "row" | "column");
                get dir(): "row" | "column";
                /**
                 * Mount the element
                 *
                 * @protected
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                protected mount(): void;
                /**
                 * re-organize the layout
                 *
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                calibrate(): void;
                /**
                 * Organize the layout in horizontal direction, only work when
                 * the layout direction set to horizontal
                 *
                 * @private
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                private hcalibrate;
                /**
                 * Organize the layout in vertical direction, only work when
                 * the layout direction set to vertical
                 *
                 * @private
                 * @returns {void}
                 * @memberof TileLayoutTag
                 */
                private vcalibrate;
                /**
                 * Layout definition
                 *
                 * @returns
                 * @memberof TileLayoutTag
                 */
                layout(): {
                    el: string;
                    ref: string;
                }[];
            }
            /**
             * A HBox organize its child elements in horizontal direction
             *
             * @export
             * @class HBoxTag
             * @extends {TileLayoutTag}
             */
            class HBoxTag extends TileLayoutTag {
                /**
                 * Creates an instance of HBoxTag.
                 * @memberof HBoxTag
                 */
                constructor();
                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof HBoxTag
                 */
                protected mount(): void;
            }
            /**
             * A VBox organize its child elements in vertical direction
             *
             * @export
             * @class VBoxTag
             * @extends {TileLayoutTag}
             */
            class VBoxTag extends TileLayoutTag {
                /**
                 *Creates an instance of VBoxTag.
                 * @memberof VBoxTag
                 */
                constructor();
                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof VBoxTag
                 */
                protected mount(): void;
            }
        }
    }
}
/// <reference types="jquery" />
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * This tag define a basic button and its behavior
             *
             * @export
             * @class ButtonTag
             * @extends {AFXTag}
             */
            class ButtonTag extends AFXTag {
                /**
                 * Variable hold the button click callback handle
                 *
                 * @private
                 * @type {TagEventCallback<JQuery.MouseEventBase>}
                 * @memberof ButtonTag
                 */
                private _onbtclick;
                /**
                 * Custom user data
                 *
                 * @type {GenericObject<any>}
                 * @memberof ButtonTag
                 */
                data: GenericObject<any>;
                /**
                 *Creates an instance of ButtonTag.
                 * @memberof ButtonTag
                 */
                constructor();
                /**
                 * Set the click callback handle for the target button
                 *
                 * @memberof ButtonTag
                 */
                set onbtclick(v: TagEventCallback<JQuery.MouseEventBase>);
                /**
                 * Set the path to the button icon, the path should be
                 * a VFS file path
                 *
                 * @memberof ButtonTag
                 */
                set icon(v: string);
                /**
                 * Set the icon class to the button, this property
                 * allows to style the button icon using CSS
                 *
                 * @memberof ButtonTag
                 */
                set iconclass(v: string);
                /**
                 * Setter: Set the text of the button
                 *
                 * Getter: Get the current button test
                 *
                 * @memberof ButtonTag
                 */
                set text(v: string | FormattedString);
                get text(): string | FormattedString;
                /**
                 * Setter: Enable or disable the button
                 *
                 * Getter: Get the `enable` property of the button
                 *
                 * @memberof ButtonTag
                 */
                set enable(v: boolean);
                get enable(): boolean;
                /**
                 * Setter: set or remove the attribute `selected` of the button
                 *
                 * Getter: check whether the attribute `selected` of the button is set
                 *
                 * @memberof ButtonTag
                 */
                set selected(v: boolean);
                get selected(): boolean;
                /**
                 * Setter: activate or deactivate the toggle mode of the button
                 *
                 * Getter: Check whether the button is in toggle mode
                 *
                 * @memberof ButtonTag
                 */
                set toggle(v: boolean);
                get toggle(): boolean;
                /**
                 * Mount the tag
                 *
                 * @protected
                 * @memberof ButtonTag
                 */
                protected mount(): void;
                /**
                 *  Init the tag before mounting
                 *
                 * @protected
                 * @memberof ButtonTag
                 */
                protected init(): void;
                /**
                 * Re-calibrate the button, do nothing in this tag
                 *
                 * @protected
                 * @memberof ButtonTag
                 */
                protected calibrate(): void;
                /**
                 * Update the current tag, do nothing in this tag
                 *
                 * @param {*} [d]
                 * @memberof ButtonTag
                 */
                reload(d?: any): void;
                /**
                 * Button layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ButtonTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * Tag that define system calendar widget
             *
             * @export
             * @class CalendarTag
             * @extends {AFXTag}
             */
            class CalendarTag extends AFXTag {
                /**
                 * The current selected day
                 *
                 * @private
                 * @type {number}
                 * @memberof CalendarTag
                 */
                private _day;
                /**
                 * The current selected month
                 *
                 * @private
                 * @type {number}
                 * @memberof CalendarTag
                 */
                private _month;
                /**
                 * The current selected year
                 *
                 * @private
                 * @type {number}
                 * @memberof CalendarTag
                 */
                private _year;
                /**
                 * The current selected date object
                 *
                 * @private
                 * @type {Date}
                 * @memberof CalendarTag
                 */
                private _selectedDate;
                /**
                 * placeholder for date select event callback
                 *
                 * @private
                 * @type {TagEventCallback<Date>}
                 * @memberof CalendarTag
                 */
                private _ondateselect;
                /**
                 *Creates an instance of CalendarTag.
                 * @memberof CalendarTag
                 */
                constructor();
                /**
                 * Init the tag before mounting
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected init(): void;
                /**
                 * Update the current tag, doing nothing in this tag
                 *
                 * @protected
                 * @param {*} [d] any data object
                 * @memberof CalendarTag
                 */
                protected reload(d?: any): void;
                /**
                 * Get the current selected date in the widget
                 *
                 * @readonly
                 * @type {Date}
                 * @memberof CalendarTag
                 */
                get selectedDate(): Date;
                /**
                 * Set the date select event callback handle for the widget
                 *
                 * @memberof CalendarTag
                 */
                set ondateselect(v: TagEventCallback<Date>);
                /**
                 * Mount the current widget to the DOM tree
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected mount(): void;
                /**
                 * This function triggers the date select event
                 *
                 * @private
                 * @param {TagEventType} e AFX tag event data [[TagEventType]]
                 * @returns {void}
                 * @memberof CalendarTag
                 */
                private dateselect;
                /**
                 * Calibrate the layout of the tag
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected calibrate(): void;
                /**
                 * Display the previous month of the current month
                 *
                 * @private
                 * @memberof CalendarTag
                 */
                private prevmonth;
                /**
                 * Display the next month of the current month
                 *
                 * @private
                 * @returns
                 * @memberof CalendarTag
                 */
                private nextmonth;
                /**
                 * Visualize the calendar base on input date
                 *
                 * @private
                 * @param {Date} date
                 * @memberof CalendarTag
                 */
                private calendar;
                /**
                 * Layout definition of the widget
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof CalendarTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * List item event data type
             */
            type ListItemEventData = TagEventDataType<ListViewItemTag>;
            /**
             * A list item represent the individual view of an item in the [[ListView]].
             * This class is an abstract prototype class, implementation of any
             * list view item should extend it
             *
             *
             * @export
             * @abstract
             * @class ListViewItemTag
             * @extends {AFXTag}
             */
            abstract class ListViewItemTag extends AFXTag {
                /**
                 * Data placeholder for the list item
                 *
                 * @private
                 * @type {GenericObject<any>}
                 * @memberof ListViewItemTag
                 */
                private _data;
                /**
                 * placeholder for the item select event callback
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onselect;
                /**
                 * Context menu event callback handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onctxmenu;
                /**
                 * Click event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onclick;
                /**
                 * Double click event callback handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _ondbclick;
                /**
                 * Item close event callback placeholder
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewItemTag
                 */
                private _onclose;
                /**
                 *Creates an instance of ListViewItemTag.
                 * @memberof ListViewItemTag
                 */
                constructor();
                /**
                 * Setter: Turn on/off the `closable` feature of the list item
                 *
                 * Getter: Check whether the item is closable
                 *
                 * @memberof ListViewItemTag
                 */
                set closable(v: boolean);
                get closable(): boolean;
                /**
                 * Set item select event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemselect(v: TagEventCallback<ListViewItemTag>);
                /**
                 * Setter: select/unselect the current item
                 *
                 * Getter: Check whether the current item is selected
                 *
                 * @memberof ListViewItemTag
                 */
                set selected(v: boolean);
                get selected(): boolean;
                /**
                 * Set the context menu event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onctxmenu(v: TagEventCallback<ListViewItemTag>);
                /**
                 * Set the item click event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemclick(v: TagEventCallback<ListViewItemTag>);
                /**
                 * Set the item double click event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemdbclick(v: TagEventCallback<ListViewItemTag>);
                /**
                 * set the item close event handle
                 *
                 * @memberof ListViewItemTag
                 */
                set onitemclose(v: TagEventCallback<ListViewItemTag>);
                /**
                 * Mount the tag and bind some events
                 *
                 * @protected
                 * @memberof ListViewItemTag
                 */
                protected mount(): void;
                /**
                 * Layout definition of the item tag.
                 * This function define the outer layout of the item.
                 * Custom inner layout of each item implementation should
                 * be defined in [[itemlayout]]
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ListViewItemTag
                 */
                protected layout(): TagLayoutType[];
                /**
                 * Setter:
                 *
                 * Set the data of the list item. This will
                 * trigger the [[ondatachange]] function
                 *
                 * Getter:
                 *
                 * Get the data of the current list item
                 *
                 * @memberof ListViewItemTag
                 */
                set data(v: GenericObject<any>);
                get data(): GenericObject<any>;
                /**
                 * Any subclass of this class should implement this
                 * function to provide its custom item layout
                 *
                 * @protected
                 * @abstract
                 * @returns {TagLayoutType}
                 * @memberof ListViewItemTag
                 */
                protected abstract itemlayout(): TagLayoutType;
                /**
                 * This function is called when the item data is changed.
                 * It should be implemented in all subclass of this class
                 *
                 * @protected
                 * @abstract
                 * @memberof ListViewItemTag
                 */
                protected abstract ondatachange(): void;
            }
            /**
             * The layout of a simple list item contains only a
             * AFX label
             *
             * @export
             * @class SimpleListItemTag
             * @extends {ListViewItemTag}
             */
            class SimpleListItemTag extends ListViewItemTag {
                /**
                 *Creates an instance of SimpleListItemTag.
                 * @memberof SimpleListItemTag
                 */
                constructor();
                /**
                 * Reset some property to default
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected calibrate(): void;
                /**
                 * Refresh the inner label when the item data
                 * is changed
                 *
                 * @protected
                 * @returns {void}
                 * @memberof SimpleListItemTag
                 */
                protected ondatachange(): void;
                /**
                 * Re-render the list item
                 *
                 * @protected
                 * @memberof SimpleListItemTag
                 */
                protected reload(): void;
                /**
                 * List item custom layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType}
                 * @memberof SimpleListItemTag
                 */
                protected itemlayout(): TagLayoutType;
            }
            /**
             * This tag defines a traditional or a dropdown list widget.
             * It contains a collection of list items in which layout
             * of each item may be variable
             *
             * @export
             * @class ListViewTag
             * @extends {AFXTag}
             */
            class ListViewTag extends AFXTag {
                /**
                 * placeholder of list select event handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewTag
                 */
                private _onlistselect;
                /**
                 * placeholder of list double click event handle
                 *
                 * @private
                 * @type {TagEventCallback<ListItemEventData>}
                 * @memberof ListViewTag
                 */
                private _onlistdbclick;
                /**
                 * placeholder of list drag and drop event handle
                 *
                 * @private
                 * @type {TagEventCallback<DnDEventDataType<ListViewItemTag>>}
                 * @memberof ListViewTag
                 */
                private _ondragndrop;
                /**
                 * placeholder of list item close event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onitemclose;
                /**
                 * placeholder of drag and drop mouse down event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onmousedown;
                /**
                 * placeholder of drag and drop mouse up event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onmouseup;
                /**
                 * placeholder of drag and drop mouse move event handle
                 *
                 * @private
                 * @memberof ListViewTag
                 */
                private _onmousemove;
                /**
                 * Reference to the latest selected DOM item
                 *
                 * @private
                 * @type {ListViewItemTag}
                 * @memberof ListViewTag
                 */
                private _selectedItem;
                /**
                 * A collection of selected items in the list.
                 * The maximum size of this collection is 1 if
                 * the [[multiselect]] feature is disabled
                 *
                 * @private
                 * @type {ListViewItemTag[]}
                 * @memberof ListViewTag
                 */
                private _selectedItems;
                /**
                 * Data placeholder of the list
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof ListViewTag
                 */
                private _data;
                /**
                 * Event data passing between mouse event when performing
                 * drag and drop on the list
                 *
                 * @private
                 * @type {{ from: ListViewItemTag; to: ListViewItemTag }}
                 * @memberof ListViewTag
                 */
                private _dnd;
                /**
                 *Creates an instance of ListViewTag.
                 * @memberof ListViewTag
                 */
                constructor();
                /**
                 * Reset the tag's properties to the default values
                 *
                 * @protected
                 * @memberof ListViewTag
                 */
                protected init(): void;
                /**
                 * This function does nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof ListViewTag
                 */
                protected reload(d?: any): void;
                /**
                 * Setter: toggle between dropdown and traditional list
                 *
                 * Getter: Check whether the list is dropdown or traditional list
                 *
                 * @memberof ListViewTag
                 */
                set dropdown(v: boolean);
                /**
                 * Set drag and drop event handle
                 *
                 * @memberof ListViewTag
                 */
                set ondragndrop(v: TagEventCallback<DnDEventDataType<ListViewItemTag>>);
                /**
                 * Set list select event handle
                 *
                 * @memberof ListViewTag
                 */
                set onlistselect(v: TagEventCallback<ListItemEventData>);
                /**
                 * Set double click event handle
                 *
                 * @memberof ListViewTag
                 */
                set onlistdbclick(v: TagEventCallback<ListItemEventData>);
                /**
                 * Set item close event handle
                 *
                 * @memberof ListViewTag
                 */
                set onitemclose(v: (e: TagEventType<ListItemEventData>) => boolean);
                get dropdown(): boolean;
                /**
                 * Setter:
                 *
                 * Set the default tag name of list's items.
                 * If the tag name is not specified in the
                 * data of a list item, this tag will be used
                 *
                 * Getter:
                 *
                 * Get the default tag name of list item
                 *
                 * @memberof ListViewTag
                 */
                set itemtag(v: string);
                get itemtag(): string;
                /**
                 * Setter:
                 *
                 * Turn on/off of the `multiselect` feature
                 *
                 * Getter:
                 *
                 * Check whether multi-select is allowed
                 * in this list
                 *
                 * @memberof ListViewTag
                 */
                set multiselect(v: boolean);
                get multiselect(): boolean;
                /**
                 * Setter: Enable/disable drag and drop event in the list
                 *
                 * Getter: Check whether the drag and drop event is enabled
                 *
                 * @memberof ListViewTag
                 */
                set dragndrop(v: boolean);
                get dragndrop(): boolean;
                /**
                 * Set the buttons layout of the list.
                 * Button layout allows to add some custom
                 * behaviors to the list.
                 *
                 * Each button data should define the [[onbtclick]]
                 * event handle to specify the custom behavior
                 *
                 * When the list is configured as dropdown. The buttons
                 * layout will be disabled
                 *
                 * Example of a button data:
                 *
                 * ```
                 * {
                 *      text: "Button text",
                 *      icon: "home://path/to/icon.png",
                 *      iconclass: "icon-class-name",
                 *      onbtclick: (e) => console.log(e)
                 * }
                 * ```
                 *
                 * @memberof ListViewTag
                 */
                set buttons(v: GenericObject<any>[]);
                /**
                 * Getter: Get data of the list
                 *
                 * Setter: Set data to the list
                 *
                 * @type {GenericObject<any>[]}
                 * @memberof ListViewTag
                 */
                get data(): GenericObject<any>[];
                set data(data: GenericObject<any>[]);
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof ListViewTag
                 */
                protected ondatachange(): void;
                /**
                 * Setter: Select list item(s) by their indexes
                 *
                 * Getter: Get the indexes of all selected items
                 *
                 * @memberof ListViewTag
                 */
                set selected(idx: number | number[]);
                /**
                 * Get the latest selected item
                 *
                 * @readonly
                 * @type {ListViewItemTag}
                 * @memberof ListViewTag
                 */
                get selectedItem(): ListViewItemTag;
                /**
                 * Get all the selected items
                 *
                 * @readonly
                 * @type {ListViewItemTag[]}
                 * @memberof ListViewTag
                 */
                get selectedItems(): ListViewItemTag[];
                get selected(): number | number[];
                /**
                 * Add an item to the beginning of the list
                 *
                 * @param {GenericObject<any>} item
                 * @returns {ListViewItemTag} the added list item element
                 * @memberof ListViewTag
                 */
                unshift(item: GenericObject<any>): ListViewItemTag;
                /**
                 * check whether the list has data
                 *
                 * @private
                 * @param {GenericObject<any>} v
                 * @returns
                 * @memberof ListViewTag
                 */
                private has_data;
                /**
                 * Add an item to the beginning or end of the list
                 *
                 * @param {GenericObject<any>} item list item data
                 * @param {boolean} [flag] indicates whether to add the item in the beginning of the list
                 * @returns {ListViewItemTag} the added list item element
                 * @memberof ListViewTag
                 */
                push(item: GenericObject<any>, flag?: boolean): ListViewItemTag;
                /**
                 * Delete an item
                 *
                 * @param {ListViewItemTag} item item DOM element
                 * @memberof ListViewTag
                 */
                delete(item: ListViewItemTag): void;
                /**
                 * Select item next to the currently selected item.
                 * If there is no item selected, the first item will
                 * be selected
                 *
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                selectNext(): void;
                /**
                 * Select the previous item in the list.
                 *
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                selectPrev(): void;
                /**
                 * Unselect all the selected items in the list
                 *
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                unselect(): void;
                /**
                 * This function triggers the click event on an item
                 *
                 * @private
                 * @param {TagEventType} e tag event object
                 * @param {boolean} flag indicates whether this is a double click event
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                private iclick;
                /**
                 * This function triggers the double click event on an item
                 *
                 * @private
                 * @param {TagEventType} e tag event object
                 * @returns
                 * @memberof ListViewTag
                 */
                private idbclick;
                /**
                 * This function triggers the list item select event
                 *
                 * @private
                 * @param {TagEventType} e tag event object
                 * @returns
                 * @memberof ListViewTag
                 */
                private iselect;
                /**
                 * Mount the tag and bind some basic event
                 *
                 * @protected
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                protected mount(): void;
                /**
                 * This function triggers the item close event
                 *
                 * @private
                 * @param {TagEventType} e tag event object
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                private iclose;
                /**
                 * Show the dropdown list.
                 * This function is called only when the list is a dropdown
                 * list
                 *
                 * @protected
                 * @param {*} e
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                protected showlist(e: any): void;
                /**
                 * Hide the dropdown list.
                 * This function is called only when the list is a dropdown
                 * list
                 *
                 * @protected
                 * @param {*} e
                 * @memberof ListViewTag
                 */
                protected dropoff(e: any): void;
                /**
                 * calibrate the list layout
                 *
                 * @protected
                 * @returns {void}
                 * @memberof ListViewTag
                 */
                protected calibrate(): void;
                /**
                 * List view layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof ListViewTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * A system panel contains the following elements:
             * - Spotlight to access to applications menu
             * - Current focused application menu
             * - System tray for all running services running in background
             *
             * @export
             * @class SystemPanelTag
             * @extends {AFXTag}
             */
            class SystemPanelTag extends AFXTag {
                /**
                 * Reference to spotlight data
                 *
                 * @private
                 * @type {(GenericObject<string | FormattedString>)}
                 * @memberof SystemPanelTag
                 */
                private _osmenu;
                /**
                 * Placeholder indicates whether the spotlight is currently shown
                 *
                 * @private
                 * @type {boolean}
                 * @memberof SystemPanelTag
                 */
                private _view;
                /**
                 * Store pending loading task
                 *
                 * @private
                 * @type {number[]}
                 * @memberof SystemPanelTag
                 */
                private _pending_task;
                /**
                 * Loading animation check timeout
                 *
                 * @memberof SystemPanelTag
                 */
                private _loading_toh;
                /**
                 * Place holder for a private callback function
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private _cb;
                /**
                 * Place holder for system app list
                 *
                 * @private
                 * @type {GenericObject<any>[]}
                 * @memberof SystemPanelTag
                 */
                private app_list;
                /**
                 *Creates an instance of SystemPanelTag.
                 * @memberof SystemPanelTag
                 */
                constructor();
                /**
                 * Do nothing
                 *
                 * @protected
                 * @memberof SystemPanelTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof SystemPanelTag
                 */
                protected reload(d?: any): void;
                /**
                 * Attach a service to the system tray on the pannel,
                 * this operation is performed when a service is started
                 *
                 * @param {BaseService} s
                 * @returns
                 * @memberof SystemPanelTag
                 */
                attachservice(s: application.BaseService): void;
                /**
                 * Launch the selected application from the spotlight
                 * applications list
                 *
                 * @private
                 * @returns {void}
                 * @memberof SystemPanelTag
                 */
                private open;
                /**
                 * Perform spotlight search operation on keyboard event
                 *
                 * @private
                 * @param {JQuery.KeyboardEventBase} e
                 * @returns {void}
                 * @memberof SystemPanelTag
                 */
                private search;
                /**
                 * detach a service from the system tray of the panel.
                 * This function is called when the corresponding running
                 * service is killed
                 *
                 * @param {BaseService} s
                 * @memberof SystemPanelTag
                 */
                detachservice(s: application.BaseService): void;
                /**
                 * Layout definition of the panel
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof SystemPanelTag
                 */
                protected layout(): TagLayoutType[];
                /**
                 * Refresh applications list on the spotlight widget
                 * from system packages meta-data
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private refreshAppList;
                /**
                 * Show/hide the spotlight
                 *
                 * @private
                 * @param {boolean} flag
                 * @memberof SystemPanelTag
                 */
                private toggle;
                /**
                 * Calibrate the spotlight widget
                 *
                 * @memberof SystemPanelTag
                 */
                calibrate(): void;
                /**
                 * Refresh the pinned applications menu
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private RefreshPinnedApp;
                /**
                 * Check if the loading tasks ended,
                 * if it the case, stop the animation
                 *
                 * @private
                 * @memberof SystemPanelTag
                 */
                private animation_check;
                /**
                 * Mount the tag bind some basic event
                 *
                 * @protected
                 * @memberof SystemPanelTag
                 */
                protected mount(): void;
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        /**
         * Tab container data type definition
         *
         * @export
         * @interface TabContainerTabType
         */
        interface TabContainerTabType {
            /**
             * Reference to the DOM element of the current container
             *
             * @type {HTMLElement}
             * @memberof TabContainerTabType
             */
            container: HTMLElement;
            [propName: string]: any;
        }
        namespace tag {
            /**
             * A tab container allows to attach each tab on a [[TabBarTag]]
             * with a container widget. The attached container widget should be
             * composed inside a [[HBoxTag]]
             *
             * The tab bar in a tab container can be configured to display tabs
             * in horizontal (row) or vertical (column) order. Default to vertical order
             *
             * Once a tab is selected, its attached container will be shown
             *
             * @export
             * @class TabContainerTag
             * @extends {AFXTag}
             */
            class TabContainerTag extends AFXTag {
                /**
                 * Reference to the currently selected tab DOM element
                 *
                 * @private
                 * @type {TabContainerTabType}
                 * @memberof TabContainerTag
                 */
                private _selectedTab;
                /**
                 * Placeholder of the tab select event handle
                 *
                 * @private
                 * @type {TagEventCallback<TabContainerTabType>}
                 * @memberof TabContainerTag
                 */
                private _ontabselect;
                /**
                 *Creates an instance of TabContainerTag.
                 * @memberof TabContainerTag
                 */
                constructor();
                /**
                 * Init the tab bar direction to vertical (column)
                 *
                 * @protected
                 * @memberof TabContainerTag
                 */
                protected init(): void;
                /**
                 * Do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof TabContainerTag
                 */
                protected reload(d?: any): void;
                /**
                 * Set the tab select event handle
                 *
                 * @memberof TabContainerTag
                 */
                set ontabselect(f: TagEventCallback<TabContainerTabType>);
                /**
                 * Get all tab items in the container
                 *
                 * @readonly
                 * @type {TabContainerTabType[]}
                 * @memberof TabContainerTag
                 */
                get tabs(): TabContainerTabType[];
                /**
                 * Select a tab by its index
                 *
                 * @memberof TabContainerTag
                 */
                set selectedIndex(i: number);
                /**
                 * Setter:
                 *
                 * Set the tab bar direction:
                 * - `row`: horizontal direction
                 * - `column`: vertical direction
                 *
                 * Getter:
                 *
                 * Get the tab bar direction
                 *
                 * @memberof TabContainerTag
                 */
                set dir(v: "row" | "column");
                get dir(): "row" | "column";
                /**
                 * Setter:
                 *
                 * Select a tab using the its tab data type.
                 * This will show the attached container to the tab
                 *
                 * Getter:
                 *
                 * Get the tab data of the currently selected Tab
                 *
                 * @memberof TabContainerTag
                 */
                set selectedTab(v: TabContainerTabType);
                get selectedTab(): TabContainerTabType;
                /**
                 * Set the tab bar width, this function only
                 * works when the tab bar direction is set to
                 * `row`
                 *
                 * @memberof TabContainerTag
                 */
                set tabbarwidth(v: number);
                /**
                 * Set the tab bar height, this function only works
                 * when the tab bar direction is set to `column`
                 *
                 * @memberof TabContainerTag
                 */
                set tabbarheight(v: number);
                /**
                 * Add a new tab with container to the container
                 *
                 * item should be in the following format:
                 *
                 * ```ts
                 * {
                 *  text: string,
                 *  icon?: string,
                 *  iconclass?: string,
                 *  container: HTMLElement
                 * }
                 * ```
                 *
                 * @param {GenericObject<any>} item tab descriptor
                 * @param {boolean} insert insert the tab content to the container ?
                 * @returns {ListViewItemTag} the tab DOM element
                 * @memberof TabContainerTag
                 */
                addTab(item: GenericObject<any>, insert: boolean): ListViewItemTag;
                /**
                 * Remove a tab from the container
                 *
                 * @param {ListViewItemTag} tab the tab item to be removed
                 * @memberof TabContainerTag
                 */
                removeTab(tab: ListViewItemTag): void;
                /**
                 * Mount the tag and bind basic events
                 *
                 * @protected
                 * @memberof TabContainerTag
                 */
                protected mount(): void;
                /**
                 * calibrate the  tab container
                 *
                 * @memberof TabContainerTag
                 */
                calibrate(): void;
                /**
                 * Layout definition
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof TabContainerTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
declare namespace OS {
    namespace GUI {
        namespace tag {
            /**
             * Definition of system file view widget
             *
             * @export
             * @class FileViewTag
             * @extends {AFXTag}
             */
            class FileViewTag extends AFXTag {
                /**
                 * placeholder for file select event callback
                 *
                 * @private
                 * @type {TagEventCallback<API.FileInfoType>}
                 * @memberof FileViewTag
                 */
                private _onfileselect;
                /**
                 * placeholder for file open event callback
                 *
                 * @private
                 * @type {TagEventCallback<API.FileInfoType>}
                 * @memberof FileViewTag
                 */
                private _onfileopen;
                /**
                 * Reference to the currently selected file meta-data
                 *
                 * @private
                 * @type {API.FileInfoType}
                 * @memberof FileViewTag
                 */
                private _selectedFile;
                /**
                 * Data placeholder of the current working directory
                 *
                 * @private
                 * @type {API.FileInfoType[]}
                 * @memberof FileViewTag
                 */
                private _data;
                /**
                 * The path of the current working directory
                 *
                 * @private
                 * @type {string}
                 * @memberof FileViewTag
                 */
                private _path;
                /**
                 * Header definition of the widget grid view
                 *
                 * @private
                 * @type {(GenericObject<string | number>[])}
                 * @memberof FileViewTag
                 */
                private _header;
                /**
                 * placeholder for the user-specified meta-data fetch function
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private _fetch;
                /**
                 *Creates an instance of FileViewTag.
                 * @memberof FileViewTag
                 */
                constructor();
                /**
                 * Init the widget before mounting
                 *
                 * @protected
                 * @memberof FileViewTag
                 */
                protected init(): void;
                /**
                 * Update the current widget, do nothing
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof FileViewTag
                 */
                protected reload(d?: any): void;
                /**
                 * set the function that allows to fetch file entries.
                 * This handle function should return a promise on
                 * an arry of [[API.FileInfoType]]
                 *
                 * @memberof FileViewTag
                 */
                set fetch(v: (p: string) => Promise<API.FileInfoType[]>);
                /**
                 * set the callback handle for the file select event.
                 * The parameter of the callback should  be an object
                 * of type [[TagEventType]]<T> with the data type `T` is [[API.FileInfoType]]
                 *
                 * @memberof FileViewTag
                 */
                set onfileselect(e: TagEventCallback<API.FileInfoType>);
                /**
                 set the callback handle for the file open event.
                 * The parameter of the callback should  be an object
                 * of type [[TagEventType]]<T> with the data type `T` is [[API.FileInfoType]]
                 *
                 * @memberof FileViewTag
                 */
                set onfileopen(e: TagEventCallback<API.FileInfoType>);
                /**
                 * Setter:
                 *
                 * chang the view of the widget, there are three different views
                 * - `icon`
                 * - `list`
                 * - `tree`
                 *
                 * Getter:
                 *
                 * Get the current view setting of the widget
                 *
                 * @memberof FileViewTag
                 */
                set view(v: string);
                get view(): string;
                /**
                 * Setter:
                 *
                 * Turn on/off the changing current working directory feature
                 * of the widget when a directory is double clicked. If enabled,
                 * the widget will use the configured [[fetch]] function to query
                 * the content of the selected directory
                 *
                 * Getter:
                 *
                 * check whether changing current working directory feature
                 * is enabled
                 *
                 * @memberof FileViewTag
                 */
                set chdir(v: boolean);
                get chdir(): boolean;
                /**
                 * Setter : Enable or disable the status bar of the widget
                 *
                 * Getter: Check whether the status bar is enabled
                 *
                 * @memberof FileViewTag
                 */
                set status(v: boolean);
                get status(): boolean;
                /**
                 * Setter:
                 *
                 * Allow the widget to show or hide hidden file
                 *
                 * Getter:
                 *
                 * Check whether the hidden file should be shown in
                 * the widget
                 *
                 * @memberof FileViewTag
                 */
                set showhidden(v: boolean);
                get showhidden(): boolean;
                /**
                 * Get the current selected file
                 *
                 * @readonly
                 * @type {API.FileInfoType}
                 * @memberof FileViewTag
                 */
                get selectedFile(): API.FileInfoType;
                /**
                 * Setter:
                 *
                 * Set the path of the current working directory.
                 * When called the widget will refresh the current
                 * working directory using the configured [[fetch]]
                 * function
                 *
                 * Getter:
                 *
                 * Get the path of the current working directory
                 *
                 * @memberof FileViewTag
                 */
                set path(v: string);
                get path(): string;
                /**
                 * Setter: Set the data of the current working directory
                 *
                 * Getter: Get the data of the current working directory
                 *
                 * @memberof FileViewTag
                 */
                set data(v: API.FileInfoType[]);
                get data(): API.FileInfoType[];
                /**
                 * Set the file drag and drop event handle. This allows application
                 * to define custom behavior of the event
                 *
                 * @memberof FileViewTag
                 */
                set ondragndrop(v: TagEventCallback<DnDEventDataType<TreeViewTag | ListViewItemTag>>);
                /**
                 * Sort file by its type
                 *
                 * @private
                 * @param {API.FileInfoType} a
                 * @param {API.FileInfoType} b
                 * @return {*}  {number}
                 * @memberof FileViewTag
                 */
                private sortByType;
                /**
                 * sort file by its name
                 *
                 * @private
                 * @param {API.FileInfoType} a first file meta-data
                 * @param {API.FileInfoType} b second file meta-data
                 * @returns {number}
                 * @memberof FileViewTag
                 */
                private sortByName;
                /**
                 * calibrate the widget layout
                 *
                 * @memberof FileViewTag
                 */
                calibrate(): void;
                /**
                 * Refresh the list view of the widget. This function
                 * is called when the view of the widget changed to `icon`
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private refreshList;
                /**
                 * Refresh the grid view of the widget, this function is called
                 * when the view of the widget set to `list`
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private refreshGrid;
                /**
                 * Refresh the Treeview of the widget, this function is called
                 * when the view of the widget set to `tree`
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private refreshTree;
                /**
                 * Create the tree data from the list of input
                 * file meta-data
                 *
                 * @private
                 * @param {API.FileInfoType[]} data list of file meta-data
                 * @returns {TreeViewDataType[]}
                 * @memberof FileViewTag
                 */
                private getTreeData;
                /**
                 * Refresh data of the current widget view
                 *
                 * @private
                 * @returns {void}
                 * @memberof FileViewTag
                 */
                private refreshData;
                /**
                 * Switch between three view options
                 *
                 * @private
                 * @memberof FileViewTag
                 */
                private switchView;
                /**
                 * This function triggers the file select event
                 *
                 * @private
                 * @param {API.FileInfoType} e selected file meta-data
                 * @memberof FileViewTag
                 */
                private fileselect;
                /**
                 * This function triggers the file open event
                 *
                 * @private
                 * @param {API.FileInfoType} e selected file meta-data
                 * @memberof FileViewTag
                 */
                private filedbclick;
                /**
                 * Mount the widget in the DOM tree
                 *
                 * @protected
                 * @memberof FileViewTag
                 */
                protected mount(): void;
                /**
                 * Layout definition of the widget
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof FileViewTag
                 */
                protected layout(): TagLayoutType[];
            }
        }
    }
}
