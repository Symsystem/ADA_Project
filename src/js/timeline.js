
function TimeLine(date) {

    var begin = date[0], end = date[date.length - 1];
    var width = 960, height = 25;

    var scale = d3.scaleLinear()
        .domain([begin, end])
        .range([0, width - 40]);

    var svg = d3.select("#timeline").append("svg")
        .attr("width", width + 50)
        .attr("height", height + 20);

    //brush
    var brush = d3.brushX()
        .extent([[0, 0], [width - 40, height]])
        .on("end", update);

    var mainLine = svg.append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "mainline")
        .attr("transform", "translate(20, 0)")
        .call(brush);

    var axis = d3.axisBottom()
        .scale(scale)
        .tickValues(date.map(function(current){return new Date(current);}))
        .tickFormat(d3.timeFormat("%m/%Y"));

    svg.append('g')
        .attr("class", "axis")
        .attr("transform", "translate(20, " + height + ")")
        .call(axis);

    mainLine.selectAll(".handle")
        .attr("transform", "translate(3, 3)");

    var updateListeners = [];

    this.addUpdateListener = function(listener) {
        updateListeners.push(listener);
    };

    function update() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.
        var d0 = d3.event.selection.map(scale.invert),
            d1 = d0.map(closestDate);

        if (d1[0] >= d1[1]) {
            var oneDay = 86400000; // nb ms in a single day
            d1[0] = closestDate(d1[0]) - oneDay * 3;
            d1[1] = closestDate(d1[0]) + oneDay * 3;
        }

        d3.select(this).transition().call(d3.event.target.move, d1.map(scale));

        updateListeners.forEach(function(listener) {
            listener(d1);
        });
    }

    function closestDate(element) {
        for (var i = 0; i < date.length - 1; i++) {
            if (date[i] <= element && element <= date[i+1]) {
                if ((element - date[i]) < (date[i+1] - element)) {
                    return date[i];
                } else {
                    return date[i + 1];
                }
            }
        }
        return date[date.length - 1];
    }
}