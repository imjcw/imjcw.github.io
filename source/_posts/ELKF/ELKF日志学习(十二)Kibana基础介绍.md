---
title: ELKF日志学习(十二)Kibana基础介绍
tags:
    - ELK
    - Kibana
date: 2020-12-28 13:09:00
categories:
    - ELK
---

## 前言

`kibana` 是数据分析和可视化平台，通常依赖 `elasticsearch` 。

因为 `Kibana` 的配置相对于其它模块相对较少，这里大部分是类似于使用教程。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 优点&能力

还是直接看官网吧，这个懒得截图了。[传送门](https://www.elastic.co/cn/kibana)

## 注意点

### 配置方面

这里分别提供了两个版本的 `Dockerfile` 配置。

在 `Kibana` 方面，有点差异。

`kibana/kibana.yml` 文件中。

```yaml
server.name: kibana
server.host: 0.0.0.0
# 下一行配置，适用于 7.6.1 版本
elasticsearch.hosts: [ "http://elasticsearch:9200" ]
# 下一行配置，适用于 6.5.4 版本
# elasticsearch.url: "http://elasticsearch:9200"
```

### 语言方面

高版本的 `Kibana` 可以汉化，还可以。

低版本的 `Kibana` 就别想汉化了，那叫一个难过，不如直接看英文。

## 使用

### 创建索引

1、`设置` -> `索引模式` -> `创建索引模式`。

![创建索引模式](/media/Docker/image-20201105132048723.png)

2、检索索引

![检索索引](/media/Docker/image-20201105132155416.png)

3、配置、创建

![配置创建](/media/Docker/image-20201105132222094.png)

4、创建成功，尽情使用吧

![创建成功](/media/Docker/image-20201105132249912.png)

## 最后

`Kibana` 重在使用，毕竟类似于客户端，不过，使用过程中，还需要了解一些其它知识，比如：`ES`、`KQL` 等。