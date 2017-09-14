////封装的一些函数方法
var handel = {
	getById: function(id){//通过 id 获取元素
		return data.filter( function(item){
			return item.id == id;
		} )[0]
	},
	getByPid:function(pid){//返回父级为参数指定pid的数组
		return data.filter(function(item){
			return item.pid === pid;
		})
	},
	formHtmlByPid:function(pid,plNum){
		var str = '';
		var paddingLeft = plNum;
		var d = handel.getByPid(pid);
		for(var i=0;i<d.length;i++){//为什么不加上var i= 0 的var就重复创建了几个li
			console.log(i)
			var temp = handel.getByPid(d[i].id);
			if(temp.length===0){
				str += "<li><h2 idNum= "+d[i].id+" style = padding-left:"+paddingLeft+"px><div class='sanjiao'></div><p class='filter'></p>"+d[i].name+"</h2><li>"
			}else{
				var a = paddingLeft+20;
				str +="<li><h2 idNum= "+d[i].id+" class='rightArr' style = padding-left:"+paddingLeft+"px><div class='sanjiao'></div><p class='filter'></p>"+d[i].name+"</h2><ul>"+handel.formHtmlByPid(d[i].id,a)+"</ul><li>"
			}
		}
		return str;
	},
	creatTree:function(){
		var d = handel.getByPid(0);
		if(d.length == 0){
			return
		}
		document.querySelector(".leftList").innerHTML = handel.formHtmlByPid(0,10);
		handel.addTreeEvent();
	},
	addTreeEvent:function(){
		var divs = document.querySelectorAll(".sanjiao");
		console.log(divs)
		for(var i = 0;i<divs.length;i++){
			if(!divs[i].parentNode.nextElementSibling) continue;
			divs[i].onclick = function(ev){
				if(this.parentNode.classList.contains("downArr")){
					console.log(this.nextElementSibling.querySelectorAll("h2[class~='downArr']"))
					this.parentNode.nextElementSibling.querySelectorAll("h2[class~='downArr']").forEach(function(item){
						item.classList.add("rightArr");
						item.classList.remove("downArr");
					})
				}
				this.parentNode.classList.toggle("rightArr");
				this.parentNode.classList.toggle("downArr");
				handel.creatNav( this.parentNode.getAttribute("idNum") );
//				handel.creatFolder( this.getAttribute( "idNum" ) );
				ev.cancelBubble = true;
			}
		}
		var h2s = document.querySelectorAll(".leftList h2");
		for (var i = 0; i < h2s.length; i++) {
			if( !h2s[i].nextElementSibling ) continue;
			h2s[i].onclick = function(){
				if( this.classList.contains("downArr") ){//点击的是展开的
					this.nextElementSibling.querySelectorAll("h3[class~='downArr']").forEach(function(item){
						item.classList.add("rightArr");
						item.classList.remove("downArr");
					})
				}
				this.classList.toggle( "rightArr" );
				this.classList.toggle( "downArr" );
				handel.creatNav( this.getAttribute("idNum") );
				handel.creatFolder( this.getAttribute("idNum") );
			}
		}
	},
	creatNav:function( idNum ){
		var arr = [];
		//如果存在 
		fn( idNum );
		function fn( idNum ){
			arr.unshift({
				"name":handel.getById( idNum ).name,
				"id":handel.getById( idNum ).id
			}
			);
			if( handel.getById( handel.getById( idNum ).pid ) ){
				fn( handel.getById( idNum ).pid ); 
			}
		}
//		console.log( arr );
		var str = arr.map(function(item){
			return '<li><i><img src="img/rightarr.png"/></i><span idNum = '+item.id+'>'+item.name+'</span></li>'
//			return "<span idNum='"+ item.id +"'>"+ item.name +"</span>";
		}).join("");
//		console.log( str );
		document.getElementById("nav").innerHTML = str;
		document.querySelectorAll("#nav span").forEach(function(item){
			item.onclick = function(){
				handel.creatFolder( this.getAttribute( "idNum" ) );
				handel.creatNav( this.getAttribute( "idNum" ) );
			}
		})
	},
	creatFolder:function( idNum ){//生成文件夹
		var arr = data.filter(function(item){
			return item.pid == idNum;
		});//查找所有pid为idNum的数据
		var str = "";
		arr.forEach(function( item ){	
//			<img src='img/file.png' class='poster'/>
			str += "<li idNum='"+ item.id +"'><span>"+item.name+"</span><input type='text' /><i><img src='img/checkbox.png'/></i></li>"
		})
		document.getElementById("content").innerHTML = str;
		document.querySelectorAll("#content li").forEach(function(item){
			item.ondblclick = function(){
				var idNum = this.getAttribute( "idNum" );
				handel.creatFolder( idNum );
				handel.creatNav( idNum );
				handel.openPath( idNum );
				handel.now = idNum;
				var lis = document.querySelectorAll("#content li")
				if(lis.length == 0){
					document.querySelector("#content").style.backgroundImage = "url(img/emptybg.png)";
				}else{
					document.querySelector("#content").style.backgroundImage = "none";
				}
			}
			item.onclick = function(ev){
				if( !ev.ctrlKey ){//单选
					var that = this;
					document.querySelectorAll("#content li").forEach(function(item){
						if( item != that ){
							console.log(1);
							item.classList.remove( "active" );					
						}
					})
				}
				this.classList.toggle( "active" );
			}
			item.children[1].onclick = function(ev){
				ev.cancelBubble = true;
			}
			item.children[0].onclick = function(ev){
//				alert(1)
				item.classList.add( "edit" );
				item.children[1].focus();
				item.children[1].value = item.children[0].innerHTML;
				ev.cancelBubble = true;
			}
			item.children[1].onblur = function(){
				var newValue = item.children[1].value;
				var thisData = handel.getById(item.getAttribute("idNum"));
//				alert( pid );
				if( handel.checkName(thisData.id, newValue, thisData.pid) ){
					alert("本文件夹已有重复名的文件");
				}else{
//					alert('ahha')
					item.classList.remove( "edit" );
					item.children[0].innerHTML = newValue;
					thisData.name = newValue;
					handel.creatTree();
					handel.openPath(thisData.pid);
				}
			}
		})
	},
	openPath:function( nowId ){//打开左侧树状菜单的路径
		fn( nowId );
		function fn( nowId ){
			console.log( document.querySelectorAll(".leftList h2[idNum='"+ nowId +"']")[0] );
			var el = document.querySelectorAll(".leftList h2[idNum='"+ nowId +"']")[0]
			//根据传入的nowId 修改对应元素的箭头状态(右箭头变成下箭头)
			if( el.classList.contains( "rightArr" ) ){
				el.classList.remove( "rightArr" );
				el.classList.add( "downArr" );
			}
//			如果 存在 以当前元素的pid为id 的数据(存在父级)
			if( handel.getById( handel.getById( nowId ).pid ) ){
				handel.openPath( handel.getById( nowId ).pid );//以父级的id作为参数打开上一级路径
			}
		}
	},
		//检测重命名,pid的文件夹下,检测newName是否已经存在
//		如果存在返回true
//		不存在返回false
	checkName:function(id, newName, pid){
		var tempData = handel.getByPid(pid).filter(function(item){
			return item.id != id;
		});//筛除自己
		return tempData.some(function(item){
			return item.name == newName;
		})
	},
	addDocumentEvent:function(){
		document.onclick = function( ev ){
			if( ev.target.id == "content"){
//				var content = document.getElementById("content");
//				var lis = content.getElementsByTagName("li");
//				for (var i = 0,l=lis.length; i < l; i++) {
//					lis[i].classList.remove( "active" );
//				}
				document.querySelectorAll("#content .active").forEach(function(item){
					item.classList.remove("active");
				})
			}
		}
	},
	addFolder:function(){
		handel.maxId ++ ;
		var tempData = {
			"id":handel.maxId, 
			"name":"新建文件夹",
			"pid":handel.now
		}
		data.push( tempData );
		handel.creatFolder( handel.now );
		handel.creatTree();
		handel.openPath( handel.now );
		console.log( data );
		var kids = document.getElementById("content").children;
		kids[kids.length-1].className = "edit";
		kids[kids.length-1].children[1].value = "新建文件夹";
		kids[kids.length-1].children[1].focus();
	},
	delFolder:function(){
		var delFolder = document.querySelectorAll("#content .active");
		var delId = [];
		delFolder.forEach(function( item ){//删文件夹
			delId.push( item.getAttribute("idNum") );
			item.parentNode.removeChild( item );
		})
		console.log( delId );
		var deepID = [];
		delId.forEach(function(item){
			var delH3 = document.querySelectorAll(".leftList h3[idnum='"+ item +"']");
//			console.log( delH3 );
			delH3.forEach(function(item){
				if( item.nextElementSibling ){
					
					deepID = deepID.concat( Array.from( item.nextElementSibling.querySelectorAll("h3") ).map(function(item){//遍历ul内部的所有h3(获取他们身上的idNum)
						return item.getAttribute("idNum") ;
					}) );
					item.parentNode.removeChild( item.nextElementSibling );//删除h3后面的ul
				}
				item.parentNode.removeChild( item );//删除h3
				
			})
		})
		delId = delId.concat(deepID);
//		console.log( delId );
		data = data.filter(function(item){
			console.log( item.id );
			return delId.indexOf(item.id+"") == -1;
		})
		console.log( data );
		handel.creatFolder(handel.now);
		handel.creatTree();
		handel.openPath(handel.now);
	}
}