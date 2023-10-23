---
title: Git Tag相关
tags:
    - Git
date: 2021-02-19 14:43:45
categories:
    - Git
---

本文编写于 `2021-02-19`，部分观点可能已经过时。

## 前言

`Git` 也用了五年了，很多命令没用过，`git tag` 就是其中一个，这次是为了让 `hub.docker.com` 帮助我构建镜像，才有这方面的诉求去使用这个命令。

## 命令

### 创建 `tag`

```bash
git tag -a tag名称 -m "tag描述"
```

### 推送 `tag`

#### 单个推送

```bash
git push origin tag名称
```

#### 全部推送

```bash
git push --tags
```

### 删除 `tag`

#### 删除本地 `tag`

```bash
git tag -d tag名称
```

#### 删除远程 `tag`

```bash
git push origin :refs/tags/tag名称
```

### 更新 `tag`

#### 更新本地 `tag`

```bash
git tag -f -a tag名称 -m "tag描述"
```

#### 更新远程 `tag`

```bash
git push -f origin tag名称
```

### 查看 `tag`

```bash
git tag
```

## 最后

命令很简单，以此记录。