var ActionBar = require('com.alcoapps.actionbarextras');

module.exports = function(_event) {
    var Model = new (require('adapter/events'))();
    var stadtradpins = require('model/stadtrad').map(function(velo) {
        return require('ti.map').createAnnotation({
            latitude : velo.lat,
            longitude : velo.lng,
            image : '/images/rad.png',
            subtitle : velo.hal2option.bikelist.length + ' Räder',
            title : velo.hal2option.tooltip.replace(/&nbsp;/g, ' ').replace(/^'/, '').replace(/'$/, '').replace(/^[\d]+/, '')
        });
    });
    var loc = Model.getLocationById(_event.locationId);
    var routes = [];
    var self = Ti.UI.createWindow({
        fullscreen : true,
        event : JSON.stringify(_event)
    });
    var GeoRoute = new (require('vendor/georoute'))();
    GeoRoute.addEventListener('position', function(_e) {
        var address = (loc.latitude && loc.longitude) ? loc.latitude + ',' + loc.longitude : _event.locationStreet + ',' + _event.locationPlz + ',' + _event.locationCity;
        GeoRoute.getRoute(_e.coords, _event.locationCity + ',' + _event.locationStreet);
        self.addEventListener('modechanged', function(_mode) {
            if (_mode.stadtrad) {
                map.addAnnotations(stadtradpins);
            } else {
                map.removeAnnotations(stadtradpins);
            }
            GeoRoute.getRoute(_e.coords, _event.locationCity + ',' + _event.locationStreet);
        });
    });
    GeoRoute.getLocation();

    var mapworks = require('vendor/gms.test')();
    if (mapworks) {
        var map = require('ti.map').createView({
            region : {
                latitude : 53.5,
                longitude : 10,
                latitudeDelta : 0.5,
                longitudeDelta : 0.5
            },
            animated : true,
            traffic : false,
            enableZoomControls : false,
            userLocation : false,
            mapType : require('ti.map').NORMAL_TYPE,
            height : '50%',
            top : 0
        });
        self.add(map);
        GeoRoute.addEventListener('route', function(_e) {
            var leg = _e.route.legs[0];

            ActionBar.setSubtitle(Ti.App.Properties.getString('MODESTRING', 'Fußmarsch') + ' (' + leg.duration.text + ')');
            var bounds = _e.route.bounds;
            var region = {
                latitude : (Math.max(bounds.southwest.lat, bounds.northeast.lat) + Math.min(bounds.southwest.lat, bounds.northeast.lat)) / 2,
                longitude : (Math.max(bounds.southwest.lng, bounds.northeast.lng) + Math.min(bounds.southwest.lng, bounds.northeast.lng)) / 2,
                latitudeDelta : (Math.max(bounds.southwest.lat, bounds.northeast.lat) - Math.min(bounds.southwest.lat, bounds.northeast.lat)) * 1.6,
                longitudeDelta : (Math.max(bounds.southwest.lng, bounds.northeast.lng) - Math.min(bounds.southwest.lng, bounds.northeast.lng)) * 1.6
            };
            map.setRegion(region);
            //remove old rotes from map:
            while ( route = routes.pop()) {
                map.removeRoute(route);
            };
            // add new ones:
            routes = [require('ti.map').createRoute({
                points : require('vendor/decodePolyline')(_e.route.overview_polyline.points),
                width : 8 * Ti.Platform.displayCaps.logicalDensityFactor,
                opacity : 0.6,
                color : 'orange'
            }), require('ti.map').createRoute({
                points : require('vendor/decodePolyline')(_e.route.overview_polyline.points),
                width : 1 * Ti.Platform.displayCaps.logicalDensityFactor,
                opacity : 1,
                color : '#000'
            })];
            routes.forEach(function(route) {
                map.addRoute(route);
            });
            map.addAnnotation(require('ti.map').createAnnotation({
                image : '/images/house.png',
                latitude : leg.start_location.lat,
                longitude : leg.start_location.lng,
            }));
            map.addAnnotation(require('ti.map').createAnnotation({
                image : '/images/map' + _event.categoryId + '.png',
                latitude : leg.end_location.lat,
                longitude : leg.end_location.lng,
            }));
        });
    }
    var router = Ti.UI.createTableView({
        bottom : 0,
        height : mapworks ? '50%' : Ti.UI.FILL
    });
    self.add(router);
    GeoRoute.addEventListener('route', function(_e) {
        var leg = _e.route.legs[0];
        var data = [];
        var startrow = Ti.UI.createTableViewRow();
        startrow.add(Ti.UI.createLabel({
            html : leg.start_address,
            left : 10,
            top : 5,
            bottom : 5,
            color : 'orange',
            width : Ti.UI.FILL,
            textAlign : 'left',
            font : {
                fontFamily : 'PT Serif Bold',
                fontSize : 22
            }
        }));
        data[0] = startrow;
        leg.steps.forEach(function(step) {
            var row = Ti.UI.createTableViewRow();
            row.add(Ti.UI.createLabel({
                html : step.html_instructions,
                left : 90,
                top : 5,
                bottom : 5,
                width : Ti.UI.FILL,
                textAlign : 'left',
                font : {
                    fontFamily : 'DroidSans',
                    fontSize : 16
                }
            }));
            row.add(Ti.UI.createLabel({
                text : step.distance.text,
                left : 5,
                top : 0,
                color : '#888',
                width : Ti.UI.FILL,
                textAlign : 'left',
                font : {
                    fontFamily : 'DroidSans',
                    fontSize : 22,
                    fontWeight : 'bold'
                }
            }));
            data.push(row);

        });
        var endrow = Ti.UI.createTableViewRow();
        endrow.add(Ti.UI.createLabel({
            html : leg.end_address,
            left : 10,
            top : 5,
            bottom : 5,
            color : 'orange',
            width : Ti.UI.FILL,
            textAlign : 'left',
            font : {
                fontFamily : 'PT Serif Bold',
                fontSize : 22
            }
        }));
        data.push(endrow);
        router.setData(data);
    });

    map.addEventListener('complete', function() {
    });
    self.addEventListener('open', require('ui/routing.actionbar'));
    return self;
};
