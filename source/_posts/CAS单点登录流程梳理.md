---
title: CAS单点登录流程梳理
tags:
    - CAS
date: 2020-06-18 18:38:45
categories:
    - 系统
---
### 前言

新的项目中，需要对接单点登录，于是了解了一下 `CAS` 的登录流程。

### 必看流程图

先上一张图(图片来源网络)

![img](https://img-blog.csdnimg.cn/img_convert/0c3263a821fa28a63220b252e9e57841.png)

### 登录

按照流程图，前端需要在初次进页面的时候，请求服务器获取鉴权。

服务端发现这个用户没有相关凭证的时候，可以返回相应的状态码告知前端需要登录。

前端跳转到 `https://*.*/cas/login?service=http://*.*` 进行登录。

登录完成之后， `CAS` 会返回给前端一个 `ticket`，例如： `http://*.*?ticket=ST-1212`

这时候，重新进入的前端页面，前端页面继续向服务端请求鉴权。

服务端发现这个用户没有服务端发放的凭证，但是拥有 `CAS` 颁发的 `ticket`，这个时候，服务端请求 `CAS` 验证登录(注意：由于 `CAS` 颁发的 `ticket` 失效时间特别短，默认是 `10s`，所以我们手动测试的时候，需要注意一下速度)。

请求链接 `demo`：`https://*.*/cas/serviceValidate?service=http://*.*?ticket=ST1212` 

验证通过的话，会返回 `XML` 信息，结果如下：

```xml
<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
    <cas:authenticationSuccess>
        <cas:user>login_name</cas:user>
    </cas:authenticationSuccess>
</cas:serviceResponse>
```

验证失败，返回 `XML` 信息，结果如下：

```xml
<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
    <cas:authenticationFailure code='INVALID_TICKET'>
        Ticket &#039;ST-12148040&#039; not recognized
    </cas:authenticationFailure>
</cas:serviceResponse>
```

如若验证通过，则生成相关凭证给前端。

当前端发起任何服务端的请求时，都需要带上服务端的凭证，如若发现失效，则重复整个登录流程。

### 登出

登出相对比较简单了，直接通过 `https://*.*/cas/logout?service=http://*.*` 即可。