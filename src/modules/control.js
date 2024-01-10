const readline = require('readline')
const path = require('path')
const fs = require('fs')
const jschardet = require('jschardet');
const iconv = require('iconv-lite');
const readlineSync = require('readline-sync');
const clc = require('cli-color');
const { getBookName } = require("../utils/index")
const { updateSettings } = require("../utils");
const { rootPath } = require("../constants");
function control(settings,books){
    readlineSync.setEncoding('utf8')
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    if(books.length===0){
        console.log(clc.underline(`当前书库未发现任何书籍，请先添加书籍(txt)`));
        process.exit(0)
    }
    console.log(clc.underline(`当前书库共有${books.length}本书，请选择：`))
    for (let i = 0; i < books.length; i++) {
        console.log(clc.blue.bold(`${i + 1} —— ${getBookName(books[i])}`))
    }
    let bookData = ''
    let bookDataLines = []
    r1.question(`选择你要阅读的书籍（输入书名前的数字）：`, num => {
        if(num<1||num>books.length){
            console.log(clc.red('非法输入，退出程序...'));
            r1.close()
            return
        }
        const buffer = fs.readFileSync(books[num - 1]);
        // 检测编码类型
        const detectedEncoding = jschardet.detect(buffer);
        const detectedCharset = detectedEncoding && detectedEncoding.encoding;
        if(!detectedCharset){
            console.log(clc.red("未检测出目标txt的编码，程序退出"))
            r1.close()
            return
        }
        let reader = fs.createReadStream(books[num - 1])
        console.log(`读取${getBookName(books[num - 1])}`);
        reader.on('data', (data) => {
            const content = iconv.decode(data,detectedCharset)
            bookData += content
        })
        reader.on('end', () => {
            console.log('读取完毕，加载历史记录···');
            his = settings.history.find(v => v.book === getBookName(books[num - 1]))

            if (his) {
                for (let i = 0; i < bookData.length / his.pageSize; i++) {
                    bookDataLines.push(bookData.substr(i * his.pageSize, his.pageSize))
                }
                if(his.length!==bookDataLines.length){
                    his.currentPage = parseInt((his.currentPage/his.length)*bookDataLines.length)
                    console.log(clc.bgWhite.black('检测到页面大小被修改，更新当前页码为'+his.currentPage));
                    his.length = bookDataLines.length
                }
                console.log(`加载历史记录完毕，现在《${clc.blue.bold(getBookName(books[num - 1]))}》第${clc.red.bold(his.currentPage)}页，页面大小${clc.yellow.bold(his.pageSize)}字，共${clc.green.bold(bookDataLines.length)}页`);
            } else {
                for (let i = 0; i < bookData.length / settings.pageSize; i++) {
                    bookDataLines.push(bookData.substr(i * settings.pageSize, settings.pageSize))
                }
                settings.history.push({
                    book: getBookName(books[num - 1]),
                    pageSize: settings.pageSize,
                    currentPage: settings.currentPage,
                    length:bookDataLines.length
                })
                his = settings.history[settings.history.length-1]
                console.log(`未找到历史记录，已创建，现在《${clc.blue.bold(getBookName(books[num - 1]))}》第${clc.red.bold(his.currentPage)}页，页面大小${clc.yellow.bold(his.pageSize)}字，共${clc.green.bold(bookDataLines.length)}页`);
            }
            // console.log(bookDataLines[bookDataLines.length-1]);
        })
        reader.on('close', () => {
            let flag = true
            const { keyMap } = settings;
            console.log(bookDataLines[his.currentPage - 1])
            while (flag) {
                let input
                const percent = ((his.currentPage-1)/bookDataLines.length*100).toFixed(2)+'%'
                const pageProgress = `${his.currentPage}/${bookDataLines.length}`
                console.log(`${settings.showPercent?clc.blue.bold(percent):""}；${clc.blue.bold(pageProgress)}；<${clc.red.bold(keyMap.PageUp)}>：上一页；<${clc.yellow.bold(keyMap.PageDown)}>：下一页；<${clc.green.bold(keyMap.Jump)}>：跳转`);
                input = readlineSync.question(``)
                let originPage = his.currentPage
                if (input.toLowerCase() == keyMap.PageUp) {
                    his.currentPage > 1 ? his.currentPage -= 1 : console.log('已经是第一页')
                } else if (input.toLowerCase() == keyMap.PageDown) {
                    his.currentPage < bookDataLines.length + 1 ? his.currentPage += 1 : console.log('已经是最后一页')
                } else if (input.toLowerCase() == keyMap.Jump){
                    page = readlineSync.question(`请选择跳转的页码（1-${bookDataLines.length}）：`)
                    if(page>=1&&page<=bookDataLines.length){
                        his.currentPage = parseInt(page)
                    }else{
                        console.log(clc.red('非法输入，退出程序'));
                        flag = false
                    }
                } else {
                    console.clear()
                    console.log(clc.red('非法输入，退出程序'));
                    updateSettings(path.join(rootPath,'./settings.json'),settings)
                    flag = false
                }
                if (originPage !== his.currentPage) {
                    if(settings.clearTerminal)console.clear()
                    console.log(bookDataLines[his.currentPage - 1]);
                }
            }
        })
    })
}
module.exports = {
    control
}