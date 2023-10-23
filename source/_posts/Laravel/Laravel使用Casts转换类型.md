---
title: Laravel使用Casts转换类型
tags:
    - Laravel
    - PHP
date: 2020-11-16 13:09:00
categories:
    - PHP
---

> 本文主要用于记录学习，具体操作建议查看更加详细的官方文档。[传送门](https://laravel.com/docs/8.x/eloquent-mutators)
>
> 本文只记录了其中一部分常用的用法。
>
> 文中 `demo` 来自官方文档。

## 前言

有时候，数据库里取出的数据，需要我们手动处理相应格式。

比如，某个字段存储的是 `json`，那么在 `orm` 取出数据后，手动再 `json_encode`，处理成我们可识别的样子。

## 默认的格式类型

官方文档中，明确指出了目前已经定义的类型。[传送门](https://laravel.com/docs/8.x/eloquent-mutators#attribute-casting)

- `integer`
- `real`
- `float`
- `double`
- `decimal:<digits>` 例如：`decimal:2`
- `string`
- `boolean`
- `object`
- `array`
- `collection`
- `date`
- `datetime`
- `timestamp`
- `encrypted`
- `encrypted:object`
- `encrypted:array`
- `encrypted:collection`

## 自定义格式类型

官方文档：[传送门](https://laravel.com/docs/8.x/eloquent-mutators#custom-casts)

操作步骤：

- `php artisan make:cast Json`

- 完善 `Json@set` 和 `Json@get`

  ```php
  <?php
  
  namespace App\Casts;
  
  use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
  
  class Json implements CastsAttributes
  {
      /**
       * Cast the given value.
       *
       * @param  \Illuminate\Database\Eloquent\Model  $model
       * @param  string  $key
       * @param  mixed  $value
       * @param  array  $attributes
       * @return array
       */
      public function get($model, $key, $value, $attributes)
      {
          return json_decode($value, true);
      }
  
      /**
       * Prepare the given value for storage.
       *
       * @param  \Illuminate\Database\Eloquent\Model  $model
       * @param  string  $key
       * @param  array  $value
       * @param  array  $attributes
       * @return string
       */
      public function set($model, $key, $value, $attributes)
      {
          return json_encode($value);
      }
  }
  ```

- 使用 `Json::class`

  ```php
  <?php
  
  namespace App\Models;
  
  use App\Casts\Json;
  use Illuminate\Database\Eloquent\Model;
  
  class User extends Model
  {
      /**
       * The attributes that should be cast.
       *
       * @var array
       */
      protected $casts = [
          'options' => Json::class,
      ];
  }
  ```

## 最后

`casts` 的用法还有很多，目前这些已经符合了我当前的使用场景，后续使用到继续补充。