# 如何使用

1. `npm i`
2. 在`settings.json`配置书库路径，绝对路径和相对路径皆可
3. 将要阅读的书籍放入书库中（暂时只支持TXT文件）
4. `node startRead.js`
5. 按照提示进行阅读

# 配置文件

- bookList —— 存放书本的书库路径（文件夹）
- currentBook —— 当前阅读书籍
- history —— 历史记录
  - book —— 书名
  - pageSize ——页面大小
  - currentPage ——当前页码
- PageUp —— 上一页按键
- PageDwon —— 下一页按键
- Jump —— 跳转页码按键
- pageSize —— 默认页面大小，打开新书时默认使用此配置
- currentPage —— 默认当前页码，打开新书时默认使用此配置
- clearConsole —— 翻页时是否清空控制台
- showPercent —— 阅读进度是否显示百分比