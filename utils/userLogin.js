const app = getApp();
const newState = {
  loginSuccess: false,
  newUserInfo: null,
  isLoginState: 0,
};
function onLogin(result, data, isLogin, redirectToUrl) {
  //登录
  wx.showLoading({
    title: "loading...",
  });
  wx.login({
    success: (res) => {
      wx.hideLoading();
      if (res.code) {
        //发起网络请求
        if (isLogin === 0) {
          checkAuthorization(result, res.code, redirectToUrl);
        } else if (isLogin === 1) {
          userLogin(result, data, res.code, redirectToUrl);
        }
        //标记登录成功
        newState.loginSuccess = true;
        result(newState);
      }
    },
    fail: function (res) {
      wx.showModal({
        showCancel: false,
        content: "登录失败",
        success: (res) => {},
      });
    },
  });
}
function userLogin(result, data, code, redirectToUrl) {
  wx.showLoading({
    title: "loading...",
  });
  const parms = {
    code: code,
    encrypteData: data.encryptedData,
    iv: data.iv,
  };
  wx.request({
    method: "POST",
    url: app.globalData.baseUrl + "/remote/oauth/minipro/login",
    header: {
      "Content-Type": "application/json;charset=UTF-8",
      "native-app": "mini",
    },
    data: parms,
    success: (res) => {
      if (res.data.code === 200) {
        newState.newUserInfo = res.data.data;
        newState.isLoginState = 1;
        
        app.globalData.sessionFail = false;  //标记是否被逼下线
        result(newState);
        let url = "";
        if (redirectToUrl !== "") {
          url = "../login/index?pageTag=" + redirectToUrl;
        } else {
          url = "../login/index?url=" + "../index/index"; //首页授权跳转
        }
        wx.redirectTo({ url: url });
      } else {
        wx.showModal({
          showCancel: false,
          content: res.message,
          success: (res) => {},
        });
      }
      wx.hideLoading();
    },
  });
}
//检测是否已经授权
function checkAuthorization(result, code, redirectToUrl) {
  wx.getSetting({
    success: (setingres) => {
      wx.hideLoading();
      if (setingres.authSetting["scope.userInfo"]) {
        //已经授权获取用户信息
        wx.getUserInfo({
          success: (res) => {
            userLogin(result, res, code, redirectToUrl);
          },
          fail: () => {
            wx.showModal({
              showCancel: false,
              content: "获取用户信息失败,请重新点击底部菜单",
              success: (res) => {
                this.setData({
                  isLogin: 0,
                });
              },
            });
          },
        });
      }
    },
  });
}

module.exports = {
  onLogin: onLogin,
};
