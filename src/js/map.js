/**
 * @Author Symeon del Marmol
 */

var SwissMap = function(data) {

    // ######### PARAMETERS ###########
    // Size of the map in pixels
    var width = 960, height = 580;
    // Bounds of the domain
    var minimum = 0, maximum = 500;
    // Bounds of the colors
    var minimumColor = "#fee8c8", maximumColor = "#e34a33";

    // MEMBER VARIABLES :

    var dates = data.dates,
        country = data.country,
        cantons = data.cantons,
        municipalities = data.municipalities;

    var currentRange = [dates[0], dates[dates.length-1]];
    var zoomLevel;
    var clickTopoListener = new EventListener();


    var leafMap = L.map('map').setView([46.79, 8.38], 8);
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 8,
        maxZoom: 12
    });
    leafMap.addLayer(osm);

    var countryLayer = new L.TopoJSON(country, {
        style: {color: 'black', weight: 3}
    }).addTo(leafMap);
    var cantonLayer = new L.TopoJSON(cantons, {
        style: style,
        onEachFeature: onEachCanton
    });
    var municipalityLayer = new L.TopoJSON(municipalities, {
        style: style,
        onEachFeature: onEachMunicipality
    });

    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'nameInfo'); // create a div with a class "nameInfo"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = (props ? '<b>' + props.name + '</b>' : 'Hover over an area');
    };
    info.addTo(leafMap);


    this.addClickListener = function(listener) {
        clickTopoListener.addListener(listener);
    };

    this.zoomToFeature = function(e) {
        leafMap.fitBounds(e.target.getBounds());
    };

    this.init = function(zoom) {
        this.drawLegend();
        this.setZoomLevel(zoom);
        this.addClickListener(this.zoomToFeature);
    };

    this.updateRange = function(range) {
        currentRange = [range[0], range[1]];
        if (zoomLevel === "municipality") {
            municipalityLayer.eachLayer(function(layer) {
                layer.setStyle(style(layer.feature));
            });
        } else {
            cantonLayer.eachLayer(function(layer) {
                layer.setStyle(style(layer.feature));
            });
        }
    };

    this.setZoomLevel = function(zoom) {
        if (zoom === "municipality") {
            zoomLevel = "municipality";
            leafMap.removeLayer(cantonLayer);
            municipalityLayer.addTo(leafMap);
        } else {
            zoomLevel = "canton";
            leafMap.removeLayer(municipalityLayer);
            cantonLayer.addTo(leafMap);
        }
        this.updateRange(currentRange);
    };

    function style(feature) {
        return {
            fillColor: getColor(computeData(feature.properties.data)),
            fillOpacity: 0.7,
            opacity: 1,
            color: "#151515",
            weight: 1
        };
    }

    function getColor(data) {
        var linearColor = d3.scaleLinear()
            .domain([minimum, maximum])
            .range([minimumColor, maximumColor]);
        return linearColor(data);
    }

    function computeData(data) {
        var sum = 0;
        Object.keys(data).map(function (objKey, index) {
            if (currentRange[0] <= objKey && objKey <= currentRange[1]) {
                sum += data[objKey];
            }
        });
        data["nbr"] = sum;
        return sum;
    }

    function onEachCanton(canton, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlightCanton,
            click: clickTrigger
        });

        function resetHighlightCanton(e) {
            cantonLayer.resetStyle(e.target);
            info.update();
        }
    }

    function onEachMunicipality(muni, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlightMunicipality,
            click: clickTrigger
        });

        function resetHighlightMunicipality(e) {
            municipalityLayer.resetStyle(e.target);
            info.update();
        }
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#ff8f09'
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        info.update(layer.feature.properties);
    }

    function clickTrigger(e) {
        clickTopoListener.trigger(e);
    }

    this.drawLegend = function() {
        var w = 120, h = 350;
        var gWidth = w - 100, gHeight = h - 50;
        var key = d3.select("#legend").append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("transform", "translate(" + (width + 20) + ", " + (-height) +")");

        var legend = key.append("defs").append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop").attr("offset", "0%").attr("stop-color", maximumColor).attr("stop-opacity", 1);
        legend.append("stop").attr("offset", "100%").attr("stop-color", minimumColor).attr("stop-opacity", 1);
        key.append("rect").attr("width", gWidth).attr("height", gHeight).style("fill", "url(#gradient)").attr("transform", "translate(0,10)");

        var y = d3.scaleLinear().range([h - 50, 0]).domain([minimum, maximum]);

        var yAxis = d3.axisRight().scale(y);

        key.append("g").attr("class", "y axis")
            .attr("transform", "translate("+ (gWidth) +", 10)")
            .call(yAxis).append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 30).attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Number of tweets");
    };
};
