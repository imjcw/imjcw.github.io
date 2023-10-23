---
title: Laravel记录SQL日志信息
tags:
    - Laravel
    - Lumen
date: 2020-11-09 13:09:00
categories:
    - PHP
---

## 前言

`Laravel` 的 `ORM` 是相当好用的。

同时，因为 `Laravel` 内部帮我们做了不少东西，很多操作都是无感知的，只知道输入什么，输出什么。

有时候，为了能够更好的分析问题，我们需要通过一些运行日志来帮助我们。

## 方法1

官方推荐 [传送门](https://laravel.com/docs/8.x/database#listening-for-query-events)

```php
<?php

namespace App\Providers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        DB::listen(function ($query) {
            Log::info($event->sql . ' bind: ' . json_encode($event->bindings));
        });
    }
}
```

## 方法2

使用 `EventServiceProvider` 注册。

```php
<?php

namespace App\Providers;

use App\Listeners\QueryListener;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        QueryExecuted::class => [
            QueryListener::class
        ],
    ];
}
```

实现 `QueryListener`：

```php
<?php
namespace App\Listeners;

use Illuminate\Support\Facades\Log;
use Illuminate\Database\Events\QueryExecuted;

/**
 * Log Query
 */
class QueryListener
{
    /**
     * Handle the event.
     *
     * @param  QueryExecuted $event
     * 
     * @return void
     */
    public function handle(QueryExecuted $event)
    {
        if (!$event->sql) {
            return;
        }
        Log::info($event->sql . ' bind: ' . json_encode($event->bindings));
    }
}
```

最终的结果是一致的。

## 最后

终于可以看到执行的 `SQL` 了，也可以根据 `SQL` 来了解 `Laravel` 大致的一个实现方式。