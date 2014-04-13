/**
 * @author Jackie lin
 * @date 2014-4-1
 * @content deal with remote control
 */
var RemoteFileOperation = require('RemoteFileOperations');
/**
* @constructor
*/
var RemoteController = function() {
    this.remoteFileOperation = new RemoteFileOperation();
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

RemoteController.prototype.scp = function(filepath, hostpath, callback) {
    this.remoteFileOperation.scp(filepath, hostpath, callback);
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