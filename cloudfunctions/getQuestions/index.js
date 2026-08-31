// 云函数 getQuestions：返回 15 道题（按 sort_order 升序）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()
  const res = await db.collection('questions')
    .orderBy('sort_order', 'asc')
    .limit(100)
    .get()

  // 整理为前端契约：id 取自 _id（显式数字 1-15）；options/score_rule 已是对象
  const data = res.data.map(r => ({
    id: r._id,
    title: r.title,
    question: r.question,
    options: r.options,           // {a,b,c,d}
    score_rule: r.score_rule,     // {A:{I:2},...} 大写键
    sort_order: r.sort_order
  }))
  return data
}
