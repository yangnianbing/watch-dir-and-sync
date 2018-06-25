#!/usr/bin/env node

var fs = require('fs');
const chokidar = require('chokidar');
const program = require('commander');
const util = require('./util')
const fileSync = require('./file-sync');

var command = program.command('watch')
            .description('同步指定的文件夹')
            .option('--source [source]', '源目录路径')
            .option('--target [target]', '目标目录')
            .option('--ignored [ignored]', '目标目录')
            .option('--interval [interval]', '间隔时间');

command.action(option => {
    var {source, target, interval, ignored} = option;
    if(!source || !target){
        console.log('source and target can not be empty');
        return;
    }

    const watcher = chokidar.watch(source, {
        usePolling: false,
        persistent:true,       //true：如果文件继续被监听就不会退出进程， 默认为true
        ignored:  ignored ? ignored : undefined,
    
        //ignoreInitial: false,      //默认为false，表示在ready之前不触发add和addDir事件
        //followSymlinks: true,    
        // cwd: '.',                        //paths的相对路径
        // disableGlobbing: false,
        // interval: 100,                 //当usePolling为true的时候有效，采用轮询方式时的间隔
        // binaryInterval: 300,         //当usePolling为true的时候有效，轮询二进制文件的时间间隔
        // alwaysStat: false,           
        // depth: 99,                       //迭代子目录的层级数
        awaitWriteFinish:  interval ? {              
            stabilityThreshold: interval,        //设置该参数的时候，如果文件新增或者发生变化的时候，change或者add事件不会立刻被触发，而是轮询发现一段时间内文件size没有变化的时候才会触发
            pollInterval: interval
        } : false,
        // ignorePermissionErrors: false,       //忽略掉文件的访问权限错误
        // atomic: true                                 
    })
    
    watch(['add', 'change'], function(filePath){
        option.type= util.OPERA_UPDATE;      
        fileSync(filePath, option);
    }, watcher);
    
    watch(['unlink', 'unlinkDir'], function(filePath){      
        option.type= util.OPERA_DELETE;      
        fileSync(filePath, option);
    }, watcher);    

    watch('ready', function(){
        console.log('watcher init ready')
    }, watcher)
})

program.parse(process.argv);

function watch(events, handler, watcher){
    if(typeof events === 'object' && events.length !== undefined){
        events.forEach(event => {
            watcher.on(event, handler)        
        })
    }else{
        watcher.on(events, handler)
    }
}

