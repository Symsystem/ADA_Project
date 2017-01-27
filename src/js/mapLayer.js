/**
 * @author Symeon del Marmol
 *
 * @overview A LayerMap represents an interactive, multiple layer for a leaflet
 * map. Its purpose is to be added on a SwissMap.
 * It is identified by a unique name. It contains at least one layer called
 * the main layer that is meant to represents the data and on which the external
 * events can occur.
 * A specific behavior can be set for the different elements of the main layer
 * that it represents (e.g. onMouseOver, onMouseOut, click).
 *
 * A LayerMap is meant to be an abstract class and never instantiate by itself.
 */

/**
 * @param {String} name : This is the unique name that identified the layer.
 * @constructor Creates a MapLayer with the id 'name'.
 *              This class is meant to be an abstract class so do not call this
 *              constructor alone.
 */
function MapLayer (name) {
    this.name = name;
    this.mainLayer = null;
    this.leafLayers = [];
}

/**
 * @param {topoElement} element : The element on which the event is happening.
 * @param {leafletLayer} layer : The leaflet layer 'element' is part of.
 * @effects Defines what to do each time an event occurs on an element
 *          of the main layer of the MapLayer.
 */
MapLayer.prototype.onEachElement = function(element, layer) {
    throw "Abstract method onEachElement not implemented";
};

/**
 * @param {leafletMap} map : The leafleat map on which the layers are added.
 * @effects Add all the layers that composed the MapLayer to map.
 */
MapLayer.prototype.addToLeafMap = function(map) {
    for (var i = 0; i < this.leafLayers.length; i++) {
        this.leafLayers[i].addTo(map);
    }
};

/**
 * @param {leafletMap} map : The leafleat map on which the layers are removed.
 * @effects Removes all the layers that composed the MapLayer from map.
 */
MapLayer.prototype.removeFromLeafMap = function() {
    for (var i = 0; i < this.leafLayers.length; i++) {
        this.leafLayers[i].remove();
    }
};


/**
 * @overview A TopoLayer is a MapLayer that contains different leaflet layers:
 * - a topographic layer that is the main one on which the events will be call
 *   this layer is the visualisation of the data set.
 * - an infoBox that display the name of the region over which the cursor hovers
 * - a legend that values the colors of the regions.
 */

/**
 *
 * @param {string} name : This is the unique name that identified the layer.
 * @param {topoJSON} topology : The topology used to generate the main layer.
 * @param {boolean} legend : if false, disable the legend
 * @constructor Creates a TopoLayer that has the id 'name' and display the
 *              topology passed in parameter.
 */
function TopoLayer(name, topology, legend) {
    // Super
    MapLayer.call(this, name);

    this.mainLayer = new L.TopoJSON(topology, {
        parent: this,
        style: this.getStyle,
        onEachFeature: this.onEachElement
    });
    this.leafLayers.push(this.mainLayer);

    this.minColor = "#fee8c8";
    this.maxColor = "#e34a33";
    this.data = null;
    this.clickListeners = new EventListener();


    legend = typeof legend !== 'undefined' ? legend : true;
    if (legend) {
        initLegend.call(this);
    }
    initInfoBox.call(this);

    function initLegend() {
        this.legend = L.control({position: 'bottomright'});
        var parent = this;
        this.legend.onAdd = function() {
            var div = L.DomUtil.create('div', parent.name + '-legend');
            return div;
        };
        this.leafLayers.push(this.legend);
    }

    function initInfoBox() {
        this.infoBox = L.control();
        this.infoBox.onAdd = function() {
            this._div = L.DomUtil.create('div', 'infoBox');
            this.update();
            return this._div;
        };
        this.infoBox.update = function (props) {
            this._div.innerHTML =
                (props ? '<b>' + props.name + '</b>' : 'Hover over an area');
        };
        this.leafLayers.push(this.infoBox);
    }
}


/** *****************************************
 *   TopoLayer is a subclass of MapLayer
 * ******************************************/
TopoLayer.prototype = Object.create(MapLayer.prototype);
TopoLayer.prototype.constructor = TopoLayer;


/**
 * @override
 * @param element
 * @param layer
 */
TopoLayer.prototype.onEachElement = function(element, layer) {
    layer.on({
        mouseover: onMouseOver,
        mouseout: onMouseOut,
        click: onClick
    });

    function onMouseOver(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 2,
            color: '#ff8f09'
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        layer.options.parent.infoBox.update(layer.feature.properties);
    }

    function onMouseOut(e) {
        var _this = e.target.options.parent;

        _this.mainLayer.eachLayer(function(layer) {
            layer.setStyle(_this.getStyle(layer.feature));
        });

        _this.infoBox.update();
    }

    function onClick(e) {
        e.target.options.parent.clickListeners.trigger(e);
    }
};

/**
 * @override
 * @effects Same behavior than for the MapLayer
 *          + adds the html components to build the legend on the map
 */
TopoLayer.prototype.addToLeafMap = function(map) {
    MapLayer.prototype.addToLeafMap.call(this, map);
    if (this.legend) {
        this.buildLegend();
    }
};

/**
 * @param {topoElement} element : The region on which the style will be applied.
 * @returns The style that takes the region 'element' depending on the
 *          current data.
 */
TopoLayer.prototype.getStyle = function(element) {
    var linearColor = d3.scaleLinear()
        .domain([this.minData, this.maxData])
        .range([this.minColor, this.maxColor]);
    var color = linearColor(
        (this.data != null && this.data[element.properties.id]) ?
            this.data[element.properties.id] :
            0);

    return {
        fillColor: color,
        fillOpacity: 0.7,
        opacity: 1,
        color: "#151515",
        weight: 1
    };
};

/**
 * @param {List} data : The data that the main layer represents graphically.
 *               The accepted format is a list of objects composed by :
 *               { id : Int, nbr : Int }
 *               such that : - the value of id is the id of a region
 *                           - the value of nbr is the value associated
 *                             to this region.
 *
 * @effects Sets the data that the main layer represents and updates the layers.
 */
TopoLayer.prototype.setData = function(data) {
    this.data = data;
    this.maxData = data["max"];
    this.minData = data["min"];
    if (this.legend) {
        updateLegend(this.name, this.minData, this.maxData);
    }
    var parent = this;
    this.mainLayer.eachLayer(function(layer) {
        layer.setStyle(parent.getStyle(layer.feature));
    });

    function updateLegend(name, min, max) {
        var y = d3.scaleLinear().range([150, 0]).domain([min, max]);
        var yAxis = d3.axisRight().scale(y);
        d3.selectAll("." + name + "-axis")
            .call(yAxis).append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 30).attr("dy", ".71em")
            .style("text-anchor", "end")
    }
};

/**
 * @param {String} min : The RGB color that represents the lowest value.
 * @param {String} max : The RGB color that represents the highest value.
 * @effects Sets the colors for the min and max value of the data.
 */
MapLayer.prototype.setColors = function(min, max) {
    this.minColor = min;
    this.maxColor = max;

    var parent = this;
    this.mainLayer.eachLayer(function(layer) {
        layer.setStyle(parent.getStyle(layer.feature));
    });
};

/**
 * @param {function} listener : The function to execute when a click occurs
 *                              on a region of the main layer.
 * @effects Adds the listener to the functions that are executed on each click
 *          on a component (e.g. region) of the main layer.
 */
TopoLayer.prototype.addClickListener = function(listener) {
    this.clickListeners.addListener(listener);
};

/**
 * @effects Draws the legend in the html component that is created by
 *          the leaflet layer control created for this purpose.
 */
TopoLayer.prototype.buildLegend = function() {
    var w = 60, h = 170;
    var gWidth = w - 50, gHeight = h - 20;
    var key = d3.select("." + this.name + "-legend").append("svg")
        .attr("width", w)
        .attr("height", h);

    var legend = key.append("defs").append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop").attr("offset", "0%")
        .attr("stop-color", this.maxColor).attr("stop-opacity", 1);
    legend.append("stop").attr("offset", "100%")
        .attr("stop-color", this.minColor).attr("stop-opacity", 1);
    key.append("rect").attr("width", gWidth).attr("height", gHeight)
        .style("fill", "url(#gradient)").attr("transform", "translate(0,10)");

    var y = d3.scaleLinear().range([gHeight, 0])
        .domain([this.minData, this.maxData]);
    var yAxis = d3.axisRight().scale(y);
    key.append("g").attr("class", "y axis " + this.name + "-axis")
        .attr("transform", "translate("+ (gWidth) +", 10)")
        .call(yAxis).append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30).attr("dy", ".71em")
        .style("text-anchor", "end")
};


/**
 * @overview A MarkerLayer is a MapLayer that contains different leaflet layers:
 * - a marker layer that is the main one on which the events will be call
 *   this layer is the visualisation of the data set. This layer contains
 *   markers that represent a single located element.
 * - an infoBox that display the name of the marker over which the cursor hovers
 */

/**
 * @param {String} name : This is the unique name that identified the layer.
 * @constructor Creates a MarkerLayer that has the id 'name' with an empty
 *              set of markers.
 */
function MarkerLayer(name) {
    MapLayer.call(this, name);

    this.markers = L.markerClusterGroup();
    this.leafLayers = [this.markers];
    this.clickListeners = new EventListener();
}

/** *****************************************
 *   MarkerLayer is a subclass of MapLayer
 * ******************************************/
MarkerLayer.prototype = Object.create(MapLayer.prototype);
MarkerLayer.prototype.constructor = MarkerLayer;

/**
 * @override
 * @param {Marker} element : the marker on which the event happened
 * @param {leafletLayer} layer : The leaflet layer 'element' is part of.
 */
MarkerLayer.prototype.onEachElement = function(element, layer) {
    layer.on({
       click: onClick
    });

    function onClick(e) {
        e.clickListeners.trigger(e);
    }
};

/**
 * @param {List} data : The markers that the layer represents graphically.
 *               The expected format is a list of objects composed by :
 *               {latitude : float, longitude : float}
 * @effects Sets the data that the layer represents and updates the layers.
 */
MarkerLayer.prototype.setData = function(data) {
    this.markers.clearLayers();
    var _this = this;
    data.forEach(function(element) {
        var marker = L.marker([element.latitude, element.longitude],
            {
                data: element
            }).on('click', _this.clickListeners.trigger);
        _this.markers.addLayer(marker);
    });
};

/**
 * @param {function} listener : The function to execute when a click occurs
 *                              on a marker of the layer.
 * @effects Adds the listener to the functions that are executed on each click
 *          on a marker of the layer.
 */
MarkerLayer.prototype.addClickListener = function(listener) {
    this.clickListeners.addListener(listener);
};