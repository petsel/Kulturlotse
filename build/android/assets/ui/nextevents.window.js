function truncate(e,a){var n,r;if(n=e.split(""),n.length>a){for(r=n.length-1;r>-1;--r)if(r>a)n.length=r;else if(" "===n[r]){n.length=r;break}n.push(" …")}return n.join("")}var Moment=require("vendor/moment");Moment.locale("de");var Model=new(require("adapter/events")),ActionBar=require("com.alcoapps.actionbarextras");module.exports=function(e){function a(e){n.listView.removeEventListener("itemclick",a),require("ui/event.window")(JSON.parse(e.itemId)).open(),Ti.Media.vibrate([0,1]),setTimeout(function(){n.listView.addEventListener("itemclick",a)},200)}var n=Ti.UI.createWindow({fullscreen:!0});return n.listView=Ti.UI.createListView({templates:{events:require("ui/TEMPLATES").eventsbylocation},defaultItemTemplate:"events",sections:Model.getEventsByLocation(e.locationId).map(function(e){return e.imageurl=e.imageToken?"http://www.kulturlotse.de/bild/l/x-"+e.imageToken+".jpg":"",e.text||(e.text=e.description||""),console.log(e),Ti.UI.createListSection({headerTitle:Moment(e.date).format("DD.MM.YYYY"),items:[{properties:{itemId:JSON.stringify(e)},title:{text:e.title},text:{text:truncate(e.text.replace(/<br>/gi,"\n").replace(/(<([^>]+)>)/gi,""),110)},image:{image:e.imageurl}}]})})}),n.add(n.listView),n.addEventListener("open",function(){ActionBar.setFont("PT Serif Bold"),ActionBar.subtitleColor="#444",ActionBar.setTitle("Kulturlotse"),ActionBar.setSubtitle(e.locationName);var a=n.getActivity();a&&(a.actionBar.displayHomeAsUp=!0,a.invalidateOptionsMenu(),a.actionBar.onHomeIconItemSelected=function(){n.close()})}),n.listView.addEventListener("itemclick",a),n};