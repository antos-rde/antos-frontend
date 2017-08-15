_GUI = self.OS.GUI
_API = self.OS.API
_APP = self.OS.APP
_PM  = self.OS.PM
_courrier = self.OS.courrier
this.onload = () ->
    console.log "Booting the os"
    self.OS.boot()