var fs = require('fs');

module.exports = {
    FILE_COMPARE_BUFFER_SIZE: 4096,
    BAK: false,
    OPERA_UPDATE: 0,
    OPERA_DELETE: 1,

    filesExist(files){
        return files.every(file => {
            return fs.existsSync(file)
        });
    },
}