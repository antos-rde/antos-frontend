/*
 * decaffeinate suggestions:
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
namespace OS {
    export namespace application {
        export class Calendar extends BaseService {
            constructor(args: AppArgumentsType[]) {
                super("Calendar", args);
                this.text = "";
                this.iconclass = "bi bi-calendar3";
            }

            init(): void {
                //update time each second
                this.watch(1000, () => {
                    const now = new Date();
                    this.text = now.toString();
                    this.update();
                });
            }

            awake(e: GUI.TagEventType<GUI.tag.StackMenuEventData>): void {
                this.openDialog("CalendarDialog").then((d) => console.log(d));
            }
            // do nothing
            cleanup(evt: BaseEvent): void {
                return console.log("cleanup for quit");
            }
        }
    }
}
