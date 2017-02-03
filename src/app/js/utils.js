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
 * @param {int} min : the minimum value of the log scale
 * @param {int} max : the maximum value of the log scale
 * @constructor Creates a slider that returns the value of the logarithmic scale
 *              whose bounds are min and max corresponding to the position
 *              (between 0 and 50).
 */
function LogSlider(min, max) {
    this.minpos = 0;
    this.maxpos = 50;
    this.minlval = Math.log(min);
    this.maxlval = Math.log(max);

    this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}
LogSlider.prototype = {
    /**
     * @param {int} min : the minimum value of the log scale
     * @param {int} max : the maximum value of the log scale
     * @effects Updates the bounds of the log scale to min and max.
     */
    setBounds: function(min, max) {
        this.minlval = Math.log(min);
        this.maxlval =  Math.log(max);
        this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
    },
    /**
     * @param {int} position : the position of the cursor on the slider
     * @returns the corresponding value of the log scale depending on the
     *         position of the cursor.
     */
    value: function(position) {
        return Math.exp((position - this.minpos) * this.scale + this.minlval);
    },
    /**
     * @param {int} value : the value in the log scale
     * @returns the corresponding position of the slider depending on the value
     *          in the log scale
     */
    position: function(value) {
        return this.minpos + (Math.log(value) - this.minlval) / this.scale;
    }
};


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
