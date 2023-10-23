---
title: ELKF日志学习(七)Filebeat解析json
tags:
    - ELK
    - Filebeat
date: 2020-12-23 13:09:00
categories:
    - ELK
---

> 这是 `EKF` 的部分，抛去了 `Logstash`。

## 前言

有些时候，我们已经将日志存储成了 `json` 的格式，而且不需要经过 `Logstash` 了，我们可以直接将日志写入 `Elasticsearch` 中。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 识别 `json`

`FileBeat` 可以解析 `json` 格式的日志，并将其传递给 `Elasticsearch`。 比如：

```yaml
filebeat.inputs:
  - type: log
    enabled: true
    fields:
      source: nginx_access_log
    json.keys_under_root: true
    json.overwrite_keys: true
    paths:
      - /var/log/nginx/access.log
```

### keys_under_root

`keys_under_root` 默认值是 `false`。

我们查看日志时会是这样子的：

![keys_under_root:false](/media/ELKF/image-20201127175629214.png)

为了能够让 `json` 的键提升到第一级，我们设置 `keys_under_root: true`，就会变成这样：

![keys_under_root:true](/media/ELKF/image-20201127175422430.png)

### overwrite_keys

字面意思，如果 `json` 中存在的字段和 `FileBeat` 默认添加的字段(`type`, `source`, `offset` 等)冲突了，那么 `json` 中的属性会覆盖原有的。

## 最后

官方提供了很多的能力，我们可以根据不同的业务场景来做不同的事情。