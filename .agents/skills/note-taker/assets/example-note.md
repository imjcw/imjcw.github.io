# assets/example-note.md
# 示例笔记 — 完整参考（博客版）

以下是一条完整笔记示例，展示在 `source/_posts/<分类>/` 按分类子目录存放的 Hexo 博文。

## 文件位置

```
source/_posts/AI/2026-08-08_笔记系统设计.md
```

## 文件内容

```markdown
---
title: 笔记系统设计
date: 2026-08-08 18:30:00
tags:
  - 工具
  - 随记
categories:
  - AI
---

# 笔记系统设计

今天想清楚了笔记系统怎么组织：

1. **按分类子目录存放**：categories 决定放哪个子目录（如 `source/_posts/AI/`）
2. **规范命名**：`YYYY-MM-DD_短标题.md`，日期前缀保证按时间排序
3. **元信息**：frontmatter 里记录 title/date/tags/categories
4. **自动部署**：提交推送后 GitHub Actions 自动编译发布

## 待办

- [ ] 写一个检索脚本
- [ ] 整理旧笔记
```

## 关键点

- `date` 用 `YYYY-MM-DD HH:MM:SS` 格式（含时分秒，对齐本项目现有博文）
- `tags` 是 YAML 列表，放内容标签，方便检索
- `categories` 决定文件放哪个子目录（`source/_posts/<分类>/`），1 个为主
- 文件名带日期前缀 `YYYY-MM-DD_短标题.md`
- 记录后记得 `git add` / `commit` / `push`