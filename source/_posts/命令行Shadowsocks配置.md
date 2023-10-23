---
title: 命令行Shadowsocks配置
tags:
    - Shadowsocks
    - 科学上网
date: 2019-02-13 18:38:45
categories:
    - Shadowsocks
---
## 前言

一直在使用 [`Shadowsocks`](https://portal.shadowsocks.nu/aff.php?aff=21066) 去墙外逛逛，偶然发现命令行端不能直接访问墙外的资源，这一下子让我突然想要作死一下。简单查了一下，网上相关的资源还真不少。

不过在折腾的过程中也遇到了不少坑，现记录一下，供以后参考。

## 环境

`Ubuntu 14.04`

`Python 2.7`

`git`

需要拥有代理，如果没有，可以到 [shadowsocks](https://portal.shadowsocks.nu/aff.php?aff=21066) 上购买

## 配置

安装 `Shadowsocks` 命令行客户端。

```bash
sudo apt-get install -y python-pip
pip install shadowsocks
pip install git+https://github.com/shadowsocks/shadowsocks.git@master
```

编辑配置文件。**TIPS：**这里的文件可以放在你想放的任何地方，只要使用时能够取到就OK。

```bash
vim /usr/local/shadowsocks.json
```

```json
{
    "server":"haha.com",
    "server_port":15407,
    "local_address": "127.0.0.1",
    "local_port":1080,
    "password":"123",
    "timeout":600,
    "method":"chacha20-ietf-poly1305"
}
```

| 名称          | 描述                          |
| ------------- | ----------------------------- |
| server        | 代理服务器IP、域名            |
| server_port   | 代理服务器端口                |
| password      | 代理服务器密码                |
| timeout       | 超时时间                      |
| method        | 链接方式                      |
| local_address | 本地的ip，127.0.0.1就已经满足 |
| local_port    | 本地端口                      |

启动代理服务器

```bash
sslocal -c /usr/local/shadowsocks.json -d start
```

安装代理转换 `privoxy`，将 `Socks5 ` 代理转化为 `http ` 代理

```bash
sudo apt-get install -y privoxy
```

编辑 `privoxy` 的配置文件。

```bash
sudo vim /etc/privoxy/config
```

*这里有一点需要注意的，请看下面的备注*

```bash
# 下面一行是默认存在的，如果没有，则需要添加
# 如果 `8118` 端口被占用了，则更换一个未被占用的端口就好
# 但是要记住端口号，后面需要对此做配置的
listen-address 127.0.0.1:8118

# 下面一行是默认存在的，如果没有，那恭喜你
# 如果有，那么需要你默默的在最前面加个 `#`
# 不然启动会失败
listen-address [::1]:8118

# 下面的内容是需要添加进配置文件的，需要注意的是 `.` 必须要
forward-socks5 / 127.0.0.1:1080 .
```

配置完成后，直接启动 `privoxy`

```bash
sudo service privoxy start
```

如若启动失败，那就看日志继续查吧，下面是日志的地址：

```bash
/var/log/privoxy/logfile
```

最后一步了，我们需要设置环境变量，指定 `http`、`https` 等链接走我们指定的代理。

```bash
export http_proxy=http://127.0.0.1:8118
export https_proxy=http://127.0.0.1:8118
```

OK，来试一下成功没有。

```bash
curl www.google.com
curl https://www.google.com
```

## 最后

打完收工