const fs = require('fs');
const path = require('path');
const bufferEqual = require('buffer-equal');
const util = require('./util');

module.exports = function(sourceFilePath, context){
    var relativePath = path.relative(context.source, sourceFilePath);
    var targetFilePath = path.resolve(context.target, relativePath);

    if(context.type === util.OPERA_DELETE){
        removeFile(targetFilePath);
        return;
    }

    if(!filecompare(sourceFilePath, targetFilePath, util.FILE_COMPARE_BUFFER_SIZE)){
        copyFile(sourceFilePath, targetFilePath, util.BAK);
    }
}

/**
 * 删除文件
 * @param {*} targetFilePath 删除文件的路径
 */
function removeFile(targetFilePath){
    if(fs.existsSync(targetFilePath)){
        fs.removeFile(targetFilePath);
    }
}

/**
 * 复制文件
 * @param {*} sourceFilePath 源文件地址
 * @param {*} targetFilePath 复制的文件地址
 * @param {*} bak是否备份，如果备份，会将修改前的文件名添加后缀.bak
 */
function copyFile(sourceFilePath, targetFilePath, bak){
    mkdirsSync(path.dirname(targetFilePath));
    if(fs.existsSync(targetFilePath) && bak){
        fs.renameSync(targetFilePath, targetFilePath + '.bak');
    }

    fs.copyFileSync(sourceFilePath, targetFilePath)
}

/**
 * 递归创建文件夹
 * @param {*} dirpath 文件夹路径
 */
function mkdirsSync(dirpath){
    if(!fs.existsSync(dirpath)){
        var pathtmp = '';
        dirpath.split(path.sep).forEach(function(dirname) {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname);
            }
            else {
                pathtmp = dirname;
            }
            if (!fs.existsSync(pathtmp)) {
                if (!fs.mkdirSync(pathtmp)) {
                    return false;
                }
            }
        });
    }
    return true;
}

/**
 * 比两个路径的文件是否相同
 * @param {*} path1 
 * @param {*} path2 
 * @param {*} bufferSize 
 */
function filecompare(path1, path2, bufferSize){
   if(!util.filesExist([path1, path2])){
        return false;
   }
    const fd1 = fs.openSync(path1, 'r');
    const fd2 = fs.openSync(path2, 'r');
    const buffer1 = new Buffer(bufferSize);
    const buffer2 = new Buffer(bufferSize);
    while(true){
        let size1 = fs.readSync(fd1, buffer1,0, bufferSize, null);
        let size2 = fs.readSync(fd2, buffer2, 0, bufferSize, null);
        if(size1 !== size2){
            close();
            return false;
        }else if(size1 === 0){
            close()
            return true;
        }else if(!compareBuffers(buffer1, buffer2, size1, bufferSize)){
            close();
            return false;
        }
    } 

    function close(){
        closeFile([fd1, fd2]);
    }
}

/**
 * 比较两个buffer是否相等
 * @param {*} buf1 
 * @param {*} buf2 
 * @param {*} contentSize 
 * @param {*} allocatedSize 
 */
function compareBuffers(buf1, buf2, contentSize, allocatedSize){
    if(contentSize===allocatedSize){
        return bufferEqual(buf1, buf2);
    } else{
        return bufferEqual(buf1.slice(0, contentSize), buf2.slice(0, contentSize));
    }
}

/**
 * 关闭文件
 * @param {*} f 
 */
function closeFile(f){
    f.forEach(fd => {
        fs.closeSync(fd);
    })
}

