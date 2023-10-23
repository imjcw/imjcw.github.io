---
title: 基于Laravel的response中间件
tags:
    - Laravel
    - PHP
date: 2020-11-03 13:09:00
categories:
    - PHP
---

## 前言

新项目开始了，做了一些基础配置。

因为这个项目的定位是 `api服务`(虽然我不理解为什么小伙伴们这么崇尚 `Laravel`，嫌弃 `Lumen`)，所以需要统一响应信息。

## 正常响应

为了能够统一响应信息，这里准备写一个 `Response中间件`。

原理就不说明了，一张图帮助理解(我懒)。

![图片来自网络](/media/Laravel/laravel-middleware.png)

1、创建文件 `app/Http/Middleware/FormaterResponse.php`

也可以用 `php artisan make:middleware` 创建。

2、填充内容，这里给个简单的示例，具体业务逻辑自行填充

```php
<?php

namespace App\Http\Middleware;

use Closure;

class FormaterResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * 
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        if ($response->getStatusCode() == 200) {
            $response->setData([
                'code' => 200,
                'data' => $response->getData()
            ]);
        }
        return $response;
    }
}
```

3、注册中间件

编辑文件 `app/Http/Kernel.php`

`Lumen` 用户找注册中间件的地方，手动添加即可。

```php
<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array
     */
    protected $middleware = [
        // ...
        \App\Http\Middleware\FormaterResponse::class,
    ];
    
    // ...
}
```

4、试试看吧

## 异常响应

正常响应是有了，异常响应呢？

`Laravel` 是帮我们封装了一下，还是自己弄的舒服不是。

找到文件 `app/Exceptions/Handler.php`，重写一下 `render`。

```php
<?php

namespace App\Exceptions;

use Throwable;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class
    ];
    
    // ...

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $exception)
    {
        switch (true) {
            case $exception instanceof NotFoundHttpException:
                return response([
                    'code' => $exception->getStatusCode(),
                    'msg' => 'Not Found'
                ], $exception->getStatusCode());

            case $exception instanceof HttpResponseException:
                return $exception->getResponse();

            case $exception instanceof ValidationException:
                $response = $exception->getResponse();
                $message  = null;
                foreach ($exception->errors() as $messages) {
                    $message = current($messages);
                    break;
                }
                if (!$response) {
                    return response([
                        'code' => 422,
                        'msg'  => $message ?? 'validation_failed',
                    ], 422);
                }
                $response->setData(
                    [
                        'code' => $response->getStatusCode(),
                        'msg'  => $message ?? 'validation_failed',
                    ]
                );
                return $response;

            default:
                return response(['code' => 500, 'msg' => $exception->getMessage()], 500);
        }
    }
}

```

当然，也可以在中间件中处理。

## 简洁的Controller

```php
<?php

namespace App\Http\Controllers;

class AccountController extends Controller
{
    public function show($id)
    {
        if ($id == 1) {
            throw new \Exception('sth error');
        }

        return [
        	'id' => $id
        ];
    }
}

```



## 最后

框架中的一些设计会帮我们省很多事，好好利用，真香。