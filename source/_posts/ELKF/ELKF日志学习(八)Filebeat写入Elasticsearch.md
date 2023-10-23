---
title: ELKF日志学习(八)Filebeat写入Elasticsearch
tags:
    - ELK
    - Filebeat
date: 2020-12-24 13:09:00
categories:
    - ELK
---

## 前言

上节将日志存储为 `json` 格式了，并通过 `FileBeat` 解析了 `json` 格式。

那我们可以直接将 `json` 日志写入 `Elasticsearch` 中了。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 写入 `Elasticsearch`

官方文档：[传送门](https://www.elastic.co/guide/en/beats/filebeat/7.9/elasticsearch-output.html)

### 直接写入

为了方便，这里设置了 `Elasticsearch` 是免密的。

```yaml
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
```

默认的 `index` 是 `filebeat-*` 格式的。

我们可以自定义 `index`。

```yaml
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "diy_prefix-%{[agent.version]}-%{+yyyy.MM.dd}"
```

### 根据 `input` 指定不同的 `index`

如果我们想要根据不同的 `input` 来分别建立不同的 `index`，可以根据自定义标签来判断。

还记得之前定义的 `fileds.source` 么？

```yaml
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  indices:
    - index: "nginx_access_log-%{+yyyy.MM.dd}"
      when:
        contains:
          fields.source: "nginx_access_log"
    - index: "nginx_error_log-%{+yyyy.MM.dd}"
      when:
        contains:
          fields.source: "nginx_error_log"
```

### 其它(来自官网)

**账号密码鉴权**

```yaml
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  username: "YOUR_USERNAME"
  password: "YOUR_PASSWORD"
```

**API key鉴权**

```yaml
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  api_key: "YOUR_API_KEY"
```

**证书鉴权**

```yaml
output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  ssl.certificate: "/etc/pki/client/cert.pem"
  ssl.key: "/etc/pki/client/cert.key"
```

## 最后

不建议 `Filebeat` 监控太多的文件，还是一个服务一个 `FileBeat` 最好。

`FileBeat` 是很轻量，如果做了太多的事情，它也是会拖后腿的。