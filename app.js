let imagesUrl = 'https://wellness.hangseng.com/images/miniprogram';
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData: {
    userInfo: null,
    userInfoDetail: {
      nickName: '',
      gender: '',
      avatarUrl: '',
      phoneNumber: ''
    },
    runData: null,
    baseUrl:'https://wellness.hangseng.com',
    imagesUrl: 'https://wellness.hangseng.com/images/miniprogram',
    token: '',
    phoneNumber: '',
    isLogin : 0,  //未登录
    loginSuccess: false,
    isWeRunSteps:false,
    isWeRunStepsFail:false,
    isReceiveStatus:false,
    invitationCode:'',  //邀请码
    sessionFail:false,
    avatarObjList: [
      {
        url: imagesUrl + "/images/icon/icon-defult-touxiang.png",
        id: 0,
      },
      {
        url: imagesUrl + "/images/icon/icon-laoshu.png",
        id: 1,
      },
      {
        url: imagesUrl + "/images/icon/iconNiu.png",
        id: 2,
      },
      {
        url: imagesUrl + "/images/icon/iconLaohu.png",
        id: 3,
      },
      {
        url: imagesUrl + "/images/icon/iconTuzi.png",
        id: 4,
      },
      {
        url: imagesUrl + "/images/icon/iconLong.png",
        id: 5,
      },
      {
        url: imagesUrl + "/images/icon/iconShe.png",
        id: 6,
      },
      {
        url: imagesUrl + "/images/icon/iconMa.png",
        id: 7,
      },
      {
        url: imagesUrl + "/images/icon/iconYang.png",
        id: 8,
      },
      {
        url: imagesUrl + "/images/icon/iconHouzi.png",
        id: 9,
      },
      {
        url: imagesUrl + "/images/icon/iconJi.png",
        id: 10,
      },
      {
        url: imagesUrl + "/images/icon/iconGou.png",
        id: 11,
      },
      {
        url: imagesUrl + "/images/icon/iconZhu.png",
        id: 12,
      },
    ]
  },
  firstInit:{ bootImage: true },
  //健康资讯全局变变量的设置
  healthInforData:{
    findMore: true    //发现更多 close按钮的设置
  },
  healthStep:{
    SynchronousData :false,  // 是否已经立即授过权 同步数据
    integralRecord :false,   //标记是否领取
    dataCource: 0,   // 2 app 用户， 1 mini用户
    APPSource: ''   //APP 数据源
  }
})