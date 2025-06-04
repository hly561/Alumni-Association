Page({
  data: {
    interestCategories: [
      {
        category: '运动竞技',
        options: ['篮球', '足球', '羽毛球', '乒乓球', '网球', '排球', '登山', '徒步', '骑行', '健身', '瑜伽', '游泳', '跑步', '舞蹈']
      },
      {
        category: '文化艺术',
        options: ['非遗', '艺术展', '音乐会', '演唱会', '读书/文学', '电影', '戏剧', '摄影', '手工DIY']
      },
      {
        category: '职业创业',
        options: ['行业交流', '企业参访', '行业峰会', '职业培训']
      },
      {
        category: '休闲娱乐',
        options: ['电子游戏', '桌游', '旅行', '密室逃脱', '剧本杀', '线下观赛']
      },
      {
        category: '亲子',
        options: ['亲子活动', '教育沙龙', '家庭旅行']
      },
      {
        category: '社交',
        options: ['聚餐']
      },
      {
        category: '学习',
        options: ['大咖讲座', '学术交流', '语言角', '考试互助']
      }
    ],
    selectedInterests: []
  },

  onLoad: function() {
    this.loadUserInterests();
  },

  async loadUserInterests() {
    try {
      const db = wx.cloud.database();
      const phoneNumber = wx.getStorageSync('phoneNumber');
      
      if (!phoneNumber) {
        console.error('未找到手机号码');
        return;
      }

      const userResult = await db.collection('users').where({
        phoneNumber: phoneNumber
      }).get();
      
      if (userResult.data && userResult.data.length > 0) {
        const userInterests = userResult.data[0].interests || [];
        this.setData({ selectedInterests: userInterests });
      }
    } catch (error) {
      console.error('获取用户兴趣失败:', error);
      wx.showToast({
        title: '获取兴趣信息失败',
        icon: 'none'
      });
    }
  },

  toggleInterest(e) {
    const interest = e.currentTarget.dataset.interest;
    const selectedInterests = [...this.data.selectedInterests];
    const index = selectedInterests.indexOf(interest);

    if (index === -1) {
      selectedInterests.push(interest);
    } else {
      selectedInterests.splice(index, 1);
    }

    this.setData({ selectedInterests }, () => {
      this.saveUserInterests();
    });
  },

  async saveUserInterests() {
    try {
      const db = wx.cloud.database();
      const phoneNumber = wx.getStorageSync('phoneNumber');
      
      if (!phoneNumber) {
        console.error('未找到手机号码');
        return;
      }

      await db.collection('users').where({
        phoneNumber: phoneNumber
      }).update({
        data: {
          interests: this.data.selectedInterests
        }
      });

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存用户兴趣失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
});