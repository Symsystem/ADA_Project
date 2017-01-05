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
