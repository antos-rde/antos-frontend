_GUI = self.OS.GUI 
_API = self.OS.API 
_APP = self.OS.APP
this.onload = () ->
    console.log "Booting the os"
    self.OS.boot()