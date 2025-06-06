import request from '~/api/request';

Page({
  data: {
    phoneNumber: '',
    isPhoneNumber: false,
    isCheck: false,
    isSubmit: false,
    radioValue: '',
  },

  /* 自定义功能函数 */
  changeSubmit() {
    if (this.data.isPhoneNumber && this.data.isCheck) {
      this.setData({ isSubmit: true });
    } else {
      this.setData({ isSubmit: false });
    }
  },

  // 手机号变更
  onPhoneInput(e) {
    const isPhoneNumber = /^[1][3,4,5,7,8,9][0-9]{9}$/.test(e.detail.value);
    const phoneNumber = e.detail.value;
    console.log('用户输入手机号:', phoneNumber);
    this.setData({
      isPhoneNumber,
      phoneNumber,
    });
    this.changeSubmit();
  },

  // 用户协议选择变更
  onCheckChange(e) {
    const { value } = e.detail;
    this.setData({
      radioValue: value,
      isCheck: value === 'agree',
    });
    this.changeSubmit();
  },



  async login() {
    try {
      const res = await request('/login/getSendMessage', 'get');
      if (res.success) {
        wx.navigateTo({
          url: `/pages/loginCode/loginCode?phoneNumber=${this.data.phoneNumber}`,
        });
      }
    } catch (error) {
      wx.showToast({
        title: '登录失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    }
  },
});
