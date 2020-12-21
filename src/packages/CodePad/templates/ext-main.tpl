# import the CodePad application module
App = this.OS.application.CodePad

# define the extension
class App.extensions.{0} extends App.BaseExtension
    constructor: (app) ->
        super app

    test: () ->
        @notify "Test action is invoked"
    
    cleanup: () ->
        # clean up the extension on application exit