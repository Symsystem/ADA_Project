var width = 900, height = 500;

var minimum = 5, maximum = 24;

// Create the linear color list
var minimumColor = "#fee8c8", maximumColor = "#e34a33";
var linearColor = d3.scale.linear().domain([minimum, maximum]).range([minimumColor, maximumColor]);

var logColor = d3.scale.log()
    .domain([10, 1000])
    .range(["brown", "steelblue"]);

// Disable the projection to keep performance
var path = d3.geo.path().projection(null);

var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

d3.json("topo/ch.json", function(error, topology) {
    if (error) throw error;

    var ch = topojson.feature(topology, topology.objects.municipalities);
    //municipalities
    svg.append("g")
        .attr("class", "municipality-border")
        .selectAll("path")
        .data(ch.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) { return logColor(path.area(d)); });

    //country
    svg.append("path")
        .datum(topojson.mesh(topology, topology.objects.country, function(a, b) { return a.id !== b.id; }))
        .attr("class", "country-border")
        .attr("d", path);

    //cantons
    svg.append("path")
        .datum(topojson.mesh(topology, topology.objects.cantons, function(a, b) { return a.id !== b.id; }))
        .attr("class", "cantons-border")
        .attr("d", path);

});

//d3.select(self.frameElement).style("height", height + "px");
