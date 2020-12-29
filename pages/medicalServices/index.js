let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 1,
    imageList: [{
      id: 1,
      url: app.globalData.imagesUrl  + '/images/medical/banner-1.png'
    }/* , {
      id: 2,
      url: app.globalData.imagesUrl + '/images/medical/banner-4.png'
    } */],
    currentImg: {},
    baseUrl: app.globalData.imagesUrl,
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    showDetailInfo: false,
    showLink:false,
    showModal: false,
    single: false
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({active: 1 })
  },
  clickHandle: function(e) {
    wx.navigateTo({
      url: '../signAppointment/index',
    })
  },
  showDetailInfo: function() {
    this.setData({
      showDetailInfo:!this.data.showDetailInfo
    })
  },
  showLinkFun:function(){
    this.setData({ showLink: true});
  },
  // 点击确定按钮的回调函数
  modalConfirm(e) {
   // 这里面处理点击确定按钮业务逻辑
    this.setData({showLink: true});
  },
  openModal: function() {
    this.setData({showModal: true});
  },
  goTermCondition: function() {
    wx.navigateTo({
      url: '../termsConditions/index',
    })
  }
})