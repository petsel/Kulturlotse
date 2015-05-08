var Moment = require('vendor/moment');

const DB = Ti.App.Properties.getString('DATABASE');

var Module = function() {
    this.eventhandlers = {};
    var link = Ti.Database.open(DB);
    if (link) {
        link.execute('CREATE TABLE IF NOT EXISTS events (date TEXT,eventid TEXT UNIQUE,locationId TEXT,title TEXT, description TEXT,imageToken TEXT,locationName TEXT,locationStreet TEXT, locationPlz TEXT, locationCity TEXT,categoryId NUMBER,displayDate TEXT,featured TEXT)');
        link.execute('CREATE TABLE IF NOT EXISTS locations (id TEXT UNIQUE,locationName TEXT,street TEXT,plz TEXT,city TEXT,teaserTextGerman TEXT,imageToken TEXT,url TEXT,latitude NUMBER,longitude NUMBER,accessibilityType TEXT,accessibilityText TEXT,hvvStops TEXT,handicappedParking TEXT,stadtrad TEXT)');
        link.execute('CREATE TABLE IF NOT EXISTS days (day TEXT UNIQUE,hash TEXT,size NUMBER,mtime NUMBER)');
        link.close();
    }
    link.close();
    this.loadLocations();
    return this;
};

Module.prototype = {
    getLocationById : function(_id) {
        var link = Ti.Database.open(DB);
        var res = link.execute("SELECT * FROM locations WHERE id=?", _id);
        var ret = {};
        if (res.isValidRow()) {
            var count = res.getFieldCount();
            for (var i = 0; i < count; i++) {
                ret[res.getFieldName(i)] = res.field(i);
            }
        }
        res.close();
        link.close();
        return ret;
    },
    loadLocations : function() {
        var that = this;
        var xhr = Ti.Network.createHTTPClient({
            timeout : 30000,
            onload : function() {
                if (this.status == 200) {
                    var json = JSON.parse(this.responseText);
                    var link = Ti.Database.open(DB);
                    link.execute("BEGIN");
                    json.locations.forEach(function(loc) {
                        link.execute("INSERT OR REPLACE INTO locations VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", '' + loc.id, loc.locationName, loc.street, loc.plz, loc.city, loc.teaserTextGerman, loc.imageToken, loc.url, loc.latitude, loc.longitude, loc.accessibilityType, loc.accessibilityText, loc.hvvStops, loc.handicappedParking, loc.stadtrad);
                    });
                    link.execute("COMMIT");
                    link.close();
                    Ti.App.Properties.setString('location', xhr.getResponseHeader('ETag'));
                }
                that.fireEvent("locationsready");
            },
            onerror : function() {
                console.log(this.error);
            }
        });
        var url = Ti.App.Properties.getString("ENDPOINT") + "locations";
        xhr.open("GET", url);
        Ti.App.Properties.hasProperty('location') && xhr.setRequestHeader('If-None-Match', Ti.App.Properties.getString('location'));
        xhr.setRequestHeader('Accept-Type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        //    xhr.setRequestHeader('X-Kultur1otse',Ti.Utils.md5HexDigest(Math.random()));
        xhr.send();
    },
    getEventsByLocation : function(_locationId) {
        var link = Ti.Database.open(DB);
        var res = link.execute("SELECT * FROM `events` WHERE events.locationId=? AND date>=? ORDER BY `date`", _locationId, Moment().format('YYYY-MM-DD'));
        var events = [];
        while (res.isValidRow()) {
            var count = res.getFieldCount();
            var ret = {};
            for (var i = 0; i < count; i++) {
                ret[res.getFieldName(i)] = res.field(i);
            }
            events.push(ret);
            res.next();
        }
        res.close();
        link.close();
        // NOW WE ORDER BY DATE:
        var days = {};
        events.forEach(function(event) {
            if (!days[event.date])
                days[event.date] = [];
            days[event.date].push(event);
        });

        return events;
    },
    getLocationsByDay : function(_date) {
        var link = Ti.Database.open(DB);
        var res = link.execute("SELECT events.*,locations.*  FROM events,locations WHERE events.locationId=locations.id AND events.date=?", _date || Moment().format('YYYY-MM-DD'));
        var locs = [];
        while (res.isValidRow()) {
            var count = res.getFieldCount();
            var ret = {};
            for (var i = 0; i < count; i++) {
                ret[res.getFieldName(i)] = res.field(i);
            }
            locs.push(ret);
            res.next();
        }
        res.close();
        link.close();

        return locs;
    },
    getEventsofDay : function(_date) {
        var selectedcategories = Ti.App.Properties.getList('selectedcategories', [1, 2, 3, 4, 5, 6, 7]);
        var events = [];
        var link = Ti.Database.open(DB);
        var res = link.execute("SELECT * FROM events WHERE date=? AND categoryID in (" + selectedcategories.join(',') + ")", _date);
        while (res.isValidRow()) {
            var count = res.getFieldCount();
            var ret = {};
            for (var i = 0; i < count; i++) {
                ret[res.getFieldName(i)] = res.field(i);
            }
            events.push(ret);
            res.next();
        }
        link.close();
        if (events.length) {
            var categories = {
                1 : [],
                2 : [],
                3 : [],
                4 : [],
                5 : [],
                6 : [],
                7 : []
            };
            events.forEach(function(event) {
                categories[event.categoryId].push(event);
            });
            events.length > 0 && this.fireEvent("eventsready", {
                events : events,
                categories : categories
            });
            return true;
        }
        return false;
    },
    /* will called from UI and calls background service */
    loadEventsofDay : function(_date, _forced) {
        var events = [];
        var that = this;
        var ok = this.getEventsofDay(_date);
        if (Ti.Network.online) {
            var xhr = Ti.Network.createHTTPClient({
                timeout : 30000,
                onload : function() {
                    var end = new Date().getTime();
                    console.log(_date + '    status=' + this.status + '      time=' + ((end - start) / 1000).toFixed(1) + 'sec.    ' + 'etag=' + xhr.getResponseHeader('ETag'));
                    if (this.status == 200) {
                        var json = JSON.parse(this.responseText);
                        var link = Ti.Database.open(DB);
                        link.execute("BEGIN");
                        json.eventsOfTheDay.forEach(function(json) {
                            link.execute("INSERT OR REPLACE INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)", //
                            _date, json.eventid, '' + json.locationId, json.title, json.text, json.imageToken, json.locationName, json.locationStreet, json.locationPlz, json.locationCity, json.categoryId, json.displayDate, json.featured);
                        });
                        link.execute("COMMIT");
                        link.execute("INSERT OR REPLACE INTO days VALUES (?,?,?,?)", _date, xhr.getResponseHeader('ETag'), this.responseText.length, Moment().unix());
                        link.close();
                    }
                    that.getEventsofDay(_date);
                },
                onerror : function() {
                    console.log(this.error);
                }
            });
            var url = Ti.App.Properties.getString("ENDPOINT") + "daily?day=" + _date;
            xhr.open("GET", url);
            xhr.setRequestHeader('Accept-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
            var link = Ti.Database.open(DB);
            var res = link.execute("SELECT hash FROM days WHERE day=?", _date);
            if (res.isValidRow() && ok) {
                xhr.setRequestHeader('If-None-Match', res.getFieldByName('hash'));
            }    
            res.close();
            link.close();
            xhr.send();
            var start = new Date().getTime();
        } else {
            this.fireEvent("eventsready", {
                error : true,
                reason : 'offline'
            });

        }
    },
    // standard methods for event/observer pattern
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
