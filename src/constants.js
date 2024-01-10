const path = require('path')
const settingJsonTemplate = {
    "bookList": "./books",
    "history": [],
    "keyMap": {
        "PageUp": "a",
        "PageDown": "d",
        "Jump": "."
    },
    "pageSize": 400,
    "currentPage": 1,
    "clearTerminal": true,
    "showPercent": true
}

const rootPath = path.join(path.dirname(process.execPath),"./")
module.exports = {
    settingJsonTemplate,
    rootPath
}