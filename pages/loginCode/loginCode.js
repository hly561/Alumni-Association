import request from '~/api/request';

Page({
  data: {
    phoneNumber: '',
    sendCodeCount: 60,
    verifyCode: '',
  },

  timer: null,

  onLoad(options) {
    const { phoneNumber } = options;
    if (phoneNumber) {
      this.setData({ phoneNumber });
    }
    this.countDown();
  },

  onVerifycodeChange(e) {
    const verifyCode = e.detail.value;
    console.log('用户输入验证码:', verifyCode);
    this.setData({
      verifyCode,
    });
  },

  countDown() {
    this.setData({ sendCodeCount: 60 });
    this.timer = setInterval(() => {
      if (this.data.sendCodeCount <= 0) {
        this.setData({ isSend: false, sendCodeCount: 0 });
        clearInterval(this.timer);
      } else {
        this.setData({ sendCodeCount: this.data.sendCodeCount - 1 });
      }
    }, 1000);
  },

  sendCode() {
    if (this.data.sendCodeCount === 0) {
      this.countDown();
    }
  },

  async login() {
    console.log('发送登录请求，验证码:', this.data.verifyCode);
    const res = await request('/login/postCodeVerify', 'get', { code: this.data.verifyCode });
    if (res.success) {
      // 将用户信息存储到云数据库
      try {
        const db = wx.cloud.database();
        
        // 先检查用户是否已存在
        const userCheck = await db.collection('users').where({
          phoneNumber: this.data.phoneNumber
        }).get();
        
        console.log('检查用户是否存在:', userCheck);
        
        if (userCheck.data && userCheck.data.length > 0) {
          console.log('用户已存在，跳过创建');
        } else {
          console.log('开始创建新用户:', {
            phoneNumber: this.data.phoneNumber,
            verifyCode: this.data.verifyCode
          });
          
          const addResult = await db.collection('users').add({
            data: {
              phoneNumber: this.data.phoneNumber,
              verifyCode: this.data.verifyCode,
              name: '校友',
              createTime: db.serverDate()
            }
          });
          
          console.log('创建用户结果:', addResult);
          
          if (!addResult._id) {
            throw new Error('创建用户失败');
          }
        }
      } catch (error) {
        console.error('保存用户信息失败:', error);
        wx.showToast({
          title: '用户信息保存失败',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      
      await wx.setStorageSync('access_token', res.data.token);
      await wx.setStorageSync('phoneNumber', this.data.phoneNumber);
      wx.switchTab({
        url: `/pages/my/index`,
      });
    }
  },
});
