import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoad: false,
    personalInfo: {},
    gridList: [
      {
        name: '我组织的活动',
        icon: 'root-list',
        type: 'organized',
        url: '',
      },
      {
        name: '我参加的活动',
        icon: 'user-list',
        type: 'participated',
        url: '',
      },
    ],

    settingList: [
      { name: '校友认证', icon: 'verified', type: 'verify' },
      { name: '我的兴趣', icon: 'heart', type: 'interests', url: '/pages/interests/index' },
      { name: '联系客服', icon: 'service', type: 'service' },
      { name: '退出登录', icon: 'poweroff', type: 'logout' },
    ],
  },

  onLoad() {
  },

  observers: {
    'personalInfo.verifyStatus': function(verifyStatus) {
      if (this.data.personalInfo.verifyStatus === 'pending' && verifyStatus === 'unverified') {
        console.log('用户已提交，待审核');
      }
    }
  },

  async onShow() {
    const Token = wx.getStorageSync('access_token');
    const personalInfo = await this.getPersonalInfo();

    if (Token) {
      this.setData({
        isLoad: true,
        personalInfo,
      });
    }
  },


  async getPersonalInfo() {
    try {
      const db = wx.cloud.database();
      const phoneNumber = wx.getStorageSync('phoneNumber');
      
      if (!phoneNumber) {
        console.error('未找到手机号码');
        return {};
      }

      const userResult = await db.collection('users').where({
        phoneNumber: phoneNumber
      }).get();
      
      if (!userResult.data || userResult.data.length === 0) {
        console.error('未找到用户信息');
        return {};
      }

      const userInfo = userResult.data[0];
      let authStatus = '未认证';
      if (userInfo.verifyStatus === 'pending') {
        authStatus = '审核中';
      } else if (userInfo.verifyStatus === 'approved') {
        authStatus = '已认证';
      }
      return {
        name: userInfo.name || '校友',
        image: userInfo.image,
        verifyStatus: userInfo.verifyStatus || 'unverified',
        authStatus: authStatus
      };
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return {};
    }
  },

  onLogin(e) {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },

  onNavigateTo() {
    wx.navigateTo({ url: `/pages/my/info-edit/index` });
  },

  onEleClick(e) {
    const { name, url, type } = e.currentTarget.dataset.data;
    console.log('Clicked item data:', e.currentTarget.dataset.data);
    console.log('Clicked item URL:', url);
    if (url) {
      if (!this.data.isLoad) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      wx.navigateTo({ url });
      return;
    }
    if (type === 'verify') {
      const { verifyStatus } = this.data.personalInfo;
      if (verifyStatus === 'pending') {
        wx.showToast({
          title: '审核中',
          icon: 'none'
        });
        return;
      }
      if (verifyStatus === 'approved') {
        wx.showToast({
          title: '已认证',
          icon: 'none'
        });
        return;
      }
      wx.navigateTo({ url: '/pages/my/verify/index' });
      return;
    }
    if (type === 'logout' && this.data.isLoad) {
      wx.removeStorageSync('access_token');
      this.setData({
        isLoad: false,
        personalInfo: {}
      });
      wx.navigateTo({
        url: '/pages/login/login'
      });
      return;
    }
    this.onShowToast('#t-toast', name);
  },
});
