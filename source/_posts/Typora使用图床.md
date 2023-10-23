---
title: Typora使用图床
tags:
    - Typora
date: 2020-10-26 16:17:00
categories:
    - Tools
---

## 前言

最近几年一直在用 `Typora` 来编写一些日常的文档。

然而，每次需要上传文档到云端的时候，需要处理图片相关的事情。这是一个枯燥乏味的事情。

## 软件版本

`Typora` `0.9.96(beta)`

## 解决方案

### 存储到本地指定位置

操作：`文件` -> `偏好设置` -> `图像`

这里有五种选择，我们可以根据自己的需求选择自己想要的。

![Typora设置图像](/media/image-20201026134122184.png)

我的配置，如下：

![我的Typora设置图像配置](/media/image-20201026134301068.png)

效果如下：

![Typora粘贴图片后的效果](/media/image-20201026134347657.png)

#### 简单的方式

在文件的开头，写上 `typora-copy-images-to: /media`，这就是将图片复制到与当前文件所在文件夹同级的 `media` 目录中，`Demo` 如下：

![image-20201026135308261](/media/image-20201026135308261.png)



### 上传到云端

目前 `Typora` 使用了 `PicGo` 来实现上传到第三方图床的功能，这里可以参考 [使用Markdown编辑器Typora+PicGo图床+jsDelivr CDN实现高效创作](https://zhuanlan.zhihu.com/p/102776592)。

![Typora上传配置](/media/image-20201026134648724.png)

## 最后

有些问题可能人家已经有了一些解决方案，需要我们去探索发现而已。