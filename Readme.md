# 如何使用

## 直接使用

1. `npm i`
2. `npm run start`
3. 按照提示进行阅读
4. `npm run build`，打包为`exe`文件

## 可执行文件(exe)使用

1. 打开`exe`文件所在终端
2. `.\readInTerminal.exe`
3. 首次使用会自动释放配置文件和书库
4. 可配合环境变量在任意终端下使用

# 配置文件
```json
{
  "bookList": "./books",  // 存放书本的书库路径（文件夹），目前只支持txt文件
  "history": [            // 历史记录
    {
      "book": "书名",
      "pageSize": "页面大小",
      "currentPage": "当前页码"
    }
  ],  
  "keyMap": {             // 按键映射
    "PageUp": "a",        // 上一页按键
    "PageDown": "d",      // 下一页按键
    "Jump": "."           // 跳转页码按键
  },
  "pageSize": 400,        // 页面大小：当前页面字符数量，打开新书时默认使用此配置
  "currentPage": 1,       // 默认从这一页开始，打开新书时默认使用此配置
  "clearTerminal": true,  // 翻页时是否自动清空终端
  "showPercent": true     // 阅读进度是否显示百分比
}
```