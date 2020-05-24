/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS208: Avoid top-level this
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Copyright 2017-2018 Xuan Sang LE <xsang.le AT gmail DOT com>

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
class SubWindow extends this.OS.GUI.BaseModel {
    constructor(name) {
        super(name, null);
        this.parent = undefined;
        this.modal = false;
    }
        
    quit() {
        const evt = new Ant.OS.GUI.BaseEvent("exit");
        this.onexit(evt);
        if (!evt.prevent) {
            delete this.observable;
            if (this.scheme) { ($(this.scheme)).remove(); }
            if (this.dialog) { return this.dialog.quit(); }
        }
    }
    init() {}
    main() {}
    meta() {
        if (this.parent && this.parent.meta) { return this.parent.meta(); }
        return {};
    }
        
    show() {
        this.trigger('focus');
        return ($(this.scheme)).css("z-index", Ant.OS.GUI.zindex + 2);
    }
    hide() {
        return this.trigger('hide');
    }
}

SubWindow.type = 3;
this.OS.GUI.SubWindow = SubWindow;

class BaseDialog extends SubWindow {
    constructor(name) {
        super(name);
        this.handle = undefined;
    }

    onexit(e) {
        if (this.parent) { return this.parent.dialog = undefined; }
    }
}

this.OS.GUI.BaseDialog = BaseDialog;

class BasicDialog extends BaseDialog {
    constructor( name, markup) {
        super(name);
        this.markup = markup;
    }
        
    
    init() {
        if (this.markup) {
            if (typeof this.markup === "string") {
                return Ant.OS.GUI.htmlToScheme(this.markup, this, this.host);
            } else { // a file handle
                return this.render(this.markup.path);
            }
        } else if (Ant.OS.GUI.subwindows[this.name] && Ant.OS.GUI.subwindows[this.name].scheme) {
            const {
                scheme
            } = Ant.OS.GUI.subwindows[this.name];
            return Ant.OS.GUI.htmlToScheme(scheme, this, this.host);
        }
    }

    main() {
        if (this.data && this.data.title) { this.scheme.set("apptitle", this.data.title); }
        this.scheme.set("resizable", false);
        return this.scheme.set("minimizable", false);
    }
}

this.OS.GUI.BasicDialog = BasicDialog;

class PromptDialog extends BasicDialog {
    constructor() {
        super("PromptDialog");
    }
    
    main() {
        super.main();
        const $input = $(this.find("txtInput"));
        if (this.data && this.data.label) { this.find("lbl").set("text", this.data.label); }
        if (this.data && this.data.value) { $input.val(this.data.value); }

        (this.find("btnOk")).set("onbtclick", e => {
            if (this.handle) { this.handle($input.val()); }
            return this.quit();
        });
        
        (this.find("btnCancel")).set("onbtclick", e => {
            return this.quit();
        });

        $input.keyup(e => {
            if (e.which !== 13) { return; }
            if (this.handle) { this.handle($input.val()); }
            return this.quit();
        });
    
        return $input.focus();
    }
}


PromptDialog.scheme = `\
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-label data-id = "lbl" />
                <input type = "text" data-id= "txtInput" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;
this.OS.register("PromptDialog", PromptDialog);

class TextDialog extends this.OS.GUI.BasicDialog {
    constructor() {
        super("TextDialog");
    }
    
    main() {
        super.main();
        const $input = $(this.find("txtInput"));
        if (this.data && this.data.value) { $input.val(this.data.value); }

        this.find("btnOk").set("onbtclick", e => {
            const value = $input.val();
            if (!value || (value === "")) { return; }
            if (this.handle) { this.handle(value); }
            return this.quit();
        });
        
        this.find("btnCancel").set("onbtclick", e => {
            return this.quit();
        });
        
        return $input.focus();
    }
}

TextDialog.scheme = `\
<afx-app-window data-id = "TextDialog" width='400' height='300'>
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <textarea data-id= "txtInput" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;
this.OS.register("TextDialog", TextDialog);

class CalendarDialog extends BasicDialog {
    constructor() {
        super("CalendarDialog");
    }
    
    main() {
        super.main();
        (this.find("btnOk")).set("onbtclick", e => {
            const date = (this.find("cal")).get("selectedDate");
            if (!date) { return this.notify(__("Please select a day")); }
            if (this.handle) { this.handle(date); }
            return this.quit();
        });
        
        return (this.find("btnCancel")).set("onbtclick", e => {
            return this.quit();
        });
    }
}

CalendarDialog.scheme = `\
<afx-app-window  width='300' height='230' apptitle = "Calendar" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-calendar-view data-id = "cal" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;

this.OS.register("CalendarDialog", CalendarDialog);

class ColorPickerDialog extends BasicDialog {
    constructor() {
        super("ColorPickerDialog");
    }
    
    main() {
        super.main();
        (this.find("btnOk")).set("onbtclick", e => {
            const color = (this.find("cpicker")).get("selectedColor");
            if (!color) { return this.notify(__("Please select color")); }
            if (this.handle) { this.handle(color); }
            return this.quit();
        });
        
        return (this.find("btnCancel")).set("onbtclick", e => {
            return this.quit();
        });
    }
}

ColorPickerDialog.scheme = `\
<afx-app-window  width='320' height='250' apptitle = "Color picker" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-color-picker data-id = "cpicker" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;

this.OS.register("ColorPickerDialog", ColorPickerDialog);

class InfoDialog extends BasicDialog {
    constructor() {
        super("InfoDialog");
    }
        
    main() {
        super.main();
        const rows = [];
        if (this.data && this.data.title) { delete this.data.title; }
        for (let k in this.data) { const v = this.data[k]; rows.push([ { text: k }, { text: v } ]); }
        (this.find("grid")).set("header", [ { text: __("Name"), width: 70 }, { text: __("Value") } ]);
        (this.find("grid")).set("rows", rows);
        return (this.find("btnCancel")).set("onbtclick", e => {
            return this.quit();
        });
    }
}

InfoDialog.scheme = `\
<afx-app-window  width='250' height='300' apptitle = "Info" >
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-grid-view data-id = "grid" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
                <div data-height="10" />
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;

this.OS.register("InfoDialog", InfoDialog);


class YesNoDialog extends BasicDialog {
    constructor() {
        super("YesNoDialog");
    }

    main() {
        super.main();
        if (this.data) { this.find("lbl").set("*", this.data); }
        (this.find("btnYes")).set("onbtclick", e => {
            if (this.handle) { this.handle(true); }
            return this.quit();
        });
        return (this.find("btnNo")).set("onbtclick", e => {
            if (this.handle) { this.handle(false); }
            return this.quit();
        });
    }
}

YesNoDialog.scheme = `\
<afx-app-window  width='200' height='150' apptitle = "Prompt">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-label data-id = "lbl" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnYes" text = "__(Yes)" data-width = "40" />
                    <afx-button data-id = "btnNo" text = "__(No)" data-width = "40" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;
this.OS.register("YesNoDialog", YesNoDialog);

class SelectionDialog extends BasicDialog {
    constructor() {
        super("SelectionDialog");
    }
    
    main() {
        super.main();
        if (this.data && this.data.data) { (this.find("list")).set("data", this.data.data); }
        const fn = e => {
            const data = (this.find("list")).get("selectedItem");
            if (!data) { return this.notify(__("Please select an item")); }
            if (this.handle) { this.handle(data.get("data")); }
            return this.quit();
        };
        (this.find("list")).set("onlistdbclick", fn);
        (this.find("btnOk")).set("onbtclick", fn);
        
        return (this.find("btnCancel")).set("onbtclick", e => {
            return this.quit();
        });
    }
}

SelectionDialog.scheme = `\
<afx-app-window  width='250' height='300' apptitle = "Selection">
    <afx-vbox>
        <afx-hbox>
            <div data-width = "10" />
            <afx-vbox>
                <div data-height="10" />
                <afx-list-view data-id = "list" />
                <div data-height="10" />
                <afx-hbox data-height="30">
                    <div />
                    <afx-button data-id = "btnOk" text = "__(Ok)" data-width = "40" />
                    <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "50" />
                </afx-hbox>
            </afx-vbox>
            <div data-width = "10" />
        </afx-hbox>
    </afx-vbox>
</afx-app-window>\
`;
this.OS.register("SelectionDialog", SelectionDialog);

class AboutDialog extends BasicDialog {
    constructor() {
        super("AboutDialog");
    }
    main() {
        super.main();
        const mt = this.meta();
        this.scheme.set("apptitle", __("About: {0}", mt.name));
        (this.find("mylabel")).set("*", {
            icon: mt.icon,
            iconclass: mt.iconclass,
            text: `${mt.name}(v${mt.version})`
        });
        ($(this.find("mydesc"))).html(mt.description);
        // grid data for author info
        if (!mt.info) { return; }
        const rows = [];
        for (let k in mt.info) { const v = mt.info[k]; rows.push([ { text: k }, { text: v } ]); }
        (this.find("mygrid")).set("header", [ { text: "", width: 100 }, { text: "" } ]);
        (this.find("mygrid")).set("rows", rows);
        return (this.find("btnCancel")).set("onbtclick", e => {
            return this.quit();
        });
    }
}

AboutDialog.scheme = `\
<afx-app-window data-id = 'about-window'  width='300' height='200'>
    <afx-vbox>
        <div style="text-align:center; margin-top:10px;" data-height="50">
            <h3 style = "margin:0;padding:0;">
                <afx-label data-id = 'mylabel'></afx-label>
            </h3>
            <i><p style = "margin:0; padding:0" data-id = 'mydesc'></p></i>
        </div>
        <afx-hbox>
            <div data-width="10"></div>
            <afx-grid-view data-id = 'mygrid'></afx-grid-view>
        </afx-hbox>
        
        <afx-hbox data-height="30">
            <div />
            <afx-button data-id = "btnCancel" text = "__(Cancel)" data-width = "60" />
        </afx-hbox>
        <div data-height = "10"/>
    </afx-vbox>
</afx-app-window>\
`;
this.OS.register("AboutDialog", AboutDialog);

class FileDialog extends BasicDialog {
    constructor() {
        super("FileDialog");
    }
    
    main() {
        super.main();
        const fileview = this.find("fileview");
        const location = this.find("location");
        const filename = this.find("filename");
        fileview.set("fetch", path => new Promise(function(resolve, reject) {
            if (!path) { return resolve(); }
            return path.asFileHandle().read()
                .then(function(d) {
                    if (d.error) { return reject(d); }
                    return resolve(d.result);}).catch(e => reject(__e(e)));
        }));
        const setroot = path => {
            return path.asFileHandle().read().then(d => {
                if(d.error) {
                    return this.error(__("Resource not found: {0}", path));
                }
                return fileview.set("path", path);
            });
        };

        if (!this.data || !this.data.root) {
            location.set("onlistselect", function(e) {
                if (!e || !e.data.item) { return; }
                return setroot(e.data.item.get("data").path);
            });
            location.set("data", ( Array.from(this.systemsetting.VFS.mountpoints).filter((i) => i.type !== "app") ));
            if (location.get("selectedItem") === undefined) { location.set("selected", 0); }
        } else {
            $(location).hide();
            this.trigger("resize");
            setroot(this.data.root);
        }
        fileview.set("onfileselect", function(e) {
            if (e.data.type === "file") { return ($(filename)).val(e.data.filename); }
        });
        (this.find("bt-ok")).set("onbtclick", e => {
            const f = fileview.get("selectedFile");
            if (!f) { return this.notify(__("Please select a file/fofler")); }
            if (this.data && this.data.type && (this.data.type !== f.type)) {
                return this.notify(__("Please select {0} only", this.data.type));
            }
            if (this.data && this.data.mimes) {
                //verify the mime
                let m = false;
                if (f.mime) {
                    for (let v of Array.from(this.data.mimes)) {
                        if (f.mime.match((new RegExp(v, "g")))) {
                            m = true;
                            break;
                        }
                    }
                }
                if (!m) { return this.notify(__("Only {0} could be selected", this.data.mimes.join(","))); }
            }
            
            const name = $(filename).val();
            if (this.handle) { this.handle({ file: f, name }); }
            return this.quit();
        });

        (this.find("bt-cancel")).set("onbtclick", e => {
            return this.quit();
        });
        if (this.data && this.data.file) {
            ($(filename)).css("display", "block").val(this.data.file.basename || "Untitled");
            this.trigger("resize");
        }
        if (this.data && this.data.hidden) { return fileview.set("showhidden", this.data.hidden); }
    }
}

FileDialog.scheme = `\
<afx-app-window width='400' height='300'>
    <afx-hbox>
        <afx-list-view data-id = "location" dropdown = "false" data-width = "120"></afx-list-view>
        <afx-vbox>
            <afx-file-view data-id = "fileview" view="tree" status = "false"></afx-file-view>
            <input data-height = '26' type = "text" data-id = "filename" style="margin-left:5px; margin-right:5px;display:none;" /> 
            <div data-height = '30' style=' text-align:right;padding:3px;'>
                <afx-button data-id = "bt-ok" text = "__(Ok)"></afx-button>
                <afx-button data-id = "bt-cancel" text = "__(Cancel)"></afx-button>
            </div>
        </afx-vbox>
    </afx-hbox>
</afx-app-window>\
`;

this.OS.register("FileDialog", FileDialog);