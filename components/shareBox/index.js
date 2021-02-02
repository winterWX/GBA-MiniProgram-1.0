const app = getApp();
Component({
  properties: {
    //属性值可以在组件使用时指定
    isCanDraw: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        newVal && this.drawPic()
      }
    }
  },
  data: {
    isModal: false, //是否显示拒绝保存图片后的弹窗
    imgDraw: {}, //绘制图片的大对象
    sharePath: '', //生成的分享图
    visible: false
  },
  methods: {
    handlePhotoSaved() {
      this.savePhoto(this.data.sharePath)
    },
    handleClose() {
      this.setData({
        visible: false
      })
    },
    drawPic() {
      if (this.data.sharePath) { //如果已经绘制过了本地保存有图片不需要重新绘制
        this.setData({
          visible: true
        })
        this.triggerEvent('initData') 
        return
      }
      wx.showLoading({
        title: '生成中'
      })
      this.setData({
        imgDraw: {
          width: '750rpx',
          height: '1000rpx',
          background:  app.globalData.imagesUrl + '/images/recommend/poster@2x.png',
          views: [
            {
              type: 'image',
              url: app.globalData.userInfo.avatarUrl,
              css: {
                top: '55rpx',
                left: '0rpx',
                right: '315rpx',
                width: '102rpx',
                height: '102rpx',
                borderRadius: '50rpx'
              },
            },
            {
              type: 'text',
              text: app.globalData.userInfo.nickName,
              css: {
                top: '195rpx',
                fontSize: '28rpx',
                left: '375rpx',
                align: 'center',
                color: 'rgb(155,124,86)'
              }
            },
            {
              type: 'text',
              text: `邀你一起赚积分，换豪礼`,
              css: {
                top: '250rpx',
                left: '375rpx',
                align: 'center',
                fontSize: '28rpx',
                color: 'rgb(155,124,86)'
              }
            },
            {
              type: 'image',
              url: app.globalData.imagesUrl + '/images/recommend/gift@2x.png',
              css: {
                top: '320rpx',
                left: '375rpx',
                width: '220rpx',
                height: '202rpx',
                align: 'center',
              }
            },
            {
              type: 'text',
              text: `${app.globalData.userInfo.nickName}在恒生Olive赚取积分享健康好礼，跟我来一起玩呀！`,
              css: {
                top: '480rpx',
                left: '375rpx',
                width:'336rpx',
                align: 'center',
                color: 'rgb(102,102,102)',
                fontSize: '18rpx',
                lineHeight:'25rpx'
              }
            },
            {
              type: 'image',
              url: app.globalData.imagesUrl + '/images/recommend/shared.jpg',
              css: {
                top: '540rpx',
                left: '0rpx',
                right: '270rpx',
                width: '200rpx',
                height: '200rpx'
              }
            },
            {
              type: 'text',
              text: '长按一起来玩吧',
              css: {
                top: '740rpx',
                left: '375rpx',
                align: 'center',
                fontSize: '13.4rpx',
                color: 'rgb(102,102,102)'
              }
            },
          ]
        }
      })
    },
    onImgErr(e) {
      wx.hideLoading()
      wx.showToast({
        title: '生成分享图失败，请刷新页面重试'
      })
    },
    onImgOK(e) {
      wx.hideLoading()
      this.setData({
        sharePath: e.detail.path,
        visible: true,
      })
      //通知外部绘制完成，重置isCanDraw为false
      this.triggerEvent('initData') 
    },
    preventDefault() { },
    // 保存图片
    savePhoto(path) {
      wx.showLoading({
        title: '正在保存...',
        mask: true
      })
      this.setData({
        isDrawImage: false
      })
      wx.saveImageToPhotosAlbum({
        filePath: path,
        success: (res) => {
          wx.showToast({
            title: '保存成功',
            icon: 'none'
          })
          setTimeout(() => {
            this.setData({
              visible: false
            })
          }, 300)
        },
        fail: (res) => {
          wx.getSetting({
            success: res => {
              let authSetting = res.authSetting
              if (!authSetting['scope.writePhotosAlbum']) {
                this.setData({
                  isModal: true
                })
              }
            }
          })
          setTimeout(() => {
            wx.hideLoading()
            this.setData({
              visible: false
            })
          }, 300)
        }
      })
    }
  }
})
