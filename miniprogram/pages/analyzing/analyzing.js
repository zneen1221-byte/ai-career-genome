// pages/analyzing/analyzing.js - Phase 3：调用 CloudBase AI 生成深度报告
const ai = wx.cloud.extend.AI
const { track } = require('../../utils/analytics')

const SYSTEM_PROMPT = `你是 AI 时代职业基因解读师。根据用户的 6 维得分和 15 题作答，生成个性化职业报告。
严格输出 JSON，不要 markdown 围栏，不要任何解释文字。
JSON 契约：
{
  "type": "主类型中文名",
  "summary": "一句不超过 40 字的个性化总结",
  "advantages": [{"title":"4-8 字","detail":"40-80 字分析"}],
  "career_paths": [{"direction":"方向名","reason":"30-60 字","fit":"high/mid/low"}],
  "action_plan": [{"phase":"短期/中期/长期","actions":["具体行动"]}]
}
要求：advantages 3 条，career_paths 3 条，action_plan 3 阶段每阶段 2-3 条。中文文案，fit 字段只能取 high/mid/low 三个英文枚举值。`

function buildUserPrompt(testResult) {
  const { top_type, sorted, answers, type_info } = testResult
  const scoreLine = sorted.map(s => `${s.type}: ${s.score}`).join('，')
  const answerLine = (answers || []).map(a => `题${a.question_id}选${a.option}`).join('；')
  return `用户主类型：${type_info && type_info.type_name || top_type}
6 维得分：${scoreLine}
答题分布：${answerLine}
静态参考描述：${type_info && type_info.description || ''}
请生成该用户的专属 AI 深度职业报告，严格按 JSON 契约输出。`
}

// 容错解析：剥围栏、截 {}、字段校验
function parseJsonLoose(raw) {
  if (!raw) return null
  let s = raw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim()
  const start = s.indexOf('{'), end = s.lastIndexOf('}')
  if (start < 0 || end < 0) return null
  s = s.slice(start, end + 1)
  try {
    const obj = JSON.parse(s)
    if (!obj.type || !Array.isArray(obj.advantages)) return null
    return obj
  } catch (e) { return null }
}

Page({
  data: { step: 0 },

  async onLoad() {
    const testResult = wx.getStorageSync('testResult')
    if (!testResult || !testResult.top_type) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }
    track('analyzing_enter', { top_type: testResult.top_type })

    // 步骤动效：每 700ms 推进一格
    this.stepTimer = setInterval(() => {
      if (this.data.step < 3) this.setData({ step: this.data.step + 1 })
    }, 700)

    // 最小展示 1.5s，保证动效走完
    const minDelay = new Promise(r => setTimeout(r, 1500))

    let aiReport = null
    try {
      const model = ai.createModel('cloudbase')
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(testResult) }
      ]

      // 重试 3 次扛 429 限流（成长计划 5 并发上限）
      let raw = ''
      let lastErr = null
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          // 小程序端 streamText 必须把参数包在 data 里（与 Node SDK 不同）
          const { textStream } = await model.streamText({
            data: {
              model: 'hy3',
              messages
            }
          })
          // 25s 超时兜底
          raw = await Promise.race([
            (async () => {
              let s = ''
              for await (const chunk of textStream) s += chunk
              return s
            })(),
            new Promise((_, rej) => setTimeout(() => rej(new Error('CLIENT_TIMEOUT')), 25000))
          ])
          if (raw) break  // 拿到内容就跳出重试循环
        } catch (e) {
          lastErr = e
          console.warn(`[AI] 第 ${attempt + 1}/3 次失败:`, e && (e.message || e.errMsg) || e)
          if (attempt < 2) await new Promise(r => setTimeout(r, 2000))
        }
      }

      if (raw) {
        aiReport = parseJsonLoose(raw)
        if (aiReport) {
          track('ai_call_success', { attempts: raw ? 1 : 0 })
        } else {
          track('ai_json_parse_fail', { raw_head: raw.slice(0, 100) })
          console.warn('[AI] JSON 解析失败，raw=', raw.slice(0, 200))
        }
      } else {
        track('ai_call_fail', { reason: '3_retries_failed' })
        console.warn('[AI] 3 次重试均失败，回退静态', lastErr && (lastErr.message || lastErr.errMsg) || lastErr)
        aiReport = null
      }
    } catch (e) {
      track('ai_call_fail', { reason: 'exception', msg: String(e && e.message || e).slice(0, 100) })
      console.warn('[AI] 调用失败，回退静态', e)
      aiReport = null
    }

    clearInterval(this.stepTimer)
    const merged = Object.assign({}, testResult, { ai_report: aiReport })
    wx.setStorageSync('testResult', merged)

    // 把 AI 报告存到 reports 集合（用于"我的报告历史"页）
    // 仅当有 AI 报告或主类型时存；report_id 用于后续追溯
    try {
      const db = wx.cloud.database()
      const addRes = await db.collection('reports').add({
        data: {
          top_type: testResult.top_type,
          type_name: testResult.type_info && testResult.type_info.type_name,
          scores: testResult.scores,
          ai_report: aiReport,
          answers: testResult.answers || [],
          created_at: db.serverDate()
        }
      })
      merged._report_id = addRes._id
      wx.setStorageSync('testResult', merged)
      track('report_saved', { report_id: addRes._id })
    } catch (e) {
      track('report_save_fail', { msg: String(e && e.errMsg || e.message || e).slice(0, 100) })
      // 存储失败不影响主流程
    }

    track('analyzing_complete', { has_ai: !!aiReport })
    wx.redirectTo({ url: '/pages/result/result' })
  },

  onUnload() {
    clearInterval(this.stepTimer)
  }
})
