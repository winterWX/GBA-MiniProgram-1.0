const app = getApp();
Component({
  options: {
    styleIsolation: 'shared',
  },
  /**
   * 组件的属性列表
   */
  properties: {
    active: {
      type: Number,
      value: 0,
      observer(value){
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    menu: [{
        "text": "首页",
        "iconPath": app.globalData.imagesUrl + '/images/tabBar/index_on@3x.png',
        "activeIconPath": app.globalData.imagesUrl + "/images/tabBar/index_on.png",
        "url": "../index/index",
        "requiredLogin": false
      },
      // {
      //   "text": "理财健康",
      //   "iconPath": app.globalData.imagesUrl + "/images/tabBar/inquiry_default.png",
      //   "activeIconPath": app.globalData.imagesUrl + "/images/tabBar/inquiry.png",
      //   "url": "../medicalServices/index",
      //   "requiredLogin": true
      // },
      //  app.json 需加      "pages/medicalServices/index",
      {
        "text": "我的",
        "iconPath": app.globalData.imagesUrl + "/images/tabBar/mine_default.png",
        "activeIconPath": app.globalData.imagesUrl + "/images/tabBar/mine.png",
        "url": "../mine/index",
        "requiredLogin": true
      }
    ],
    isLogin: 0,   //0还未授权获取用户信息，1已经授权获取用户信息，2已经授权获取电话号码，3是已经登录
    requiredLogin: false,
    code: '',
    tempActive: 0
  },
  lifetimes: { // 生命周期
    ready: function() {
      if (app.globalData.token !== '') {
        this.setData({
          isLogin: 3
        })
      } else if (app.globalData.userInfo !== null) {
        this.setData({
          isLogin: 1
        })
      }
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
      this.setData({ active: event.detail, tempActive: this.data.active });
      const item = this.data.menu[event.detail]
      if (item.requiredLogin && app.globalData.token == '') {
        this.setData({ requiredLogin: true });
        if (app.globalData.userInfo !== null) {
          this.setData({ isLogin: 1 });
          wx.navigateTo({
            url: '../login/index?url=' + this.data.menu[this.data.active].url,
          })
        }
      } else {
        if (event.detail !== this.data.tempActive) {
          wx.redirectTo({
            url: item.url,
            complete: function() {}
          })
        }
      }
    },
    checkAuthorization() { //检测是否已经授权      
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
        fail: function(res) {
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
      } else {
        this.setData({
          active: this.data.tempActive
        });
      }
    },

    userLogin(data) {
      wx.showLoading({
        title: 'loading...',
      })
      const parms = {
        code: this.data.code,
        encrypteData: data.encryptedData,
        iv: data.iv
      }
      wx.request({
        method: 'post',
        url: app.globalData.baseUrl + '/remote/oauth/minipro/login',
        header: {
          "Content-Type": "application/json;charset=UTF-8",
          "native-app": "mini"
        },
        data: parms,
        success: (res) => {
          if (res.data.code === 200) {
            app.globalData.sessionFail = false;  //标记是否被逼下线
            app.globalData.userInfo = res.data.data
            app.globalData.userInfoDetail = data.userInfo || res.data.data;
            this.setData({
              isLogin: 1
            })
            wx.navigateTo({
              url: '../login/index?url=' + this.data.menu[this.data.active].url,
            })
          } else {
            wx.showModal({
              showCancel: false,
              content: res.message,
              success: (res) => {}
            })
          }
          wx.hideLoading()
        }
      })

    },
  }
})