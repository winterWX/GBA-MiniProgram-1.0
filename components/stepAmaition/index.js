Component({
  /**
   * 组件的属性列表
   */
  properties: {
    stepNum: {
      type: Number,
      value: 0,
      observer(value) {
        setTimeout(() => {
          var targert = this.data.stepNum < this.data.targetSteps ? this.data.stepNum : this.data.targetSteps
          var rate = targert / this.data.targetSteps
          this.cilcleAmation(0, rate * 100)
        }, 500)
      }
    },
    indexStep:{
      type: String,
      value: false,
      observer(value) {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 0,
    targetSteps: 10000,
    rotateNum: 45
  },

  /**
   * 组件的方法列表
   */
  methods: {
    startNumAmation() {
      var timer = null;
      let progress = 100
      const rate = this.data.stepNum / this.data.targetSteps * 100
      var counterNumber = () => {
        if (progress > rate) {
          clearInterval(timer)
        } else {
          progress++
          var num = parseInt(progress / 100 * this.data.targetSteps)
          this.setData({
            num: num < this.data.stepNum ? num : this.data.stepNum
          })
        }
      }
      timer = setInterval(counterNumber, 50)
    },
    cilcleAmation(start, target) {
      var timerOut = null;
      let progress = start;
      let now = start;
      let num = 0
      //用定时器模拟进度增长
      timerOut = setInterval(() => {
        if (progress > target) {
          clearInterval(timerOut)
          if (this.data.num < this.data.stepNum) {
            this.startNumAmation()
          }
          return;
        } else {
          progress++;
          let deg = progress / 100 * (135 + 45)
          var rotateNum = (deg - 45) > 135 ? 135 : deg - 45;
          var num = parseInt(progress / 100 * this.data.targetSteps)
          this.setData({
            rotateNum: -rotateNum,
            num: num > this.data.targetSteps ? this.data.targetSteps : (num > this.data.stepNum ? this.data.stepNum : num)
          })
        }
      }, 20)
    }
  }
})