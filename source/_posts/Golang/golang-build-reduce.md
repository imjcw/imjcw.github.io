---
title: 优化Golang编译时的二进制文件大小
tags:
    - Golang
date: 2023-10-25 19:39:13
banner_img: /media/Golang/banner-1698400614.png
categories:
    - Golang
post_img:
    enable: true
    default: /media/Golang/banner-1698400614.png
---

## 前言

公司用了阿里云的 `SLS` 来查看分析日志，可站点打开实属很慢，有时候某些简单的查询需要经历登录、选时间、编写语句、查询、筛选等多个步骤。

因此，我使用 `Golang` 开发了一个小型日志分析工具，并部署在公司的内部服务器上，以便查询特定场景的日志。

## 遇到的问题

### net包问题

最初的构建命令很简单：`go build -o demo`。然而，当我尝试在另一台服务器上运行 `demo` 二进制文件时，由于 `Golang` 中的 `net` 包依赖，出现了错误。

原因是默认情况下 `Go` 编译器会使用动态链接方式将网络相关的包链接到生成的二进制文件中。这意味着生成的二进制文件将依赖于系统中已安装的共享库来提供网络功能。

为了能够不依赖运行环境的网络，于是加上了 `-tags netgo`，将 `Go` 标准库中与网络相关的包（比如: `net/http`）静态链接到生成的二进制文件中。

```bash
go build -tags netgo -o demo
```

### 二进制文件大小问题

由于没有任何参数优化，原始包的大小是 `19M`，每次 `scp` 都会多花一点时间。有足够的时间，我深入研究了如何减小 `Golang` 二进制文件的大小的技巧。

#### 使用编译选项 `-ldflags="-s -w"`

> `Go` 编译器默认编译出来的程序会带有符号表和调试信息，一般来说 `release` 版本可以去除调试信息以减小二进制体积。
> -s：忽略符号表和调试信息。
> -w：忽略DWARFv3调试信息，使用该选项后将无法使用gdb进行调试。
> 
> 摘自《[减小 Go 代码编译后的二进制体积](https://geektutu.com/post/hpg-reduce-size.html#2-%E7%BC%96%E8%AF%91%E9%80%89%E9%A1%B9)》

效果很明显，编译之后，二进制文件大小变成了 `14M`

```bash
go build -ldflags="-s -w" -tags netgo -o demo
```

#### 使用 `UPX` 压缩 `Golang` 二进制文件

> UPX is an advanced executable file compressor. UPX will typically reduce the file size of programs and DLLs by around 50%-70%, thus reducing disk space, network load times, download times and other distribution and storage costs.
>
> UPX 是一种先进的可执行文件压缩器。 UPX 通常会将程序和 DLL 的文件大小减少约 50%-70%，从而减少磁盘空间、网络加载时间、下载时间和其他配送和存储成本。(谷歌翻译)
>
> 摘自《[upx/upx](https://github.com/upx/upx)》

效果更加明显了，编译之后，二进制文件大小变成了 `5M`

```bash
go build -ldflags="-s -w" -tags netgo -o demo && upx -9 demo
```

#### 执行效果

```bash
root@fba172880d83:~/go/src/demo.com/sls/logs# go build -tags netgo -o demo
root@fba172880d83:~/go/src/demo.com/sls/logs# ls -lh demo
-rwxr-xr-x 1 root root  19M Oct 25 19:10 demo
root@fba172880d83:~/go/src/demo.com/sls/logs#
root@fba172880d83:~/go/src/demo.com/sls/logs# go build -ldflags="-s -w" -tags netgo -o demo
root@fba172880d83:~/go/src/demo.com/sls/logs# ls -lh demo
-rwxr-xr-x 1 root root  14M Oct 25 19:10 demo
root@fba172880d83:~/go/src/demo.com/sls/logs#
root@fba172880d83:~/go/src/demo.com/sls/logs# go build -ldflags="-s -w" -tags netgo -o demo && upx -9 demo
root@fba172880d83:~/go/src/demo.com/sls/logs# ls -lh demo
-rwxr-xr-x 1 root root 5.0M Oct 25 19:10 demo
```

## upx的安装

### linux

若是 `ubuntu`，使用 `apt` 命令安装即可。

```bash
sudo apt install -y upx-ucl
```

若是 `centos`，貌似也是可以使用 `yum` 安装的。

```bash
sudo yum install -y upx
```

至于编译，小伙伴们自行探索吧，从作者搜索的结果来看，是需要先安装 `ucl` 才可以。

### mac

使用 `brew` 直接安装即可

```bash
brew install upx
```

### windows

`windows` 的小伙伴自行到[官方仓库](https://github.com/upx/upx/releases/)下载吧，作者没有尝试如何操作。

## 最后

问题的解决是一个持续的探索过程。尽管 `19M` 的文件大小可能没有太大影响，但当遇到需要解决的实际问题时，尤其是在 `Golang` 优化的背景下，这次探索就变得有意义了。

## 参考

- 《[减小 Go 代码编译后的二进制体积](https://geektutu.com/post/hpg-reduce-size.html)》
- 《[upx/upx](https://github.com/upx/upx)》
- 《[在ubuntu中安装upx](https://codeantenna.com/a/pcuR0PD5dL)》
