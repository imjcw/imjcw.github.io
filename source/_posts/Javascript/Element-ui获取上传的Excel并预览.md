---
title: Element-ui获取上传的Excel并预览
tags:
    - Javascript
    - Element-UI
date: 2021-03-10 13:30:45
categories:
    - Javascript
---

## 前言

之前写了一篇《SheetJS生成/解析Excel》，并在实际项目中使用了，因为项目使用的是 `Element-UI` 写的，其中，用了 `upload` 组件。

## 实践

直接上代码(这里借用了之前的解析代码)：

```html
<el-upload
    ref="upload"
    limit="1"
    action=""
    :auto-upload="false"
    :on-change="parseExcel"
></el-upload>
```

```js
export default {
    data: function () {
        return {}
    },
    methods: {
        parseExcel (file, fileList) {
            // 分析头信息是否是excel
            if (
                file.raw.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                && file.raw.type != 'application/vnd.ms-excel'
            ) {
                this.$notify.error({
                  title: '错误',
                  message: '请上传Excel类型的文件'
                });
                this.$refs.upload.clearFiles();
                return false
            }

            let reader = new FileReader()
            let rABS = typeof FileReader !== "undefined" && (FileReader.prototype||{}).readAsBinaryString
            // 重点是下面的 file.raw
            if (rABS) {
                reader.readAsBinaryString(file.raw)
            } else {
                reader.readAsArrayBuffer(file.raw)
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
}
```

## 最后

不断突破。