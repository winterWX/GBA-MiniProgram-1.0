var timer = null;
Component({
    properties: {
        stepNum: {
            type: Number,
            value : null,
            observer(value) {
                this.createQueryFun(value)
            }
        },
    },

    data: {
       numStep :0
    },
    
    ready: function () {
        const query = this.createSelectorQuery()
        query.select('#ringTop').boundingClientRect(res => {
            this.topDrawRing('ringTop', res.width, res.height)
        }).exec()
    },

    methods: {
        createQueryFun:function(value){
            clearInterval(timer);
            if(value === null){
                value = 0;
            }
            const query = this.createSelectorQuery()
            query.select('#ring').boundingClientRect(res => {
                 this.drawRing('ring', res.width, res.height,value);
            }).exec()
        },
        topDrawRing: function(canvasId, width, height){
            var context = wx.createCanvasContext(canvasId, this)
            // 外层圆环
            context.beginPath()
            context.arc(width / 2, 40, width / 2 - 70, 1 * Math.PI, 2 * Math.PI,true)
            context.setLineWidth(10)
            context.setLineCap('round')
            context.setStrokeStyle('#ebeeeb')
            context.stroke()
            context.draw()
        },
        drawRing: function (canvasId, width, height,stepNum) {
            clearInterval(timer);
            var context = wx.createCanvasContext(canvasId, this)
            let num = 0;
            let angle = 0;
            timer = setInterval(() => {
                if(Math.abs(num - stepNum) < 100){    // 这里的清除订时器的条件需要改一下
                    num = stepNum;
                    clearInterval(timer);
                }else{
                    num += 100;
                    //外层进度圆环
                    if(num >= 10000){
                        angle = 100;
                    }else{
                        angle = Math.ceil(num / 100);
                    }
                }
                angle = angle === 0 ? 1 : angle;
                context.beginPath()
                context.arc(width / 2, 40, width / 2 - 70, 1 * Math.PI, (1- angle / 100) * Math.PI,true)
                context.setLineWidth(10)
                context.setLineCap('round')
                context.setStrokeStyle('#00a865')
                this.setData({ numStep:num });
                context.stroke()

                // 指示器
                const xAxis = Math.cos(Math.PI * 2 / 360 * (1.8 * (100 - angle))) * (width / 2 - 70)
                const yAxis = Math.sin(Math.PI * 2 / 360 * (1.8 * (100 - angle))) * (width / 2 - 70)
                context.beginPath()
                context.arc(width / 2 + xAxis, 40 + yAxis, 10, 0, 2 * Math.PI,true)
                context.setFillStyle('#CCFFEB')
                context.fill()
                context.beginPath()
                context.arc(width / 2 + xAxis, 40 + yAxis, 4, 0, 2 * Math.PI,true)
                context.setFillStyle('#00a865')
                context.fill()
                context.draw()
            },5);
        }
    }
})
