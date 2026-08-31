# AI时代个人职业重构诊断系统 V1.0

## 微信小程序开发 SPEC

| 项目 | 内容 |
|------|------|
| 版本 | V1.0 MVP |
| 项目类型 | 微信小程序 + AI职业分析系统 |
| 开发工具 | Trae CN |
| 目标 | 快速验证产品模型，实现用户裂变传播 |

---

## 1. Product Overview（产品概述）

### 1.1 产品名称

**AI时代职业基因测试**

英文：AI Career Genome

### 1.2 产品定位

一个基于 AI 分析的职业探索工具。

**通过：**
- 用户职业信息
- 兴趣倾向
- 能力模型
- AI 时代适应能力

**生成：**
- 职业人格标签
- AI 时代优势分析
- 推荐发展方向
- 未来成长路径

### 1.3 核心价值

帮助普通人在 AI 时代回答：

- 我是谁？
- 我的优势是什么？
- AI 时代我应该往哪里发展？

---

## 2. Technical Architecture（技术架构）

### 2.1 总体架构

```
微信小程序客户端
       ↓
  Node.js API Server
       ↓
     Database
       ↓
  AI Analysis Service
       ↓
  Career Knowledge Base
```

---

## 3. Technology Stack（技术栈）

### Frontend

**微信小程序原生框架：**
- WXML
- WXSS
- JavaScript / TypeScript

**UI：**
- 原生组件
- 或 TDesign MiniProgram

### Backend

- **运行时：** Node.js
- **框架：** Express / NestJS

### Database

- **MVP：** SQLite / MySQL
- **推荐：** MySQL

**数据范围：**
- 用户
- 答案
- 评分
- 报告
- 职业数据库

### AI Service

- **支持：** OpenAI API 或国产大模型 API
- **用途：**
  - 文本分析
  - 报告生成
  - 职业推荐

---

## 4. Project Structure（项目目录）

> 注：本项目采用「平级结构」实现（miniprogram / server / database / docs 平级），
> 后端不嵌入小程序根目录，避免被小程序编译扫描。

```
ai-career-miniapp/
│
├── miniprogram/
│   ├── pages/
│   │   ├── index/
│   │   ├── test/
│   │   ├── analyzing/
│   │   ├── result/
│   │   └── share/
│   ├── server/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   └── prompts/
│   ├── database/
│   │   ├── user.sql
│   │   └── career.sql
│   ├── docs/
│   │   └── SPEC.md
│   └── README.md
```

---

## 5. User Flow（用户流程）

### Flow 1：首页进入

用户打开小程序，显示：

> AI 正在改变职业世界
> 你的未来职业方向在哪里？
> 15 道问题 · AI 生成职业基因报告

**[开始测试]**

点击后进入测试页面。

### Flow 2：职业测试

- **页面：** `test`
- **规则：**
  - 一页一个问题
  - 自动保存答案
  - 显示进度

**示例：**

> **第 5 / 15 题**
>
> 如果 AI 帮你完成 80% 的重复工作，你希望：
>
> - A. 创造新的东西
> - B. 研究复杂问题
> - C. 与人连接
> - D. 创业
>
> **下一题 >**

### Flow 3：AI 分析

- **进入：** `analyzing`
- **显示：**

> 正在分析你的职业基因...
> - ✓ 分析能力模型
> - ✓ 匹配职业数据库
> - ✓ 生成未来方向

### Flow 4：结果展示

- **页面：** `result`
- **展示：** 我的 AI 职业基因

**示例类型：** 未来创造者

**内容：**
- 类型介绍
- 核心优势
- 推荐方向
- AI 时代建议

### Flow 5：分享

生成微信分享卡片。

**内容：**

> 我的 AI 职业基因：未来创造者
> AI 时代优势：★★★★★
> 测试你的未来职业方向

---

## 6. Functional Requirements（功能需求）

### FR-001 用户系统

**功能：** 微信授权登录

**获取：**
- openid
- 用户 ID

**数据库：** `User`

| 字段 | 说明 |
|------|------|
| id | 用户 ID |
| openid | 微信 openid |
| nickname | 昵称 |
| avatar | 头像 |
| created_at | 创建时间 |

### FR-002 职业测试系统

**功能：** 显示 15 道问题

**数据结构 `Question`：**

| 字段 | 说明 |
|------|------|
| id | 题目 ID |
| title | 题目标题 |
| options | 选项 |
| score_rule | 评分规则 |

### FR-003 评分系统

- **输入：** 用户答案
- **输出：** 6 种人格评分

**Personality Model（人格模型）：**

| 类型代码 | 类型名称 |
|----------|----------|
| C | 未来创造者 |
| S | 未来战略家 |
| I | 未来影响者 |
| B | 未来经营者 |
| M | 未来匠人 |
| E | 未来探索者 |

### FR-004 AI 报告生成

- **输入：** 用户画像
- **输出：** JSON

**格式：**

```json
{
  "type": "未来创造者",
  "summary": "",
  "advantages": [],
  "career_paths": [],
  "action_plan": []
}
```

### FR-005 分享系统

**功能：** 生成图片海报

**包含：**
- 用户职业类型
- 简短描述
- 小程序二维码

---

## 7. Database Design（数据库设计）

### User Table（用户表）

| 字段 | 说明 |
|------|------|
| id | 用户 ID |
| openid | 微信 openid |
| age | 年龄 |
| career | 职业 |
| experience | 工作经验 |
| created_time | 创建时间 |

### Question Table（题目表）

| 字段 | 说明 |
|------|------|
| id | 题目 ID |
| question | 题目内容 |
| option_a | 选项 A |
| option_b | 选项 B |
| option_c | 选项 C |
| option_d | 选项 D |

### Answer Table（答案表）

| 字段 | 说明 |
|------|------|
| id | 答案 ID |
| user_id | 用户 ID |
| question_id | 题目 ID |
| answer | 用户答案 |
| score | 得分 |

### Career Type Table（职业类型表）

| 字段 | 说明 |
|------|------|
| id | 类型 ID |
| type_name | 类型名称 |
| description | 类型描述 |
| strength | 核心优势 |
| career_direction | 职业方向 |

### Career Database（职业数据库）

| 字段 | 说明 |
|------|------|
| id | 职业 ID |
| traditional_job | 传统职业 |
| ai_risk | AI 替代风险 |
| future_direction | 未来方向 |
| skills | 所需技能 |
| income_model | 收入模式 |

### Report Table（报告表）

| 字段 | 说明 |
|------|------|
| id | 报告 ID |
| user_id | 用户 ID |
| personality | 人格类型 |
| content | 报告内容 |
| created_time | 创建时间 |

---

## 8. AI Prompt Specification（AI 提示词规范）

### Prompt 1：职业人格分析

- **输入：** 用户答案数据
- **输出：**
  - 职业人格类型
  - 排名
  - 原因

### Prompt 2：职业方向推荐

**要求：** 结合用户经历、兴趣、AI 趋势

- **输出：** 3 个方向

### Prompt 3：成长路线生成

- **输出：** 12 个月行动计划

---

## 9. Non Functional Requirements（非功能要求）

### 性能

| 指标 | 目标 |
|------|------|
| 首页加载 | < 3 秒 |
| 报告生成 | < 30 秒 |

### 安全

- 用户数据加密
- API KEY 服务器保存
- 不暴露 AI 接口

### 可扩展性

未来支持：
- 用户会员
- 深度报告
- 职业咨询
- 企业版本

---

## 10. MVP 范围控制

### 必须实现 ✅

- 微信登录
- 15 题测试
- 人格评分
- AI 报告生成
- 分享海报

### 暂不实现 ❌

- 社区
- 职业聊天机器人
- 在线课程
- 招聘
- 企业管理后台

---

## 11. Success Metrics（验收标准）

**上线 30 天：**

### 用户指标

| 指标 | 目标 |
|------|------|
| 注册 | ≥ 5000 |
| 测试完成率 | ≥ 60% |
| 分享率 | ≥ 20% |

### 产品指标

| 指标 | 目标 |
|------|------|
| 用户反馈"结果符合自己" | ≥ 70% |

### 技术指标

| 指标 | 目标 |
|------|------|
| 系统 | 稳定运行 |
| 错误率 | < 2% |

---

## 12. Trae CN 开发要求

### 开发原则

**代码要求：**
- 模块化
- 注释清晰
- 不写重复代码
- 所有接口文档化

### AI 协作规则

Trae 每次生成代码前，必须：

1. 阅读 SPEC
2. 确认当前模块
3. 输出修改计划
4. 再生成代码

### 开发顺序

```
Step 1  初始化项目
   ↓
Step 2  完成首页
   ↓
Step 3  完成测试模块
   ↓
Step 4  完成评分算法
   ↓
Step 5  接入 AI
   ↓
Step 6  生成报告
   ↓
Step 7  分享功能
   ↓
Step 8  测试发布
```

### 第一版开发目标

不是做一个"大而全"的职业平台。

**目标：** 用 30 天验证——普通人是否愿意通过 AI 重新认识自己的职业价值。
