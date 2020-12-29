import { formatNumber, formatTime, wxAjax } from "../../utils/util";
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    active: 4,
    integral: 100,
    received: false, // 用户是否领取过积分
    showAnimation: false,
    isGetReword: false,
    complete: false, // 完成注册标志
    hideFlag: true, //true-隐藏  false-显示
    hideAvatarFlag: true, //true-隐藏  false-显示
    selectedAvatarId: "",
    requiredInput: 5,
    inputedInfoNum: 2,
    optionList: [
      {
        label: "男",
        id: 1,
      },
      {
        label: "女",
        id: 2,
      },
      {
        label: "其他",
        id: 3,
      },
      {
        label: "不提供",
        id: 4,
      },
    ],
    genderMap: {
      1: "男",
      2: "女",
      3: "其他",
      4: "不提供",
    },
    gender: "暂不选择",
    animationData: {}, //
    currentDate: "",
    userInfo: {
      nickName: "",
      gender: "",
      birthday: "不提供",
      avatarUrl: "",
      phone: "",
      email: "未绑定",
      percentage: 0,
      id: "",
    },
    imagesUrl: app.globalData.imagesUrl,
    avatarObjList: app.globalData.avatarObjList
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const currentDate = formatTime(new Date())
      .split(" ")[0]
      .split("/")
      .join("-");
    const {
      nickName,
      gender,
      birthday = "",
      avatarUrl = "",
    } = app.globalData.userInfoDetail;
    const userInfo = {
      nickName,
      avatarUrl,
      gender: gender === 1 ? "男" : "女",
    };
    let received = wx.getStorageSync("received") || false;
    this.setData({
      userInfo: Object.assign(this.data.userInfo, userInfo),
      currentDate,
      received,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.getMyprofileInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let complete = wx.getStorageSync("complete");
    let received = wx.getStorageSync("received");
    this.setData({
      complete,
      received,
    });
    this.getMyprofileInfo(); //页面重新请求
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.setStorageSync("complete", this.data.complete);
    wx.setStorageSync("received", this.data.received);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  getMyprofileInfo: function () {
    let that = this;
    let url =  app.globalData.baseUrl + "/myprofile/homepage/search";
    wxAjax('GET', url).then((res) => {
      const { nickName, gender, phoneNumber} = app.globalData.userInfoDetail;
      let sex = app.globalData.userInfoDetail.gender === 1 ? "男" : "女";
      let userInfo = {};
      let selectedAvatarId = "";
      let received = that.data.received;
      if (res.data.code == 200) {
        const { data: { data: { avatar, birthday, email, gender, mobile = "", completedCount, nickname, id, receive } } } = res;
        let formateDate = birthday ? formatTime(new Date(parseInt(birthday) * 1000)).split(" ")[0].split("/").join("-") : "未选择";
        let displayDate = "未选择";
        if (formateDate !== "未选择") {
          let [a, b, c, d, e, f, g, h, i] = formateDate;
          displayDate = `${a}${b}${c}${d}-${f}${g}`;
        }
        let selectedAvatar = that.data.avatarObjList.find(
          (item) => item.id === avatar
        );
        let phoneNumber = mobile || phoneNumber;
        let [a, b, c, d, e, f, g, h, i, j, k] = phoneNumber;
        let HKMobile = '00000000';
        if(phoneNumber.startsWith('+852') || phoneNumber.length === 12 || phoneNumber.length === 13 || phoneNumber.length === 8) {
          HKMobile = phoneNumber.slice(-8);
        };
        let [l, m, n, o, p, q, r, s] = HKMobile;
        let newMobile =
          phoneNumber.length === 11 && phoneNumber.startsWith('1')
            ? `${a}${b}${c}****${h}${i}${j}${k}`
            : `${l}${m}****${r}${s}`;
        selectedAvatarId = (selectedAvatar && selectedAvatar.id) || "";
        received = receive;
        wx.setStorageSync("received", received);
        if (completedCount === 6) {
          that.setData({
            compelete: true,
          });
          if (!receive) {
            that.setData({
              showAnimation: true,
            });
          }
        }
        userInfo = {
          nickName: nickname || nickName,
          gender: that.data.genderMap[gender] || sex,
          birthday: displayDate,
          avatarUrl: (selectedAvatar && selectedAvatar.url),
          phone: newMobile || "未绑定",
          email: email || "未绑定",
          id: id,
        };
      } else {
        userInfo = {
          nickName: nickName,
          gender: gender === 1 ? "男" : "女",
          birthday: "未选择",
          avatarUrl: avatarUrl,
          phone: phoneNumber || "未绑定",
          email: "未绑定",
        };
      }
      let percentage =
        selectedAvatarId === 13
          ? that.getPercentage(userInfo, true)
          : that.getPercentage(userInfo);
      userInfo.percentage = percentage;
      wx.setStorageSync("complete", percentage === 100);
      that.setData({
        userInfo: userInfo,
        selectedAvatarId,
        received,
        complete: percentage === 100,
      });
    });
  },
  getPercentage: function (userInfo, flag) {
    let { email, ...userInfoItem } = userInfo;
    let keysWithValue = 0;
    let keys = Object.keys(userInfoItem).filter((item) => {
      return !["id", "percentage"].includes(item);
    });
    let allKeys = keys.length;
    const invalidValue = ["未选择", "未绑定", "暂不选择", "保密"];
    for (let key of keys) {
      if (userInfoItem[key] && !invalidValue.includes(userInfoItem[key])) {
        if (flag && key === "avatarUrl") {
          continue;
        } else {
          keysWithValue++;
        }
      }
    }
    this.setData({
      inputedInfoNum: keysWithValue,
      requiredInput: keys.length,
    });
    return keysWithValue <= 0
      ? "0"
      : parseInt((keysWithValue / allKeys).toFixed(2) * 100);
  },
  /* 编辑生日 */
  bindDateChange: function (e) {
    let birthday = e.detail.value.split("-").join("/") || "";
    let birthdayStr = new Date(birthday + '/1').getTime() / 1000;
    let that = this;
    let selectedAvatarId = this.data.selectedAvatarId;
    let url = app.globalData.baseUrl + "/remote/myProfile/edit";
    wxAjax('POST', url, {birthday: birthdayStr,id: this.data.userInfo.id,}).then((res) => {
      if (res.data.code == 200) {
        let userInfo = {
          ...that.data.userInfo,
          birthday: e.detail.value,
        };
        let percentage = selectedAvatarId === 13 ? that.getPercentage(userInfo, true) : that.getPercentage(userInfo);
        userInfo.percentage = percentage;
        let showAnimation = percentage == 100;
        wx.setStorageSync("complete", showAnimation);
        that.setData({
          userInfo,
          showAnimation,
          complete: showAnimation,
        });
      }
    })
  },
  /* 编辑内容的弹框 */
  // 编辑性别
  getOption: function (e) {
    // 注意： 这里要先发送接口 成功后设置页面数据
    let genderValueMap = {
      1: 1,
      2: 2,
      3: 3,
      4: 4,
    };
    let propValue = e.currentTarget.dataset.value;
    let gender = genderValueMap[propValue];
    let that = this;
    let selectedAvatarId = this.data.selectedAvatarId;
    let url = app.globalData.baseUrl + "/remote/myProfile/edit";
    wxAjax('POST', url, {gender: gender,id: this.data.userInfo.id}).then(res => {
      if (res.data.code == 200) {
        let userInfo = {
          ...that.data.userInfo,
          gender: that.data.genderMap[e.currentTarget.dataset.value],
        };
        let percentage =
          selectedAvatarId === 13
            ? that.getPercentage(userInfo, true)
            : that.getPercentage(userInfo);
        userInfo.percentage = percentage;
        let showAnimation = percentage === 100;
        wx.setStorageSync("complete", showAnimation);
        that.setData({
          userInfo: userInfo,
          hideFlag: true,
          showAnimation,
          complete: showAnimation,
        });
      } else {
        that.setData({
          hideFlag: true,
        });
      }
    })
    .catch(() => {
      this.setData({
        hideFlag: true,
      });
    })
  },
  // 点击选项
  getAvatarOption: function (e) {
    // 注意： 这里要先发送接口 成功后设置页面数据
    let id = e.currentTarget.dataset.value;
    let avatar = this.data.avatarObjList.find((item) => item.id === id);
    let that = this;
    let url = app.globalData.baseUrl + "/remote/myProfile/edit";
    wx.showToast({
      icon: "loading",
    });
    wxAjax('POST', url, {avatar: id,id: this.data.userInfo.id}).then((res) => {
      if (res.data.code == 200) {
        let userInfo = {
          ...that.data.userInfo,
          avatarUrl: avatar.url,
        };
        let percentage =
          avatar.id === 13
            ? that.getPercentage(userInfo, true)
            : that.getPercentage(userInfo);
        let showAnimation = percentage === 100;
        wx.setStorageSync("complete", showAnimation);
        userInfo.percentage = percentage;
        that.setData({
          userInfo: userInfo,
          hideAvatarFlag: true,
          selectedAvatarId: avatar.id,
          showAnimation,
          complete: showAnimation,
        });
        wx.showToast({
          title: "头像修改成功",
        });
      } else {
        that.setData({
          hideAvatarFlag: true,
        });
      }
    })
    .catch(() => {
      this.setData({
        hideAvatarFlag: true,
      });
    });
  },
  //取消
  mCancel: function (e) {
    var that = this;
    that.hideModal(e);
  },

  // ----------------------------------------------------------------------modal
  // 显示遮罩层
  showModal: function (e) {
    var that = this;
    if (e.target.dataset.name === "gender") {
      that.setData({
        hideFlag: false,
      });
    } else if (e.target.dataset.name === "avatar") {
      that.setData({
        hideAvatarFlag: false,
      });
    }
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间
      timingFunction: "ease", //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    });
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn(); //调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100);
  },

  // 隐藏遮罩层
  hideModal: function (e) {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间 默认400ms
      timingFunction: "ease", //动画的效果 默认值是linear
    });
    this.animation = animation;
    that.slideDown(); //调用动画--滑出
    var time1 = setTimeout(function () {
      if (e.target.dataset.name === "gender") {
        that.setData({
          hideFlag: true,
        });
      } else {
        that.setData({
          hideAvatarFlag: true,
        });
      }
      /*  that.setData({
         hideFlag: true
       }) */
      clearTimeout(time1);
      time1 = null;
    }, 220); //先执行下滑动画，再隐藏模块
  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step(); // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export(),
    });
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(300).step();
    this.setData({
      animationData: this.animation.export(),
    });
  },
  nickNameChange: function () {
    let that = this;
    wx.navigateTo({
      url: `/pages/modifyNickname/index?id=${that.data.userInfo.id}&nickName=${that.data.userInfo.nickName}`,
    });
  },
  emaidEdit: function () {
    let that = this;
    wx.navigateTo({
      url: `/pages/emailEditor/index?email=${that.data.userInfo.email}`,
    });
  },
  // 领取积分
  rewardIntegral: function () {
    let that = this;
    let url = app.globalData.baseUrl + "/remote/myprofile/homepage/rewardIntegral";
    wxAjax('GET', url).then(res => {
      if (res.data.code == 200) {
        that.setData({
          received: true,
          isGetReword: true,
          showAnimation: true,
        });
        wx.setStorageSync("received", true);
      }
    })
  },
});
