/*

 */

var Module = function() {
    var args = arguments[0] || {};
    this.DB = args.databasename || console.log('Error: database is missing for markermanager.');
    this.map = args.map || console.log('Error: map is missing for markermanager.');
    this.eventhandlers = {};
    this.map.addEventListener('regionchanged', this.updateMap).bind(this);
    return this;
};

Module.prototype = {
    updateMap : function() {
    },
    fireEvent : function(_event, _payload) {
        if (this.eventhandlers[_event]) {
            for (var i = 0; i < this.eventhandlers[_event].length; i++) {
                this.eventhandlers[_event][i].call(this, _payload);
            }
        }
    },
    addEventListener : function(_event, _callback) {
        if (!this.eventhandlers[_event])
            this.eventhandlers[_event] = [];
        this.eventhandlers[_event].push(_callback);
    },
    removeEventListener : function(_event, _callback) {
        if (!this.eventhandlers[_event])
            return;
        var newArray = this.eventhandlers[_event].filter(function(element) {
            return element != _callback;
        });
        this.eventhandlers[_event] = newArray;
    }
};

module.exports = Module;
