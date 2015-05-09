var ActionBar=require("com.alcoapps.actionbarextras"),Map=require("ti.map"),Moment=require("vendor/moment");Moment.locale("de"),module.exports=function(e){new(require("adapter/hvv"));ActionBar.setTitle("Kulturlotse"),ActionBar.setSubtitle(e.source.day?Moment(e.source.day).format("D. MMM YYYY"):""),ActionBar.setFont("PT Serif Bold"),ActionBar.subtitleColor="#444";var a=e.source.getActivity();a&&(a.onCreateOptionsMenu=function(n){n.menu.clear(),n.menu.add({title:"StadtRAD Depots",itemId:1,checkable:!0,icon:Ti.App.Android.R.drawable.ic_action_filter,showAsAction:Ti.Android.SHOW_AS_ACTION_NEVER}).addEventListener("click",function(){var a=n.menu.findItem(1);switch(Ti.Media.vibrate([0,1]),a.checked){case!1:a.checked=!0,require("adapter/stadtrad")({done:function(a){var n=0,r=0;e.source.stadtradannotations=a.map(function(e){return n+=parseInt(e.hal2option.bikelist.length),e.hal2option.bikelist.length?Map.createAnnotation({latitude:e.lat,longitude:e.lng,type:"bike",leftView:Ti.UI.createImageView({image:"/assets/stadtrad.png",width:"50dp",height:"50dp"}),image:"/images/rad.png",subtitle:e.hal2option.bikelist.length+" Räder",title:e.hal2option.tooltip.replace(/&nbsp;/g," ").replace(/^'/,"").replace(/'$/,"").replace(/^[\d]+/,"")}):void r++});var i=n+" Räder an "+a.length+" Stationen verfügbar.\n"+r+" Stationen sind leider ohne Räder.";console.log(i),Ti.UI.createNotification({message:i,duration:Ti.UI.NOTIFICATION_DURATION_LONG}).show(),Ti.Media.vibrate([0,5]),e.source.mapView.addAnnotations(e.source.stadtradannotations)}});break;case!0:a.checked=!1,e.source.mapView.removeAnnotations(e.source.stadtradannotations)}}),n.menu.add({title:"Car2Go",itemId:7,checkable:!0,icon:Ti.App.Android.R.drawable.ic_action_filter,showAsAction:Ti.Android.SHOW_AS_ACTION_NEVER}).addEventListener("click",function(){var a=n.menu.findItem(7);switch(Ti.Media.vibrate([0,1]),a.checked){case!1:a.checked=!0,require("adapter/car2go")({done:function(a){Ti.UI.createNotification({message:a.length+" Car2Go-Autos verfügbar"}).show(),e.source.car2gopins=a.map(function(e){return Map.createAnnotation({latitude:e.coordinates[1],longitude:e.coordinates[0],image:"/images/car2go.png",type:"car2go",title:e.address,subtitle:e.name})}),e.source.mapView.addAnnotations(e.source.car2gopins)}});break;case!0:a.checked=!1,e.source.car2gopins&&e.source.mapView.removeAnnotations(e.source.car2gopins)}}),n.menu.add({title:"Luftbild",itemId:3,checkable:!0,icon:Ti.App.Android.R.drawable.ic_action_filter,showAsAction:Ti.Android.SHOW_AS_ACTION_NEVER}).addEventListener("click",function(){var a=n.menu.findItem(3);switch(Ti.Media.vibrate([0,1]),a.checked){case!1:a.checked=!0,e.source.mapView.setMapType(Map.HYBRID_TYPE);break;case!0:a.checked=!1,e.source.mapView.setMapType(Map.NORMAL_TYPE)}}),n.menu.add({title:"Verkehrslage",itemId:5,checkable:!0,icon:Ti.App.Android.R.drawable.ic_action_filter,showAsAction:Ti.Android.SHOW_AS_ACTION_NEVER}).addEventListener("click",function(){var a=n.menu.findItem(5);switch(Ti.Media.vibrate([0,1]),a.checked){case!1:a.checked=!0,e.source.mapView.setTraffic(!0);break;case!0:a.checked=!1,e.source.mapView.setTraffic(!1)}}),a.actionBar.displayHomeAsUp=!0},a&&a.invalidateOptionsMenu(),a.actionBar.onHomeIconItemSelected=function(){e.source.close()})};