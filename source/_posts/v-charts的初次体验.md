---
title: v-charts的初次体验
tags:
    - JavaScript
    - VueJs
date: 2019-08-13 18:38:45
categories:
    - JavaScript
---
## 前言

最近做一个小项目，用到了图表，由于前端是基于 `vue` 编写的，自然而然是要用 `vue` 相关的扩展了。

说句实话，`vue` 的生态还是蛮不错的，最终选定是用 [`v-charts`](https://v-charts.js.org/#/) 来实现相关功能。

## v-charts相关

`github`：[v-charts](https://github.com/ElemeFE/v-charts)

`文档`：[v-charts](https://v-charts.js.org/)

## 使用方式

直接看文档吧

## 折线图使用直线

![折线图使用直线](https://img-blog.csdnimg.cn/img_convert/7137c76d172f2759a67cb109cff3b16f.png)

```javascript
<template>
  <ve-line :data="chartData" :extend="extend"></ve-line>
</template>

<script>
  export default {
    data: function () {
      return {
        extend: {
            series: {
            smooth: false
          }
        },
        chartData: {
          columns: ['日期', '访问用户', '下单用户', '下单率'],
          rows: [
            { '日期': '1/1', '访问用户': 1393, '下单用户': 1093, '下单率': 0.32 },
            { '日期': '1/2', '访问用户': 3530, '下单用户': 3230, '下单率': 0.26 },
            { '日期': '1/3', '访问用户': 2923, '下单用户': 2623, '下单率': 0.76 },
            { '日期': '1/4', '访问用户': 1723, '下单用户': 1423, '下单率': 0.49 },
            { '日期': '1/5', '访问用户': 3792, '下单用户': 3492, '下单率': 0.323 },
            { '日期': '1/6', '访问用户': 4593, '下单用户': 4293, '下单率': 0.78 }
          ]
        }
      }
    }
  }
</script>
```

## 最后

目前使用的比较浅显，之后如果有遇到其它问题，会同步更新。