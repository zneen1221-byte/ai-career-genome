// pages/test/test.js - 答题页：加载15题 + 选项交互 + 提交
const request = require('../../utils/request')

Page({
  data: {
    questions: [],
    currentIndex: 0,
    total: 15,
    answers: {},      // { question_id: option }
    selected: '',    // 当前题选中项
    loading: true,
    submitting: false
  },

  onLoad() {
    this.loadQuestions()
  },

  async loadQuestions() {
    try {
      const data = await request.call('getQuestions')
      this.setData({ questions: data, total: data.length, loading: false })
    } catch (e) {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      console.error('[loadQuestions]', e)
    }
  },

  // 选项点击：记录 → 自动进下一题（末题除外）
  onSelectOption(e) {
    const opt = e.currentTarget.dataset.option
    const idx = this.data.currentIndex
    const q = this.data.questions[idx]
    const answers = { ...this.data.answers, [q.id]: opt }
    this.setData({ selected: opt, answers })
    if (idx < this.data.total - 1) {
      setTimeout(() => {
        this.setData({ currentIndex: idx + 1, selected: '' })
      }, 250)
    }
  },

  // 上一题
  onPrev() {
    if (this.data.currentIndex > 0) {
      const prev = this.data.currentIndex - 1
      const q = this.data.questions[prev]
      this.setData({ currentIndex: prev, selected: this.data.answers[q.id] || '' })
    }
  },

  // 提交答案 → 评分 → 存结果 → 跳分析页
  async onSubmit() {
    if (this.data.submitting) return
    const arr = Object.entries(this.data.answers).map(([qid, opt]) => ({
      question_id: Number(qid), option: opt
    }))
    if (arr.length < this.data.total) {
      wx.showToast({ title: '请答完所有题', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    try {
      const result = await request.call('submitTest', { answers: arr })
      result.answers = arr   // Phase 3：给 AI 报告生成用
      wx.setStorageSync('testResult', result)
      wx.redirectTo({ url: '/pages/analyzing/analyzing' })
    } catch (e) {
      this.setData({ submitting: false })
      wx.showToast({ title: '提交失败，请重试', icon: 'none' })
      console.error('[onSubmit]', e)
    }
  }
})
