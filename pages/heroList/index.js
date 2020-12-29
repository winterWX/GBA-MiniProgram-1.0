import { wxAjax } from "../../utils/util";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    friend: [],
    self: {},
    imagesUrl: app.globalData.imagesUrl,
    defaultIcon: app.globalData.imagesUrl + '/images/icon/icon-defult-touxiang.png',
    avatarObjList: app.globalData.avatarObjList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { id } = options;
    this.getHeroList(id);
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  getHeroList: function(id) {
    let that = this;
    let url = app.globalData.baseUrl + '/remote/myactivity/friend/rank/' + id;
    wx.showToast({ title: '加载中', icon: 'loading' });
    wxAjax('POST', url).then(res => {
      wx.hideToast();
      if (res.data.code == 200) {
        let { friend, self } = res.data.data;
        that.setData({friend, self})
      }
    })
    .catch(res => {
      wx.hideToast();
    })
  }
})