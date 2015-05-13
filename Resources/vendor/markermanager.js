/* Usage:
 *
 * var Car2Go = new MarkerManager({
 name: 'car2go',
 points : points,
 image: '/images/car2go.png',
 map  : _event.source.mapView
 });
 Car2Go.destroy();
 *
 *
 */

const RASTER = 25;

var Map = require('ti.map');

var Module = function(options) {
    this.name = options.name || 'DB' + Math.random();
    if ( typeof options.map == 'object' && options.map.apiName && options.map.apiName == 'Ti.Proxy')
        this.map = options.map;
    this.points = options.points;
    this.image = options.image;
    this.markers_in_map = {};
    this.eventhandlers = {};
    this._importData();
    this._startMap();
    var that = this;
    this.map.addEventListener('regionchanged', function(_region) {
        that._updateMap(_region);
    });
    return this;
};

Module.prototype = {
    destroy : function() {
        var annotations = [];
        for (id in this.markers_in_map) {
            if (this.markers_in_map.hasOwnProperties(id)) {
                annotation.push(this.markers_in_map[id]);
            }
        }
        this.map.removeAnnotations(annotations);
        this.markers_in_map = null;
        var link = Ti.Database.open(this.name);
        link.execute('DROP TABLE `pois`');
        link.close();
    },
    _importData : function() {
        var t_start = new Date().getTime();
        var link = Ti.Database.open(this.name);
        link.execute('CREATE TABLE IF NOT EXISTS `points` (lat NUMBER, lng NUMBER, data TEXT)');
        link.execute('BEGIN');
        this.points.forEach(function(point) {
            link.execute('INSERT OR REPLACE INTO `points` VALUES (?,?,?)', point.lat || point.latitude, point.lng || point.longitude, JSON.stringify(point));
        });
        link.execute('COMMIT');
        link.close();
        var t_end = new Date().getTime();
        console.log('MarkerManger: importData ' + (t_end - t_start) + ' ms.');
    },
    _startMap : function() {
        var region = this.map.getRegion();
        this._updateMap({
            latitude : region.latitude,
            longitude : region.longitude,
            latitudeDelta : region.latitudeDelta,
            longitudeDelta : region.longitudeDelta,
        });
    },
    _updateMap : function(region) {
        var t_start = new Date().getTime();
        // get all markers in boundaries:
        var link = Ti.Database.open(this.name);
        var res = link.execute('SELECT * FROM `points` WHERE lat>? AND lat<? AND lng>? AND lng<?', region.latitude - region.latitudeDelta, region.latitude + region.latitudeDelta, region.longitude - region.longitudeDelta, region.longitude + region.longitudeDelta);
        var items = [];
        // theoretical to show markers
        while (res.isValidRow()) {
            items.push({
                lat : parseFloat(res.getFieldByName('lat')),
                lng : parseFloat(res.getFieldByName('lng')),
                data : res.getFieldByName('data'), // qwe save string later we can export
                id : res.getFieldByName('rowid')
            });
            res.next();
        }
        res.close();
        link.close();
        var t_end = new Date().getTime();
        console.log('MarkerManger: readData from DB ' + (t_end -t_start) + ' ms.');
        // grouping in object_of_tiles_with_markers (RASTER in every direction => max. RASTER*RASTER on map)
        var tilewidth = region.longitudeDelta / RASTER;
        var tileheight = region.latitudeDelta / RASTER;
        var object_of_tiles_with_markers = {};
        //
         // clustering, we take only the first in list (our strategy):
         var t_start = new Date().getTime();
        items.forEach(function(item) {
            // calculation of key:
            var xkey = Math.floor((item.lng - region.longitude - region.longitudeDelta / 2) / RASTER);
            var ykey = Math.floor((item.lat + region.latitude - region.latitudeDelta / 2) / RASTER);
            var key = '' + xkey + ykey;
            if (!object_of_tiles_with_markers[key])
                object_of_tiles_with_markers[key] = [item];
            else
                object_of_tiles_with_markers[key].push(item);
        });
       
        var markers = {
            to_render : {}, // this markers we will see
            to_add : [], // news ones
            to_remove : [] // obsolete ones
        };
         var t_end = new Date().getTime();
        console.log('MarkerManger: clustering ' + (t_end - t_start) + ' ms.');
        // compressing:
        var t_start = new Date().getTime();
        for (key in object_of_tiles_with_markers) {
            if (object_of_tiles_with_markers.hasOwnProperty(key)) {
                markers.to_render[object_of_tiles_with_markers[key][0].id] = object_of_tiles_with_markers[key][0];
            }
        }
        var t_end = new Date().getTime();
        console.log('MarkerManger: compressing ' + (t_end - t_start) + ' ms.');
        object_of_tiles_with_markers = null;
        /*
         * map api uses arrays for adding removing
         * for persisting we use objects. This accelerate the access
         */
        var that = this;
        /* obsolete ones */
        for (id in this.markers_in_map) {
            if (this.markers_in_map.hasOwnProperty(id)) {
                if (markers.to_render[id] == undefined) {
                    markers.to_remove.push(that.markers_in_map[id]);
                    delete that.markers_in_map[id];
                }
            }
        }
        /* new ones: */
        for (id in markers.to_render) {
            if (markers.to_render.hasOwnProperty(id)) {
                if (that.markers_in_map[id] == undefined) {
                    var annotation = Map.createAnnotation({
                        latitude : markers.to_render[id].lat,
                        longitude : markers.to_render[id].lng,
                        image : that.image
                    });
                    markers.to_add.push(annotation);
                    that.markers_in_map[id] = annotation;
                }
            }
        };
        var t_end = new Date().getTime();
        console.log('MarkerManger: end calculating ' + (t_end - t_start) + ' ms.');
        this.map.removeAnnotations(markers.to_remove);
        this.map.addAnnotations(markers.to_add);
        var t_end = new Date().getTime();
        console.log('MarkerManger: end rendering ' + (t_end - t_start) + ' ms.');
    },
    fireEvent : function(_event, _payload) {
        if (this.eventhandlers[_event]) {
            for (var i = 0; i < this.eventhandlers[_event].length; i++) {
                this.eventhandlers[_event][i].call(this, _payload);
            }
        }
    },
    addEventListener : function(_event, _callback) {
        if (!this.eventhandlers[_event])
            this.eventhandlers[_event] = [];
        this.eventhandlers[_event].push(_callback);
    },
    removeEventListener : function(_event, _callback) {
        if (!this.eventhandlers[_event])
            return;
        var newArray = this.eventhandlers[_event].filter(function(element) {
            return element != _callback;
        });
        this.eventhandlers[_event] = newArray;
    }
};

module.exports = Module;
