// components/html-view/html-view.js
var WxParse = require('./wxParse/wxParse.js');
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    detail :String
  },

  /**
   * 组件的初始数据
   */
  data: {
  },
  observers: {
    'detail': function (detail) {
 
      var article = detail
      var that = this;
       WxParse.wxParse('article', 'html', article, that, 0);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
