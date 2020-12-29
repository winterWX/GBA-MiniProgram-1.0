//logs.js
import { wxAjax } from "../../utils/util";
const util = require('../../utils/util.js');
let app = getApp();
Page({
  data: {
    noData: true,
    currentMonth: '',
    stepInfo: [],
    imagesUrl: app.globalData.imagesUrl
  },
  onLoad: function () {
    this.getHistoryStep();
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return util.formatTime(new Date(log))
      })
    })
  },
  getHistoryStep: function() {
    let that = this;
    let time = new Date();
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let date = time.getDate();
    let endTime = parseInt(time.getTime() / 1000);
    let time2 = new Date(year-1, month, date);
    let startTime = parseInt(time2.getTime() / 1000);
    let currentMonth = `${year}年${month > 10 ? month : '0' + month}月`;
    let url = app.globalData.baseUrl + '/remote/health/data/query/history/steps';
    wxAjax('POST', url, {startTime, endTime}).then(res => {
      if (res.data.code == 200) {
        let stepInfo = that.operateData(res.data.data);
        that.setData({
          currentMonth,
          stepInfo,
          noData: false
        })
      }
    })
  },
  operateData(datas) {
    let results = [];
    for (let item of datas) {
      let [year, month] = item.month.split('-');
      let key = `${year}年${month}月`;
      let stepList = [];
      for (let data of item.data) {
        let [y, m, d] = data.date.split('-');
        stepList.push({
          date: `${m}月${d}日`,
          steps: data.steps
        })
      }
      results.push({
        month: key,
        data: stepList
      })
    } 
    return results;
  }
})
