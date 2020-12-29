import { wxAjax } from "../../utils/util";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: '',
    urlTag:'',
    imagesUrl: app.globalData.imagesUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.url && options.url.indexOf('/#') > -1) {
      let baseUrlNum = ''
      let startStr = options.url.substr(0, options.url.indexOf('/#'));
      let endStr = options.url.substr(options.url.indexOf('/#') + 2, options.url.length - 1);
      baseUrlNum = startStr + '?goodsId=' + endStr;
      this.setData({ url: baseUrlNum })
    }else if(options.pageTag === 'pageTag'){
      this.setData({ urlTag: 'pageTag' })
    }else {
      this.setData({
        url: options.url
      })
    }
  },
  phoneNumberLogin (data) {
    const parms = {
      encryptedData: data.encryptedData,
      iv: data.iv,
      openId: app.globalData.userInfo.openId,
      avatarUrl: app.globalData.userInfo.avatarUrl,
      invitationCode: app.globalData.invitationCode
    }
    wx.showLoading({
      title: 'loading...',
    });
    let url = app.globalData.baseUrl + '/remote/register/miniProgram/add';
    wxAjax('POST', url, parms).then(res => {
        if (res.data.code === 200) {
            const { data: { data: { token, phoneNumber,integral={},isFriend}}} = res;
            app.globalData.isLogin = 3;  //登录成功
            app.globalData.token = token;
            app.globalData.phoneNumber = phoneNumber;
            let integralFlg = integral.flag !== undefined ? integral.flag : '';
            console.log('------新用户 + this.data.urlTag ', res,this.data.urlTag);
            if(this.data.urlTag === 'pageTag' && integralFlg === 'true'){
                wx.redirectTo({ url: '../index/index?flag='+ integralFlg });
            }else if((this.data.urlTag === 'pageTag' && integralFlg === '') && !isFriend){
              
                let addSuccess = 'addSuccess';
                wx.redirectTo({ url: '../newFriend/index?addSuccess='+ addSuccess });
            }else if(this.data.urlTag === 'pageTag' && isFriend){
                //是否已经互为好友
                wx.redirectTo({ url: '../addFriend/index' });
            }
            wx.reLaunch({
              url: this.data.url + '?flag=' + integralFlg,
              complete: () => {}
            })
        } else {
            wx.showModal({
              showCancel: false,
              content: res.message,
              success: (res) => { }
            })
        }
        wx.hideLoading()
    });
  },
  getPhoneNumber (e) { //获取电话信息     
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      this.phoneNumberLogin(e.detail)
    } else {
      wx.redirectTo({
        url: '../index/index',
        complete: () => {

        }
      })
    }
  },
  stopLogin () {
    wx.redirectTo({
      url: '../index/index'
    })
  },
})