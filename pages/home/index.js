import Message from 'tdesign-miniprogram/message/index';
import request from '~/api/request';

// 获取应用实例
// const app = getApp()

// 初始化云数据库查询指令
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    enable: false,
    swiperList: [],
    cardInfo: [],
    activities: [], // 存储从云数据库获取的活动数据
    selectedCity: '选择城市', // 默认城市
    currentTab: 'recommend', // 当前选中的标签页
    currentCategory: '', // 当前选中的分类
    currentSubcategory: '', // 当前选中的子分类
    subcategories: [
      '运动竞技', '文化艺术', '职业创业', '休闲娱乐', '亲子', '社交', '学习'
    ],
    // 级联选择器相关
    cascaderVisible: false,
    cascaderLeftSelected: '运动竞技', // 当前选中的左侧分类
    cascaderRightOptions: [], // 右侧选项列表
    cascaderOptions: [
      {
        label: '运动竞技',
        value: '运动竞技',
        children: [
          { label: '足球', value: '足球' },
          { label: '篮球', value: '篮球' },
          { label: '羽毛球', value: '羽毛球' },
          { label: '乒乓球', value: '乒乓球' },
          { label: '游泳', value: '游泳' }
        ]
      },
      {
        label: '文化艺术',
        value: '文化艺术',
        children: [
          { label: '音乐', value: '音乐' },
          { label: '舞蹈', value: '舞蹈' },
          { label: '绘画', value: '绘画' },
          { label: '书法', value: '书法' },
          { label: '摄影', value: '摄影' }
        ]
      },
      {
        label: '职业创业',
        value: '职业创业',
        children: [
          { label: '行业交流', value: '行业交流' },
          { label: '职业分享', value: '职业分享' },
          { label: '创业沙龙', value: '创业沙龙' },
          { label: '招聘会', value: '招聘会' }
        ]
      },
      {
        label: '休闲娱乐',
        value: '休闲娱乐',
        children: [
          { label: '桌游', value: '桌游' },
          { label: '电影', value: '电影' },
          { label: '旅游', value: '旅游' },
          { label: 'K歌', value: 'K歌' }
        ]
      },
      {
        label: '亲子',
        value: '亲子',
        children: [
          { label: '亲子教育', value: '亲子教育' },
          { label: '亲子活动', value: '亲子活动' },
          { label: '亲子游戏', value: '亲子游戏' }
        ]
      },
      {
        label: '社交',
        value: '社交',
        children: [
          { label: '聚会', value: '聚会' },
          { label: '交友', value: '交友' },
          { label: '相亲', value: '相亲' }
        ]
      },
      {
        label: '学习',
        value: '学习',
        children: [
          { label: '读书会', value: '读书会' },
          { label: '讲座', value: '讲座' },
          { label: '培训', value: '培训' },
          { label: '研讨会', value: '研讨会' }
        ]
      }
    ],
    cascaderValue: [],
    searchValue: '',
    allActivities: [],

    // 发布
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
  },
  // 生命周期
  // 获取用户城市信息
  async getUserCity() {
    const db = wx.cloud.database();
    const phoneNumber = wx.getStorageSync('phoneNumber');
    let selectedCity = '选择城市';
    
    if (phoneNumber) {
      const userRes = await db.collection('users').where({
        phoneNumber: phoneNumber
      }).get();
      
      if (userRes.data && userRes.data.length > 0) {
        selectedCity = userRes.data[0].selectedCity || '选择城市';
      }
    }
    
    return selectedCity;
  },

  async onReady() {
    const timeout = 15000; // 设置15秒超时
    try {
      const loadDataPromise = Promise.all([
        Promise.race([
          request('/home/cards').then((res) => res.data),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('加载卡片数据超时')), timeout)
          )
        ]),
        // 添加云数据库查询活动数据
        Promise.race([
          this.getActivities(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('加载活动数据超时')), timeout)
          )
        ])
      ]);

      const [cardRes, activitiesData] = await loadDataPromise;
      const selectedCity = await Promise.race([
        this.getUserCity(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('获取城市信息超时')), timeout)
        )
      ]);

      this.setData({
        cardInfo: cardRes.data,
        focusCardInfo: cardRes.data.slice(0, 3),
        selectedCity,
        activities: activitiesData // 设置活动数据到页面
      });
      
      console.log('活动数据已加载:', activitiesData);
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: error.message || '加载数据失败',
        icon: 'none',
        duration: 2000
      });
    }
  },
  async onLoad(option) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }

    const selectedCity = await this.getUserCity();
    
    // 初始化级联选择器右侧选项
    const leftSelected = '运动竞技';
    const leftOption = this.data.cascaderOptions.find(item => item.value === leftSelected);
    const rightOptions = leftOption ? leftOption.children : [];
    
    this.setData({
      selectedCity,
      cascaderLeftSelected: leftSelected,
      cascaderRightOptions: rightOptions
    });

    if (option.oper) {
      let content = '';
      if (option.oper === 'release') {
        content = '发布成功';
      } else if (option.oper === 'save') {
        content = '保存成功';
      }
      this.showOperMsg(content);
    }
  },
  // 标签切换事件
  onTabChange(e) {
    const value = e.detail.value;
    // 初始化级联选择器右侧选项
    const leftSelected = '运动竞技';
    const leftOption = this.data.cascaderOptions.find(item => item.value === leftSelected);
    const rightOptions = leftOption ? leftOption.children : [];
    
    this.setData({
      currentTab: value,
      currentSubcategory: '',
      cascaderVisible: false,
      cascaderLeftSelected: leftSelected,
      cascaderRightOptions: rightOptions
    });
  },
  
  // 子分类选择事件
  onSubcategoryTap(e) {
    const subcategory = e.currentTarget.dataset.subcategory;
    this.setData({
      currentSubcategory: subcategory,
      cascaderVisible: false
    });
  },
  
  // 显示/隐藏级联选择器
  showCascader() {
    // 如果级联选择器未显示，则初始化右侧选项
    if (!this.data.cascaderVisible) {
      const leftSelected = this.data.cascaderLeftSelected || '运动竞技';
      const leftOption = this.data.cascaderOptions.find(item => item.value === leftSelected);
      const rightOptions = leftOption ? leftOption.children : [];
      
      this.setData({
        cascaderVisible: true,
        cascaderLeftSelected: leftSelected,
        cascaderRightOptions: rightOptions
      });
    } else {
      this.setData({
        cascaderVisible: false
      });
    }
  },
  
  // 级联选择器左侧选择事件
  onCascaderLeftSelect(e) {
    const value = e.currentTarget.dataset.value;
    const leftOption = this.data.cascaderOptions.find(item => item.value === value);
    const rightOptions = leftOption ? leftOption.children : [];
    
    this.setData({
      cascaderLeftSelected: value,
      cascaderRightOptions: rightOptions
    });
  },
  
  // 级联选择器右侧选择事件
  onCascaderRightSelect(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      currentSubcategory: value,
      cascaderVisible: false
    });
  },
  
  // 级联选择器关闭事件
  onCascaderClose() {
    this.setData({
      cascaderVisible: false
    });
  },
  
  onRefresh() {
    this.refresh();
  },
  async refresh() {
    const timeout = 15000; // 设置15秒超时
    this.setData({
      enable: true,
    });
    try {
      const loadDataPromise = Promise.all([
        Promise.race([
          request('/home/cards').then((res) => res.data),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('刷新卡片数据超时')), timeout)
          )
        ]),
        // 刷新时也更新活动数据
        Promise.race([
          this.getActivities(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('刷新活动数据超时')), timeout)
          )
        ])
      ]);

      const [cardRes, activitiesData] = await loadDataPromise;
      const selectedCity = await Promise.race([
        this.getUserCity(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('获取城市信息超时')), timeout)
        )
      ]);

      setTimeout(() => {
        this.setData({
          enable: false,
          cardInfo: cardRes.data,
          activities: activitiesData,
          selectedCity
        });
      }, 1500);
    } catch (error) {
      console.error('刷新数据失败:', error);
      wx.showToast({
        title: error.message || '刷新数据失败',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        enable: false
      });
    }
  },
  showOperMsg(content) {
    Message.success({
      context: this,
      offset: [120, 32],
      duration: 4000,
      content,
    });
  },
  goRelease() {
    wx.navigateTo({
      url: '/pages/release/index',
    });
  },
  
  // 格式化时间显示
  formatTime(timeStr) {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hour}:${minute}`;
  },
  
  // 从云数据库获取活动数据
  async getActivities() {
    try {
      // 按 createdAt 字段倒序排列
      const activitiesRes = await db.collection('activities')
        .orderBy('createdAt', 'desc')
        .get();
      // 格式化时间和地点显示
      const activities = activitiesRes.data.map(activity => {
        let locationText = '';
        if (activity.activityType === 'online' || activity.meetingLink) {
          locationText = '线上';
        } else if (activity.location && typeof activity.location === 'object') {
          const { province = '', city = '', address = '' } = activity.location;
          locationText = [province, city, address].filter(Boolean).join(' ');
        } else if (typeof activity.location === 'string') {
          locationText = activity.location;
        } else {
          locationText = '';
        }
        return {
          ...activity,
          activityStartTime: this.formatTime(activity.activityStartTime),
          activityEndTime: this.formatTime(activity.activityEndTime),
          locationText
        };
      });
      // 设置allActivities和activities
      this.setData({
        allActivities: activities,
        activities: activities
      });
      return activities || [];
    } catch (error) {
      console.error('获取活动数据失败:', error);
      return [];
    }
  },
  
  // 根据条件查询活动
  async getActivitiesByCondition(condition) {
    try {
      // 使用查询指令构建复杂查询
      // 示例：查询进行中的活动（状态为1）或者即将开始的活动（状态为0）
      const activitiesRes = await db.collection('activities')
        .where(_.or([
          { status: _.eq(1) }, // 进行中
          { status: _.eq(0) }  // 即将开始
        ]))
        .get();
      
      return activitiesRes.data || [];
    } catch (error) {
      console.error('条件查询活动失败:', error);
      return [];
    }
  },

  onSearchInput(e) {
    const value = e.detail.value || '';
    this.setData({ searchValue: value });
    if (!value) {
      this.setData({ activities: this.data.allActivities });
      return;
    }
    const filtered = this.data.allActivities.filter(item =>
      item.title && item.title.indexOf(value) !== -1
    );
    this.setData({ activities: filtered });
  },

  onSearchClear() {
    this.setData({
      searchValue: '',
      activities: this.data.allActivities
    });
  },

  // 查看活动详情
  onViewDetail: function(e) {
    const activityId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity-detail/index?id=${activityId}`
    });
  },
});
