 var initialLocation;
 var taipei = new google.maps.LatLng(25.06079047579272, 121.53120506931151);

 var browserSupportFlag =  new Boolean();
 var monsterList = [];
 var otherUserList = new Array()
 var map;

 function initialize() {

  // Create an array of styles.
  var styles = [
  {
    stylers: [
    { hue: "#00ffe6" },
    { saturation: -80 },
    {gamma:0.2}
    ]
  },
  {
    featureType:"road",
    elementType:"geometry.stroke",
    stylers:[
    {lightness:70}
    ]
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [
    
    { visibility: "off" }
    ]
  },

  {
    featureType: "all",
    elementType: "labels",

    stylers: [
    { visibility: "off" }
    ]
  }
  ];

  // Create a new StyledMapType object, passing it the array of styles,
  // as well as the name to be displayed on the map type control.
  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});

  // Create a map object, and include the MapTypeId to add
  // to the map type control.
  var mapOptions = {
    zoom: 16,
    disableDefaultUI:true,
    disableDoubleClickZoom: true,
    scrollwheel: false,
    mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');

  //計算GPS定位次數
  var gpsRunTime = 0;
  var time = 0;
  // Try HTML5 geolocation
  var userPositionMarker;
  if(navigator.geolocation) {
    //即時定位navigator.geolocation.watchPosition(geo_success, geo_error, geo_options);
    navigator.geolocation.watchPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude,
            gps_options);
      if(gpsRunTime>0)//清除舊的使用者位置
        userPositionMarker.setMap(null);

      gpsRunTime++;
      console.log("gpsRunTime="+gpsRunTime);
      userPositionMarker = new google.maps.Marker({
        map: map,
        position: pos,
        label: '我',
        title: 'Location found using HTML5.'
      });
      if(position.coords.latitude!=tempLat && position.coords.longitude!=tempLon){
      //拿怪物資料
      getMonster(position.coords.latitude,position.coords.longitude);
       //送出socket使用者更新後的座標
       socket.emit('location',localStorage.userName,position.coords.latitude,position.coords.longitude);
   }

      //接收其他人座標 
      
      socket.on('location',function(returnData){
        
        $("#socketBar").html("<b>成功收到資料 "+returnData+" </b>");
        
        //如果收到的資料不是自己發出的
        var data = JSON.parse(returnData);
        if(data.username==localStorage.userName){
            console.log("data.username==localStorage.userName  名稱="+data.username);
        }
        else{
            console.log("data.username!=localStorage.userName  名稱="+data.username);
            
          //如果其他人資料表是空的
          if(otherUserList.length == 0){
            Temp=[];
            Temp.push(data.username);
            Temp.push(data.latitude);
            Temp.push(data.longitude);
            //push到資料表裡
            otherUserList.push(Temp);
            console.log("TempPush進去"+Temp+"length==0 otherUserList="+otherUserList);    
        }

          //如果不是空的
          else{
            //尋找這個人是否在資料表裡
            var inTheList = 0;
            console.log("otherUserList的長度="+otherUserList.length);
            for(var i = 0; i<otherUserList.length ;i++){
                console.log("迴圈中  otherUserList的長度="+otherUserList.length);
              //如果在，就更改座標
              console.log("i = "+i+ "otherUserList[i]="+otherUserList[i]);
              var otherUserData = otherUserList[i];
              if(otherUserData[0] == data.username){
                otherUserData[1] = data.latitude;
                otherUserData[2] = data.longitude;
                console.log("原本已經在資料表裡"+otherUserData[0]+ "otherUserList="+otherUserList);  
                inTheList = 1;
                break;
              }
          }
            //如果不在裡面
            if(inTheList == 0){
                
              //push到資料表裡
              Temp=[];
              Temp.push(data.username);
              Temp.push(data.latitude);
              Temp.push(data.longitude);
              //push到資料表裡
              otherUserList.push(Temp);
              console.log("不在資料表裡 已經加入 otherUserList="+otherUserList);
          }
      }
      
      setOtherUserMark(map,otherUserList,time);
      time++;

  }
  
});



 tempLat = position.coords.latitude;
 tempLon = position.coords.longitude;

 map.setCenter(pos);
 setMonsterMarkers(map,monsterList);
}, function() {
    handleNoGeolocation(true);
}, gps_options = {
    frequency: 10000,
    enableHighAccuracy: false, 
        maximumAge        : 9000, //間隔時間(毫秒) 
        timeout           : 17000
    }

    );
} else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
}



}
var tempLat = 0;
var tempLon =0;

function getMonster(userlat,userlon){
    var userID = localStorage.userID;
    var serverUrl = "http://andy-lin.info:20003/api/monster";
            //"http://andy-lin.info:20003/api/monster?user=1&lat=121.512386&lon=25.051269"; 
            //position.coords.latitude,position.coords.longitude
            $.ajax({
                type:"GET",
                url:serverUrl,
                data:"user="+localStorage.userID+"&lat="+userlat+"&lon="+userlon,
                dataType:"JSONP",
                jsonpCallback:"mPosition",
                success:function(returnData){
                    if(returnData.status=="205"){
                        var monsterData = returnData.data;
                        monsterList =[];    
                        var monsterListTemp=[];
                        for (var i = 0; i<monsterData.length; i++) {
                            monsterListTemp=[];
                            monsterListTemp.push(monsterData[i]["name"]);    //因該是改成怪物id
                            monsterListTemp.push(monsterData[i]["lat"]);
                            monsterListTemp.push(monsterData[i]["lon"]);
                            monsterListTemp.push(i);
                            monsterList.push(monsterListTemp);
                        }

                        /* 做成字串處理......，用Array才對
                        for(var i = 0 ; i<monsterDataLength ;i++){
                            if(i>0){
                                monsterList = monsterList +"," ;
                            }
                            monsterList = monsterList+"['"+monsterData[i]["name"]+"', "+monsterData[i]["lon"]+", "+monsterData[i]["lat"]+", "+i+"]";
                        }
                        monsterList = monsterList +" ]";
                        */
                        $("#topBar").html("<b>成功收到資料 "+monsterList+" </b>");
                        
                    }
                    else if(returnData.status=="404"){
                        $("#topBar").html("<b>收到的訊息是：這附近沒有怪物</b>");
                    }
                    else{
                        $("#topBar").html("<b>失敗。 錯誤代碼 = "+returnData.status+" 錯誤訊息="+returnData.msg+" </b>");
                    }

                }
            });
}
//Locations就是怪物beach
function setMonsterMarkers(map,locations){

    var image = {
        url: 'img/monster1.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(589,568),
    scaledSize: new google.maps.Size(117,113),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(50, 50)
};

for (var i = 0; i < locations.length; i++) {
    var beach = locations[i];
    var myLatLng = new google.maps.LatLng(beach[1], beach[2]);
    

    var infowindow =new google.maps.InfoWindow({
        content:"<p>怪物名稱："+beach[0]+"</p><br><a href=\"battle.html\" target=\"_blank\">進入戰鬥</a>",
        position:myLatLng
    });

    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        icon: image,
        anchorPoint:new google.maps.Point(0,0),
        title: beach[0],
        zIndex: beach[3]
    });

    google.maps.event.addListener(marker, 'click' , function(){
        infowindow.open(map,marker);
    });


}

}
/*
var monsterListTest = [
  ['Bondi Beach', 25.06079047579, 121.53120506931, 4],
  ['Coogee Beach', 25.6079579272, 121.20506931151, 5],
  ['Cronulla Beach', 25.060799272, 121.120506931151, 3],
  ['Manly Beach', 25.06079049272, 121.4120531151, 2],
  ['Maroubra Beach',25.0607904757272, 121.312050693151, 1]
]; 
*/
var otherUserMarker;
function setOtherUserMark(map,otherUserList,time){

    if(time>0)
        otherUserMarker.setMap(null);
    
    console.log("time="+time)
    for(var i = 0;i<otherUserList.length;i++){

        var otherUserData = otherUserList[i];
        var otherLocation = new google.maps.LatLng(otherUserData[1]+0.0001, otherUserData[2]+0.0001);
        console.log("其他人marker  i="+i+" otherUserData="+otherUserData); 
        otherUserMarker = new google.maps.Marker({
            position: otherLocation,
            label: '其',
            map: map
        });
    }
    
}


function enterButtonInToBattle(){

}

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(25.06079047579272, 121.53120506931151),
        content: content
    };
    getMonster(25.06079047579272, 121.53120506931151);
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);
