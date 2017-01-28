/**
 * @author Symeon del Marmol
 *
 * This class represents custom event listener that trigger a list of functions
 * when an event occurs.
 */

function EventListener() {

    var functions = [];

    this.addListener = function(listener) {
        functions.push(listener);
    };

    this.trigger = function(params) {
        functions.forEach(function(f) {
           f(params);
        });
    };
}

/**
 * This is an extension of GeoJSON from Leaflet to support TopoJSON files
 *
 * Copyright (c) 2013 Ryan Clark
 * https://gist.github.com/rclark/5779673
 */

L.TopoJSON = L.GeoJSON.extend({
    addData: function(jsonData) {
        if (jsonData.type === "Topology") {
            for (key in jsonData.objects) {
                geojson = topojson.feature(jsonData, jsonData.objects[key]);
                L.GeoJSON.prototype.addData.call(this, geojson);
            }
        }
        else {
            L.GeoJSON.prototype.addData.call(this, jsonData);
        }
    }
});

function LogSlider(min, max) {
    this.minpos = 0;
    this.maxpos = 50;
    this.minlval = Math.log(min);
    this.maxlval = Math.log(max);

    this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
    setBounds: function(min, max) {
        this.minlval = Math.log(min);
        this.maxlval =  Math.log(max);
        this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
    },
    // Calculate value from a slider position
    value: function(position) {
        return Math.exp((position - this.minpos) * this.scale + this.minlval);
    },
    // Calculate slider position from a value
    position: function(value) {
        return this.minpos + (Math.log(value) - this.minlval) / this.scale;
    }
};
