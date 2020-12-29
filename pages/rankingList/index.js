import { wxAjax } from "../../utils/util";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    self: {},
    friend: [],
    avatarObjList: app.globalData.avatarObjList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRankList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  getRankList: function() {
    let that = this;
    let url = app.globalData.baseUrl + '/remote/leaderboard/friend/board';
    wxAjax('GET', url).then(res => {
      wx.hideToast();
        if (res.data.code == 200) {
          let { myBoardVo, friendLeaderBoardVo} = res.data.data;
          that.setData({
            self: myBoardVo,
            friend: friendLeaderBoardVo
          })
        }
    });
  },
  moreFriend:function(){
    wx.navigateTo({
      url: '../../pages/addFriend/index',
    })
  }
})