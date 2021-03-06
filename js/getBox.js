var leaderbid;
var bagList;
$(document).ready(function() {
	getMyBox();

	
});
function setList(monsterID,monsterLevel,bid){
	
	swal({
		title:"",
		imageUrl: "img/monster"+monsterID+".png", 
		showCancelButton: true,  
		showConfirmButton:false,
		closeOnConfirm:false,
		text:"<a class='myButton' onclick='eatMonster("+monsterID+","+bid+")'>合成</a>"+
		"<a class='myButton' onclick='releaseMonster("+monsterID+","+bid+")'>放生</a>"+
		"<a class='myButton' onclick='setLeader("+monsterID+","+monsterLevel+","+bid+")'>設為隊長</a>",
		html:true, 
		cancelButtonText: "取消",
	});
}
//{"name": "\u5c0f\u767d\u55b5", "level": 1, "attribute": 1, "bid": 244, "mid": 1, "capital": true}
//andy-lin.info:20003/api/eatMonster?session=使用者id&eatedMonster=被吃的怪物的BID&eatMonster=吃掉的怪物的bid
function eatMonster(monsterID,eatBid){
	swal.close();
	$(".pet").hide();
	//選要吃哪隻(列表)
	$("#boxTable").append("<tbody>");
	for(var i = 0 ;i<bagList.length;i++){
		var monsHp=monsterList[bagList[i].mid].monsterHP+bagList[i].level*monsterList[bagList[i].mid].HPCoe;	
		var monsAttack=monsterList[bagList[i].mid].monsterAttack+bagList[i].level*monsterList[bagList[i].mid].AttackCoe;	
		if(bagList[i].bid==eatBid||bagList[i].capital==true){
			continue;
		}

		$("#boxTable").append(
			"<tr class='pet' onclick='sentToServer("+eatBid+","+bagList[i].bid+")'><td>"+
			"<img src='img/monster"+bagList[i].mid+".png'  style='height: 100px; width: auto;'>"
			+"</td><td>"+bagList[i]["name"]+"</td><td>"
			+bagList[i]["level"]+"</td><td>"
			+monsHp+"</td><td>"+monsAttack+"</td></tr>");		
	

	}
	$("#boxTable").append("</tbody>");



}

function sentToServer(eatBid,eatedBid){
	//送合成訊息給server
	
	$.ajax({
		type:"GET",
		url:serverUrlEatMonster,
		data:"session="+localStorage.session+"&eatedMonster="+eatedBid+"&eatMonster="+eatBid,
		dataType:"JSONP",
		jsonpCallback:"combineMonster",
		success:function(returnData){
			swal("合成成功","success");
			swal({   
				title: "合成成功",   
				type:"success",  
				confirmButtonText: "確定",
				closeOnConfirm:true
			},
			function(isconfirm){
				window.location.reload();
			});
		},
	});
}
var bugRelease=true;
function releaseMonster(monsterID,bid){
	bugRelease=true;
	if(bugRelease===true){
	swal({   
		title: "確認放生?",   
		showCancelButton: true,   
		imageUrl: "img/monster"+monsterID+".png", 
		confirmButtonText: "確定",
		cancelButtonText: "取消",
		closeOnConfirm:false,
	},
	function(isconfirm){
		//andy-lin.info:20003/api/api/api/releaseMonster?session=使用者id&bid=BJ4
		
		if (isconfirm) {
			if(bid==leaderbid){
				swal({
					title:"隊長不能放生",
					confirmButtonText: "確定",
					type:"warning"
				});
			}else{
				$.ajax({
					type:"GET",
					url:serverUrlReleaseMonster,
					data:"session="+localStorage.session+"&bid="+bid,
					dataType:"JSONP",
					jsonpCallback:"releaseMonster",
					success:function(returnData){
						window.location.reload();
						
					},
				});
			}
			
		}
	});
	bugRelease=false;
	
	}

}
function setLeader(monsterID,monsterLevel,bid){
	if(bid==leaderbid){
		swal({
			title:"已經是隊長",
			confirmButtonText: "確定",
			
		});
	}else{
		swal({   
			title: "設成隊長?",   
			showCancelButton: true,   
			imageUrl: "img/monster"+monsterID+".png", 
			confirmButtonText: "更換",
			cancelButtonText: "取消",
			closeOnConfirm:true
		},
		function(isconfirm){
			//andy-lin.info:20003/api/api/setCapital?session=使用者id&bid=BJ4

			if (isconfirm) {
				localStorage.leader=monsterID;
				localStorage.leaderLV=monsterLevel;
				$.ajax({
					type:"GET",
					url:serverUrlSetLeader,
					data:"session="+localStorage.session+"&bid="+bid,
					dataType:"JSONP",
					jsonpCallback:"setCapital",
					success:function(returnData){
						window.location.reload();
						
					},
				});
			}
		});
	}
}

function getMyBox(){
	$.ajax({
		type:"GET",
		url:serverUrlGetMyBox,
		data:"session="+localStorage.session,
		dataType:"JSONP",
		jsonpCallback:"getBox",
		success:function(returnData){
			bagList=returnData.data;
			
			$("#boxTable").append("<tbody>");
				for(var i = 0 ;i<bagList.length;i++){
					var monsHp=monsterList[bagList[i].mid].monsterHP+bagList[i].level*monsterList[bagList[i].mid].HPCoe;	
					var monsAttack=monsterList[bagList[i].mid].monsterAttack+bagList[i].level*monsterList[bagList[i].mid].AttackCoe;	
					if(bagList[i].capital==true){
						leaderbid=bagList[i].bid;
						$("#boxTable").append("	<tr class='pet' onclick='setList("+bagList[i]["mid"]+","+bagList[i]["level"]+","+bagList[i]["bid"]+")' ><td style='background:red;'>"+
							"<img src='img/monster"+bagList[i].mid+".png'  style='height: 100px; width: auto;'>"
						+"</td><td>"+bagList[i]["name"]+"</td><td>"
						+bagList[i]["level"]+"</td><td>"
						+monsHp+"</td><td>"+monsAttack+"</td></tr>");
					}else{
						$("#boxTable").append("	<tr class='pet' onclick='setList("+bagList[i]["mid"]+","+bagList[i]["level"]+","+bagList[i]["bid"]+")' ><td>"+"<img src='img/monster"+bagList[i].mid+".png'  style='height: 100px; width: auto;'>"
							+"</td><td>"+bagList[i]["name"]+"</td><td>"
							+bagList[i]["level"]+"</td><td>"
							+monsHp+"</td><td>"+monsAttack+"</td></tr>");	
					}	
				}
				$("#boxTable").append("</tbody>");
						

		}
	});
}
