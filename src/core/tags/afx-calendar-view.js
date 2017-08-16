<afx-calendar-view>
    <div>{text}</div>
    <afx-grid-view style = "height:100%;" ref = "grid"  header = {header} observable = {root.observable}> </afx-grid-view>

    <script >
    this.header = [{value:"S"},{value:"M"},{value:"T"},{value:"W"},{value:"T"},{value:"F"},{value:"S"}]
    this.root.observable = opts.observable
    this.on("mount", function (e) {
        calendar(null)
        self.refs.grid.root.set("rows",self.rows)
    })
    this.on("updated", function(e){
        if (self.refs.grid.root.observable != self.root.observable)
        {
            console.log("reset observable")
            
        }
    })
    var self = this
    var calendar = function (date) {
        
        if (date === null)
            date = new Date()

        day = date.getDate()
        month = date.getMonth()
        year = date.getFullYear()

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        this_month = new Date(year, month, 1)
        next_month = new Date(year, month + 1, 1)

        // Find out when this month starts and ends.
        first_week_day = this_month.getDay()
        days_in_this_month = Math.round((next_month.getTime() - this_month.getTime()) / (1000 * 60 * 60 * 24))
        self.text = months[month] + ' ' + year
        self.rows = []
        var row = []
        console.log(days_in_this_month)
        // Fill the first week of the month with the appropriate number of blanks.
        for (week_day = 0; week_day < first_week_day; week_day++)
            row.push({value:""})

        week_day = first_week_day;
        for (day_counter = 1; day_counter <= days_in_this_month; day_counter++) {
            week_day %= 7
            if (week_day == 0)
            {
                self.rows.push(row)
                row =[]
            }   

            // Do something different for the current day.
            //if (day == day_counter)
            //    calendar_html += '<td style="text-align: center;"><b>' + day_counter + '</b></td>';
            //else
            //    calendar_html += '<td style="background-color:9999cc; color:000000; text-align: center;"> ' + day_counter + ' </td>';
            row.push({value:day_counter})
            week_day++;
        }
        for(var i = 0; i <= 7 - row.length;i++)
            row.push({value:""})
        self.rows.push(row)
    } 
</script> 
</afx-calendar-view>