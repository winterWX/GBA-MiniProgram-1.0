// components/integral/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    integral: {
      type: Number,
      observer(value) {
        var numberAarry=[];
        // var result = value / 10 + 1;
      /*   if(value === 100){
          var result = value / 10 + 1
        }else{
          var result = value / 10 + 1
        } */
        // for (var i = 1; i < result; i++){
        //   numberAarry.push(i)
        // }
        this.setData({
          numberAarry: ['00',value],
        })
        setTimeout(() => {
          wx.createSelectorQuery().in(this).selectAll('.itemTxt').boundingClientRect((rects) => {
            const numberHeight = rects.map(item => {
              return item.height
            })
            this.setData({
              numberHeight: numberHeight
            })
            this.startAmation()
          }).exec()

        }, 1000)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    numberAarry:['0','1'],
    numberHeight:[],
    translateY:0,
    animateCompelte:false,
    show:true
  },
  lifetimes: { // 生命周期
    ready: function () {
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    startAmation(){
      var timer=null;
      var num=0;
      var counterNumber=()=>{
        num = num+1
        if (num == this.data.numberAarry.length){ 
          clearInterval(timer)
          setTimeout(()=>{
            this.setData({
              animateCompelte:true,            
            });
            this.setData({
              show: false,
            });
          },2000)         
        }else{
          var translateY=0
          for( var i=0; i<num; i++){
            translateY =translateY+this.data.numberHeight[i]
          }

          this.setData({
            translateY: -translateY
          })
        }

      }
      timer = setInterval(counterNumber,1000)
    },

  }
})
