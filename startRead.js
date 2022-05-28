const readline = require('readline')
const path = require('path')
const fs = require('fs')
const readlineSync = require('readline-sync');
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

console.log('正在读取配置文件...')
let settings = {}
try {
    let tmp = fs.readFileSync(path.join(__dirname,'./settings.json'), 'utf-8')
    settings = JSON.parse(tmp)
} catch (error) {
    console.log('读取配置文件失败，请检查配置文件存在或格式');
    return
}
let bookList = path.join(__dirname, settings.bookList)
console.log('当前书库路径为：', bookList);

let books = fs.readdirSync(bookList).map(fileName => {
    return path.join(bookList, fileName)
}).filter(isFile)
// let his = null
// his = books.find(v => settings.currentBook === getBookName(v))
// if(his){
//     console.log(`检测到上次阅读书籍为《${settings.currentBook}》，是否继续阅读`)
// }
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
    let reader = fs.createReadStream(books[num - 1], {
        encoding: 'utf-8'
    })
    console.log(`读取${getBookName(books[num - 1])}`);
    reader.on('data', (data) => {
        bookData += data
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
            settings.history.push({
                book: getBookName(books[num - 1]),
                pageSize: settings.pageSize,
                currentPage: settings.currentPage,
                length:bookDataLines.length
            })
            for (let i = 0; i < bookData.length / settings.pageSize; i++) {
                bookDataLines.push(bookData.substr(i * settings.pageSize, settings.pageSize))
            }
            console.log(`未找到历史记录，已创建，现在《${getBookName(books[num - 1])}》第${his.currentPage}页，页面大小${his.pageSize}字，共${bookDataLines.length}页`);
        }
        // console.log(bookDataLines[bookDataLines.length-1]);
    })
    reader.on('close', () => {
        let flag = true
        console.log(bookDataLines[his.currentPage - 1])
        while (flag) {
            let input = readlineSync.question(`${((his.currentPage-1)/bookDataLines.length*100).toFixed(2)+'%'};Q:Page Up;E:Page Down\n`, { encoding: 'utf-8' })
            let originPage = his.currentPage
            if (input.toLowerCase() == settings.PageUp) {
                his.currentPage > 1 ? his.currentPage -= 1 : console.log('已经是第一页')
            } else if (input.toLowerCase() == settings.PageDown) {
                his.currentPage < bookDataLines.length + 1 ? his.currentPage += 1 : console.log('已经是最后一页')
            } else {
                console.log('非法输入');
                console.clear()
                fs.writeFileSync(path.join(__dirname,'./settings.json'), JSON.stringify(settings), 'utf-8')
                flag = false
            }
            if (originPage !== his.currentPage) {
                console.clear()
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