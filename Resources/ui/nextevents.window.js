//Application Window Component Constructor
var Moment = require('vendor/moment');
Moment.locale('de');

var Model = new (require('adapter/events'))();

var ActionBar = require('com.alcoapps.actionbarextras');

module.exports = function(_event) {
    var self = Ti.UI.createWindow({
        fullscreen : true,
    });
    self.listView = Ti.UI.createListView({
        templates : {
            'events' : require('ui/TEMPLATES').eventsbylocation,
        },
        defaultItemTemplate : 'events',
        sections: Model.getEventsByLocation(_event.locationId).map(function(item) {
            
            item.imageurl = (item.imageToken) ? 'http://www.kulturlotse.de/bild/l/x-' + item.imageToken + '.jpg' : '';
          if (!item.text)
               item.text = item.description || '';
           console.log(item);    
           return Ti.UI.createListSection({
                headerTitle : Moment(item.date).format('DD.MM.YYYY'),
                items : [{
                  properties : {
                  itemId : JSON.stringify(item)
                },
                title : {
                 text : item.title
              },
             text : {
                    text : truncate(item.text.replace(/<br>/ig, '\n').replace(/(<([^>]+)>)/ig, ""), 110)
              },
               image : {
                image : item.imageurl
            }
        }]  });    
    } )
    });
    function openEventWindow(_e) {
        self.listView.removeEventListener('itemclick', openEventWindow);
        require('ui/event.window')(JSON.parse(_e.itemId)).open();
        Ti.Media.vibrate([0, 1]);
        setTimeout(function() {
            self.listView.addEventListener('itemclick', openEventWindow);
        }, 200);
    }
    self.add(self.listView);
  
   
    
    self.addEventListener('open', function() {
        ActionBar.setFont("PT Serif Bold");
        ActionBar.subtitleColor = "#444";
        ActionBar.setTitle('Kulturlotse');
         ActionBar.setSubtitle(_event.locationName);
        var activity = self.getActivity();
         if (!activity)  return;
            activity.actionBar.displayHomeAsUp =  true;
        activity.invalidateOptionsMenu();
        activity.actionBar.onHomeIconItemSelected = function(_e) {
              self.close();
        }
    });
      self.listView.addEventListener('itemclick', openEventWindow);
    return self;
};

function truncate(str, limit) {
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
}
