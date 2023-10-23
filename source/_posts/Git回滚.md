---
title: Git回滚
tags:
    - Git
date: 2020-10-09 18:38:45
categories:
    - Git
---
### 前言

有时候，我们开发的一些功能不会上线，或者有问题，需要回滚代码。

当有多人合作的时候，可能造成回滚的代码“重生”，这是操作不当造成的。

我们需要做一些操作避免这些问题。

### 本地回滚

通过 `log` 获取回滚的 `commit id`

```bash
git log
```

通过 `reset` 命令回滚代码

```bash
git reset --hard {commit-id}
```

### 回滚远程

`本地回滚` 操作完成之后，将代码推送到远程(强推)

```bash
git push origin {branch-name}
```

### 本地分支重新同步远程代码

多人合作中，如果某个同事对远程代码进行了回滚，而此时我们直接 `pull` 远程的代码，本地会进行合并，将本地的脏代码再次合并到此分支上。

所以我们在远程分支回滚之后，需要重新同步远程分支。

这里提供两中方式：

**方法一**

- 删除本地分支
- 重新 `fetch` 远程分支

```bash
// 删除本地分支，此时需要 checkout 到别的分支上
git branch -D {branch-name}

// 重新 fetch 远程分支
git fetch origin {branch-name}

// checkout 到此分支
git checkout {branch-name}
```

**方法二**

- 重新获取远程分支的最新 commit id
- 手动回滚到此 commit id

```bash
// 重新获取远程分支的最新 commit id
git remote update origin --prune

// 手动回滚到此 commit id
git reset --hard origin/{branch-name}
```