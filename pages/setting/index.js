const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      active: 4
    })
  },

  loginOut :function(){
    let that = this;
    wx.showModal({
      title: '是否确认登出恒生健康',
      content: '登出后不会删除任何历史记录，下次登录依然可以使用本账号。',
      confirmText: '确认',
      success (res) {
        if (res.confirm) {
          that.loginOutIpa();
        } else if (res.cancel) {
          return;
        }
      }
    });
  },
  // 退出登录
  loginOutIpa: function() {
    wx.request({
      url: app.globalData.baseUrl + '/remote/loginOut',
      method: "GET",
      header: {
        'Content-Type': 'application/json',
        "token": app.globalData.token,
        "native-app": "mini"
      },
      data:{
        device: 2
      },
      success: function (res) {
        if (res.data.code == 200) {
            app.globalData.isLogin = 0;
            app.globalData.token = '';
            app.globalData.userInfo = null;
            app.globalData.loginSuccess = false;
            wx.navigateTo({
              url: '../index/index'
            })
        }
      },
      fail: function (res) {
        console.log('.........fail..........');
      }
    })
  }
})