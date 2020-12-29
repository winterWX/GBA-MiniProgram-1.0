import { wxAjax } from "../../utils/util";
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCanDraw: false,
    userInfoData:{},
    invitData:{},
    recommendFlg: false,
    imagesUrl: app.globalData.imagesUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that =this;
    that.forShareNum();
    that.recommendNum();
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
      let that = this;
      wx.showNavigationBarLoading();    //在当前页面显示导航条加载动画
      that.recommendNum();  //查看返回记录
      setTimeout(function(){
          wx.hideNavigationBarLoading();    //在当前页面隐藏导航条加载动画
          wx.stopPullDownRefresh();    //停止下拉动作
      },1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  createShareImage:function() {
    this.setData({
      isCanDraw: !this.data.isCanDraw
    })
  },
  //邀请码  
  recommendNum: function () {
    var that = this;
    let url = app.globalData.baseUrl + '/remote/invite/invitationcode';
    wxAjax('GET', url).then(res => {
      if(res.data.code === 200){
        that.setData({ invitData: res.data.data }); 
        //添加邀请码到 userInfo
        app.globalData.invitationCode = res.data.data.invitationCode;
        if(res.data.data.invitationList.length > 0){
            res.data.data.invitationList.forEach( v => {
                let reg = /^(\d{3})\d{4}(\d{4})$/;
                v.phoneNumber = v.phoneNumber.replace(reg, "$1****$2");
            })
            res.data.data.personNum = res.data.data.invitationList.length;
            that.setData({ invitData: res.data.data, recommendFlg: true})
        }else{
            that.setData({recommendFlg: false });
        }
    }
    });
  },
  
  //小程序码
  forShareNum: function () {
    var that = this;
    let url = app.globalData.baseUrl +'/remote/wxQrCode/generateQrCode';
    wxAjax('POST', url, {path: '',width: 88}).then(res => {
      if(res.data.code == 200){
     }
    })
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    app.globalData.userInfo.invitationCode = this.data.invitData.invitationCode;
    let userInfoData = JSON.stringify(app.globalData.userInfo);
    let shareObj = {
　　　　title: "邀请好友注册领好礼",
　　　　path: '/pages/sharedPage/index?userInfoData='+ userInfoData,
       imageUrl: this.data.imagesUrl + '/images/addFriend/img@3x.png'
　　}
　　// 来自页面内的按钮的转发
　　if (options.from == 'button') {
  　　　return shareObj;
　　}
　　return shareObj;
  }
})