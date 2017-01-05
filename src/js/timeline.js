
function TimeLine(date) {

    var datePad = 1206000000;
    var begin = date[0] - datePad,
        end = date[date.length - 1] + datePad;

    var margin = {top: 0, right: 20, bottom: 20, left: 20},
        width = 870 - margin.left - margin.right,
        height = 45 - margin.top - margin.bottom;

    var scale = d3.scaleTime()
        .domain([begin, end])
        .range([0, width]);

    var svg = d3.select("#timeline").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append('g')
        .attr("class", "timeline-axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom()
            .scale(scale)
            .ticks(6)
            .tickFormat(d3.timeFormat("%m/%Y"))
        );

    svg.append('g')
        .attr("class", "timeline-axis axis--grid")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom()
                .scale(scale)
                .tickSize(-height)
                .tickValues(date.map(function(current){return new Date(current);}))
                .tickFormat(function() {return null; })
        );

    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("end", update);

    var brushSel = svg.append("g")
        .attr("class", "mainline")
        .call(brush);
    brush.move(brushSel, [scale(date[0]), scale(date[date.length - 1])]);

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
            d1[0] = closestDate(d1[0]) - oneDay * 2;
            d1[1] = closestDate(d1[0]) + oneDay * 2;
        }

        d3.select(this).transition().call(d3.event.target.move, d1.map(scale));

        updateListeners.forEach(function(listener) {
            listener(d1);
        });
    }

    function closestDate(element) {
        var distance = Math.abs(date[0] - element);
        var index = 0;
        for(var c = 1; c < date.length; c++){
            var cdistance = Math.abs(date[c] - element);
            if (cdistance < distance) {
                index = c;
                distance = cdistance;
            }
        }
        return date[index];
    }
}