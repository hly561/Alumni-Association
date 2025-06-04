const db = wx.cloud.database();

Page({
  data: {
    activity: null,
    loading: true
  },

  onLoad: function(options) {
    const { id } = options;
    if (id) {
      this.getActivityDetail(id);
    } else {
      wx.showToast({
        title: '活动信息不存在',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  getActivityDetail: function(activityId) {
    wx.showLoading({
      title: '加载中...'
    });
    
    // 从云数据库获取活动详情
    db.collection('activities').doc(activityId).get().then(res => {
      if (res.data) {
        const activity = res.data;
        // 处理地点显示
        let locationText = '';
        if (activity.activityType === 'online' || activity.meetingLink) {
          locationText = '线上';
        } else if (activity.location && typeof activity.location === 'object') {
          const { province = '', city = '', address = '' } = activity.location;
          locationText = [province, city, address].filter(Boolean).join(' ');
        } else if (typeof activity.location === 'string') {
          locationText = activity.location;
        } else {
          locationText = '未设置';
        }
        activity.locationText = locationText;

        // 检查当前用户是否已报名
        const phoneNumber = wx.getStorageSync('phoneNumber');
        if (phoneNumber && activity.participants && activity.participants.includes(phoneNumber)) {
          activity.isRegistered = true;
        } else {
          activity.isRegistered = false;
        }

        // 查询创建者信息
        const creatorPromise = activity.createdBy && activity.createdBy.phoneNumber ? 
          db.collection('users')
            .where({
              phoneNumber: activity.createdBy.phoneNumber
            })
            .get()
            .then(res => {
              console.log('创建者查询结果:', res.data);
              if (res.data && res.data.length > 0) {
                activity.creatorName = res.data[0].name;
                console.log('设置创建者昵称:', activity.creatorName);
              } else {
                console.log('未找到创建者信息，手机号:', activity.createdBy.phoneNumber);
              }
              return activity;
            }) : 
          Promise.resolve(activity);

        // 批量查询所有已报名用户信息（头像、昵称等）
        const participantsPromise = activity.participants && activity.participants.length > 0 ?
          db.collection('users')
            .where({
              phoneNumber: db.command.in(activity.participants)
            })
            .get()
            .then(res => {
              activity.registeredUsers = res.data.sort((a, b) => {
                const indexA = activity.participants.indexOf(a.phoneNumber);
                const indexB = activity.participants.indexOf(b.phoneNumber);
                return indexB - indexA;
              });
              return activity;
            }) :
          Promise.resolve(activity);

        // 等待所有查询完成后再更新页面
        Promise.all([creatorPromise, participantsPromise])
          .then(() => {
            // 确保群聊二维码URL存在
            if (!activity.qrCodeUrl) {
              activity.qrCodeUrl = 'cloud://your-env-id.xxxx/activities/qrcode/default.png';
            }
            this.setData({
              activity: activity,
              loading: false
            });
          });
        
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: activity.title || '活动详情'
        });
      } else {
        throw new Error('活动不存在');
      }
    })
    .catch(err => {
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '获取活动详情失败',
        icon: 'error'
      });
      console.error('获取活动详情失败：', err);
    })
    .finally(() => {
      wx.hideLoading();
    });
  },
  
  // 复制会议链接
  copyMeetingLink: function() {
    const { meetingLink } = this.data.activity;
    if (meetingLink) {
      wx.setClipboardData({
        data: meetingLink,
        success: function() {
          wx.showToast({
            title: '会议链接已复制',
            icon: 'success'
          });
        }
      });
    }
  },

  // 预览群聊二维码
  previewQrCode: function() {
    const { qrcodeUrl } = this.data.activity;
    if (qrcodeUrl) {
      // 检查是否是云文件ID或路径
      if (qrcodeUrl.startsWith('cloud://')) {
        wx.cloud.getTempFileURL({
          fileList: [qrcodeUrl],
          success: res => {
            // getTempFileURL成功，使用临时链接预览
            const tempFile = res.fileList[0];
            if (tempFile && tempFile.tempFileURL) {
              wx.previewImage({
                current: tempFile.tempFileURL, // 当前显示图片的http链接
                urls: [tempFile.tempFileURL] // 需要预览的图片http链接列表
              });
            } else {
              wx.showToast({
                title: '获取图片链接失败',
                icon: 'none'
              });
            }
          },
          fail: err => {
            // getTempFileURL失败
            wx.showToast({
              title: '获取图片链接失败',
              icon: 'none'
            });
            console.error('获取临时链接失败', err);
          }
        });
      } else {
        // 如果不是云文件，直接使用原链接预览
        wx.previewImage({
          current: qrcodeUrl, // 当前显示图片的http链接
          urls: [qrcodeUrl] // 需要预览的图片http链接列表
        });
      }
    } else {
      wx.showToast({
        title: '无二维码图片',
        icon: 'none'
      });
    }
  },

  async onRegister() {
    const phoneNumber = wx.getStorageSync('phoneNumber');
    if (!phoneNumber) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const db = wx.cloud.database();
    const activityId = this.data.activity._id;

    try {
      console.log('正在报名活动:', activityId, '用户手机号:', phoneNumber);
      // 更新活动记录，添加报名用户到participants字段
      const result = await db.collection('activities').doc(activityId).update({
        data: {
          participants: db.command.push(phoneNumber)
        }
      });
      console.log('报名结果:', result);

      // 更新按钮状态为"取消报名"
      const userRes = await db.collection('users').where({ phoneNumber }).get();
      if (userRes.data && userRes.data.length > 0) {
        this.setData({
          'activity.isRegistered': true,
          'activity.participants': [...this.data.activity.participants, phoneNumber],
          'activity.registeredUsers': [...this.data.activity.registeredUsers, userRes.data[0]]
        });
      } else {
        this.setData({
          'activity.isRegistered': true,
          'activity.participants': [...this.data.activity.participants, phoneNumber]
        });
      }

      wx.showToast({
        title: '报名成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('报名失败:', error);
      wx.showToast({
        title: '报名失败',
        icon: 'none'
      });
    }
  },

  // 取消报名
  async onCancelRegister() {
    const phoneNumber = wx.getStorageSync('phoneNumber');
    if (!phoneNumber) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const db = wx.cloud.database();
    const activityId = this.data.activity._id;

    try {
      console.log('正在取消报名活动:', activityId, '用户手机号:', phoneNumber);
      // 更新活动记录，从participants字段中移除用户
      const result = await db.collection('activities').doc(activityId).update({
        data: {
          participants: db.command.pull(phoneNumber)
        }
      });
      console.log('取消报名结果:', result);

      // 更新按钮状态为"立即报名"
      this.setData({
        'activity.isRegistered': false,
        'activity.participants': this.data.activity.participants.filter(p => p !== phoneNumber),
        'activity.registeredUsers': this.data.activity.registeredUsers.filter(u => u.phoneNumber !== phoneNumber)
      });

      wx.showToast({
        title: '取消报名成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('取消报名失败:', error);
      wx.showToast({
        title: '取消报名失败',
        icon: 'none'
      });
    }
  }
})