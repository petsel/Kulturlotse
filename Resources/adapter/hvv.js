var Module = function() {
    var link = Ti.Database.open(Ti.App.Properties.getString('DATABASE'));
    link.execute('CREATE TABLE IF NOT EXISTS hvv (name TEXT UNIQUE,lat NUMBER, lng NUMBER)');
    var res = link.execute('SELECT count(*) FROM hvv');
    if (res.isValidRow()) {
        if (res.field(0) == 0) {
            var csv = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'model', 'hvv.csv').read().text;
            var list = require('vendor/parseCSV')(csv);
            var pois = [];
            list.forEach(function(poi) {
                var coords = require('vendor/gk2geo')({
                    rw : poi[1],
                    hw : poi[2]
                });
                pois.push({
                    name : poi[0],
                    lat : coords.lat - 0.00154,
                    lng : coords.lng - 0.001206,
                });
            });
            link.execute("BEGIN");
            pois.forEach(function(poi) {
                link.execute("INSERT OR REPLACE INTO hvv VALUES (?,?,?)", poi.name, poi.lat, poi.lng);
            });
            link.execute("COMMIT");
        }
    }
    res.close();
    link.close();
    return this;
};

Module.prototype = {
    getStations : function() {
        var link = Ti.Database.open(Ti.App.Properties.getString('DATABASE'));
        var res = link.execute('SELECT lat,lng,name FROM `hvv` ');
        var items = [];
        while (res.isValidRow()) {
            items.push({
                lat : parseFloat(res.getFieldByName('lat')).toFixed(6),
                lng : parseFloat(res.getFieldByName('lng')).toFixed(6),
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
