/**
 * @author Symeon del Marmol
 *
 * @overview A Timeline is a graphic object that represents a timeline with
 * graduations on the bottom side.
 * A timeline contains specific dates that are represented inside the line.
 * The purpose of the object is to select graphically a part of the timeline
 * that includes some of the specific dates.
 *
 *
 * @param {String} htmlId : the id of the html component that will contain
 *                          the timeline.
 * @param {List} date : the list of the particular dates (in unix_time format)
 *                      that will be represented in the timeline
 * @param {Array} selectedPeriod : An array that contains the beginning and
 *                                 ending initial dates selected on the timeline
 * @constructor Creates a Timeline.
 *
 */
function TimeLine(htmlId, date, selectedPeriod) {

    var datePad = 1206000000;
    var begin = date[0] - datePad,
        end = date[date.length - 1] + datePad;

    var margin = {top: 0, right: 20, bottom: 20, left: 20},
        width = 870 - margin.left - margin.right,
        height = 45 - margin.top - margin.bottom;

    var scale = d3.scaleTime()
        .domain([begin, end])
        .range([0, width]);

    var svg = d3.select("#" + htmlId).append("svg")
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
    brush.move(brushSel, [scale(selectedPeriod[0]), scale(selectedPeriod[1])]);

    var updateListeners = [];

    /**
     * @param {function} listener : function that will be executed when the
     *                              selected period of the timeline will change.
     * @effects Adds the function 'listener' to the list of the functions
     *          executed each time the selected period is updated.
     */
    this.addUpdateListener = function(listener) {
        updateListeners.push(listener);
    };

    /**
     * Called when the brush is moved by the user.
     * @effects updates the selected period in function of the position of the
     *          brush (the area selected by the user on the timeline).
     */
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

    /**
     * @param {date} element : the date from which we want to find the closest
     *                         date.
     * @returns the particular date that is the nearest from 'element'.
     */
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