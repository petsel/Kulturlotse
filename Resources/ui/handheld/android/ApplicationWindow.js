//Application Window Component Constructor
function ApplicationWindow() {
    //load component dependencies
    var FirstView = require('ui/common/FirstView');

    //create component instance
    var self = Ti.UI.createWindow({
        backgroundColor:'#ffffff',
        //fullscreen:true
    });

    self.addEventListener('open',require('ui/main.actionbar'));

    return self;
}

module.exports = ApplicationWindow;
