class CalendarTag extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
    
    layout: () ->
        [{
            el: "div", children: [
                { el: "i", class: "prevmonth", ref: "prev" },
                { el: "afx-label", ref: "mlbl" },
                { el: "afx-label", ref: "ylbl" },
                { el: "i", class: "nextmonth", ref: "next" },
                { el: "afx-grid-view", ref: "grid" }
            ]
        }]