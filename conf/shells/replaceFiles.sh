#!/bin/bash

:<<HERE
    @author jackieLin
    @date 2014-01-24
    @content open file and replace all files
    ----------------------------------------
    file format
    source file    target file
    ...
    ----------------------------------------

    This is HERE document to write mutiple comments

    Usage:
        ./replaceFiles.sh /root/shells/a.txt
HERE

#---------------- init -----------------------------
if [ -z "${1}" ];then
    echo 'Usage: '
    echo "      `basename $0` FILE_PATH"
    exit 1
fi

file=${1}


if [ ! -f "$file" ];then
   echo "The file $file is not exsist!!"
   exit 1
fi

sourcefile=`awk -F ' ' '{print $1"\t"$2}' $file`

for list in $(awk -F ' ' '{print $1":"$2}' $file)
do
    # ${list%:*} ${list#*:} means that delete match substring and the return value is the string remain after deleting
    
    sourcefile=${list%:*}
    targetfile=${list#*:}
    
    if [ ! -f $sourcefile ];then
        echo "Sorry, the source file $sourcefile is not exists"
	continue	
    fi

    if [ ! -d $targetfile ];then
        echo "Sorry, the target directory $targetfile is not exists"
	mkdir -p $targetfile
        #continue
    fi

    # replace
    cp -f $sourcefile $targetfile
done

exit
