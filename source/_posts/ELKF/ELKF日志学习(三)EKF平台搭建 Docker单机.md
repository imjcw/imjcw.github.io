---
title: ELKF日志学习(三)EKF平台搭建 Docker单机
tags:
    - ELK
    - Docker
date: 2020-12-19 13:09:00
categories:
    - ELK
---

> 本文和 《ELKF日志学习(二)ELKF平台搭建 Docker单机》 的区别如下：
>
> 1. 去除了 `Logstash` 模块。
> 2. `Filebeat` 直接写入 `Elasticsearch`。
>
> 熟悉者可以直接进入相应目录安装环境。

## 前言

本文是基于 `hub.docker.com` 站点提供的 `Docker` 容器进行搭建的，且是 `单机` ，仅用于学习。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study) EKF目录

## 说明

为了能够达到更好的学习效果，这里将 `Elasticsearch` 设置成了无需密码的状态。

同时，`Elasticsearch` 也用的是免费版。

后期告警部分，会使用 `Elasticsearch` 白金收费版，默认只有试用 `30` 天，如果需要更长时间的试用，需要付费购买。

## 镜像版本

`Docker` 镜像版本： `7.6.1`。

- `kibana:7.6.1`
- `elasticsearch:7.6.1`
- `store/elastic/filebeat:7.6.1`

`Docker` 镜像版本： `6.4.2`。

- `kibana:6.4.2`
- `elasticsearch:6.4.2`
- `store/elastic/filebeat:6.4.2`

## 目标

`FileBeat` 收集JSON日志、`Elasticsearch` 存储、`Kibana` 分析、钉钉告警。

## 文件树

```
ekf
  ├─elasticsearch
  │ └─elasticsearch.yml
  ├─filebeat
  │ └─filebeat.yml
  └─kibana
     └─kibana.yml
```

## 容器编排配置

```yaml
version: "3"
services:
    filebeat:
        image: store/elastic/filebeat:7.6.1
        # 这里映射日志文件
        volumes:
            - ./nginx/logs:/var/log/nginx
            - ./ekf/filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
        links:
            - elasticsearch
        container_name: filebeat
        user: "root"
    elasticsearch:
        image: elasticsearch:7.6.1
        ports: 
            - "9200:9200"
            - "9300:9300"
        volumes:
            - ./ekf/elasticsearch/data:/usr/share/elasticsearch/data
            - ./ekf/elasticsearch/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro
        environment:
            ELASTICSEARCH_USERNAME: "root"
            ELASTICSEARCH_PASSWORD: "123456"
            ES_JAVA_OPTS: "-Xmx256m -Xms256m"
            discovery.type: single-node
            xpack.security.enabled: 'false'
        container_name: elasticsearch
    kibana:
        image: kibana:7.6.1
        ports: 
            - "5601:5601"
        volumes:
            - ./ekf/kibana/kibana.yml:/usr/share/kibana/config/kibana.yml:ro
        # 高版本的汉化还可以，低版本的还是默认使用英文版吧
        environment:
            I18N_LOCALE: zh-CN
        container_name: kibana
        links:
            - elasticsearch
```

## 运行环境

在 `ELKF` 目录下，执行 `docker-compose up -d`。

你将会看到如下的内容：

```
imjcw@marvin ELKF: docker-compose up -d
Creating network "elkf_default" with the default driver
Creating elasticsearch ... done
Creating filebeat      ... done
Creating kibana        ... done
```

等两分钟后，打开 [http://127.0.0.1:5601](javascript:void(0);)。

![Kibana面板](/media/ELKF/image-20201124164353961.png)

尽情探索吧。

## 最后

项目中已经做了一些基础配置，后续在各个模块会标明这些配置的作用。

