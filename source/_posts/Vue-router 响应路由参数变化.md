---
title: Vue-router 响应路由参数变化
tags:
    - JavaScript
    - VueJs
date: 2019-03-13 18:38:45
categories:
    - JavaScript
---
## 前言

最近用 `vue` 开发了一个数据展示的项目，在开发过程中，遇到了检测路由参数变化的问题。

## 路由参数变化

具体情况如下：

- 有一个商品数据展示页，根据商品ID的不同，展示不同的数据。
- 获取商品数据是在 `mounted` 或者 `created` 方法里做的。
- 当使用了 `vue-router` 的 `push` 之后，`mounted` 和 `created` 方法没有被再次执行。

因此，我们需要在路由参数变化之后，重新获取数据渲染。

## 监听 `$route` 的变化

在使用 `vue-router` 的 `push` 之后，`$route` 的值会发生变化，所以我们可以检测 `$route` 来达到我们想要的目的。

```js
export default {
    mounted () {
        this.fetchData()
    },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        fetchData () {
            // do sth
        }
    }
}
```

## 导航守卫

关于这个，可以参考官方文档 [导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html#%E5%85%A8%E5%B1%80%E5%AE%88%E5%8D%AB)。

## 最后

问题得以解决，做个笔记。
