import { wxAjax } from "../../utils/util";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight : wx.getSystemInfoSync().windowHeight*2
  },
  onChange: function (e){
    let that = this;
    var inputVal = e.detail.replace(/^\s+|\s+$/g, "");
    let url = app.globalData.baseUrl + '/remote/article/filter/query';
    wxAjax('POST', url, {
      currentPage: 1,
      pageSize: 10,
      value : inputVal
    }).then((res) => {
      if(res.data.code === 200){
        res.data.data = res.data.data.map(item=>{
             return {
                ...item,
                inputtime : item.inputtime ? that.timestampToTime(item.inputtime):''
             }
        })
        that.setData({listData:res.data.data})
      }
    });
  },
  onSearch:function(){},
  onCancel:function(){
      wx.navigateBack({
        url: '../../pages/HealthInformation/index',
      })
  },
  listClick:function(e){
      let goodsId = e.currentTarget.dataset.itemid;      
      wx.navigateTo({                                 
        url: '../../pages/HealthInforDetails/index?goodsId='+ goodsId      
      })
  },
  timestampToTime :function (timestamp){
    let date = new Date(timestamp * 1000);  //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y + M + D + '，' + h + m;
},
})