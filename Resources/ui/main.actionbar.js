var ActionBar = require('com.alcoapps.actionbarextras');
var Moment = require('vendor/moment');
var day = Moment().format('YYYY-MM-DD');

module.exports = function(_event) {
    Ti.App.addEventListener('day',function(_payload){
        day = _payload.day;
    });
    var event = _event.source.event; 
    var activity = _event.source.getActivity();
    ActionBar.setFont("PT Serif Bold");
    ActionBar.subtitleColor = "#444";
    var mapworks =  require('vendor/gms.test')();
    if (!activity)  return;
        activity.onCreateOptionsMenu = function(_menuevent) {
             _menuevent.menu.clear();
             if (mapworks) _menuevent.menu.add({
                title : 'Karte',
                itemId : '3',
                icon:  Ti.App.Android.R.drawable.ic_action_hhmap,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
                     }).addEventListener("click", function() {
                            console.log('click='+ day);
                            require('ui/map.window')({
                                 day : day
                            }).open();
                   }); 
              _menuevent.menu.add({
                title : 'Filter',
                itemId : '5',
                icon:  Ti.App.Android.R.drawable.ic_action_filter,
                showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
                     }).addEventListener("click", function() {
                        var cats = Ti.App.Properties.getString('categories').split(',');
                        var selectedindexes = Ti.App.Properties.getList('selectedindexes',[0,1,2,3,4,5,6]);
                        var selectedcategories = Ti.App.Properties.getList('selectedcategories',[1,2,3,4,5,6,7]);
                        var selected = [];
                        selectedindexes.forEach(function(i){selected.push(cats[i]);});
                        var filter =  require('yy.tidialogs').createMultiPicker({
                             title:"Kategoriefilter", 
                             options:cats, 
                             selected : selected,
                             okButtonTitle : "Mach' es!",     // <-- optional
                        });
                        filter.addEventListener('click',function(_e) {
                            Ti.App.Properties.setList('selectedindexes',_e.indexes);
                            Ti.App.Properties.setList('selectedcategories',_e.indexes.map(function(i){return i+1;}));
                            Ti.App.fireEvent('categorieschanged');
                        });
                        filter.show();
                   }); 
            if (event && event.locationId && mapworks) {
                 _menuevent.menu.clear();
                _menuevent.menu.add({
                title : 'Wo finde ich … ?',
                itemId : '1',
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
                     }).addEventListener("click", function() {
                         var win = require('ui/map.window')(event).open();
                   });
                _menuevent.menu.add({
                title : 'Wie finde ich dorthin?',
                itemId : '2',
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
                     }).addEventListener("click", function() {
                          var win = require('ui/routing.window')(event).open();
                
                   });  
                 
                 if (event.locationId && event.locationId != '0') 
                 _menuevent.menu.add({
                title : 'nächste Veranstaltungen',
                itemId : '2',
                showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
                     }).addEventListener("click", function() {
                           require('ui/nextevents.window')(event).open(); 
                   });          
            }
            activity.actionBar.displayHomeAsUp = event ? true : false;
        };
        activity && activity.invalidateOptionsMenu();
        activity.actionBar.onHomeIconItemSelected = function(_e) {
              _event.source.close();
        }
    ActionBar.setTitle('Kulturlotse');
    ActionBar.setSubtitle(event ? event.locationName : 'Heute, ' + require('vendor/moment')().format('DD.MM.YYYY'));
};
