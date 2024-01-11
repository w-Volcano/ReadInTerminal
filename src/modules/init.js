const clc = require("cli-color");
const fs = require("fs");
const path = require("path");
const { checkFileExists, updateSettings, isFile, createDir} =require("../utils");
const { rootPath} =require("../constants");

function init(){
	// 初始化1：读取或释放释放配置文件
	console.log("正在读取配置文件...");
	let settings = {};
	const settingsPath = path.join(rootPath,"./settings.json");
	if(!checkFileExists(settingsPath)){
		updateSettings(settingsPath);
		console.log("配置文件不存在，已释放...");
	}
	try {
		let tmp = fs.readFileSync(settingsPath, "utf-8");
		settings = JSON.parse(tmp);
	} catch (error) {
		console.log(clc.red("读取配置文件失败，请检查配置文件存在或格式"));
		process.exit(0);
	}

	// 初始化2：读取或释放书库

	let bookListPath = settings.bookList;
	// 判断是否为绝对路径
	if(bookListPath.indexOf(":")===-1){
		bookListPath = path.join(rootPath, settings.bookList);
	}

	if(!checkFileExists(bookListPath)){
		createDir(bookListPath);
		console.log("书库文件夹不存在，已释放...");
	}
	console.log("当前书库路径为：", bookListPath);
	let books;
	try {
		books = fs.readdirSync(bookListPath).map(fileName => {
			return path.join(bookListPath, fileName);
		}).filter(isFile);
	} catch (error) {
		console.log(clc.red("读取书库失败，请在setting.json中检查配置路径"));
		process.exit(0);
	}
	return { settings, books };
}
module.exports = { init };