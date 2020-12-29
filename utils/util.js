let app = getApp();
const formatTime = (date, flag = false) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  let paddingTime = [year, month, day].map(formatNumber);
  let result = paddingTime.join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
  if (flag) {
    let [y, m, d] = paddingTime;
    result = `${y}年${m}月${d}日 ${[hour, minute, second].map(formatNumber).join(':')}`
  };
  return result;
}

const timestampToTime = date => {
  // const date = new Date(timestamp * 1000); 
  const Y = date.getFullYear() + '-';
  const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
  return  Y + M + D;
}
const timestampToTimeHM = (timestamp) =>{
    const date = new Date(timestamp * 1000);  
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + '，' + h + m;
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const wxAjax = (method, url, data = {}) => {
  //let sessionFail = wx.getStorageSync('sessionFail') || false;
  return new Promise((resolve, reject) => {
    let params = {
      method: method,
      url: url,
      header: {
        "Content-Type": "application/json;charset=UTF-8",
        "token": app.globalData.token,
        "native-app": "mini"
      },
      success: (res) => {
       if (!app.globalData.sessionFail && (res.data.code === 999988 || res.data.code === 999997 || res.data.code === 999995 || res.data.code === 999994)) {
          //wx.setStorageSync('sessionFail', true);
          app.globalData.sessionFail = true; //标记已经被逼下线   
          app.globalData.userInfo = null;
          app.globalData.token = '';
          app.globalData.isLogin = 0;
          wx.showModal({
            title: '提示',
            content: res.data.code === 999988 ? '你的登录时间已超时，请重新登录' : '登入状态已失效，请重新再试',
            confirmText: '确认',
            success: () => { wx.reLaunch({url: '../index/index' }) }
          });
          return;
        }
        resolve(res);
      },
      fail: (error) => {
        reject(error);
      }
    };
    if (method === 'POST' || Object.keys(data) > 0) {
      params.data = {
        ...data
      }
    };
    wx.request(params);
  });
}
const wxAjaxWithNoModal = (method, url, data = {}) => {
  return new Promise((resolve, reject) => {
    let params = {
      method: method,
      url: url,
      header: {
        "Content-Type": "application/json;charset=UTF-8",
        "token": app.globalData.token,
        "native-app": "mini"
      },
      success: (res) => {
        if(res.data.code === 200) {
          resolve(res);
        } else {
          reject(res)
        }
      },
      fail: (error) => {
        reject(error);
      }
    };
    if (method === 'POST' || Object.keys(data) > 0) {
      params.data = {
        ...data
      }
    };
    wx.request(params);
  });
}
module.exports = {
  formatTime: formatTime,
  timestampToTime : timestampToTime,
  timestampToTimeHM : timestampToTimeHM,
  wxAjax: wxAjax,
  wxAjaxWithNoModal: wxAjaxWithNoModal
}
