/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {
            export class TileLayoutTag extends AFXTag {
                constructor() {
                    super();
                }
                // @setopt @conf.opt, "grow"
                protected init(): void {
                }
                protected reload(d?: any): void {}
                set name(v: string) {
                    if (!v) {
                        return;
                    }
                    $(this).attr("name", v);
                    $(this.refs.yield)
                        .removeClass()
                        .addClass(`afx-${v}-container`);
                    this.calibrate();
                }

                get name(): string {
                    return $(this).attr("name");
                }
                set dir(v: "row"| "column") {
                    if (!v) {
                        return;
                    }
                    $(this).attr("dir", v);
                    $(this.refs.yield).css("flex-direction", v);
                    this.calibrate();
                }
                get dir(): "row"| "column"
                {
                    return $(this).attr("dir") as any;
                }
                protected mount(): void {
                    $(this).css("display", "block");
                    $(this.refs.yield)
                        .css("display", "flex")
                        .css("width", "100%")
                        .css("height", "100%");
                    this.observable.on("resize", (e) => this.calibrate());
                    return this.calibrate();
                }

                calibrate(): void {
                    if (this.dir === "row") {
                        return this.hcalibrate();
                    }
                    if (this.dir === "column") {
                        return this.vcalibrate();
                    }
                }

                private hcalibrate(): void {
                    const auto_width = [];
                    let ocwidth = 0;
                    const avaiheight = $(this).height();
                    const avaiWidth = $(this).width();
                    $(this.refs.yield).css("height", `${avaiheight}px`);
                    $(this.refs.yield)
                        .children()
                        .each(function (e) {
                            $(this).css("height", "100%");
                            let attv = $(this).attr("data-width");
                            let dw = 0;
                            if (attv && attv !== "grow") {
                                if (attv[attv.length - 1] === "%") {
                                    dw =
                                        (parseInt(attv.slice(0, -1)) *
                                            avaiWidth) /
                                        100;
                                } else {
                                    dw = parseInt(attv);
                                }
                                $(this).css("width", `${dw}px`);
                                ocwidth += dw;
                            } else {
                                $(this).css("flex-grow", "1");
                                auto_width.push(this);
                            }
                        });

                    const csize = (avaiWidth - ocwidth) / auto_width.length;
                    if (csize > 0) {
                        $.each(auto_width, (i, v) =>
                            $(v).css("width", `${csize}px`)
                        );
                    }
                    return this.observable.trigger("hboxchange", {
                        id: this.aid,
                        data: { w: avaiWidth, h: avaiheight },
                    });
                }

                private vcalibrate(): void {
                    const auto_height = [];
                    let ocheight = 0;
                    const avaiheight = $(this).height();
                    const avaiwidth = $(this).width();
                    $(this.refs.yield).css("height", `${avaiheight}px`);
                    $(this.refs.yield)
                        .children()
                        .each(function (e) {
                            let dh = 0;
                            $(this).css("width", "100%");
                            let attv = $(this).attr("data-height");
                            if (attv && attv !== "grow") {
                                if (attv[attv.length - 1] === "%") {
                                    dh =
                                        (parseInt(attv.slice(0, -1)) *
                                            avaiheight) /
                                        100;
                                } else {
                                    dh = parseInt(attv);
                                }
                                $(this).css("height", `${dh}px`);
                                ocheight += dh;
                            } else {
                                $(this).css("flex-grow", "1");
                                auto_height.push(this);
                            }
                        });

                    const csize = (avaiheight - ocheight) / auto_height.length;
                    if (csize > 0) {
                        $.each(auto_height, (i, v) =>
                            $(v).css("height", `${csize}px`)
                        );
                    }

                    return this.observable.trigger("vboxchange", {
                        id: this.aid,
                        data: { w: avaiwidth, h: avaiheight },
                    });
                }

                layout() {
                    return [
                        {
                            el: "div",
                            ref: "yield",
                        },
                    ];
                }
            }

            export class HBoxTag extends TileLayoutTag {
                constructor() {
                    super();
                }

                protected mount(): void {
                    super.mount();
                    this.dir = "row";
                    this.name = "hbox";
                    
                }
            }

            export class VBoxTag extends TileLayoutTag {
                constructor() {
                    super();
                    
                }
                protected mount(): void {
                    super.mount();
                    this.dir = "column";
                    this.name = "vbox";
                    
                }
            }

            define("afx-tile", TileLayoutTag);
            define("afx-hbox", HBoxTag);
            define("afx-vbox", VBoxTag);
        }
    }
}
