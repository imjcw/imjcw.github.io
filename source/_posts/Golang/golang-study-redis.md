---
title: Golang学习笔记之使用Redis
tags:
    - Golang
    - Redis
date: 2021-04-09 13:13:45
categories:
    - Golang
---
## 前言

## Redis包

包：[github.com/go-redis/redis](https://github.com/go-redis/redis)

文档：[传送门](https://pkg.go.dev/github.com/go-redis/redis/v8)

## Demo

```golang
package main

import (
    "context"
    "fmt"
    "time"

    "github.com/go-redis/redis"
)

var ctx = context.Background()

func main() {
    client := getRedis()

    // get
    value, err := client.Get(ctx, "golang:test").Result()
    if err != nil {
        panic(err.Error())
    }
    fmt.Println(value)

    // setNx
    err = client.SetNX(ctx, "golang:test", "redis nx", time.Duration(2)*time.Second).Err()
    if err != nil {
        panic(err.Error())
    }

    // set
    err = client.Set(ctx, "golang:test", "redis", time.Duration(10)*time.Minute).Err()
    if err != nil {
        panic(err.Error())
    }
}

// getRedis redis.newClient
func getRedis() *redis.Client {
    return redis.NewClient(&redis.Options{
        Addr:     "127.0.0.1:6379",
        Password: "",
        DB:       0,
    })
}
```

## 最后

还算简单