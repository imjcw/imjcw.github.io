---
title: Lumen生成PDF
tags:
    - Laravel
    - Lumen
    - PHP
date: 2020-11-04 13:09:00
categories:
    - PHP
---

## 前言

之前的项目中，涉及一个生成 `PDF` 的需求，当时使用的框架是 `Lumen`。

## 调研

原本是想用官方网站上可以看到的 `PDF` 扩展的，发现使用之后有水印，直接放弃。([传送门](https://www.php.net/manual/zh/ref.pdf.php) 好像已经不能打开了)

之后考虑了一下，如果能像浏览器一样，将网页直接转换为 `PDF`，那该多好，省时省力。

搜索了一下，发现还蛮多。

- `dompdf` [传送门](https://github.com/dompdf/dompdf)
- `HTML2FPDF` [传送门](https://github.com/renatoac83/html2fpdf)
- `mpdf` [传送门](https://github.com/mpdf/mpdf)

但适合这个项目的都需要自己再封装一下，为了方便，检索了一下基于 `Laravel` 的包。

最终选定了 `niklasravnsborg/laravel-pdf` [传送门](https://github.com/niklasravnsborg/laravel-pdf)，这个项目是基于 `mpdf` 的封装。

在使用的时候，遇到了两个问题。

1. 不兼容 `Lumen`
2. 中文乱码

## 问题解决

### 不兼容 `Lumen`

看了下源码，是配置获取的时候，`Laravel` 和 `Lumen` 的方式有所差异。

于是 `Fork` 了项目，并重写了 `src/LaravelPdf/PdfServiceProvider.php@boot` 和 `src/LaravelPdf/PdfServiceProvider.php@register`。

TIPS：有一些细节就不细说了，可以直接拿到项目里使用。[imjcw/laravel-pdf](https://github.com/imjcw/laravel-pdf)

```php
public function boot()
{
    // 原代码
    // $this->publishes([$this->configPath() => config_path('pdf.php')]);

    // 新代码
    if ($this->app instanceof \Laravel\Lumen\Application) {
        $this->app->configure(self::CONFIG_KEY);
    } else {
        $this->publishes([$this->configPath() => config_path('pdf.php')]);
    }
}

public function register()
{
    // 原代码
    // $this->mergeConfigFrom(
    //     __DIR__ . '/../config/pdf.php', 'pdf'
    // );

    // $this->app->bind('mpdf.wrapper', function($app) {
    //     return new PdfWrapper();
    // });

    // 新代码
    $this->mergeConfigFrom($this->configPath(), 'pdf');

    $this->app->bind('mpdf.wrapper', function($app) {
        return new PdfWrapper(config(self::CONFIG_KEY));
    });
}
```

 随后发布了 `packagist`，就在项目中引用了。

### 中文乱码

时间有点久，具体细节忘了，主要配置如下：

TIPS：这里的 `stsong.ttf` 是从网上下载来使用的。为了省事，所有的字体都是一个😂。

```php
<?php

return [
    'mode'         => '+aCJK',
    'format'       => 'A4', // See https://mpdf.github.io/paging/page-size-orientation.html
    'author'       => 'John Doe',
    'subject'      => 'This Document will explain the whole universe.',
    'keywords'     => 'PDF, Laravel, Package, Peace', // Separate values with comma
    'creator'      => 'Laravel Pdf',
    'display_mode' => 'fullpage',
    'font_path'    => base_path('resources/fonts'),
    'font_data'    => [
        'stsong' => [
            'R'  => 'stsong.ttf',
            'B'  => 'stsong.ttf',
            'I'  => 'stsong.ttf',
            'BI' => 'stsong.ttf'
        ]
    ],
    'tempDir' => storage_path('app/public')
];
```

## 使用

`Lumen` 中 `bootstrap/app.php` 中添加下两行(最好添加到指定位置)：

```php
$app->configure('pdf');
$app->register(niklasravnsborg\LaravelPdf\PdfServiceProvider::class);
```

`Laravel` 中写入 `Kernel.php` 中就行。

真香！！！

```php
app('mpdf.wrapper')->loadHTML($html)->save($filePath);
```

## 最后

了解工具，可以帮助我们更好的使用工具。