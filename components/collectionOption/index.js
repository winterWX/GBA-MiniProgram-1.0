const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    imagesUrl: app.globalData.imagesUrl
  },

  lifetimes: { // 生命周期
    ready: function () {
      this.restFilterDatas()
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleFell(){
      this.triggerEvent('parentReceive', {
        handleSuccess: true
      }, {})
    },
    restFilterDatas(){
      var animation = wx.createAnimation({
        duration: 1000,
        timingFunction: 'ease',
        delay: 100
      });
      animation.opacity().translate(100, -88).step()
      this.setData({
        ani:  animation.export()
      })
      animation.opacity().translate(-85, -45).step()
      this.setData({
        aniLeft:  animation.export()
      })
    }
  }
})
