import { wxAjax } from "../../utils/util";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList: [],
    loadingFinish: false,
    page: 1,
    totalPage: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getActivityList(1);
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
    let url = app.globalData.baseUrl + '/remote/activity/list';
    let data = {
      currentPage: 1,
      pageSize: 10,
      "status": [
        {
          "status": 3
        }
      ]
    };
    wx.showToast({title: '加载中', icon: 'loading'});
    wxAjax('POST', url, data).then(res => {
      wx.hideToast();
        if (res.data.code == 200) {
          let list = that.data.activityList;
          if (res.data.data.length === 0 && page > 1) {
            page = page - 1;
          }
          let totalPage = res.data.totalPage;
          that.setData({activityList: [...list,...res.data.data], page, totalPage, loadingFinish: true});
          wx.stopPullDownRefresh();
        }
    })
    .catch(() => {
      if (page > 1) {
        page = page - 1;
      };
      that.setData({page, loadingFinish: true});
      wx.stopPullDownRefresh();
      wx.hideToast();
    });
  },
  navigatorDetail: function(e) {
    console.log(e);
    let {title,id, type } = e.currentTarget.dataset;
    let url = type === '2' ? '../healthKnowledge/index?id=' + id : '../activityDetail/index?id=' + id + '&title=' + title;
    console.log(url)
    wx.navigateTo({
      url
    })
  }
})