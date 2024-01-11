const path = require("path");
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
};
const mode = process.argv[2];
let prePath = path.dirname(process.execPath);
if(mode === "--mode") {
	const parameter = process.argv[3];
	if(parameter === "development") {
		prePath = __dirname;
	}
}
const rootPath = path.join(prePath,"./");
module.exports = {
	settingJsonTemplate,
	rootPath
};