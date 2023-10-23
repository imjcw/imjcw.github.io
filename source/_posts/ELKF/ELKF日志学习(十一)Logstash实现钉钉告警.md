---
title: ELKF日志学习(十一)Logstash实现钉钉告警(莫当真)
tags:
    - ELK
    - Logstash
date: 2020-12-27 13:09:00
categories:
    - ELK
---

## 前言

本来不想写这篇文章的，奈何有人崇尚这个，顺带介绍一下，扩展一下思路。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 弊端

比如：当 `499`(`HTTP` 状态码) 在半小时内出现了 50 次，需要实现告警。

这种情况就不能自定义了，只能说，出现 `499` 就告警，这个很傻。

## 麻烦一点的解决方案

就是统计后，写入某一个日志文件，然后再根据来源来分辨是否发送告警。

好像有点傻...

毕竟，都已经统计了，直接告警就行，还要写日志，再通过 `Logstash` 发送告警，有点冗余。

至于怎么统计，好像有个 `KSQL`，是 `Kibana` 的。

## 实现

这里主要用到了两块内容，一个是 `Logstash` 的 `output.http`，一个是 `钉钉` 的 `机器人`。

关于如何创建机器人，还是直接查看官方文档吧，这里就不多做描述了。

[Logstash官方文档](https://www.elastic.co/guide/en/logstash/current/plugins-outputs-http.html)

[钉钉机器人官方文档](https://ding-doc.dingtalk.com/document)

废话有点多，直接看实现吧。

```
output {
    http {
        url => "https://oapi.dingtalk.com/robot/send?access_token=你的token"
        http_method => "post"
        format => "message"
        content_type => "application/json; charset=utf-8"
        message => "{'msgtype':'text','text': {'content': '你的标识 需要告警的错误信息'}}"
    }
}
```

TIPS: **你的标识** 一定要和配置的一致，不然发送会失败。

## 最后

可以玩玩，官方出 `output.http` 不是用来做这个的，但可以帮助我们学习使用方法。