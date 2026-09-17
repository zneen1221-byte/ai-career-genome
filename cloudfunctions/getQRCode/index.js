// 云函数 getQRCode：调用 wxacode.getUnlimited 生成小程序码，返回云存储 fileID
// 同一 openid 的 from_poster scene 做缓存，避免重复调 openapi（有配额）
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const SCENE = 'from_poster'

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const db = cloud.database()
  const _ = db.command

  // 1. 查缓存（按 openid+scene）
  try {
    const cacheRes = await db.collection('qrcodes').where({ openid, scene: SCENE }).limit(1).get()
    if (cacheRes.data.length > 0) {
      const cached = cacheRes.data[0]
      // 校验 fileID 仍可访问（可选，省略可减少调用）
      return { fileID: cached.fileID, cached: true }
    }
  } catch (e) {
    // 集合不存在等情况，继续走生成流程
    console.warn('[getQRCode] 缓存查询失败，继续生成', e)
  }

  // 2. 调用 openapi 生成小程序码
  let qrResult
  try {
    qrResult = await cloud.openapi.wxacode.getUnlimited({
      scene: SCENE,
      page: 'pages/index/index',
      check_path: false,
      env_version: 'develop',
      width: 430,
      auto_color: false,
      line_color: { r: 106, g: 92, b: 231 }  // 品牌紫 #6c5ce7
    })
  } catch (e) {
    console.error('[getQRCode] openapi 调用失败', e)
    return { error: 'OPENAPI_ERROR', message: String(e) }
  }

  if (!qrResult || !qrResult.buffer) {
    return { error: 'NO_BUFFER', message: 'openapi 未返回 buffer' }
  }

  // 3. 上传到云存储
  const cloudPath = `qrcode/${openid}_${Date.now()}.png`
  let uploadRes
  try {
    uploadRes = await cloud.uploadFile({
      cloudPath,
      fileContent: qrResult.buffer
    })
  } catch (e) {
    console.error('[getQRCode] uploadFile 失败', e)
    return { error: 'UPLOAD_ERROR', message: String(e) }
  }

  const fileID = uploadRes.fileID

  // 4. 写入缓存集合（不存在则忽略）
  try {
    await db.collection('qrcodes').add({
      data: {
        openid,
        scene: SCENE,
        fileID,
        created_at: db.serverDate()
      }
    })
  } catch (e) {
    // qrcodes 集合未创建时插入失败，不影响主流程返回 fileID
    console.warn('[getQRCode] 缓存写入失败，主流程不受影响', e)
  }

  return { fileID, cached: false }
}
