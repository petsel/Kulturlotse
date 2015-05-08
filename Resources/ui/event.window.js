var SCREENHEIGHT = parseInt(Ti.Platform.displayCaps.platformHeight),
    SCREENWIDTH = parseInt(Ti.Platform.displayCaps.platformWidth);

if (Ti.Platform.osname === 'android') {
    SCREENHEIGHT /= Ti.Platform.displayCaps.logicalDensityFactor;
    SCREENWIDTH /= Ti.Platform.displayCaps.logicalDensityFactor;
}

module.exports = function ApplicationWindow(_options) {
    var Model = new (require('adapter/events'))();
    console.log(_options);
    var self = Ti.UI.createWindow({
        event : _options,
        fullscreen : true,
        orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
    });
    setTimeout(function() {
        self.add(Ti.UI.createScrollView({
            scrollType : 'vertical',
            layout : 'vertical'
        }));
        console.log(SCREENWIDTH + '   ' + SCREENHEIGHT);
        console.log(Math.min(SCREENWIDTH, SCREENHEIGHT));
        if (_options.imageurl != '') {
            self.children[0].add(Ti.UI.createView({
                top : 0,
                width : Math.min(SCREENWIDTH, SCREENHEIGHT),
                height : Math.min(SCREENWIDTH, SCREENHEIGHT) * .72,
            }));
            require('vendor/cachedimage')({
                view : self.children[0].children[0],
                url : _options.imageurl
            });
        }
        self.children[0].add(Ti.UI.createLabel({
            top : 5,
            width : Ti.UI.FILL,
            height : 'auto',
            left : 10,
            right : 10,
            text : _options.title,
            font : {
                fontSize : 20,
                fontFamily : 'PT Serif Bold'
            },
        }));
        self.children[0].add(Ti.UI.createLabel({
            top : 5,
            width : Ti.UI.FILL,
            height : 'auto',
            left : 10,
            right : 10,
            html : _options.text,
            font : {
                fontSize : 16,
                fontFamily : 'DroidSans'

            },
        }));
        self.children[0].add(Ti.UI.createLabel({
            top : 5,
            width : Ti.UI.FILL,
            height : 'auto',
            left : 10,
            right : 10,
            text : 'Ort: ' + _options.locationName,
            font : {
                fontSize : 16,
                fontFamily : 'DroidSans'
            },
        }));
        self.children[0].add(Ti.UI.createLabel({
            top : 5,
            width : Ti.UI.FILL,
            height : 'auto',
            left : 10,
            right : 10,
            text : 'Adresse: ' + _options.locationCity + ', ' + _options.locationStreet,
            font : {
                fontSize : 16,
                fontFamily : 'DroidSans'
            },
        }));
        var loc = Model.getLocationById(_options.locationId);
        console.log(_options);
        self.children[0].add(Ti.UI.createLabel({
            top : 5,
            width : Ti.UI.FILL,
            height : 'auto',
            left : 10,
            right : 10,
            text : loc.teaserTextGerman,
            font : {
                fontSize : 16,
                fontFamily : 'DroidSans'
            },
        }));

    }, 100);
    self.addEventListener('open', require('ui/main.actionbar'));
    return self;
};
//https://maps.googleapis.com/maps/api/place/nearbysearch/json?language=de&radius=5000&key=AIzaSyD1nGMDndlYPly6gD_8xIt5zLniSE6O9es&location=53.59,10&types=subway_station