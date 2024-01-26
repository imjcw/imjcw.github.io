---
title: 使用kkgithub.com镜像加速拉取github代码
tags:
    - github
date: 2024-01-26 11:41:10
categories:
    - github
---

> 此文不定期更新，涉及站点可能失效

## 前言

有时需要从 `github` 上拉取项目，会遇到 **Failed to connect to github.com port 443** 的情况。

## kkgithub.com

> 截止**2024-01-26 11:43:13**，此站点仍旧有效

替换域名成 `kkgithub.com` 拉取即可。

```bash
/root/workspace/go/src/github.com/casbin# git clone https://github.com/casbin/casbin-server.git
Cloning into 'casbin-server'...
fatal: unable to access 'https://github.com/casbin/casbin-server.git/': Failed to connect to github.com port 443 after 21052 ms: Timed out

/root/workspace/go/src/github.com/casbin# git clone https://kkgithub.com/casbin/casbin-server.git
Cloning into 'casbin-server'...
remote: Enumerating objects: 515, done.
remote: Counting objects: 100% (219/219), done.
remote: Compressing objects: 100% (106/106), done.
remote: Total 515 (delta 136), reused 151 (delta 104), pack-reused 296
Receiving objects: 100% (515/515), 210.25 KiB | 221.00 KiB/s, done.
Resolving deltas: 100% (276/276), done.
```
