// pages/index/index.js - 首页：测试入口
Page({
  data: { loading: false },

  // 点击「开始测试」→ 跳测试页
  // 用户身份由云函数自动注入 openid，无需前端生成 sessionId
  onStart() {
    wx.navigateTo({ url: '/pages/test/test' })
  }
})
