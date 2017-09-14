//handel.creatTree();
//handel.creatFolder();
handel.creatTree();
handel.creatNav(1);
handel.creatFolder( 1 );
handel.addDocumentEvent();
var add = document.getElementById("add");
var del = document.getElementById("del");
add.onclick = function(){
	handel.addFolder();
}
del.onclick = function(){
	handel.delFolder();
}