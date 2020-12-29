import { wxAjax } from "../../utils/util";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: app.globalData.imagesUrl,
    secore:[],
    secoreNun:0,
    activeNum:0,
    bluPosse:0,
    activeData:{},
    LockFlg : true,
    indicatorColor:'#EDEDED',
    indicatorActive:"#929292",
    indicatorDots: true,
    vertical: true,
    autoplay: true,
    interval: 2000,
    duration: 500,
    windowWidth: wx.getSystemInfoSync().windowWidth*2,
    couponTypeText:'',
    couponTypes:'',
    couponTypeAfter:'',
    showCarkBlock:false,
    indexNum:-1,
    receiveId: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.tierMytier();
  },
  tierMytier:function(){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/tier/mytier';
    wxAjax('GET', url).then(res => {
      if (res.data.code == 200) {
        let sercode = res.data.data.mileStones.length;
        let couponType = res.data.data.tierInfo.couponType;
        res.data.data.mileStones = res.data.data.mileStones.map(item=>{
              return {
                  ...item,
                  expiryTime: item.expiryTime ? that.cardDayShow(item.expiryTime) :''
              }
        })
        that.setData({
            activeData : res.data.data,
            activeNum : sercode,
            bluPosse : that.bluPosse(res.data.data),
            couponTypes : couponType === 1 ? '折' : '',
            couponTypeAfter : couponType === 1 ? '' : '$',
            couponTypeText: couponType === 1 ? '折扣券' : '现金券'
        })
        that.secoreFun();
    }
    })
  },

  secoreFun:function(){
    let that = this;
    let activeNum = that.data.activeNum;
    that.setData({ secoreNun : (100 / Number(activeNum)).toFixed(2)})
  },

  bluPosse:function(data){
      let lengthNum = data.mileStones.length;
      let numData = (100 / Number(lengthNum)).toFixed(5);
      let indexFlg = -1;
      let arryNum = [];
      let betweenNum = 0; 
      if(data.mileStones.length > 0 ){
          if(data.integral >= data.mileStones[lengthNum-1].targetIntegral){
               return 100;
          }else{
              //每个区间的数值
              data.mileStones.forEach((item,index)=>{
                  arryNum.push(index === 0 ? item.targetIntegral : item.targetIntegral - data.mileStones[index-1].targetIntegral);
              });

              //在那个区间
              for(let i = 0 ; data.mileStones.length > 0 ; i ++){
                  if(data.integral <= data.mileStones[i].targetIntegral){
                      indexFlg = i;
                      if(indexFlg === 0){
                          betweenNum = data.integral === data.mileStones[indexFlg].targetIntegral ? data.mileStones[indexFlg].targetIntegral : data.integral;
                      }else{
                          betweenNum = data.integral - data.mileStones[i-1].targetIntegral;
                      }
                      break;
                  }
              }

              // 区间内 每积分所占的 份额
              const secodeDta = arryNum.slice(0,indexFlg+1).map((item,index) =>{
                    return index === 0 ? (numData / 2) / item : numData / item;
              });

              let newArryNum = secodeDta.map((item,index) =>{
                    if(secodeDta.length -1 === index){
                       return item * betweenNum;
                    }else{
                       return item * arryNum[index];
                    }
              });

              //连加值
              const total = newArryNum.reduce(function(a, b) {
                    return a + b;
              });
              return total;
          }
    }
  },

  receivedFun:function(e){
    let that = this;
    let indexNum = e.currentTarget.dataset.index;
    let idCode = that.data.activeData.mileStones[indexNum].id;
    that.setData({indexNum:indexNum});
    let url = app.globalData.baseUrl + '/remote/tier/reward/receive?id='+ idCode;
    wxAjax('GET', url).then((res) => {
      if (res.data.code == 200) {
        that.tierMytier();
        that.setData({showCarkBlock:true,receiveId:res.data.data});
      }
    });
  },

  parentCallBack:function(event){
    let that = this;
    if(that.data.activeData.level === 1){
        that.lockLevelFirst(event);
    }else if(that.data.activeData.level === 2){
        that.lockLeveLast(event);
    }else if(that.data.activeData.level === 4){
        that.lockLeveLast(event);
    }
  },
  lockLevelFirst:function(event){
      let that = this;
      if (event.detail.LockLevel === 1){
          that.setData({ silverLevel: false, glodLevel: false, LockFlg: true});
      }else if (event.detail.LockLevel === 2){
          that.setData({silverLevel: true, glodLevel: false, LockFlg: false});
      }else if(event.detail.LockLevel === 3){
          that.setData({glodLevel: true, silverLevel: false, LockFlg: false });
      }
  },
  lockLeveLast:function(event){
    let that = this;
    if (event.detail.LockLevel === 2){
        that.setData({silverLevel: false, glodLevel: false, LockFlg: true});
    }else if(event.detail.LockLevel === 3){
        that.setData({glodLevel: true, silverLevel: false, LockFlg: false });
    }
  },
  bindEmail:function(){
      let that = this;
      wx.navigateTo({
        url: '../../pages/couponDetails/index?id='+ that.data.receiveId,
      })
  },
  closeBolck:function(){
    let that = this;
    that.setData({showCarkBlock: false});
  },
  cardDayShow:function(value){
    const date = new Date(value * 1000); 
    const Y = date.getFullYear() + '年';
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '日';
    return  Y + M + D;
  }
})