// pages/analyzing/analyzing.js - AI 分析中（动效 + 短延迟跳结果）
Page({
  data: { step: 0 },

  onLoad() {
    // 依次点亮三步，约 2 秒后跳结果页
    this.stepTimer = setInterval(() => {
      if (this.data.step < 3) this.setData({ step: this.data.step + 1 })
    }, 600)
    this.jumpTimer = setTimeout(() => {
      wx.redirectTo({ url: '/pages/result/result' })
    }, 2200)
  },

  onUnload() {
    clearInterval(this.stepTimer)
    clearTimeout(this.jumpTimer)
  }
})
