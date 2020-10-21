//南网五省地图（第一级地图）的ID、Name、Json数据
var areaId = 100000;//根据角色权限修改 省市对应编号可在json/map/china-main-city-map.js找到
var areaName = '南网五省'//根据角色权限修改

var areaJson = null;

//记录父级ID、Name
var mapStack = [];
var parentId = null;
var parentName = null;

$(function () {//dom加载后执行
    mapChart('mapChart')
})



/**
 * 根据Json里的数据构造Echarts地图所需要的数据
 * @param {} mapJson 
 */
function initMapData(mapJson) {
    var mapData = [];
    for (var i = 0; i < mapJson.features.length; i++) {
    	// var ifMin = mapJson.features[i].properties.hasOwnProperty('childrenNum')&&mapJson.features[i].properties.childrenNum==0;
        mapData.push({
            name: mapJson.features[i].properties.name,
            // value: ifMin? -2 : Math.random() * 1000,
            value: Math.random() * 1000,
			parent: mapJson.features[i].properties.parent.adcode,
        })
    }
    return mapData;
}

/**
 * 返回上一级地图
 */
function back() {
    if (mapStack.length != 0) {//如果有上级目录则执行
        var map = mapStack.pop();
        $.get('./asset/json/map/' + map.mapId + '.json', function (mapJson) {
            registerAndsetOption(myChart, map.mapId, map.mapName, mapJson, false)
            //返回上一级后，父级的ID、Name随之改变
            parentId = map.mapId;
            parentName = map.mapName;

        })

    }

}
/**
 * Echarts地图
 */

//Echarts地图全局变量，主要是在返回上级地图的方法中会用到
var myChart = null;
function mapChart(divid) {

    $.get('./asset/json/map/' + areaId + '.json', function (mapJson) {
        areaJson = mapJson;
        myChart = echarts.init(document.getElementById(divid));
        registerAndsetOption(myChart, areaId, areaName, mapJson, false)
        parentId = areaId;
        parentName = areaName;
        myChart.on('click', function (param) {
            var cityId = cityMap[param.name]
            if (cityId) {//代表有下级地图
                $.get('./asset/json/map/' + cityId + '.json', function (mapJson) {
        			echarts.registerMap(param.name, mapJson);
                    registerAndsetOption(myChart, cityId, param.name, mapJson, true)
                })
            } else {
                //没有下级地图，回到一级中国地图，并将mapStack清空
                registerAndsetOption(myChart, areaId, areaName, areaJson, false)
                mapStack = []
                parentId = areaId;
                parentName = areaName;
            }
        
        });

    })
}

/**
 * 
 * @param {*} myChart 
 * @param {*} id        省市县Id
 * @param {*} name      省市县名称
 * @param {*} mapJson   地图Json数据
 * @param {*} flag      是否往mapStack里添加parentId，parentName
 */
var scatterArray = [];//散点数据
function registerAndsetOption(myChart, id, name, mapJson, flag) {
	scatterArray = [];
	echarts.registerMap(name, mapJson);
	mapJson.features.forEach(function(cv,index,arr){
		var temp = {};
		if(typeof cv.properties.center == 'object'){
			temp = {
				name: cv.properties.name,
				value:[cv.properties.center[0],cv.properties.center[1],Math.floor(Math.random() * 100)],
			};
		}else{
			centerTemp = cv.properties.center.split(',');
			temp = {
				name: cv.properties.name,
				value:[centerTemp[0], centerTemp[1],Math.floor(Math.random() * 100)],
			};
		}
		scatterArray.push(temp)
	})
	scatterArray.push({name: '最低点',value:[0, 0, 0]})
	myChart.setOption({
		visualMap: [{
			 type: 'continuous',
			 seriesIndex: 0,
			 text: ['scatter3D'],
			 calculable: true,
			 max: 100,
			 inRange: {
				 color: ['#87aa66', '#eba438', '#d94d4c']
			 }
		 }],
		tooltip:{
			trigger: 'item',
			position: 'right',
			formatter: function(params) {
				if(params.seriesIndex == 0){
					
				}else{
					return params.name
				}
			}
		},
		geo3D: {
		    map: name,
		    itemStyle: {
		        areaColor: '#00468f', 
		        opacity: 1,
		        borderWidth: 1,
		        borderColor: '#fff'
		    },
		    label: {
		        show: true,
		        textStyle: {
		            color: '#fff', //地图初始化区域字体颜色
		            fontSize: 16,
		            fontWeight: 'bold',
		            opacity: 1,
		        }
		    },
		    emphasis: { //当鼠标放上去  地区区域是否显示名称
		        label: {
		            show: true,
		            textStyle: {
		                fontSize: 18,
		            },
		        },
				itemStyle:{
					areaColor: 'rgb(13,134,255)',
				}
		    },
		    light: { //光照阴影
		        main: {
		            color: '#fff', //光照颜色
		            intensity: 1.2, //光照强度
		            shadow: true, //是否显示阴影
					shadowQuality: 'medium',
		            alpha: 55,
		            beta: 10
		    	
		        },
		        ambient: {
		            intensity: 0.1
		        }
		    },
		},
		roam: false,
	    series: [
			{
				 name: 'scatter3D',
				 type: "scatter3D",
				 coordinateSystem: 'geo3D',
				 symbol: 'pin',
				 symbolSize: 30,
				 opacity: 1,
				 label: {
					 show: false,
				 },
				 itemStyle: {
					 borderWidth: 0.5,
					 borderColor: '#fff'
				 },
				 emphasis: {
					 label:{
						 show: true,
						 position: 'top',
						 formatter: function(param){
							 return param.data.value[2]
						 }
					 }
				 },
				 data: scatterArray
			 },
		]
	},true);

    if (flag) {//往mapStack里添加parentId，parentName,返回上一级使用
        mapStack.push({
            mapId: parentId,
            mapName: parentName
        });
        parentId = id;
        parentName = name;
    }
    if(name == areaName){
		$('.backBtn').hide();
	}else{
		$('.backBtn').show();
	}
}
