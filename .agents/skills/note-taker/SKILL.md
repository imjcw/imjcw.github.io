---
name: note-taker
description: >-
  记笔记技能（适配 imjcw 博客）。用户说「记笔记」「记录一下」「帮我记下」「note this」「笔记」或提供一段信息要求保存时使用。
  将笔记作为 Hexo 博文写入 source/_posts/<分类>/ 子目录（按分类归档，文件名带日期前缀），记录/修改/归档后自动 git 提交并 push 到仓库（触发 GitHub Pages 自动部署）。
  适用场景还包括：查找/检索已有笔记、按标签或分类浏览、归档不用的笔记。
  即使只是随口一句话的信息（比如「帮我记一下明天的日程」「记录这个想法」）也应该触发。
---

# Note Taker — 记笔记（imjcw 博客版）

把用户提供的信息整理成一条规范化的**博客笔记**，写入本 Hexo 博客的 `source/_posts/`，**记录后自动提交并推送到仓库**（GitHub Actions 会自动构建并部署到 GitHub Pages）。

## 笔记存放位置

- 笔记统一写在 **`source/_posts/<分类>/`** 子目录下。**分类子目录由 frontmatter 里的 `categories` 决定**，一篇笔记放进对应该分类的目录。
  - 例：`categories: [AI]` → 放在 `source/_posts/AI/`；`categories: [Docker]` → 放在 `source/_posts/Docker/`。
  - 已有匹配的分类目录 → 复用；没有 → 新建该分类子目录（如 `source/_posts/AI/`）。
- `source/_posts/` 根目录下已有大量历史文章（如 `Git回滚.md`、`CAS单点登录流程梳理.md`），**不要改动**它们，也不要移动它们。
- 不要碰 `themes/`、`_config.yml`、`scaffolds/`、`source/media/` 等其余文件。

## 命名

- **文件名**：`YYYY-MM-DD_短标题.md`，**日期前缀保证列表按时间排序**，一眼看出先后。
  - 例：`source/_posts/AI/2026-08-08_大模型推理与缓存机制.md`。
- 短标题用中文（与现有文章一致，如 `记一次排障`），与 `title` 保持一致或相近，简洁概括内容。

## Hexo 博文格式

每条笔记必须是 Hexo 博文（YAML frontmatter + Markdown 正文）：

```markdown
---
title: 笔记标题
date: 2026-08-08 18:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类
---

# 标题

正文内容……支持 Markdown、代码块、图片。
```

字段约定（对齐本项目现有博文，见 `Git回滚.md` 的 frontmatter）：
- `title`：中文标题，简洁描述这条笔记
- `date`：`YYYY-MM-DD HH:MM:SS`，取**今天/当前**的时间（本项目日期格式含时分秒）
- `tags`：YAML 列表，1-3 个内容/动作标签（如 `排障`、`读书`、`ai`、`工作`）
- `categories`：YAML 列表，1 个主题分类（如 `Git`、`Docker`、`前端`、`随笔`）。没有合适分类时用 `随笔` 或省略。

## 记笔记流程

1. **提取信息**：从用户的话里提取核心内容。信息不完整时（缺主题、内容太少），可以问一两个关键问题补全，但**不要过度审问**——「随便记一下」的笔记直接写，分类用 `随笔`、标签用 `随记` 即可。
2. **确定标题 / 分类 / 标签**：标题即文章名；分类和标签参照已有博文风格。
3. **写文件**：按上面模板创建 `source/_posts/<分类>/<YYYY-MM-DD>_<短标题>.md`，正文用中文写清楚要点。笔记不必长篇，记清楚就行。
4. **提交并推送**：`git add` 该文件 → `git commit`（提交信息如 `新笔记：<标题>` 或 `add <标题>`）→ `git push origin master`。
   - 推送后 GitHub Actions 会自动构建并部署到 GitHub Pages，可告知用户访问博客即可看到。
   - 提交前先 `git status` 确认只包含本次笔记文件，避免误提交其他改动。

## 检索/浏览笔记

用户要求「找一下」「查一下笔记」「有哪些笔记」时：

- 按标题搜：`grep -i "<关键词>" source/_posts/` 或直接看文件名
- 按标签/分类找：搜 frontmatter 里的 `tags:` / `categories:` 行
- 按时间找：frontmatter 的 `date` 字段过滤
- 给出候选列表（路径 + 标题 + 日期 + 标签），让用户确认看哪篇；需要时再读出内容

## 归档

用户要求「清理」「归档」「这条不要了」时：

- 将博文移到 `source/_drafts/`（Hexo 草稿目录，不会被发布到博客），保留原文件名。
- **提交并推送**：`git add` → `git commit`（如 `归档：<标题>`）→ `git push origin master`。
- 若用户明确要求永久删除，才把文件删除并提交推送；默认优先移入草稿而非删除。

## Git 提交约定

- **分支**：`master`；**远程**：`origin`（`git@github.com:imjcw/imjcw.github.io.git`）。
- **提交信息**：中文，形如 `新笔记：<标题>` / `归档：<标题>` / `更新：<标题>`。
- 每次记录、修改、归档，都执行 `git add <目标> && git commit -m "..." && git push origin master`。
- 用 `git status` / `git log -1` 在推送前后确认干净，避免误推无关改动。

## 边界

- 判据：只要用户表达了「记录这段信息/想法/待办」的意思就触发，不要问「你想新建什么文件格式」之类的问题。
- 笔记是**博客博文**，发布后读者可见；若用户只想本地记私密内容，先说明后果，由用户决定是否照常记录。
- 每次只处理本次笔记对应的文件，专注、不扩散到其他文件。
- 内容用中文记录。

## 参考模板

看 `assets/example-note.md` 获取一条完整示例。