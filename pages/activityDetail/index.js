let app = getApp();
let step = require("../../utils/authorizeRun");
let Utils = require("../../utils/util");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activityId: "",
    detail: {},
    width: 0,
    isLogin: 0,
    code: "",
    isJoin: false,
    showDetail: true,
    percent: 0,
    percentage: 0,
    latestTime: 0,
    reward: 0,
    showAnimation: false,
    canReceivedReward: false,
    self: {},
    heroList: [],
    defaultIcon: app.globalData.imagesUrl + "/images/icon/icon-defult-touxiang.png",
    baseUrl: app.globalData.imagesUrl,
    completeChange: false,
    allReward: 0,
    showDialog: false,
    avatarObjList: app.globalData.avatarObjList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let isLogin = app.globalData.loginSuccess ? 1 : 0;
    let { id = "", title = "活动详情", goodsId = "" } = options;
    let activityId = id || goodsId;
    wx.setNavigationBarTitle({
      title: title,
    });
    this.setData({ activityId, isLogin });
    this.getActivityDetail(activityId, goodsId);
    if (isLogin) {
      this.getUseType();
    }
  },
  // 微信用户  获取微信步数  上传操作
  getWxStepAndUplod: function () {
    this.getWxRunData();
  },
  // 上传步数
  uploadStep: function (stepList){
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/health/data/uploaddata';
    let method = 'POST';
    const data = { bpm: 0,source: "string",type: "MINIP",
      lastTime: new Date().getTime() + "",
      stepsDataModelList: stepList,
    }
    Utils.wxAjax(method,url,data).then(res=>{
      let { activityId } = that.data;
      that.getActivityDetail(activityId);
    })
  },
  getWxRunData: function () {
    step.getWxRunData((data) => {
      if (data.hasOwnProperty("authorize") && !data.authorize) {
        this.setData({ showDialog: true });
        return;
      }
      this.getLatestUploadTime(data);
    });
  },
  // 获取最近上传步数的时间
  getLatestUploadTime: function (data) {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/health/data/query/latestime';
    let method = 'GET';
    Utils.wxAjax(method,url).then(res=>{
        if (res.data.code == 200) {
          var time = Utils.formatTime(new Date(Number(res.data.data)));
          let latestTime = time.split(" ")[0];
          let result = data.find((item) => item.date === latestTime);
          let index = data.indexOf(result);
          let results = data.splice(0, index + 1);
          let stepsDataModelList = results.map((item) => {
            return {
              endTime: item.timestamp,
              startTime: item.timestamp,
              steps: item.step,
            };
          });
          stepsDataModelList.length && that.uploadStep(stepsDataModelList);
        }
    });
  },
  getUseType: function () {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/health/data/ensure/user';
    let method = 'GET';
    Utils.wxAjax(method,url).then(res=>{
        if (res.data.data === 1) {
            that.getWxStepAndUplod();
        }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ showDialog: false });
  },

  getActivityDetail: function (id, goodsId = "") {
    let that = this;
    let url = app.globalData.baseUrl + "/remote/myactivity/detail/" + id;
    let method = 'GET';
    Utils.wxAjax(method,url).then(res=>{
    if (res.data.code == 200) {
        let detail = {
          ...res.data.data,
          content: res.data.data.content,
          ruledescription: res.data.data.ruledescription,
        };
        detail.mileStoneVo.unshift({
          reward: 0,
          mileStoneTarget: 0,
          received: 5,
        });
        // 判断挑战是否完成并且领取积分
        let completeChange = detail.mileStoneVo[detail.mileStoneVo.length - 1].received === 1;
        if (detail.friendRank) {
          let { self = {}, friend = [] } = detail.friendRank;
          let currentStep = detail.friendRank.self.steps;
          that.calcPercent(currentStep, detail.mileStoneVo);
          that.getCanReceiveReward(currentStep, detail.mileStoneVo);
          that.judgeReceivedStatus(detail.mileStoneVo);
          let heroList = that.operateHeroData(friend);
          that.setData({ self, heroList });
        }
        let isJoin = detail.isJoinStatus === "2";
        that.setData({ detail, isJoin, showDetail: !isJoin, completeChange });
        if (!isJoin && goodsId) {
          that.joinActivity();
        }
      }
    })
  },
  calcActivityAllReward: function (arr) {
    let result = 0;
    for (let item of arr) {
      result += item.reward;
    }
    return result;
  },
  judgeReceivedStatus: function (arr) {
    for (let item of arr) {
      // received 表示有积分未领取
      if (item.received === 2) {
        this.setData({ canReceivedReward: true });
      }
    }
  },
  // 领取积分
  receiveReward: function () {
    let that = this;
    let { reward, activityId, detail } = that.data;
    let url = app.globalData.baseUrl + '/remote/myactivity/integral/receive';
    let method = 'POST';
    const data = { activityId,integral: reward};
    Utils.wxAjax(method,url,data).then(res=>{
        if (res.data.code == 200) {
          let mileStoneVos = that.updateTargetStatus(detail.mileStoneVo);
          detail.mileStoneVo = mileStoneVos;
          let completeChange =
            mileStoneVos[mileStoneVos.length - 1].received === 1;
          that.setData({ detail, completeChange, canReceivedReward: false });
          if (!completeChange) {
            that.setData({ showAnimation: true });
            that.refreshReward(activityId); //领取积分之后需要刷排行榜 
          }
          if (completeChange) {
            that.setData({ showAnimation: false });
            let allReward = that.calcActivityAllReward(mileStoneVos);
            wx.navigateTo({
              url: "../challengeComplete/index?id=" + activityId + "&reward=" + allReward,
            });
          }
        }
    })
  },
  // 领取积分之后刷新排行榜积分id
  refreshReward: function(id) {
    let that = this;
    let url = app.globalData.baseUrl + "/remote/myactivity/detail/" + id;
    let method = 'GET';
    Utils.wxAjax(method,url).then(res=>{
    if (res.data.code == 200) {
        let detail = {
          ...res.data.data,
        };
        if (detail.friendRank) {
          let { self = {}, friend = [] } = detail.friendRank;
          let heroList = that.operateHeroData(friend);
          that.setData({ self, heroList });
        }
      }
    })
  },
  // 领取积分之后更新数据的领取状态
  updateTargetStatus: function (arr) {
    return arr.map((item) => {
      return {
        ...item,
        received: item.received === 2 ? 1 : item.received,
      };
    });
  },
  getCanReceiveReward: function (currentStep, arr) {
    let reward = 0;
    for (let item of arr) {
      if (item.received === 2) {
        reward += item.reward;
      }
    }
    this.setData({ reward });
  },
  calcPercent: function (currentNum, arr) {
    let { percent } = this.data;
    let result = null;
    let p = 0;
    if (arr[arr.length - 1].mileStoneTarget >= currentNum) {
      for (let item of arr) {
        if (item.received === 3 && item.mileStoneTarget - currentNum >= 0) {
          result = item;
          break;
        }
      }
      let index = arr.indexOf(result);
      let percent1 = parseInt(100 / (arr.length - 1)) * (index - 1);
      let num =
        (currentNum - arr[index - 1].mileStoneTarget) /
        (arr[index].mileStoneTarget - arr[index - 1].mileStoneTarget).toFixed(
          2
        );
      let percent2 = parseInt(num * (1 / (arr.length - 1)) * 100);
      p = percent1 + percent2;
      p = p > 100 ? 100 : p;
    } else {
      p = 100;
    }
    if (p !== 0 && p === percent) {
      return;
    }
    this.setData({ percent: p });
  },
  userLogin(data) {
    let that = this;
    wx.showLoading({
      title: "loading...",
    });
    const parms = {
      code: this.data.code,
      encrypteData: data.encryptedData,
      iv: data.iv,
    };
    let url =  app.globalData.baseUrl + '/remote/oauth/minipro/login';
    let method ='POST';
    Utils.wxAjax(method,url,parms).then(res=>{
        if (res.data.code === 200) {
          app.globalData.userInfo = res.data.data;
          that.setData({
            isLogin: 1,
          });
          let urlBase = "../activityDetail/index/#" + that.data.activityId;
          wx.redirectTo({
            url: "../login/index?url=" + urlBase,
          });
        } else {
          wx.showModal({
            showCancel: false,
            content: res.message,
            success: (res) => {},
          });
        }
        wx.hideLoading();
    })
  },
  checkAuthorization() {
    wx.getSetting({
      success: (setingres) => {
        wx.hideLoading();
        if (setingres.authSetting["scope.userInfo"]) {
          //已经授权获取用户信息
          wx.getUserInfo({
            success: (res) => {
              this.userLogin(res);
            },
            fail: () => {
              wx.showModal({
                showCancel: false,
                content: "获取用户信息失败,请重试",
                success: (res) => {
                  that.setData({
                    isLogin: 0,
                  });
                },
              });
            },
          });
        }
      },
    });
  },
  onLogin(data) {
    //登录
    wx.showLoading({
      title: "loading...",
    });
    wx.login({
      success: (res) => {
        wx.hideLoading();
        if (res.code) {
          //发起网络请求
          this.setData({
            code: res.code,
          });
          if (this.data.isLogin == 0) {
            this.checkAuthorization();
          } else if (this.data.isLogin == 1) {
            this.userLogin(data);
          }
          //标记登录成功
          app.globalData.loginSuccess = true;
        }
      },
      fail: function (res) {
        wx.showModal({
          showCancel: false,
          content: "登录失败",
        });
      },
    });
  },
  getUserInfo(e) {
    //获取用户信息
    if (e.detail.userInfo) {
      this.onLogin(e.detail);
    }
  },
  joinActivity: function (e) {
    let that = this;
    let { activityId } = that.data;
    let id = (e && e.currentTarget && e.currentTarget.dataset.id) || activityId;
    wx.showToast({ title: "加载中", icon: "loading" });
    let url =  app.globalData.baseUrl + '/remote/myactivity/add';
    let method = 'POST';
    const data = {activityId: id};
    Utils.wxAjax(method,url,data).then(res=>{
      wx.hideToast();
      if (res.data.code == 200) {
        let { activityId } = that.data;
        that.setData({ isJoin: true, showDetail: false });
        that.getActivityDetail(activityId);
        wx.showToast({
          title: "参与成功",
          icon: "successS",
        });
      }
    })
  },
  operateHeroData: function (arr) {
    return arr.map((item) => {
      return {
        ...item,
        completeTime: item.completeTime
          ? Utils.formatTime(new Date(item.completeTime * 1000), true)
          : "",
      };
    });
  },
  // 跳转到挑战结果页面
  navigateActivityResult: function () {
    let { activityId } = this.data;
    wx.navigateTo({
      url: "../activityResult/index?id=" + activityId + "&success=" + true,
    });
  },
  closeModal: function () {
    this.setData({ showDialog: false });
  },
  callback: function () {},
});
