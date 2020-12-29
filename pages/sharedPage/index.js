
import { wxAjax } from "../../utils/util";
const app = getApp();
const userLogin = require('../../utils/userLogin.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoData:{},
    isLogin: 0,
    redirectToUrl:'pageTag', //新用户跳转的标记
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfoData = JSON.parse(options.userInfoData);
    app.globalData.invitationCode = userInfoData.invitationCode;
    this.setData({ userInfoData : userInfoData })
  },

  //检测是否已经授权  
  // checkAuthorization() {
  //   wx.getSetting({
  //     success: (setingres) => {
  //       wx.hideLoading()
  //       if (setingres.authSetting['scope.userInfo']) { //已经授权获取用户信息             
  //         wx.getUserInfo({
  //           success: (res) => {
  //             this.userLogin(res)
  //           },
  //           fail: () => {
  //             wx.showModal({
  //               showCancel: false,
  //               content: '获取用户信息失败,请重新点击底部菜单',
  //               success: (res) => {
  //                 this.setData({
  //                   isLogin: 0
  //                 })
  //               }
  //             })
  //           }
  //         })
  //       }
  //     }
  //   })
  // },

  // onLogin(data) { //登录
  //   wx.showLoading({
  //     title: 'loading...',
  //   })
  //   wx.login({
  //     success: (res) => {
  //       wx.hideLoading()
  //       if (res.code) {
  //         //发起网络请求
  //         this.setData({
  //           code: res.code
  //         })
  //         if (this.data.isLogin == 0) {
  //           this.checkAuthorization()
  //         } else if (this.data.isLogin == 1) {
  //           this.userLogin(data)
  //         }
  //         //标记登录成功
  //         app.globalData.loginSuccess = true;
  //       }
  //     },
  //     fail: function (res) {
  //       wx.showModal({
  //         showCancel: false,
  //         content: '登录失败',
  //         success: (res) => {

  //         }
  //       })
  //     }
  //   })
  // },
  
  getUserInfo(e) { //获取用户信息

    // if (e.detail.userInfo) {
    //   this.onLogin(e.detail)
    // }

    let that = this;
    if (e.detail.userInfo) {
        userLogin.onLogin(function(result){
          that.data.isLogin = result.isLoginState;
          app.globalData.loginSuccess = result.isLoginState;
          app.globalData.userInfo = result.newUserInfo;
          app.globalData.userInfoDetail = result.newUserInfo;
        },e.detail,that.data.isLogin,that.data.redirectToUrl)
    }
  },
  // userLogin(data) {
  //   wx.showLoading({
  //     title: 'loading...',
  //   })
  //   const parms = {
  //     code: this.data.code,
  //     encrypteData: data.encryptedData,
  //     iv: data.iv
  //   }
  //   wx.request({
  //     method: 'post',
  //     url: app.globalData.baseUrl + '/remote/oauth/minipro/login',
  //     header: {
  //       "Content-Type": "application/json;charset=UTF-8",
  //       "native-app": "mini"
  //     },
  //     data: parms,
  //     success: (res) => {
  //       if (res.data.code === 200) {
  //         app.globalData.userInfo = res.data.data;
  //         app.globalData.userInfoDetail = data.userInfo || res.data.data;
  //         this.setData({ isLogin: 1 });
  //         //let successLogin = true;  //新用户注册成功的标志
  //         let urlBase = '../index/index/#'+ redirectToUrl;
  //         wx.redirectTo({
  //           url: '../login/index?url=' + urlBase,
  //         })
  //       } else {
  //         wx.showModal({
  //           showCancel: false,
  //           content: res.message,
  //           success: (res) => { }
  //         })
  //       }
  //       wx.hideLoading()
  //     }
  //   })

  // },
})