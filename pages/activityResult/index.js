let app = getApp();
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    baseUrl: app.globalData.imagesUrl,
    defaultIcon: app.globalData.imagesUrl + '/images/icon/icon-defult-touxiang.png',
    self: {},
    success: true,
    avatarObjList: app.globalData.avatarObjList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { id, success } = options;
    this.setData({id, success: success === 'true'});
    this.getActivityInfo(id);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  getActivityInfo: function(id) {
    let that = this;
    wx.showToast({ title: '加载中', icon: 'loading' });
    let url =  app.globalData.baseUrl + '/remote/myactivity/friend/rank/' + id;
    let method = 'POST';
    util.wxAjax(method,url).then(res=>{
      wx.hideToast();
      if (res.data.code == 200) {
        let { self } = res.data.data;
        that.setData({self});
      }
    });
  },
  navigateDetail: function() {
    let { id } = this.data;
    wx.navigateTo({
      url: '../activityInfo/index?id=' + id
    })
  }
})