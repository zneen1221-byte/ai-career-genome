// app.js - 小程序应用入口
// 职责：管理全局生命周期与全局数据
// 云环境ID等敏感配置放在 config.js（不提交，见 config.example.js）
const config = require('./config.js')

App({
  // 全局数据
  globalData: {
    userInfo: null
    // baseUrl / sessionId 已废弃：云开发用 openid 自动注入
  },

  onLaunch() {
    // 云开发初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以支持云开发')
      return
    }
    wx.cloud.init({
      env: config.cloudEnv,
      traceUser: true
    })
    console.log('[AI Career Genome] 启动，云环境已初始化')
  }
})
