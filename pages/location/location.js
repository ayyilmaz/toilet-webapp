// 引入SDK核心类
var amapFile = require('../../resources/map/amap-wx.js');
var amapInstance;
//获取应用实例
var app = getApp()
Page({
  //数据信息
  data: {
    markers: [],
    longitude: 0,
    latitude: 0,
    distance: '',
    cost: '',
    polyline: [],
    origin: '',
    destination: '',
    dialogFlag: 'dialog-hide'
  },
  //页面加载事件
  onLoad: function (option) {
    var that = this;
    //初始化地图接口实例
    amapInstance = new amapFile.AMapWX({ key: 'cd17f895f7d70ef688f4bf600e067a8e' });
    var param = JSON.parse(option.param);
    var list = param.list,
      //中心点位置
      latitude = param.latitude,
      longitude = param.longitude,
      destination = param.destination,
      name = param.name,
      address = param.address;
    var result = [];
    //数据组装
    list.forEach(function (item) {
      result.push({
        iconPath: "/images/marker.png",
        id: item.id,
        latitude: item.latitude,
        longitude: item.longitude,
        width: 40,
        height: 40
      })
    });
    //赋值
    that.setData({
      markers: result,
      latitude: latitude,
      longitude: longitude,
      destination: destination,
      name: name,
      address: address,
    });
    //判断用户点击的是撒点还是列表
    if (destination) {
      that.doWalkingRoute(destination);
    }
  },
  //点击marker事件
  doMarkertap: function (obj) {
    var that = this;
    var marker = that.getMarkerById(obj.markerId);
    that.doWalkingRoute(marker.longitude + "," + marker.latitude);
    that.setData({
      dialogFlag: 'dialog-show'
    })
  },
  //进行路径规划
  doWalkingRoute: function (destination) {
    var that = this;
    //调用高德地图路径规划
    wx.getLocation({
      type: 'gcj02', //适用于微信的位置精度
      success: function (res) {
        amapInstance.getWalkingRoute({
          origin: res.longitude + "," + res.latitude,
          destination: destination,
          success: function (data) {
            var points = [];
            if (data.paths && data.paths[0] && data.paths[0].steps) {
              var steps = data.paths[0].steps;
              for (var i = 0; i < steps.length; i++) {
                var poLen = steps[i].polyline.split(';');
                for (var j = 0; j < poLen.length; j++) {
                  points.push({
                    longitude: parseFloat(poLen[j].split(',')[0]),
                    latitude: parseFloat(poLen[j].split(',')[1])
                  })
                }
              }
            }
            that.setData({
              polyline: [{
                points: points,
                color: "#0091ff",
                width: 6
              }]
            });
            if (data.paths[0] && data.paths[0].distance) {
              that.setData({
                distance: data.paths[0].distance + '米'
              });
            }
            if (data.paths[0] && data.paths[0].duration) {
              that.setData({
                cost: parseInt(data.paths[0].duration / 60) + '分钟'
              });
            }
          },
          fail: function (info) {
          }
        })
      }
    })
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
  }
})
