Page({
  data: {
    selectedCity: '',
    navType: 'search'
  },

  onLoad() {
    this.getUserCity();
  },

  onShow() {
    // 每次页面显示时重新获取用户城市
    this.getUserCity();
  },

  async getUserCity() {
    try {
      const phoneNumber = wx.getStorageSync('phoneNumber');
      if (!phoneNumber) {
        console.log('用户未登录');
        return;
      }

      const db = wx.cloud.database();
      const userResult = await db.collection('users').where({
        phoneNumber: phoneNumber
      }).get();

      if (userResult.data && userResult.data.length > 0) {
        const userData = userResult.data[0];
        this.setData({
          selectedCity: userData.selectedCity
        });
      }
    } catch (error) {
      console.error('获取用户城市失败:', error);
    }
  }
})