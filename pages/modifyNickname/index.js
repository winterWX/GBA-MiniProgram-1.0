import { wxAjax } from "../../utils/util";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    nickName: '',
    btnNickName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData ({ nickName: options.nickName, btnNickName: options.nickName, id: options.id });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      active: 4
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
  nameChange: function(e) {
    this.setData({
        nickName: e.detail.value,
        btnNickName: e.detail.value.replace(/\s+/g, '') === '' ? '' : e.detail.value
    })
  },
  submitHnadle() {
    if (!this.data.btnNickName) {
        return;
    }
    let url = app.globalData.baseUrl + '/remote/myProfile/edit';
    let data = {
      "nickname": this.data.nickName,
      "id": this.data.id
    };
    wxAjax('POST', url, data).then(res => {
      if (res.data.code == 200) {
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
      }
    })
    .catch(() => {
      wx.showToast({
        titel: '服务繁忙， 请稍后重试。',
        icon: 'loading'
      })
    });
  }

})