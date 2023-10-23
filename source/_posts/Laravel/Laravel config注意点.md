---
title: Laravel config注意点
tags:
    - Laravel
    - PHP
date: 2020-11-02 13:09:00
categories:
    - PHP
---

## 前言

最近在对接 `客服工单系统` 时，组里建议新开项目。

经过讨论，最终确定使用 `Laravel` 来开发。

目前线上环境是用 `k8s` 进行部署管理的。

同时，每次发版，会拉取最新的代码，然后打包到容器中。

这种情况下，方便了我们使用 `Laravel` 的一些特性，比如：`php artisan config:cache`、`php artisan route:cache` 等。

这样可以减少文件IO，提升系统响应。

## 问题

有个新问题产生了。

就是有的地方获取不到配置。

原因就是：`php artisan config:cache` 执行之后，`*.env` 这个文件不会再被解析了。所以之前使用 `env`、`getenv` 可以获取到的配置，无法再获取到了。

## 解决方案

使用 `config()` 代替 `env`、`getenv`，获取配置。

当然，有个前提是，我们已经将相关的配置映射到了 `config/*.php` 中。这样，执行 `php artisan config:cache` 时，才能将 `*.env` 中的配置缓存下来。

## 源码分析

项目在初始化的时候，会加载 `Illuminate\Foundation\Http\Kernel::$bootstrappers` 中的配置。

在执行 `Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::bootstrap()` 时，会先判断 `$app->configurationIsCached()`，如果已经缓存了，直接返回，不加载 `*.env` 中的配置。

```php
<?php
// ...
class LoadEnvironmentVariables
{
    /**
     * Bootstrap the given application.
     *
     * @param  \Illuminate\Contracts\Foundation\Application  $app
     * @return void
     */
    public function bootstrap(Application $app)
    {
        if ($app->configurationIsCached()) {
            return;
        }

        $this->checkForSpecificEnvironmentFile($app);

        try {
            $this->createDotenv($app)->safeLoad();
        } catch (InvalidFileException $e) {
            $this->writeErrorAndDie($e);
        }
    }
    // ...
}
```

## 最后

对于使用工具的理解，有时候比编码重要，需要静下心来看、思考。