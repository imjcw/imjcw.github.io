---
title: MySQL事务嵌套
tags:
    - MySQL
date: 2021-04-12 13:27:45
categories:
    - MySQL
---
## 前言

`MySQL` 在开始某个事务的时候，会隐式提交上一个事务。所以 `MySQL` 本身是不支持事务嵌套的。

但 `MySQL` 也给我们提供了一个 `SAVEPOINT` 来做出类似事务嵌套的动作，我们将运用 `SAVEPOINT` 来帮助我们实现事务嵌套。

## MySQL示例

准备一张表，用于测试。

```sql
CREATE TABLE `demo_transaction` (
  `id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 部分回滚

```sql
-- 格式化
TRUNCATE demo_transaction;

-- 开启事务
BEGIN;

-- 插入一条数据
INSERT INTO `demo_transaction`(id) VALUES(1);

-- 开启 SAVEPOINT
SAVEPOINT t1;
INSERT INTO `demo_transaction`(id) VALUES(2);
-- 回滚 SAVEPOINT
ROLLBACK SAVEPOINT t1;

-- 提交事务
COMMIT;
```

这时候，查询一下表 `demo_transaction`，会看到表里只有一条数据。

因为 `2` 的那条数据已经被回滚了。

### 全部提交

```sql
-- 格式化
TRUNCATE demo_transaction;

-- 开启事务
BEGIN;

-- 插入一条数据
INSERT INTO `demo_transaction`(id) VALUES(1);

-- 开启 SAVEPOINT
SAVEPOINT t1;
INSERT INTO `demo_transaction`(id) VALUES(2);
-- 释放 SAVEPOINT
RELEASE SAVEPOINT t1;

-- 提交事务
COMMIT;
```

这时候，查询一下表 `demo_transaction`，会看到表里有两条数据。

### 全部回滚

```sql
-- 格式化
TRUNCATE demo_transaction;

-- 开启事务
BEGIN;

-- 插入一条数据
INSERT INTO `demo_transaction`(id) VALUES(1);

-- 开启 SAVEPOINT
SAVEPOINT t1;
INSERT INTO `demo_transaction`(id) VALUES(2);
-- 释放 SAVEPOINT
RELEASE SAVEPOINT t1;

-- 提交事务
ROLLBACK;
```

这时候，查询一下表 `demo_transaction`，会看到表里没有数据。

## PHP实现

```php
<?php
/**
 * Transactions
 */
trait Transactions
{
    /**
     * transaction nums
     *
     * @var integer
     */
    protected $transactionNums = 0;

    /**
     * begin transaction
     */
    public function beginTransaction()
    {
        ++$this->transactionNums;
        if ($this->transactionNums == 1) {
            $this->getDB()->beginTransaction();
        } else {
            $this->getDB()->createSavepoint($this->transactionNums);
        }
    }

    /**
     * rollback transaction
     */
    public function rollback()
    {
        if ($this->transactionNums > 1) {
            $this->getDB()->rollbackSavepoint($this->transactionNums);
        } else {
            $this->getDB()->rollback();
        }
        --$this->transactionNums;
    }

    /**
     * commit transaction
     */
    public function commit()
    {
        while ($this->transactionNums > 1) {
            $this->getDB()->releaseSavepoint($this->transactionNums);
            --$this->transactionNums;
        }
        if ($this->transactionNums) {
            $this->getDB()->commit();
        }
        $this->transactionNums = 0;
    }
}
```

## 最后

梳理一下知识，免于踩坑。