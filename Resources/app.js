! function() {
    Ti.UI.backgroundImage = '/assets/bg.png';
    require('ui/main.window')().open();
    require('vendor/versionsreminder')();
    
}();
