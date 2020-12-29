
import { wxAjax } from "../../utils/util";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList: [],
    loadingFinish: false,
    page: 1,
    totalPage: 0,
    baseUrl: app.globalData.imagesUrl
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
    this.setData({ page: 1, activityList: [], loadingFinish: false });
    this.getActivityList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { page, totalPage } = this.data;
    if (page >= totalPage) {
      return;
    }
    let curPage = page + 1;
    this.getActivityList(curPage);
  },
  getActivityList: function (page) {
    let that = this;
    wx.showToast({ title: '加载中', icon: 'loading' });
    this.setData({ loadingFinish: false });
    let url = app.globalData.baseUrl + '/remote/myactivity/list';
    let data = {
      currentPage: page,
      pageSize: 10,
      "status": [
        {
          "status": 1
        },
        {
          "status": 2
        }
      ]
    }
    wxAjax('POST', url, data).then(res => {
      wx.hideToast();
        if (res.data.code == 200) {
          let list = that.data.activityList;
          let totalPage = res.data.totalPage;
          that.setData({ activityList: [...list, ...res.data.data], loadingFinish: true, page, totalPage });
          wx.stopPullDownRefresh();
        } else {
          that.setData({ loadingFinish: true });
        }
    })
    .catch(() => {
      that.setData({ loadingFinish: true, page });
      wx.stopPullDownRefresh();
      wx.hideToast();
    })
  },
  navigateList: function () {
    wx.navigateTo({
      url: '../challenge/index'
    })
  },
  navigatorDetail: function (e) {
    let { title, id } = e.currentTarget.dataset;
    this.getActivityDetail(id);
  },
  getActivityDetail: function (id) {
    let that = this;
    let url = app.globalData.baseUrl + '/remote/myactivity/detail/' + id;
    wxAjax('GET', url).then(res => {
      if (res.data.code == 200) {
        let { status, type } = res.data.data;
        let url = '';
        if (type === '2') {
          url = '../healthKnowledge/index?id=' + id;
        } else {
          url = '../activityDetail/index?id=' + id;
        }
        wx.navigateTo({
          url
        })
    
      }
    });
  },
  judgeReceivedRewardStatus: function (arr) {
    let success = true;
    for (let item of arr) {
      // received 3 不可领取
      if (item.received === 3) {
        success = false;
        break;
      }
    }
    return success;
  }
})