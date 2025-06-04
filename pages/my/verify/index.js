import request from '~/api/request';

Page({
  data: {
    formData: {
      realname: '',
      school: '',
      major: '',
      graduationYear: '',
      verifyImage: ''
    },
    rules: {
      realname: [{ required: true, message: '请输入姓名' }],
      school: [{ required: true, message: '请输入毕业学校' }],
      major: [{ required: true, message: '请输入专业' }],
      graduationYear: [{ required: true, message: '请选择毕业年份' }],
      verifyImage: [{ required: true, message: '请上传认证材料' }]
    },
    years: [],
    currentYear: new Date().getFullYear(),
    selectedYearIndex: null
  },

  onLoad() {
    this.initYearList();
  },

  initYearList() {
    const currentYear = this.data.currentYear;
    const years = [];
    for (let i = currentYear; i >= currentYear - 60; i--) {
      years.push(i);
    }
    this.setData({ years });
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    if (field === 'graduationYear') {
      // 对于毕业年份，使用years数组中的实际年份值
      const selectedYear = this.data.years[value];
      this.setData({
        [`formData.${field}`]: selectedYear,
        selectedYearIndex: value // 保存选中的索引
      });
    } else {
      this.setData({
        [`formData.${field}`]: value
      });
    }
  },

  async onChooseImage() {
    try {
      const res = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });

      const tempFilePath = res.tempFilePaths[0];
      
      // 检查图片大小
      const imageInfo = await wx.getFileInfo({
        filePath: tempFilePath
      });
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageInfo.size > maxSize) {
        wx.showToast({
          title: '图片大小不能超过10MB',
          icon: 'none'
        });
        return;
      }

      this.setData({
        'formData.verifyImage': tempFilePath
      });
    } catch (error) {
      console.error('选择图片失败:', error);
      wx.showToast({
        title: '选择图片失败',
        icon: 'none'
      });
    }
  },

  async uploadImage(tempFilePath) {
    try {
      const cloudPath = `verify/${Date.now()}-${Math.random().toString(36).substr(2)}.jpg`;
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath
      });
      return uploadResult.fileID;
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  },

  async onSubmit() {
    try {
      const { formData } = this.data;
      
      // 检查网络状态
      const networkType = await wx.getNetworkType();
      if (networkType.networkType === 'none') {
        wx.showToast({
          title: '网络连接不可用',
          icon: 'none'
        });
        return;
      }

      // 检查手机号是否存在
      const phoneNumber = wx.getStorageSync('phoneNumber');
      if (!phoneNumber) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }, 1500);
        return;
      }
      
      // 表单验证
      for (const key in this.data.rules) {
        const rules = this.data.rules[key];
        const value = formData[key];
        
        for (const rule of rules) {
          if (rule.required && !value) {
            wx.showToast({
              title: rule.message,
              icon: 'none'
            });
            return;
          }
        }
      }

      wx.showLoading({ title: '提交中...' });

      try {
        // 上传认证材料图片
        const fileID = await this.uploadImage(formData.verifyImage);
        if (!fileID) {
          throw new Error('图片上传失败');
        }

        // 保存认证信息到数据库
        const db = wx.cloud.database();
        
        // 更新users集合中的用户认证信息
        const updateResult = await db.collection('users').where({
          phoneNumber: phoneNumber
        }).update({
          data: {
            realname: formData.realname,
            school: formData.school,
            major: formData.major,
            graduationYear: formData.graduationYear,
            verifyImage: fileID,
            verifyStatus: 'pending', // pending, approved, rejected
            updateTime: db.serverDate()
          }
        });

        if (!updateResult.stats.updated) {
          throw new Error('更新数据失败');
        }

        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);

      } catch (uploadError) {
        throw new Error(uploadError.message || '提交失败');
      }

    } catch (error) {
      console.error('提交认证信息失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: error.message || '提交失败，请重试',
        icon: 'none'
      });
    }
  }
});