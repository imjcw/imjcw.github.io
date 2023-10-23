---
title: INSERT INTO vs REPLACE INTO vs INSERT IGNORE INTO
tags:
    - MySQL
date: 2021-03-16 13:27:45
categories:
    - MySQL
---
## 前言

在看某块功能的代码的时候，看到了比较有意思的 `SQL` 语句，如下：

```sql
INSERT IGNORE INTO ...
```

## INSERT INTO

用的最多的插入语句了，直接插入一条数据，如果主键冲突，会报错。

## REPLACE INTO

替换数据，`SQL` 语句中必须存在**主键**或者**唯一键**，如果存在，则更新，否则插入。

单个 `INSERT INTO` 语句插入多个值时，`InnoDB` 表中，会认为这是单个事务，要么都成功，要么都失败。

如果用了 `INSERT IGNORE INTO` 语句插入多个值时，`InnoDB` 表中，会按先后顺序插入，冲突的更新。

```sql
mysql> DROP TABLE IF EXISTS tb;

mysql> CREATE TABLE `tb` (
    ->   `v1` int(11),
    ->   `v2` int(11),
    ->   UNIQUE KEY `u_v2` (`v2`)
    -> ) ENGINE=InnoDB;
Query OK, 0 rows affected (0.03 sec)

mysql> -- 下面一条语句会整体失败
mysql> INSERT INTO tb VALUES (2, 5), (6, 10), (7, 5), (3, 1), (1, 9);
ERROR 1062 (23000): Duplicate entry '5' for key 'u_v2'

mysql> SELECT * FROM tb;
Empty set (0.00 sec)

mysql> -- 下面一条语句会成功4个
mysql> REPLACE INTO tb VALUES (2, 5), (6, 10), (7, 5), (3, 1), (1, 9);
Query OK, 6 rows affected (0.01 sec)
Records: 5  Duplicates: 1  Warnings: 0

mysql> -- 可以看到 (7, 5) 替换了 (2, 5)
mysql> SELECT * FROM tb;
+------+------+
| v1   | v2   |
+------+------+
|    7 |    5 |
|    6 |   10 |
|    3 |    1 |
|    1 |    9 |
+------+------+
4 rows in set (0.00 sec)
```

## INSERT IGNORE INTO

插入数据，`SQL` 语句中必须存在**主键**或者**唯一键**，如果存在，则忽略，否则插入。

单个 `INSERT INTO` 语句插入多个值时，`InnoDB` 表中，会认为这是单个事务，要么都成功，要么都失败。

如果用了 `INSERT IGNORE INTO` 语句插入多个值时，`InnoDB` 表中，会按先后顺序插入，冲突的失败。

```sql
mysql> DROP TABLE IF EXISTS tb;

mysql> CREATE TABLE `tb` (
    ->   `v1` int(11),
    ->   `v2` int(11),
    ->   UNIQUE KEY `u_v2` (`v2`)
    -> ) ENGINE=InnoDB;
Query OK, 0 rows affected (0.03 sec)

mysql> -- 下面一条语句会整体失败
mysql> INSERT INTO tb VALUES (2, 5), (6, 10), (7, 5), (3, 1), (1, 9);
ERROR 1062 (23000): Duplicate entry '5' for key 'u_v2'

mysql> SELECT * FROM tb;
Empty set (0.00 sec)

mysql> -- 下面一条语句会成功4个
mysql> INSERT IGNORE INTO tb VALUES (2, 5), (6, 10), (7, 5), (3, 1), (1, 9);
Query OK, 4 rows affected, 1 warning (0.00 sec)
Records: 5  Duplicates: 1  Warnings: 1

mysql> -- 可以看到 
mysql> SELECT * FROM tb;
+------+------+
| v1   | v2   |
+------+------+
|    2 |    5 |
|    6 |   10 |
|    3 |    1 |
|    1 |    9 |
+------+------+
4 rows in set (0.00 sec)
```

## 最后

有些场景可以直接用 `SQL` 来处理了，减少一些代码。