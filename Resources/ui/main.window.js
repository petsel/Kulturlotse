//Application Window Component Constructor
var Moment = require('vendor/moment');
Moment.locale('de');
var ActionBar = require('com.alcoapps.actionbarextras');
function Module() {
    var self = Ti.UI.createWindow({
        fullscreen : true
    });
    var pages = [];
    for (var i = -1; i < 5; i++) {
        pages[i] = require('ui/eventlist')(i - 1);
    }
    var FlipView = require('vendor/pageflip.widget')({
        pages : pages,
        startPage : 1,
        backgroundImage : '/assets/bg.png',
        onflipend : function(_e) {
            switch (_e.current - 1) {
            case -1:
                var day = 'Gestern, ';
                break;
            case 0 :
                var day = 'Heute, ';
                break;
            case 1 :
                var day = 'Morgen, ';
                break;
            case 2 :
                var day = 'Übermorgen, ';
                break;
            default :
                var day = '';
            }
            day += Moment().add(_e.current - 1, 'd').format('D. MMM YYYY');
            ActionBar.setSubtitle(day);
            Ti.App.fireEvent('day',{
                "day" : Moment().add(_e.current-1,'d').format('YYYY-MM-DD')
            });
        }
    });
    self.add(FlipView);
    self.addEventListener('open', require('ui/main.actionbar'));
    return self;
}
module.exports = Module;
