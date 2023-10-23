---
title: ELKF日志学习(十四)Kibana基于Sentinl实现钉钉告警
tags:
    - ELK
    - Kibana
    - Sentinl
date: 2020-12-30 13:09:00
categories:
    - ELK
---

## 前言

最好先学习一下 `sentinl` 的使用，以及 `Elasticsearch` 的语法。

![image-20201217132932245](/media/ELKF/image-20201217132932245.png)

## 代码仓库

[talk-lucky/elkf-study](https://gitee.com/talk-lucky/elkf-study)

## 配置流程

如果不熟悉的话，建议先使用 `Wizard` 来配置一些东西，再转换成 `Advanced`。

一般分四部分，分别是：`输入`、`条件`、`行为`、`其它`。

### 输入

这个一般是指定 `index`，配置一些筛选条件，比如(这是 `Advanced` 的示例)：

```json
{
    "search":{
        "request":{
            "index":[
                "crm-*"
            ],
            "body":{
                "size":0,
                "query":{
                    "bool":{
                        "must":[
                            {
                                "match":{
                                    "source":"/opt/logs/crm/crm.log"
                                }
                            },
                            {
                                "match_phrase":{
                                    "message":"Query Failed"
                                }
                            }
                        ],
                        "filter":[
                            {
                                "range":{
                                    "@timestamp":{
                                        "gte":"now-15m/m",
                                        "lte":"now/m",
                                        "format":"epoch_millis"
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    }
}
```

这里指定了 `index` `crm-*`，日志来源 `/opt/logs/crm/crm.log`，错误信息 `Query Failed`，匹配范围 `-15m`。

### 条件

这里的条件是根据 `输入` 统计之后的结果进行的筛选，比如：

```json
{
    "script":{
        "script":"payload.hits.total > 0"
    }
}
```

这里的意思是只要匹配到大于 `0` 的数量，就告警。

### 行为

行为是非常有意思的，这个建议还是先 `Wizard` 再 `Advanced`。

比如(`钉钉告警` 部分)：

```json
{
    "Webhook_crm_query":{
        "name":"Webhook",
        "throttle_period":"1s",
        "webhook":{
            "priority":"high",
            "stateless":false,
            "method":"POST",
            "host":"oapi.dingtalk.com",
            "port":"443",
            "path":"/robot/send?access_token={你的TOKEN}",
            "body":"{ \"msgtype\": \"text\", \"text\": { \"content\": \"{你的标识} 有MySQL执行错误\" } }",
            "params":{
                "watcher":"{{watcher.title}}",
                "payload_count":"{{payload.hits.total}}"
            },
            "headers":{
                "Content-Type":"application/json"
            },
            "auth":"",
            "message":"",
            "use_https":true
        }
    }
}
```

这里的东西比较多，需要注意的点有几个(加粗的要着重看)：

- `throttle_period` 是限流的，这里的配置是 `1s` 内执行触发一次
- `host`、`port`、`path`、`method`、`headers`、`body` 这些都是和请求相关的
- **{你的TOKEN} 一定要对**
- **{你的标识} 一定要和机器人的定义一致**

### 其它

- `title` 标题
- `trigger` 指定多长时间执行一次

## Demo

```json
{
    "actions":{
        "Webhook_crm_query":{
            "name":"Webhook",
            "throttle_period":"1s",
            "webhook":{
                "priority":"high",
                "stateless":false,
                "method":"POST",
                "host":"oapi.dingtalk.com",
                "port":"443",
                "path":"/robot/send?access_token={你的TOKEN}",
                "body":"{ \"msgtype\": \"text\", \"text\": { \"content\": \"{你的标识} 有MySQL执行错误\" } }",
                "params":{
                    "watcher":"{{watcher.title}}",
                    "payload_count":"{{payload.hits.total}}"
                },
                "headers":{
                    "Content-Type":"application/json"
                },
                "auth":"",
                "message":"",
                "use_https":true
            }
        }
    },
    "input":{
        "search":{
            "request":{
                "index":[
                    "crm-*"
                ],
                "body":{
                    "size":0,
                    "query":{
                        "bool":{
                            "must":[
                                {
                                    "match":{
                                        "source":"/opt/logs/crm/crm.log"
                                    }
                                },
                                {
                                    "match_phrase":{
                                        "message":"Query Failed"
                                    }
                                }
                            ],
                            "filter":[
                                {
                                    "range":{
                                        "@timestamp":{
                                            "gte":"now-15m/m",
                                            "lte":"now/m",
                                            "format":"epoch_millis"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    },
    "condition":{
        "script":{
            "script":"payload.hits.total > 0"
        }
    },
    "trigger":{
        "schedule":{
            "later":"every 2 minutes"
        }
    },
    "disable":false,
    "report":false,
    "title":"crm-mysql-error",
    "save_payload":true,
    "spy":false,
    "impersonate":false
}
```

## 最后

所有的操作都依赖原官方文档，这个是需要好好看的。