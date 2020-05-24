/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
class CalendarTag extends Ant.OS.GUI.BaseTag {
    constructor(r, o) {
        super(r, o);
        this.setopt("day", 0);
        this.setopt("ondateselect", function()  {});
        this.setopt("selectedDate", undefined);
        this.day = 0;
        this.month = 0;
        this.year = 0;
    }

    mount() {
        $(this.root).css("height", "100%");
        $(this.refs.grid).css("width", "100%");
        $(this.refs.prev).click(e => this.prevmonth());
        $(this.refs.next).click(e => this.nextmonth());
        this.refs.grid.set("header", [
            { text: "__(Sun)" },
            { text: "__(Mon)" },
            { text: "__(Tue)" },
            { text: "__(Wed)" },
            { text: "__(Thu)" },
            { text: "__(Fri)" },
            { text: "__(Sat)" }
        ]);
        this.refs.grid.set("oncellselect", e => {
            return this.dateselect(e);
        });

        this.observable.on("resize", e => this.calibrate());
        this.calibrate();
        return this.calendar(null);
    }

    dateselect(e) {
        if (!e.data.item) { return; }
        const value = e.data.item.get("data").text;
        if (value === "") { return; }
        const evt = { id: this.aid() , data: new Date(this.year, this.month, value) };
        this.get("ondateselect")(evt);
        this.set("selectedDate", evt.data);
        return this.observable.trigger("dateselect", evt);
    }

    calibrate() {
        return $(this.refs.grid)
            .css("height", `${$(this.root).height() - $(this.refs.ctrl).height()}px`);
    }
    prevmonth() {
        this.set("selectedDate", undefined);
        this.month--;
        if (this.month < 0) {
            this.month = 11;
            this.year--;
        }
        return this.calendar(new Date(this.year, this.month, 1));
    }

    nextmonth() {
        this.set("selectedDate", undefined);
        this.month++;
        if (this.month > 11) {
            this.month = 0;
            this.year++;
        }
        return this.calendar(new Date(this.year, this.month, 1));
    }

    calendar(date) {
        let week_day;
        let asc, end;
        if (!date) { date = new Date(); }
        this.day = date.getDate();
        this.month = date.getMonth();
        this.year = date.getFullYear();

        const now = {
            d: (new Date()).getDate(),
            m: (new Date()).getMonth(),
            y: (new Date()).getFullYear()
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
            __("December")
        ];
        const this_month = new Date(this.year, this.month, 1);
        const next_month = new Date(this.year, this.month + 1, 1);
        // Find out when this month starts and ends.
        const first_week_day = this_month.getDay();
        const days_in_this_month = Math.round(
            (next_month.getTime() - this_month.getTime()) / (1000 * 60 * 60 * 24));
        //self.mtext = months[self.month]
        const rows = [];
        let row = [];
        // Fill the first week of the month with the appropriate number of blanks.
        for (week_day = 0, end = first_week_day - 1, asc = 0 <= end; asc ? week_day <= end : week_day >= end; asc ? week_day++ : week_day--) { row.push({ text: "" }); }
        week_day = first_week_day;
        for (let day_counter = 1, end1 = days_in_this_month, asc1 = 1 <= end1; asc1 ? day_counter <= end1 : day_counter >= end1; asc1 ? day_counter++ : day_counter--) {
            week_day %= 7;
            if (week_day === 0) {
                rows.push(row);
                row = [];
            }
            // Do something different for the current day.
            if  ((now.d === day_counter) && (this.month === now.m) && (this.year === now.y)) {
                row.push({ text: day_counter, selected: true });
            } else {
                row.push({ text: day_counter });
            }
            week_day++;
        }
        for (let i = 0, end2 = 7 - row.length, asc2 = 0 <= end2; asc2 ? i <= end2 : i >= end2; asc2 ? i++ : i--) {
            row.push({ text: "" });
        }
        rows.push(row);
        this.refs.grid.set("rows", rows);
        return this.refs.mlbl.set("text", `${months[this.month]} ${this.year}`);
    }


    layout() {
        return [{
            el: "div", ref: "ctrl", children: [
                { el: "i", class: "prevmonth", ref: "prev" },
                { el: "afx-label", ref: "mlbl" },
                { el: "i", class: "nextmonth", ref: "next" }
            ]
        },
        { el: "afx-grid-view", ref: "grid" }
        ];
    }
}

Ant.OS.GUI.define("afx-calendar-view", CalendarTag);