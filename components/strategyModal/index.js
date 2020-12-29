Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //是否显示modal弹窗
    levelNum:{
      type: Number,
      value: 0
    },
    show: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
      num:1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击modal的回调函数
    clickMask() {
      // 点击modal背景关闭遮罩层，如果不需要注释掉即可
      this.setData({show: false})
    },
    closeModal:function() {
        this.triggerEvent('infotan');
    },
    // 点击确定按钮的回调函数
    confirm() {
      this.setData({ show: false });
      wx.navigateTo({
          url: '../../pages/strategy/index?levelParam='+ this.data.levelNum,
      })
    },
    goldconfirm:function(){
        this.setData({ show: false });
        wx.navigateTo({
            url: '../../pages/goldStrategy/index?levelParam='+ this.data.levelNum,
        })
    }
  }
})
