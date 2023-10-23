---
title: JS数组合并
tags:
    - Javascript
date: 2020-12-03 13:30:45
categories:
    - Javascript
---

## 前言

项目过程中，经常会遇到 `JS` 数组合并的情况，时常为这个纠结。这里整理一下。

## 简单而实用的for

最容易想到的莫过于 `for` 了。

*会变更原数组，当然也可以写成生成新数组的形式。*

```javascript
let arr = [1, 2]
let arr2 = [3, 4]

for (let i in arr2) {
    arr.push(arr2[i])
}

console.log(arr)
// [1, 2, 3, 4]
```

## arr.concat(arr2)

*会生成新的数组。*

```javascript
let arr = [1, 2]
let arr2 = [3, 4]

arr = arr.concat(arr2)

console.log(arr)
// [1, 2, 3, 4]
```

## arr.push.apply(arr, arr2)

第一种 `for` 循环就是使用的 `push` 来实现的。

因为 `push` 是可以接收多个参数的，所以我们可以使用 `apply` 来实现。

*会变更原数组。*

```javascript
let arr = [1, 2]
let arr2 = [3, 4]

arr.push.apply(arr, arr2)

console.log(arr)
// [1, 2, 3, 4]
```

## [...arr, ...arr2]

`ES6` 的语法，简单而实用。

*会生成新的数组。*

```javascript
let arr = [1, 2]
let arr2 = [3, 4]

arr = [...arr, ...arr2]

console.log(arr)
// [1, 2, 3, 4]
```

## push(...arr)

`push` 结合 `...[]` 来实现。

*会变更原数组。*

```javascript
let arr = [1, 2]
let arr2 = [3, 4]

arr.push(...arr2)

console.log(arr)
// [1, 2, 3, 4]
```

## 最后

实现方式大同小异，可以理解那最容易理解的一部分。