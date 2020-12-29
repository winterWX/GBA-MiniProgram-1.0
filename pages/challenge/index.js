let app = getApp();
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      activityList: [],
      loadingFinish: false,
      page: 1,
      totalPage: 0,
      baseUrl: app.globalData.imagesUrl,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getActivityList(1);
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
    this.setData({page: 1, activityList: [], loadingFinish: false});
    this.getActivityList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let {page, totalPage} = this.data;
    if (page >= totalPage) {
      return;
    }
    let curPage = page + 1;
    this.getActivityList(curPage);
  },
  getActivityList: function(page) {
    let that = this;
    wx.showToast({title: '加载中', icon: 'loading'});
    this.setData({loadingFinish: false});
    let url =  app.globalData.baseUrl + '/remote/activity/list';
    let method = 'POST';
    const data = { currentPage: page, pageSize: 10,"status": [{"status": 1},{"status": 2 }]};
    util.wxAjax(method,url,data).then(res =>{
        wx.hideToast();
        if (res.data.code == 200) {
          let list = that.data.activityList;
          let totalPage = res.data.totalPage;
          that.setData({activityList: [...list,...res.data.data], loadingFinish: true, page, totalPage});
          wx.stopPullDownRefresh();
        } else {
          that.setData({loadingFinish: true});
        }
    }).catch(err => {
        that.setData({loadingFinish: true, page});
        wx.stopPullDownRefresh();
        wx.hideToast();
    })
  },
  navigatorDetail: function(e) {
    let {title,id, type } = e.currentTarget.dataset;
    let url = type === '2' ? '../healthKnowledge/index?id=' + id  + '&title=' + title : '../activityDetail/index?id=' + id + '&title=' + title;
    wx.navigateTo({
      url
    })
  }
})