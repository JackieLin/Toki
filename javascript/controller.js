/**
 * @author Jackie lin
 * @Date 2014-3-25
 * @Content node js controller
 */

var FileOperation = require('FileOperations');
var RemoteFileOperation = require('RemoteFileOperations');

var Controller = function(path) {
    this.path = path;
    this.fileOperation = new FileOperation();
    this.remoteFileOperation = new RemoteFileOperation();
};

Controller.prototype.openDir = function(callback){
    if(this.path === '/') {
        this.fileOperation.openRootPath(callback);
    } else {
        this.fileOperation.openDir(this.path, callback);
    }
};

Controller.prototype.setPath = function(path) {
    this.path = path;
};

/**
 * copy source file or directory to dst
 * @param src
 * @param dst
 * @param callback
 */
Controller.prototype.copy = function(src, dst, progress, time, callback) {
    if(!src && !dst && !callback) {
        console.warn('copy: src and dst and callback must be exists');
        return;
    }

    var dstAttr = this.fileOperation.fileAttr(dst), srcAttr = this.fileOperation.fileAttr(src), progress = !!progress;

    if(dstAttr !== 'directory') {
        console.warn('destination path must be directory!!');
        return;
    }

    var path = src.substring(src.lastIndexOf('/') + 1, src.length), dstpath = dst + '/' + path;
    // src is a file, just copy it
    if(srcAttr === 'file') {
        if(progress) {
            this.fileOperation.copyFile(src, dstpath, time, callback);
        } else {
            this.fileOperation.copyFile(src, dstpath);
        }
    }
    // src is a directory, recursion all the file
    else if(srcAttr === 'directory') {
        var that = this;
        // create folder in the target folder
        this.fileOperation.mkdir(dstpath, function(err) {
            if(err) {
                console.log('controller:mkdir:: create folder:' + err);
                return;
            }
            // recursion copy file
            that.fileOperation.openDirPath(src, function(files) {
                files.forEach(function(item) {
                    var srcpath = src + '/' + item, tdstpath = dstpath + '/' + item, srcAttr = that.fileOperation.fileAttr(srcpath);

                    if(srcAttr === 'file') {
                        if(progress) {
                            that.fileOperation.copyFile(srcpath, tdstpath, time, callback);
                        } else {
                            that.fileOperation.copyFile(srcpath, tdstpath);
                        }
                    } else if (srcAttr === 'directory') {
                        that.copy(srcpath, dstpath, progress, time, callback);
                    }
                });
            });
        });
    }
};

Controller.prototype.copyFile = function(srcpath, dstpath, progress, time, callback) {
    var that = this;
    this.fileOperation.isExists(dstpath, function(exists) {
        if(exists) {
           that.copy(srcpath, dstpath, progress, time, callback);
        } else {
           that.fileOperation.mkdir(dstpath, function() {
               that.copy(srcpath, dstpath, progress, time, callback);
           });
        }
    });
};

Controller.prototype.mkdir = function(path, callback) {
    this.fileOperation.mkdir(path, function(err) {
        callback(err);
    });
};

Controller.prototype.rename = function(oldpath, newpath, callback) {
    if(!oldpath || !newpath || !callback) {
        console.warn('oldpath and newpath and callback must be exists');
        return;
    }

    this.fileOperation.rename(oldpath, newpath, function() {
        callback();
    });
};

Controller.prototype.delete = function(filepath) {
    if(!filepath) {
        console.warn('file path to delete is not exists');
        return;
    }

    var filestat = this.fileOperation.fileAttr(filepath);

    if(filestat === 'file') {
        // delete file direct
        this.fileOperation.unlinkSync(filepath);
    } else if (filestat === 'directory') {
        var that = this;
        /**
         * use synchronous way to make sure delete success
         */
        // open directory file
        var files = this.fileOperation.readdirSync(filepath);

        // directory is empty
        if(files.length === 0) {
            that.fileOperation.rmdirSync(filepath);
            return;
        }

        for(var i = 0, length = files.length; i < length; i++) {
            var t = files[i];
            that.delete(filepath + '/' + t);
        }

        // delete parent path
        that.fileOperation.rmdirSync(filepath);
    }
};

Controller.prototype.isExists = function(filepath, callback) {
    this.fileOperation.isExists(filepath, function(exists) {
        callback(exists);
    });
};

Controller.prototype.newEmptyFile = function(filepath) {
    this.fileOperation.newEmptyFile(filepath);
};

/**
 * gene conf
 * @param sourcepath   remote source path
 * @param remotepath   remote target path
 * @param confpath     configuration file path
 * @param filepath     file path
 * @param parentdir    parent directory(to generate conf file)
 * @param callback
 */
Controller.prototype.geneConfiguration = function(sourcepath, remotepath, confpath, filepath, parentdir, callback){
    if(!sourcepath || !remotepath || !confpath || !filepath || !parentdir) {
        console.error('confpath and filepath must be exists!!');
        return;
    }

    var replacepath = function(filepath, parentdir, targetpath){
        var substring = filepath.substring(parentdir.length, filepath.length);
        return targetpath + substring;
    };

    if(this.result || this.result === undefined) this.result = '';
    // generate conf to result
    this.geneConfResult(sourcepath, remotepath, filepath, parentdir, replacepath);

    console.log(this.result);
    // write to file
    this.fileOperation.writeFileSync(confpath, this.result);

    callback();
};

Controller.prototype.geneConfResult = function(sourcepath, remotepath, filepath, parentdir, replacepath) {
    var that = this, source = replacepath(filepath, parentdir, sourcepath),
        remote = replacepath(filepath, parentdir, remotepath);

    var stat = this.fileOperation.fileAttr(filepath);
    if(stat === 'file') {
        this.result += source + ' ' + remote + '\n';
    } else if(stat === 'directory') {
        var files = this.fileOperation.readdirSync(filepath);

        for(var i = 0, length = files.length; i < length; i++) {
            var t = files[i];
            stat = that.fileOperation.fileAttr(filepath + '/' + t);
            if(stat === 'file') {
                that.result += source + '/' + t + ' ' + remote + '/' + t + '\n';
            } else if(stat === 'directory') {
                that.geneConfResult(sourcepath, remotepath, filepath+'/'+t, parentdir, replacepath);
            }
        }
    }
};

Controller.prototype.fileAttr = function(filepath) {
    if(!filepath) {
        console.error('filepath must be exists!!');
        return;
    }

    return this.fileOperation.fileAttr(filepath);
};

/**
 * new file without judge whether file is exists
 * @param filepath
 * @param callback
 */
Controller.prototype.newFileIgnoreExists = function(filepath, callback) {
    if(!filepath && !callback) {
        console.warn('newFileIgnoreExists:: filepath and callback function must be exists!!');
        return;
    }

    this.fileOperation.openFile(filepath, 'w', callback);
};

/**
 * close file by fd
 * @param fd
 * @param callback
 */
Controller.prototype.closeFile = function(fd, callback) {
    if(!fd && !callback) {
        console.warn('closeFile:: fd and callback must be exists!!');
        return;
    }

    this.fileOperation.closeFile(fd, callback);
};

/**
 * file copy progress, default 1s
 * @param srcfile
 * @param dstfile
 * @param warp
 * @param time
 * @param callback
 */
Controller.prototype.fileprogress = function(srcfile, dstfile, warp, callback, time) {
    if(!srcfile && !dstfile && !callback && !warp) {
        console.warn('filepath and time and callbakck must be exists!!');
        return;
    }

    // speed, current file copy rate
    var speed = 0;
    var that = this;
    console.log('正在计算......');
    var srcfileSize = this.fileOperation.filesize(srcfile, function(result) {
        var filesize = parseInt(result.split('\r\n')[0]);
        // if file size larger than 10M, show progress bar
        if(filesize > 10000) {
            warp.apply(that, [srcfile, dstfile, true, time, callback]);
        } else {
            warp.apply(that, [srcfile, dstfile, true, time, callback]);
        }
    });
};

/**
 * test
 */
var controller = new Controller('/');
//new Controller('/').fileprogress('D:/TokiSoftware/toki', '/', function(){});
controller.fileprogress('E:/360Downloads', 'D:/test',controller.copyFile, function(fileLength) {
    console.log(fileLength);
}, 100);