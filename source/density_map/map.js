/**
 * @Author Symeon del Marmol
 */

var swissMap = function() {

    // MEMBER VARIABLES :

    // Size of the map in pixels
    var width = 960, height = 580;
    // Adds the map on the DOM of the html page
    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);
    var years = [];

    // Try with no projection for now
    this.path = d3.geo.path().projection(null);
    this.currentYear = 0;
    this.zoomLevel = "canton";

    this.country = null;
    this.cantons = null;
    this.municipalities = null;

    this.init = function(country, cantons, municipalities, currentYear) {
        this.currentYear = currentYear;
        this.country = country;
        this.cantons = cantons;
        this.municipalities = municipalities;
    };

    function getColor(data) {
        // Bounds for the color domain
        var minimum = 10, maximum = 500;

        // Create the linear color list
        var minimumColor = "#fee8c8", maximumColor = "#e34a33";
        var linearColor = d3.scale.linear().domain([minimum, maximum]).range([minimumColor, maximumColor]);
        //var logColor = d3.scale.log().domain([minimum, maximum]).range([minimumColor, maximumColor]);

        return linearColor(data);
    }



        drawCountry(country);
        drawCantons(cantons, this.currentYear);
        //drawMunicipalities(municipalities);
    }

    var drawCountry = function(country) {
        svg.selectAll(".country")
            .data(topojson.feature(country, country.objects.country).features)
            .enter().append("path")
            .attr("class", "country") // Give a class for styling later
            .attr("d", path);
    };

    var drawCantons = function (cantons, year) {
        svg.selectAll(".cantons")
            .data(topojson.feature(cantons, cantons.objects.cantons).features)
            .enter().append("path")
            .attr("class", "cantons") // Give a class for styling later
            .attr("id", function (d) {
                return "id_" + d.properties.id;
            }, true)
            .attr("d", path);

        d3.selectAll(".cantons")
            .style("fill", function (d) {
                if (d.properties[years[currentYear]]) {
                    return getColor(d.properties[years[year]]);
                }
                return getColor(0);
            });
    };

    var drawMunicipalities = function(muni, year) {

    }

    var draw = function(year) {
        if (this.zoomLevel == "canton") {
            drawCantons(year)
        } else {
            drawMunicipalities(year)
        }
    }
};
