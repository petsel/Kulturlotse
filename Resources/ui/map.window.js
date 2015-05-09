var Moment = require('vendor/moment');
Moment.locale('de');
var GeoLocation = new (require('vendor/georoute'))();
var Map = require('ti.map');
var HVV = new (require('adapter/hvv'))();

var region = {
    latitude : 53.56,
    longitude : 10,
    latitudeDelta : 0.1,
    longitudeDelta : 0.1,
    limit : 50
};

module.exports = function() {
    var event = arguments[0] || {};
    var Model = new (require('adapter/events'))();
    var self = Ti.UI.createWindow({
        fullscreen : true,
        hvvannotations : [],
        day : Moment(event.date).format('DD.MM.YYYY')
    });
    self.mapView = Map.createView({
        region : region,
        animated : true,
        enableZoomControls : false,
        mapType : Map.NORMAL_TYPE,
    });
    self.add(self.mapView);
    self.mapView.addEventListener('complete', function() {
        // hvv pins:
        self.hvvannotations = HVV.getStations(self.mapView.region).map(function(hvv) {
            return Map.createAnnotation({
                latitude : hvv.lat,
                longitude : hvv.lng,
                title : hvv.name,
                id : hvv.id,
                image : '/images/hvv.png'
            });
        });
        self.mapView.addAnnotations(self.hvvannotations);
        // event pins
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
        if (event.locationId) {
            // var loc = Model.getLocationById(event.locationId);
            // we wait for answer:
            GeoLocation.addEventListener('latlng', function(_latlng) {
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
            GeoLocation.getLatLng(event.locationPlz + ' ' + event.locationCity + ',' + event.locationStreet);
        }
    });

    self.addEventListener('open', require('ui/map.actionbar'));
    self.mapView.addEventListener('regionchanged', onRegionChanged);
    self.mapView.addEventListener('click', function(_e) {
        if (_e.clicksource != null && _e.annotation && _e.annotation.type) {
            console.log(_e.annotation.type);
        }
        self.locked = true;
        // self.mapView.removeEventListener('regionchanged', onRegionChanged);
        setTimeout(function() {
            self.locked = false;
            var region = self.mapView.getRegion();
            //     self.mapView.fireEvent('regionchanged', region);
        }, 700);
    });
    return self;
    function onRegionChanged(_e) {
        function isIdinList(id) {
            for (var i = 0; i < self.hvvannotations.length; i++) {
                if (self.hvvannotations[i].id == id)
                    return true;
            }
            return false;
        }
        if (self.locked == false) {
            self.locked = true;
            setTimeout(function() {
                self.locked = false;
            }, 50);
            var map = _e.source;
            var to_added_annotations = [];
            HVV.getStations(_e).forEach(function(hvv) {
                if (!isIdinList(hvv.id)) {
                    var pin = Map.createAnnotation({
                        latitude : hvv.lat,
                        longitude : hvv.lng,
                        id : hvv.id,
                        title : hvv.name,
                      //  subtitle : hvv.lat + ',' + hvv.lng,
                        image : '/images/hvv.png'
                    });
                    self.hvvannotations.push(pin);
                    to_added_annotations.push(pin);
                }
            });
            map.addAnnotations(to_added_annotations);
        } else {
            console.log("Warning: map was locked");
            setTimeout(function() {
                self.locked = false;
            }, 50);
        }
    }
   

};
