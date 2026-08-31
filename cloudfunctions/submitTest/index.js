// 云函数 submitTest：openid 建用户 → 存答案 → 评分 → 返回主类型描述
// 评分算法内联自原 server/services/scoreService.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const PERSONALITIES = ['C', 'S', 'I', 'B', 'M', 'E']

// 评分：遍历答案按 score_rule 累加 C/S/I/B/M/E，取最高为主类型
function calculate(answers, questions) {
  const ruleMap = new Map(questions.map(q => [q.id, q.score_rule]))
  const scores = { C: 0, S: 0, I: 0, B: 0, M: 0, E: 0 }
  for (const a of answers) {
    const rule = ruleMap.get(a.question_id)
    if (!rule) continue
    const opt = String(a.option || '').toUpperCase()   // a→A
    const gain = rule[opt]
    if (gain && typeof gain === 'object') {
      for (const [t, v] of Object.entries(gain)) {
        if (PERSONALITIES.includes(t)) scores[t] += Number(v) || 0
      }
    }
  }
  let top_type = 'C', top_score = -1
  for (const t of PERSONALITIES) {
    if (scores[t] > top_score) { top_score = scores[t]; top_type = t }
  }
  const sorted = PERSONALITIES
    .map(t => ({ type: t, score: scores[t] }))
    .sort((x, y) => y.score - x.score)
  return { scores, top_type, top_score, sorted }
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const answers = Array.isArray(event.answers) ? event.answers : []
  const db = cloud.database()

  // 1. 获取或创建用户（openid 作为唯一标识）
  let user = (await db.collection('users').where({ openid }).get()).data[0]
  if (!user) {
    const addRes = await db.collection('users').add({
      data: { openid, created_at: db.serverDate() }
    })
    user = { _id: addRes._id, openid }
  }

  // 2. 批量存答案（15 条并发写）
  const now = new Date()
  const records = answers.map(a => ({
    user_id: user._id,
    openid,
    question_id: Number(a.question_id),
    option: String(a.option || '').toUpperCase(),
    created_at: now
  }))
  await Promise.all(records.map(r => db.collection('answers').add({ data: r })))

  // 3. 读题目（取 score_rule）
  const qRes = await db.collection('questions').orderBy('sort_order', 'asc').limit(100).get()
  const questions = qRes.data.map(r => ({ id: r._id, score_rule: r.score_rule }))

  // 4. 评分
  const result = calculate(answers, questions)

  // 5. 取主类型静态描述
  const tRes = await db.collection('career_types').where({ type_code: result.top_type }).get()
  const t = tRes.data[0] || null
  const type_info = t ? {
    type_code: t.type_code,
    type_name: t.type_name,
    description: t.description,
    strength: t.strength,
    career_direction: t.career_direction
  } : null

  // 6. 返回（契约与原 testService 对齐，去掉 session_id）
  return {
    user_id: user._id,
    top_type: result.top_type,
    top_score: result.top_score,
    scores: result.scores,
    sorted: result.sorted,
    type_info
  }
}
