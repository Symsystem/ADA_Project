/**
 * @Author Symeon del Marmol
 */

var SwissMap = function(data) {

    var leafMap = L.map('map').setView([46.79, 8.38], 8);
    var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var osm = new L.TileLayer(osmUrl, {});
    leafMap.addLayer(osm);
    // Size of the map in pixels
    var width = 960, height = 580;
    // Adds the map on the DOM of the html page
    var svg = d3.select(leafMap.getPanes().overlayPane).append("svg");
    //.attr("width", width/2)
    //.attr("height", height/2);
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    // MEMBER VARIABLES :

    var dates = data.dates;
    var country = data.country;
    var cantons = data.cantons;
    var municipalities = data.municipalities;

    var currentRange = [dates[0], dates[dates.length-1]];
    var zoomLevel = "canton";

    // Try with no projection for now
    var transform = d3.geo.transform({point: projectPoint}),
        path = d3.geo.path().projection(transform);
    leafMap.on("zoom", resetSVG);
    resetSVG();

    this.init = function() {
        this.draw(currentRange[0], currentRange[1]);
    };

    this.draw = function(range) {
        currentRange = [range[0], range[1]];
        drawCountry(country);
        if (zoomLevel == "canton") {
            drawCantons()
        } else {
            drawMunicipalities()
        }
    };

    function projectPoint(x, y) {
        var point = leafMap.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    function resetSVG() {
        console.log("test");
        var bounds = path.bounds(topojson.feature(cantons, cantons.objects.cantons)),
            topLeft = bounds[0],
            bottomRight = bounds[1];
        svg.attr("width", bottomRight[0] - topLeft[0])
           .attr("height", bottomRight[1] - topLeft[1])
           .style("left", topLeft[0] + "px")
           .style("top", topLeft[1] + "px");
        g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        g.selectAll(".country").attr("d", path);
        g.selectAll(".cantons").attr("d", path);
        g.selectAll(".municipalities").attr("d", path);
    }

    function getColor(data) {
        // Bounds for the color domain
        var minimum = 10, maximum = 500;

        // Create the linear color list
        var minimumColor = "#fee8c8", maximumColor = "#e34a33";
        var linearColor = d3.scale.linear().domain([minimum, maximum]).range([minimumColor, maximumColor]);
        //var logColor = d3.scale.log().domain([minimum, maximum]).range([minimumColor, maximumColor]);

        return linearColor(data);
    }

    function computeData(data) {
        var sum = 0;

        Object.keys(data).map(function(objKey, index) {
           if (currentRange[0] <= objKey && objKey <= currentRange[1]) {
               sum += data[objKey];
           }
        });

        return sum;
    }

    function setZoom(more) {
        if (more) {
            this.zoomLevel = "municipality";
        } else {
            this.zoomLevel = "canton";
        }
    }

    function drawCountry() {
        g.selectAll(".country")
            .data(topojson.feature(country, country.objects.country).features)
            .enter().append("path")
            .attr("class", "country") // Give a class for styling later
            .attr("d", path);
    }

    function drawCantons() {
        g.selectAll(".cantons")
            .data(topojson.feature(cantons, cantons.objects.cantons).features)
            .enter().append("path")
            .attr("class", "cantons") // Give a class for styling later
            .attr("id", function (d) {
                return "id_" + d.properties.id;
            }, true)
            .attr("d", path);

        g.selectAll(".cantons")
            .style("fill", function (d) {
                return getColor(computeData(d.properties.data));
            });
    }

    function drawMunicipalities() {

    }
};
