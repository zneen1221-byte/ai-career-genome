# Project Initialization Plan
## AI Career Genome · AI时代职业基因测试

> Phase 1 执行记录文档。本文件记录项目初始化的关键决策与交付物，作为后续阶段的基线。

---

## 一、SPEC 状态

| 项 | 值 |
|---|---|
| 文档 | `docs/SPEC.md`（源：工作目录根 SPEC V1.0） |
| 版本 | V1.0 MVP |
| 状态 | 已通读，作为开发依据 |

---

## 二、关键决策（Phase 1 已固化）

| 项 | 决定 | 依据 |
|---|---|---|
| 目录结构 | 平级结构（miniprogram / server / database / docs 平级） | 用户确认；后端不应嵌入小程序根目录 |
| 数据库文件拆分 | `user.sql` + `career.sql`，按业务域归并 | 按 SPEC §4 命名，扩展语义 |
| 数据库 | MySQL | 用户确认 |
| 后端框架 | Express | 轻量、生态成熟 |
| 前端 UI | 原生组件（不引入 TDesign） | 减少依赖，技术小白可维护 |
| AppID | touristappid（游客模式） | 用户暂无 AppID，开发者工具可用测试号 |

### 数据库文件归并方案

| 文件 | 包含表 | 业务域 |
|---|---|---|
| `user.sql` | User / Answer / Report | 用户答题与报告 |
| `career.sql` | Question / Career Type / Career Database | 题库与职业知识 |

---

## 三、技术架构

```
微信小程序 (WXML/WXSS/JS)
        │  wx.request / HTTPS
        ▼
Node.js + Express
  api/  ──>  services/  ──>  models/
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
     MySQL                  AI API (aiService.js)
                              │
                       prompts/ (3 个模板)
```

### 分层职责

| 层 | 目录 | 职责 |
|---|---|---|
| 路由层 | `server/api/` | 接收 HTTP 请求、参数校验、调用 service |
| 业务层 | `server/services/` | 业务编排、AI 调用、评分逻辑 |
| 数据访问层 | `server/models/` | MySQL 数据读写 |
| AI 封装 | `server/services/aiService.js` | 统一 AI 供应商调用接口 |
| Prompt 模板 | `server/prompts/` | 人格分析 / 方向推荐 / 成长路线 |

---

## 四、Phase 1 交付物清单

| # | 模块 | 文件 | 类型 |
|---|---|---|---|
| 1 | 根 | `README.md`, `.gitignore` | 文档 |
| 2 | docs | `SPEC.md`, `PROJECT_INITIALIZATION_PLAN.md` | 文档 |
| 3 | 小程序配置 | `app.js/json/wxss`, `project.config.json`, `sitemap.json` | 配置 |
| 4 | 小程序页面 | `pages/{index,test,analyzing,result,share}/*` × 4 | 占位脚手架 |
| 5 | 小程序工具 | `utils/request.js` | 占位桩 |
| 6 | server 入口 | `app.js`, `package.json` | 骨架 |
| 7 | server config | `config/index.js`, `config/db.js` | 配置桩 |
| 8 | server api | `api/test.js`, `api/report.js`, `api/index.js` | 路由桩 |
| 9 | server services | `testService.js`, `reportService.js`, `aiService.js` | 接口桩 |
| 10 | server models | `user/question/answer/careerType/careerDatabase/report.js` | 模型桩 |
| 11 | server prompts | `career-analysis.md` | 模板占位 |
| 12 | database | `user.sql`, `career.sql` | 建表 DDL |

---

## 五、Phase 1 验收标准

- [ ] 微信开发者工具导入 `miniprogram/` 可编译通过，5 个页面可跳转（空内容）
- [ ] `cd server && npm install && npm start` 可启动，访问 `/api/test/questions` 返回占位 JSON
- [ ] `mysql < database/user.sql && mysql < database/career.sql` 建表成功
- [ ] 目录结构与 SPEC §4 一致（采用平级结构）

---

## 六、后续阶段路线（源自 SPEC §12）

```
Phase 2  首页 + 测试模块（15 题）
Phase 3  评分算法（6 种人格 C/S/I/B/M/E）
Phase 4  接入 AI + 报告生成
Phase 5  分享功能（海报）
Phase 6  测试发布
```

每个阶段开始前，遵循 SPEC §12 AI 协作规则：阅读 SPEC → 确认当前模块 → 输出修改计划 → 再生成代码。
