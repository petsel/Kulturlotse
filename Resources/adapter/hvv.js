var Module = function() {
    this.eventhandlers = {};
    var link = Ti.Database.open(Ti.App.Properties.getString('DATABASE'));
    link.execute('CREATE TABLE IF NOT EXISTS hvv (name TEXT UNIQUE,lat NUMBER, lng NUMBER)');
    var res = link.execute('SELECT count(*) FROM hvv');
    if (res.isValidRow()) {
        if (res.field(0) == 0) {
            var csv = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'model', 'hvv.csv').read().text;
            var list = require('vendor/parseCSV')(csv);
            var pois = list.map(function(poi) {
                return {
                    name : poi[0],
                    coords : require('vendor/gk2geo')({
                        rw : poi[1],
                        hw : poi[2]
                    })
                };
            });
            link.execute("BEGIN");
            pois.forEach(function(poi) {

                link.execute("INSERT OR REPLACE INTO hvv VALUES (?,?,?)", poi.name, poi.coords.lat, poi.coords.lng);
            });
            link.execute("COMMIT");
        }
        res.close();
    };
    link.close();
    return this;
};
Module.prototype = {
    getStations : function() {
        var args = arguments[0] || {};
        var x =args.longitudeDelta*.6,y=args.latitudeDelta*.6;
        var link = Ti.Database.open(Ti.App.Properties.getString('DATABASE'));
        var res = link.execute('SELECT lat,lng,name FROM hvv WHERE lat>? AND lat<? AND lng>? AND lng<? LIMIT ?', args.latitude - y, args.latitude + y, args.longitude - x, args.longitude + x, args.limit || 120);
        var items = [];
        while (res.isValidRow()) {
            items.push({
                lat : (parseFloat(res.getFieldByName('lat'))-0.0015).toFixed(6),
                lng : (parseFloat(res.getFieldByName('lng'))-0.0010).toFixed(6),
                name : res.getFieldByName('name')
            });
            res.next();
        }
        res.close();
        link.close();
        return items;
    }
};
module.exports = Module;
