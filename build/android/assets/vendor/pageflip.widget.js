module.exports=function(e){var a=e.pages.length;if("android"===Ti.Platform.osname){var n=require("de.manumaticx.androidflip"),t=n.createFlipView({orientation:n.ORIENTATION_HORIZONTAL,overFlipMode:n.OVERFLIPMODE_GLOW,views:e.pages,height:Ti.UI.FILL,currentPage:e.startPage?e.startPage:0});return t.addEventListener("flipped",function(n){e.onflipend&&e.onflipend({current:n.index,pagecount:a,total:a})}),t}if("iphone"===Ti.Platform.osname||"ipad"===Ti.Platform.osname){var n=require("org.bcbhh.IosFlipView"),t=n.createView({startPage:e.startPage?e.startPage:0,transitionDuration:.4,height:Ti.UI.FILL,width:Ti.UI.FILL,pages:e.pages,tapRecognitionMargin:0,swipeThreshold:50});return t.peakNext=function(){},t.addEventListener("change",function(n){e.onflipend&&e.onflipend({current:n.source.currentPage,total:a,pagecount:a})}),t}};