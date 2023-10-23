---
title: PDO 绑定IN()语句的Array变量
tags:
    - PHP
    - PDO
date: 2018-06-03 18:38:45
categories:
    - PHP
---
## 前言

自己琢磨着写了一个小框架使使。写完了之后，开始写 `demo` 的时候遇到了 `PDO` 绑定 `IN` 语句的问题。

## 问题

原本想要在 `prepare` 语句中写一个变量，再 `bindParam` 这个变量，当然这个变量的值是一个数组，`PDO` 的扩展类会自动处理的。

然而在处理方式上让我止步不前了。

## 解决

网上有几种解决方案，一个是直接拼凑 `SQL` 语句，这与我的期望不符。

第二个就是用问号代替，并绑定，这要计算有几个问号，而且在找问题的时候也不方便。

最终，看了 `phalcon` 的源码，它的解决方式我很喜欢，于是将其简化，并实现了。

## 实现

首先，使用正则替换函数 `preg_replace_callback`，找到匹配的内容。

然后分析其中内容，生成新的 `key`，例：`:ids0`。

接着给 bindParams 添加新的 `key` 和 `value`，例：`'ids0' => 1`。并删除原先的key。

最后返回最新的条件。

```php
$conditions = preg_replace_callback('#{((.|\s)*?)}#', function ($matches) use (&$params) {
    if (!isset($matches[1])) {
        return $matches[0];
    }
    $str = trim($matches[1]);
    // 检查绑定参数是否存在，是否是数组
    if (!isset($params[$str]) || !is_array($params[$str])) {
        return $matches[0];
    }
    $keys = [];
    foreach ($params[$str] as $key => $value) {
        // 生成新的 `key`，例：`:ids0`
        $newKey = ':' . $str . $key;
        $keys[] = $newKey;
        // 给 bindParams 添加新的 `key` 和 `value`
        $params[$newKey] = $value;
    }
    // 删除原先的key
    unset($params[$str]);
    // 将 `({ids})` 替换为 `(:ids0,:ids1,:ids2)`
    return implode(',', $keys);
}, $conditions);
```

最终的效果是：

```sql
SELECT * FROM `table_name` WHERE `id` IN ({ids})
/** 转换为 */
SELECT * FROM `table_name` WHERE `id` IN (:ids0,:ids1,:ids2)
```

## 总结

`PDO` 给我们省去了不少麻烦，但有些习惯还是要我们自己去补充。