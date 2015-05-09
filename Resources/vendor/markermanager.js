/*

 */
const RASTER = 25;

var Module = function() {
    var args = arguments[0] || {};

    this.DB = args.databasename || console.log('Error: database is missing for markermanager.');
    this.map = args.map || console.log('Error: map is missing for markermanager.');
    this.tablename = args.tablename;
    this.eventhandlers = {};
    this.map.addEventListener('regionchanged', this.updateMap).bind(this);
    return this;
};

Module.prototype = {
    updateMap : function() {
        var args = arguments[0] || {};
        // get all markers in boundaries:
        var link = Ti.Database.open(this.DB);
        var res = link.execute('SELECT * FROM `' + this.tablename + '` WHERE lat>? AND lat<? AND lng>? AND lng<?', args.latitude - args.latitudeDelta, args.latitude + args.latitudeDelta, args.longitude - args.longitudeDelta, args.longitude + args.longitudeDelta);
        var items = [];
        while (res.isValidRow()) {
            items.push({
                lat : parseFloat(res.getFieldByName('lat')),
                lng : parseFloat(res.getFieldByName('lng')),
                name : res.getFieldByName('name'),
                id : res.getFieldByName('rowid')
            });
            res.next();
        }
        res.close();
        link.close();
        // group in tiles (RASTER in every direction => max. RASTER*RASTER on map)
        var tilewidth = args.longitudeDelta / RASTER;
        var tileheight = args.latitudeDelta / RASTER;
        var tiles = {};  // or []
        items.forEach(function(item) {
            // calculation of key:
            var xkey = Math.floor((item.lng - args.longitude - args.longitudeDelta / 2) / RASTER);
            var ykey = Math.floor((item.lat + args.latitude - args.latitudeDelta / 2) / RASTER);
            var key = '' + xkey + ykey;
            if (!tiles[key])
                tiles[key] = [item];
            else
                tiles[key].push(item);
        });
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
