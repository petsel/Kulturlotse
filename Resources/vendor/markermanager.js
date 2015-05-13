const RASTER = 25;

var Map =require('ti.map');

var Module = function() {
    var options = arguments[0] || {};
    this.name = options.name;
    this.markers_in_map = {};
    this.eventhandlers = {};
    // name of manager = database name
    this.DB = options.map;
    // Proxy object
    this.points = options.points;
    var link = Ti.Database.open(this.name);
    link.execute('CREATE TABLE IF NOT EXIST `pois` (lat NUMBER, lng NUMBER, data TEXT)');
    link.execute('BEGIN');
    this.points.forEach(function(point) {
        link.execute('INSERT OR REPLACE INTO `pois` VALUES (?,?,?)', point.lat || point.latitude, point.lng || point.longitude, JSON.stringify(point));
    });
    link.execute('COMMIT');
    this.map.addEventListener('regionchanged', this.updateMap).bind(this);
    return this;
};
function isIteminList(needle, haystack) {
    for (var i,
        l = haystack.length; i < l; i++) {
        if (haystack.id == needle.id)
            return true;
    }
    return false;
}

Module.prototype = {
    updateMap : function() {
        var args = arguments[0] || {};
        // get all markers in boundaries:
        var link = Ti.Database.open(this.DB);
        var res = link.execute('SELECT * FROM `points` WHERE lat>? AND lat<? AND lng>? AND lng<?', args.latitude - args.latitudeDelta, args.latitude + args.latitudeDelta, args.longitude - args.longitudeDelta, args.longitude + args.longitudeDelta);
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
        // grouping in object_of_tiles_with_markers (RASTER in every direction => max. RASTER*RASTER on map)
        var tilewidth = args.longitudeDelta / RASTER;
        var tileheight = args.latitudeDelta / RASTER;
        var object_of_tiles_with_markers = {};
        //
        items.forEach(function(item) {
            // calculation of key:
            var xkey = Math.floor((item.lng - args.longitude - args.longitudeDelta / 2) / RASTER);
            var ykey = Math.floor((item.lat + args.latitude - args.latitudeDelta / 2) / RASTER);
            var key = '' + xkey + ykey;
            if (!object_of_tiles_with_markers[key])
                object_of_tiles_with_markers[key] = [item];
            else
                object_of_tiles_with_markers[key].push(item);
        });
        // clustering, we take only the first in list (our strategy):
        var markers = {
            to_render : {}, // this markers we will see
            to_add : [], // news ones
            to_remove : [] // obsolete ones
        };
        // compressing:
        for (key in object_of_tiles_with_markers) {
            if (object_of_tiles_with_markers.hasOwnProperty(key)) {
                markers.to_render[object_of_tiles_with_markers[key][0].id] = object_of_tiles_with_markers[key][0];
            }
        }
        object_of_tiles_with_markers = null;
        /*
         * map api uses arrays for adding removing
         * for persisting we use objects. This accelerate the access
         */
        var that = this;
        /* obsolete ones */
        for (id in this.markers_in_map) {
            if (this.markers_in_map.hasOwnProperties(id)) {
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
                        longitude : markers.to_render[id].lng
                    });
                    markers.to_add.push(annotation);
                    that.markers_in_map[id] = annotation;
                }
            }
        };
        this.map.removeAnnotations(markers.to_remove);
        this.map.addAnnotations(markers.to_add);
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
