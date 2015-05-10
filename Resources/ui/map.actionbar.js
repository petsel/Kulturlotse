var ActionBar = require('com.alcoapps.actionbarextras');
var Map = require('ti.map');
var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function(_event) {
    var HVV = new (require('adapter/hvv'))();
    ActionBar.setTitle('Kulturlotse');
    ActionBar.setSubtitle(_event.source.day 
         ? Moment().format('D. MMM YYYY')
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
                        _event.source.progress.setRefreshing(true);
 
                        require('adapter/stadtrad')({
                             done : function(stadtraeder) {
                                _event.source.progress.setRefreshing(false); 
                               var raedertotal = 0;
                               var ohneraeder = 0;  
                               _event.source.stadtradannotations = stadtraeder.map(function(velo) {
                                   raedertotal +=  parseInt(velo.hal2option.bikelist.length);
                                   if (velo.hal2option.bikelist.length) {
                                     return Map.createAnnotation({
                                        latitude : velo.lat,
                                        longitude : velo.lng,
                                        type:'bike',
                                        leftView: Ti.UI.createImageView({
                                             image: '/assets/stadtrad.png',
                                             width:'50dp',  
                                          height:'50dp'
                                        }),
                                        image : '/images/rad.png',
                                        subtitle : velo.hal2option.bikelist.length + ' Räder',
                                        title : velo.hal2option.tooltip.replace(/&nbsp;/g, ' ').replace(/^'/, '').replace(/'$/, '').replace(/^[\d]+/, '')
                                    });
                                } else ohneraeder++;
                             });
                             var message = raedertotal + ' Räder an '+ stadtraeder.length + ' Stationen verfügbar.\n' + ohneraeder + ' Stationen sind leider ohne Räder.';
                             console.log(message);
                             Ti.UI.createNotification({
                                 message: message,
                                 duration: Ti.UI.NOTIFICATION_DURATION_LONG
                             }).show();
                             Ti.Media.vibrate([0,5]);
                             _event.source.mapView.addAnnotations(_event.source.stadtradannotations);    
                         }
                     });
                break;
                case true:
                         item.checked=false;
                         _event.source.mapView.removeAnnotations(_event.source.stadtradannotations);
                     break;
                 }
             });
              _menuevent.menu.add({
                title : 'car2go',
                itemId : 7,
                checkable: true,
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
             }).addEventListener("click", function() {
                 var item = _menuevent.menu.findItem(7);
                 Ti.Media.vibrate([0,1]);
                 switch (item.checked) {
                     case false:
                         item.checked = true;
                         _event.source.progress.setRefreshing(true);
                         require('adapter/car2go')({
                             done:function(placemarks) {
                                _event.source.progress.setRefreshing(false); 
                                Ti.UI.createNotification({
                                    message: placemarks.length + ' Car2Go-Autos verfügbar'
                                }).show();
                                _event.source.car2gopins = placemarks.map(function(placemark) {
                                    return Map.createAnnotation({
                                            latitude : placemark.coordinates[1],
                                            longitude : placemark.coordinates[0],
                                            image : '/images/car2go.png',
                                            type: 'car2go',
                                            title : placemark.address,
                                            subtitle: placemark.name
                                     });
                                });
                                _event.source.car2gopins.forEach(function(p){
                                     _event.source.mapView.addAnnotation(p);
                                });
                               
                            }});
                        
      
                     break;
                     case true:
                         item.checked=false;
                        _event.source.car2gopins && _event.source.mapView.removeAnnotations(_event.source.car2gopins);
                     break;
                 }
                 
                 
             });
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
