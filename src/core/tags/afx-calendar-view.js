<afx-calendar-view>
    <div><i class ="prevmonth" onclick={prevmonth}></i>{text}<i onclick={nextmonth} class="nextmonth"></i></div>
    <afx-grid-view data-id ={"grid_" + rid}  style = "height:100%;" ref = "grid"  header = {header} observable = {root.observable}> </afx-grid-view>

    <script >
    this.header = [{value:"Sun"},{value:"Mon"},{value:"Tue"},{value:"Wed"},{value:"Thu"},{value:"Fri"},{value:"Sat"}]
    this.root.observable = opts.observable
    var self = this
    this.day = 0
    this.month = 0
    this.year = 0
    this.ondayselect = opts.ondayselect
    this.rid = $(self.root).attr("data-id") || Math.floor(Math.random() * 100000) + 1
    this.selectedDate = undefined
    self.root.get = function(k)
    {
        return self[k]
    }

    this.on("mount", function (e) { 
        self.refs.grid.root.observable = self.root.observable
        calendar(null)
        self.root.observable.on("gridcellselect", function(d){
            if(d.id != "grid_" + self.rid) return
            if(d.data.value == "") return
            var data = {id:self.rid, data:new Date(self.year, self.month,d.data.value)};
            if(self.ondayselect)
                self.ondayselect(data)
            self.selectedDate = data.data
            self.root.observable.trigger("dayselect",data)
        })
    })
    prevmonth()
    {
        self.selectedDate = undefined
        this.month--
        if(this.month < 0) 
        {
            this.month = 11
            this.year--
        }
        calendar(new Date(this.year, this.month,1))
    }
    nextmonth()
    {
        self.selectedDate = undefined
        this.month++
        if(this.month > 11)
        {
            this.month = 0
            this.year++
        }
        calendar(new Date(this.year, this.month,1))
    }
    var calendar = function (date) {
        
        if (date === null)
            date = new Date()

        self.day = date.getDate()
        self.month = date.getMonth()
        self.year = date.getFullYear()

        var now ={ d:(new Date()).getDate(), m:(new Date()).getMonth(), y:(new Date()).getFullYear()}
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

        this_month = new Date(self.year, self.month, 1)
        next_month = new Date(self.year, self.month + 1, 1)

        // Find out when this month starts and ends.
        first_week_day = this_month.getDay()
        days_in_this_month = Math.round((next_month.getTime() - this_month.getTime()) / (1000 * 60 * 60 * 24))
        self.text = months[self.month] + ' ' + self.year
        var rows = []
        var row = []
        // Fill the first week of the month with the appropriate number of blanks.
        for (week_day = 0; week_day < first_week_day; week_day++)
            row.push({value:""})

        week_day = first_week_day;
        for (day_counter = 1; day_counter <= days_in_this_month; day_counter++) {
            week_day %= 7
            if (week_day == 0)
            {
                rows.push(row)
                row =[]
            }   

            // Do something different for the current day.
            
            if (now.d == day_counter && self.month == now.m && self.year == now.y)
                row.push({value:day_counter, selected:true})
            else 
                row.push({value:day_counter})
           
            week_day++;
        }
        for(var i = 0; i <= 7 - row.length;i++)
            row.push({value:""})
        rows.push(row)
        self.refs.grid.root.set("rows",rows)
    } 
</script> 
</afx-calendar-view>