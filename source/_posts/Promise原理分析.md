---
title: Promise原理分析
tags:
    - Promise
    - JavaScript
date: 2019-07-14 18:38:45
categories:
    - JavaScript
---
## 前言

最近讨论到了 `Promise`，此前知道也使用过它，但是对于其原理却不甚了解。

于是翻了翻 `MDN` 上的文档，又找了几篇文章看了看，研究了研究。

最终，自己尝试了一番，对于其原理也有所了解。

## Promise的使用

先回顾一下 `Promise` 的使用。

这里只是简单的调用，如果需要系统学习，还是移步 `MDN` 上的文档。

```javascript
new Promise((resolve) => {
    setTimeout(() => {
        console.log(1)
        resolve(1)
    })
})
.then((response) => (console.log(++response), response))
.then((response) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(1)
            resolve(1)
        })
    })
})
.then((response) => (console.log(++response), response))
```

执行结果如下：

![img](https://img-blog.csdnimg.cn/img_convert/97ed5e3f4d41dcf1ff78ecd6b597bf20.png)

## 代码分析

> 一个 `Promise` 就是一个代表了异步操作最终完成或者失败的对象。
>
> ---- 摘自 MDN

第一步，实例化一个 `Promise` 对象。

它的参数就是一个函数，此函数会接受两个参数，分别是 `resolve` 和 `reject`。

当操作成功时，则执行 `resolve`。

当操作失败时，则执行 `reject`。

```javascript
new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log(1)
        resolve(1)
    })
})
```

回调之后的操作可以用其提供的 `then` 方法。

`then` 接受两个参数，分别是 `resolve` 和 `reject`。原理同上。

```javascript
new Promise((resolve) => {
    setTimeout(() => {
        console.log(1)
        resolve(1)
    })
})
.then((response) => (console.log(++response), response))
```

从上述代码里可以看出，我们使用了 `setTimeout`。

也就是说，`then` 方法会在 `setTimeout`  里的方法之前执行。

如果没有 `Promise` 的特殊机制，输出的结果可能就是 `undefined、undefined、1、1` 了。

这就是 `Promise` 的魅力，也是我想要知道的地方。

## 原理分析

既然是要分析其原理，那么按照其特性和使用方式来仿造一个是一个不错的选择。(主要是我不知道它的源码是什么<(＿　＿)>)

### 基本结构

先实现实例化的部分。

从上面的代码，我们已经知道，实例化的时候，只需要传 **一个参数** 就可以了，同时这个 **参数** 是一个 **函数**。

从执行结果来看，在我们实例化的时候，这个 **函数** 已经 **执行** 了。

并且这个函数会接收到 **两个参数**，这 **两个参数** 都是 **函数**。

```javascript
function PromiseDemo(foo) {
    if (typeof foo != 'function') {
        throw Error('Promise 的参数必须是函数')
    }

    // 成功后执行的函数
    let resolve = response => {}

    // 失败后执行的函数
    let reject = response => {}

    // 实例化后，立即执行函数
    foo(resolve, reject)
}
```

`then` 方法部分。

`then` 方法是 `Promise` 对象的一个方法，我们需要将其暴露出来。

同时，`then` 方法支持链式的调用，所以返回值肯定是一个 `Promise` 对象。

```javascript
function PromiseDemo(foo) {
    // 成功后执行的函数
    let resolve = response => {}

    // 失败后执行的函数
    let reject = response => {}

    // 实现 then 函数
    let then = (onResolved, onRejected) => {
        return new PromiseDemo((resolved, rejected) => {
            // todo...
        })
    }

    // 实例化后，立即执行函数
    foo(resolve, reject)

    return {
        then: then
    }
}
```

到这里，基本的结构已经有了，我们已经可以执行相关代码了，就是还没有想要的效果。

### 属性完善

通过一开始的示例分析，我们可以看出，*`then` 参数接收到的参数是从上层传递到下层的*。

这句话有点绕，参数的参数。所以，`Promise` 对象就要有一个存放返回值的属性，这里就给它命名为 `data`。

同时，`then`  函数的参数，是在 `setTimeout` 执行之后才执行的。那么，`Promise` 对象就要有一个存放任务的列表，这里就给它命名为 `queue`。

到这里，问题就来了，什么时候应该将任务放入任务列表呢？是还没有执行的，还是执行成功的，还是执行失败的？

说到这里，我们就要有一个标识表明这个任务是处于什么状态，是未执行，还是已执行，还是执行失败。这里就给它命名为 `state`，值分别为 `pending`、`resolved`、`rejected`。

上述文字有点长，主要就是定义了 `Promise` 的三个属性：`state`、`queue`、`data`。

```javascript
let state = 'pending'
    , queue = []
    , data
```

### 实现 `then` 函数

#### 为什么不返回 `this`

上面分析实例的时候有说到，为了能够达成链式调用，我们在 `then` 函数的返回值要是一个 `Promise` 对象。

而且基础代码里编写的是直接实例化了一个新的对象，那么可能会造成疑惑，直接返回 `this` 不行么？

答案是否定的，原因很简单，是由于 `Promise` 自身的属性决定了不能直接返回 `this`，不然其中任何一个属性发生修改都会对后面的操作造成影响。

#### 编码

回归正轨。

```javascript
let then = (onResolved, onRejected) => {
    return new PromiseDemo((resolved, rejected) => {
        // todo...
    })
}
```

`then` 函数有两个参数，并且返回值是一个实例化的 `Promise` 对象。

也就是说，在处理的过程中，我们将会涉及四个函数，分别是：`onResolved`, `onRejected`, `resolved`, `rejected`。

先分析一下四个函数的执行情况。

如果之前的 `Promise` 尚未处理(使用的异步代码，比如：`setTimeout`, `ajax` )，那么当前的状态 `state = 'pending'`，那我们就不能执行任何一个函数。

这个时候我们就要将这四个函数存储好，表明这属于同一个任务。

```javascript
// 如果还没执行结束，则将任务推向队列，并返回
if (state == 'pending') {
    queue.push([onResolved, onRejected, resolved, rejected])
    return
}
```

如果之前的 `Promise` 已经执行，那么当前的状态 `state = 'resolved'` 或者 `state = 'rejected'`。

这个时候我们就要分辨到底是什么情况了。

```javascript
// callback 是 then 函数两个参数中的一个
// next 是 Promise 成功失败函数中的一个
let callback, next
// 判断是否出错
if (state == 'resolved') {
    callback = onResolved
    next = resolved
} else {
    callback = onRejected
    next = rejected
}
```

当我们处理完之后，我们就要执行相关函数了。

```javascript
callback(data)
```

为了能够将参数传递给下游，`callback` 的返回值需要直接给 `next` 使用。

```javascript
next(callback(data))
```

好了，结束。

真的结束了么？

由于 `callbak` 是用户调用 `then` 函数传递过来的，那用户真的一定会传参数么？用户传过来的参数一定是一个函数么？那么直接执行 `callback` 就会有问题！！！

```javascript
// 如果是函数，则直接执行
// 并将参数传递给下游
if (typeof callback == 'function') {
    next(callback(data))
    return
}
next(data)
```

好了，这样貌似没什么问题了，整理一下代码。

```javascript
function then(onResolved, onRejected) {
    return new PromiseDemo((resolved, rejected) => {
        handle(onResolved, onRejected, resolved, rejected)
    })
}

function handle(onResolved, onRejected, resolved, rejected) {
    // 如果还没执行结束，则将任务推向队列，并返回
    if (state == 'pending') {
        queue.push([onResolved, onRejected, resolved, rejected])
        return
    }

    let callback, next
    // 判断是否出错
    if (state == 'resolved') {
        callback = onResolved
        next = resolved
    } else {
        callback = onRejected
        next = rejected
    }
    // 如果是函数，则直接执行
    // 并将参数传递给下游
    if (typeof callback == 'function') {
        next(callback(data))
        return
    }
    next(data)
}
```

### 实现 `resolve` 函数

相对于 `then` 函数的复杂，`resolve` 函数就相对简单点。

为了避免重复执行，这里直接将 `state` 置为 `rejected`。

先考虑一下，如果传过来的值是一个 `Promise` 对象，那我们该怎么处理？如果是一个非 `Promise` 对象的参数，该怎么处理？

由于 `Promise` 对象本身是拥有 `then` 函数的，我们应该执行它，这样这个对象处理后的值，会流转到下一层。

```javascript
let resolve = response => {
    state = 'resolved'
    if (response && (typeof response == 'function' || typeof response == 'object')) {
        if (response.hasOwnProperty('then') && typeof response.then == 'function') {
            response.then.call(response, resolve, reject)
            return
        }
    }
    data = response
    runCallbacks()
}
```

这里有个 `runCallbacks` 是干嘛的呢？

还记得我们将未执行的任务放到 `queue` 中了不？那么当前的任务执行完，是不是该执行下一个任务了呢？

```javascript
let runCallbacks = () => {
    queue.forEach(callback => handle.apply(null, callback))
}
```

OK，到这里，`resolve` 函数已经编写完成了。

### 实现其它

`Promise` 还有其它的一些方法，例如：`reject`、`catch` 等。

这里就不一一写了，下面该试验一下我们的 `PromiseDemo` 是否有用了。

### demo 测试

先来源码

```javascript
function PromiseDemo(foo) {
    if (typeof foo != 'function') {
        throw Error('Promise 的参数必须是函数')
    }

    let state = 'pending'
        , queue = []
        , data

    function then(onResolved, onRejected) {
        return new PromiseDemo((resolved, rejected) => {
            handle(onResolved, onRejected, resolved, rejected)
        })
    }

    function handle(onResolved, onRejected, resolved, rejected) {
        // 如果还没执行结束，则将任务推向队列，并返回
        if (state == 'pending') {
            queue.push([onResolved, onRejected, resolved, rejected])
            return
        }

        let callback, next
        // 判断是否出错
        if (state == 'resolved') {
            callback = onResolved
            next = resolved
        } else {
            callback = onRejected
            next = rejected
        }
        // 如果是函数，则直接执行
        // 并将参数传递给下游
        if (typeof callback == 'function') {
            next(callback(data))
            return
        }
        next(data)
    }

    let runCallbacks = () => {
        queue.forEach(callback => handle.apply(null, callback))
    }

    let reject = response => {
        state = 'rejected'
        data = response
        runCallbacks()
    }

    let resolve = response => {
        state = 'resolved'
        if (response && (typeof response == 'function' || typeof response == 'object')) {
            if (response.hasOwnProperty('then') && typeof response.then == 'function') {
                response.then.call(response, resolve, reject)
                return
            }
        }
        data = response
        runCallbacks()
    }

    try {
        foo(resolve, reject)
    } catch (e) {
        reject(e)
    }

    return {
        then: then
    }
}
```

执行一开始的 `demo`，结果如下：

![img](https://img-blog.csdnimg.cn/img_convert/bd6c3aa4d259d8dadd66af3b3416a396.png)

### 流程图

说也说了，写也写了，整个流程是什么样子的呢？

![img](https://img-blog.csdnimg.cn/img_convert/23dc2c5a7a1af38925e3ac19d3c74db2.png)

## 参考资料

1. [Promise原理解析](https://mengera88.github.io/2017/05/18/Promise%E5%8E%9F%E7%90%86%E8%A7%A3%E6%9E%90/)

2. [深入理解 Promise](http://coderlt.coding.me/2016/12/04/promise-in-depth-an-introduction-2/)

## 最后

终于写完了，有点啰嗦，基本上把我想表达的都表达出来了。