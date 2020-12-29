import { wxAjax } from "../../utils/util";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: 'https://www.cuclinic.hk/en/my_appointment/?cid=18k&tid=345&mti=456'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let mobile = app.globalData.phoneNumber;
    this.getTransactionid(mobile);
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

  getTransactionid: function(mobile) {
    let that = this;
    let url = app.globalData.baseUrl + '/remote/interrogation/cumc/findinter';
    wxAjax('GET', url, {mobile}).then(res => {
      let { membershipid, transationid } = res.data.data;
      let url = `https://www.cuclinic.hk/zh-hant/my_appointment/?cid=${membershipid}&tid=${transationid}&mti=E-booking`
      that.setData({url});
    })
  },
  copyData: function() {
    let { url } = this.data;
    wx.setClipboardData({
      data: url,
      success: (res) => {
      },
      fail: (res) => {
      },
      complete: () => {
      }
    })
  }
})