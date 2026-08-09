---
permalink: 2019/05/13/javascript/es6-arrow-vs-normal-function/
title: ES6中箭头函数和普通函数的区别
tags:
    - JavaScript
date: 2019-05-13 18:38:45
categories:
    - JavaScript
---
## 前言

最近在看 `ES6` 相关的文档，当讲解到箭头函数的时候，说了三个与普通函数的不同点，这里记录一番。

## 不同点

### 箭头函数的 this 指向定义时所在的对象

先来个普通函数的例子：

```javascript
var user = {
    name: 'demo',
    getInfo: function () {
        setTimeout(function () {
            console.log(this)
        }, 200)
    }
}
```

![普通函数的 this.png](/media/ext/1786239247491_u9fb1l.webp)

再来一个箭头函数的例子：

```javascript
var user = {
    name: 'demo',
    getInfo: function () {
        setTimeout(() => console.log(this), 200)
    }
}
```

![=> 函数的 this](/media/ext/1786239248190_alcx1a.webp)

### 箭头函数不可以作为构造函数(即不能使用 new)

普通函数的例子：

```javascript
var user = function () {}
```

![普通函数可以 new](/media/ext/1786239249111_1sx47i.webp)

箭头函数的例子：

```javascript
var user = () => {}
```

![=> 函数不可以使用 new](/media/ext/1786239249845_9mt3xx.webp)

### 箭头函数不能使用原型

普通函数的例子：

```javascript
var user = function () {}
```

![普通函数有 prototype](/media/ext/1786239250527_wbgsen.webp)


箭头函数的例子：

```javascript
var user = () => {}
```

![=> 没有 prototype](/media/ext/1786239251324_jb8rvz.webp)

### 箭头函数没有 arguments 对象

普通函数的例子：

```javascript
var user = function () {
    console.log(arguments)
}
```

![普通函数有 arguments](/media/ext/1786239252146_5qz6lj.webp)

```javascript
var user = () => {
    console.log(arguments)
}
```

![=> 没有 arguments](/media/ext/1786239252771_8s4kez.webp)

可以使用 `rest` 参数取代

```javascript
var user = (...args) => {
    console.log(args)
}
```

![使用 rest 参数取代](/media/ext/1786239253371_u9gznv.webp)

## 最后

做个笔记。