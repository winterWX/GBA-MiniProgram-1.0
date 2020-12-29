let app = getApp();
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questions: [
     
    ],
    answers: [],
    questionAnalysis: [],
    quesIndex: 0,
    currentQ: {},
    selected: null,
    isConfirm: false,
    correctItem: null,
    confirm: null,
    submitResult: [],
    isOk: false,
    complete: false,
    baseUrl: app.globalData.imagesUrl,
    bannerUrl: ''
  },
  selectOption: function(e) {
    this.setData({selected: e.currentTarget.dataset.answer});
  },
  confirm: function() {
    let { selected, quesIndex, questions, answers } = this.data;
    let complete = quesIndex === questions.length - 1;
    let { isCorrect, optionId } = selected;
    let confirm = {
      isCorrect,
      optionId,
      questionId: questions[quesIndex].id
    };
    let isOk = selected.isCorrect === 1;
    answers.push(confirm);
    this.setData({confirm , isConfirm: true, isOk, complete, answers});
  },
  next: function() {
    let { questions, quesIndex} = this.data;
    let index = quesIndex + 1;
    let currentQ = questions[index];
    this.setData({
      quesIndex: index,
      currentQ,
      isConfirm: false,
      confirm: null,
      selected: null
    });
  },
  submit: function() {
    let that = this;
    let { activityId, answers } = that.data;
    wx.showLoading({ title: 'loading...' });
    let url =  app.globalData.baseUrl + '/remote/health/quiz/answer';
    let method = 'POST';
    const pamars = { id: activityId, answers };
    util.wxAjax(method,url,pamars).then(res=>{
        wx.hideLoading()
        if(res.data.code === 200) {
          let { rate, status } = res.data.data;
          let success = status === 1;
          wx.navigateTo({
            url: '../changeQAResult/index?rate=' + rate + '&success=' + success + '&id=' + activityId + '&submit=' + true,
          })
        } else {
          wx.showModal({
            showCancel: false,
            content: '服务器异常'
          })
        }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { id, goodsId} = options;
    let activityId = id || goodsId;
    this.setData({activityId});
    this.getQuestion(activityId);
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
  getQuestion: function(id) {
    let that = this;
    let { quesIndex } = that.data;
    wx.showLoading({
      title: 'loading...',
    })
    let url = app.globalData.baseUrl + '/remote/health/quiz/desc?id=' + id;
    let method = 'GET';
    util.wxAjax(method,url).then(res =>{
      wx.hideLoading()
      if(res.data.code === 200) {
        let { questions, bannerUrl } = res.data.data;
        let currentQ = questions[quesIndex];
        that.setData({questions, currentQ, bannerUrl});
      } else {
        wx.showModal({
          showCancel: false,
          content: '获取数据失败'
        })
      }
    })
  }
})