/**
 * @author Jackie lin
 * @date 2014-4-1
 * @content deal with remote control
 */
var RemoteFileOperation = require('RemoteFileOperations');
var FileOperation = require('FileOperations');
/**
* @constructor
*/
var RemoteController = function() {
    this.remoteFileOperation = new RemoteFileOperation();
    this.fileOperation = new FileOperation();
};

RemoteController.prototype.setRemoteConfByObj = function(obj) {
    this.remoteFileOperation.setConfiguration(obj);
};

RemoteController.prototype.registerEvent = function(events, callbacks) {
    this.remoteFileOperation.registerEvent(events, callbacks);
};

RemoteController.prototype.connect = function() {
    this.remoteFileOperation.connect();
};

RemoteController.prototype.remoteMkdir = function(filepath, callback) {
    if(!filepath || !callback) {
        console.error('filepath and callback must be exists!!');
        return;
    }

    /*this.remoteFileOperation.remoteMkdir(filepath, callback);*/
    this.remoteFileOperation.scpmkdir(filepath, callback);
};

RemoteController.prototype.setScpDefaults = function() {
    this.remoteFileOperation.setScpDefault();
};

/**
 * copy file to remote path
 * @param filepath
 * @param hostpath
 * @param callback
 * @param obj   {show: true}  true show progressbar
 */
RemoteController.prototype.scp = function(filepath, hostpath, callback, obj) {
    if(obj === undefined) {
        this.remoteFileOperation.scp(filepath, hostpath, callback);
    } else {
        var type = Object.prototype.toString(obj).slice(8, -1);
        if(type !== 'Object') {
            console.log('remote:scp:: obj must be an object');
            return;
        }
        var show = obj.show;
        var that = this;
        var rate;
        if(!show) {
            this.remoteFileOperation.scp(filepath, hostpath, function(err) {
                callback(err);
                return;
            });
        } else {
            // calculate file size
            this.fileOperation.filesize(filepath, function(result) {
                var filesize = parseInt(result.split('\r\n')[0]);
                // if file size>10M, the progress bar must be shown
                if(filesize > 10000) {
                    that.remoteFileOperation.scp(filepath, hostpath, function(err, fileLength) {
                        // calculate copy file rate
                        if(fileLength) {
                            rate = fileLength/filesize * 100;
                            callback(err, rate);
                        } else {
                            callback(err);
                        }
                    }, true);
                } else {
                    that.remoteFileOperation.scp(filepath, hostpath, callback);
                }
            });
        }
    }
};

RemoteController.prototype.instanceSSH = function() {
    this.remoteFileOperation.instance();
};

RemoteController.prototype.sshEnd = function() {
    this.remoteFileOperation.sshEnd();
};

RemoteController.prototype.scpClose = function(callback) {
    this.remoteFileOperation.scpClose(callback);
};

RemoteController.prototype.executeCommand = function(command, callback) {
    this.remoteFileOperation.executeCommand(command, callback);
};