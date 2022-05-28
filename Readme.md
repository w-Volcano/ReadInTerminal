# 如何使用

```powershell
npm i
```

```powershell
node startRead.js
```

根据提示进行操作。

# 配置文件

- bookList —— 存放书本的书库路径（文件夹）
- currentBook —— 当前阅读书籍
- history —— 历史记录（尽量不要手动修改）
  - book —— 书名
  - pageSize ——页面大小
  - currentPage ——当前页码
- PageUp —— 上一页按键
- PageDwon —— 下一页按键
- pageSize —— 默认页面大小，打开新书时默认使用此配置
- currentPage —— 默认当前页码，打开新书时默认使用此配置