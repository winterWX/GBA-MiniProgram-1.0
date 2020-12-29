let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    reward: 0,
    baseUrl: app.globalData.imagesUrl,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let {id, reward=0 } = options;
    this.setData({id, reward});
   /*  this.setData({ successFlg: true })
    this.selectComponent('#filterCmp').restFilterDatas(); */
  },
  onShow: function() {
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
  },
  navigateActivityResult: function() {
    wx.navigateTo({
      url: '../activityResult/index?id=' + this.data.id + '&success=' + true
    })
  }
})