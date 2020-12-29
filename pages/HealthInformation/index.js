const app = getApp();
const util = require('../../utils/util');
var x,
    y,
    x1,
    y1,
    x2,
    y2,
    lastX = 0,
    lastY = 0;
Page({
  data: {
    ipaState:false,
    listData: [],
    totalPage: 0,
    onPullNun: 1,
    timeData: [],
    inputSearchData: "",
    tabCur: 0, //默认选中
    tabLists: [], //东部导航tag
    topTipShow: true,
    collectFlg: false,
    hideModal: true, //模态框的状态  true-隐藏  false-显示
    animationData: {},
    sizeData: 4,
    myTagData: [], //我关注的话题
    forYouData: [], //全部话题
    editSwith: true,
    editStute: false,
    dataItemTag: [],
    researchTag: "",
    statusTy: [],
    topTitleIndex: -1,
    articleAdd: false,
    selectCollData: [],
    deleteTagArray: [],
    addTagArray: [],
    listId: [],
    switchTag: false,
    //拖拽效果
    current: -1,
    s_v: 10,
    s_h: 11, //控制tbn 的宽度
    u_w: 0, //这个由num控制，num表示一行几个
    u_h: 36,
    num: 4, //每行显示几个
    all_width: "", //总的宽度
    speed: 2, //>1,交换的速度
    move_x: "",
    move_y: "",
    baseUrl: app.globalData.imagesUrl
  },
  onLoad: function (options) {
    let that = this;
    // 控制close按钮，页面初始的时候
    let topTipShowFlg = app.healthInforData.findMore;
    that.setData({ topTipShow: topTipShowFlg });
    that.searchSend(options.inputVal);
    //查询所有话题
    that.getTagList();
  },
  onShow: function () {
    let that = this;
    that.getTagList();
  },
  onHide: function() {
    this.setData({ hideModal: true });
  },
  onPageScroll:function(e){
      let that = this;
      if (e.scrollTop > 0 ){
          that.setData({ onPullNun: (that.data.onPullNun += 1) });
          if (that.data.onPullNun <= that.data.totalPage) {
            that.searchSend(that.data.researchTag, that.data.onPullNun);
          } else {
            return;
          }
      }
  },
  getTagList: function () {
    if(app.globalData.isLogin === 0){
       this.defaultLabel();
    }else{
      Promise.all([this.mytagSearch(), this.searchAllTopic()]).then((data) => {
        this.operateMyTag(data[0]);
        this.operaterAllTopic(data[1]);
      });
    }
  },
  //选择条目
  tabSelect(e) {
      let that = this;
      if(that.data.ipaState){ return; }
      that.setData({ ipaState : true});
      that.setData({ tabCur: e.currentTarget.dataset.id,scrollLeft: (e.currentTarget.dataset.id - 2) * 200 });
      that.setData({ researchTag: that.data.tabLists[e.currentTarget.dataset.id].tag === '热门推荐' ? '热门推荐' : that.data.tabLists[e.currentTarget.dataset.id].tag});
      that.setData({ listData: [], onPullNun : 1, switchTag: true});  //清空数组,  switchTag(标记切换的动作)
      that.searchSend(that.data.researchTag);
  },
  listClick(e){
     let goodsId = e.currentTarget.dataset.itemid;      
      wx.navigateTo({                                 
        url: '../../pages/HealthInforDetails/index?goodsId='+ goodsId      
      })
  },
  //文章列表接口
  searchSend(parase,num) {
    let that = this;
    wx.showLoading({
      title: 'loading...'
    })
    let url = app.globalData.baseUrl + '/remote/article/query/list';
    let method = 'POST';
    const data = {
      "currentPage": num !== undefined ? num : 1,
      "pageSize": 10,
      "topic": parase !== undefined ? parase : '热门推荐'  //热门推荐
    };
    util.wxAjax(method,url,data).then(res=>{
        if(res.data.code === 200){
          //that.collectionQueryCounts();  // 赋值前调用
          res.data.data.articles = res.data.data.articles.map((item) => {
            return {
                ...item,
                inputtime: item.inputtime  ? that.timestampToTime(item.inputtime) : ""
            };
          });
          that.setData({ totalPage: res.data.totalPage, listData : [...that.data.listData,...res.data.data.articles]});
        }
        that.setData({ ipaState : false});
        wx.hideLoading();
    })
  },
  collectionImageShare: function (e) {
    var that = this;
    var articleId = e.currentTarget.dataset.id;
    var node = that.data.listData.findIndex((item) => {
      return item.id === articleId;
    });
    if (node > -1) {
      that.setData({
        topTitleIndex: node,
      });
    }
    if (!that.data.listData[node].isCollect) {
      that.collectionAdd(articleId);
    } else {
      that.collectionDetele(articleId);
    }
  },
  editActList: function () {
    var that = this;
    that.setData({
      editStute: true,
    });
    that.setData({
      editSwith: false,
    });
  },
  canlenBtn: function () {
    var that = this;
    that.setData({
      editStute: false,
    });
  },
  editTagDone: function () {
    let that = this;
    let listParas = [];
    if (that.data.myTagData.length > 0) {
      that.data.myTagData.forEach((item, index) => {
        listParas.push({
          order: parseInt(index + 1) + "",
          topic: item.tag,
        });
      });
    }
    that.refreTagList(listParas); //批量编辑
  },
  //展示tag标签
  tagsShare: function () {
    var that = this;
    that.setData({
      hideModal: false,
    });
    var animation = wx.createAnimation({
      duration: 100, //动画的持续时间 默认600ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: "ease", //动画的效果 默认值是linear
    });
    this.animation = animation;
    setTimeout(function () {
      that.fadeIn(); //调用显示动画
    }, 100);
    that.setData({
      editStute: true,
    });
    that.dargLonad();
  },
  //查询所有话题
  searchAllTopic: function () {
    let that = this;
    let url =  app.globalData.baseUrl + "/remote/myTopic/searchAllTopic";
    let method = 'GET';
    return new Promise((resolve, reject) => {
      util.wxAjax(method,url).then(res =>{
          resolve(res);
      })
    })
  },
  operaterAllTopic: function (res) {
    let searchAllTopicArray = [];
    let allTopicArray = [];
    let allTopicLastArray = [];
    let { myTagData } = this.data;
    let myTagList = myTagData.map((item) => {
      return item.tag;
    });
    if (res.data.data !== null) {
      res.data.data.forEach((item) => {
        if (!myTagList.includes(item.name)) {
          searchAllTopicArray.push({
            tag: item.name,
          });
        }
      });
      searchAllTopicArray.forEach((item) => {
        if (item.tag === "热门推荐") {
          allTopicArray.push(item);
        } else {
          allTopicLastArray.push(item);
        }
      });
      this.setData({
        forYouData: [...allTopicArray, ...allTopicLastArray],
      });
    }
  },
  //查询我的话题(游客)
  defaultLabel: function () {
      let that = this;
      let url =  app.globalData.baseUrl + '/remote/myTopic/search';
      let method = 'GET';
      util.wxAjax(method, url).then(res=>{
          that.operateMyTag(res);
      });
    },
  //查询我的话题
  mytagSearch: function () {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/myTopic/search';
    let method = 'GET';
    return new Promise((resolve, reject) => {
      util.wxAjax(method,url).then(res =>{
          resolve(res);
      })
    })
  },
  operateMyTag: function (res) {
    if (res.data.data !== null) {
      if (Array.isArray(res.data.data) && res.data.data.length > 0) {
        let tabListsArray = [];
        let firstSortArray = [];
        let lastSortArray = [];
        res.data.data.forEach((item) => {
          tabListsArray.push({
            tag: item.topic,
          });
        });
        tabListsArray.forEach((item) => {
          if (item.tag === "热门推荐") {
            firstSortArray.push(item);
          } else {
            lastSortArray.push(item);
          }
        });

        this.setData({
          tabLists: [...firstSortArray, ...lastSortArray],
        });
        this.setData({
          myTagData: [...firstSortArray, ...lastSortArray], //我关注的话题
        });
      } else {
        let tabListsArray = [{ tag: "热门推荐" }];
        this.setData({
          tabLists: tabListsArray,
          myTagData: tabListsArray, //我关注的话题
        });
      }
    }
  },
  //批量更新tag
  refreTagList: function (listNum) {
    let that = this;
    let url =  app.globalData.baseUrl + '/remote/myTopic/batchUpdateMyTopic';
    let method = 'POST';
    const data = { list: listNum };
    util.wxAjax(method, url, data).then(res=>{
        // that.mytagSearch(); //批量编辑成功后刷新顶部导航
        that.getTagList();
        that.closePage(); //关闭编辑页面
    });
  },
  myTagItemFun: function (e) {
    let that = this;
    let clickIndex = e.currentTarget.dataset.index;
    let myTagFilter = that.data.myTagData;
    if (myTagFilter[clickIndex] && myTagFilter[clickIndex].tag !== "热门推荐") {
      that.data.deleteTagArray.push(myTagFilter[clickIndex]);
      let conceArray = [...that.data.forYouData, ...that.data.deleteTagArray];
      let curArray = conceArray.reduce((acc, cur) => {
        !acc.some((v) => v.tag === cur.tag) && acc.push(cur);
        return acc;
      }, []);
      that.setData({
        forYouData: curArray,
      });
      that.setData({
        deleteTagArray: [],
      });
      let myTagFilterNewArray = myTagFilter.filter(
        (item) => item.tag !== that.data.myTagData[clickIndex].tag
      );
      that.setData({
        myTagData: myTagFilterNewArray,
      });
    }
    that.dargLonad();
  },
  addTagBbtn: function (e) {
    let that = this;
    let clickIndex = e.currentTarget.dataset.index;
    let addBtn = that.data.forYouData;
    if (addBtn[clickIndex] && addBtn[clickIndex].tag !== "热门推荐") {
      that.data.addTagArray.push(addBtn[clickIndex]);
      let arrayOld = [...that.data.myTagData, ...that.data.addTagArray];
      let ccArray = arrayOld.reduce((acc, cur) => {
        !acc.some((v) => v.tag === cur.tag) && acc.push(cur);
        return acc;
      }, []);
      that.setData({
        myTagData: ccArray,
      });
      that.setData({
        addTagArray: [],
      });
      let addBtnNewArray = addBtn.filter(
        (item) => item.tag !== that.data.forYouData[clickIndex].tag
      );
      that.setData({
        forYouData: addBtnNewArray,
      });
    }
    that.dargLonad();
  },
  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 100, //动画的持续时间 默认800ms   数值越大，动画越慢   数值越小，动画越快
      timingFunction: "ease", //动画的效果 默认值是linear
    });
    this.animation = animation;
    that.fadeDown(); //调用隐藏动画
    setTimeout(function () {
      that.setData({
        hideModal: true,
      });
    }, 100); //先执行下滑动画，再隐藏模块
  },
  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step();
    this.setData({
      animationData: this.animation.export(), //动画实例的export方法导出动画数据传递给组件的animation属性
    });
  },
  fadeDown: function () {
    this.animation.translateY(1000).step();
    this.setData({
      animationData: this.animation.export(),
    });
    this.setData({
      editStute: false,
    });
    this.setData({
      editSwith: true,
    });
  },
  closePage: function () {
    var that = this;
    that.fadeDown();
    that.setData({
      hideModal: true,
    });
  },
  searchBlock: function () {
    wx.navigateTo({
      url: "../../pages/searchTag/index",
    });
  },
  topTipImageColse: function () {
    let that = this;
    app.healthInforData.findMore = false;
    let topTipShowFlg = (app.healthInforData.findMore = false);
    that.setData({
      topTipShow: topTipShowFlg,
    });
  },
  timestampToTime: function (timestamp) {
    var date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + "-";
    var M =
      (date.getMonth() + 1 < 10
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1) + "-";
    var D = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    var h =
      (date.getHours() < 10 ? "0" + date.getHours() : date.getHours()) + ":";
    var m =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    var s =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    return Y + M + D + "，" + h + m;
  },
  dargLonad: function () {
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        var lastWith = res.windowWidth - 15;
        self.setData({
          u_w: (lastWith - self.data.s_h * (self.data.num + 1)) / self.data.num,
        });
        var width = (self.data.all_width = res.windowWidth),
          _w = 0,
          row = 0,
          column = 0;
        var arr = self.data.myTagData;
        arr.forEach(function (n, i) {
          n.left = (self.data.u_w + self.data.s_h) * row + self.data.s_h - 10;
          n.top = (self.data.u_h + self.data.s_v) * column + self.data.s_v;
          n._left = n.left;
          n._top = n.top;
          _w += self.data.u_w + self.data.s_h;
          if (_w + self.data.u_w + self.data.s_h > width) {
            _w = 0;
            row = 0;
            column++;
          } else {
            row++;
          }
        });
        self.setData({
          myTagData: arr,
        });
      },
    });
  },
  movestart: function (e) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
    x1 = e.currentTarget.offsetLeft;
    y1 = e.currentTarget.offsetTop;
    lastX = x;
    lastY = y;
    this.setData({
      current: e.target.dataset.index,
      move_x: x1,
      move_y: y1,
    });
  },
  move: function (e) {
    if (e.currentTarget.dataset.index !== 0) {
      var self = this,
        _x = e.touches[0].clientX,
        _y = e.touches[0].clientY;
      x2 = _x - x + x1;
      y2 = _y - y + y1;
      var underIndex = this.getCurrnetUnderIndex();
      if (
        underIndex != null &&
        underIndex != this.data.current &&
        Math.sqrt((_x - lastX) * (_x - lastX) + (_y - lastY) * (_y - lastY)) <
          this.data.speed
      ) {
        var arr = [].concat(this.data.myTagData);
        this.changeArrayData(arr, underIndex, this.data.current);

        this.setData({
          myTagData: arr,
          current: underIndex,
        });
      }

      lastX = _x;
      lastY = _y;
      this.setData({
        move_x: x2,
        move_y: y2,
      });
    }
  },
  moveend: function (e) {
    this.setData({
      current: -1,
    });
  },
  changeArrayData: function (arr, i1, i2) {
    var temp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = temp;
    var _left = arr[i1]._left,
      _top = arr[i1]._top;
    arr[i1]._left = arr[i2]._left;
    arr[i1]._top = arr[i2]._top;
    arr[i2]._left = _left;
    arr[i2]._top = _top;

    var left = arr[i1].left,
      top = arr[i1].top;
    arr[i1].left = arr[i2].left;
    arr[i1].top = arr[i2].top;
    arr[i2].left = left;
    arr[i2].top = top;
  },
  getCurrnetUnderIndex: function (endx, endy) {
    //获取当前移动下方index
    var endx = x2 + this.data.u_w / 2,
      endy = y2 + this.data.u_h / 2;
    var v_judge = false,
      h_judge = false,
      column_num = Math.ceil(
        (this.data.all_width - this.data.s_h) / (this.data.s_h + this.data.u_w)
      );
    var _column =
      ((endy - this.data.s_v) / (this.data.u_h + this.data.s_v)) >> 0;
    var min_top = this.data.s_v + _column * (this.data.u_h + this.data.s_v),
      max_top = min_top + this.data.u_h;
    if (endy > min_top && endy < max_top) {
      v_judge = true;
    }
    var _row = ((endx - this.data.s_h) / (this.data.u_w + this.data.s_h)) >> 0;
    var min_left = this.data.s_h + _row * (this.data.u_w + this.data.s_h),
      max_left = min_left + this.data.u_w;
    if (endx > min_left && endx < max_left) {
      h_judge = true;
    }
    if (v_judge && h_judge) {
      var index = _column * column_num + _row;
      if (index > this.data.myTagData.length - 1) {
        //超过了
        return null;
      } else {
        return index;
      }
    } else {
      return null;
    }
  },
});
