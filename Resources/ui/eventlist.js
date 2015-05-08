var Moment = require('vendor/moment');
var truncate = function(str, limit) {
    var bits,
        i;
    bits = str.split('');
    if (bits.length > limit) {
        for ( i = bits.length - 1; i > -1; --i) {
            if (i > limit) {
                bits.length = i;
            } else if (' ' === bits[i]) {
                bits.length = i;
                break;
            }
        }
        bits.push(' …');
    }
    return bits.join('');
};

module.exports = function(_offset) {
    var Model = new (require('adapter/events'))();
    var swipeRefreshModule = require('com.rkam.swiperefreshlayout');
    var sections = [];
    var self = Ti.UI.createListView({
        templates : {
            'events' : require('ui/TEMPLATES').events,
        },
        sections : sections,
        defaultItemTemplate : 'events',
    });
    var swipeRefresh = swipeRefreshModule.createSwipeRefresh({
        view : self,
        height : Ti.UI.FILL,
        width : Ti.UI.FILL
    });
    swipeRefresh.setRefreshing(true);
    setTimeout(function() {
        swipeRefresh.setRefreshing(false);
    }, 10000);
    function openEventWindow(_e) {
        self.removeEventListener('itemclick', openEventWindow);
        require('ui/event.window')(JSON.parse(_e.itemId)).open();
        Ti.Media.vibrate([0, 5]);
        setTimeout(function() {
            self.addEventListener('itemclick', openEventWindow);
        }, 200);
    }
    self.addEventListener('itemclick', openEventWindow);
    Model.addEventListener('eventsready', function(_payload) {
        swipeRefresh.setRefreshing(false);
        if (_payload.error)
            return;
        var categorynames = Ti.App.Properties.getString('categories').split(',');
        var s = 0;
        for (categoryId in _payload.categories) {
            sections[s] = Ti.UI.createListSection({
                headerTitle : categorynames[s],
                items : _payload.categories[categoryId].map(function(item, indx) {
                    item.imageurl = (item.imageToken) ? 'http://www.kulturlotse.de/bild/l/x-' + item.imageToken + '.jpg' : '';
                    if (!item.text)
                        item.text = item.description || '';
                    return {
                        properties : {
                            itemId : JSON.stringify(item)
                        },
                        title : {
                            text : item.title
                        },
                        text : {
                            text : truncate(item.text.replace(/<br>/ig, '\n').replace(/(<([^>]+)>)/ig, ""), 72)
                        },
                        locationname : {
                            text : item.locationName
                        },
                        locationstreet : {
                            text : item.locationStreet
                        },
                        image : {
                            image : item.imageurl
                        }
                    };
                })
            });
            s++;
        };
        self.setSections(sections);
        return;
    });
    swipeRefresh.addEventListener('refreshing', function() {
        Model.loadEventsofDay(Moment().add(_offset, 'd').format('YYYY-MM-DD'),true);
        setTimeout(function() {
            swipeRefresh.setRefreshing(false);
        }, 10000);
    });
    Model.loadEventsofDay(Moment().add(_offset, 'd').format('YYYY-MM-DD'));
    Ti.App.addEventListener('categorieschanged', function() {
        Model.getEventsofDay(Moment().add(_offset, 'd').format('YYYY-MM-DD'));
    });
    return swipeRefresh;
};

