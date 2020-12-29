const app = getApp();
const util = require('../../utils/util');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    activeData: {
      type: Object,
      observer(value) {              
        if (Object.keys(value).length !== 0){
            this.cardTopShow(value);
            this.cardDayShow(value);
        } 
      }
    },
    infoLevel: {
      type: Object,
      observer(value) {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
      touch:{
        startX:0,
        startY:0,
        endX:0,
        endY:0
      },
      leftImage:0,
      imageFlg:false,
      levelExpiryTime:'',
      nextLevelIntegral:'',
      seliverBlockShow : false,
      windowWidth: 100+'%',
      infoLevelObj:{},
      duration: 500,
      paddingLeft:0,
      currentNum: -1,
      levelSecondeFour:false,
      levelFive:false,
      fristCaredShow:false,
      secondeCardShow:false,
      threeCardShow:false
  },
  methods: {
    cardTopShow(value){
      if(value.level === 1){
          this.setData({ currentNum: 0,fristCaredShow:true,seliverBlockShow: true});
      }else if(value.level === 2 || value.level === 4){
          this.setData({levelSecondeFour:true,seliverBlockShow: true});
      }else if(value.level === 3 || value.level === 5){
          this.setData({seliverBlockShow:true});
      }
    },
    cardChange(event){
        let cardNum = event.detail.current;
        if(cardNum === 0){
            this.setData({fristCaredShow:true,secondeCardShow:false});
            if(this.data.activeData.level === 1){this.setData({seliverBlockShow:true});}
        }else if(cardNum === 1){
            this.setData({secondeCardShow:true,fristCaredShow:false,threeCardShow:false,seliverBlockShow:false});
        }else if(cardNum === 2){
            this.setData({threeCardShow:true,secondeCardShow:false,fristCaredShow:false,seliverBlockShow:false});
        }
        this.searchLeve(cardNum + 1);
    },
    cardChangeSeconde:function(event){
        let cardNum = event.detail.current;
        if(cardNum === 0){
           this.setData({levelSecondeFour: true,levelFive: false});
           if(this.data.activeData.level === 2 || this.data.activeData.level === 4){
              this.setData({seliverBlockShow:true});
          }
        }else if(cardNum === 1){
            this.setData({levelFive: true,levelSecondeFour: false,seliverBlockShow:false});
        }
        this.searchLeve(cardNum + 2);
    },
    upgradeCard:function(e){
      let that = this;
      let cardUp = e.target.dataset.card;
      let cardShow = [1,2,4];
      if(cardUp === 'image2' && that.data.activeData.level === 1){
          return;
      }else if(cardUp === 'image3' && cardShow.includes(that.data.activeData.level)){
          return;
      }else{
        wx.navigateTo({
          url: '../../pages/membership/index',
        })
      }
    },
    searchLeve:function(level){
        this.infoLevel(level);
        this.triggerEvent('parentLevel', {
            LockLevel: level
        }, {});
    },
    infoLevel:function(level){
      let that = this;
      let url =  app.globalData.baseUrl + '/remote/tier/info?level='+ level;
      let method = 'GET';
      util.wxAjax(method,url).then(res=>{
          if (res.data.code == 200) {
            that.setData({infoLevelObj:res.data.data})
          }
      });
    },
    intergRalDatails:function(){
        wx.navigateTo({
            url: '../../pages/integralDetails/index',
        })
    },
    myCoupons:function(){
      wx.navigateTo({
          url: '../../pages/myCoupons/index',
      })
    },
    cardDayShow:function(value){
      const date = new Date(value.levelExpiryTime * 1000); 
      const Y = date.getFullYear() + '年';
      const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '月';
      const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + '日';
      this.setData({levelExpiryTime: Y + M + D});
    }
  }
})
