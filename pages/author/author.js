//获取应用实例
var app = getApp()
Page({
  // 数据
  data: {},
  // 页面加载
  onLoad: function() {},

  doAuthor: function() {
    wx.setClipboardData({
      data: 'https://github.com/liumingmusic',
      success(res) {
        wx.showToast({
          title: "github地址复制成功"
        })
      }
    })
  },

  doUser: function() {
    wx.setClipboardData({
      data: 'https://liumingmusic.cn',
      success(res) {
        wx.showToast({
          title: "个人博客地址复制成功"
        })
      }
    })
  },

  doBlog: function() {
    wx.setClipboardData({
      data: 'http://blog.csdn.net/liumingm_music',
      success(res) {
        wx.showToast({
          title: "csdn地址复制成功"
        })
      }
    })
  },

  doEmail: function() {
    wx.setClipboardData({
      data: 'liuming_music@163.com',
      success(res) {
        wx.showToast({
          title: "email地址复制成功"
        })
      }
    })
  }
})