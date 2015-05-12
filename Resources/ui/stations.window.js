//Application Window Component Constructor
var Moment = require('vendor/moment');
Moment.locale('de');
var ActionBar = require('com.alcoapps.actionbarextras');
function Module() {
    var self = Ti.UI.createWindow({
        fullscreen : true
    });
    self.list = Ti.UI.createListView({
        templates : {
            'stations' : require('ui/TEMPLATES').stations,
        },
        sections : [Ti.UI.createListSection({
            headerTitle : 'car2go sortiert nach Entfernung zu Deinem Standort'
        })],
        defaultItemTemplate : 'stations',
    });
    self.add(self.list);
    require('adapter/car2go').get({
        done : function(_payload) {
            self.list.sections[0].items = _payload.map(function(_station) {
                return {
                    properties : {},
                    title : {
                        text : _station.address.split(',')[0]
                    },
                    dist : {
                        text : 'Entfernung: ' + _station.dist + ' mtr.'
                    }

                };
            });
        }
    });
    self.addEventListener('open', require('ui/stations.actionbar'));
    return self;
}

module.exports = Module;
