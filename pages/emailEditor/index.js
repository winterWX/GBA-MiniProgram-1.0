const app = getApp();
const util = require('../../utils/util');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    email: '',
    codeNum:'',
    emailEDit: true,
    showErroe:false,
    showEmai: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData ({
      email: options.email
    })
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
  onShareAppMessage: function () { },
  nameChange: function(e) {
      this.setData({
        email: e.detail.value
      })
    this.setData({
      showEmail: false
    })
  },
  codeNumChange:function(e){
      this.setData({
        codeNum: e.detail.value
      })
      this.setData({
        showErroe: false
      })
  },
  //发送邮箱
  sendEmail() {
    let that = this;
    //邮箱验证
    if (!(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(that.data.email))){ 
        this.setData({
          showEmail: true
        })
        return;
    }
    let url =  app.globalData.baseUrl + '/remote/email/send';
    let method = 'POST';
    const data = { "email": this.data.email };
    util.wxAjax(method,url,data).then(res=>{
      if (res.data.code == 200) {
        that.setData({ emailEDit:false });
      }
    }).catch(res=>{
      console.log('.........fail..........');
      wx.showToast({
        titel: '服务繁忙， 请稍后重试。',
        icon: 'loading'
      })
    })
  },
  //绑定邮箱
  bindEmail() {
    let that = this;
    if(!that.data.codeNum){ return; }
    let url =  app.globalData.baseUrl + '/remote/email/bind';
    let method = 'POST';
    const pamars = { code: that.data.codeNum };
    util.wxAjax(method,url,pamars).then(res =>{
        if (res.data.code == 200) {
          wx.showToast({
            titel: '服务繁忙， 请稍后重试。',
            icon: 'loading'
          })
          wx.navigateBack({
            url: '../profile/index',
            success: function(res) {
                wx.showToast({
                  title: '修改成功',
                  icon: 'success',
                  duration: 2000
                })
            }
          });
        }else{
          that.setData({ showErroe:true })
        }
    }).catch(res=>{
      console.log('.........fail..........');
      wx.showToast({
        titel: '服务繁忙， 请稍后重试。',
        icon: 'loading'
      })
    })
  }
})