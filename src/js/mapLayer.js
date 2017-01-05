function LayerMap (name) {
    this.name = name;
    this.minColor = "#fee8c8";
    this.maxColor = "#e34a33";

    this.leafLayers = [];
}

LayerMap.prototype.onEachElement = function(element, layer) {
    var _this = layer.options.parent;
    layer.on({
        mouseover: _this.onMouseOver,
        mouseout: _this.onMouseOut,
        click: _this.onClick
    });
};

LayerMap.prototype.removeFromLeafMap = function(map) {
    for (var i = 0; i < this.leafLayers.length; i++) {
        this.leafLayers[i].remove();
    }
};

LayerMap.prototype.setColors = function(min, max) {
    this.minColor = min;
    this.maxColor = max;
};



function TopoLayer(name, topology) {
    // Super
    LayerMap.call(this, name);

    this.leafLayer = new L.TopoJSON(topology, {
        parent: this,
        style: this.getStyle,
        onEachFeature: this.onEachElement
    });
    this.leafLayers.push(this.leafLayer);

    // ###### LEGEND #######
    this.legend = L.control({position: 'bottomright'});
    var parent = this;
    this.legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', parent.name + '-legend');
        return div;
    };
    this.leafLayers.push(this.legend);

    // ##### INFO NAME #####
    this.info = L.control();
    this.info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'nameInfo'); // create a div with a class "nameInfo"
        this.update();
        return this._div;
    };
    this.info.update = function (props) {
        this._div.innerHTML = (props ? '<b>' + props.name + '</b>' : 'Hover over an area');
    };

    this.leafLayers.push(this.info);

    this.data = null;
    this.clickListeners = new EventListener();
}

// Define the inheritance
TopoLayer.prototype = Object.create(LayerMap.prototype);
TopoLayer.prototype.constructor = TopoLayer;

TopoLayer.prototype.addToLeafMap = function(map) {
    for (var i = 0; i < this.leafLayers.length; i++) {
        this.leafLayers[i].addTo(map);
    }
    this.buildLegend(this);
    this.clickListeners.addListener(function(e) {
        map.fitBounds(e.target.getBounds());
    });
};

TopoLayer.prototype.getStyle = function(element) {
    var linearColor = d3.scaleLinear()
        .domain([0, this.maxData])
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

TopoLayer.prototype.setData = function(data) {
    this.data = data;
    var arr = Object.keys(data).map(function(key){return data[key];});
    this.maxData = Math.max.apply(null, arr);
    var parent = this;
    this.leafLayer.eachLayer(function(layer) {
        layer.setStyle(parent.getStyle(layer.feature));
    });
};

TopoLayer.prototype.onMouseOver = function(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 2,
        color: '#ff8f09'
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    layer.options.parent.info.update(layer.feature.properties);
};

TopoLayer.prototype.onMouseOut = function(e) {
    var _this = e.target.options.parent;

    _this.leafLayer.eachLayer(function(layer) {
        layer.setStyle(_this.getStyle(layer.feature));
    });

    _this.info.update();
};

TopoLayer.prototype.addClickListener = function(listener) {
    this.clickListeners.addListener(listener);
};

TopoLayer.prototype.onClick = function(e) {
    e.target.options.parent.clickListeners.trigger(e);
};

TopoLayer.prototype.buildLegend = function(_this) {
    var w = 50, h = 170;
    var gWidth = w - 40, gHeight = h - 20;
    var key = d3.select("." + _this.name + "-legend").append("svg")
        .attr("width", w)
        .attr("height", h);

    var legend = key.append("defs").append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop").attr("offset", "0%").attr("stop-color", _this.maxColor).attr("stop-opacity", 1);
    legend.append("stop").attr("offset", "100%").attr("stop-color", _this.minColor).attr("stop-opacity", 1);
    key.append("rect").attr("width", gWidth).attr("height", gHeight).style("fill", "url(#gradient)").attr("transform", "translate(0,10)");

    var y = d3.scaleLinear().range([gHeight, 0]).domain([0, _this.maxData]);

    var yAxis = d3.axisRight().scale(y);

    key.append("g").attr("class", "y axis")
        .attr("transform", "translate("+ (gWidth) +", 10)")
        .call(yAxis).append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30).attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of tweets");
};
