const app = getApp();
const util = require('../../utils/util');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLogin: 0, //0还未授权获取用户信息，1已经授权获取用户信息，2已经授权获取电话号码，3是已经登录
    bottomFlaotShow: true,
    contentAll:{},
    colletArt: '', //收藏状态
    articleId: -1,
    integralNum: 0, //积分
    integraFlg:false,
    imagesUrl: app.globalData.imagesUrl,
    baseUrl: app.globalData.baseUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     let that = this;
     that.tokenOnLoad();
     that.articleDetail(options.goodsId);
     that.setData({
       articleId: options.goodsId
     })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //当页面加载完成后
    //登录后领取积分
    let that = this;
    if (that.data.isLogin === 3) {  //已经登录，可以领取积分
      that.everyDayIntegral();
    }
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
  onShareAppMessage: function () {

  },
  tokenOnLoad:function(){
    var that = this;
    if (app.globalData.token !== '') {
      that.setData({
        isLogin: 3
      })
    } else if (app.globalData.userInfo !== null) {
      that.setData({
        isLogin: 1
      })
    }
    if (that.data.isLogin === 3){
      that.setData({
        bottomFlaotShow: false   //是否显示登录按钮  true为显示，false 为不显示
      })
    }
  },
  //读文章领取积分
  everyDayIntegral:function(){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/article/collection/getArticlePoint';
    let method = 'POST';
    const data = {"points": '10',"articleId": that.data.articleId };
    if (that.data.isLogin === 3) {
      util.wxAjax(method,url,data).then(res =>{
        if (res.data.code == 200) {
          that.recordIntegral();
        }
      });
    }
  },
  //阅读记录
  recordIntegral: function () {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/article/collection/storageRecord?articleId=' + that.data.articleId;
    let method = 'GET';
    util.wxAjax(method,url).then(res=>{
        if (res.data.code == 200) {
          that.setData({ integraFlg: true, integralNum: 10 });
        }
    })
  },
  //收藏接口
  colletArtDaitle:function(){
      let that = this;
      let url =  app.globalData.baseUrl + '/remote/article/collection/add';
      let method = 'POST';
      const data = {"articleId": that.data.articleId };
      if (that.data.isLogin === 3){
        util.wxAjax(method, url, data).then(res =>{
          if (res.data.code == 200) {
              that.setData({ colletArt: '1' //表示收藏成功
            })
          }
        })
      }
  },
  //取消收藏接口
  cancelColletArtDaitle: function () {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/article/collection/delete';
    let method = 'DELETE';
    const data = { "articleId": that.data.articleId };
    if (that.data.isLogin === 3) {
      util.wxAjax(method, url, data).then(res=>{
          if (res.data.code == 200) {
              that.setData({
                colletArt: '2'  //表示取消收藏
              })
          }
      })
    }
  },
  //文章详情接口
  articleDetail:function(listNum){
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/article/collection/detail?id='+listNum;
    let method = 'GET';
    let { baseUrl } = this.data;
    util.wxAjax(method,url).then(res=>{
      if(res.data.data !== null){
        res.data.data.createTime = that.timestampToTime(res.data.data.createTime);
        var deleteString = '';
        String.prototype.replaceAll = function (FindText, RepText) {
          return this.replace(new RegExp(FindText, "g"), RepText);
        }
        deleteString = res.data.data.tags.replaceAll('#', '');
        res.data.data.tags = deleteString;

        var baseUrl = `${baseUrl}/upload`;
        String.prototype.replaceAll = function (FindText, RepText) {
          return this.replace(new RegExp(FindText, "g"), RepText);
        }
        if(res.data.data.content.indexOf('../upload') > -1){
          res.data.data.content = res.data.data.content.replaceAll('../upload', baseUrl);
        }
        that.setData({
          contentAll : res.data.data,
          colletArt: res.data.data.isCollect   //收藏状态
        })
      }
    })
  },
  //检测是否已经授权  
  checkAuthorization() {     
      wx.getSetting({
        success: (setingres) => {
          wx.hideLoading()
          if (setingres.authSetting['scope.userInfo']) { //已经授权获取用户信息             
            wx.getUserInfo({
              success: (res) => {
                this.userLogin(res)
              },
              fail: () => {
                wx.showModal({
                  showCancel: false,
                  content: '获取用户信息失败,请重新点击底部菜单',
                  success: (res) => {
                    this.setData({
                      isLogin: 0
                    })
                  }
                })
              }
            })
          }
        }
      })
    },
  onLogin(data) { //登录
    wx.showLoading({
      title: 'loading...',
    })
    wx.login({
      success: (res) => {
        wx.hideLoading()
        if (res.code) {
          //发起网络请求
          this.setData({
            code: res.code
          })
          if (this.data.isLogin == 0) {
            this.checkAuthorization()
          } else if (this.data.isLogin == 1) {
            this.userLogin(data)
          }
          //标记登录成功
          app.globalData.loginSuccess = true;
        }
      },
      fail: function (res) {
        wx.showModal({
          showCancel: false,
          content: '登录失败',
          success: (res) => {

          }
        })
      }
    })
  },
  getUserInfo(e) { //获取用户信息
    if (e.detail.userInfo) {
      this.onLogin(e.detail)
    }
  },
  userLogin(data) {
    let that = this;
    wx.showLoading({
      title: 'loading...',
    })
    let url =  app.globalData.baseUrl + '/remote/oauth/minipro/login';
    let method = 'POST';
    const parms = {
      code: that.data.code,
      encrypteData: data.encryptedData,
      iv: data.iv
    }
    util.wxAjax(method,url,parms).then(res =>{
        if (res.data.code === 200) {
          app.globalData.userInfo = res.data.data
          that.setData({ isLogin: 1 });
          let urlBase = '../HealthInforDetails/index/#' + that.data.contentAll.id;
          wx.redirectTo({ url: '../login/index?url=' + urlBase });
        } else {
          wx.showModal({
            showCancel: false,
            content: res.message,
            success: (res) => { }
          })
        }
        wx.hideLoading()
    })
  },
  
  timestampToTime: function (timestamp) {
    var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return  Y + M + D + '，' + h + m;
  },
  onShareAppMessage: function (options) {
    let shareObj = {
      　　　　title: "",
      path: '../../ pages/HealthInforDetails/index',
      imageUrl: '/images/tabBar/timg.jpg',
      　　　　success: function (res) {
        　　　　　　// 转发成功之后的回调
        　　　　　　if (res.errMsg == 'shareAppMessage:ok') {
        　　　　　　}
      　　　　},
      　　　　fail: function () {
        　　　　　　// 转发失败之后的回调
        　　　　　　if (res.errMsg == 'shareAppMessage:fail cancel') {
          　　　　　　　　// 用户取消转发
        　　　　　　} else if (res.errMsg == 'shareAppMessage:fail') {
          　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
        　　　　　　}
      　　　　}
      // 　complete:fucntion(){
      // 　// 转发结束之后的回调（转发成不成功都会执行）
      // 　}
    　　}
    　　// 来自页面内的按钮的转发
    　　if (options.from == 'button') {
      let eData = options.target.dataset;
      　　　　// 此处可以修改 shareObj 中的内容
      　　　　shareObj.path = '/pages/btnname/btnname?btn_name=' + eData.name;
    　　}
    　　// 返回shareObj
    　　return shareObj;
  },
})