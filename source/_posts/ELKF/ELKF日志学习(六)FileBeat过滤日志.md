---
title: ELKF日志学习(六)FileBeat过滤日志
tags:
    - ELK
    - Filebeat
date: 2020-12-22 13:09:00
categories:
    - ELK
---

## 前言

在分析日志的时候，是否有遇到过一些无用的日志？

这种情况最好是处理好记录日志的情况，如果无法处理，我们只能过滤了。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## include_lines

指定<span style="color: red">记录</span>包含某些内容的行，比如：

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/lumen/lumen.log
    include_lines: ['pro.ERROR', 'pro.WARN']
```

这样 `FileBeat` 就会收集包含 `pro.ERROR`、`pro.WARN` 的日志行。

TIPS：与 `multiline` 联合使用的时候，会针对合并后的记录再过滤。

## exclude_lines

指定<span style="color: red">过滤</span>包含某些内容的行，比如：

```yaml
filebeat.inputs:
  - type: log
    paths:
      - /var/log/lumen/lumen.log
    exclude_lines: ['pro.INFO', 'pro.DEBUG']
```

这样 `FileBeat` 就会收集包含 `pro.INFO`、`pro.DEBUG` 的日志行。

TIPS：与 `multiline` 联合使用的时候，会针对合并后的记录再过滤。

## 最后

**银弹** 不存在，我们能做的是尽量让日志更加合规。