// pages/history/history.js - 我的报告历史
// 查询 reports 集合（云数据库会自动按当前用户 _openid 过滤）
const { track } = require('../../utils/analytics')

Page({
  data: {
    reports: [],
    loading: true,
    error: null
  },

  onLoad() {
    track('history_view')
    this.loadReports()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadReports().then(() => wx.stopPullDownRefresh())
  },

  async loadReports() {
    this.setData({ loading: true, error: null })
    try {
      const db = wx.cloud.database()
      const res = await db.collection('reports')
        .orderBy('created_at', 'desc')
        .limit(20)
        .get()
      const reports = (res.data || []).map(r => {
        // 格式化时间
        let timeStr = ''
        try {
          const d = r.created_at ? new Date(r.created_at) : null
          if (d && !isNaN(d.getTime())) {
            const pad = (n) => n < 10 ? '0' + n : '' + n
            timeStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
          }
        } catch (e) {}
        return { ...r, created_at_str: timeStr }
      })
      this.setData({ reports, loading: false })
      track('history_loaded', { count: reports.length })
    } catch (e) {
      const msg = String(e && e.errMsg || e.message || e)
      this.setData({ error: msg, loading: false })
      track('history_load_fail', { msg: msg.slice(0, 100) })
    }
  },

  // 点击查看历史报告（伪装成 testResult 跳到 result 页）
  onViewReport(e) {
    const id = e.currentTarget.dataset.id
    const r = this.data.reports.find(x => x._id === id)
    if (!r) return

    const testResult = {
      top_type: r.top_type,
      type_info: { type_name: r.type_name || '' },
      scores: r.scores,
      ai_report: r.ai_report,
      _report_id: r._id,
      _is_history: true
    }
    wx.setStorageSync('testResult', testResult)
    track('history_view_report', { report_id: id })
    wx.navigateTo({ url: '/pages/result/result' })
  },

  onRetry() { this.loadReports() },
  onStart() { wx.reLaunch({ url: '/pages/index/index' }) }
})
