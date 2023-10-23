---
title: wkhtmltopdf服务
tags:
    - Docker
    - wkhtmltopdf
    - PHP
date: 2021-02-22 13:09:00
categories:
    - Docker
---

## 前言

之前写过一篇 《Lumen生成PDF》 的文章，当时在生成 `PDF` 的时候，遇到了一些问题，并加以解决了。

前段时间，项目组中的小伙伴发现了一个好项目 [wkhtmltopdf/wkhtmltopdf](https://github.com/wkhtmltopdf/wkhtmltopdf)。

可以直接将 `HTML` 转换成 `PDF`，这跟我们之前的诉求一致。

## Docker版

[KnpLabs/snappy](https://github.com/KnpLabs/snappy) 是基于 [wkhtmltopdf/wkhtmltopdf](https://github.com/wkhtmltopdf/wkhtmltopdf) 扩展而来的 `PHP` 项目。

我们通过加工，将其做成一个服务。

### 环境信息

- `PHP7.4+`
- `swoole`
- `composer`
- `supervisor`
- `wkhtmltopdf 0.12.15`

### 项目地址

- [github.com/imjcw/wkhtml2x](https://github.com/imjcw/wkhtml2x)
- [gitee.com/imjcw/wkhtml2x](https://gitee.com/imjcw/wkhtml2x)
- [hub.docker.com/r/imjcw/wkhtml2x](https://hub.docker.com/r/imjcw/wkhtml2x)

### 文件内容

`composer.json`:

```json
{
  "name": "imjcw/wkhtml2x",
  "description": "html2pdf",
  "require": {
    "php": "^7.4",
    "knplabs/knp-snappy": "^1.2"
  }
}
```

`wkhtml2x.php`:

```php
#!/usr/bin/env php
<?php

include_once './vendor/autoload.php';

define('WKHTMLTOPDF', '/usr/bin/wkhtmltopdf');
// define('WKHTMLTOIMAGE', '/usr/bin/wkhtmltoimage');

$http = new \Swoole\Http\Server('0.0.0.0', 80);

$http->on('request', function (\Swoole\Http\Request $request, \Swoole\Http\Response $response) {
    $uri = $request->server['path_info'];
    if ($uri == '/pdf') {
        try {
            $content = $request->post['file'] ?? '';
            if ($request->files['file'] ?? '') {
                $content = @file_get_contents($request->files['file']);
            }
            $url = $request->post['url'] ?? '';
            if (!$content && !$url) {
                throw new \Exception('没有需要转换的内容');
            }

            $snappy = new \Knp\Snappy\Pdf(WKHTMLTOPDF, $request->post['options'] ?? []);
            $response->header('Content-Type', 'application/pdf');
            if ($url) {
                $response->end($snappy->getOutput($url));
            } else {
                $response->end($snappy->getOutputFromHtml($content));
            }
        } catch (\Throwable $t) {
            $response->status(500);
            $response->end(str_replace('__ERROR__', $t->getMessage(), '<!DOCTYPE html><html><head><title>Internal Server Error</title></head><body><h1>Internal Server Error</h1><p>__ERROR__</p></body></html>'));
        }
    } else {
        $response->status(404);
        $response->end('<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>');
    }
});

$http->start();
```

### 使用方法

```bash
# 获取镜像
docker pull imjcw/wkhtml2x:latest
# 前面的80端口为宿主机端口，可以变更
docker run -p 80:80 --name=wkhtml2x imjcw/wkhtml2x:latest
```

请求地址：`127.0.0.1/pdf`

请求方式：`POST`

请求参数：

| 参数 | 必填 | 说明 |
| ---- | ---- | ---- |
| file | 和 url 二选一 | 文件内容 |
| url | 和 file 二选一 | 网址 |
| options | 否 | PDF参数 |

其中，`options` 的一些定义，需要参考对应文档

`wkhtmltopdf` 官方参数文档：[传送门](https://wkhtmltopdf.org/usage/wkhtmltopdf.txt)

`wkhtmltopdf` `Knp/Snappy` 参数文档：[传送门](https://github.com/KnpLabs/snappy/blob/master/src/Knp/Snappy/Pdf.php#L84)

返回的是**文件流**

### 待提升

目前支持了 `pdf`，并未支持 `image` 的生成。

容器因 `swoole` 变大了不少，而我们只是用了其中的一个小功能，这里也可以优化。

## 最后

处理问题的方式多种多样，在上次写 `Lumen生成PDF` 的时候，并没有想太多，在后续出现类似需求的时候，才发现做事情不能只顾眼前。