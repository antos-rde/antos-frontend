class UserService extends this.OS.GUI.BaseService
    constructor: (args) ->
        super "UserService", args
        @text =@systemsetting.user.username
        @iconclass = undefined
    init: ->
        me = @
        @child = [
            {
                text: "About", dataid: "user-about",
                iconclass: "fa fa-user-circle-o"
            },
            {
                text: "Logout", dataid: "sys-logout",
                iconclass: "fa fa-user-times"
            }
        ]
        @onmenuselect = (d) ->
            return me._api.handler.logout() if d.item.data.dataid is "sys-logout"
            me.notify "This feature is not implemented yet"
    awake: (e) ->
        
    cleanup: (evt) ->
        

this.OS.register "UserService",UserService