---
title: Ubuntu安装phpize
tags:
    - PHP
    - Ubuntu
    - Linux
date: 2018-05-13 18:38:45
categories:
    - Linux
    - PHP
---
## 前言

最近在看 `sphinx`，想要在机器上安装一下试试的，尴尬来了。

因为当时为了省事，安装 `php` 的时候直接使用的是 `apt-get` 做的，找 `phpize` 的时候，怎么找都找不到。

还记得在看 `sphinx`，人家介绍安装的时候说，`PHP` 必须是要编译安装的，是因为要用到 `phpize`，事后证明并不是 `apt-get` 安装的 `php` 没有 `phpize`。

## 我的环境

- Ubuntu 14.04
- PHP 5.5.9 (`apt-get` 安装)
- 当前处于 `root` 用户

**特别说明：**

为了减少不需要的扩展，我的 `PHP` 安装命令如下：(这里很重要)

```bash
apt-get install -y php5-common php5-cli php5-gd php5-curl php5-memcached php5-mysql php5-fpm php5-redis
```

## 问题与解决

按照上述的安装结果，直接执行 `phpize` 是失败的，因为没有这样的命令。

所以需要另外一个包 `php5-dev`。

```bash
apt-get install -y php5-dev
```

安装结束之后，再看一下。问题解决！！！

## 最后

有时候，别人的言论不一定是对的，我们需要结合自己的认知去发现，扩展。