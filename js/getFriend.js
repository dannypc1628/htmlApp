$(document).ready(function() {
	getFriend(a,b);

});

function getFriend(userlat,userlon){
			var userId = localStorage.userId;
			var serverUrl = "http://140.136.150.71:20003/api/monster";
			//"http://140.136.150.71:20003/api/monster?user=1&lat=121.512386&lon=25.051269"; 
			//position.coords.latitude,position.coords.longitude
			$.ajax({
				type:"GET",
				url:serverUrl,
				data:"user="+localStorage.userId+"&lat="+userlat+"&lon="+userlon,
				dataType:"JSONP",
				jsonpCallback:"mPosition",
				success:function(returnData){
					if(returnData.status=="205"){
						var monsterData = returnData.data;
						beaches =[];	
						var beachesTemp=[];
						for (var i = 0; i<monsterData.length; i++) {
							beachesTemp=[];
							beachesTemp.push(monsterData[i]["name"]);
							beachesTemp.push(monsterData[i]["lat"]);
							beachesTemp.push(monsterData[i]["lon"]);
							beachesTemp.push(i);
							beaches.push(beachesTemp);
						}

						/* 做成字串處理......，用Array才對
						for(var i = 0 ; i<monsterDataLength ;i++){
							if(i>0){
								beaches = beaches +"," ;
							}
							beaches = beaches+"['"+monsterData[i]["name"]+"', "+monsterData[i]["lon"]+", "+monsterData[i]["lat"]+", "+i+"]";
						}
						beaches = beaches +" ]";
						*/
						$("#topBar").html("<b>成功收到資料 "+beaches+" </b>");
						
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