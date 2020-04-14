class TabContainer extends Ant.OS.GUI.BaseTag
    constructor: (r, o) ->
        super r, o
        @setopt "dir", "column" # or row
    
    layout: () ->
        [{
            el: "afx-tile", ref: "wrapper", chidren: [
                { el: "afx-tab-bar" }
            ]
        }]