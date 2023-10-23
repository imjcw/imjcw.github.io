---
title: Golang学习笔记之使用JWT
tags:
    - Golang
    - JWT
date: 2021-03-26 13:13:45
categories:
    - Golang
---

## 前言

## JWT包

包：[github.com/dgrijalva/jwt-go](https://github.com/dgrijalva/jwt-go)

文档：[传送门](https://pkg.go.dev/github.com/dgrijalva/jwt-go)

## Demo

```golang
package main

import (
    "fmt"
    "time"

    "github.com/dgrijalva/jwt-go"
)

// Claims is jwt struct
type Claims struct {
    ID        int64  `json:"id,omitempty"`
    LoginName string `json:"name,omitempty"`
    jwt.StandardClaims
}

var jwtSecret string = "golang-test"

func main() {
    exp := time.Now().Add(time.Duration(1) * time.Hour)
    user := Claims{
        ID:        1,
        LoginName: "golang",
        StandardClaims: jwt.StandardClaims{
            ExpiresAt: exp.Unix(),
        },
    }

    token, err := Encode(user)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(token)

    claims, err := Decode(token)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(claims)
}

// Encode is jwt Encoder
func Encode(claims Claims) (string, error) {
    tokenHandler := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return tokenHandler.SignedString([]byte(jwtSecret))
}

// Decode is jwt Decoder
func Decode(token string) (Claims, error) {
    claims := Claims{}

    _, err := jwt.ParseWithClaims(token, &claims, func(t *jwt.Token) (interface{}, error) {
        if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
        }
        return []byte(jwtSecret), nil
    })

    return claims, err
}
```

## 最后

这个需要理解一下其概念。

同时，`jwt.StandardClaims` 中已经定义了一些自定义的字段，我们需要根据实际场景进行重写(主要是类型)。