var ActionBar = require('com.alcoapps.actionbarextras');
var Map = require('ti.map');
var Moment = require('vendor/moment');
Moment.locale('de');
var MarkerManager = require('vendor/markermanager');
var MM_Car2Go;
var MM_HVV;
var MM_StadtRAD;

module.exports = function(_event) {
    
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
             /*
              
              *  H V V 
              * 
              * 
              * 
              * */
             _menuevent.menu.add({
                title : 'HVV',
                itemId : 0,
                checkable: true,
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
                
             }).addEventListener("click", function() {
                 var item = _menuevent.menu.findItem(0);
                 Ti.Media.vibrate([0,1]);
                 switch (item.checked) {
                     case false:
                        var HVV = new (require('adapter/hvv'))();
                        MM_HVV = new MarkerManager({
                            name : 'hvv',
                            map  : _event.source.mapView,
                            points : HVV.getStations(),
                            image : '/images/hvv.png' 
                        });
                     break;
                     case true:
                       item.checked=false;
                       MM_HVV && MM_HVV.destroy();
                       MM_HVV=null;
                    break;
                 }
             });
             /* 
              
              *  S T A D T R A D 
              * 
              * */
             
             _menuevent.menu.add({
                title : 'StadtRAD',
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
              // car2go Free Vehicles:
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
                         require('adapter/car2go').loadFreeVehicles({
                             done: function(placemarks) {
                                _event.source.progress.setRefreshing(false); 
                                Ti.UI.createNotification({
                                    message: placemarks.length + ' car2go-Autos verfügbar'
                                }).show();
                                  MM_Car2Go = new MarkerManager({
                                    name: 'car2GO',
                                    points : placemarks.map(function(placemark) {
                                            return { 
                                                lat : placemark.coordinates[1],
                                                title: placemark.address.split(',')[0],
                                                subtitle: placemark.name,
                                                lng : placemark.coordinates[0]
                                            };
                                         }),
                                    image: '/images/car2go.png',
                                    map  : _event.source.mapView
                                });
                            }});
                         break;
                     case true:
                         item.checked=false;
                         MM_Car2Go && MM_Car2Go.destroy();
                         MM_Car2Go = null;
                     break;
                 }
             });
              // car2go ZONEN:
              _menuevent.menu.add({
                title : 'car2go (NGAs)',
                itemId : 8,
                checkable: true,
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
             }).addEventListener("click", function() {
                 var item = _menuevent.menu.findItem(8);
                 Ti.Media.vibrate([0,1]);
                 switch (item.checked) {
                     case false:
                         item.checked = true;
                         _event.source.progress.setRefreshing(true);
                         require('adapter/car2go').loadOperatingAreas({
                             done : function(_placemarks) {
                                _event.source.nogoareas = [];   
                                _event.source.progress.setRefreshing(false);
                                _event.source.nogoareas = [];
                                _placemarks.forEach(function(placemark) {
                                    if (placemark.zoneType == "excluded") {
                                    var points = [];
                                    placemark.coordinates.forEach(function(coord,ndx){
                                        switch (ndx%3) {
                                            case 0:
                                             points[parseInt(ndx/3)] = {longitude:parseFloat(coord)};
                                            break;
                                            case 1:
                                             points[parseInt(ndx/3)].latitude = parseFloat(coord);
                                            break;
                                         }   
                                    });
                                    _event.source.nogoareas.push(Map.createPolygon({
                                            points : points,
                                            strokeColor: "red",
                                            opacity:0.6,
                                            strokeWidth: 0,
                                            fillColor: "red",
                                     }));
                                   }
                                });
                                _event.source.nogoareas.forEach(function(polygon){
                                     _event.source.mapView.addPolygon(polygon);
                                })
                               
                               
                            }});
                        
      
                     break;
                     case true:
                         item.checked=false;
                        if (_event.source.nogoareas) _event.source.nogoareas.forEach(function(a){
                            _event.source.mapView.removePolygon(a);
                        });
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
