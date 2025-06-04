const { QQMapWX } = require('../../utils/qqmap-wx-jssdk.min.js');
const { cityList } = require('./city-data.js');
const { provinceList } = require('./province-city-data.js');

let touchEndy = 0;
let rightheight = 0;
let timer = null;
let that = null;

Page({
  data: {
    currentCity: '',
    hotCities: ['北京', '上海', '广州', '深圳', '杭州', '南京'],
    cityList: cityList,
    letters: ['定位', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],

    searchResult: [],
    isSearching: false,
    searchKeyword: ''
  },

  onBackTap() {
    wx.navigateBack({
      delta: 1
    });
  },

  onLoad() {
    that = this;
    // 初始化地图SDK
    this.qqmapsdk = new QQMapWX({
      key: '4YNBZ-WOCKG-R2FQP-QTOB3-EFLSS-3LB5F'
    });
    
    // 获取当前位置
    this.getCurrentCity();
    
    // 初始化城市列表
    this.initCityList();
  },

  onReady() {
    // 获取右侧字母索引条高度
    const query = wx.createSelectorQuery();
    query.select('#right').boundingClientRect();
    query.exec((res) => {
      if (res && res[0]) {
        rightheight = res[0].height;
      }
    });
  },

  getCurrentCity() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (res) => {
            this.setData({
              currentCity: res.result.address_component.city
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        });
      }
    });
  },

  initCityList() {
    // 使用预定义的城市数据
    // 过滤掉没有城市的字母
    const validLetters = ['定位', ...cityList.map(section => section.initial)];
    this.setData({
      cityList,
      letters: validLetters
    });
  },

  onSearch(e) {
    const keyword = e.detail.value.trim();
    this.setData({
      searchKeyword: e.detail.value
    });
    
    if (!keyword) {
      this.setData({
        isSearching: false,
        searchResult: []
      });
      return;
    }

    const result = [];
    this.data.cityList.forEach(section => {
      const matchedCities = section.cities.filter(city =>
        city.indexOf(keyword) > -1
      );
      result.push(...matchedCities);
    });

    // 对搜索结果进行排序，优先显示以关键词开头的城市
    result.sort((a, b) => {
      const aStartsWithKeyword = a.startsWith(keyword);
      const bStartsWithKeyword = b.startsWith(keyword);
      
      if (aStartsWithKeyword && !bStartsWithKeyword) {
        return -1;
      } else if (!aStartsWithKeyword && bStartsWithKeyword) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });

    this.setData({
      isSearching: true,
      searchResult: result
    });
  },

  // 清空搜索框
  clearSearch() {
    this.setData({
      isSearching: false,
      searchResult: [],
      searchKeyword: ''
    });
  },

  async onCitySelect(e) {
    const city = e.currentTarget.dataset.city;
    // 查找省份
    let province = '';
    for (let i = 0; i < provinceList.length; i++) {
      if (provinceList[i].cities.includes(city)) {
        province = provinceList[i].name;
        break;
      }
    }
    wx.setStorageSync('selectedProvince', province);
    wx.setStorageSync('selectedCity', city);
    
    try {
      // 获取用户手机号码
      const phoneNumber = wx.getStorageSync('phoneNumber');
      if (!phoneNumber) {
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      // 更新数据库中的城市信息
      const db = wx.cloud.database();
      await db.collection('users').where({
        phoneNumber: phoneNumber
      }).update({
        data: {
          selectedCity: city,
          updateTime: db.serverDate()
        }
      });

      // 将选择的城市信息返回给上一页
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage) {
        prevPage.setData({
          selectedCity: city
        });
      }

      wx.showToast({
        title: '城市更新成功',
        icon: 'success'
      });
      
      wx.navigateBack();
    } catch (error) {
      console.error('更新城市失败:', error);
      wx.showToast({
        title: '更新城市失败',
        icon: 'none'
      });
    }
  },

  // 触摸开始事件
  touchStart(e) {
    touchEndy = e.touches[0].pageY;
  },

  // 触摸移动事件
  touchMove(e) {
    touchEndy = e.touches[0].pageY;
    const lindex = parseInt(touchEndy / rightheight * 27);
    if (lindex >= 0 && lindex < this.data.letters.length) {
      const value = this.data.letters[lindex];
      if (value !== '定位') {
        this.setData({
          toView: value
        });
      }
    }
  },

  // 触摸结束事件
  touchEnd(e) {
    const lindex = parseInt(touchEndy / rightheight * 27);
    if (lindex >= 0 && lindex < this.data.letters.length) {
      const value = this.data.letters[lindex];
      if (value !== '定位') {
        this.setData({
          toView: value
        });
      }
    }
  },

  // 字母点击事件
  letterclick(e) {
    const letter = e.currentTarget.dataset.letter;
    
    if (letter === '定位') {
      this.setData({
        toView: 'dw'
      });
    } else {
      // 设置toView为对应字母的城市分区ID
      this.setData({
        toView: letter
      });
      // 确保滚动到正确位置
      wx.nextTick(() => {
        this.setData({
          toView: letter
        });
      });
    }
  },


});