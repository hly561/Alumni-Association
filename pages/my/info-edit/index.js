import request from '~/api/request';
import { areaList } from './areaData.js';

Page({
  data: {
    personInfo: {
      name: '',
      image: '',
    },

    gridConfig: {
      column: 3,
      width: 160,
      height: 160,
    },
  },

  onLoad() {
    this.getPersonalInfo();
  },

  async getPersonalInfo() {
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
      
      if (!userResult.data || userResult.data.length === 0) {
        console.error('未找到用户信息');
        return;
      }

      const userInfo = userResult.data[0];
      this.setData({
        personInfo: {
          name: userInfo.name || '校友',
          image: userInfo.image
        }
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      wx.showToast({
        title: '获取信息失败',
        icon: 'error',
        duration: 2000
      });
    }
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      'personInfo.image': avatarUrl,
    });
  },

  onNameChange(e) {
    const { value } = e.detail;
    this.setData({
      'personInfo.name': value,
    });
  },

  async onSaveInfo() {
    try {
      const db = wx.cloud.database();
      const phoneNumber = wx.getStorageSync('phoneNumber');
      
      if (!phoneNumber) {
        console.error('未找到手机号码');
        throw new Error('未找到手机号码');
      }

      console.log('开始更新用户信息:', {
        phoneNumber,
        name: this.data.personInfo.name,
        image: this.data.personInfo.image
      });
      
      // 先查询用户是否存在
      const userResult = await db.collection('users').where({
        phoneNumber: phoneNumber
      }).get();
      
      console.log('查询用户结果:', userResult);
      
      if (!userResult.data || userResult.data.length === 0) {
        console.error('未找到对应用户记录');
        throw new Error('未找到对应用户记录');
      }

      // 使用手机号查询并更新用户信息
      const updateResult = await db.collection('users').where({
        phoneNumber: phoneNumber
      }).update({
        data: {
          name: this.data.personInfo.name,
          image: this.data.personInfo.image,
          updateTime: db.serverDate()
        }
      });

      console.log('更新结果:', updateResult);
      
      // 验证更新是否成功
      if (!updateResult.stats || updateResult.stats.updated === 0) {
        console.error('更新操作未生效');
        throw new Error('更新操作未生效');
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });

      // 返回上一页并刷新
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);

    } catch (error) {
      console.error('更新用户信息失败:', error);
      wx.showToast({
        title: error.message || '保存失败，请重试',
        icon: 'error',
        duration: 2000
      });
    }
  },
});
