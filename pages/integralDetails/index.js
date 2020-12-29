import { formatNumber, formatTime , wxAjax  } from '../../utils/util';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    integralList:{},
    integral: 0,
    expiryTime: '',
    detailArray:[],
    typeList:[
      "每日步数奖赏",
      "每日步数奖赏",
      "每日步数奖赏",
      "推荐奖赏",
      "完成个人资讯",
      "连接健康数据",
      "完成开户",
      "运动挑战赛",
      "健康资讯",
      "迎新奖赏",
      "完成医疗服务",
      "完成视像会诊",
      "eShop购物",
      "完成投保",
      "健康知识小测试",
      "网上商城服务",
      "银行预约",
      "每日连续挑战",
      "每日连续挑战"
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initPage();
  },

  integralRules:function(){
    wx.navigateTo({
        url: '../../pages/integralRules/index',
    })
  },
  initPage:function(){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/integral/detail';
    wxAjax('GET', url).then(res => {
      if(res.data.code === 200){
        let {integral,expiryTime,detail} = res.data.data;
        const detailArray = detail.map(item=>{
           return {
                 createTime : that.timestampToTime(item.createTime),
                 integral: item.integral,
                 type : that.data.typeList[item.type- 1]
             }
         })
         that.setData({
           integral,
           expiryTime: that.cardDayShow(expiryTime),
           detailArray : detailArray
        });
     }
    });
  },
  cardDayShow:function(value){
      const date = new Date(value * 1000); 
      const Y = date.getFullYear() + '年';
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
      const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '日';
      return  Y + M + D;
  },
  timestampToTime :function (timestamp){
        const date = new Date(timestamp * 1000);  //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        const Y = date.getFullYear() + '年';
        const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
        const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '日';
        const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        return Y + M + D + ' ' + h + m + s;
  }
})