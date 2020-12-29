import { wxAjax } from "../../utils/util";
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    copyWriting:[],
    enjoyCopywriting:[],
    tierInfo:{},
    hideModal: true,  //模态框的状态  true-隐藏  false-显示
    whatHangsheng:false,
    imagesUrl: app.globalData.imagesUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
     this.initPage();
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  initPage: function (param){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/copywriting/findMemberCopy';
    wxAjax('POST', url, {
      flag : 2,
      level : 4
    }).then(res => {
      if(res.data.code === 200){
        that.setData({
            copyWriting : res.data.data.copyWriting,
            enjoyCopywriting : res.data.data.enjoyCopywriting,
            tierInfo : res.data.data.tierInfo
        })
      }
    })
  },
  btnNetoPage:function(){
    wx.redirectTo({
      url: '../../pages/membership/index',
    })
  },
  goldPage:function(){
    wx.navigateTo({
      url: '../../pages/goldStrategy/index',
    })
  },
  activePage:function(){
    wx.redirectTo({
      url: '../../pages/challenge/index',
    })
  },
  textShowMain:function (e) {
      let that = this;
      if(e.currentTarget.dataset.show === 'text'){
          that.setData({whatHangsheng: true});
      }else{
          that.setData({whatHangsheng: false});
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
  },
})