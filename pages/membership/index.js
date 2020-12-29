import { wxAjax } from "../../utils/util";
const app = getApp();
Page({
  data: {
    nickName : '',
    showCarkBlock:false,
    showTip : false,
    errorTip:false,
    errorTipThree:false,
    errorSeconeTip:false,
    tierCode:{},
    imagesUrl: app.globalData.imagesUrl,
  },

  nameChange:function(e){
    this.setData({
       nickName: e.detail.value
    })
    if(e.detail.value === ''){
        this.setData({showTip : false,errorTip:false,errorTipThree : false, errorSeconeTip:false});
    }
  },
  submitHnadle:function(){
    if (!this.data.nickName) {
        return;
    }else{
      this.membershipCode();
      // if(/^(?=.*[A-Z])(?=.*[0-9])[A-Z-0-9]{2,}$/.test(this.data.nickName)){
      //     this.setData({showTip : false});
      //     this.membershipCode();
      // }else{
      //       this.setData({showTip : true, errorTip : false, errorTipThree : false, errorSeconeTip:false});
      // }
    }
  },
  nameChangeFocus:function(e){
      this.setData({showTip:false});
  },
  membershipCode:function(){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/tier/code';
    wxAjax('POST', url, {"membershipCode": that.data.nickName}).then(res=> {
      if (res.data.code === 200) {
        that.setData({tierCode: res.data.data});
        that.setData({showCarkBlock: true, nickName : ''});
      }else if(res.data.code === 100804){
        that.setData({errorTip:true, errorTipThree : false, showTip:false, errorSeconeTip:false});
      }else if(res.data.code === 100802){
        that.setData({errorTipThree:true, errorTip : false, showTip:false, errorSeconeTip:false});
      }else if(res.data.code === 100803){
        that.setData({errorSeconeTip:true, errorTipThree:false, errorTip : false, showTip:false});
      }else{
        this.setData({showTip:true, errorTip : false, errorTipThree : false, errorSeconeTip:false});
      }
    }).catch(()=> {
      wx.showToast({
        title: '服务繁忙， 请稍后重试。',
        icon: 'loading'
      })
    })
  },
  closeBlock:function(){
    this.setData({ showCarkBlock:true })
  },
  bindEmail:function(){
    wx.navigateTo({
      url: '../../pages/silverDetail/index',
    })
  },
  //查看优惠券
  myCouponsFun:function(){
    wx.navigateTo({
      url: '../../pages/myCoupons/index',
    })
  }
})