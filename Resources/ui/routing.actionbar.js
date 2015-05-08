'use strict';
var ActionBar = require('com.alcoapps.actionbarextras');

var modes = [
        {name:"walking",text:'Fußmarsch'},
        {name:"bicycling",text:'eigenes Fahrrad'},
        {name:"stadtrad",text:'StadtRad',stadtrad:true},
        {name:"transit",text:'ÖPNV'},
        {name:"driving",text:'eigenes Kraftfahrzeug'}
];

module.exports = function(_event) {
    var event = JSON.parse(_event.source.event);
    ActionBar.setTitle(event.title);
    ActionBar.setFont("PT Serif Bold");
    ActionBar.subtitleColor = "#444";
    var activity = _event.source.getActivity();
    if (activity) {
        
    activity.onCreateOptionsMenu = function(_menuevent) {
        _menuevent.menu.clear();
        modes.forEach(function(mode,ndx) {
            _menuevent.menu.add({
             title : mode.text,
             itemId : ndx,
             checkable:true,
             checked : Ti.App.Properties.getString('MODE','walking') == mode.name ? true :false,
             showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
            }).addEventListener("click", function() {
                _menuevent.menu.getItems().forEach(function(item){
                    item.setChecked(false);
                });
                _menuevent.menu.getItems()[ndx].setChecked(true);
                Ti.App.Properties.setString('MODE',mode.name)
                Ti.App.Properties.setString('MODESTRING',mode.text)
                 if (mode.name=='stadtrad')
                     _event.source.fireEvent('modechanged',{
                         mode:'walking',
                         stadtrad:mode.stadtrad
                     });
                     else _event.source.fireEvent('modechanged',{
                       mode:mode.name,
                       stadtrad:mode.stadtrad
                 });
            }); 
        });
        activity.actionBar.displayHomeAsUp =  true;
        activity.actionBar.onHomeIconItemSelected = function(_e) {
            _event.source.close();
        };
    };
    }
};
