---
permalink: 2020/10/28/php/hyperf-hot-reload/
title: Hyperf热更新
tags:
    - PHP
    - Swoole
    - Hyperf
date: 2020-10-28 14:56:45
categories:
    - PHP
---

本文编写于 `2020-10-28`，部分观点可能已经过时。

## 前言

最近想在新项目中使用 `Hyperf`，但是在尝试没多久之后，就遇到了各种问题。

其中比较头疼的就是热更新。

## 方案

### 手动停止、启动项目

这是一个比较累的工作。

### 使用IDE监测文件的保存

大部分 `IDE` 中都存在这个功能。

`Sublime` 在这方面并不是很友好，当然，对于大神级别的应该不是问题。

### 手动编译

因为我用的是 `Sublime`，所以我这边举一个 `Sublime` 的例子。

首先，创建一个编译系统。`Tools` -> `Build System` -> `New Build System...`

![添加编译系统](/media/Hyperf/image-20201028150434107.webp)

接着，编写执行时需要执行的命令。(我本地使用的是 `Docker`，只需要重启容器就好)

![编写编译时要执行的命令](/media/Hyperf/image-20201028150635375.webp)

接着，保存为 `Hyperf.sublime-build`。并选择 `Hyperf` 作为编译系统。

![选择自定义编译系统](/media/Hyperf/image-20201028150924880.webp)

最后，编写完代码之后，`Ctrl+B` 一键编译。

![编译结果](/media/Hyperf/image-20201028151215465.webp)

### 使用watch改造

基于 `Swoole` 的 `Process/Timer/Event` 实现，定时扫描文件并监听文件变动重启服务。

不依赖其它扩展，性能表现一般，全平台可用，体验较好（可在控制台直接输出运行日志）。

下载地址：[Github 传送门](https://github.com/ha-ni-cc/hyperf-watch)

使用方式：

1. 复制 `watch` 文件到项目根目录，即 `bin` 目录所在的那一层。

2. 启动

   ```bash
   php watch -c
   ```

可能遇到的问题：

在 `Docker` 中，一直因为 `9501` 端口被监听，导致重启 `Hyperf` 失败。

解决方式：

修改 `@change` 方法，如下：

```php
function change()
{
    global $serve;
    echo CONSOLE_COLOR_YELLOW . "🔄 Restart @ " . date('Y-m-d H:i:s') . PHP_EOL;
    // Process::kill($serve->pid);
    shell_exec('kill -9 ' . $serve->pid);
    start();
}
```

