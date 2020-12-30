import { wxAjax } from "../../utils/util";
import { whiteList } from "../../utils/whiteList.js";
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
    wx.showLoading({ title: 'loading...' });
    let url = app.globalData.baseUrl + '/remote/register/miniProgram/add';
    wxAjax('POST', url, parms).then(res => {
        if (res.data.code === 200) {
            wx.hideLoading();  //关闭loading
            const { data: { data: { token, phoneNumber,integral={}, isFriend}}} = res;
            if(!whiteList.includes(phoneNumber)){
                wx.showModal({
                  title: '提示',
                  content: '您没有登录权限',
                  showCancel: false,
                  success (res) { if (res.confirm)  wx.redirectTo({ url: '../index/index'}) }
                })
            }else{
                app.globalData.isLogin = 3;  //登录成功
                app.globalData.token = token;
                app.globalData.phoneNumber = phoneNumber;
                let integralFlg = integral.flag !== undefined ? integral.flag : '';
    
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
            }
        } else {
            wx.hideLoading();
            wx.showModal({
              showCancel: false,
              content: res.message,
              success: (res) => { }
            })
        }
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
  whiteList(num){
      let whiteList = [123,34534,345345]
      let node = whiteList.find(item=>{
           return item === num;
      })
      if(node){
          this.setData({whiteList: true});
      }
  }
})