// utils/request.js - 云函数调用封装
// 职责：统一 wx.cloud.callFunction，按 Promise 拆包
// 约定：云函数成功 return data；失败 throw Error（触发 fail）
function call(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success(res) {
        // 云函数 return 的值在 res.result
        resolve(res.result)
      },
      fail(err) {
        // 云函数 throw / 网络错误 / 函数不存在 都走这里
        console.error('[callFunction fail]', name, err)
        reject(new Error('云函数调用失败：' + (err.errMsg || '')))
      }
    })
  })
}

module.exports = { call }
