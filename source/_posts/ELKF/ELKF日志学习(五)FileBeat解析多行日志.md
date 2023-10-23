---
title: ELKF日志学习(五)FileBeat解析多行日志
tags:
    - ELK
    - Filebeat
date: 2020-12-21 13:09:00
categories:
    - ELK
---

## 前言

在我们的日常工作中，日志并不像 `nginx/access.log` 那样整齐，每一行都代表一条日志记录。

通常业务日志、错误日志经常出现跨行的情况，最常见的就是**栈**。

```
[2020-11-26 05:43:31] local.ERROR: Error Processing Request {"exception":"[object] (Exception(code: 1): Error Processing Request at /var/www/html/crm/service/src/app/Http/Controllers/Api/CaseController.php:49)
[stacktrace]
#0 /var/www/html/crm/service/src/vendor/laravel/framework/src/Illuminate/Routing/Controller.php(54): App\\Http\\Controllers\\Api\\CaseController->show('C01000874379')
#1 /var/www/html/crm/service/src/vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php(45): Illuminate\\Routing\\Controller->callAction('show', Array)
#2 /var/www/html/crm/service/src/vendor/laravel/framework/src/Illuminate/Routing/Route.php(255): Illuminate\\Routing\\ControllerDispatcher->dispatch(Object(Illuminate\\Routing\\Route), Object(App\\Http\\Controllers\\Api\\CaseController), 'show')
...
```

那么如何让 `FileBeat` 认为这是一条日志呢？

当然，还有其他...

官方文档 [传送门](https://www.elastic.co/guide/en/beats/filebeat/7.9/multiline-examples.html)

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 栈多行日志解析

使用 `FileBeat` 提供的 `multiline` 可以帮我们解决这个问题。

先来个 `demo`：

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    fields:
      source: lumen_log
    paths:
      - /var/log/lumen/lumen.log
    multiline.type: pattern
    multiline.pattern: '^\[[0-9]{4}-[0-9]{2}-[0-9]{2}'
    multiline.negate: true
    multiline.match: after
```

### multiline.type

默认值是 `pattern`。

也可配置为 `count`，意思是指定行数默认为一行，这种场景适合确定行数的日志。

### multiline.pattern

这是匹配日志的正则，一般情况下会配置为从行首开始匹配。

### multiline.match 和 multiline.negate

`multiline.match` 追加的位置， `multiline.negate` 是是否为否定模式。

| multiline.negate | multiline.match | 描述                                                         |
| ---------------- | --------------- | ------------------------------------------------------------ |
| true             | after           | 不符合 `multiline.pattern` 的，追加 `上一个匹配` 的一行后面  |
| false            | after           | 符合 `multiline.pattern` 的，追加到 `上一个不匹配`的一行后面 |
| true             | before          | 不符合 `multiline.pattern` 的，追加 `下一个匹配` 的一行前面  |
| false            | before          | 符合 `multiline.pattern` 的，追加到 `上一个不匹配`的一行前面 |

为了方便理解，我们使用的是 `true`、 `after` 模式，大致意思是， `multiline.pattern` 匹配的一行开始，只要不匹配的，都追加到匹配的那一行，直至找到下一个匹配的一行结束。

当然，可配置的参数不止这些，大多数情况下是够用了。

## 业务自定义多行日志解析

业务中，经常会出现如下的日志记录场景。

```php
<?php

$logger->info('enter create_production...');
// ...
$logger->info('exit create_production...');
```

对于业务来讲，`enter create_production...` 和 `exit create_production...` 之间的日志才能够算作一个完整的日志。 

应该是分析问题最为方便。

这里可能有小伙伴想到，这里有问题，因为在 `enter create_production...` 和 `exit create_production...` 之间的日志可能会穿插一些不是业务范围内的日志。

关于这个，是可以通过技术手段让其统一的，这不是我们考虑的重点，却是我们实际应用中需要考虑的点。

回归正题，我们可以使用 `multiline` 来达到我们的预期。

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    fields:
      source: lumen_log
    paths:
      - /var/log/lumen/lumen.log
    multiline.type: pattern
    multiline.pattern: 'enter create_production'
    multiline.negate: true
    multiline.match: after
    multiline.flush_pattern: 'exit create_production'
```

### multiline.flush_pattern

我个人的理解是，在我们做 `multiline.pattern` 开始，`FileBeat` 将匹配到的内容放到了内存中，等到下一次触发再发送到输出。

这个时候，我们使用了 `multiline.flush_pattern`，当其匹配时，就直接发送到输出了。

用 `PHP` 中的函数来表示的话，如下：

```php
<?php
ob_start();

$contents = ob_get_clean();
```

## 最后

如果可以，还是多看看官方文档，毕竟没有一个博文会像官方文档那么全面。