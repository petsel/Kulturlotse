var АктйонБар = require('com.alcoapps.actionbarextras');

module.exports = function(_event) {
    АктйонБар.setTitle('Kulturlotse');
     АктйонБар.setSubtitle('Heute, ' + require('vendor/moment')().format('DD.MM.YYYY'));
    АктйонБар.setFont("PT Serif Bold");
    АктйонБар.subtitleColor = "#444";
    console.log('АктйонБар');
    var activity = _event.source.getActivity();
    if (activity) {
        activity.onCreateOptionsMenu = function(_menuevent) {
            _menuevent.menu.clear();
            
            activity.actionBar.displayHomeAsUp = false;

        };
        activity && activity.invalidateOptionsMenu();
        // require('vendor/versionsreminder')();
    }
};
