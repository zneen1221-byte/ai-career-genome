# 🧬 AI Career Genome · AI 时代职业基因测试

> 一个基于 AI 分析的微信小程序，通过 20 道精心设计的问题，帮助你在 AI 时代找到属于自己的职业方向。

## ✨ 核心特性

- **20 道科学设计问题**：覆盖兴趣倾向、能力模型、人格特质、AI 时代适应力 4 大维度
- **6 种职业人格**：未来创造者 C / 战略家 S / 影响者 I / 经营者 B / 匠人 M / 探索者 E
- **AI 深度报告**：通过腾讯云 CloudBase AI（hy3 模型）生成个性化职业画像
  - 一句话画像
  - 3 大优势分析
  - AI 时代职业方向（含契合度 高/中/低）
  - 短期 / 中期 / 长期成长行动路线
- **隐私合规**：完整隐私政策页 + 微信公众平台后台合规指引配置
- **动态分享**：分享给朋友 + 分享到朋友圈，动态标题「我未来职业是【xxx】，你呢？」

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 前端 | 微信小程序原生（WXML / WXSS / JS） |
| 后端 | 微信云开发（云函数 + 云数据库） |
| AI | 腾讯云 CloudBase AI+ 体验模型 hy3（流式 streamText） |
| 数据库 | 微信云数据库（5 集合：users / questions / answers / career_types / reports） |

## 📂 项目结构

```
ai-career-miniapp/
├── miniprogram/                  # 小程序前端
│   ├── pages/
│   │   ├── index/                # 首页
│   │   ├── test/                 # 20 题答题页
│   │   ├── analyzing/            # AI 报告生成中
│   │   ├── result/               # 结果展示（含 AI 深度报告）
│   │   └── privacy/              # 隐私政策
│   ├── utils/
│   │   └── request.js           # wx.cloud.callFunction 封装
│   ├── app.js / app.json / app.wxss
│   └── project.config.json
├── cloudfunctions/               # 云函数
│   ├── getQuestions/             # 取题目
│   └── submitTest/               # 提交 + 评分 + 返回主类型
├── database/
│   ├── career.sql                # MySQL 表结构 + 种子数据
│   ├── career_types.json         # 6 种职业人格类型
│   └── questions_16-20.json      # 第 16-20 题 JSONLines 导入文件
└── docs/
    └── SPEC.md                   # 完整产品 SPEC
```

## 🚀 快速开始

### 1. 准备环境

- 微信开发者工具（最新版）
- 微信小程序 AppID
- 微信云开发环境（开通 CloudBase AI+ 体验模型 hy3）

### 2. 导入项目

- 微信开发者工具 → 导入项目
- 项目根目录选 `ai-career-miniapp`
- 填入 AppID

### 3. 配置云环境

- 修改 `miniprogram/config.js` 中的 `envId` 为你的云环境 ID
- 修改 `project.config.json` 中的 `appid`

### 4. 部署云函数

- 右键 `cloudfunctions/` 下每个云函数 → 「上传并部署：云端安装依赖」
- 涉及函数：`getQuestions`、`submitTest`

### 5. 初始化数据库

微信云开发控制台 → 数据库 → 创建 5 个集合：

| 集合 | 字段 | 权限 |
|---|---|---|
| `users` | `openid`, `created_at` | 仅管理端可读写 |
| `questions` | `title`, `question`, `options`, `score_rule`, `sort_order` | 仅管理端可读写 |
| `answers` | `user_id`, `openid`, `question_id`, `option`, `created_at` | 仅管理端可读写 |
| `career_types` | `type_code`, `type_name`, `description`, `strength`, `career_direction` | 仅管理端可读写 |
| `reports` | `user_id`, `top_type`, `ai_report`, `created_at` | 仅管理端可读写 |

**导入种子数据**：

1. 用 `database/career_types.json` 导入 6 条职业类型（JSONLines 格式）
2. 用 `database/questions_16-20.json` 导入第 16-20 题（JSONLines 格式）
3. 前 15 题请参考 `database/career.sql` 中的 INSERT 语句手动添加到 questions 集合

### 6. 开通 AI+

- CloudBase 控制台 → AI+ → 立即开通（免费，首月送 100 万 token）
- 确认 hy3 模型已启用

### 7. 编译测试

- 开发者工具 → 编译
- 调试基础库选 **≥ 3.15.1**（CloudBase AI SDK 要求）
- 完整流程：首页 → 答完 20 题 → analyzing 页（AI 生成中）→ result 页（含 AI 报告）

## 🎯 评分算法

每道题 4 个选项（A/B/C/D），每个选项映射到 1 种职业人格 +2 分。20 题答完后累加得到 6 类得分，取最高分为主类型。

**6 类题目分布**（20 题统计）：

| 类型 | 出现次数 |
|---|---|
| C 创造者 | 9 |
| S 战略家 | 12 |
| I 影响者 | 15 |
| B 经营者 | 12 |
| M 匠人 | 13 |
| E 探索者 | 11 |

## 🔒 隐私合规

- **隐私政策页**：8 章节（概述 / 收集信息 / 使用 / 存储 / 限制 / 用户权利 / 联系 / 更新）
- **收集字段**：`openid`、测试答案、测试结果
- **数据存储**：微信云数据库（腾讯云服务器）
- **访问权限**：所有集合「仅管理端可读写」
- **后台配置**：微信公众平台 → 设置 → 用户隐私保护指引 → 自定义添加 2 条收集项（openid + 测试答案）

## 📈 AI 报告 JSON 契约

```json
{
  "summary": "一句话画像",
  "advantages": [
    { "title": "...", "detail": "..." }
  ],
  "career_paths": [
    { "direction": "...", "fit": "high", "reason": "..." }
  ],
  "action_plan": [
    { "phase": "短期", "actions": ["...", "..."] }
  ]
}
```

> `fit` 字段必须是英文 `high` / `mid` / `low`（WXSS 不支持中文类名）

## 🗺 Roadmap

- ✅ Phase 1：基础架构 + 云开发迁移
- ✅ Phase 2：首页 + 测试 + 评分 + 结果
- ✅ Phase 2.5：隐私政策页 + 合规指引
- ✅ Phase 3：CloudBase AI（hy3）深度报告
- ✅ Phase 4：扩充到 20 题 + result 页 UI 抛光
- 🔜 Phase 5：真机预览 + 分享测试
- 🔜 Phase 6：提交审核上线

## 📄 License

MIT
