/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class CommandPalette extends this.OS.GUI.BasicDialog {
    constructor() {
        super("CommandPalete", CommandPalette.scheme);
    }
        
    main() {
        super.main();
        const offset = $(".afx-window-content", this.parent.scheme).offset();
        const pw = this.parent.scheme.get("width") / 5;
        this.scheme.set("width", 3 * pw);
        $(this.scheme).offset({ top: offset.top - 2, left: offset.left + pw });
        var cb = e => {
            if (($(e.target)).closest(this.scheme).length > 0) {
                return $(this.find("searchbox")).focus();
            } else {
                $(document).unbind("mousedown", cb);
                return this.quit();
            }
        };
        $(document).on("mousedown", cb);
        $(this.find("searchbox")).focus();
        this.cmdlist = this.find("container");
        if (this.data) { this.cmdlist.set("data", (Array.from(this.data.child))); }
        $(this.cmdlist).click(e => {
            return this.selectCommand();
        });
    
        this.searchbox = this.find("searchbox");
        return ($(this.searchbox)).keyup(e => {
            return this.search(e);
        });
    }

    search(e) {
        let v;
        switch (e.which) {
            case 27:
                // escape key
                this.quit();
                if (this.data.parent && this.data.parent.run) { return this.data.parent.run(this.parent); }
                break;
            case 37:
                return e.preventDefault();
            case 38:
                this.cmdlist.selectPrev();
                return e.preventDefault();
            case 39:
                return e.preventDefault();
            case 40:
                this.cmdlist.selectNext();
                return e.preventDefault();
            case 13:
                e.preventDefault();
                return this.selectCommand();
            default:
                var text = this.searchbox.value;
                if (text.length === 2) { this.cmdlist.set("data", ((() => {
                    const result1 = [];
                    for (v of Array.from(this.data.child)) {                         result1.push(v);
                    }
                    return result1;
                })())); }
                if (text.length < 3) { return; }
                var result = [];
                var term = new RegExp(text, 'i');
                for (v of Array.from(this.data.child)) { if (v.text.match(term)) { result.push(v); } }
                return this.cmdlist.set("data", result);
        }
    }


    selectCommand() {
        const el = this.cmdlist.get("selectedItem");
        if (!el) { return; }
        el.set("selected", false);
        let result = false;
        if (this.handle) { result = this.handle({ data: { item: el } }); }
        if (!result) { return this.quit(); }
    }
}

CommandPalette.scheme = `\
<afx-app-window data-id = "cmd-win"
    apptitle="" minimizable="false"
    resizable = "false" width="200" height="200">
    <afx-vbox>
        <input data-height="25" type = "text" data-id="searchbox"/>
        <afx-list-view data-id="container"></afx-list-view>
    </afx-vbox>
</afx-app-window>\
`;