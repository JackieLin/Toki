/**
 * @author jackie lin
 * @date 2014-3-24
 * @content deal with the view action
 */
$(function() {
    /**********************************************************************
     ***************************页面交互部分*******************************
     **********************************************************************/

    // get current window
    var gui = require('nw.gui'), currWindow = gui.Window.get();
    var windowPanel = new WindowPanel();
    // show window
    currWindow.show();
    // pretend to be closed already
    currWindow.on('close', function() {
        var that = this;
        var eventData = {'click': function() {
            try {
                remoteController.scpClose(function() {
                    that.close(true);
                });
            } catch (e) {
                console.log('error:' + e);
                that.close(true);
            }
        }};
        windowPanel.setTitle('confirm');
        windowPanel.setContent('Are you sure to close?');
        windowPanel.confirm(eventData);
    });

    $('.close').click(function() {
        // close window
        currWindow.close();
    });

    $('.min').click(function() {
        currWindow.minimize();
    });

    /**********************************************************************
     ***************************文件处理部分*******************************
     **********************************************************************/
    // current click local file and remote file
    var $currentLocalfile = null, $currentRemotefile = null, currentLocalFolder = '/',currentRemoteFolder = '/';
     /**
     *   input path type
     *   output li string
     */
    var displayFile = function(path, name, type) {
        if(!path || !name || !type) {
            console.log('file path and type must be exites');
            return;
        }

        var result ='<li data-path="' + path + '"><img src="icons/' + type +
                '.png" alt="' + name + '" width="50px" height="50px" title="' + name + '"/>' +
                '<div title="' + name + '">' + name + '</div>';
        return result;
    },

    /**
     * show sub folder
     * @param controller
     * @param path
     */
    showSubFolder = function(controller, type, flag) {
        if(!controller || !type) {
            console.log('controller and type must be exsist');
            return;
        }

        var $files = (type === 'localfile') ? $('.file > ul.localfile') : $('.file > ul.remotefile'), $file = null,
            filepath = (type === 'localfile') ? $('.ipath')[0] : $('.ipath')[1];

        /**
         * files object
         */
        controller.openDir(function(files) {
            // open current folder
            var result = '';
            // 遍历所有files的值
            for(var key in files) {
                if(files.hasOwnProperty(key)) {
                    result += displayFile(key, key.substring(key.lastIndexOf('/') + 1, key.length), files[key]);
                }
            }
            var currentfolder = (type === 'localfile') ? currentLocalFolder : currentRemoteFolder;
            filepath.value = currentfolder;
            $files.html(result);

            // bind click event
            $file = (type === 'localfile') ? $('ul.localfile > li') : $('ul.remotefile > li');

            $file.bind('click', function(event) {
                // stop element bubble
                event.stopPropagation();
                var target = event.currentTarget;
                $(target).siblings().removeClass('fileclick');
                $(target).addClass('fileclick');

                // change current file
                /** javascript do not approve this usage **/
                /*(type === 'localfile') ? $currentLocalfile = $(target) : $currentRemotefile = $(target);*/
                $currentLocalfile = (type === 'localfile') ? $(target) : $currentLocalfile;
                $currentRemotefile = (type === 'remotefile') ? $(target) : $currentRemotefile;
            });

            // when double click, open the sub floder
            // bind double click event
            $file.bind('dblclick', function(event) {
                var target = event.currentTarget, path = $(target).data('path'),
                    classType = $(target).parent().attr('class');

                controller.setPath(path);
                currentLocalFolder = (type === 'localfile') ? path : currentLocalFolder;
                currentRemoteFolder = (type === 'remotefile') ? path : currentRemoteFolder;
                showSubFolder(controller, classType);
            });

            // flag true, show remote, false not show
            if(flag) {
                showSubFolder(controller, 'remotefile');
            }
        });
    };

    var controller = new Controller('/');

    showSubFolder(controller, 'localfile', true);
    /*showSubFolder(controller, 'remotefile');*/

    // register local and remote enter event
    $('.ipath').bind('keyup', function(event) {
        var target = event.currentTarget, $grandfather = $(target).parent().parent(),
        type = $grandfather.attr('class'), value = target.value;
        if(event.keyCode === 13) {
            currentLocalFolder = (type === 'local') ? value : currentLocalFolder;
            currentRemoteFolder = (type === 'remote') ? value : currentRemoteFolder;
            controller.setPath(value);
            var subFolder = (type === 'local') ? showSubFolder(controller, 'localfile') : showSubFolder(controller, 'remotefile');
        }
    });

    /**********************************************************************
     ***************************窗口重新resize******************************
     **********************************************************************/
    var resizeList = [], positionList = [];   // list to register recalculate
    /**
     * selector1, selector2, selector3
     */
    var registerResize = function() {
        if(arguments.length === 0) {
            console.warn('registerResize: arguments length is 0');
        }

        for(var i = 0, length = arguments.length; i < length; i++) {
            var t = arguments[i];
            resizeList.push(t);
        }
    }, resize = function() {
        if(resizeList.length === 0) {
            return;
        }
        // iteator all the resize list
        for(var i = 0, resizelength = resizeList.length; i < resizelength; i++) {
            var t = resizeList[i], $ele = $(t), length = $ele.length;

            if(length === 0) {
                continue;
            } else {
                positionList[t] = $ele.offset();
            }
        }
    };

    $(window).bind('resize', resize);

    // binding class
    registerResize('.local > .file', '.remote > .file');

    // init
    $(window).trigger('resize');

    /**********************************************************************
     ***************************右键菜单栏部分*******************************
     **********************************************************************/
    var $localfileobj = $('.local > .file'), $remotefileobj = $('.remote > .file');

    /**
     * method list
     */
    var recalculate = function (selector, position) {
        if(!selector || !position) {
            console.warn('recalculate: selector and position must be exist');
        }
        var parentPosition = positionList[selector];
        return {left: position.left - parentPosition.left, top: position.top - parentPosition.top};

    }, menus = function(event) {
        var data = event.data;
        if(!data) {
            console.log('menus: data must be exists');
            return;
        }

        var element = data[0], selector = data[1],
            binddata = data[2];

        if(!element instanceof jQuery) {
            console.log('data element must be jQuery object');
            return;
        }

        // jduge if the contextmenu is exist
        var elementmenu = element.children('nav.contextmenu'), contextmenu = null,
            position = recalculate(selector, {'left': event.pageX, 'top': event.pageY});

        // show menu
        if(elementmenu.length > 0) {
            elementmenu.css({'display': 'block', 'left': position.left, 'top': position.top});

        } else {
            // new menu and show
            contextmenu = new ContextMenu(position, binddata);

            element.append(contextmenu.getNavigation());
        }
    },

    /**
     * local file and remote file click
     * @param event
     */
    fileListClick = function(event) {
        var target = event.currentTarget, children = $(target).children(),
            filelist = children[0], fileItems = $(filelist).children(),contextmenu = null,
            data = event.data[0];

        // first: delete li class
        for(var i = 0, length = fileItems.length; i < length; i++) {
            var t = fileItems[i];
            $(t).removeClass('fileclick');
        }

        // second: delete selected element
        /*(data === 'localfile') ? $currentLocalfile = null : $currentRemotefile = null;*/
        $currentLocalfile = (data === 'localfile') ? null : $currentLocalfile;
        $currentRemotefile = (data === 'remotefile') ? null : $currentRemotefile;

        // third: if element has navigation, hidden it
        // the context menu has been generate
        if(children.length === 2) {
            contextmenu = children[1];
            $(contextmenu).css('display', 'none');
        }
    };

    var localbinddata = [
        {'itemName': 'Upload...', 'itemClass': 'upload',
          'events': {'click': function() {
               if(!$currentLocalfile) {
                   windowPanel.setContent('One of local file must be selected!!');
                   windowPanel.alert();
                   return false;
               }

               if(!$currentRemotefile) {
                   windowPanel.setContent('One of remote diredtory must be selected!!');
                   windowPanel.alert();
                   return false;
               }

               controller.copyFile($currentLocalfile.data('path'), $currentRemotefile.data('path'));
          }}
        },
        {'itemName': 'Refresh...', 'itemClass': 'refresh', 'events': {'click': function() {
               var srcfile = $('.local .localfile > li:first').data('path'),
                   srcpath = srcfile.substring(0, srcfile.lastIndexOf('/'));

               if(!srcpath) srcpath = '/';
               controller.setPath(srcpath);
               // refresh
               showSubFolder(controller, 'localfile');
          }}
        },
        {'itemName': 'Create Folder...', 'itemClass': 'newfold', 'events': {'click': function(event) {
               var srcfile = $('.local .localfile > li:first').data('path'),
                   srcpath = srcfile.substring(0, srcfile.lastIndexOf('/')),
                   $currentlist = $('.local .localfile'), dstfolder = srcpath + '/' + 'newFolder',
                   target = event.currentTarget;

               if(!srcpath) {
                   windowPanel.setContent('The system drive can not be new folder!!');
                   windowPanel.alert();
                   return false;
               }

               controller.mkdir(dstfolder, function(err) {
                   if(err) {
                       windowPanel.setContent('Create folder failed!!');
                       windowPanel.alert();
                       return;
                   }
                   var li = document.createElement('li'), img = document.createElement('img'), div = document.createElement('div');

                   // set value
                   $(li).attr('data-path', dstfolder);
                   $(img).attr({'src': 'icons/folder.png', 'alt': 'newFolder', 'width': '50px', 'height': '50px', 'title': 'newFolder'});
                   $(div).attr({'title': 'newFolder', 'contenteditable': 'true'});
                   $(div).text('newFolder');
                   $(div).bind('blur paste copy cut', function(event) {
                        var newfile = srcpath + '/' + $(div).text();
                        controller.rename(dstfolder, newfile, function() {
                            var prev = $(target).prev();
                            prev.trigger('click');   // refresh the folder
                        });
                   });

                   li.appendChild(img);
                   li.appendChild(div);

                   $currentlist.append(li);
               });
          }}
        },
        {'itemName': 'Create file...', 'itemClass': 'newfile', 'events': {'click': function() {
                var srcfile = $('.local .localfile > li:first').data('path'),
                    srcpath = srcfile.substring(0, srcfile.lastIndexOf('/')),
                    $currentlist = $('.local .localfile'), dstfile = srcpath + '/' + 'newFile',
                    target = event.currentTarget;

                if(!srcpath) {
                    windowPanel.setContent('The system drive can not be new folder!!');
                    windowPanel.alert();
                    return false;
                }

                // new file and add to the folder
                controller.newFileIgnoreExists(dstfile, function(err, fd) {
                    if(err) {
                        windowPanel.setContent('Sorry, new file failure');
                        windowPanel.alert();
                        return;
                    }

                    // close file first
                    controller.closeFile(fd, function() {
                        var li = document.createElement('li'), img = document.createElement('img'), div = document.createElement('div');

                        // set value
                        $(li).attr('data-path', dstfile);
                        $(img).attr({'src': 'icons/blank.png', 'alt': 'newFile', 'width': '50px', 'height': '50px', 'title': 'newFile'});
                        $(div).attr({'title': 'newFile', 'contenteditable': 'true'});
                        $(div).text('newFile');
                        $(div).bind('blur paste copy cut', function(event) {
                            var newfile = srcpath + '/' + $(div).text();
                            controller.rename(dstfile, newfile, function() {
                                var prev = $(target).prev().prev();
                                prev.trigger('click');   // refresh the folder
                            });
                        });

                        li.appendChild(img);
                        li.appendChild(div);

                        $currentlist.append(li);
                    });
                });
          }}
        },
        {'itemName': 'Rename...', 'itemClass': 'edit', 'events': {'click': function() {
                if(!$currentLocalfile) {
                    windowPanel.setContent('Local file must be chosen!!');
                    windowPanel.alert();
                    return;
                }

                var div = $currentLocalfile.children('div'), filepath = $currentLocalfile.data('path'),
                    parentpath = filepath.substring(0, filepath.lastIndexOf('/'));

                // first, set field editable
                div.attr({'contenteditable': 'true'});

                div.bind('blur paste copy cut', function(event) {
                    var newfile = parentpath + '/' + div.text();
                    controller.rename(filepath, newfile, function() {
                        windowPanel.setContent('Rename file is OK!');
                        windowPanel.alert();
                        var prev = $(target).prev().prev().prev();
                        prev.trigger('click');   // refresh the folder
                    });
                });
            }}
        },
        {'itemName': 'Delete...', 'itemClass': 'trash', 'events': {'click': function(event) {
            if(!$currentLocalfile) {
                windowPanel.setContent('It must be chosen one file to delete!!');
                windowPanel.alert();
                return false;
            }

            var target = event.currentTarget, filepath = $currentLocalfile.data('path'), refresh = $(target).siblings('.refresh');
            var eventData = {'click': function() {
                controller.delete(filepath);
                refresh.trigger('click');
                windowPanel.setContent('Delete file success!!');
                windowPanel.alert();
            }};
            windowPanel.setTitle('confirm');
            windowPanel.setContent('Are you sure to remove ' + filepath);
            windowPanel.confirm(eventData);
        }}}
    ], remotebinddate = [
        {'itemName': 'Refresh...', 'itemClass': 'refresh', 'events': {'click': function() {
            var srcfile = $('.remote .remotefile > li:first').data('path'),
                srcpath = srcfile.substring(0, srcfile.lastIndexOf('/'));

            if(!srcpath) srcpath = '/';
            controller.setPath(srcpath);
            // refresh
            showSubFolder(controller, 'remotefile');
        }}},
        {'itemName': 'Create Folder...', 'itemClass': 'newfold', 'events': {'click': function(event) {
            var srcfile = $('.remote .remotefile > li:first').data('path'),
                srcpath = srcfile.substring(0, srcfile.lastIndexOf('/')),
                $currentlist = $('.remote .remotefile'), dstfolder = srcpath + '/' + 'newFolder',
                target = event.currentTarget;

            if(!srcpath) {
                windowPanel.setContent('The system drive can not be new folder!!');
                windowPanel.alert();
                return false;
            }

            controller.mkdir(dstfolder, function(err) {
                if(err) {
                    windowPanel.setContent('Create folder failed!!');
                    windowPanel.alert();
                    return;
                }
                var li = document.createElement('li'), img = document.createElement('img'), div = document.createElement('div');

                // set value
                $(li).attr('data-path', dstfolder);
                $(img).attr({'src': 'icons/folder.png', 'alt': 'newFolder', 'width': '50px', 'height': '50px', 'title': 'newFolder'});
                $(div).attr({'title': 'newFolder', 'contenteditable': 'true'});
                $(div).text('newFolder');
                $(div).bind('blur paste copy cut', function(event) {
                    var newfile = srcpath + '/' + $(div).text();
                    controller.rename(dstfolder, newfile, function() {
                        var prev = $(target).prev();
                        prev.trigger('click');   // refresh the folder
                    });
                });

                li.appendChild(img);
                li.appendChild(div);

                $currentlist.append(li);
            });
        }}},
        {'itemName': 'Create file...', 'itemClass': 'newfile', 'events': {'click': function() {
            var srcfile = $('.remote .remotefile > li:first').data('path'),
                srcpath = srcfile.substring(0, srcfile.lastIndexOf('/')),
                $currentlist = $('.remote .remotefile'), dstfile = srcpath + '/' + 'newFile',
                target = event.currentTarget;

            if(!srcpath) {
                windowPanel.setContent('The system drive can not be new folder!!');
                windowPanel.alert();
                return false;
            }

            // new file and add to the folder
            controller.newFileIgnoreExists(dstfile, function(err, fd) {
                if(err) {
                    windowPanel.setContent('Sorry, new file failure');
                    windowPanel.alert();
                    return;
                }

                // close file first
                controller.closeFile(fd, function() {
                    var li = document.createElement('li'), img = document.createElement('img'), div = document.createElement('div');

                    // set value
                    $(li).attr('data-path', dstfile);
                    $(img).attr({'src': 'icons/blank.png', 'alt': 'newFile', 'width': '50px', 'height': '50px', 'title': 'newFile'});
                    $(div).attr({'title': 'newFile', 'contenteditable': 'true'});
                    $(div).text('newFile');
                    $(div).bind('blur paste copy cut', function(event) {
                        var newfile = srcpath + '/' + $(div).text();
                        controller.rename(dstfile, newfile, function() {
                            var prev = $(target).prev().prev();
                            prev.trigger('click');   // refresh the folder
                        });
                    });

                    li.appendChild(img);
                    li.appendChild(div);

                    $currentlist.append(li);
                });
            });
        }}},
        {'itemName': 'Rename...', 'itemClass': 'edit', 'events': {'click': function() {
            if(!$currentRemotefile) {
                windowPanel.setContent('Remote file must be chosen!!');
                windowPanel.alert();
                return;
            }

            var div = $currentRemotefile.children('div'), filepath = $currentRemotefile.data('path'),
                parentpath = filepath.substring(0, filepath.lastIndexOf('/'));

            // first, set field editable
            div.attr({'contenteditable': 'true'});

            div.bind('blur paste copy cut', function(event) {
                var newfile = parentpath + '/' + div.text();
                controller.rename(filepath, newfile, function() {
                    windowPanel.setContent('Rename file is OK!');
                    windowPanel.alert();
                    var prev = $(target).prev().prev().prev();
                    prev.trigger('click');   // refresh the folder
                });
            });
        }}},
        {'itemName': 'Delete...', 'itemClass': 'trash', 'events': {'click': function() {
            if(!$currentRemotefile) {
                windowPanel.setContent('It must be chosen one file to delete!!');
                windowPanel.alert();
                return false;
            }

            var target = event.currentTarget, filepath = $currentRemotefile.data('path'), refresh = $(target).siblings('.refresh');
            var eventData = {'click': function() {
                controller.delete(filepath);
                refresh.trigger('click');
                windowPanel.setContent('Delete file success!!');
                windowPanel.alert();
            }};
            windowPanel.setTitle('confirm');
            windowPanel.setContent('Are you sure to remove ' + filepath);
            windowPanel.confirm(eventData);
        }}}
    ];
    // register contextmenu event
    $localfileobj.bind('contextmenu', [$localfileobj, '.local > .file', localbinddata], menus);
    $remotefileobj.bind('contextmenu', [$remotefileobj, '.remote > .file', remotebinddate], menus);

    // register click event
    $localfileobj.bind('click', ['localfile'], fileListClick);
    $remotefileobj.bind('click', ['remotefile'], fileListClick);

    /**********************************************************************
     ***************************配置文件生成部分****************************
     **********************************************************************/
    $('.conf').bind('click', function() {
       $('.confpanel').css('display', 'block');
    });

    $('.sure').bind('click', function(event) {
        var $sourcepath = $('.sourcepath'), $remotepath = $('.remotepath'),sourcepath = $sourcepath.val(),
            remotepath = $remotepath.val(), filepath;

        var projectfile = process.cwd(), projectconfpath = projectfile + '/conf/shells',
            projectconffile = projectfile + '/conf/shells/configuration.conf';

        var srcfile = $('.remote .remotefile > li:first').data('path'),
            parentpath = srcfile.substring(0, srcfile.lastIndexOf('/'));

        // parent path is not exists, means that now it is root
        if(!parentpath) {
            windowPanel.setContent('Sorry, remote file path must not be root path');
            windowPanel.alert();
            return false;
        }

        if(!sourcepath || !remotepath) {
            windowPanel.setContent('Source path and Remote path must be exists!!');
            windowPanel.alert();
            return false;
        }
        if(!$currentRemotefile) {
            console.warn('The best way is that one of file should be chosen!');

            // user do not choose any folder, use current folder
            filepath = parentpath;
            parentpath = parentpath.substring(0, parentpath.lastIndexOf('/'));
        } else {
            filepath = $currentRemotefile.data('path');
        }

        // sourcepath and remotepath ignore last /
        if(sourcepath.lastIndexOf('/') === sourcepath.length -1) {
            sourcepath = sourcepath.substring(0, sourcepath.length - 1);
        }
        if(remotepath.lastIndexOf('/') === remotepath.length - 1) {
            remotepath = remotepath.substring(0, remotepath.length - 1);
        }

        var geneConf = function() {
            controller.geneConfiguration(sourcepath, remotepath, projectconffile, filepath, parentpath, function() {
                windowPanel.setContent('Generation Configuration success!!');
                windowPanel.alert();
                // set display none
                $('.confpanel').css('display', 'none');
            });
        };

        controller.isExists(projectconfpath, function(exists) {
            if(exists) {
                controller.isExists(projectconffile, function(exists) {
                    if(exists) {
                        geneConf();
                    } else {
                        controller.newEmptyFile(projectconffile);
                        geneConf();
                    }
                });
            } else {
                // first create folder, and create file
                controller.mkdir(projectconfpath, function(err) {
                    if(err) {
                        console.warn('Create folder failed:' + err);
                        return;
                    }

                    controller.newEmptyFile(projectconffile);
                    geneConf();
                });
            }
        });
    });

    $('.cancel').bind('click', function() {
        $('.confpanel').css('display', 'none');
    });
    /**********************************************************************
     ***************************提交更新部分********************************
     **********************************************************************/
    $('.commit').bind('click', function() {
        $('.commitupdates').css('display', 'block');
    });

    $('.surecommit').bind('click', function() {
        var $sourcepath = $('.sourcepath').val(), filepath,
            host = $('.host').val(), port = $('.port').val(), username = $('.username').val(), password = $('.password').val();

        if(!$sourcepath) {
            windowPanel.setContent('Source path must be exists!!');
            windowPanel.alert();
            return false;
        }
        if(!$currentRemotefile) {
            windowPanel.setContent('Remote file to send should be chosen!!');
            windowPanel.alert();
            return false;
        }

        if($sourcepath.lastIndexOf('/') !== $sourcepath.length - 1) {
            $sourcepath = $sourcepath + '/';
        }

        filepath = $currentRemotefile.data('path');

        var fileAttr = controller.fileAttr(filepath);

        var hostpath =
            $sourcepath + '/' + filepath.substring(filepath.lastIndexOf('/') + 1, filepath.length),
        projectfile = process.cwd(), projectconfpath = projectfile + '/conf';   // This the shell path

        var remoteController = new RemoteController();

        remoteController.setRemoteConfByObj({'host': host, 'port': parseInt(port), 'username': username,
            'password': password});
        // instance scp client
        /*remoteController.instanceScp();*/
        // set scp default
        remoteController.setScpDefaults();

        if(fileAttr === 'directory') {
            remoteController.remoteMkdir(hostpath, function(err) {
                if(err) {
                    windowPanel.setContent('file mkdir failed, you can restart program to continue!!');
                    windowPanel.alert();
                    return;
                }

                remoteController.scp(filepath, hostpath, function(err) {
                    if(err) {
                        windowPanel.setContent('file scp failed::' + err);
                        windowPanel.alert();
                        return;
                    }
                    remoteController.scp(projectconfpath, hostpath, function(err) {
                        if(err) {
                            windowPanel.setContent('scp file error!!');
                            windowPanel.alert();
                            return;
                        }
                        execSSH();
                    });
                });
            });

        } else if(fileAttr === 'file') {
            /*remoteController.remoteMkdir($sourcepath + '/toki', function(err) {
                if(err) {
                    alert('Remote create folder error::' + err);
                    return;
                }

                remoteController.scp(filepath, $sourcepath + '/toki', function(err) {
                    if(err) {
                        alert('scp file error!!');
                        return;
                    }

                    // don't forget to close connection
                    remoteController.scpClose();
                    execSSH();
                });
            });*/

            remoteController.scp(filepath, $sourcepath, function(err) {
                if(err) {
                    windowPanel.setContent('scp file error::' + err);
                    windowPanel.alert();
                    return;
                }

                remoteController.scp(projectconfpath, $sourcepath, function(err) {
                    if(err) {
                        windowPanel.setContent('scp file error::' + err);
                        windowPanel.alert();
                        return;
                    }
                    execSSH();
                });
            });
        }

        var execSSH = function() {
            // instance
            remoteController.instanceSSH();

            // register event, mkdir folder, scp file, exec shell to copy file
            remoteController.registerEvent(['ready', 'error', 'end', 'close'],[
                    function() {
                        // call shell to run
                        var shell = (fileAttr === 'directory') ? 'bash ' + hostpath + '/shells/replaceFiles.sh ' + hostpath + '/shells/configuration.conf' :
                            'bash ' + $sourcepath + 'shells/replaceFiles.sh ' + $sourcepath + 'shells/configuration.conf';

                        remoteController.executeCommand(shell, function(err, stream) {
                            if(err) {
                                windowPanel.setContent('executeCommand:: bash shell failed:' + err);
                                windowPanel.alert();
                                return;
                            }
                            var result = '', tmp;
                            stream.on('data', function(data, extended) {
                                tmp = (extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data;
                                result += tmp;
                            });
                            stream.on('end', function() {
                                console.log('Stream :: EOF');
                            });
                            stream.on('close', function() {
                                console.log('Stream :: close');
                            });
                            stream.on('exit', function(code, signal) {
                                console.log('Stream :: exit :: code: ' + code + ', signal: ' + signal);
                                windowPanel.setContent(result);
                                windowPanel.alert();
                                console.log(result);
                                remoteController.sshEnd();
                            });
                        });
                    }, function(err) {
                        console.log('Connection :: error :: ' + err);
                    }, function() {
                        console.log('Connection :: end');
                    }, function() {
                        console.log('Connection :: close');
                    }
                ]
            );

            // connect to remote host
            remoteController.connect();
        };
    });

    $('.cancelcommit').bind('click', function() {
        $('.commitupdates').css('display', 'none');
    });
});
