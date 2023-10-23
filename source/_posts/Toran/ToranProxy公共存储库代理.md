---
title: Toran Proxy 公共存储库代理
tags:
    - PHP
    - Composer
    - Toran Proxy
date: 2023-10-23 22:40:45
categories:
    - PHP
    - Composer
---

## 前言

公司的网络最近一直不稳定，外加阿里的 `composer` 镜像更新不及时，导致无法用一些新的包。

为了避免测试环境构建时出现大量失败的场景，需要调研自建镜像的事宜。

由于之前公司的内部包是使用 `Toran Proxy` 管理的，故优先考虑了 `Toran Proxy`。

## 相关环境

- Docker
- `Toran Proxy` v1.5.4

## 一些问题

1. 目前 `Toran Proxy` 已经不维护了，其作者做了一个新的包管理，需要付费。

2. `Toran Proxy` 目前仅支持 `composer v1`，项目需要使用 `composer v2` 的话，需要二开。

## 修改

### 支持composer v2

为了能间接支持 `composer-v2`，只需要修改 `packages.json` 中的 `metadata-url`，使其和 `providers-lazy-url` 的值一致即可。

当然，这并不是真正的 `composer v2`，实际是让 `composer` 使用 `composer v1` 的通道下载包。

修改相关代码如下：

```php
# 文件: /var/www/src/Toran/ProxyBundle/Service/Proxy.php:132
$data['metadata-url'] = str_replace('PACKAGE', '%package%', $lazyUrl);
```

### 重置packages.json

如果代码是在启动之后改的，需要删除已经缓存的 `packages.json` 文件，这样修改后的代码才会生效。

```bash
rm -rf /var/www/web/repo/packagist/packages.json
```

### Dockerfile

如果使用的是作者提供的 `Docker` 镜像，那么我们只需要构建一个自己的镜像即可。

```Dockerfile
FROM cedvan/toran-proxy:1.5.4-1

RUN set -e; \
    sed -i "132a \$data['metadata-url'] = str_replace('PACKAGE', '%package%', \$lazyUrl);" /var/www/src/Toran/ProxyBundle/Service/Proxy.php; \
    rm -rf /var/www/web/repo/packagist/packages.json;
```

## 配置composer.json

配置很简单，安装好 `Toran Proxy` 之后，首页就表明了如何配置。

```json
{
    "config": {
        "process-timeout": 1800,
        "secure-http": false
    },
    "repositories": [
        {"type": "composer", "url": "http://域名/repo/private/"},
        {"type": "composer", "url": "http://域名/repo/packagist/"},
        {"packagist": false}
    ]
}
```

## 总结

这并不是一个完整的修改方案，目前是通过取巧的形式处理了当下的问题。
