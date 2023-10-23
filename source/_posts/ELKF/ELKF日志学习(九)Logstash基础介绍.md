---
title: ELKF日志学习(九)Logstash基础介绍
tags:
    - ELK
    - Logstash
date: 2020-12-25 13:09:00
categories:
    - ELK
---

## 前言

`Logstash` 是数据收集引擎，可以对数据进行过滤、分析、丰富、统一格式等操作，存储到用户指定的位置，包含但不限于文件、 `elasticsearch` 。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 配置

`Logstash` 的配置分为 3 部分，`输入`、`过滤器` 和 `输出`。

```yaml
input {
    # 这里填写输入部分
}

filter {
    # 这里填写过滤、解析部分
}

output {
    # 这里填写解析部分
}
```

### 输入

[官方文档传送门](https://www.elastic.co/guide/en/logstash/current/input-plugins.html)

相对于 `FileBeat`，`Logstash` 的输入类型丰富很多。

支持 `FileBeat`、`文件`、`Kafka`、`redis`、`Github Webhook` 等。

#### FileBeat

接收来自 `FileBeat` 的输入。[官方文档传送门](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-beats.html)

```yaml
input {
  beats {
    port => 5044
  }
}
```

#### File

接收来自 `文件` 的输入。[官方文档传送门](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-file.html)

```yaml
input {
  file {
    path => "/var/log/nginx/access.log"
  }
}
```

#### Kafka

接收来自 `Kafka` 的输入。[官方文档传送门](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-kafka.html)

```yaml
input {
  kafka {
    zk_connect => "kafka:2181"
    group_id => "logstash"
    topic_id => "test"
    reset_beginning => false
    consumer_threads => 5
    decorate_events => true
  }
}
```

### 过滤器

[官方文档传送门](https://www.elastic.co/guide/en/logstash/current/filter-plugins.html)

这算是一个重点了，可以帮助我们将杂乱的日志解析成 `json` 方便分析。

用的比较多的就是 `Gork` 了。

### 输出

[官方文档传送门](https://www.elastic.co/guide/en/logstash/current/output-plugins.html)

比起 `FileBeat`，`Logstash` 的输出可以做更多的事情，比如我们想要实现的 `告警` 功能。

支持 `Elasticsearch`、`文件`、`Email`、`Kafka`、`redis`、`TCP` 等。

其中，我们可以使用 `TCP` 实现我们的 `钉钉告警`。

我们目前是直接写入 `Elasticsearch` 的，这里放个 `demo`。

```yaml
output {
  elasticsearch {
    index => "%{[fields][source]}-%{+YYYY.MM.dd}"
    hosts => "elasticsearch:9200"
  }
}
```

## 最后

本文只是做一些简单的介绍，实际应用，还是要依赖官方文档的帮助。