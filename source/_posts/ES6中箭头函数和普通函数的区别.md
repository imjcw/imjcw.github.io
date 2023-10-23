---
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

![普通函数的 this.png](https://img-blog.csdnimg.cn/img_convert/4e9231222d334b1f09a3d0b5a6455f23.png)

再来一个箭头函数的例子：

```javascript
var user = {
    name: 'demo',
    getInfo: function () {
        setTimeout(() => console.log(this), 200)
    }
}
```

![=> 函数的 this](https://img-blog.csdnimg.cn/img_convert/bb30f5fad2555ba70a13420585574eaf.png)

### 箭头函数不可以作为构造函数(即不能使用 new)

普通函数的例子：

```javascript
var user = function () {}
```

![普通函数可以 new](https://img-blog.csdnimg.cn/img_convert/7b92fdddfb09e32ac47edf3026f38d4f.png)

箭头函数的例子：

```javascript
var user = () => {}
```

![=> 函数不可以使用 new](https://img-blog.csdnimg.cn/img_convert/634f222b53568cda874218b94b829fb8.png)

### 箭头函数不能使用原型

普通函数的例子：

```javascript
var user = function () {}
```

![普通函数有 prototype](https://img-blog.csdnimg.cn/img_convert/1d7a003855fdac6c856575c56c2da1a8.png)


箭头函数的例子：

```javascript
var user = () => {}
```

![=> 没有 prototype](https://img-blog.csdnimg.cn/img_convert/6ef11871c05b37942ac7c5fb0df1b095.png)

### 箭头函数没有 arguments 对象

普通函数的例子：

```javascript
var user = function () {
    console.log(arguments)
}
```

![普通函数有 arguments](https://img-blog.csdnimg.cn/img_convert/be172e9540d2e133a0e358f2693821e9.png)

```javascript
var user = () => {
    console.log(arguments)
}
```

![=> 没有 arguments](https://img-blog.csdnimg.cn/img_convert/783954af98becedd8c8ebdca414f5063.png)

可以使用 `rest` 参数取代

```javascript
var user = (...args) => {
    console.log(args)
}
```

![使用 rest 参数取代](https://img-blog.csdnimg.cn/img_convert/522caeb9e5b4c24aad1db1a8e617fab4.png)

## 最后

做个笔记。