// pages/result/result.js - 报告页：显示主类型 + 静态描述 + 得分
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

  onRestart() {
    wx.removeStorageSync('testResult')
    wx.reLaunch({ url: '/pages/index/index' })
  },

  // 分享给微信好友（对话）。按钮 open-type="share" 或右上角菜单触发
  onShareAppMessage() {
    const typeName = (this.data.result && this.data.result.type_info && this.data.result.type_info.type_name) || '探索者'
    return {
      title: `我未来职业是【${typeName}】，你呢？`,
      path: '/pages/index/index'   // 朋友点进来从首页开始测，不进结果页
    }
  },

  // 分享到朋友圈（仅右上角菜单可触发，按钮无法触发）
  onShareTimeline() {
    const typeName = (this.data.result && this.data.result.type_info && this.data.result.type_info.type_name) || '探索者'
    return {
      title: `我未来职业是【${typeName}】，你呢？`,
      query: 'from=timeline'
    }
  }
})
