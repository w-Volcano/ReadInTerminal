const readline = require('readline')
const path = require('path')
const fs = require('fs')
const jschardet = require('jschardet');
const iconv = require('iconv-lite');
const readlineSync = require('readline-sync');
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
function rlPromisify(fn) {
    return async (...args) => {
        return new Promise(resolve => fn(...args, resolve));
    };
}
const question = rlPromisify(r1.question.bind(r1));
console.log('正在读取配置文件...')
let settings = {}
try {
    let tmp = fs.readFileSync(path.join(__dirname,'./settings.json'), 'utf-8')
    settings = JSON.parse(tmp)
} catch (error) {
    console.log('读取配置文件失败，请检查配置文件存在或格式');
    process.exit(0)
}
let bookList = settings.bookList
// 判断是否为绝对路径
if(bookList.indexOf(':')===-1){
    bookList = path.join(__dirname, settings.bookList)
}

console.log('当前书库路径为：', bookList);
let books
try {
    books = fs.readdirSync(bookList).map(fileName => {
        return path.join(bookList, fileName)
    }).filter(isFile)
} catch (error) {
    console.log('读取书库失败，请在setting.json中检查配置路径');
    process.exit(0)
}

console.log(`当前书库共有${books.length}本书，请选择：`)
for (let i = 0; i < books.length; i++) {
    console.log(`${i + 1} —— ${getBookName(books[i])}`)
}
let bookData = ''
let bookDataLines = []
r1.question(`选择你要阅读的书籍（输入书名前的数字）：`, num => {
    if(num<1||num>books.length){
        console.log('非法输入，退出程序...');
        r1.close()
        return
    }
    const buffer = fs.readFileSync(books[num - 1]);
    // 检测编码类型
    const detectedEncoding = jschardet.detect(buffer);
    const detectedCharset = detectedEncoding && detectedEncoding.encoding;
    if(!detectedCharset){
        console.log("未检测出目标txt的编码，程序退出")
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
                console.log('检测到页面大小被修改，更新当前页码为'+his.currentPage);
                his.length = bookDataLines.length
            }
            console.log(`加载历史记录完毕，现在《${getBookName(books[num - 1])}》第${his.currentPage}页，页面大小${his.pageSize}字，共${bookDataLines.length}页`);
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
            console.log(`未找到历史记录，已创建，现在《${getBookName(books[num - 1])}》第${his.currentPage}页，页面大小${his.pageSize}字，共${bookDataLines.length}页`);
        }
        // console.log(bookDataLines[bookDataLines.length-1]);
    })
    reader.on('close', () => {
        let flag = true
        console.log(bookDataLines[his.currentPage - 1])
        while (flag) {
            let input
            if(settings.showPercent){
                console.log(`${((his.currentPage-1)/bookDataLines.length*100).toFixed(2)+'%'}；<${settings.PageUp}>：上一页；<${settings.PageDown}>：下一页；<${settings.Jump}>：跳转`);
                input = readlineSync.question(``)
            }else{
                console.log(`${his.currentPage}/${bookDataLines.length}；<${settings.PageUp}>：上一页；<${settings.PageDown}>：下一页；<${settings.Jump}>：跳转`);
                input = readlineSync.question(``)
            }
            let originPage = his.currentPage
            if (input.toLowerCase() == settings.PageUp) {
                his.currentPage > 1 ? his.currentPage -= 1 : console.log('已经是第一页')
            } else if (input.toLowerCase() == settings.PageDown) {
                his.currentPage < bookDataLines.length + 1 ? his.currentPage += 1 : console.log('已经是最后一页')
            } else if (input.toLowerCase() == settings.Jump){
                page = readlineSync.question(`请选择跳转的页码（1-${bookDataLines.length}）：`)
                if(page>=1&&page<=bookDataLines.length){
                    his.currentPage = parseInt(page)
                }else{
                    console.log('非法输入，退出程序');
                    flag = false
                }
            } else {
                console.clear()
                console.log('非法输入，退出程序');
                fs.writeFileSync(path.join(__dirname,'./settings.json'), JSON.stringify(settings,null,2), 'utf-8')
                flag = false
            }
            if (originPage !== his.currentPage) {
                if(settings.clearConsole)console.clear()
                console.log(bookDataLines[his.currentPage - 1]);
            }
        }
    })
})



function getBookName(path) {
    return path.slice(path.lastIndexOf('\\') + 1)
}
function isFile(fileName){
    return fs.lstatSync(fileName).isFile() && fileName.endsWith(".txt")
}