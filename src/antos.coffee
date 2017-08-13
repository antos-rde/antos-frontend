_GUI = self.OS.GUI 
_API = self.OS.API 
_APP = self.OS.APP
_PM  = self.OS.PM
this.onload = () ->
    console.log "Booting the os"
    self.OS.boot()