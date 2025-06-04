Component({
  properties: {
    url: String,
    desc: String,
    tags: Array,
    activityId: String, // 添加活动ID属性
  },
  data: {},
  methods: {
    // 点击卡片时触发事件
    onCardTap() {
      const { activityId } = this.properties;
      if (activityId) {
        // 跳转到活动详情页
        wx.navigateTo({
          url: `/pages/activity-detail/index?id=${activityId}`
        });
      }
      // 触发自定义事件，让父组件也能处理点击事件
      this.triggerEvent('cardtap', { activityId });
    }
  },
});
