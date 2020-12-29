// pages/signSuccess/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    integral: 0,
    hospitalInfo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { integral } = options;
    let hospitalInfo = JSON.parse(wx.getStorageSync('hospitalInfo'));
    this.setData({hospitalInfo})
    this.setData({integral})
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('hospitalInfo');
  },
  linkToIntegral: function() {
    wx.navigateTo({
      url: '../integralDetails/index',
    })
  }
})