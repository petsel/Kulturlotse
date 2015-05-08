var ActionBar = require('com.alcoapps.actionbarextras');
var Map = require('ti.map');
var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(_event) {
    var HVV = new (require('adapter/hvv'))();
    ActionBar.setTitle('Kulturlotse');
    ActionBar.setSubtitle(_event.source.day 
         ? Moment(_event.source.day).format('D. MMM YYYY')
         :'');
    ActionBar.setFont("PT Serif Bold");
    ActionBar.subtitleColor = "#444";
    var activity = _event.source.getActivity();
    if (!activity)  return;
        activity.onCreateOptionsMenu = function(_menuevent) {
             _menuevent.menu.clear();
             _menuevent.menu.add({
                title : 'StadtRAD Depots',
                itemId : 1,
                checkable: true,
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
             }).addEventListener("click", function() {
                 var item = _menuevent.menu.findItem(1);
                 Ti.Media.vibrate([0,1]);
                 switch (item.checked) {
                     case false:
                     item.checked = true;
                     _event.source.stadtradannotations = require('model/stadtrad').map(function(velo) {
                         return Map.createAnnotation({
                              latitude : velo.lat,
                              longitude : velo.lng,
                              image : '/images/rad.png',
                              subtitle : velo.hal2option.bikelist.length + ' Räder',
                              title : velo.hal2option.tooltip.replace(/&nbsp;/g, ' ').replace(/^'/, '').replace(/'$/, '').replace(/^[\d]+/, '')
                         });
                      });
                      _event.source.mapView.addAnnotations(_event.source.stadtradannotations);
      
                     break;
                     case true:
                         item.checked=false;
                         _event.source.mapView.removeAnnotations(_event.source.stadtradannotations);
                     break;
                 }
                 
                 
             });
                /*   _menuevent.menu.add({
                title : 'HVV Haltestellen',
                itemId : 2,
                checkable: true,
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
             }).addEventListener("click", function() {
                  var item = _menuevent.menu.findItem(2);
                 Ti.Media.vibrate([0,1]);
                 switch (item.checked) {
                     case false:
                     item.checked = true;
                     _event.source.hvvannotations = HVV.getStations().map(function(hvv) {
                         return Map.createAnnotation({
                              latitude : hvv.lat,
                              longitude : hvv.lng,
                              title : hvv.name
                         });
                      });
                      _event.source.hvvannotations.forEach(function(pin){
                          _event.source.mapView.addAnnotation(pin);
                      });
                      
                  
                     break;
                     case true:
                         item.checked=false;
                     break;
                 
                 }
                 
             });
             */
             _menuevent.menu.add({
                title : 'Luftbild',
                itemId : 3,
                checkable: true,
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
             }).addEventListener("click", function() {
                  var item = _menuevent.menu.findItem(3);
                 Ti.Media.vibrate([0,1]);
                 switch (item.checked) {
                     case false:
                     item.checked = true;
                        _event.source.mapView.setMapType(Map.HYBRID_TYPE);
      
                     break;
                     case true:
                         item.checked=false;
                          _event.source.mapView.setMapType(Map.NORMAL_TYPE);
                     break;
                 }
             });
            _menuevent.menu.add({
                title : 'Verkehrslage',
                itemId : 5,
                checkable: true,
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
             }).addEventListener("click", function() {
                  var item = _menuevent.menu.findItem(5);
                 Ti.Media.vibrate([0,1]);
                 switch (item.checked) {
                     case false:
                     item.checked = true;
                        _event.source.mapView.setTraffic(true);
                     break;
                     case true:
                         item.checked=false;
                          _event.source.mapView.setTraffic(false);
                     break;
                 }
             });           
            activity.actionBar.displayHomeAsUp = true;
        };
        activity && activity.invalidateOptionsMenu();
        activity.actionBar.onHomeIconItemSelected = function(_e) {
              _event.source.close();
        }
    
};
