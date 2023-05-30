namespace OS {
    export namespace GUI {
        export namespace tag {
            /**
             * Tag that define system calendar widget
             *
             * @export
             * @class CalendarTag
             * @extends {AFXTag}
             */
            export class CalendarTag extends AFXTag {
                /**
                 * The current selected day
                 *
                 * @private
                 * @type {number}
                 * @memberof CalendarTag
                 */
                private _day: number;

                /**
                 * The current selected month
                 *
                 * @private
                 * @type {number}
                 * @memberof CalendarTag
                 */
                private _month: number;

                /**
                 * The current selected year
                 *
                 * @private
                 * @type {number}
                 * @memberof CalendarTag
                 */
                private _year: number;

                /**
                 * The current selected date object
                 *
                 * @private
                 * @type {Date}
                 * @memberof CalendarTag
                 */
                private _selectedDate: Date;

                /**
                 * placeholder for date select event callback
                 *
                 * @private
                 * @type {TagEventCallback<Date>}
                 * @memberof CalendarTag
                 */
                private _ondateselect: TagEventCallback<Date>;

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
                 * Init the tag before mounting
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected init(): void {
                    $(this).css("height", "100%");
                    $(this.refs.grid).css("width", "100%");
                }

                /**
                 * Update the current tag, doing nothing in this tag
                 *
                 * @protected
                 * @param {*} [d] any data object
                 * @memberof CalendarTag
                 */
                protected reload(d?: any): void {}

                /**
                 * Get the current selected date in the widget
                 *
                 * @readonly
                 * @type {Date}
                 * @memberof CalendarTag
                 */
                get selectedDate(): Date {
                    return this._selectedDate;
                }

                /**
                 * Set the date select event callback handle for the widget
                 *
                 * @memberof CalendarTag
                 */
                set ondateselect(v: TagEventCallback<Date>) {
                    this._ondateselect = v;
                }

                /**
                 * Mount the current widget to the DOM tree
                 *
                 * @protected
                 * @memberof CalendarTag
                 */
                protected mount(): void {
                    (this.refs.prev as ButtonTag).iconclass = "fa fa-angle-left";
                    (this.refs.next as ButtonTag).iconclass = "fa fa-angle-right";
                    (this.refs.prev as ButtonTag).onbtclick = (e) => this.prevmonth();
                    (this.refs.next as ButtonTag).onbtclick = (e) => this.nextmonth();
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
                 * This function triggers the date select event
                 *
                 * @private
                 * @param {TagEventType} e AFX tag event data {@link TagEventType}
                 * @returns {void}
                 * @memberof CalendarTag
                 */
                private dateselect(
                    e: TagEventType<TagEventDataType<tag.GridCellPrototype>>
                ): void {
                    if (!e.data.item) {
                        return;
                    }
                    const value = e.data.item.data.text;
                    if (value === "") {
                        return;
                    }
                    const evt = {
                        id: this.aid,
                        data: new Date(
                            this._year,
                            this._month,
                            parseInt(value)
                        ),
                    };
                    this._ondateselect(evt);
                    this._selectedDate = evt.data;
                    return this.observable.trigger("dateselect", evt);
                }

                /**
                 * Calibrate the layout of the tag
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
                 * Display the previous month of the current month
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
                 * Display the next month of the current month
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
                 * Visualize the calendar base on input date
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
                    const grid = this.refs.grid as GridViewTag;
                    grid.rows = [];
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
                        let i = 0; i < 7 - row.length; i++
                    ) {
                        row.push({ text: "" });
                    }
                    rows.push(row);
                    grid.rows = rows;
                    (this.refs.mlbl as LabelTag).text = `${
                        months[this._month]
                    } ${this._year}`;
                }

                /**
                 * Layout definition of the widget
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
                                { el: "afx-button", class: "prevmonth", ref: "prev" },
                                { el: "afx-label", ref: "mlbl" },
                                { el: "afx-button", class: "nextmonth", ref: "next" },
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
