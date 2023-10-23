---
title: Laravel日志分割
tags:
    - Laravel
    - PHP
date: 2021-02-26 13:09:00
categories:
    - PHP
---

## 前言

正式项目当中，我们需要记录一些日志来帮助我们定位、分析问题。

然而，随着业务的发展，线上运营的时间越来越长，单日志文件会变得越来越臃肿。

为了更好的解决单文件日志过大的问题，我们需要采取一些措施。

## 措施

### 使用 Laravel 提供的 daily

`Laravel` 提供了 `daily` 的日志记录形式。我们只需要在 `.env` 中配置 `LOG_CHANNEL=daily` 就可以实现我们想要的功能。

记录的日志文件格式默认是 `文件名称-2020-12-29.log`。

每天一个日志文件。

### 使用 logrotate 来分割日志

`logrotate` 是 `Linux` 的系统日志管理工具。

```bash
sudo touch /etc/logrotate.d/your-proyect
```

```
/var/log/your-project.log {
    weekly
    missingok
    rotate 12
    compress
    notifempty
    su your-user your-group
    create 700 your-user your-group
}
```

解释如下：

- `/var/log/your-project.log`: 需要分割的文件地址
- `weekly`: 每周分割
- `missingok`: 找不到就不处理
- `rotate 12`: 保存过去12周的日志
- `compress`: 压缩已经分割的文件
- `notifempty`: 空日志不分割
- `su your-user your-group`: 设置 user/group
- `create 700 your-user your-group`: 设置权限

```bash
logrotate -d /etc/logrotate.d/your-proyect
```

### 自定义 CustomLogger 实现分割

实现当文件达到指定大小，就分割日志。

#### 原理

使用 `CustomLogger` 替换系统提供的日志驱动。

实时检测日志文件大小，根据配置判断是否需要重新创建新的日志。

使用系统的 `single` 驱动来记录日志。

#### 代码

- 使用 `LocalAdapter` 来获取日志目录下的问题数量，从而确定命名规则。
  比如：当前目录下，有 `2` 个日志文件，那么，下一个分割后的文件名称是 `名称-2.log`
- 使用 `NumberComparator` 来比较文件和配置，判断是否需要分割日志
  支持的单位：`k`、`ki`、`m`、`mi`、`g`、`gi` (不区分大小写)
- 使用 `single` 来记录日志

```php
<?php
namespace App\Logging;

use Monolog\Logger as Monolog;
use Illuminate\Log\ParsesLogConfiguration;
use Symfony\Component\Finder\Comparator\NumberComparator;
use League\Flysystem\Adapter\Local AS LocalAdapter;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;
use Monolog\Handler\HandlerInterface;
use Monolog\Handler\FormattableHandlerInterface;

/**
 * 自定义Logger
 */
class CustomLogger
{
    use ParsesLogConfiguration;

    /**
     * Application
     *
     * @var \Illuminate\Foundation\Application
     */
    protected $app;

    /**
     * The standard date format to use when writing logs.
     *
     * @var string
     */
    protected $dateFormat = 'Y-m-d H:i:s';

    /**
     * __construct
     */
    function __construct()
    {
        $this->app = app();
    }

    /**
     * __invoke
     *
     * @param  array  $config Log config
     *
     * @return \Monolog\Logger
     */
    function __invoke(array $config)
    {
        $maxSize = isset($config['maxSize']) ? $config['maxSize'] : '20M';
        $filename = basename($config['path']);

        $localAdapter = new LocalAdapter(dirname($config['path']));
        // 比较文件大小
        $comparator = new NumberComparator('>' . $maxSize);
        if ($localAdapter->has($filename) && $comparator->test($localAdapter->getSize($filename)['size'] ?? 0)) {
            // 重命名文件
            $ident = count($localAdapter->listContents('/'));
            $localAdapter->rename($filename, str_replace('.log', "-{$ident}.log", $filename));
        }

        // 使用 single
        return new Monolog($this->parseChannel($config), [
            $this->prepareHandler(
                new StreamHandler(
                    $config['path'], $this->level($config),
                    $config['bubble'] ?? true, $config['permission'] ?? null, $config['locking'] ?? false
                ), $config
            ),
        ]);
    }

    /**
     * Get fallback log channel name.
     *
     * @return string
     */
    protected function getFallbackChannelName()
    {
        return $this->app->bound('env') ? $this->app->environment() : 'production';
    }

    /**
     * Prepare the handler for usage by Monolog.
     *
     * @param  \Monolog\Handler\HandlerInterface  $handler
     * @param  array  $config
     * @return \Monolog\Handler\HandlerInterface
     */
    protected function prepareHandler(HandlerInterface $handler, array $config = [])
    {
        $isHandlerFormattable = false;

        if (Monolog::API === 1) {
            $isHandlerFormattable = true;
        } elseif (Monolog::API === 2 && $handler instanceof FormattableHandlerInterface) {
            $isHandlerFormattable = true;
        }

        if ($isHandlerFormattable && ! isset($config['formatter'])) {
            $handler->setFormatter($this->formatter());
        } elseif ($isHandlerFormattable && $config['formatter'] !== 'default') {
            $handler->setFormatter($this->app->make($config['formatter'], $config['formatter_with'] ?? []));
        }

        return $handler;
    }

    /**
     * Get a Monolog formatter instance.
     *
     * @return \Monolog\Formatter\FormatterInterface
     */
    protected function formatter()
    {
        return tap(new LineFormatter(null, $this->dateFormat, true, true), function ($formatter) {
            $formatter->includeStacktraces();
        });
    }
}
```

#### 配置

`config/logging.php`

```php
<?php

// ...
use App\Logging\CustomLogger;

return [
    // ...

    'channels' => [
        // ...

        'custom' => [
            'driver' => 'custom',
            'path'   => env('LOG_PATH', '/var/log/laravel/laravel.log'),
            'via'    => CustomLogger::class,
            'maxSize'=> env('LOG_MAX_SIZE', '1gi'),
            'level'  => env('LOG_LEVEL', 'warning'),
        ],

        // ...
    ],
];
```

`.env`

```env
LOG_CHANNEL=custom
LOG_MAX_SIZE=1gi
```

## 最后

方式多种多样，各有取舍。

如果条件允许，还是建议使用 `logrotate` 来做日志分割。当然，`Linux` 还有更多丰富的日志管理工具可供选择。