---
title: ELKF日志学习(十三)Kibana安装Sentinl插件
tags:
    - ELK
    - Kibana
    - Sentinl
date: 2020-12-29 13:09:00
categories:
    - ELK
---

## 前言

低版本的 `Kibana` 中，想要实现钉钉告警，只能通过第三方插件来实现。

这也就是为什么我们需要使用 `Kibana:6.5.4` 和 `Kibana:7.6.1` 来介绍了。

除了第三方插件，`Elasticsearch` 也可以实现钉钉告警，但是 `6.5.4` 的版本中，`Elasticsearch` 不支持 `webhook`，所以就只能使用插件了。

还有一个用第三方插件的好处就是，免费！免费！免费！

`Elasticsearch` 的白金版才能实现告警，但需要收费。不过，这对于有这方面需求的公司，应该也是能负担的。

## 安装流程

[sentinl releases](https://github.com/lmangani/sentinl/releases)

通过 `kibana-plugin` 来安装。

```bash
kibana-plugin install file://{sentinl-v6.5.4.zip的存放路径}
```

**安装好之后，记得重启一下 `Kibana` 使 `sentinl` 生效**

### 注意点

1. 需要和 `Kibana` 的版本保持一致。(不一致的后果，没尝试过)
2. 最好下载下来安装。(虽然支持网络安装，不知为何，我没成功过)

## 可能遇到的问题

**Optimizing and caching browser bundles...**

这个对于内存的要求比较高，`2GB` 好像不够用，最好是 `5GB+`。

之后在网上看到了一个解决方案，并未尝试：`kibana-plugin install file://{sentinl-v6.5.4.zip的存放路径} --no-optimize`。

如果用的是 `Docker`，并且是 `6.5.4` 的话，可以直接用我的镜像：`docker pull imjcw/kibana:6.4.2`

## 最后

安装好 `sentinl` 之后，就可以试用了。