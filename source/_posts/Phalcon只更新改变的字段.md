---
title: Phalcon只更新改变的字段
tags:
    - PHP
    - Phalcon
date: 2017-05-13 18:38:45
categories:
    - PHP
---
## 前言

之前官网做了一次改版，运行一年多的时间，状态良好。在性能和抗压程度上都有了比较大的提升。

然而，在对接了 `TMS(第三方配送系统)` 和电子发票之后，会经常发生订单状态异常的情况。

## 问题

经过老大和慧哥的分析(我参与了问题的解决，未参与分析)，流程如下：

- 配送员在  `TMS` 操作订单完成(完成中)；
- 开电子发票的脚本获取了订单的信息；
- `TMS` 更新完成，订单状态发生改变；
- 开电子发票的脚本重新更新了订单的信息，订单被变更为 `TMS` 更新之前的状态。

正常的 `Phalcon` 的 `update` 流程如下：

```php
$robot = Robots::findFirstById($id);
$robot->name = 'wali';
$robot->update();

// ------- or -------

$robot = Robots::findFirstById($id);
$robot->update(['name' => 'wali']);
```

理想中的 `SQL` 语句：

```sql
UPDATE `robots` SET `name` = 'wali' WHERE `id` = 1
```

现实中的 `SQL` 语句：

```sql
UPDATE `robots` SET `name` = 'wali', `model` => '1' WHERE `id` = 1
```

也就是说 `Phalcon` 会将取到的所有数据都更新一次。

如果在A取到结果之后，B也操作并更新了这个记录之后，A再更新，那么B的操作就相当于没有做，这就造成了上面的尴尬一幕。

## 解决

> 解决方案有好几个，我会从最不建议的方式开始。

### 使用白名单

`Phalcon` 更新一条记录的过程中，会调用 `model` 类中的 `save` 方法，而 `save` 方法提供了一个参数 `whiteList`，在 `whiteList` 之内的字段是不会被更新的。

**优点：**可以限制某些字段的更新。

**缺点：**针对当前情况，需要在每一处操作限制，而且需要更改 `update` 的方式为 `save`，工作量太大。

### 自己写SQL

可以获取写服务之后，直接 `execute` `SQL` 语句，这样可以避免所有字段更新的情况。

**优点：**适合批量更新或者多表更新的情况。

**缺点：**和第一种方案一样，需要修改每一处地方，工作量大。

### 设置只更新变化的字段

`Phalcon` 本身还是提供了只更新变化字段的方法的，调用也很简单，在 `Model` 初始化时，调用 `useDynamicUpdate` 方法，参数为 `true`。

```Php
public function initialize()
{
    $this->useDynamicUpdate(true); // 就是它，神奇的方法
    $this->setReadConnectionService('slave');
    $this->setWriteConnectionService('master');
    $this->setSource($this->_tableName);
}
```

**优点：**便捷，快速，改动地方少。

**缺点：**当然是有的，不过我没有想到...

## 总结

有些雷，会在不知不觉中埋下，所以对于未知的东西，还是要多了解，才能够作出更加正确的决定。