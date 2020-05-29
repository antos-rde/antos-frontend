/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
interface HTMLElement {
    update(d?: any): void;
    contextmenuHandle(e: JQuery.MouseEventBase, m: OS.GUI.tag.MenuTag): void;
    sync(): void;
    afxml(o: OS.API.Announcer): void;
    uify(o: OS.API.Announcer): void;
    mozRequestFullScreen: any;
    webkitRequestFullscreen: any;
    msRequestFullscreen: any;
}

interface Document {
    mozCancelFullScreen: any;
    webkitExitFullscreen: any;
    cancelFullScreen: any;
}
namespace OS {
    export namespace GUI {
        export interface TagLayoutType {
            el: string;
            children?: TagLayoutType[];
            ref?: string;
            class?: string;
            id?: string | number;
            tooltip?: string | FormatedString;
            width?: number;
            height?: number;
        }
        export interface TagEventType {
            id: number | string;
            data: any;
        }

        export type TagEventCallback = (e: TagEventType) => void;
        export var zindex: number = 10;

        export abstract class AFXTag extends HTMLElement {
            observable: API.Announcer;
            protected refs: GenericObject<HTMLElement>;
            protected _mounted: boolean;
            constructor() {
                super();

                if (!this.observable) {
                    this.observable = new Ant.OS.API.Announcer();
                }
                this._mounted = false;
                this.refs = {};
            }

            set(v: GenericObject<any>) {
                for (let k in v) {
                    let descriptor = this.descriptor_of(k);
                    if (descriptor && descriptor.set) 
                    {
                        this[k] = v[k];
                    }
                }
            }

            set tooltip(v: string) {
                if (!v) {
                    return;
                }
                $(this).attr("tooltip", v);
            }
            private descriptor_of(k: string) {
                let desc: PropertyDescriptor;
                let obj = this;
                do {
                    desc = Object.getOwnPropertyDescriptor(obj, k);
                } while (!desc && (obj = Object.getPrototypeOf(obj)));
                return desc;
            }
            set aid(v: string| number) {
                $(this).attr("data-id", v);
            }

            get aid(): string | number {
                return $(this).attr("data-id");
            }
            sync(): void {
                if(this._mounted)
                {
                    return;
                }
                this._mounted = true;
                // reflect attributes
                this.mount();
                super.sync();
            }
            afxml(o: API.Announcer): void {
                if(o)
                    this.observable = o;
                if(!this.aid)
                    this.aid = (Math.floor(Math.random() * 100000) + 1).toString();
                    const children = $(this).children();
                for (let obj of this.layout()) {
                    const dom = this.mkui(obj);
                    if (dom) {
                        $(dom).appendTo(this);
                    }
                }
                if (this.refs.yield) {
                    for (let v of children) {
                        $(v).detach().appendTo(this.refs.yield);
                    }
                }
                const attrs =  {};
                for (let i = 0; i < this.attributes.length; i++) {
                    const element = this.attributes[i];
                    let descriptor = this.descriptor_of(element.nodeName);
                    if (descriptor && descriptor.set) {
                        let value = "";
                        try {
                            value = JSON.parse(element.nodeValue);
                        } catch (e) {
                            value = element.nodeValue;
                        }
                        attrs[element.nodeName] = value;
                    }
                }
                super.afxml(this.observable);
                this.init();
                for(let k in attrs)
                {
                    this[k] = attrs[k];
                }

            }
            update(d: any): void {
                this.reload(d);
                super.update(d);
            }
            protected abstract init(): void;
            protected abstract mount(): void;

            protected abstract layout(): TagLayoutType[];

            protected abstract reload(d?: any): void;
            // should be defined by subclasses

            protected calibrate(): void {}

            private mkui(tag: TagLayoutType): Element {
                if (!tag) {
                    return undefined;
                }
                const dom = $(`<${tag.el}>`);
                if (tag.class) {
                    $(dom).addClass(tag.class);
                }
                if (tag.id) {
                    $(dom).attr("data-id", tag.id);
                }
                if (tag.height) {
                    $(dom).attr("data-height", tag.height);
                }
                if (tag.width) {
                    $(dom).attr("data-width", tag.width);
                }
                if (tag.tooltip) {
                    $(dom).attr("tooltip", tag.tooltip.__());
                }
                if (tag.children) {
                    for (let v of Array.from(tag.children)) {
                        $(this.mkui(v)).appendTo(dom);
                    }
                }
                if (tag.ref) {
                    this.refs[tag.ref] = dom[0];
                }
                // dom.mount @observable
                return dom[0]; //.uify(@observable)
            }

            protected attsw(flag: boolean, v: string, el?: HTMLElement): void {
                if (flag) this.atton(v, el);
                else this.attoff(v, el);
            }
            protected atton(v: string, el?: HTMLElement): void {
                const element = el ? el : this;
                $(element).attr(v, "");
            }

            protected attoff(v: string, el?: HTMLElement): void {
                const element = el ? el : this;
                element.removeAttribute(v);
            }

            protected hasattr(v: string, el?: HTMLElement): boolean {
                const element = el ? el : this;
                return element.hasAttribute(v);
            }
        }

        HTMLElement.prototype.update = function (d):void {
            $(this)
                .children()
                .each(function () {
                    return this.update(d);
                });
        };
        HTMLElement.prototype.sync = function (): void {
            $(this)
                .children()
                .each(function () {
                    return this.sync();
                });
        };
        HTMLElement.prototype.afxml = function(o: API.Announcer): void {
            $(this)
                .children()
                .each(function () {
                    return this.afxml(o);
                });
        }
        HTMLElement.prototype.uify = function(o: API.Announcer): void {
            this.afxml(o);
            this.sync();
        }

        export namespace tag {
            export function define<T extends AFXTag>(
                name: string,
                cls: { new (): T }
            ): void {
                customElements.define(name, cls);
            }
        }
    }
}
