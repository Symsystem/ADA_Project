
function TimeLine(date) {

    var begin = date[0], end = date[date.length - 1];
    var width = 960, height = 25;

    var scale = d3.scale.linear()
        .domain([begin, end])
        .range([0, 960]);

    var chart = d3.select("#timeline")
        .append("svg")
        .attr("width", width + 50)
        .attr("height", height)
        .attr("class", "chart");

    var mainLine = chart.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "mainLine");

    //brush
    var brush = d3.svg.brush()
        .x(scale)
        .on("brush", update);

    mainLine.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", 1)
        .attr("height", height - 1);

    var axis = d3.svg.axis()
        .scale(scale)
        .orient('bottom')
        .tickValues(date.map(function(current){return new Date(current);}))
        .tickFormat(d3.time.format("%m/%Y"));

    mainLine.append('g')
        .attr("class", "axis")
        .call(axis);

    mainLine.selectAll(".background")
        .style({fill: "#4B9E9E", visibility: "visible"});
    mainLine.selectAll(".extent")
        .style({fill: "#78C5C5", visibility: "visible"});
    mainLine.selectAll(".resize rect")
        .style({fill: "#276C86", visibility: "visible"});

    var updateListeners = [];

    this.addUpdateListener = function(listener) {
        updateListeners.push(listener);
    };

    function update() {

        var s = d3.event.target.extent();
        d3.event.target.extent([closestDate(s[0], date),
            closestDate(s[1], date)]);
        d3.event.target(d3.select(this));

        updateListeners.forEach(function(listener) {
            listener(brush.extent());
        });
    }

    function closestDate(current, listDate) {
        for (var i = 0; i < listDate.length - 1; i++) {
            if (listDate[i] <= current && current <= listDate[i+1]) {
                if ((current - listDate[i]) < (listDate[i+1] - current)) {
                    return listDate[i];
                } else {
                    return listDate[i + 1];
                }
            }
        }
        return listDate[listDate.length - 1];
    }
}