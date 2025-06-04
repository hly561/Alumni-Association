Component({
  properties: {
    menuItems: {
      type: Array,
      value: [
        {
          text: '运动竞技',
          expanded: false,
          subItems: [
            { text: '篮球', active: false },
              { text: '足球', active: false },
              { text: '羽毛球', active: false },
              { text: '乒乓球', active: false },
              { text: '网球', active: false },
              { text: '排球', active: false },
              { text: '匹克球', active: false },
              { text: '壁球', active: false },
              { text: '登山', active: false },
              { text: '徒步', active: false },
              { text: '骑行', active: false },
              { text: '攀岩', active: false },
              { text: '探险', active: false },
              { text: '定向越野', active: false },
              { text: '健身', active: false },
              { text: '瑜伽', active: false },
              { text: '普拉提', active: false },
              { text: '搏击', active: false },
              { text: '操课', active: false },
              { text: '舞蹈', active: false },
              { text: '飞盘', active: false },
              { text: '橄榄球', active: false },
              { text: '跑步', active: false },
              { text: '马拉松', active: false },
              { text: '太极', active: false },
              { text: '台球', active: false },
              { text: '保龄球', active: false },
              { text: '射箭', active: false },
              { text: '高尔夫', active: false },
              { text: '卡丁车', active: false },
              { text: '皮划艇', active: false },
              { text: '潜水', active: false },
              { text: '冲浪', active: false },
              { text: '帆船', active: false },
              { text: '钓鱼', active: false },
              { text: '游泳', active: false },
              { text: '滑雪', active: false },
              { text: '冰球', active: false },
              { text: '滑冰', active: false },
              { text: '冰壶', active: false }
            ]
          
        },
        {
          text: '文化艺术',
          expanded: false,
          subItems: [
            { text: '非遗', active: false },
            { text: '艺术展', active: false },
            { text: '音乐会', active: false },
            { text: '演唱会', active: false },
            { text: '读书/文学', active: false },
            { text: '电影', active: false },
            { text: '戏剧', active: false },
            { text: '摄影', active: false },
            { text: '手工DIY', active: false }
          ]
        },
        {
          text: '职业创业',
          expanded: false,
          subItems: [
            { text: '行业交流', active: false },
            { text: '企业参访', active: false },
            { text: '行业峰会', active: false },
            { text: '职业培训', active: false }
          ]
        },
        {
          text: '休闲娱乐',
          expanded: false,
          subItems: [
            { text: '电子游戏', active: false },
            { text: '桌游', active: false },
            { text: '旅行', active: false },
            { text: '密室逃脱', active: false },
            { text: '剧本杀', active: false },
            { text: '线下观赛', active: false }
          ]
        },
        {
          text: '亲子',
          expanded: false,
          subItems: [
            { text: '亲子活动', active: false },
            { text: '教育沙龙', active: false },
            { text: '家庭旅行', active: false }
          ]
        },
        {
          text: '社交',
          expanded: false,
          subItems: [
            { text: '聚餐', active: false }
          ]
        },
        {
          text: '学习',
          expanded: false,
          subItems: [
            { text: '大咖讲座', active: false },
            { text: '学术交流', active: false },
            { text: '语言角', active: false },
            { text: '考试互助', active: false }
          ]
        }
      ]
    }
  },

  methods: {
    onMenuItemTap(e) {
      const index = e.currentTarget.dataset.index;
      const menuItems = this.data.menuItems;
      menuItems[index].expanded = !menuItems[index].expanded;
      
      // 关闭其他展开的菜单
      menuItems.forEach((item, i) => {
        if (i !== index) {
          item.expanded = false;
        }
      });

      this.setData({ menuItems });
    },

    onSubItemTap(e) {
      const { parentIndex, subIndex } = e.currentTarget.dataset;
      const menuItems = this.data.menuItems;
      
      // 更新选中状态
      menuItems.forEach((menuItem, i) => {
        menuItem.subItems.forEach((subItem, j) => {
          subItem.active = i === parentIndex && j === subIndex;
        });
      });

      this.setData({ menuItems });
      
      // 触发选择事件
      this.triggerEvent('select', {
        parentIndex,
        subIndex,
        item: menuItems[parentIndex].subItems[subIndex]
      });
    }
  }
});