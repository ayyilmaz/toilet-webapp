// 引入SDK核心类
var QQMapWX = require('../../resources/map/qqmap-wx-jssdk.js');
var qqmapsdk;
//获取应用实例
var app = getApp()
Page({
  data: {
    list: [],
    latitude: 0,
    longitude: 0,
    scrollTop: 0,
    size: 0,
    onLine: true,
    noAuth: false,
    yesAuth: true
  },
  // 页面加载
  onLoad: function() {
    wx.showLoading({
      title: "获取数据中,别急!"
    });
  },
  // 页面显示
  onShow() {
    this.getData();
  },
  //获取数据
  getData: function() {
    var that = this;
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: '2EQBZ-3XM36-RUTSG-MIO6B-GXH4E-B3FC5'
    });
    //确保人员再次移动进行定位，获取经纬度
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        //console.log(res.accuracy);
        //设置经纬度值
        that.setData({
          latitude: latitude,
          longitude: longitude
        });
        //源码里面查询的是附近一公里的哦
        qqmapsdk.search({
          keyword: '厕所',
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function(res) {
            //有可能是参数有问题或者是网络
            that.setData({
              onLine: true
            });
            //根据返回的结果marker在地图上面
            let i = 0;
            var data = res.data.map(function(item) {
              item["NO"] = i++;
              return item;
            });
            that.setList(data);
            //关闭loading
            wx.hideLoading();
            //震动提示
            wx.vibrateLong();
          },
          fail: function() {
            //关闭loading
            wx.hideLoading();
            //有可能是参数有问题或者是网络
            that.setData({
              onLine: false,
              noAuth: false,
              yesAuth: true
            });
          }
        });
      },
      fail: function(json) {
        //关闭loading
        wx.hideLoading();
        //没有权限
        that.setData({
          noAuth: true,
          yesAuth: false
        });
      }
    });
  },
  //组装数据信息
  setList: function(data) {
    var that = this;
    var result = [];
    //循环遍历数据， 其实不做这一步也行
    data.forEach(function(item, index) {
      //替换一些不必要的大信息
      var reg = new RegExp(item.ad_info.province + item.ad_info.city + item.ad_info.district);
      var briefAddr = item.address.replace(reg, "");
      //组装数据
      result.push({
        distance: item["_distance"],
        briefAddr: briefAddr,
        address: item.address,
        category: item.category,
        id: item.id,
        latitude: item.location.lat,
        longitude: item.location.lng,
        name: item.title,
        no: item.NO
      });
    });
    //设置data
    that.setData({
      list: result,
      size: result.length,
      noAuth: false,
      yesAuth: true
    });
  },
  //点击列表显示本地导航信息
  tapItem: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var toilet = that.findMarkerById(id);
    //跳转传输的值
    var param = {
      //基本的信息
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      list: that.data.list,
      //目的地点 基本的信息
      destination: toilet.longitude + "," + toilet.latitude,
      briefAddr: toilet.briefAddr,
      name: toilet.name
    }
    //FIXME 不让用户选择，直接打开
    //让用户选择是使用本地自带地图还是小程序地图导航
    /*
    wx.showActionSheet({
      itemList: ['高德/百度地图导航', '本地小程序导航'],
      success: function (res) {
        if (res.tapIndex){
          wx.navigateTo({
            url: '../location/location?param=' + JSON.stringify(param)
          });
        }else{
          //打开本地应用进行导航
          wx.openLocation({
            latitude: param.latitude,
            longitude: param.longitude,
            name: param.name,
            address: param.briefAddr,
            scale: 28
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '你可以选择一个看看效果,行不行再说',
          icon: 'none',
          duration: 2000
        })
      }
    });
    */
    //打开本地应用进行导航
    wx.openLocation({
      latitude: param.latitude,
      longitude: param.longitude,
      name: param.name,
      address: param.briefAddr,
      scale: 30
    });
  },
  //根据marker唯一id查询信息
  findMarkerById: function(id) {
    var that = this,
      result = {};
    var list = that.data.list;
    //查询数据信息
    for (var i = 0; i < list.length; i++) {
      if (id === list[i].id) {
        result = list[i];
        break;
      }
    }
    return result;
  },
  // 数据更新
  doRefresh: function() {
    wx.showLoading({
      title: "数据更新中,别急!"
    });
    this.getData();
  },
  //再次获取权限
  doAuth: function() {
    var that = this;
    wx.openSetting({
      success: (res) => {
        that.doRefresh();
      }
    })
  },
  // 跳转到地图显示信息界面
  doNavToLocation: function() {
    var that = this;
    //跳转传输的值
    var param = {
      latitude: that.data.latitude,
      longitude: that.data.longitude,
      list: that.data.list,
      //目的地点，默认获取最近一个点
      destination: that.data.list[0]["longitude"] + "," + that.data.list[0]["latitude"],
      briefAddr: that.data.list[0]["briefAddr"],
      name: that.data.list[0]["name"]
    }
    //FIXME 不让用户选择
    //让用户选择是使用本地自带地图还是小程序地图导航
    /*
    wx.showActionSheet({
      itemList: ['高德/百度地图导航', '本地小程序导航'],
      success: function (res) {
        if (res.tapIndex) {
          wx.navigateTo({
            url: '../location/location?param=' + JSON.stringify(param)
          });
        } else {
          //打开本地应用进行导航
          wx.openLocation({
            latitude: param.latitude,
            longitude: param.longitude,
            name: param.name,
            address: param.briefAddr,
            scale: 28
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '你可以选择一个看看效果,行不行再说',
          icon: 'none',
          duration: 2000
        })
      }
    });
    */
    wx.openLocation({
      latitude: param.latitude,
      longitude: param.longitude,
      name: param.name,
      address: param.briefAddr,
      scale: 28
    });
  },
  // 关于按钮
  doAbout: function() {
    wx.navigateTo({
      url: '../author/author'
    })
  },

  onShareAppMessage: function() {

  }
})