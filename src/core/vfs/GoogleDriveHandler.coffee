# GoogleDrive File Handler
class GoogleDriveHandler extends this.OS.API.VFS.BaseFileHandler
    constructor: (path) ->
        super path

self.OS.API.VFS.register "^gdv$", GoogleDriveHandler