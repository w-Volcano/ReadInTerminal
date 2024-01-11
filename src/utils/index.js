const {settingJsonTemplate} = require("../constants");
const fs = require("fs");
function checkFileExists(_path) {
	try {
		fs.accessSync(_path, fs.constants.F_OK);
		return true;
	} catch (err) {
		return false;
	}
}
function createDir(_path){
	fs.mkdir(_path, function(err) {
		if (err) throw err;
	});
}
function updateSettings(_path,settingObj){
	const content = JSON.stringify(settingObj ?? settingJsonTemplate,null,2);
	fs.writeFileSync(_path ,content , "utf-8");
}

function getBookName(_path) {
	return _path.slice(_path.lastIndexOf("\\") + 1);
}
function isFile(fileName){
	return fs.lstatSync(fileName).isFile() && fileName.endsWith(".txt");
}
module.exports = {
	checkFileExists,
	updateSettings,
	createDir,
	isFile,
	getBookName
};