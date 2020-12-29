//获取应用实例
const app = getApp();
const util = require('../../utils/util');
const userLogin = require('../../utils/userLogin.js');
const authorizeRun = require('../../utils/authorizeRun.js');
Page({
  data: {
    isLogin: 0, // 0还未授权获取用户信息，1已经授权获取用户信息，2已经授权获取电话号码，3是已经登录
    active: 0,
    successFlg: false,
    allowTo: 'allowTo',
    refusedTo: 'refusedTo',
    carryAPPData: 'carryAPPData',
    indexStep: true,
    redirectToUrl: '', //调转的标记
    stepsNum:{},
    runDataText: 0,
    rejectRun: false, //拒绝授权
    showDialog: false,
    levelNum: 0,
    levelNumShow: true,
    isAppData: false,  //是否是APP用户
    imagesUrl: app.globalData.imagesUrl,
    forceNum: false  //是否已经领过积分
  },
  onLoad: function (options) {
    let that = this;
    if (options.flag === 'true'){   //是 true
      that.setData({ successFlg: true });
    }
    if(app.globalData.isLogin === 3){
      that.setData({ isLogin: app.globalData.isLogin });
      that.getState();
      that.checkIsAppUser();  //调用数据源，App数据优先；
    }
    that.homePageInit();
    that.userLevel();
  },
  onShow: function () {
    let that = this;
    that.setData({ active: 0 });
    that.getState();
  },
  onPullDownRefresh: function () {
    let that = this;
    if(app.globalData.isLogin === 3){
        wx.showNavigationBarLoading();    //在当前页面显示导航条加载动画
        if(app.globalData.isWeRunSteps){
          that.calloutfun();
        }
        setTimeout(function(){
            wx.hideNavigationBarLoading();    //在当前页面隐藏导航条加载动画
            wx.stopPullDownRefresh();    //停止下拉动作
        },1000)
    }else{
        wx.hideNavigationBarLoading();    //在当前页面隐藏导航条加载动画
        wx.stopPullDownRefresh();    //停止下拉动作
    }
  },
  //调用微信运动数据
  calloutfun:function(){
      let that = this;
      let resultData = [];
      authorizeRun.getWxRunData(function(result){
        if(result.length > 0){
            resultData = result.splice(0,1).map(item=>{
                return {
                    endTime: item.timestamp + '',
                    startTime: item.timestamp + '',
                    steps: item.step
                }
            })
        }else{
          resultData = [];
        }
        that.getUploaddata(resultData);
    })
  },
  prograNum:function(){
    wx.navigateTo({
      url: '../healthPage/index?id='+ that.data.allowTo
    })
  },
  onShareAppMessage: function () {},
  checkIsAppUser:function(){
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/health/data/ensure/user';
    let method = 'GET';
    util.wxAjax(method,url).then(res=>{
        if (res.data.code === 200) {
          that.setData({ isAppData: res.data.data === 2 ? true : false });   // 2 app 用户，1 mini用户
          app.healthStep.dataCource = res.data.data;    // 数据源
          if(!that.data.isAppData){
             that.getStepRunData();
          }else{
             that.stepRunState();
          }
        }
    });
  },
  parentCallBack: function (event){
     let that = this;
    if (event.detail.handleSuccess){
      that.setData({ successFlg: false });
    }
  },
  myfindPage:function(){
    wx.navigateTo({
      url: '../../pages/HealthInformation/index',
    })
  },
  challengePage:function(){
    wx.navigateTo({
      url: '../../pages/challenge/index',
    })
  },
  navigateToStep: function() {
    let that = this;
    if(that.data.isAppData){
      that.carryAPPData();
    }else{
      if (app.globalData.isWeRunSteps) {
          that.healthSccuss();
      } else {
          that.healthFail();
      }
    }
  },
  carryAPPData:function(){
      let that = this;
      wx.navigateTo({
        url: '../../pages/healthPage/index?id=' + that.data.carryAPPData
      })
  },
  healthSccuss:function(){
      let that = this;
      wx.navigateTo({
        url: '../../pages/healthPage/index?id=' + that.data.allowTo
      })
  },
  healthFail:function(){
      let that = this;
      wx.navigateTo({
        url: '../../pages/healthPage/index?id=' + that.data.refusedTo
      })
  },
  getUserInfo:function(e) { //获取用户信息
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
  //获取运动步数
  getStepRunData: function () {
    let that = this;
    authorizeRun.getWxRunData(function(result){
        if(result.length > 0){
          //授权成功跳转获取步数
          app.globalData.runData = result;
          app.globalData.isWeRunSteps = true; //标志授权成功
          that.getQueryLatestime(result);
        }else{
          //拒绝授权
          that.setData({ rejectRun: true }); 
          that.setWerunStep();
        }
    })
  },
  //最近上传数据时间查询(query- queryLatestime)|移动端
  getQueryLatestime: function (runData) {
      let that = this;
      let url =  app.globalData.baseUrl + '/remote/health/data/query/latestime';
      let method = 'GET';
      util.wxAjax(method,url).then(res =>{
          if (res.data.code === 200) {
              //最后上传时间戳 和 当前时间戳进行比较
              let time = util.formatTime(new Date(Number(res.data.data)));
              let latestTime = time.split(' ')[0];
              let result = runData.find(item => item.date === latestTime);
              let index = runData.indexOf(result);
              let results = runData.splice(0, index + 1).map(item=>{
                  return {
                      startTime: item.timestamp + '',
                      endTime: item.timestamp + '',
                      steps: item.step
                  }
              });
              that.getUploaddata(results);
          }
      })
  },
  //运动数据同步上传
  getUploaddata: function (runData) {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/health/data/uploaddata';
    const data = { bpm: 0,source :'string',
          type : 'MINIP',lastTime: new Date().getTime() + '',
          stepsDataModelList: runData
        };
    let method = 'POST';
    util.wxAjax(method,url,data).then(res =>{
        if (res.data.code === 200) {
            that.stepRunState();   //刷新步数接口
        }
    });
  },
  stepRunState:function(){
    let that = this;
    let method ='POST';
    let url = app.globalData.baseUrl +'/remote/today/step/enquiry';
    const data = {souce:'string', type:'MINIP'};
    util.wxAjax(method,url,data).then(res =>{
        if(res.data.code === 200){
            that.setData({
              stepsNum: res.data.data,
              runDataText: res.data.data.todaySteps >= 10000 ? 10000 : 10000 - Number(res.data.data.todaySteps),
              rejectRun: false
            });
        }
    })
  },
  homePageInit: function () {
    let that = this;
    let method = 'GET';
    let url = app.globalData.baseUrl +'/remote/homePage/homePageActivitys';
    let { imagesUrl } = this.data;
    util.wxAjax(method,url).then(res =>{
      if (res.data.code === 200) {
        res.data.data.activity = res.data.data.activity.sort((a, b)=>{return parseInt(a.type) - parseInt(b.type)}).map((item,index) =>{
            return {
                ...item,
                title: item.type === '1' ? '步数挑战赛' : '想测试一下你的健康知识吗？',
                description: item.type === '1' ? '完成挑战轻松赢取积分' : '立即参与答题赢取积分',
                coverImage: item.type === '1' ? `${imagesUrl}/images/index/rectangle@3x.png` : `${imagesUrl}/images/index/banner-3@3x.png`,
                createTime : item.createTime ? util.timestampToTimeHM(item.createTime) : ''
            }
        });
        res.data.data.article = res.data.data.article.map(item =>{
            return {
              ...item,
              thumb: typeof item.thumb == 'number' ? '' : item.thumb,
              inputtime : item.inputtime ? util.timestampToTimeHM(item.inputtime) : ''
            }
        });
        that.setData({homeAllData: res.data.data});
      }
    })
  },
  userLevel:function(){
    let that = this;
    let method = 'GET';
    let url = app.globalData.baseUrl +'/remote/homePage/userlevel';
    util.wxAjax(method,url).then(res =>{
      if (res.data.code === 200) {
          that.setData({levelNum:res.data.data});
        if(res.data.data === 3 || res.data.data === 5){
          that.setData({levelNumShow : false});
        }
      }
    })
  },

  //领取状态
  getState: function () {
    let that = this;
    let url = app.globalData.baseUrl + "/remote/today/step/enquiry";
    util.wxAjax ('POST', url, {souce: "string", type: "MINIP"}).then(res => {
      if (res.data.code === 200) {
        let {receiveStatus,isDone} = res.data.data;
        if(receiveStatus == 1 && isDone == 1){
          that.setData({ forceNum:true });
        }
      }
    });
  },

  membership:function(){
    let that = this;
    if(app.globalData.isLogin !== 3){
        return;
    }else{
      if(that.data.levelNum === 1){
          wx.navigateTo({ url: '../../pages/strategy/index'});
      }else if(that.data.levelNum === 2 || that.data.levelNum === 4){
          wx.navigateTo({ url: '../../pages/goldStrategy/index'});
      }
    }
  },
  listClick(e){
      let goodsId = e.currentTarget.dataset.id;      
      wx.navigateTo({                                 
        url: '../../pages/HealthInforDetails/index?goodsId='+ goodsId      
      })
  },
  listChange(e){
      let {type,id,title} = e.currentTarget.dataset.item;
    if(type === '1'){
        wx.navigateTo({
          url: '../activityDetail/index?id=' + id + '&title=' + title
        })
      }else{
        wx.navigateTo({                                 
          url: '../../pages/healthKnowledge/index?id=' + id
        })
      }
  },
  setWerunStep:function(){
    let that = this;
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.werun']) {
          wx.showModal({
            title: '提示',
            content: '今日步数需要微信步数授权',
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    that.getStepRunData();  //开启后 重新获取微信运动步数；
                  }
                })
              }
            }
          })
        }
      }
    })
  }
})
