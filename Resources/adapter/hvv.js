var Module = function() {
    Ti.Database.install('model/HVVSTATIONS.sql', 'HVVSTATIONS').close();
    return this;
};

Module.prototype = {
    getStations : function() {
        var args = arguments[0] || {};
        var x = args.longitudeDelta * .6,
            y = args.latitudeDelta * .6;
        var link = Ti.Database.open(Ti.App.Properties.getString('DATABASE'));
        var res = link.execute('SELECT rowid,lat,lng,name FROM hvv_stations WHERE lat>? AND lat<? AND lng>? AND lng<? LIMIT ?', args.latitude - y, args.latitude + y, args.longitude - x, args.longitude + x, args.limit || 120);
        var items = [];
        while (res.isValidRow()) {
            items.push({
                lat : parseFloat(res.getFieldByName('lat')).toFixed(6),
                lng : parseFloat(res.getFieldByName('lng')).toFixed(6),
                name : res.getFieldByName('name'),
                id : res.getFieldByName('rowid')
            });
            res.next();
        }
        res.close();
        link.close();
        return items;
    }
};
module.exports = Module;
