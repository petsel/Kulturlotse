function FirstView(){var i=Ti.UI.createView(),a=Ti.UI.createLabel({color:"#000000",text:String.format(L("welcome"),"Titanium"),height:"auto",width:"auto"});return i.add(a),a.addEventListener("click",function(i){alert(i.source.text)}),i}module.exports=FirstView;