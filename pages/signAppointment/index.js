let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.imagesUrl,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  clickHandleHK: function() {
    wx.navigateTo({
      url: '../offlineAppointment/index',
    })
    
  },
  scanCode: function() {
    wx.navigateTo({
      url: '../scan/index',
    })
  }
})