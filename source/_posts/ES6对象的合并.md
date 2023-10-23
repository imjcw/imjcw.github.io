---
title: ES6对象的合并
tags:
    - JavaScript
date: 2019-06-13 18:38:45
categories:
    - JavaScript
---
## 前言

有时候，我们需要将传进来的对象与默认对象进行合并。

在使用 `ES5` 的时候，经常需要自己写一个方法专门做这样的事情。

而在 `ES6` 中，可以使用 `Object.assign` 方法，更加便利了。

## 语法

> Object.assign(target, ...sources)

返回值合并之后的对象

## 编码运行

```javascript
const object1 = {
    a:1,
    b:2,
    c:3
}

const object2 = {
    c:4,
    d:5
}

const object_merge = Object.assign(object1, object2)

console.log(object_merge);
```

![ES6 对象合并](https://img-blog.csdnimg.cn/img_convert/a81e52ad7e34528d48b9fc6e6cbcbe62.png)