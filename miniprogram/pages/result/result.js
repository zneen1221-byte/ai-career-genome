// pages/result/result.js - 报告页：显示主类型 + 静态描述 + 得分
const { track } = require('../../utils/analytics')

Page({
  data: { result: null },

  onLoad() {
    const r = wx.getStorageSync('testResult')
    if (!r) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }
    this.setData({ result: r })
  },

  // 用户从 share 页返回后，刷新 _posterPath（让分享卡用上海报图）
  onShow() {
    const r = wx.getStorageSync('testResult')
    if (r && r._posterPath && (!this.data.result || this.data.result._posterPath !== r._posterPath)) {
      this.setData({ 'result._posterPath': r._posterPath })
    }
  },

  onRestart() {
    wx.removeStorageSync('testResult')
    wx.reLaunch({ url: '/pages/index/index' })
  },

  // 生成裂变海报 - 跳到 share 页（依赖 storage 里的 testResult）
  onGeneratePoster() {
    wx.navigateTo({ url: '/pages/share/share' })
  },

  // 分享给微信好友（对话）。按钮 open-type="share" 或右上角菜单触发
  // 优化：文案用 AI summary 金句（前 30 字），加 imageUrl 提升打开率
  onShareAppMessage() {
    const r = this.data.result || {}
    const typeName = (r.type_info && r.type_info.type_name) || '探索者'
    const summary = (r.ai_report && r.ai_report.summary) || ''
    const hook = summary ? (summary.length > 30 ? summary.slice(0, 30) + '...' : summary) : `我未来职业是【${typeName}】，你呢？`
    track('share_friend', { type: typeName, has_poster: !!r._posterPath })
    return {
      title: hook,
      path: '/pages/index/index',
      imageUrl: r._posterPath || ''
    }
  },

  // 分享到朋友圈（仅右上角菜单可触发，按钮无法触发）
  onShareTimeline() {
    const r = this.data.result || {}
    const typeName = (r.type_info && r.type_info.type_name) || '探索者'
    const summary = (r.ai_report && r.ai_report.summary) || ''
    const hook = summary ? (summary.length > 30 ? summary.slice(0, 30) + '...' : summary) : `我未来职业是【${typeName}】，你呢？`
    track('share_timeline', { type: typeName, has_poster: !!r._posterPath })
    return {
      title: hook,
      query: 'from=timeline',
      imageUrl: r._posterPath || ''
    }
  }
})
