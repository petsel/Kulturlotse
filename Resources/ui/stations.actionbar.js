var ActionBar = require('com.alcoapps.actionbarextras');

module.exports = function(_event) {
    ActionBar.setTitle('Kulturlotse');
    ActionBar.setSubtitle('car2go');
    ActionBar.setFont("PT Serif Bold");
    ActionBar.subtitleColor = "#444";
    var activity = _event.source.getActivity();
    if (!activity)  return;
        activity.onCreateOptionsMenu = function(_menuevent) {
             _menuevent.menu.clear();
            activity.actionBar.displayHomeAsUp = true;
        };
        activity && activity.invalidateOptionsMenu();
        activity.actionBar.onHomeIconItemSelected = function(_e) {
              _event.source.close();
        }
    
};
