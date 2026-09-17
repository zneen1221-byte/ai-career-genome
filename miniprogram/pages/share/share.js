// pages/share/share.js - 海报生成页
// Canvas 2D 离屏绘制 → 导出临时图片 → 长按保存或保存到相册
const { track } = require('../../utils/analytics')

Page({
  data: {
    poster: null,   // 海报图片临时路径
    error: null      // 错误信息
  },

  // 用于绘制的数据
  _drawData: null,

  onLoad() {
    const r = wx.getStorageSync('testResult')
    if (!r || !r.type_info) {
      wx.redirectTo({ url: '/pages/index/index' })
      return
    }
    this._drawData = {
      typeName: r.type_info.type_name || '探索者',
      summary: (r.ai_report && r.ai_report.summary) || r.type_info.description || 'AI 时代职业探索者'
    }
  },

  onReady() {
    // onReady 后 canvas 已挂载到 DOM，可拿 node
    this.generatePoster()
  },

  async generatePoster() {
    try {
      // 1. 调云函数拿小程序码 fileID
      const callRes = await wx.cloud.callFunction({ name: 'getQRCode' })
      const qrFileID = callRes.result && callRes.result.fileID
      if (!qrFileID) {
        throw new Error(callRes.result && callRes.result.message || '云函数未返回 fileID')
      }

      // 2. downloadFile 把 fileID 转临时路径（Canvas 不识别 cloud:// 协议）
      const dlRes = await wx.cloud.downloadFile({ fileID: qrFileID })
      const qrTempPath = dlRes.tempFilePath

      // 3. 拿 canvas node
      const canvasNode = await new Promise((resolve, reject) => {
        wx.createSelectorQuery()
          .select('#poster')
          .fields({ node: true, size: true })
          .exec(res => {
            if (res[0] && res[0].node) resolve(res[0])
            else reject(new Error('canvas node 未找到'))
          })
      })
      const canvas = canvasNode.node
      const dpr = wx.getSystemInfoSync().pixelRatio || 2
      canvas.width = 750 * dpr
      canvas.height = 1000 * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)

      // 4. 并行加载 LOGO 和小程序码
      const logoImg = await this._loadImage(canvas, '/assets/logo.png')
      const qrImg = await this._loadImage(canvas, qrTempPath)

      // 5. 绘制
      this._drawPoster(ctx, this._drawData, logoImg, qrImg)

      // 6. 导出临时图片
      const tempRes = await new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          canvas,
          x: 0, y: 0,
          width: 750, height: 1000,
          destWidth: 750 * dpr,
          destHeight: 1000 * dpr,
          fileType: 'png',
          quality: 1,
          success: resolve,
          fail: reject
        })
      })

      this.setData({ poster: tempRes.tempFilePath })
      track('poster_generated', { type: this._drawData && this._drawData.typeName })
      // 把海报路径写回 testResult，让 result 页的 onShareAppMessage 能用作 imageUrl
      const tr = wx.getStorageSync('testResult') || {}
      tr._posterPath = tempRes.tempFilePath
      wx.setStorageSync('testResult', tr)
    } catch (e) {
      console.error('[海报生成失败]', e)
      track('poster_generate_fail', { msg: String(e && e.errMsg || e.message || e).slice(0, 100) })
      this.setData({ error: String(e && e.errMsg || e.message || e) })
    }
  },

  // 加载图片到 canvas 的 Image 对象
  _loadImage(canvas, src) {
    return new Promise((resolve, reject) => {
      const img = canvas.createImage()
      img.onload = () => resolve(img)
      img.onerror = (e) => reject(new Error('图片加载失败: ' + src))
      img.src = src
    })
  },

  // 绘制完整海报
  _drawPoster(ctx, data, logoImg, qrImg) {
    const W = 750, H = 1000

    // 1. 渐变背景
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#1a1a2e')
    grad.addColorStop(0.5, '#2d1b4e')
    grad.addColorStop(1, '#16213e')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // 2. 顶部品牌名 "AI 职业基因测试"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px sans-serif'
    ctx.fillText('AI 职业基因测试', W / 2, 80)

    // 3. LOGO 圆形剪裁（80px）
    const logoSize = 80
    const logoCx = W / 2
    const logoCy = 200
    ctx.save()
    ctx.beginPath()
    ctx.arc(logoCx, logoCy, logoSize / 2, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(logoImg, logoCx - logoSize / 2, logoCy - logoSize / 2, logoSize, logoSize)
    ctx.restore()

    // 4. 类型大标题
    ctx.fillStyle = '#a29bfe'
    ctx.font = 'bold 72px sans-serif'
    ctx.fillText(data.typeName, W / 2, 340)

    // 5. AI summary 自动换行（28px）
    ctx.fillStyle = '#e8e8f0'
    ctx.font = '28px sans-serif'
    const summaryLines = this._wrapText(ctx, data.summary, 670)
    let summaryY = 420
    for (const line of summaryLines) {
      ctx.fillText(line, W / 2, summaryY)
      summaryY += 40
    }

    // 6. 分隔线
    const dividerY = Math.max(summaryY + 40, 560)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(150, dividerY)
    ctx.lineTo(W - 150, dividerY)
    ctx.stroke()

    // 7. 小程序码（160×160）
    const qrSize = 160
    const qrX = (W - qrSize) / 2
    const qrY = dividerY + 60
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

    // 8. 底部提示文字
    ctx.fillStyle = '#778ca3'
    ctx.font = '24px sans-serif'
    ctx.fillText('长按识别 测试你的未来职业', W / 2, qrY + qrSize + 40)
  },

  // 文字自动换行
  _wrapText(ctx, text, maxWidth) {
    if (!text) return ['']
    const chars = String(text).split('')
    const lines = []
    let line = ''
    for (const ch of chars) {
      const testLine = line + ch
      const w = ctx.measureText(testLine).width
      if (w > maxWidth && line) {
        lines.push(line)
        line = ch
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
    return lines.length > 0 ? lines : ['']
  },

  // 保存到相册
  onSaveAlbum() {
    if (!this.data.poster) return
    wx.saveImageToPhotosAlbum({
      filePath: this.data.poster,
      success: () => {
        track('poster_saved_to_album', { type: this._drawData && this._drawData.typeName })
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail: (err) => {
        track('poster_save_fail', { msg: String(err && err.errMsg || '').slice(0, 100) })
        if (err.errMsg && err.errMsg.indexOf('auth deny') >= 0) {
          wx.showModal({
            title: '需要授权',
            content: '保存到相册需要相册权限，去开启？',
            success: (r) => {
              if (r.confirm) wx.openSetting()
            }
          })
        } else {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      }
    })
  },

  onBack() {
    wx.navigateBack({ fail: () => wx.redirectTo({ url: '/pages/result/result' }) })
  }
})
