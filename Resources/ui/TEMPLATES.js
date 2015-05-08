exports.events = {
    properties : {
        height : Ti.UI.SIZE,
        backgroundColor : 'white',
    },
    childTemplates : [{
        type : 'Ti.UI.ImageView',
        bindId : 'image',
        properties : {
            top : 5,
            defaultImage : '/assets/default.png',
            left : 0,
            width : 90,
            height : 70
        }

    }, {
        type : 'Ti.UI.View',
        properties : {
            width : Ti.UI.FILL,
            layout : 'vertical',
            left : 100,
            top : 0,
            height : Ti.UI.SIZE,
            right : 15
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                top : 5,
                color : '#444',
                font : {
                    fontSize : 20,
                    fontFamily : 'PT Serif Bold'
                },
                left : 0,
                width : Ti.UI.FILL,
            }

        }, {
            type : 'Ti.UI.Label',
            bindId : 'text',
            properties : {
                left : 0,
                top : 0,
                text : '',
                height : Ti.UI.SIZE,
                touchEnabled : false,
                font : {
                    fontSize : 14,
                    fontFamily : 'DroidSans'
                },
                color : '#333'
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'locationname',
            properties : {
                left : 0,
                top : 5,
                text : '',
                height : Ti.UI.SIZE,
                touchEnabled : false,
                font : {
                    fontSize : 14,
                    fontFamily : 'DroidSans'
                },
                color : '#FF9300'
            }
        }, {
            type : 'Ti.UI.Label',
            bindId : 'locationstreet',
            properties : {
                left : 0,
                top : 0,
                bottom : 5,
                text : '',
                height : Ti.UI.SIZE,
                touchEnabled : false,
                font : {
                    fontSize : 14,
                    fontFamily : 'DroidSans'
                },
                color : '#FF9300'
            }
        }]
    }]
};
exports.eventsbylocation = {
    properties : {
        height : Ti.UI.SIZE,
        backgroundColor : 'white',
    },
    childTemplates : [{
        type : 'Ti.UI.ImageView',
        bindId : 'image',
        properties : {
            top : 0,
            defaultImage : '/assets/default.png',
            left : 0,
            width : 135,
            height : 105
        }

    }, {
        type : 'Ti.UI.View',
        properties : {
            width : Ti.UI.FILL,
            layout : 'vertical',
            left : 150,
            top : 0,
            height : Ti.UI.SIZE,
            right : 15
        },
        childTemplates : [{
            type : 'Ti.UI.Label',
            bindId : 'title',
            properties : {
                top : 5,
                color : '#444',
                font : {
                    fontSize : 20,
                    fontFamily : 'PT Serif Bold'
                },
                left : 0,
                width : Ti.UI.FILL,
            }

        }, {
            type : 'Ti.UI.Label',
            bindId : 'text',
            properties : {
                left : 0,
                top : 0,
                text : '',
                height : Ti.UI.SIZE,
                touchEnabled : false,
                font : {
                    fontSize : 14,
                    fontFamily : 'DroidSans'
                },
                color : '#333'
            }
        }]
    }]
};
