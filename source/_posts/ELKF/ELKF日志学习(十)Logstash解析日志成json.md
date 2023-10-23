---
title: ELKF日志学习(十)Logstash解析日志成json
tags:
    - ELK
    - Logstash
date: 2020-12-26 13:09:00
categories:
    - ELK
---

## 前言

之前大致说了一下 `Logstash` 的能力。

关于输入输出并不多做介绍了，这里主要讲解一下日志解析部分。

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## Grok

原理很简单，就是 `正则`。

这里有个非常实用的网站 [Grok Debugger](https://grokdebug.herokuapp.com)，可以帮助我们验证调试解日志的正则。(可能需要自备梯子)

官方有一部分预定义 [grok](https://github.com/elastic/logstash/tree/v1.4.2/patterns) 的表达式，可以参考，我们也可以编写一些预定义的表达式供后续使用。

`Kibana` 也提供了相应的工具，只不过没那么好用罢了。

### 示例

比如，有这么一段日志(nginx/access.log)：

```
192.168.200.1 - - [27/Aug/2018:06:36:58 +0800] "GET / HTTP/1.1" 200 16 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36" "-"
```

我们需要解析它，那我们需要先编写测试好 `Grok` 语句。

`192.168.200.1` 可以使用 `IPV4` 来匹配，比如：`%{IPV4:remote_addr}`。

这里不仅匹配了，并将其值赋予了 `remote_addr`，有点像 `PHP` 中的正则子模式。

**问：`IPV4` 从哪里来的，不知道怎么办？还有其它方式么？**

答：

1. `IPV4` 来自 `Logstash` 自己的预定义，具体可以参考 [grok](https://github.com/elastic/logstash/tree/v1.4.2/patterns)。
2. 还可以直接写正则来匹配，比如：`(?<remote_addr>((?<![0-9])(?:(?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})[.](?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})[.](?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})[.](?:25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2}))(?![0-9])))`。

**问：还有一个疑问，为何定义为 `remote_addr`？**

答：这个是自定义，一般情况下会保持和 `nginx` 日志定义一致，这个看项目的定义。

在了解了一些基本概念之后，那么我们的表达式应该这么写：

```
filter {
    grok {
        match => {
            "message" => '%{IPV4:remote_addr} - %{USERNAME:remote_user} \[%{HTTPDATE:timestamp}\] \"%{WORD:request_method} %{URIPATHPARAM:request_uri} HTTP/%{BASE10NUM:http_version}\"\s{1,}%{INT:status}\s{1,}%{INT:request_length}\s{1,}%{QS:http_referer}\s{1,}%{QS:http_user_agent}\s{1,}%{QS:http_x_forwarded_for}'
        }
    }
}
```

### 匹配多种情况

在现实项目中，日志格式并不会像 `nginx/access.log` 那么工整，那么我们就要处理多种情况，比如 `nginx/error.log`。

具体实例就不写了(可以参考 `git` 项目中的 `logstash/pipeline/logstash.conf`)，这里介绍一下格式：

```
filter {
    grok {
        match => [
            "message", '表达式1',
            "message", '表达式2',
            "message", '表达式3'
        ]
    }
}
```

### 判断输入来源

为了使 `filter` 更加高效，我们需要在一开始就知道需要执行哪些表达式，而不是一个个试过去，通过输入来源，可以帮助我们解决一些问题。

在介绍 `FileBeat` 部分的时候，当时为每个日志文件都定义了 `file.source`。

这里可以通过判断 `fileds.source` 来大致确认是哪一类日志。

例如：

```
filter {
    if [fields][source] == "nginx_access_log" {
        grok {
            match => [
                "message", '表达式1',
                "message", '表达式2',
                "message", '表达式3'
            ]
        }
    }
    if [fields][source] == "nginx_error_log" {
        grok {
            match => [
                "message", '表达式4',
                "message", '表达式5',
                "message", '表达式6'
            ]
        }
    }
}
```

## 最后

`Logstash` 的能力还有很多，这些就要靠小伙伴们自行探索发现了。

后续如果使用到了比较有意思的部分，会在后续文章中更新。