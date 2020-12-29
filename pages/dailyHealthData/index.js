const util = require('../../utils/util');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    health:{
      todaySteps: '--',
      stepRate:'--',
      totalTime:'--',
      calories:'--',
      distance:'--',
      bmi:'--',
      height:'--',  
      weight:'--',
      bpm:'--',
      source:''
    },
    editBlck: false,
    blockForData:{},
    integral:100,
    integralBlock : false,
    tipUpdate: false,  //同步数据
    showAPPData: 0,
    imagesUrl: app.globalData.imagesUrl,
    appName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({ showAPPData: app.healthStep.dataCource });
    if(app.healthStep.SynchronousData){
        that.setData({ tipUpdate : app.healthStep.SynchronousData });
        this.getHealthData();
        this.getHeightWeight();  //身高体重
        that.getQueryintegral();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  onShareAppMessage: function () {},
  getWeRunStepsData: function () {
    let that = this;
    app.healthStep.SynchronousData = true;
    that.setData({
      tipUpdate : app.healthStep.SynchronousData
    })
    that.getHealthData();
    that.getHeightWeight();  //身高体重
    that.getQueryintegral();
  },
  getHealthData() {
    let that = this;
    let url = app.globalData.baseUrl + '/remote/health/data/everyday';
    let method = 'POST';
    wx.showLoading({
      title: 'loading...',
    })
    const parms = {
      date: Date.parse(new Date()) / 1000
    }
    util.wxAjax(method,url,parms).then(res =>{
      if (res.data.code === 200 &&  res.data.data !== null) {
        const {distance,calories,totalTime,bpm,weight,height,source} = res.data.data;

        if(weight > 0 && height > 0){
            let bmiNum = Number(weight) / Math.pow((Number(height) / 100),2);
            res.data.data.bmi = Number(bmiNum.toFixed(1));
        }else{
            res.data.data.bmi = that.data.health.bmi;
        }

        res.data.data.weight = weight == 0 ? '--' : weight;
        res.data.data.height = height == 0 ?  '--' : height;
        res.data.data.bpm = bpm == 0 ?  '--' : bpm;
        res.data.data.distance = distance == 0 ? '--' : distance.toFixed(1);
        res.data.data.calories = calories == 0 ? '--' : calories.toFixed(1);

        that.setData({health: res.data.data});
        that.appDataText(source);
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
  nagigateStep: function() {
    if(!app.healthStep.SynchronousData){
      return;
    }else{
      wx.navigateTo({
        url: '../step/index',
      })
    }
  },
  healthbmi:function(){
    let that = this;
    if(!app.healthStep.SynchronousData){
        return;
    }else{
        let healthProp = JSON.stringify(that.data.health)
        wx.navigateTo({
          url: '../../pages/healthBMI/index?initData='+ healthProp,
        })
    }
  },
  movementData:function(){
    let that = this;
    if(!app.healthStep.SynchronousData){
       return;
    }else{
        if(that.data.health.source ==='HuaWei' || that.data.health.source === 'Huawei'){
            return;
        }else{
          wx.navigateTo({
            url: '../../pages/movementData/index',
          })
        }
    }
  },
  heightWeightFun:function(e){
      let that = this;
      if(!app.healthStep.SynchronousData){
           return;
      }else{
          let flag = e.currentTarget.dataset.id;
          let blockForData = {
            titleTop: flag === 'height' ? '记录身高' : '记录体重',
            blockText: flag === 'height' ? '身高':'体重',
            blockTextAfter: flag === 'height' ? '（厘米）': '（公斤）'
          }
          that.setData({
            editBlck: true, 
            blockForData: JSON.parse(JSON.stringify(blockForData)),
          })
      }
  },
  getHeightWeight:function(){
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/bodyData/search';
    let method = 'GET';
    util.wxAjax(method,url).then(res =>{
        if (res.data.data !== null) {
          const {weight , height} =  res.data.data;
          if(weight> 0  &&  height> 0){
              let bmiNum = Number(weight) / Math.pow((Number(height) / 100),2); 
              res.data.data.bmi = bmiNum.toFixed(1);
          }else{
              res.data.data.bmi = that.data.health.bmi;
          }
          res.data.data.weight =  res.data.data.weight === 0 ?  '--' : res.data.data.weight;
          res.data.data.height =  res.data.data.height === 0 ?  '--' : res.data.data.height;
          that.setData({
              health: Object.assign(this.data.health,res.data.data)
          })
      }
    });
  },
  closeBalck:function(event){
  let that = this;
  if (!event.detail.close){
        that.setData({
          editBlck: false
        })
      this.getHeightWeight(); //身高体重
     }
  },
  //查询用户是否已经获取步数积分
  getQueryintegral: function () {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/integral/queryReceivedStatus';
    let method = 'GET';
    util.wxAjax(method,url).then(res =>{
      // 100412--已经领取积分  200--未领取积分
      if (res.data.code === 200) {
        that.getintegral();
      }
    })
  },
  //领取积分
  getintegral: function () {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/integral/stepAuth';
    let method = 'GET';
    util.wxAjax(method,url).then(res=>{
      if (res.data.code === 200) {
        that.setData({
          integralBlock: app.healthStep.SynchronousData 
        })
      }
    })
  },
  appDataText :function(key){
      switch (key) {
        case 'HuaWei':
          this.setData({appName:'华为运动'});
          break;
        case 'Sensor':
          this.setData({appName:'计步器'});
          break;       
        case 'iOS':
          this.setData({appName:'苹果健康'});
          break;
        case 'Samsung':
          this.setData({appName:'三星'});
          break;
        case 'Huawei':
          this.setData({appName:'华为运动云'});
          break;
        case 'string':
            this.setData({appName:'以下数据来自“微信运动”。'});
            break;
        default:
          break;
      }
      console.log('appName',this.data.appName);
  }
})