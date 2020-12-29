import { wxAjax } from "../../utils/util";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    complete: false,
    active: 1,  //下标
    typeFlg:'',
    userInfo: {},
    countNum: '0%',
    windowHeight: wx.getSystemInfoSync().windowHeight *2,
    avatar: 13,
    color: 'copper',
    activityCount: 0,
    hideModal: true,  //模态框的状态  true-隐藏  false-显示
    titleText: false,
    baseUrl: app.globalData.imagesUrl,
    avatarObjList: app.globalData.avatarObjList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.getMyprofileInfo();
    that.getActivityList();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let complete = wx.getStorageSync('complete');
    that.setData({complete, active: 1 });
    that.getMyprofileInfo();
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
  sendFriend: function () {
    wx.navigateTo({
      url: '../../pages/recommend/index'
    })
  },
  profilePage: function () {
    wx.navigateTo({
      url: '../../pages/profile/index'
    })
  },
  navigateMyActivity: function () {
    wx.navigateTo({
      url: '../../pages/myActivity/index'
    })
  },
  settingPage: function () {
    wx.navigateTo({
      url: '../../pages/setting/index'
    })
  },
  addFriend: function () {
    wx.navigateTo({
      url: '../../pages/addFriend/index'
    })
  },
  // 会员等级
  silverDetail: function () {
    wx.navigateTo({
      url: '../../pages/silverDetail/index'
    })
  },
  myProfilerEdit: function () {
    wx.navigateTo({
      url: '../../pages/profile/index'
    })
  },
  integralDetails: function () {
    wx.navigateTo({
      url: '../../pages/integralDetails/index'
    })
  },
  messageCenter: function() {
    wx.navigateTo({
      url: '../messageCenter/index'
    })
  },
  navigateCoupons: function() {
    wx.navigateTo({
      url: '../myCoupons/index'
    })
  },
  aboutUser: function() {
    wx.navigateTo({
      url: '../aboutUs/index'
    })
  },
  
getMyprofileInfo: function () {
  let that = this;
  let colorMap = {
    1: 'copper',
    2: 'silver',
    3: 'gold'
  }
  let url = app.globalData.baseUrl + '/myprofile/homepage/search';
  wxAjax('GET', url).then(res => {
    if (res.data.code == 200) {
      let userInfo = res.data.data;
      let color = colorMap[userInfo.level]
      let avatar = userInfo.avatar || 13;
      that.setData({userInfo, avatar, color});
      that.setData({countNum: res.data.data.completedCount === 5 ? 100 + '%' : parseInt((5-res.data.data.completedCount) * (100/5)) + '%'})
    } 
  })
},
getActivityList: function () {
  let that = this;
  // wx.showToast({ title: '加载中', icon: 'loading' });
  let url = app.globalData.baseUrl + '/remote/myactivity/list';
  let data = {
    currentPage: 1,
    pageSize: 10,
    "status": [
      {
        "status": 1
      },
      {
        "status": 2
      }
    ]
  };
  wxAjax('POST', url, data).then(res => {
    if (res.data.code == 200) {
      let activityCount = res.data.totalCount;
      that.setData({ activityCount});

    }
  })
},
textShowMain:function (e) {
  let that = this;
  if(e.currentTarget.dataset.flag === 'about'){
    that.setData({titleText: true});
  }else{
      that.setData({titleText: false});
  }
  that.setData({ hideModal: false })
  let animation = wx.createAnimation({
    duration: 100,//动画的持续时间 默认600ms   数值越大，动画越慢   数值越小，动画越快
    timingFunction: 'ease',//动画的效果 默认值是linear
  })
  this.animation = animation
  setTimeout(function () {
    that.fadeIn();  //调用显示动画
  }, 100)
},
// 隐藏遮罩层
hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 100,  //动画的持续时间 默认800ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: 'ease',  //动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown();//调用隐藏动画   
    setTimeout(function () {
      that.setData({ hideModal: true })
    }, 100)  //先执行下滑动画，再隐藏模块
  },
//动画集
fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()  //动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
fadeDown: function () {
    this.animation.translateY(1000).step()
    this.setData({ animationData: this.animation.export()})
},
closePage:function(){
  let that =this;
  that.fadeDown();
  that.setData({ hideModal: true })
 }
})