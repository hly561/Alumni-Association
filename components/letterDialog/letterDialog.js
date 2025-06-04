Component({
  properties: {},

  data: {
    isShow: false,
    letter: ''
  },

  methods: {
    hideDialog() {
      this.setData({
        isShow: false
      });
    },

    showDialog() {
      this.setData({
        isShow: true
      });
    },

    setLetter(letter) {
      this.setData({
        letter: letter
      });
    },

    getDialogState() {
      return this.data.isShow;
    }
  }
});