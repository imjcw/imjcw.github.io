---
title: PHP 限制脚本进程数量
tags:
    - PHP
date: 2021-03-03 13:27:45
categories:
    - PHP
---
## 前言

现在的工作中，经常要写一些脚本做一些异步的操作。

一般是大量的数据修改，或者解决部分并发问题。

为了能够稳定的做好数据处理，一般情况下会用定时脚本的方式。

那么问题来了。

## 可能存在的问题

当我们处理大量数据的时候，脚本的执行时间可能很长，或者重复处理某条数据(写错的情况下)。

为了避免数据的重复处理、运行脚本过多导致服务器压力过大等问题，我们需要限制脚本的运行数量。

## 如何做

### 思路一

查询某种标识的进程数量，如果超过一定数量，则直接退出，不处理。

### 思路二

记录每次的PID，可以使用 `文件`、`redis`、`memcached` 等来存储。

当启动一个新进程的时候，去查一下这个标识下面有哪些PID，是否还在运行，且与当前标识有关系。

当超过一定数量的时候，直接退出，不处理。

## 实践

### 思路一实践

这里通过 `linux` 的 `ps`、`grep`、`wc` 的命令来获取指定标识的运行进程数。

```php
<?php
/**
 * 是否可以运行
 *
 * @param  string  $ident  标识
 * @param  integer $maxNum 最大运行数量
 *
 * @return bool
 */
function canRun($ident, $maxNum)
{
   $cmd = sprintf('ps ax | grep %s | grep -v /bin/sh | grep -v grep | wc -l', $ident);
   $fp  = @popen($cmd, 'r');
   $num = (int)trim(@fread($fp, 2096));
   @pclose($fp);
   return $num <= $maxNum;
}
```

### 思路二实践

这里使用 `redis` 存储 `pid` 信息。

通过 `/proc/{pid}/cmdline` 文件检测指定进程是否还在运行。

```php
<?php
/**
 * 检查 pid 是否存活
 *
 * @param  string $pid   PID
 * @param  string $ident 标识
 *
 * @return bool
 */
function isSurvive($pid, $ident)
{
   // 获取指定pid的cmdline文件
   $cmdlinePath = sprintf('/proc/%s/cmdline', $pid);
   if (!is_file($cmdlinePath)) {
      return false;
   }
   $cmdline = trim(file_get_contents($cmdlinePath));
   // 检查标识是否在 cmdline 中
   return strpos($cmdline, $ident) !== false;
}

/**
 * 是否可以运行
 *
 * @param  string  $ident  标识
 * @param  integer $maxNum 最大运行数量
 *
 * @return bool
 */
function canRun($ident, $maxNum)
{
    // 假设已经链接上
    $redisHandler = getRedis();
    // 定义一个key
    $key = sprintf('php:job:%s:pid', $ident);
    // 当前的PID
    $currentPid = getmypid();
    // 将当前的PID写入redis
    $redis->sAdd($key, $currentPid);
    // 获取redis中的所有pid
    $pids = $redis->sMembers($key);
    // 遍历pid，检查是否有效
    foreach ($pids as $index => $pid) {
        if ($currentPid == $pid) {
            continue;
        }
        // 检查 pid 是否还在运行中
        if (isSurvive($pid, $ident)) {
            continue;
        }
        // 若不再运行，则直接删除
        unset($pids[$index]);
        $redis->sRemove($key, $pid);
   }
   return count($pids) <= $maxNum;
}
```

## 关于标识

关于标识，可能我们在运行一些定时脚本的时候，统一的部分可能就是 `php` 了；或者，拥有相同标识的脚本，我们要归为几类。

为了能够实现这些需求，我们可以通过 `php` 的内置函数 `cli_set_process_title` 来实现自定义 `COMMAND`。

`demo.php`:

```php
<?php
cli_set_process_title('Job Demo');
sleep(10);
```

这个时候，我们运行 `demo.php`，然后通过 `ps ax` 可以看到如下结果：

```
PID   USER     TIME  COMMAND
    1 root      0:09 php-fpm: master process (/usr/local/etc/php-fpm.conf)
    7 root      0:16 php-fpm: pool www
    8 root      0:15 php-fpm: pool www
    9 root      0:14 php-fpm: pool www
   10 root      0:00 sh
  663 root      0:00 sh
  690 root      0:00 {php} Job Demo
  691 root      0:00 ps ax
```

修改指定脚本的进程标题，我们就可以实现定义某些脚本的标识了。

## 最后

没 `BUG` 的功能，也可能出现 `BUG`，我们需要更多的思考和设计减少这类错误的发生。