/*

 */

var Module = function() {
    var args = arguments[0] || {};
    this.maxnumberofmarkers = args.maxnumberofmarkers || 50;
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
        var link = Ti.Database.open(this.DB);
        var res = link.execute('SELECT * FROM `'+this.tablename+'` WHERE lat>? AND lat<? AND lng>? AND lng<? LIMIT ?', args.latitude - args.latitudeDelta, args.latitude + args.latitudeDelta, args.longitude - args.longitudeDelta, args.longitude + args.longitudeDelta, this.limit || 120);
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
