const app = getApp();
const util = require('../../utils/util');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    receiveStatus: {
      type: String,
      value: '2',
      observer(value) {
        this.observerList(value, 'receiveStatus')
      }
    },
    isDone: {
      type: String,
      value: '2',
      observer(value) {              
        this.observerList(value, 'isdone')
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    continuousComplianceDays:0,
    integral:0,
    days:{
      days:'',
      integral:''
    },  
    nowDay:-1, 
    list:[]
  },
  lifetimes: { // 生命周期
    ready: function () {
      this.getCurrentList()
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    observerList(value,key){     
      if (this.data.list.length > 0) {
        if (value == 1 && this.data.list[this.data.nowDay][key] == 2) {
          this.data.list[this.data.nowDay][key] = value
          if (key =='receiveStatus'){
            this.data.list[this.data.nowDay].iconPath = app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'
            this.setData({
              continuousComplianceDays: this.data.continuousComplianceDays+1
            })
          }
          this.setData({
            list: this.data.list
          })
        }
      } else {
        var timeOut = null
        var countTime=()=> {
          if (this.data.list.length > 0) {
            clearInterval(timeOut)
            if (value == 1 && this.data.list[this.data.nowDay][key] == 2) {
              this.data.list[this.data.nowDay][key] = value
              if (key == 'receiveStatus') {
                this.data.list[this.data.nowDay].iconPath = app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'
              }
              this.setData({
                list: this.data.list
              })
            }
            
          }
        }
        
        timeOut = setInterval(countTime, 500)
      }    
    },
    formateTime(value) {
      //当天凌晨的时间戳
      const h1 = new Date(new Date().setHours(0, 0, 0, 0)) / 1000 
      //当天时间截止的时间戳
      const h2 = new Date(new Date().setHours(23, 59, 59, 999))/1000
    },
    getCurrentList(){  //获取打卡列表
      // wx.showLoading({
      //   title: 'loading...',
      // })
      //Date.parse(new Date()) / 1000 
      let url =  app.globalData.baseUrl + '/remote/challenge/currentList';
      let method = 'POST';
      let data = { "currentTime": Date.parse(new Date()) / 1000 };
      util.wxAjax(method,url,data).then(res=>{
          if (res.data.code === 200) {         
            var len = res.data.data.length;
            var isDoneState = res.data.data[len-1].isdone;
            var continuousComplianceDays = 0;
            
            if (res.data.data[len - 1].isdone == 1){
              continuousComplianceDays = len
            }else{
              continuousComplianceDays = len - 1
            }
            
            this.setData({
              continuousComplianceDays: continuousComplianceDays
            })
            
            var index=len%7
            var k = parseInt(len / 7)*7
            var list=[];
 
            let dayText = {};
            if(index ==0){
              list = res.data.data.slice(-7)
              k=k-7           
            }else if(index>0){
              list = res.data.data.slice(-index)
              k = res.data.data.length - index
            }
          // var list = res.data.data.splice(len-index)
            var lastTime=0
            var newList=[]
            for (var i=0; i<7; i++) {
              var item={}
              k=k+1
              if(i < list.length){
                item = list[i]
                lastTime=item.createTime
              }else{
                item={
                  createTime: lastTime + (24 * 60 * 60) * (i-list.length+1),                 
                  isdone: "2",
                  receiveStatus: "2",
                  startTime: lastTime + (24 * 60 * 60) * (i - list.length+1),
                  continuousComplianceDays: -1                 
                }
              }
              //当天凌晨的时间戳
              const h1 = new Date(new Date().setHours(0, 0, 0, 0)) / 1000;
              //当天时间截止的时间戳
              const h2 = new Date(new Date().setHours(23, 59, 59, 999)) / 1000;
              var reward = 10;
              if (k == 7) {
                  if(isDoneState == 1){
                      if (i == 6) {
                        reward = 50;
                        this.setData({
                            days: {
                              day: k -this.data.continuousComplianceDays == 0 ? '再坚持7天' : `再坚持${k -this.data.continuousComplianceDays}天`,
                              integral: '领'+ 50 + '积分'
                            }
                        })
                      }
                  }else{
                    if (i == 6) {
                        reward = 50;
                        this.setData({
                          days: {
                            day: `坚持${k - (this.data.continuousComplianceDays % k)}天`,
                            integral: '领'+ 50 + '积分'
                          }
                        })
                    }
                  }
              }else if( k == 14) {
                if(isDoneState == 1){
                  if (i == 6) {
                    reward = 50;
                    this.setData({
                      days: {
                        day: k -this.data.continuousComplianceDays == 0 ? '再坚持7天' : `再坚持${k -this.data.continuousComplianceDays}天`,
                        integral: '领' + 50 + '积分'
                      }
                    })
                  }
                }else{
                  if (i == 6) {
                    reward = 50;
                    this.setData({
                      days: {
                        day: `再坚持${k - (this.data.continuousComplianceDays % k)}天`,
                        integral: '领' + 50 + '积分'
                      }
                    })
                  }
                }
              }else if( k == 21) {
                if(isDoneState == 1){
                    if (i == 6) {
                      reward = 100;
                      this.setData({
                        days: {
                          day: k -this.data.continuousComplianceDays == 0 ? '再坚持7天' : `再坚持${k -this.data.continuousComplianceDays}天`,
                          integral: '领' + 100 + '积分'
                        }
                      })
                    }
                }else{
                    if (i == 6) {
                      reward = 50;
                      this.setData({
                        days: {
                          day: `再坚持${k - (this.data.continuousComplianceDays % k)}天`,
                          integral: '领' +50 + '积分'
                        }
                      })
                    }
                }
              }else if(21 < k && k <= 28) {
                let leftData = 28 - this.data.continuousComplianceDays;
                if(isDoneState == 1){
                    if (i == 6) {
                      reward = 100;
                      this.setData({
                        days: {
                          day: leftData > 0 ? `再坚持${leftData}天` : '恭喜连续28天达标',         
                          integral: leftData > 0  ? '领' +100 + '积分' :  ''
                        }
                      })
                    }
                }else{
                    if (i == 6) {
                      reward = 100;
                      this.setData({
                        days: {
                            day: leftData > 0 ? `再坚持${leftData}天` : '再坚持1天',         
                            integral: leftData > 0 ? '领' +100 + '积分' : '拿' + 100 +'积分'
                        }
                      })
                    }
                }
              }
              var dayName =''
              var iconPath =  app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'
              if (h1 <= item.createTime && item.createTime <= h2){
                dayName="今日"
                if (item.receiveStatus == '2'){
                  iconPath =  app.globalData.imagesUrl + '/images/icon-' + reward + '-points@2x.png'
                }
                this.setData({
                  nowDay:i
                })
                
              } else if ((h1 - 24 * 60 * 60) <= item.createTime && item.createTime <h1) {
                dayName = "昨天"
                if (Date.parse(new Date()) / 1000 < h1 + 24 * 60 * 60) {   // Date.parse(new Date()) / 1000 < h1 + 10 * 60 * 60
                    if(item.receiveStatus == 2){
                        //iconPath =  app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'     
                        iconPath =  app.globalData.imagesUrl + '/images/icon-' + reward + '-points@2x.png'
                    }              
                } else {
                  iconPath =  app.globalData.imagesUrl + '/images/icon-' + reward + '-points-black@2x.png'
                  reward = 0
                }

              }else{   
                dayName = '第' + k + '天'             
                if(item.isdone =="1"){
                  //dayName = '第' + k + '天'
                  if (item.receiveStatus == '2'){
                    iconPath =  app.globalData.imagesUrl + '/images/icon-' + reward + '-points-black@2x.png'
                  }
                  reward = 0
                }else{
                  //dayName = '第' + k + '天'
                  if (item.receiveStatus == '2') {
                    iconPath =  app.globalData.imagesUrl + '/images/icon-' + reward + '-points@2x.png'
                  }
                }
                
              }

              const otherItem={
                dayName: dayName,
                reward: reward, 
                iconPath: iconPath  
              }
              item = { ...item, ...otherItem}
              newList.push(item)
            }
            this.setData({
              list: newList
            })
          } else {
            wx.showModal({
              showCancel: false,
              content: res.message,
              success: (res) => { }
            })
          }
          wx.hideLoading()
      });
    },   
    receiveIntegral(e){
      const item = e.currentTarget.dataset.item
      const index = e.currentTarget.dataset.index      
      if (item.receiveStatus === '2' && item.isdone ==='1' && item.dayName === '今日'){
        this.todayIntegral(item, index)
      } else if (item.receiveStatus === '2' && item.isdone === '1' && item.dayName === '昨天' && item.reward !=0){
        this.yesterdayIntegral(item,index)
      }
    },
    todayIntegral(item,i){//领取积分      
        wx.showLoading({
          title: 'loading...',
        })
        let url =  app.globalData.baseUrl + '/remote/today/receiveIntegral';
        let method = 'GET';
        util.wxAjax(method,url).then(res=>{
              if (res.data.code === 200) {
                var list=this.data.list
                list[i].receiveStatus=1
                this.data.list[i].iconPath =  app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'
              this.setData({
                list:list,
                integral: list[i].reward
              })
                this.triggerEvent('todayIntegral')
              } else {
                wx.showModal({
                  showCancel: false,
                  content: res.data.message,
                  success: (res) => { }
                })
              }
              wx.hideLoading()
        });       
        // wx.request({
        //   method: 'get',
        //   url: app.globalData.baseUrl + '/remote/today/receiveIntegral',
        //   header: {
        //     "Content-Type": "application/json;charset=UTF-8",
        //     "token": app.globalData.token,
        //     "native-app": "mini"
        //   },        
        //   success: (res) => {
        //     if (res.data.code === 200) {
        //       var list=this.data.list
        //       list[i].receiveStatus=1
        //       this.data.list[i].iconPath =  app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'
        //      this.setData({
        //        list:list,
        //        integral: list[i].reward
        //      })
        //       this.triggerEvent('todayIntegral')
        //     } else {
        //       wx.showModal({
        //         showCancel: false,
        //         content: res.data.message,
        //         success: (res) => { }
        //       })
        //     }
        //     wx.hideLoading()
        //   }
        // })
    },
    yesterdayIntegral(item,i) {  //补领积分      
      wx.showLoading({
        title: 'loading...',
      })
      const parms = {
        challengeId:  item.id +'',
        receivePoints: item.reward +''
      }
      let url =  app.globalData.baseUrl + '/remote/challenge/makeup';
      let method = 'POST';
      util.wxAjax(method,url,parms).then(res=>{
          if (res.data.code === 200) {
            var list = this.data.list
            list[i].receiveStatus = 3;    // 3 补领后
            this.data.list[i].iconPath = app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'
            this.setData({
              list: list,
              integral: list[i].reward
            })
            this.triggerEvent('yesterdayIntegral')
          } else {
            wx.showModal({
              showCancel: false,
              content: res.message,
              success: (res) => { }
            })
          }
          wx.hideLoading()
      });
      // wx.request({
      //   method: 'post',
      //   url: app.globalData.baseUrl + '/remote/challenge/makeup',
      //   header: {
      //     "Content-Type": "application/json;charset=UTF-8",
      //     "token": app.globalData.token,
      //     "native-app": "mini"
      //   },
      //   data: parms,
      //   success: (res) => {
      //     if (res.data.code === 200) {
      //       var list = this.data.list
      //       list[i].receiveStatus = 1
      //       this.data.list[i].iconPath =  app.globalData.imagesUrl + '/images/icon-got-the-points@2x.png'
      //       this.setData({
      //         list: list,
      //         integral: list[i].reward
      //       })
      //       this.triggerEvent('yesterdayIntegral')
      //     } else {
      //       wx.showModal({
      //         showCancel: false,
      //         content: res.message,
      //         success: (res) => { }
      //       })
      //     }
      //     wx.hideLoading()
      //   }
      // }
    },
    gotoHistory(){
      wx.navigateTo({
        url: '../history/index',
      })
    }
  }
})
