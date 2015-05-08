/*
 * Parameters:
 * pages [view]
 * startPage INT
 * Events:
 * onflipend
 * 
 */


module.exports = function(_args) {
	var total = _args.pages.length;
	if (Ti.Platform.osname === 'android') {
		var FlipModule = require('de.manumaticx.androidflip');
		var self = FlipModule.createFlipView({
			orientation : FlipModule.ORIENTATION_HORIZONTAL,
			overFlipMode : FlipModule.OVERFLIPMODE_GLOW,
			views : _args.pages,
			height : Ti.UI.FILL,
			currentPage : (_args.startPage) ? _args.startPage : 0,
		});
		
		self.addEventListener('flipped', function(_e) {
			_args.onflipend && _args.onflipend({
				current : _e.index,
				pagecount : total,
				total : total
			});
		});
		return self;
	}
	/* iOS, also iPhone, iPad und iPod*/
	if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
		var FlipModule = require('org.bcbhh.IosFlipView');
		var self = FlipModule.createView({
			startPage : (_args.startPage) ? _args.startPage : 0,
			transitionDuration : 0.4,
			height : Ti.UI.FILL,
			width : Ti.UI.FILL,
			pages : _args.pages,
			tapRecognitionMargin : 0,
			swipeThreshold : 50
		});
		self.peakNext =function() {};
		self.addEventListener('change', function(_e) {
			_args.onflipend && _args.onflipend({
				current : _e.source.currentPage,
				total : total,
				pagecount : total
			});
		});
		return self;
	}
};
