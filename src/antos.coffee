_GUI = self.OS.GUI
_API = self.OS.API
_PM  = self.OS.PM
_OS = self.OS
_courrier = self.OS.courrier
this.onload = () ->
    console.log "Booting the os"
    self.OS.boot()