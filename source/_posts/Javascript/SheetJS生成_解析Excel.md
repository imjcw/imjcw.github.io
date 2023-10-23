---
title: SheetJS生成/解析Excel
tags:
    - Javascript
date: 2021-03-04 13:30:45
categories:
    - Javascript
---

## 前言

新公司的后台经常有一些数据导出的功能，而不少情况是导出筛选出来的数据(没有分页的那种)。

这个时候，再让后端去跑一遍逻辑，有点浪费，如果前端可以自己做完就完美了。

## SheetJS(js-xlsx)

项目地址：[sheetjs](https://github.com/SheetJS/sheetjs)

因为需求比较简单，只是导入导出，目前还没遇到什么问题。

官方有 `Pro` 版，看到有人说过，有很多版本，具体报价还是看诉求。

### 兼容性

![图片来源于网络](/media/Javascript/sheetjs.png)

### 使用方式

官方的 `README.md` 已经介绍的很详细了，下面简单介绍一下。

#### 使用CDN

```html
<script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
```

#### 使用NPM

```bash
npm install xlsx
```

### 官方demo

官方的 `demo` 还是蛮多的，链接：[github](https://github.com/SheetJS/sheetjs/tree/master/demos)

有部分 `demo` 可能存在问题，看的时候最好运行一遍。

### 简单下载示例

这里演示了 `aoa_to_sheet` 和 `json_to_sheet` 两种方式。

还有 `table_to_sheet` 可以直接将 `DOM` 直接转换成 `excel`。目前没有这方面诉求，也就没尝试这个方式，猜测可能对于 `DOM` 有一些要求。

[Demo 传送门](http://imjcw.gitee.io/demos/sheetjs/export.html)

```javascript
/**
 * JSON转换Excel
 */
function json2Sheet () {
    let json = [
        {
            "姓名": "张三",
            "性别": "男",
            "年龄": 18
        },
        {
            "姓名": "李四",
            "性别": "女",
            "年龄": 19
        },
        {
            "姓名": "王二麻",
            "性别": "未知",
            "年龄": 20
        }
    ]

    // 实例化一个工作簿
    let book = XLSX.utils.book_new()

    // 实例化一个Sheet
    let sheet = XLSX.utils.json_to_sheet(json, {
        header: ['姓名', '性别', '年龄']
    })

    // 将Sheet写入工作簿
    XLSX.utils.book_append_sheet(book, sheet, 'Sheet1')

    // 写入文件，直接触发浏览器的下载
    XLSX.writeFile(book, 'json2Sheet.xlsx')
}

/**
 * 数组转换Excel
 */
function array2Sheet () {
    let data = [
        ['姓名', '性别', '年龄'],
        ['张三', '男', '18'],
        ['李四', '女', '19'],
        ['王二麻', '未知', '20']
    ]

    // 实例化一个工作簿
    let book = XLSX.utils.book_new()

    // 实例化一个Sheet
    let sheet = XLSX.utils.aoa_to_sheet(data)

    // 将Sheet写入工作簿
    XLSX.utils.book_append_sheet(book, sheet, 'Sheet1')

    // 写入文件，直接触发浏览器的下载
    XLSX.writeFile(book, 'array2Sheet.xlsx')
}
```

### 简单解析示例

这里是针对 `input:file` 上传之后的结果进行解析的。

主要用到了两个方法：`XLSX.read` 和 `XLSX.utils.sheet_to_aoa`。

[Demo 传送门](http://imjcw.gitee.io/demos/sheetjs/parse.html)

```javascript
/**
 * JSON转换Excel
 */
function parseExcel (fileDom) {
    let file = fileDom.files[0]
    let reader = new FileReader()
    let rABS = typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString
    if (rABS) {
        reader.readAsBinaryString(file)
    } else {
        reader.readAsArrayBuffer(file)
    }
    reader.onload = function(e) {
        let data = e.target.result
        if (!rABS) {
            data = new Uint8Array(data)
        }
        let workBook = XLSX.read(data, {type: rABS ? 'binary' : 'array'})
        workBook.SheetNames.forEach(name => {
            let sheet = workBook.Sheets[name]
            let json = XLSX.utils.sheet_to_json(sheet, {
                raw: false,
                header: 1
            })
            // TODO 处理数据
        })
    }
}
```

## 最后

更多的功能还是要通过阅读官方的文档完成。