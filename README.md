同步指定的文件夹。  
**使用方法：**  
1. 通过npm全局安装
```shell
npm install file-sync -g
```
2. 指定监听
```shell
sync watch --source sourcePath --target sourcePath --interval intervalTime --ignore ignorePathReg
```
`source`待同步源路径
`target`同步的目标路径
`interval`修改文件之后，同步间隔时间
`ignore` 忽略的目录，支持正则