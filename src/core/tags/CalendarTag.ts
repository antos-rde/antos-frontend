/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
namespace OS {
    export namespace GUI {
        export namespace tag {

            /**
             *
             *
             * @export
             * @class CalendarTag
             * @extends {AFXTag}
             */
            export class CalendarTag extends AFXTag {
                private _day: number;
                private _month: number;
                private _year: number;
                private _selectedDate: Date;
                private _ondateselect: TagEventCallback;

                /**
                 *Creates an instance of CalendarTag.
                 * @memberof CalendarTag
                 */
                constructor() {
                    super();
                    this._day = 0;
                    this._month = 0;
                    this._year = 0;
                    this._ondateselect = (e) => {};
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected init(): void {
                    $(this).css("height", "100%");
                    $(this.refs.grid).css("width", "100%");
                }

                /**
                 *
                 *
                 * @protected
                 * @param {*} [d]
                 * @memberof CalendarTag
                 */
                protected reload(d?: any): void {
                }

                /**
                 *
                 *
                 * @readonly
                 * @type {Date}
                 * @memberof CalendarTag
                 */
                get selectedDate(): Date {
                    return this._selectedDate;
                }

                /**
                 *
                 *
                 * @memberof CalendarTag
                 */
                set ondateselect(v: TagEventCallback) {
                    this._ondateselect = v;
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected mount(): void {
                    $(this.refs.prev).click((e) => this.prevmonth());
                    $(this.refs.next).click((e) => this.nextmonth());
                    const grid = this.refs.grid as GridViewTag;
                    grid.header = [
                        { text: "__(Sun)" },
                        { text: "__(Mon)" },
                        { text: "__(Tue)" },
                        { text: "__(Wed)" },
                        { text: "__(Thu)" },
                        { text: "__(Fri)" },
                        { text: "__(Sat)" },
                    ];
                    grid.oncellselect = (e) => {
                        this.dateselect(e);
                    };

                    this.observable.on("resize", (e) => this.calibrate());
                    this.calibrate();
                    this.calendar(null);
                }

                /**
                 *
                 *
                 * @private
                 * @param {TagEventType} e
                 * @returns {void}
                 * @memberof CalendarTag
                 */
                private dateselect(e: TagEventType): void {
                    if (!e.data.item) {
                        return;
                    }
                    const value = e.data.item.data.text;
                    if (value === "") {
                        return;
                    }
                    const evt = {
                        id: this.aid,
                        data: new Date(this._year, this._month, parseInt(value)),
                    };
                    this._ondateselect(evt);
                    this._selectedDate = evt.data;
                    return this.observable.trigger("dateselect", evt);
                }

                /**
                 *
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected calibrate(): void {
                    $(this.refs.grid).css(
                        "height",
                        `${$(this).height() - $(this.refs.ctrl).height()}px`
                    );
                }

                /**
                 *
                 *
                 * @private
                 * @memberof CalendarTag
                 */
                private prevmonth(): void {
                    this._selectedDate = undefined;
                    this._month--;
                    if (this._month < 0) {
                        this._month = 11;
                        this._year--;
                    }
                    this.calendar(new Date(this._year, this._month, 1));
                }

                
                /**
                 *
                 *
                 * @private
                 * @returns
                 * @memberof CalendarTag
                 */
                private nextmonth() {
                    this._selectedDate = undefined;
                    this._month++;
                    if (this._month > 11) {
                        this._month = 0;
                        this._year++;
                    }
                    return this.calendar(new Date(this._year, this._month, 1));
                }

                /**
                 *
                 *
                 * @private
                 * @param {Date} date
                 * @memberof CalendarTag
                 */
                private calendar(date: Date) {
                    let week_day: number;
                    let asc: any, end: any;
                    if (!date) {
                        date = new Date();
                    }
                    this._day = date.getDate();
                    this._month = date.getMonth();
                    this._year = date.getFullYear();

                    const now = {
                        d: new Date().getDate(),
                        m: new Date().getMonth(),
                        y: new Date().getFullYear(),
                    };
                    const months = [
                        __("January"),
                        __("February"),
                        __("March"),
                        __("April"),
                        __("May"),
                        __("June"),
                        __("July"),
                        __("August"),
                        __("September"),
                        __("October"),
                        __("November"),
                        __("December"),
                    ];
                    const this_month = new Date(this._year, this._month, 1);
                    const next_month = new Date(this._year, this._month + 1, 1);
                    // Find out when this month starts and ends.
                    const first_week_day = this_month.getDay();
                    const days_in_this_month = Math.round(
                        (next_month.getTime() - this_month.getTime()) /
                            (1000 * 60 * 60 * 24)
                    );
                    //self.mtext = months[self.month]
                    const rows = [];
                    let row = [];
                    // Fill the first week of the month with the appropriate number of blanks.
                    for (
                        week_day = 0, end = first_week_day - 1, asc = 0 <= end;
                        asc ? week_day <= end : week_day >= end;
                        asc ? week_day++ : week_day--
                    ) {
                        row.push({ text: "" });
                    }
                    week_day = first_week_day;
                    for (
                        let day_counter = 1,
                            end1 = days_in_this_month,
                            asc1 = 1 <= end1;
                        asc1 ? day_counter <= end1 : day_counter >= end1;
                        asc1 ? day_counter++ : day_counter--
                    ) {
                        week_day %= 7;
                        if (week_day === 0) {
                            rows.push(row);
                            row = [];
                        }
                        // Do something different for the current day.
                        if (
                            now.d === day_counter &&
                            this._month === now.m &&
                            this._year === now.y
                        ) {
                            row.push({ text: day_counter, selected: true });
                        } else {
                            row.push({ text: day_counter });
                        }
                        week_day++;
                    }
                    for (
                        let i = 0, end2 = 7 - row.length, asc2 = 0 <= end2;
                        asc2 ? i <= end2 : i >= end2;
                        asc2 ? i++ : i--
                    ) {
                        row.push({ text: "" });
                    }
                    rows.push(row);
                    const grid = this.refs.grid as GridViewTag;
                    grid.rows = rows;
                    (this.refs.mlbl as LabelTag).text = `${months[this._month]} ${this._year}`;
                }

                /**
                 *
                 *
                 * @protected
                 * @returns {TagLayoutType[]}
                 * @memberof CalendarTag
                 */
                protected layout(): TagLayoutType[] {
                    return [
                        {
                            el: "div",
                            ref: "ctrl",
                            children: [
                                { el: "i", class: "prevmonth", ref: "prev" },
                                { el: "afx-label", ref: "mlbl" },
                                { el: "i", class: "nextmonth", ref: "next" },
                            ],
                        },
                        { el: "afx-grid-view", ref: "grid" },
                    ];
                }
            }

            define("afx-calendar-view", CalendarTag);
        }
    }
}
