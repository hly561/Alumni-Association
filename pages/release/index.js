// pages/release/index.js

// 引入腾讯地图SDK
// const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');

// 实例化API核心类
// let qqmapsdk;

// 引入地图选点插件
const chooseLocation = requirePlugin('chooseLocation');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 表单数据
    title: '',                         // 活动标题
    
    // 活动类型分类
    // activityCategory: '',               // 活动类型分类的值

    // 活动类型选项（用于单选）
    // activityTypeOptions: [
    //   { text: '运动', value: 'sport' },
    //   { text: '艺术', value: 'art' },
    //   { text: '学习', value: 'study' },
    //   { text: '职业', value: 'career' },
    //   { text: '亲子', value: 'parent-child' },
    //   { text: '娱乐', value: 'entertainment' },
    // ],
    
    // 活动开始时间
    activityStartTime: '',             // 活动开始时间（显示用）
    activityStartTimeValue: '',        // 活动开始时间（字符串）
    activityStartTimeVisible: false,   // 活动开始时间选择器显示状态
    
    // 活动结束时间
    activityEndTime: '',               // 活动结束时间（显示用）
    activityEndTimeValue: '',          // 活动结束时间（字符串）
    activityEndTimeVisible: false,     // 活动结束时间选择器显示状态
    
    // 报名截止时间
    registrationDeadline: '',          // 报名截止时间（显示用）
    registrationDeadlineValue: '',     // 报名截止时间（字符串）
    registrationDeadlineVisible: false, // 报名截止时间选择器显示状态
    
    // 活动形式
    activityType: 'offline',           // 活动形式：线下(offline)或线上(online)
    
    // 线下活动信息
    province: '',                      // 活动省份
    city: '',                          // 活动城市
    cityPickerVisible: false,          // 城市选择器显示状态
    tempProvince: '',                  // 临时存储选择的省份
    tempCity: '',                      // 临时存储选择的城市
    currentCities: [],                 // 当前选中省份的城市列表
    address: '',                       // 活动地址
    // latitude: null,
    // longitude: null,
    
    // 线上活动信息
    meetingLink: '',                   // 会议链接
    
    // 报名人数上限
    hasParticipantLimit: true,         // 是否启用报名人数上限
    maxParticipants: 30,               // 报名人数上限
    
    // 群聊二维码
    qrcodeFiles: [],                   // 群聊二维码文件
    
    // 活动介绍
    description: '',                   // 活动介绍内容
    
    // 报名限制
    registrationRestriction: 'all',     // 报名限制：所有人可参加(all)或限本校参加(school)

    // 地图选点相关
    // showMapPicker: false, // 控制地图选点弹窗的显示/隐藏
    // selectedAddress: '', // 地图选中的地址

    customCategoryOptions: [
      { text: '运动', value: 'sport' },
      { text: '艺术', value: 'art' },
      { text: '娱乐', value: 'entertainment' },
      { text: '亲子', value: 'parent-child' },
      { text: '职业', value: 'career' },
      { text: '学习', value: 'study' },
      { text: '社交', value: 'social' },
    ],
    selectedCategory: '',

    // 子活动类型数据
    subCategoryData: {
      sport: [
        { text: '篮球', value: 'basketball' },
        { text: '足球', value: 'football' },
        { text: '羽毛球', value: 'badminton' },
        { text: '乒乓球', value: 'pingpong' },
        { text: '网球', value: 'tennis' },
        { text: '排球', value: 'volleyball' },
        { text: '匹克球', value: 'pickleball' },
        { text: '壁球', value: 'squash' },
        { text: '登山', value: 'mountaineering' },
        { text: '徒步', value: 'hiking' },
        { text: '骑行', value: 'cycling' },
        { text: '攀岩', value: 'climbing' },
        { text: '探险', value: 'exploration' },
        { text: '定向越野', value: 'orienteering' },
        { text: '健身', value: 'fitness' },
        { text: '瑜伽', value: 'yoga' },
        { text: '普拉提', value: 'pilates' },
        { text: '搏击', value: 'combat' },
        { text: '操课', value: 'group-fitness' },
        { text: '舞蹈', value: 'dance' },
        { text: '飞盘', value: 'frisbee' },
        { text: '橄榄球', value: 'rugby' },
        { text: '跑步', value: 'running' },
        { text: '马拉松', value: 'marathon' },
        { text: '太极', value: 'tai-chi' },
        { text: '台球', value: 'billiards' },
        { text: '保龄球', value: 'bowling' },
        { text: '射箭', value: 'archery' },
        { text: '高尔夫', value: 'golf' },
        { text: '卡丁车', value: 'karting' },
        { text: '皮划艇', value: 'kayaking' },
        { text: '潜水', value: 'diving' },
        { text: '冲浪', value: 'surfing' },
        { text: '帆船', value: 'sailing' },
        { text: '钓鱼', value: 'fishing' },
        { text: '游泳', value: 'swimming' },
        { text: '滑雪', value: 'skiing' },
        { text: '冰球', value: 'ice-hockey' },
        { text: '滑冰', value: 'skating' },
        { text: '冰壶', value: 'curling' },
      ],
      art: [
        { text: '非遗', value: 'intangible-heritage' },
        { text: '展览', value: 'exhibition' },
        { text: '音乐会', value: 'concert' },
        { text: '演唱会', value: 'singing-concert' },
        { text: '文学', value: 'literature' },
        { text: '电影', value: 'film' },
        { text: '戏剧', value: 'drama' },
        { text: '摄影', value: 'photography' },
        { text: '手工', value: 'handicraft' },
      ],
      career: [
        { text: '行业交流', value: 'industry-exchange' },
        { text: '企业参访', value: 'company-visit' },
        { text: '行业峰会', value: 'industry-summit' },
        { text: '职业培训', value: 'vocational-training' },
      ],
      entertainment: [
        { text: '游戏', value: 'game' },
        { text: '桌游', value: 'board-game' },
        { text: '旅行', value: 'travel' },
        { text: '密室逃脱', value: 'escape-room' },
        { text: '剧本杀', value: 'script-killing' },
        { text: '观赛', value: 'watching-game' },
      ],
      'parent-child': [
        { text: '亲子活动', value: 'parent-child-activity' },
        { text: '教育沙龙', value: 'education-salon' },
        { text: '家庭旅行', value: 'family-travel' },
      ],
      social: [
        { text: '聚餐', value: 'dinner' },
      ],
      study: [
        { text: '讲座', value: 'lecture' },
        { text: '学术交流', value: 'academic-exchange' },
        { text: '语言角', value: 'language-corner' },
        { text: '考试互助', value: 'exam-assistance' },
      ],
    },
    subCategoryOptions: [],
    selectedSubCategories: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初始化日期时间显示
    // const now = new Date();
    // const formattedDate = this.formatDateTime(now);
    
    // 加载省份城市数据
    const { provinceList } = require('../city-selector/province-city-data.js');
    
    this.setData({
      // activityStartTime: formattedDate,
      // activityStartTimeValue: formattedDate,
      // activityEndTime: formattedDate,
      // activityEndTimeValue: formattedDate,
      // registrationDeadline: formattedDate,
      // registrationDeadlineValue: formattedDate,
      provinceList: provinceList
    });

    // 实例化腾讯地图API
    // qqmapsdk = new QQMapWX({
    //     key: '4YNBZ-WOCKG-R2FQP-QTOB3-EFLSS-3LB5F' // 腾讯地图Key
    // });

    // 获取当前位置作为地图中心点
    // this.getCurrentLocation();
  },

  /**
   * 格式化日期时间
   */
  formatDateTime(date) {
    if (!date) return '';
    if (typeof date === 'string' || typeof date === 'number') {
      date = new Date(date);
    }
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  },

  /**
   * 表单字段变更处理函数
   */
  onTitleChange(e) {
    this.setData({ title: e.detail.value });
  },

  onAddressChange(e) {
    this.setData({ address: e.detail.value });
  },

  onMeetingLinkChange(e) {
    this.setData({ meetingLink: e.detail.value });
  },

  onActivityTypeChange(e) {
    this.setData({ activityType: e.detail.value });
  },

  onMaxParticipantsChange(e) {
    this.setData({ maxParticipants: e.detail.value });
  },

  onHasParticipantLimitChange(e) {
    this.setData({ hasParticipantLimit: e.detail.value });
  },

  onDescriptionChange(e) {
    this.setData({ description: e.detail.value });
  },

  onRegistrationRestrictionChange(e) {
    this.setData({ registrationRestriction: e.detail.value });
  },

  /**
   * 活动开始时间选择器相关函数
   */
  showActivityStartTimePicker() {
    const now = new Date();
    const formattedDate = this.formatDateTime(now);
    this.setData({
      activityStartTimeVisible: true,
      activityStartTimeValue: this.data.activityStartTimeValue || formattedDate
    });
  },

  onActivityStartTimeConfirm(e) {
    const value = e.detail.value || e.detail;
    const formattedDate = this.formatDateTime(value);
    this.setData({
      activityStartTimeValue: formattedDate,
      activityStartTime: formattedDate,
      activityStartTimeVisible: false
    });
  },

  onActivityStartTimeCancel() {
    this.setData({ activityStartTimeVisible: false });
  },

  /**
   * 活动结束时间选择器相关函数
   */
  showActivityEndTimePicker() {
    const now = new Date();
    const formattedDate = this.formatDateTime(now);
    this.setData({
      activityEndTimeVisible: true,
      activityEndTimeValue: this.data.activityEndTimeValue || formattedDate
    });
  },

  onActivityEndTimeConfirm(e) {
    const value = e.detail.value || e.detail;
    const formattedDate = this.formatDateTime(value);
    this.setData({
      activityEndTimeValue: formattedDate,
      activityEndTime: formattedDate,
      activityEndTimeVisible: false
    });
  },

  onActivityEndTimeCancel() {
    this.setData({ activityEndTimeVisible: false });
  },

  /**
   * 报名截止时间选择器相关函数
   */
  showRegistrationDeadlinePicker() {
    const now = new Date();
    const formattedDate = this.formatDateTime(now);
    this.setData({
      registrationDeadlineVisible: true,
      registrationDeadlineValue: this.data.registrationDeadlineValue || formattedDate
    });
  },

  onRegistrationDeadlineConfirm(e) {
    const value = e.detail.value || e.detail;
    const formattedDate = this.formatDateTime(value);
    this.setData({
      registrationDeadlineValue: formattedDate,
      registrationDeadline: formattedDate,
      registrationDeadlineVisible: false
    });
  },

  onRegistrationDeadlineCancel() {
    this.setData({ registrationDeadlineVisible: false });
  },

  /**
   * 城市选择器相关函数
   */
  showCityPicker() {
    this.setData({
      cityPickerVisible: true,
      tempProvince: this.data.province,
      tempCity: this.data.city
    });
  },

  onCityPickerClose() {
    this.setData({ cityPickerVisible: false });
  },

  onCityPickerCancel() {
    this.setData({ cityPickerVisible: false });
  },

  onProvinceSelect(e) {
    const { province } = e.currentTarget.dataset;
    // 获取当前选中省份的城市列表
    const selectedProvince = this.data.provinceList.find(p => p.name === province);
    const cities = selectedProvince ? selectedProvince.cities : [];
    
    this.setData({ 
      tempProvince: province,
      tempCity: '', // 切换省份时清空已选城市
      currentCities: cities // 更新当前城市列表
    });
  },

  onCitySelect(e) {
    const { city } = e.currentTarget.dataset;
    this.setData({ tempCity: city });
  },

  onCityPickerConfirm() {
    if (!this.data.tempProvince || !this.data.tempCity) {
      wx.showToast({
        title: '请选择省份和城市',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      province: this.data.tempProvince,
      city: this.data.tempCity,
      cityPickerVisible: false
    });
  },

  /**
   * 群聊二维码相关函数
   */
  onQrcodeUploadSuccess(e) {
    const { files } = e.detail;
    this.setData({
      qrcodeFiles: files
    });
  },

  onQrcodeRemove(e) {
    const { index } = e.detail;
    const { qrcodeFiles } = this.data;
    qrcodeFiles.splice(index, 1);
    this.setData({
      qrcodeFiles
    });
  },

  onQrcodeClick(e) {
    const { index } = e.detail;
    const { qrcodeFiles } = this.data;
    const current = qrcodeFiles[index].url;
    
    wx.previewImage({
      current,
      urls: qrcodeFiles.map(file => file.url)
    });
  },

  /**
   * 表单提交
   */
  submitForm() {
    const { 
      title, activityStartTimeValue, activityEndTimeValue, registrationDeadlineValue, 
      activityType, city, address, meetingLink, hasParticipantLimit,
      maxParticipants, description, qrcodeFiles, registrationRestriction,
      activityStartTime, activityEndTime, registrationDeadline
    } = this.data;

    // 表单验证
    if (!title) {
      this.showToast('请输入活动标题');
      return;
    }

    // 如果启用了人数限制，验证人数上限
    if (hasParticipantLimit && !maxParticipants) {
      this.showToast('请设置报名人数上限');
      return;
    }
    if (!activityStartTimeValue) {
      this.showToast('请选择活动开始时间');
      return;
    }
    if (!activityEndTimeValue) {
      this.showToast('请选择活动结束时间');
      return;
    }
    if (!registrationDeadlineValue) {
      this.showToast('请选择报名截止时间');
      return;
    }
    
    // 时间逻辑验证
    if (activityStartTimeValue > activityEndTimeValue) {
      this.showToast('活动开始时间不能晚于结束时间');
      return;
    }
    if (registrationDeadlineValue > activityStartTimeValue) {
      this.showToast('报名截止时间不能晚于活动开始时间');
      return;
    }
    
    // 活动形式相关验证
    if (activityType === 'offline') {
      if (!province || !city) {
        this.showToast('请选择活动省份和城市');
        return;
      }
      if (!address) {
        this.showToast('请输入详细地址');
        return;
      }
    } else if (activityType === 'online') {
      if (!meetingLink) {
        this.showToast('请输入会议链接');
        return;
      }
    }
    
    if (!description) {
      this.showToast('请输入活动介绍');
      return;
    }
    
    // 检查用户是否已登录
    const phoneNumber = wx.getStorageSync('phoneNumber');
    if (!phoneNumber) {
      this.showToast('请先登录');
      return;
    }
    
    // 获取用户信息
    const userInfo = getApp().globalData.userInfo || {};

    // 显示加载提示
    wx.showLoading({
      title: '正在发布...',
      mask: true
    });

    // 处理群聊二维码上传
    let qrcodeUrl = '';
    const uploadQrcode = async () => {
      if (qrcodeFiles && qrcodeFiles.length > 0) {
        try {
          // 上传二维码到云存储
          const uploadResult = await wx.cloud.uploadFile({
            cloudPath: `qrcodes/${new Date().getTime()}_${Math.random().toString(36).substring(2)}.${qrcodeFiles[0].url.split('.').pop()}`,
            filePath: qrcodeFiles[0].url,
          });
          return uploadResult.fileID;
        } catch (error) {
          console.error('二维码上传失败', error);
          throw error;
        }
      }
      return '';
    };

    // 构建活动数据
    const buildActivityData = (qrcodeUrl) => {
      return {
        title,
        activityStartTime,
        activityEndTime,
        registrationDeadline,
        activityStartTimeValue,
        activityEndTimeValue,
        registrationDeadlineValue,
        activityType,
        location: activityType === 'offline' ? { province, city, address } : { meetingLink },
        participantLimit: hasParticipantLimit ? maxParticipants : null,
        description,
        qrcodeUrl,
        registrationRestriction,
        createdBy: {
          openid: userInfo.openid || '',
          phoneNumber: phoneNumber,
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || ''
        },
        participants: [],
        createdAt: new Date(),
        status: 'active',
        category: this.data.selectedCategory,
        subCategory: this.data.selectedSubCategories
      };
    };

    // 执行数据库操作
    uploadQrcode()
      .then(qrcodeFileID => {
        // 获取数据库引用
        const db = wx.cloud.database();
        // 将活动数据添加到activities集合
        return db.collection('activities').add({
          data: buildActivityData(qrcodeFileID)
        });
      })
      .then(() => {
        wx.hideLoading();
        this.showToast('活动发布成功', 'success');
        // 延迟返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      })
      .catch(error => {
        wx.hideLoading();
        console.error('活动发布失败', error);
        this.showToast('发布失败，请重试');
      });
  },

  /**
   * 显示提示信息
   */
  showToast(message, type = 'error') {
    const Toast = this.selectComponent('#t-toast');
    if (Toast) {
      Toast.show({
        message,
        theme: type,
        direction: 'column',
      });
    }
  },

  onChooseAddress() {
    // 隐藏其他内容，显示地图选点弹窗
    // this.setData({
    //     showMapPicker: true
    // });

    // 调用地图选点插件
    const key = '4YNBZ-WOCKG-R2FQP-QTOB3-EFLSS-3LB5F'; // 使用在腾讯位置服务申请的key
    const referer = '活动发布'; // 调用插件的app的名称
    const location = JSON.stringify({
      latitude: 39.89631551,
      longitude: 116.323459711
    });
    const category = '生活服务,娱乐休闲';

    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
    });
  },

  onChooseCity() {
    wx.navigateTo({
      url: '/pages/city-selector/index?from=release'
    });
  },

  onShow() {
    // 监听城市选择页面返回的省市
    const selectedProvince = wx.getStorageSync('selectedProvince');
    const selectedCity = wx.getStorageSync('selectedCity');
    if (selectedProvince && selectedCity) {
      this.setData({
        province: selectedProvince,
        city: selectedCity
      });
    }

    // 从地图选点插件返回后，在页面的onShow生命周期函数中能够调用插件接口，取得选点结果对象
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if (location) {
      this.setData({
        address: location.address
      });
    }
  },

  onUnload() {
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },

  // 地图区域视野变化事件
  // onMapRegionChange(e) {
  //   // 视野变化结束后触发
  //   if (e.type === 'end') {
  //     // 获取地图中心点
  //     this.mapCtx = wx.createMapContext('myMap');
  //     this.mapCtx.getCenterLocation({
  //       success: (res) => {
  //         this.setData({
  //           latitude: res.latitude,
  //           longitude: res.longitude
  //         });
  //         // 根据新的中心点进行逆地理编码
  //         this.reverseGeocode(res.latitude, res.longitude);
  //       },
  //       fail: (err) => {
  //         console.error('获取地图中心点失败', err);
  //       }
  //     });
  //   }
  // },

  // 逆地理编码获取地址信息
  // reverseGeocode(latitude, longitude) {
  //   qqmapsdk.reverseGeocoder({
  //     location: {
  //       latitude: latitude,
  //       longitude: longitude
  //     },
  //     success: (res) => {
  //       this.setData({
  //         selectedAddress: res.result.address
  //       });
  //     },
  //     fail: (err) => {
  //       console.error('逆地理编码失败', err);
  //       this.setData({ selectedAddress: '无法获取地址' });
  //     }
  //   });
  // },

  // 确认选择的位置
  // onConfirmLocation() {
  //   if (this.data.selectedAddress && this.data.longitude !== null && this.data.latitude !== null) {
  //     this.setData({
  //       address: this.data.selectedAddress,
  //       longitude: this.data.longitude,
  //       latitude: this.data.latitude,
  //       showMapPicker: false // 隐藏地图选点弹窗
  //     });
  //   } else {
  //     this.showToast('请选择有效的地址');
  //   }
  // },

  // 获取当前位置作为地图中心点
  // getCurrentLocation() {
  //   // 调用 wx.getLocation 获取当前位置
  //   wx.getLocation({
  //     type: 'gcj02', // 使用 gcj02 坐标系
  //     success: (res) => {
  //       this.setData({
  //         latitude: res.latitude,
  //         longitude: res.longitude
  //       });
  //       // 获取到位置后进行逆地理编码
  //       this.reverseGeocode(res.latitude, res.longitude);
  //     },
  //     fail: (err) => {
  //       console.error('获取当前位置失败', err);
  //       this.showToast('获取当前位置失败，请手动选择或检查权限');
  //       // 如果获取位置失败，可以设置一个默认的中心点，例如城市中心
  //       // this.setData({ latitude: 39.909729, longitude: 116.398419 }); 
  //     }
  //   });
  // }

  // 新增的活动类型选择器相关函数
  // showActivityTypeSelector() {
  //   this.setData({ activityTypeSelectorVisible: true });
  // },

  // hideActivityTypeSelector() {
  //   this.setData({ activityTypeSelectorVisible: false });
  // },

  // onActivityTypeSelect(e) {
  //   const { value, text } = e.detail;
  //   this.setData({
  //     activityType: value, // 更新 activityType 字段
  //     activityTypeName: text, // 更新显示名称
  //     activityTypeSelectorVisible: false // 隐藏选择器
  //   });
  // },

  onSelectCategory(e) {
    const selectedValue = e.currentTarget.dataset.value;
    const subOptions = this.data.subCategoryData[selectedValue] || [];

    this.setData({
      selectedCategory: selectedValue,
      subCategoryOptions: subOptions,
      selectedSubCategories: [],
    });
  },

  onSelectSubCategory(e) {
    const selectedValue = e.currentTarget.dataset.value;
    this.setData({
      selectedSubCategories: this.data.selectedSubCategories === selectedValue ? '' : selectedValue
    });
  },
});
