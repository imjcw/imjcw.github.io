---
title: ELKF日志学习(一)前言
tags:
    - ELK
date: 2020-12-17 13:09:00
categories:
    - ELK
---

## 背景

随着业务的不断发展，公司也越来越注重产品的质量和其稳定性，主张快速发现问题，快速解决问题。

日志分析也就进入了我们必做的环节之一。

由于公司目前都是自建的服务，现有的服务是 `EKF` 的形式，也就基于这个学习了一番。

在经过一番了解后，对日志系统有了一定的了解，便以文章记录所学。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 什么是ELKF

`ELKF` 是 `Elasticsearch` 、 `Logstash` 、 `Kibana` 、 `Filebeat` 的简称。

下面是对于这些软件作用的简述：

| 名称            | 简述                                                         |
| --------------- | ------------------------------------------------------------ |
| `filebeat`      | 轻量级的开源日志文件数据搜集器，负责对服务的日志进行收集。   |
| `logstash`      | 数据收集引擎，可以对数据进行过滤、分析、丰富、统一格式等操作，存储到用户指定的位置，包含但不限于文件、 `elasticsearch` 。 |
| `elasticsearch` | 存储、搜索和分析引擎，特点是高可伸缩、高可靠和易管理等。     |
| `kibana`        | 数据分析和可视化平台，通常依赖 `elasticsearch` 。            |

一图解释其作用：

![图片来源于网络](/media/ELKF/1602482736040-5d79cb63-6945-4842-9c47-dc14f0400df2.png)

## 学习环境

这里使用的是 `Docker` 搭建的学习环境，好处就是跨平台，构建方便。

## ELKF 版本

这里使用的是 `7.6.1` 和 `6.4.2` 版本。

## 路线

路线主要有两个：

一、`FileBeat` 收集日志、`Logstash` 解析格式化、`Elasticsearch` 存储、`Kibana` 分析、钉钉告警

二、`FileBeat` 收集 `JSON` 日志、`Elasticsearch` 存储、`Kibana` 分析、钉钉告警

扩展：

`FileBeat` -> `{queue}` -> `Logstash` -> `Elasticsearch` -> `Kibana`

`FileBeat` -> `{queue}` -> `Elasticsearch` -> `Kibana`

## 最后

一起成长！！！