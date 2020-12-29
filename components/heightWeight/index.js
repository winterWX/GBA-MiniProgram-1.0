const util = require('../../utils/util');
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blockForData: {
      type: Object,
      value: {},
      observer(value) {
        console.log('value',value) 
      }
    },
    height: {
      type: String,
      value: '',
      observer(value) {
        console.log('value',value)
      }
    },    
    weight: {
      type: String,
      value: '',
      observer(value) {
        console.log('value',value)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    numData:'',
    valData: false
  },
  lifetimes: { // 生命周期
    ready: function () {
        let height = '';
        let weight = '';
        if(this.data.blockForData.titleTop === '记录身高'){
            if(this.data.height !== '--' || this.data.height !== 0){
                height = this.data.height;
            }else{
                height = '';
            }
            this.btnShow(height);
        }
        if(this.data.blockForData.titleTop !== '记录身高'){
            if(this.data.weight !== '--' || this.data.weight !== 0){
                weight= this.data.weight;
            }else{
                weight = '';
            }
            this.btnShow(weight);
        }
        this.setData({numData: this.data.blockForData.titleTop === '记录身高' ? height : weight });
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    inputNum(e){
        let that = this; 
        if (!(/^([1-9][0-9]{1,2})$/.test(e.detail.value))) {         
          console.log('不正常',e.detail.value)
          that.setData({
            valData :true
          })
        }else{
          that.setData({valData : false });
          that.setData({
            numData: e.detail.value
          })
        }
    },
    saveNum(){
      let that = this;
      if(that.data.valData){
         return;
      }else{
        let addUrl = app.globalData.baseUrl + '/remote/bodyData/add';
        let editUrl = app.globalData.baseUrl + '/remote/bodyData/edit';
        let url = that.data.valueData !== true ? editUrl : addUrl;
        let method = 'POST';
        const params = {
          weight: this.data.blockForData.titleTop === '记录体重' ? that.data.numData: '',
          height: this.data.blockForData.titleTop === '记录身高' ? that.data.numData: ''
        };
        util.wxAjax(method,url,params).then(res=>{
            if (res.data.code === 200) {
              wx.showToast({
                title: '保存成功',
              })
              that.closeBalck()
            }
        });
        // wx.request({
        //   method: 'POST',
        //   url: that.data.valueData !== true ? editUrl : addUrl,
        //   header: {
        //     "Content-Type": "application/json;charset=UTF-8",
        //     "token": app.globalData.token,
        //     "native-app": "mini"
        //   },
        //   data:{
        //     weight: this.data.blockForData.titleTop === '记录体重' ? that.data.numData: '',
        //     height: this.data.blockForData.titleTop === '记录身高' ? that.data.numData: ''
        //   },
        //   success: (res) => {
        //     if (res.data.code === 200) {
        //         wx.showToast({
        //           title: '保存成功',
        //         })
        //         that.closeBalck()
        //     }
        //   }
        // })
      }
    },
    closeBalck(){
      let that = this;
      that.triggerEvent('closeBalck',{
         close:false
      },{})
    },
    btnShow(numData){
      let that = this; 
      if (!(/^([1-9][0-9]{1,2})$/.test(numData))) {         
          that.setData({valData :true});
      }else{
          that.setData({valData : false });
      }
    }
  }
})
