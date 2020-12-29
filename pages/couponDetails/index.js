const app = getApp();
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponDetail:{},
    copyCode: false,
    showLink: false,
    imagesUrl: app.globalData.imagesUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      let {id} = options;
      that.couponDetail(id);
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
  onShareAppMessage: function () {},
  couponDetail:function(id){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/tier/coupon/detail?id='+ id;
    let method = 'GET';
    util.wxAjax(method,url).then(res =>{
        if (res.data.code == 200) {
          res.data.data = res.data.data.map(item =>{
            return {
              effectiveDateTime: that.cardDayShow(item.effectiveDateTime), 
              expiryTime: that.cardDayShow(item.expiryTime),
              ...item
            }
          })
          that.setData({couponDetail: res.data.data});
        }
    })
  },
  cardDayShow:function(value){
    const date = new Date(value * 1000); 
    const Y = date.getFullYear() + '年';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '日';
    return  Y + M + D;
  },
  texteCopy:function(){
    let that = this;
    wx.setClipboardData({
      data: that.data.couponDetail.code,
      success (res) {
        wx.getClipboardData({
          success (res) {
              wx.showToast({
                title: '成功复制'
              });
          }
        })
      }
    })
  },
  handleFell:function(){
     let that = this;
     wx.showModal({
       title: '你将被连接到第三方平台',
       content: '你现在正离开[恒生健康]进入第三方平台,是否继续？',
       confirmText: '继续',
       success (res) {
         if (res.confirm) {
           that.setData({showLink :true});
         } else if (res.cancel) {
           return;
         }
       }
     });
  }
})