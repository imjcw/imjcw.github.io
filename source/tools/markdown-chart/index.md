---
title: Markdown 图表渲染
description: 输入 Mermaid 语法，实时渲染为流程图、时序图、甘特图等多种图表
layout: tool-page
defaultCode: |
  graph TD
    A[开始] --> B{判断条件}
    B -- 是 --> C[执行操作]
    B -- 否 --> D[跳过]
    C --> E[结束]
    D --> E
    style A fill:#facc15,stroke:#1a1a1a,stroke-width:3px
    style E fill:#ef4444,stroke:#1a1a1a,stroke-width:3px,color:#fff
---
