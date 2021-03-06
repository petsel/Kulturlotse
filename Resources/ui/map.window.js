var Moment = require('vendor/moment');
Moment.locale('de');
var GeoLocation = new (require('vendor/georoute'))();
var Map = require('ti.map');

module.exports = function() {
    var region = {
        latitude : 53.56,
        longitude : 10,
        latitudeDelta : 0.1,
        longitudeDelta : 0.1,
        limit : 50
    };
    if (Ti.App.Properties.hasProperty('LASTREGION')) {
        var lastregion = JSON.parse(Ti.App.Properties.getString('LASTREGION'));
        region = {
            latitude : lastregion.latitude,
            longitude : lastregion.longitude,
            latitudeDelta : lastregion.latitudeDelta,
            longitudeDelta : lastregion.longitudeDelta,
            limit : 50
        };
    }
    var event = arguments[0] || {};
    var Model = new (require('adapter/events'))();
    var self = Ti.UI.createWindow({
        fullscreen : true,
       
        day : Moment(event.date).format('DD.MM.YYYY')
    });
    self.mapView = Map.createView({
        region : region,
        animate : true,
        compassEnabled : false,
        userLocation : true,
        enableZoomControls : false,
        userLocationButton : true,
        mapType : Map.NORMAL_TYPE,
    });
    var view = Ti.UI.createView({
        top : 0,
        height : 20
    });
    self.add(self.mapView);
    self.progress = require('com.rkam.swiperefreshlayout').createSwipeRefresh({
        view : view,
        height : 20,
        top : 0,
        width : Ti.UI.FILL
    });
    self.add(self.progress);

    self.mapView.addEventListener('complete', function() {
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
    self.mapView.addEventListener('click', onPinclick);
    function onPinclick(_e) {
        self.mapView.removeEventListener('click', onPinclick);
        setTimeout(function() {
            self.mapView.addEventListener('click', onPinclick);
        }, 700);
        if (_e.clicksource != null && _e.annotation && _e.annotation.type && _e.clicksource != 'pin') {
            console.log(_e.clicksource);
            if (_e.annotation.type && _e.annotation.type == 'car2go') {
                Ti.Media.vibrate([0,5]);
                require('ui/stations.window')({
                    type : _e.annotation.type
                }).open();
            }
        }
        self.locked = true;
        // self.mapView.removeEventListener('regionchanged', onRegionChanged);
        setTimeout(function() {
            self.locked = false;
            var region = self.mapView.getRegion();
            //     self.mapView.fireEvent('regionchanged', region);
        }, 700);

    }

    function onRegionChanged(_e) {
        function isIdinList(id) {
            for (var i = 0; i < self.hvvannotations.length; i++) {
                if (self.hvvannotations[i].id == id)
                    return true;
            }
            return false;
        }
        Ti.App.Properties.setString('LASTREGION', JSON.stringify({
            latitude : _e.latitude,
            longitude : _e.longitude,
            latitudeDelta : _e.latitudeDelta,
            longitudeDelta : _e.longitudeDelta
        }));
        if (self.locked == false) {
            self.locked = true;
            setTimeout(function() {
                self.locked = false;
            }, 50);
        } else {
            setTimeout(function() {
                self.locked = false;
            }, 50);
        }
    }

    return self;
};
