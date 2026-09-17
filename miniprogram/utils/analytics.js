// utils/analytics.js - 自定义事件埋点（异步写云数据库 logs 集合，不阻塞主流程）
// 在云开发控制台 → 数据库 → 新建 logs 集合（权限：仅创建者可读写）

let _db = null
function db() {
  if (!_db) {
    try { _db = wx.cloud.database() } catch (e) { _db = null }
  }
  return _db
}

/**
 * 埋点：异步写入 logs 集合
 * @param {string} event - 事件名，如 'ai_call_success'
 * @param {object} data - 任意附加数据
 */
function track(event, data = {}) {
  const d = db()
  if (!d) return  // 云开发未初始化，静默失败
  try {
    d.collection('logs').add({
      data: {
        event,
        data,
        created_at: d.serverDate()
      }
    }).catch(() => {})  // 写入失败不影响主流程
  } catch (e) { /* 静默 */ }
}

/**
 * 同时上报微信官方监控（需在后台"运营数据-自定义事件"注册事件 ID 才生效）
 * 不注册也不会报错，仅作辅助
 */
function reportToWechat(eventId, data = {}) {
  try {
    if (wx.reportMonitor) wx.reportMonitor(eventId, data)
  } catch (e) {}
}

module.exports = { track, reportToWechat }
