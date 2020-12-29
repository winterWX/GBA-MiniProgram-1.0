const util = require('../../utils/util');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    BMIData:{},
    background: '',
    BMIleft: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      let BMIData = JSON.parse(options.initData);
      that.setData({ BMIData });
      that.BMIleftAnmation(that.data.BMIData.bmi);
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
  BMIleftAnmation:function(num){
    let that = this;
    let numData = Number(num).toFixed(1);
    if(parseFloat(11.83) <= parseFloat(numData) && parseFloat(numData) < parseFloat(18.50)){
        let s1 =  (parseFloat(18.50) - parseFloat(numData)) * parseFloat(2.248);
        let BMIleft = parseFloat(15.0) - parseFloat(s1);
        that.setData({ background: '#9B7C56',BMIleft });
    }else if(parseFloat(18.5) <= parseFloat(numData) && parseFloat(numData) < parseFloat(22.9)){
        let s1 = (parseFloat(22.9) - parseFloat(numData)) * parseFloat(6.36);
        let BMIleft = parseFloat(43.0) - parseFloat(s1);
        that.setData({ background: '#34A344',BMIleft });
    }else if(parseFloat(23) <= parseFloat(numData) && parseFloat(numData) < parseFloat(24.9)){
        let s1 = (parseFloat(24.9) - parseFloat(numData)) * parseFloat(11.57);
        let BMIleft = parseFloat(65.0) - parseFloat(s1);
        that.setData({ background: '#EDAE26',BMIleft });
    }else if(parseFloat(25.0) <= parseFloat(numData) &&  parseFloat(numData) < parseFloat(27.5)){
        let s1 = (parseFloat(numData) - parseFloat(25.0)) * parseFloat(14);
        let BMIleft = parseFloat(65.0) + parseFloat(s1);
        that.setData({ background: '#B10D19',BMIleft });
    }else if( parseFloat(numData) >= parseFloat(27.5)){
        that.setData({ background: '#B10D19',BMIleft : 98});
    }
  }
})