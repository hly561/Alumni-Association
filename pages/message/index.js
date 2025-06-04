Page({
  data: {
    isRefreshing: false,
    messageList: [],
    systemMessageTemplate: {
      id: 'system',
      name: '系统通知',
      avatar: '/assets/images/system-avatar.svg',
      type: 'system'
    }
  },

  onLoad() {
    this.loadMessageList()
  },

  onShow() {
    this.loadMessageList()
  },

  loadMessageList() {
    // TODO: 从服务器获取消息列表
    const mockData = [
      {
        ...this.data.systemMessageTemplate,
        time: '2024-01-01 10:00',
        lastMessage: '您的校友认证信息已提交，正在审核中，请耐心等待。'
      }
    ]
    this.setData({
      messageList: mockData
    })
  },

  // 添加系统消息
  addSystemMessage(message) {
    const systemMessage = {
      ...this.data.systemMessageTemplate,
      time: new Date().toLocaleString(),
      lastMessage: message
    }
    const messageList = [systemMessage, ...this.data.messageList]
    this.setData({ messageList })
  },

  onRefresh() {
    this.setData({ isRefreshing: true })
    setTimeout(() => {
      this.loadMessageList()
      this.setData({ isRefreshing: false })
    }, 1000)
  },

  onMessageTap(e) {
    const messageId = e.currentTarget.dataset.id
    // 暂时移除跳转逻辑，保留事件处理函数以便后续添加其他功能
    console.log('消息点击：', messageId)
  }
})