/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
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
namespace OS {
    const App = OS.application.MarketPlace;
    export type MarketPlaceRepoDialog = typeof RepositoryDialog;
    class RepositoryDialog extends OS.GUI.dialogs.SelectionDialog {
        private list: GUI.tag.ListViewTag;


        constructor() {
            super();
        }
            
        main() {
            super.main();
            this.list = this.find("list") as GUI.tag.ListViewTag;
            $((this.find("btnOk"))).hide();
            return this.list.buttons = [
                {
                    text: "+",
                    onbtclick: () => {
                        return this.openDialog("PromptDialog", {
                            title: __("Add repository"),
                            label: __("Format : [name] url")
                        }).then(e => {
                            const m = e.match(/\[([^\]]*)\]\s*(.+)/);
                            if (!m || (m.length !== 3)) {
                                return this.error(__("Wrong format: it should be [name] url"));
                            }
                            const repo = {
                                url: m[2],
                                text: m[1]
                            };
                            this.systemsetting.system.repositories.push(repo);
                            return this.list.push(repo);
                        });
                    }
                },
                {
                    text: "-",
                    onbtclick: () => {
                        const el = this.list.selectedItem;
                        if (!el) { return; }
                        const selidx = $(el).index();
                        if  (!(selidx >= 0)) { return; }
                        this.systemsetting.system.repositories.splice(selidx, selidx);
                        return this.list.delete(el);
                    }
                },
                {
                    iconclass: "fa fa-pencil",
                    onbtclick: () => this.editRepo()
                }
    
            ];
        }
    
        private editRepo(): void{
            const el = this.list.selectedItem;
            if (!el) { return; }
            const selidx = $(el).index();
            if  (!(selidx >= 0)) { return; }
            const data = el.data;
            const sel = this.systemsetting.system.repositories[selidx];
            this.openDialog("PromptDialog", {
                title: __("Edit repository"),
                label: __("Format : [name] url"),
                value: `[${data.text}] ${data.url}`
            }).then(e => {
                const m = e.match(/\[([^\]]*)\]\s*(.+)/);
                if (!m || (m.length !== 3)) {
                    return this.error(__("Wrong format: it should be [name] url"));
                }
                data.text = m[1];
                data.url = m[2];
                this.list.update(undefined);
                return this.list.unselect();
            });
        }
    
        protected onexit(e: BaseEvent): void{
            (this.parent as OS.application.MarketPlace).fetchApps();
            return super.onexit(e);
        }
    }

    App.RepoDialog = RepositoryDialog;
}
