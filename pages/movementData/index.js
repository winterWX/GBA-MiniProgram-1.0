import * as echarts from '../../components/ec-canvas/echarts';
import { formatTime,  wxAjax } from '../../utils/util';
const app = getApp();
let tabsWithDay = [
  //{ name: '日', id: 'day' }, { name: '周', id: 'week' }, { name: '月', id: 'month' }
    { name: '周', id: 'week' }, { name: '月', id: 'month' }
];
let tabs = [
  { name: '周', id: 'week' }, { name: '月', id: 'month' }
];
var textStyle = {
  color: '#929292',
  fontSize: 12
};
var lineStyle = {
  color: '#EDEDED',
  width: '1'
}
let checkName = '';
let currentTab = '';
var option = {
  color: ['#00A865'],
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#00A865'
      }
    },
  },
  grid: {
    left: '9',
    right: '50',
    bottom: '30',
    top: '8'
  },
  xAxis: {
    type: 'category',
    axisLine: {       //y轴
      lineStyle: lineStyle
    },
    axisLabel: {
      textStyle: textStyle,
      interval: 'auto'
    },
    data: []
  },
  yAxis: {
    position: 'right',
    type: 'value',
    splitNumber: 2,
    splitArea: {
      show: false
    },
    splitLine: {
      lineStyle: lineStyle
    },
    axisLine: {       //y轴
      "show": false
    },
    axisTick: {       //y轴刻度线
      "show": false
    },
    axisLabel: {
      textStyle: textStyle
    },
  },
  series: [{
    data: [],
    type: 'bar',
    barWidth: 6,
    itemStyle: {
      normal: {
        barBorderRadius: [3, 3, 0, 0],
        color: function (params) {
          //判断选中的名字改变柱子的颜色样式
          if (checkName === params.name) {
            return '#00A865';
          }
        }
      }
    }
  }]
};
let chart = null;
let dateMap = {};
let weekDateMap = {};
function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicepixelratio: dpr
  });
  canvas.setChart(chart);
  chart.setOption(option);
  return chart;
}
Page({
  data: {
    currentTabId: 'week',
    preDisplayDate: '',
    timeData: 0,
    caloriesData :0,
    distanceData :0,
    noData: false,
    nextDisplayDate: '',
    selectedDate: '',
    selectedDateNum: 0,
    showSelectedDate: false,
    startTime: 0,
    endTime: '',
    echartsWeekMonth: [],
    clickNum: 0,
    initDate: '',
    currentDate: '',
    tabs: tabsWithDay,
    initDisplayDate: {},
    ec: {
      onInit: initChart
    },
    sportsData:{},
    textObject:{ 
      topTimeText:'',
      caloriesText:'',
      distanceText:''
    }
  },
  onLoad: function () {
    let date = new Date();
    let {year, month, day} = this.getDateInfo(date);
    let initDate = `${year}年${(month + 1 < 10 ? ('0' + month) : month)}月${(day < 10 ? ('0' + day) : day)}日`;
    let currentDate = initDate;
    let {firstDay, lastDay, startTime, endTime} = this.initWeekDisplay();
    let preDisplayDate = firstDay;
    let nextDisplayDate = lastDay;
    this.getStepInfo(startTime, endTime, 'week')
    this.setData({
      preDisplayDate,
      nextDisplayDate,
      initDate,
      currentDate
    })
    this.sportsText('week');
  },
  onReady: function () {
    let isBindEvent = false;
    let timer = null;
    timer = setInterval(() => {
      if (isBindEvent) {
        clearInterval(timer);
        return;
      }
      if (chart) {
        isBindEvent = true;
        chart.on('click', (params) => {
          option.color = ['#55D0A6'];
          checkName = params.name;
          chart.setOption(option);
          if (currentTab !== 'day') {
            this.setData({
              selectedDate: currentTab === 'month' ? dateMap[checkName] : weekDateMap[checkName],
              selectedDateNum: params.value,
              showSelectedDate: true,
            })
          }
        })
      }
    }, 100)
  },
  onUnload: function(){
    chart = null;
  },
  changTab: function (e) {
    let { initDate } = this.data;
    let currentTabId = e.currentTarget.dataset.props;
    currentTab = currentTabId;
    this.data.currentTabId = currentTabId;
    var nextDisplayDate = '';
    var preDisplayDate = '';
    if (currentTabId === 'week') {
      let {firstDay, lastDay, startTime, endTime} = this.initWeekDisplay();
      nextDisplayDate = lastDay;
      preDisplayDate = firstDay;
      this.getStepInfo(startTime, endTime, 'week')
      this.sportsText('week');
    } else if (currentTabId === 'month') {
      let {firstDay, lastDay, startTime, endTime} = this.initMonthDate();
      nextDisplayDate = lastDay;
      preDisplayDate = firstDay;
      this.getStepInfo(startTime, endTime, 'month');
      this.sportsText('month');
    } else {
      let t = new Date();
      let year = t.getFullYear();
      let month = t.getMonth() + 1;
      let date = t.getDate();
      let endTime = parseInt(t.getTime() / 1000);
      let currentDate = `${year}年${month > 10 ? month : '0' + month}月${date < 10 ? '0' + date : date}日`
      let t1 = new Date(year, month, date);
      let startTime = t1.getTime() / 1000;
      this.setData({ currentDate })
      this.getStepInfo(startTime, endTime, 'day')
      this.sportsText('day');
    }
    this.setData({
      currentTabId,
      clickNum: 0,
      preDisplayDate,
      nextDisplayDate,
      selectedDate: ''
    })
  },
  getStepInfo: function (startTime, endTime, demension) {
    let { currentTabId } = this.data;
    this.setData({ showSelectedDate: false });
    let initData = this.initDisplayData(startTime, demension);
    let url = app.globalData.baseUrl + '/remote/health/data/query/histogram';
    let that = this;
    wxAjax('POST', url, {
      startTime,
      endTime,
      demension,
      features: 'sports',
      type:'APP'
    }).then(res => {
      if (res.data.code == 200) {
        let { dataList = [], timeData, type, caloriesData, distanceData } = res.data.data;
        if (dataList.length === 0) {
          that.setData({ caloriesData :0,distanceData :0,noData: !dataList.length });
          return;
        };
        that.setData({
          timeData,
          caloriesData: caloriesData !== 0 ? caloriesData.toFixed(1) : 0,
          distanceData: distanceData !== 0 ? distanceData.toFixed(1) : 0, 
          //tabs: type === 'MINIP' ? tabs : tabsWithDay,
          tabs: type === 'MINIP' ? tabs : tabs,
          noData: !dataList.length
        });
        let displayDataMap = {};
        dataList.forEach(item => {
          let t = formatTime(new Date(item.dataTime * 1000));
          let dateArr = that.foramteDate(t);
          let [year, month, day] = dateArr;
          let key = currentTabId === 'month' ? `${t.split(" ")[0].split('/')[2]}日` : that.getDisplayWeek(new Date(item.dataTime * 1000));
          if (currentTabId === 'week') {
            weekDateMap[key] = `${month}月${day}日`;
          }
          displayDataMap[key] = item.consumTime;
        });
        // 重置echarts样式
        option.series[0].barWidth = currentTabId !== 'month' ? 14 : 6;
        option.color = ['#00A865'],
        option.xAxis.axisLabel.interval = demension === 'month' ? 6 : 'auto';
        option.series[0].itemStyle.normal.barBorderRadius = demension === 'month' ? [3,3,0,0] : [10,10,0,0];
        let displayData =  Object.assign(initData, displayDataMap);
        option.xAxis.data = Object.keys(displayData);
        option.series[0].data = Object.values(displayData);
        chart && chart.setOption(option);
      }
    })
    .catch(() => {
      option.xAxis.data = [];
      option.series[0].data = [];
      chart && chart.setOption(option);
      that.setData({ noData: true });
    });
  },
  initDisplayData: function(startTime, type) {
    let results = {};
    let t = new Date(startTime * 1000);
    let {month, days} = this.getDateInfo(t);
    if (type === 'month') {
      for (let i=1;i<=days;i++) {
        let date = `${i < 10 ? '0' + i : i}日`;
        results[date] = 0;
        dateMap[date] = `${month < 10 ? '0' + month : month}月${date}`
      }
    } else {
      let weeks = ['周日','周一','周二','周三','周四','周五','周六'];
      for (let item of weeks) {
        results[item] = 0;
      }
    }
    return results;
  },
  getDisplayWeek: function (date) {
    let weekMap = {
      0: '周日',
      1: '周一',
      2: '周二',
      3: '周三',
      4: '周四',
      5: '周五',
      6: '周六'
    };
    let day = date.getDay();
    return weekMap[day];
  },
  foramteDate: function (time) {
    let timeArr = time.split(' ')[0].split('/');
    return timeArr;
  },
  preClick: function () {
    let { currentTabId, currentDate } = this.data;
    let clickNum = this.data.clickNum + 1;
    let nextDisplayDate = '';
    let preDisplayDate = '';
    let nextTime = null;
    let preTime = null;
    let monthResult = null;
    if (currentTabId !== 'day') {
      if (currentTabId === 'week') {
        nextTime = this.getWeek(this.data.preDisplayDate, 1);
        preTime = this.getWeek(this.data.preDisplayDate, 7);
      } else if (currentTabId === 'month') {
        monthResult = this.getMonth(this.data.nextDisplayDate);
      }
      nextDisplayDate = currentTabId === 'week' ? nextTime.date : monthResult.nextDisplayDate;
      preDisplayDate = currentTabId === 'week' ? preTime.date : monthResult.preDisplayDate;
      let startTime = currentTabId === 'week' ? preTime.time : monthResult.startTime;
      let endTime = currentTabId === 'week' ? nextTime.time : monthResult.endTime;
      this.getStepInfo(startTime, endTime, currentTabId)
      this.setData({
        clickNum,
        preDisplayDate,
        nextDisplayDate
      })
    } else {
      let time = this.getPreDay(currentDate);
      let { startTime, endTime, date } = time;
      this.getStepInfo(startTime, endTime, currentTabId)
      this.setData({ currentDate: date, clickNum });
    }

  },
  nextClick: function () {
    let clickNum = this.data.clickNum - 1;
    let { currentTabId, currentDate, initDate } = this.data;
    let nextDisplayDate = '';
    let preDisplayDate = '';
    let preTime = null;
    let nextTime = null;
    let monthResult = null;
    if (currentTabId !== 'day') {
      if (currentTabId === 'week') {
        preTime = this.getWeek(this.data.nextDisplayDate, 1, 'next');
        nextTime = this.getWeek(this.data.nextDisplayDate, 7, 'next');
      } else if (currentTabId === 'month') {
        monthResult = this.getMonth(this.data.nextDisplayDate, true);
      }
      nextDisplayDate = currentTabId === 'week' ? nextTime.date : monthResult.nextDisplayDate;
      preDisplayDate = currentTabId === 'week' ? preTime.date : monthResult.preDisplayDate;
      let startTime = currentTabId === 'week' ? preTime.time : monthResult.startTime;
      let endTime = currentTabId === 'week' ? nextTime.time : monthResult.endTime;
      this.getStepInfo(startTime, endTime, currentTabId);
      this.setData({
        clickNum,
        preDisplayDate,
        nextDisplayDate
      })
    } else {
      let time = this.getNextDay(currentDate);
      let { startTime, endTime, date } = time;
      this.getStepInfo(startTime, endTime, currentTabId)
      this.setData({ currentDate: date, clickNum });
    }

  },
  // 切换的tab到月的时候 初始化月份显示时间
  initMonthDate: function () {
    let t = new Date();
    let year = t.getFullYear();
    let month = t.getMonth();
    let t2 = new Date(year, month+1, 0);
    let days = t2.getDate();
    let first = this.getDateInfo(new Date(year, month, 1));
    let last = this.getDateInfo(new Date(year, month, days));
    return {
      firstDay: `${first.year}年${first.month < 10 ? '0' + first.month : first.month}月${first.day}日`,
      lastDay: `${last.year}年${last.month < 10 ? '0' + last.month : last.month}月${last.day}日`,
      startTime: first.tapTime,
      endTime: last.tapTime
    }
  },
  getDateInfo: function(time) {
    let week = time.getDay();
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let day = time.getDate();
    let days = new Date(year, month, 0).getDate();
    let tapTime = parseInt(time.getTime() / 1000);
    return {
      year, 
      month,
      day,
      week,
      tapTime,
      days      // 当前月有多少天
    }
  },
  // 初始化 计算以周围维度的显示时间
  initWeekDisplay: function() {
    let time = new Date();
    let {year, month, day, week} = this.getDateInfo(time);
    let firstDay = new Date(year, month-1, day-week);
    let lastDay = new Date(year, month-1, day + 6 - week);
    let first = this.getDateInfo(firstDay);
    let last = this.getDateInfo(lastDay);
    return {
      firstDay: `${first.year}年${first.month < 10 ? '0' + first.month  : first.month}月${first.day}日`,
      lastDay: `${last.year}年${last.month < 10 ? '0' + last.month : last.month}月${last.day}日`,
      startTime: first.tapTime,
      endTime: last.tapTime
    }
  },
  // 获取前一个月数据
  getMonth: function (formateTime, flag = false) {
    let tmp = formateTime.replace(/[\u4e00-\u9fa5]/g, '-').split('-');
    let [year, month, day] = tmp;
    let year2 = year;
    let month2 = !flag ? parseInt(month) - 1 : parseInt(month) + 1;
    if (!flag && month2 === 0) {
      month2 = 12;
      year2 = parseInt(year) - 1;
    } else if (flag && month2 === 13) {
      year2 = parseInt(year) + 1;
      month2 = 1;
    };
    let t = new Date(year2, month2 - 1, 1);
    let startTime = parseInt(t.getTime() / 1000);
    let t2 = new Date(year2, month2, 0);
    let days = t2.getDate();
    let t3 = new Date(year2, month2 - 1, days);
    let endTime = parseInt(t3.getTime() / 1000);
    return {
      startTime,
      endTime,
      preDisplayDate: `${year2}年${month2 < 10 ? '0' + month2 : month2}月01日`,
      nextDisplayDate: `${year2}年${month2 < 10 ? '0' + month2 : month2}月${days}日`
    }
  },
  getWeek: function (formateTime, n, direction = 'pre') {
    let tmp = formateTime.replace(/[\u4e00-\u9fa5]/g, '-').split('-');
    let [year, month, date] = tmp;
    let d = new Date(year, month - 1, date);
    direction === 'pre' ? d.setDate(d.getDate() - n) : d.setDate(d.getDate() + n);
    let time = parseInt(d.getTime() / 1000);
    let year2 = d.getFullYear();
    let mon2 = d.getMonth() + 1;
    let day2 = d.getDate();
    let s = year2 + "年" + (mon2 < 10 ? ('0' + mon2) : mon2) + "月" + (day2 < 10 ? ('0' + day2) : day2) + '日';
    return {
      date: s,
      time: time
    }
  },
  getPreDay: function (formateTime) {
    let startTime = 0;
    let endTime = 0;
    let tmp = formateTime.replace(/[\u4e00-\u9fa5]/g, '-').split('-');
    let [year, month, date] = tmp;
    let d = new Date(year, month - 1, date);
    let time = d.getTime();
    endTime = parseInt((time - 60 * 1000) / 1000);
    startTime = (time - 24 * 60 * 60 * 1000) / 1000;
    let d2 = new Date(startTime * 1000);
    let year2 = d2.getFullYear();
    let month2 = d2.getMonth() + 1;
    let date2 = d2.getDate();
    return {
      startTime,
      endTime,
      date: `${year2}年${month2 < 10 ? '0' + month2 : month2}月${date2 < 10 ? '0' + date2 : date2}日`
    }
  },
  getNextDay: function (formateTime) {
    let startTime = 0;
    let endTime = 0;
    let tmp = formateTime.replace(/[\u4e00-\u9fa5]/g, '-').split('-');
    let [year, month, date] = tmp;
    let d = new Date(year, month - 1, date);
    let d2 = new Date(d.getTime() + 24 * 60 * 60 * 1000);
    let year2 = d2.getFullYear();
    let month2 = d2.getMonth() + 1;
    let date2 = d2.getDate();
    startTime = parseInt(d2.getTime() / 1000);
    endTime = parseInt((startTime * 1000 + 24 * 60 * 59 * 1000) / 1000);
    return {
      startTime,
      endTime,
      date: `${year2}年${month2 < 10 ? '0' + month2 : month2}月${date2 < 10 ? '0' + date2 : date2}日`
    }
  },
  sportsText:function(tip){
      let that = this;
      that.setData({
        textObject:{ 
          textObject : tip === 'day' ? '今日运动时间' : (tip === 'week' || tip === 'month'? '总活动时间' : ''),
          caloriesText: tip === 'day' ? '今日消耗/卡路里' : (tip === 'week' || tip === 'month'? '消耗/千卡' : ''),
          distanceText: tip === 'day' ? '今日距离/公里' : (tip === 'week' || tip === 'month'? '距离/公里' : '')
        }
      })
  }
})
