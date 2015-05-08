var Model = new (require('adapter/events'))();
var Moment = require('vendor/moment');


function ApplicationWindow(_locationId) {
    var self = Ti.UI.createWindow({
        backgroundColor : '#ffffff',fullscreen:true
      
    });
    var location = Model.getLocationById(_locationId);
    self.location= location.locationName;
   
    self.addEventListener('open', require('ui/main.actionbar'));
    
    self.add(Ti.UI.createScrollView({
        scrollType : 'vertical',left:10,right:10,
        layout : 'vertical'
    }));
   
    self.children[0].add(Ti.UI.createLabel({
        top : 5,
        width : Ti.UI.FILL,
        height : 'auto',
        text : location.teaserTextGerman,
        font : {
            fontSize : 20,
            fontFamily : 'PT Serif Bold'
        },
    }));

    return self;
}

module.exports = ApplicationWindow;
