class CalendarTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "day", 0
        @setopt "ondateselect", ()  ->
        @setopt "selectedDate", undefined
        @day = 0
        @month = 0
        @year = 0

    mount: () ->
        me = @
        $(@root).css "height", "100%"
        $(@refs.grid).css "width", "100%"
        $(@refs.prev).click (e) -> me.prevmonth()
        $(@refs.next).click (e) -> me.nextmonth()
        @refs.grid.set "header", [
            { text: "__(Sun)" },
            { text: "__(Mon)" },
            { text: "__(Tue)" },
            { text: "__(Wed)" },
            { text: "__(Thu)" },
            { text: "__(Fri)" },
            { text: "__(Sat)" }
        ]
        @refs.grid.set "oncellselect", (e) ->
            me.dateselect(e)

        @observable.on "resize", (e) -> me.calibrate()
        @calibrate()
        @calendar null

    dateselect: (e) ->
        return unless e.data.item
        value = e.data.item.get("data").text
        return if value is ""
        evt = { id: @aid() , data: new Date(@year, @month, value) }
        @get("ondateselect") evt
        @set "selectedDate", evt.data
        @observable.trigger "dateselect", evt

    calibrate: () ->
        $(@refs.grid)
            .css "height", "#{$(@root).height() - $(@refs.ctrl).height()}px"
    prevmonth: () ->
        @set "selectedDate", undefined
        @month--
        if @month < 0
            @month = 11
            @year--
        @calendar(new Date(@year, @month, 1))

    nextmonth: () ->
        @set "selectedDate", undefined
        @month++
        if @month > 11
            @month = 0
            @year++
        @calendar(new Date(this.year, this.month, 1))

    calendar: (date) ->
        date = new Date() unless date
        @day = date.getDate()
        @month = date.getMonth()
        @year = date.getFullYear()

        now = {
            d: (new Date()).getDate(),
            m: (new Date()).getMonth(),
            y: (new Date()).getFullYear()
        }
        months = [
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
        ]
        this_month = new Date(@year, @month, 1)
        next_month = new Date(@year, @month + 1, 1)
        # Find out when this month starts and ends.
        first_week_day = this_month.getDay()
        days_in_this_month = Math.round(
            (next_month.getTime() - this_month.getTime()) / (1000 * 60 * 60 * 24))
        #self.mtext = months[self.month]
        rows = []
        row = []
        # Fill the first week of the month with the appropriate number of blanks.
        row.push { text: "" } for week_day in [ 0..first_week_day - 1 ]
        week_day = first_week_day
        for day_counter in [ 1..days_in_this_month ]
            week_day %= 7
            if week_day == 0
                rows.push(row)
                row = []
            # Do something different for the current day.
            if  now.d is day_counter and @month is now.m and @year is now.y
                row.push { text: day_counter, selected: true }
            else
                row.push { text: day_counter }
            week_day++
        for i in [ 0..7 - row.length ]
            row.push { text: "" }
        rows.push(row)
        console.log rows
        @refs.grid.set "rows", rows
        @refs.mlbl.set "text", "#{months[@month]} #{@year}"


    layout: () ->
        [{
            el: "div", ref: "ctrl", children: [
                { el: "i", class: "prevmonth", ref: "prev" },
                { el: "afx-label", ref: "mlbl" },
                { el: "i", class: "nextmonth", ref: "next" }
            ]
        },
        { el: "afx-grid-view", ref: "grid" }
        ]

Ant.OS.GUI.define "afx-calendar-view", CalendarTag