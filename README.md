# AI Career Genome · AI时代职业基因测试

> 基于 AI 分析的微信小程序职业探索工具 —— 通过 15 道题生成《我的AI时代职业报告》

## 产品简介

帮助普通人在 AI 时代回答三个问题：

- 我是谁？
- 我的优势是什么？
- AI 时代我应该往哪里发展？

通过 15 道题测试，系统从 **兴趣倾向 / 能力模型 / 职业人格 / AI时代适应方向** 四个维度分析，最终生成职业基因报告（6 种人格类型之一）。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | 微信小程序原生（WXML / WXSS / JavaScript） |
| 后端 | Node.js + Express |
| 数据库 | MySQL |
| AI | API 调用（预留接口，可切换 OpenAI / 国产大模型） |

## 目录结构

```
ai-career-miniapp/
├── miniprogram/        # 微信小程序前端
│   ├── pages/          # 5 个页面：index/test/analyzing/result/share
│   ├── components/     # 自定义组件（预留）
│   ├── utils/          # 工具函数（request/存储）
│   ├── images/         # 静态资源
│   ├── app.js          # 应用入口
│   ├── app.json        # 全局配置
│   ├── app.wxss        # 全局样式
│   ├── project.config.json
│   └── sitemap.json
├── server/            # Node.js 后端
│   ├── api/            # 路由层
│   ├── services/       # 业务层（含 AI 调用封装）
│   ├── models/         # 数据访问层
│   ├── prompts/        # AI Prompt 模板
│   ├── config/         # 环境配置
│   ├── app.js          # 服务入口
│   └── package.json
├── database/          # 数据库设计
│   ├── user.sql        # 用户域：User/Answer/Report
│   └── career.sql      # 职业域：Question/CareerType/CareerDatabase
└── docs/             # 文档
    ├── SPEC.md
    └── PROJECT_INITIALIZATION_PLAN.md
```

## 快速开始

### 前端（微信开发者工具）
1. 打开微信开发者工具
2. 导入项目，目录选择 `miniprogram/`
3. AppID 选择「测试号」（或填 `touristappid`）
4. 编译运行

### 后端（Node.js）
```bash
cd server
npm install
npm start          # 默认 http://localhost:3000
```

### 数据库（MySQL）
```bash
mysql -u root -p < database/user.sql
mysql -u root -p < database/career.sql
```

## 开发阶段

- [x] **Phase 1**：项目初始化（目录骨架 + 契约 + 占位）
- [ ] Phase 2：首页 + 测试模块（15 题）
- [ ] Phase 3：评分算法（6 种人格）
- [ ] Phase 4：接入 AI + 报告生成
- [ ] Phase 5：分享功能（海报）
- [ ] Phase 6：测试发布

## 文档

- [SPEC.md](./docs/SPEC.md) — 产品开发规范 V1.0
- [项目初始化计划](./docs/PROJECT_INITIALIZATION_PLAN.md) — Phase 1 执行记录

## 开发约定

- 使用 ES6+ 语法
- 模块化、函数职责单一
- 必要中文注释
- AI 调用统一收敛到 `server/services/aiService.js`
- 所有 API 接口需文档化
