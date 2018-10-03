// 引入SDK核心类
var QQMapWX = require('../../resources/map/qqmap-wx-jssdk.js');
var qqmapsdk;
//获取应用实例
var app = getApp()
Page({
  data: {
    markers: [],
    briefAddr: null,
    toiletName: null,
    list: [],
    latitude: 0,
    longitude: 0,
    scrollTop: 0,
    size: 0,
    onLine: true,
    noAuth: false,
    yesAuth: true,
    parkingAndToiletFlag: true, //默认是厕所
    button_text_style: 'button-text'
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
        //设置经纬度值
        that.setData({
          latitude: latitude,
          longitude: longitude
        });
        //源码里面查询的是附近一公里的哦
        qqmapsdk.search({
          keyword: that.data.parkingAndToiletFlag ? '厕所' : '停车场',
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
            var data = res.data;
            that.setList(data);
            that.doMapData(that.data.list);
            //关闭loading
            wx.hideLoading();
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
        name: item.title
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
    //打开本地应用进行导航
    wx.openLocation({
      latitude: param.latitude,
      longitude: param.longitude,
      name: param.name,
      address: param.briefAddr,
      scale: 28
    });
  },
  //点击地图上面进行显示
  doMarkertap: function (obj) {
    var that = this;
    //查询marker的详细信息
    var marker = that.getMarkerById(obj.markerId);
    console.log(marker);
    //打开本地应用进行导航
    wx.openLocation({
      latitude: marker.latitude,
      longitude: marker.longitude,
      name: marker.toiletName,
      address: marker.briefAddr,
      scale: 28
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
  // 选择是否查询什么
  doParkingAndToilet: function() {
    var that = this;
    that.setData({
      parkingAndToiletFlag: !that.data.parkingAndToiletFlag
    });
    wx.showLoading({
      title: "数据更新中,别急!"
    });
    this.getData();
  },
  // 关于按钮
  doAbout: function() {
    wx.navigateTo({
      //url: '../author/author'
      url: '../function/function'
    })
  },
  //组装地图上的数据
  doMapData: function(list) {
    var that = this;
    var result = [];
    //数据组装
    list.forEach(function(item, index) {
      //为零时显示最近的气泡
      if (!index) {
        result.push({
          width: 25,
          height: 25,
          iconPath: "/images/marker.png",
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          briefAddr: item.briefAddr,
          toiletName: item.name,
          callout: {
            content: "离你最近",
            color: "#b5b1b1",
            fontSize: 12,
            borderRadius: 15,
            bgColor: "#262930",
            padding: 10,
            display: 'ALWAYS'
          }
        })
      } else {
        result.push({
          width: 25,
          height: 25,
          iconPath: "/images/marker.png",
          id: item.id,
          latitude: item.latitude,
          longitude: item.longitude,
          briefAddr: item.briefAddr,
          toiletName: item.name
        })
      }
    });
    //赋值
    that.setData({
      markers: result,
      latitude: that.data.latitude,
      longitude: that.data.longitude
    });
  },
  //根据marker的id获取详情信息
  getMarkerById: function (id) {
    var that = this;
    var markers = that.data.markers;
    var len = markers.length;
    var result;
    for (var i = 0; i < len; i++) {
      if (markers[i]["id"] === id) {
        result = markers[i];
        break;
      }
    }
    return result;
  },
  doToilet: function() {
    var that = this;
    that.setData({
      button_text_style: true
    });
    that.setData({
      parkingAndToiletFlag: true
    });
    wx.showLoading({
      title: "数据更新中,别急!"
    });
    this.getData();
  },
  doParking: function () {
    var that = this;
    that.setData({
      button_text_style: false
    });
    that.setData({
      parkingAndToiletFlag: false
    });
    wx.showLoading({
      title: "数据更新中,别急!"
    });
    this.getData();
  }
})