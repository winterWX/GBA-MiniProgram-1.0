const app = getApp();
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarObjList: app.globalData.avatarObjList,
    showArray:[],
    friendArrayData:[],
    noArray:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // that.setData({ noArray:true });
    that.hasAddFriend();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onChange:function(event){
    let that = this;
    let inputVal = event.detail;
    let friendData = that.data.friendArrayData.filter(item => item.mobile.indexOf(inputVal) > -1 );
    that.setData({showArray: inputVal === '' ? [] : friendData});
  },
  onCancel:function(){
      wx.navigateBack({
        url: '../addFriend/index',
      })
  },
  hasAddFriend:function(){
    let that = this;
    let url = app.globalData.baseUrl + '/remote/friend';
    let method = 'GET';
    util.wxAjax(method,url).then(res=>{
      if(res.data.code === 200){
        let friendArrayData = that.arryFriend(res.data.data);
        that.setData({friendArrayData:friendArrayData})
      }
    })
  },
  arryFriend:function(allData){
    let lastArryData = allData.map((item,index)=>{
        return {
          avatar: this.avatarSelect(item.avatar,item.avatarUrl),
          nickname: item.nickname,
          mobile: item.mobile
        }
    })
    return lastArryData;
  },
  avatarSelect:function(avatar,avatarUrl){
    if(avatar !==''){
        return this.data.avatarObjList[Number(avatar)].url;
    }else if(avatar ==='' && avatarUrl !==''){
        return avatarUrl;
    }else{
        return this.data.avatarObjList[12].url;
    }
  }
})