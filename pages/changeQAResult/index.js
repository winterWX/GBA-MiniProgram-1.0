let app = getApp();
const util = require('../../utils/util');
Page({
  data: {
    rate: 0,
    success: true,
    wrong: 0,
    all: 0,
    questionAnalysis: [],
    id: '',
    baseUrl: app.globalData.imagesUrl,
    bannerUrl: '',
    integral: 0,
    isSubmit: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { rate, success, id, submit } = options;
    this.setData({rate, success: success === 'true', id, isSubmit: submit === 'true' });
    this.getQuestion(id);
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
  getQuestion: function(id) {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/health/quiz/desc?id=' + id;
    let method = 'GET';
    util.wxAjax(method,url).then(res =>{
        if(res.data.code === 200) {
          let {quizResult: {correct, wrong, questionAnalysis, rate, status}, bannerUrl, reward} = res.data.data;
          //let all = correct + wrong;
          let all = correct;
          that.setData({
            all,
            wrong,
            questionAnalysis,
            rate,
            success: status === 1,
            bannerUrl,
            integral: reward
          })
        }
    })
  },
  backToDetail: function() {
    let { id } = this.data;
    wx.navigateTo({
      url: '../healthKnowledge/index?id=' + id,
    })
  }
})