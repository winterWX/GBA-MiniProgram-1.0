import { formatTime,wxAjax } from "../../utils/util";
const app = getApp();
const authorizeRun = require("../../utils/authorizeRun.js");
Page({
  data: {
     forceNum: false,
     allowRun: false,
     startStatus: false,
     //anBackShow: false,
     startStep: 10000,
     showAPPData: 0, 
     stepsNum:{
        todaySteps: 0,	 //今日步数
        targetSteps: 0,	 //	目标步数
        receiveStatus: 0,	 //领取状态(1:已领,2:未领,3:补领)
        receiveStatusName: 0,	 //	领取描述
        isDone: 0,	 //	完成状态(1:完成,2:未完成)
        isDoneName: 0,	 //	完成描述
        integral: 0	 //	可以领取的积分
     },
     isDone:2,
     everyDayData:{
        distance: 0,
        calories: 0,
        totalTime: 0,
        todaySteps: 0,
        source:'' //数据源
     }, 
     leftDire: 750/2 + 120,
     topDire: 240 / 2,
     flag: false,
     guidance1: false,
     guidance2: false,
     firstInitShow: true,  //第一次进来显示
     iconPath:app.globalData.imagesUrl + '/images/icon-10-points@2x.png',
     dataSyn: false,   //标记数据同步
     optionsFlg:'', // 标识 options id
     imagesUrl: app.globalData.imagesUrl,
     showModal: false,
     hideModal: true,  //模态框的状态  true-隐藏  false-显示
  },
  onLoad:function (options) {
      let that = this;
      that.setData({ showAPPData: app.healthStep.dataCource, optionsFlg : options.id,
                      firstInitShow : app.firstInit.bootImage });
      if(app.firstInit.bootImage){
          that.setData({ flag: true, guidance1:true });
      }else{
          that.linkToPage(options.id);
      }
  },
  onReady: function () {},
  onShow: function () {
    let that = this;
    that.setData({ firstInitShow: app.firstInit.bootImage });
    that.linkToPage(that.data.optionsFlg);
    that.selectComponent('#challengeId').getCurrentList();  //重新刷状态
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {
    let that = this;
    wx.showNavigationBarLoading(); //在当前页面显示导航条加载动画
    if (app.globalData.isWeRunSteps) {
      that.calloutfun();
    }
    setTimeout(function () {
      wx.hideNavigationBarLoading(); //在当前页面隐藏导航条加载动画
      wx.stopPullDownRefresh(); //停止下拉动作
    }, 1000);
  },
  //调用微信运动数据
  calloutfun: function () {
    let that = this;
    let resultData = [];
    authorizeRun.getWxRunData(function (result) {
      if (result.length > 0) {
        resultData = result.splice(0, 1).map((item) => {
          return {
            endTime: item.timestamp + "",
            startTime: item.timestamp + "",
            steps: item.step,
          };
        });
      } else {
        resultData = [];
      }
      that.getUploaddata(resultData);
    });
  },
  onReachBottom: function () {},
  onShareAppMessage: function () {},
  guidanceOne: function () {
    let that = this;
    that.setData({ guidance1: false, guidance2: true });
  },
  guidanceTwo: function () {
    let that = this;
    that.setData({ guidance2: false, flag: false, firstInitShow: false });
    app.firstInit.bootImage = false;
    that.linkToPage(that.data.optionsFlg);
  },
  linkToPage: function (id) {
    let that = this;
    if (id === "allowTo") {
      that.settingDataBtn();
      that.healthEveryday();
      that.getQueryintegral();
    } else if (id === "refusedTo") {
       //that.setWerunStep();
        that.getStepRunData();
    } else if (id === "carryAPPData") {
      that.settingDataBtn();
      that.healthEveryday();
    }
  },
  healthShow: function () {
    wx.navigateTo({
      url: "../../pages/dailyHealthData/index",
    });
  },
  todayIntegral(data) {
    //组件中领取今天的积分
    let that = this;
    that.settingDataBtn();  //更新状态
    that.setData({ forceNum: true });          
  },
  yesterdayIntegral(){  //领取昨天的积分
    let that = this;
    that.settingDataBtn(); //更新状态
  },
  settingDataBtn() {
    let that = this;
    app.healthStep.SynchronousData = true;
    app.globalData.isWeRunStepsFail = true;   //表示已经点儿开启数据访问按钮
    that.getQueryintegral();
    let url = app.globalData.baseUrl + "/remote/today/step/enquiry";
    let data = { souce: "string", type: "MINIP" };
    wxAjax ('POST', url, data).then(res => {
      if (res.data.code === 200) {
        that.setData({ stepsNum: res.data.data });
        if (res.data.data.todaySteps < 10000) {
          that.setData({ startStep: 10000 - res.data.data.todaySteps });
        }
        that.setData({ startStatus: false });
      }
    });
  },
  integralBtn: function () {
    let that = this;
    let url = app.globalData.baseUrl +'/remote/today/receiveIntegral';
    wxAjax ('GET', url).then(res => {
      if(res.data.code === 200){
        that.settingDataBtn();
        that.setData({ forceNum: true }); 
      } 
    })
  },
  healthEveryday: function () {
    var that = this;
    let url = app.globalData.baseUrl + "/remote/health/data/everyday";
    wxAjax ('POST', url, {date: new Date().getTime() + ""}).then(res => {
      if (res.data.code === 200) {
        let { source, distance= 0, calories= 0 } = res.data.data; 
          app.healthStep.APPSource = source;
          res.data.data.distance = distance.toFixed(1);
          res.data.data.calories = calories.toFixed(1);
          that.setData({ everyDayData: res.data.data });
      }
    });
  },
  gotoDailyHeathdata() {
    wx.navigateTo({
      url: "../dailyHealthData/index",
    });
  },

  //查询用户是否已经获取步数积分
  getQueryintegral: function () {
    let that = this;
    let url = app.globalData.baseUrl + "/remote/integral/queryReceivedStatus";
    wxAjax ('GET', url).then(res => {
      // 100412--已经领取积分  200--未领取积分
      if (res.data.code === 200) {
        that.getintegral();
      }
    })
  },
  
  //领取积分
  getintegral: function () {
    let that = this;
    let url = app.globalData.baseUrl + "/remote/integral/stepAuth";
    wxAjax ('GET', url).then(res => {
      if (res.data.code === 200) {
        that.setData({
          forceNum: app.healthStep.SynchronousData,
          allowRun: true,
        });
      }
    });
  },
  stepRunSorce: function () {
    wx.navigateTo({
      url: "../../pages/rankingList/index",
    });
  },
  setWerunStep: function () {
    let that = this;
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting["scope.werun"]) {
          wx.showModal({
            title: "提示",
            content: "今日步数需要微信步数授权",
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    that.getStepRunData();   //开启后 重新获取微信运动步数;
                    that.healthEveryday();
                  },
                });
              } else {
                //不设置
                if (app.globalData.isWeRunStepsFail) {
                  that.settingDataBtn();
                } else {
                  that.setData({ startStatus: true });
                }
              }
            },
          });
        }
      },
    });
  },
  getStepRunData: function () {
    let that = this;
    authorizeRun.getWxRunData(function(result){
        if(result.length > 0){
          //授权成功跳转获取步数
          app.globalData.runData = result;
          app.globalData.isWeRunSteps = true; //标志授权成功
          that.getQueryLatestime(result);
        }else{
          that.setWerunStep();
        }
    })
  },
  //最近上传数据时间查询(query- queryLatestime)|移动端
  getQueryLatestime: function (runData) {
    let that = this;
    let url = app.globalData.baseUrl + "/remote/health/data/query/latestime";
    wxAjax ('GET', url).then(res => {
      if (res.data.code === 200) {
        //最后上传时间戳 和 当前时间戳进行比较
        let time = formatTime(new Date(Number(res.data.data)));
        let latestTime = time.split(" ")[0];
        let result = runData.find((item) => item.date === latestTime);
        let index = runData.indexOf(result);
        let results = runData.splice(0, index + 1).map((item) => {
          return {
            startTime: item.timestamp + "",
            endTime: item.timestamp + "",
            steps: item.step,
          };
        });
        that.getUploaddata(results);
      }
    })
  },
  //刷新的时候上传数据
  getUploaddata: function (runData) {
      let that = this;
      let url = app.globalData.baseUrl + '/remote/health/data/uploaddata';
      let data = {
        bpm: 0,
        source :'string',
        type : 'MINIP',
        lastTime: new Date().getTime() + '',
        stepsDataModelList: runData
      };
      wxAjax ('POST', url, data).then(res => {
        if (res.data.code === 200) {
          that.setData({ guidance1: false, guidance2: false, firstInitShow:false });
          that.settingDataBtn();
        }
      });
    },
    toggleModal: function() {
      this.setData({
        showModal: !this.data.showModal
      })
    },
    leftBlokShow:function () {
      let that = this;
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
