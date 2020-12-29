const app = getApp()
const util = require('./util.js')

function getWxRunData(result) {  //用result往出暴露结果
   //检查登楼状态是否过期
   wx.checkSession({
      success() {
         //session_key 未过期，并且在本生命周期一直有效
         let sessionkey = app.globalData.userInfo.session_key;
         getAllWeRunData(sessionkey, result);
      },
      fail() {
         //重新登录
         restLogin(result);
      }
   })
};

function restLogin(result) {
   wx.login({
      success: (res) => {
         if (res.code) {
            wx.getSetting({
               success: (setingres) => {
                  if (setingres.authSetting['scope.userInfo']) {
                     wx.getUserInfo({
                        success: (res) => {
                           miniproLogin(res.code, res.encryptedData, res.iv, result)
                        },
                        fail: () => {}
                     })
                  }
               }
            })
         }
      },
      fail: function (res) {
         console.log('重新登录fail');
      }
   })
};

//解密登录
function miniproLogin(code, enData, ivData, result) {
   const parms = {
      code: code,
      encrypteData: enData,
      iv: ivData
   }
   wx.request({
      method: 'POST',
      url: app.globalData.baseUrl + '/remote/oauth/minipro/login',
      header: {
         "Content-Type": "application/json;charset=UTF-8",
         "native-app": "mini"
      },
      data: parms,
      success: (res) => {
         if (res.data.code === 200) {
            getAllWeRunData(res.data.data.session_key, result);
         }
      }
   })
};

// 获取微信授权时间
function wxAuthorizedTime() {
    let url =  app.globalData.baseUrl + '/remote/health/data/query/latestime';
    let method = 'GET';
    return util.wxAjax(method,url);
};

// 上传初次授权时间
function postFirstAuthorizedTime() {
    let url = app.globalData.baseUrl + '/remote/data/authorize';
    let method = 'POST';
    let t = new Date();
    let lastTime = t.getTime();
    const data = { lastTime, source: 'MINIP' };
    util.wxAjax(method,url,data).then(res=>{});
};

function getAllWeRunData(sessionkey, result) {
   // 微信授权之后看是否是第一次授权
   wxAuthorizedTime().then((data) => {
      if (data.data.code === 100711) {
         postFirstAuthorizedTime();
      }
   });
   wx.getWeRunData({
      success(resRun) {
          let url =  app.globalData.baseUrl + '/remote/oauth/mini/getEncryptedData';
          let method = 'POST';
          const data = { encryptedData: resRun.encryptedData, iv: resRun.iv, sessionkey: sessionkey };
          util.wxAjax(method,url,data).then(resDecrypt =>{
               // 微信授权成功
               if (resDecrypt.data.data.length > 0) {
                  let runData = JSON.parse(resDecrypt.data.data);
                  if (runData.stepInfoList.length > 0) {
                     runData.stepInfoList = runData.stepInfoList.reverse()
                     for (var i in runData.stepInfoList) {
                        runData.stepInfoList[i].date = util.formatTime(new Date(runData.stepInfoList[i].timestamp * 1000)).split(' ')[0]
                     }
                  }
                  result(runData.stepInfoList)
               }
         });
      },
      fail: function (e) {
         console.log('e',e);
         let errMsgCancel = 'getWeRunData:fail cancel';
         if(e.errMsg.includes('getWeRunData:fail')){
            wx.getSystemInfo({
               success: function(info) {
                  // 如果安卓手机就显示弹窗
                  if(!info.model.includes('iPhone')){
                     wx.showModal({
                          content: '您未开通微信运动，请关注"微信运动"公众号后重试',
                          confirmText: "关闭",
                          showCancel: false,
                          confirmColor: '#576B95',
                          success: function () {
                             console.log('我是点关闭的时候');
                          }
                     })
                  }
              }
            })
         }else if(e.errMsg === errMsgCancel){
            return;
         }else{
            result({authorize:false});  //拒绝授权
         }
      }
   })
};

module.exports = {
   getWxRunData: getWxRunData
}