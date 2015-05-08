var Moment = require('vendor/moment');
Moment.locale('de');
var GeoLocation = new (require('vendor/georoute'))();
var Map = require('ti.map');
module.exports = function() {
    var event = arguments[0] || {};
    var Model = new (require('adapter/events'))();
    var self = Ti.UI.createWindow({
        fullscreen : true,
        day : Moment(event.date).format('DD.MM.YYYY')
    });
    self.mapView = Map.createView({
        region : {
            latitude : 53.56,
            longitude : 10,
            latitudeDelta : 0.1,
            longitudeDelta : 0.1
        },
        animated : true,
        enableZoomControls : false,
        mapType : Map.NORMAL_TYPE,
    });
    self.add(self.mapView);
    self.mapView.addEventListener('complete', function() {
         var pindata = Model.getLocationsByDay(event.day).map(function(loc) {
            return Map.createAnnotation({
                latitude : loc.latitude,
                longitude : loc.longitude,
                leftView : Ti.UI.createImageView({
                    width : 30,
                    height : 20,
                    right : 10,
                    image : (loc.imageToken) ? 'http://www.kulturlotse.de/bild/s/x-' + loc.imageToken + '.jpg' : ''
                }),
                image : '/images/map' + loc.categoryId + '.png',
                title : loc.title,
                subtitle : loc.locationName + ', ' + loc.locationStreet
            });
        });
        self.mapView.addAnnotations(pindata);
        console.log(event);
        if (event.locationId) {
            // var loc = Model.getLocationById(event.locationId);
            // we wait for answer:
            GeoLocation.addEventListener('latlng', function(_latlng) {
                console.log(event);
                var pin = Map.createAnnotation({
                    latitude : parseFloat(_latlng.lat),
                    longitude : parseFloat(_latlng.lng),
                    image : '/images/appicon.png',
                    title : event.title,
                    subtitle : event.locationStreet,
                });
                if (self.mapView) {// perhaps the net is faster then the renderer ;-))
                    self.mapView.addAnnotation(pin);
                    self.mapView.setLocation({
                        latitude : parseFloat(_latlng.lat),
                        longitude : parseFloat(_latlng.lng),
                        latitudeDelta : 0.01,
                        longitudeDelta : 0.01,
                        animated : true
                    });
                    self.mapView.selectAnnotation(pin);
                }
            });
            // trigger of address determination:
            GeoLocation.getLatLng(event.locationPlz+' '+event.locationCity+','+event.locationStreet);
        }
    });

    self.addEventListener('open', require('ui/map.actionbar'));
    return self;
};
