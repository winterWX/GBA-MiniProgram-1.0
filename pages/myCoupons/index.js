const { wxAjax } = require("../../utils/util");

const app = getApp();
Page({
  data: {
      winWidth: 0,
      winHeight: 0,
      currentTab: '0',
      type:1,
      detailArray:[]
 },
  onLoad: function() {
      var that = this;
      wx.getSystemInfo( {
          success: function( res ) {
              that.setData( {
                  winWidth: res.windowWidth,
                  winHeight: res.windowHeight
              });
          }
      });
      that.myCoupons(that.data.type);
  },
//  tab切换逻辑
  swichNav: function( e ) {
      var that = this;
      if( this.data.currentTab === e.target.dataset.current ) {
          return false;
      } else {
          that.setData({currentTab: e.target.dataset.current });
          that.myCoupons(Number(that.data.currentTab) +1);
      }
  },
  myCoupons:function(type){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/tier/coupon/list?type='+type;
    wxAjax('GET', url).then(res => {
      if(res.data.code === 200){
        const detailArray = res.data.data.map(item=>{
          return {
            attachmentUrl : item.attachmentUrl,
            expiryTime : that.cardDayShow(item.expiryTime),
            name : item.name,
            useTime : item.useTime,
            id : item.id
          }
       })
       that.setData({detailArray : detailArray});
      }
    })
  },
  immediateUse:function(e){
      let id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '../../pages/couponDetails/index?id='+ id,
      })
  },
  cardDayShow:function(value){
      const date = new Date(value * 1000); 
      const Y = date.getFullYear() + '年';
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
      const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '日';
      return  Y + M + D;
  }
})