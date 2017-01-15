/**
 * Main program
 *
 * @Author Symeon del Marmol
 *
 */

var SwissTweets = SwissTweets || {};

SwissTweets.main = {
    init: function() {
        SwissTweets.data.loadData();
        document.getElementsByClassName("zoom-level-btn")[0].onclick =
            SwissTweets.graphic.changeDensityLayer;
    }
};

SwissTweets.data = {
    topo: "res/topo/",
    density: "res/density/",
    events: "res/events/",
    densityLayer: "cantons",

    loadData: function() {
        queue().defer(d3.json, this.topo + "ch-country.json")
            .defer(d3.json, this.topo + "ch-cantons.json")
            .defer(d3.json, this.topo + "ch-municipalities.json")
            .await(SwissTweets.graphic.initMap);
    },
    /**
     * ************ DENSITY MAP FUNCTIONS ************
     */
    loadDensityData: function() {
        queue()
            .defer(d3.json, this.density + "canton_density.json")
            .defer(d3.json, this.density + "municipality_density.json")
            .await(this.processDensityData);
    },
    processDensityData: function(error, cantonsData, muniData) {
        if (error) { throw error; }

        SwissTweets.densityCanton = cantonsData;
        SwissTweets.densityMuni = muniData;
        SwissTweets.densityDates =
            cantonsData.cantons.map(function(e) { return e.date; });

        var initRange = [cantonsData.cantons[0].date,
            cantonsData.cantons[cantonsData.cantons.length-1].date];
        SwissTweets.data.updateDensityDates(initRange[0], initRange[1]);

        var timeLine =
            new TimeLine("densityTimeline", SwissTweets.densityDates);
        timeLine.addUpdateListener(function(range) {
            SwissTweets.data.updateDensityDates(range[0], range[1]);
        });
    },
    updateDensityDates: function(start, end) {
        SwissTweets.densityStart = start;
        SwissTweets.densityEnd = end;

        var t = (SwissTweets.data.densityLayer === "cantons") ?
                SwissTweets.densityCanton.cantons :
                SwissTweets.densityMuni.municipalities;
        var res = {};
        for (var i = 0; i < t.length; i++) {
            if (start <= t[i].date && t[i].date <= end) {
                for (var j = 0; j < t[i].data.length; j++) {
                    var data = t[i].data[j];
                    if (!res[data.id]) {
                        res[data.id] = 0;
                    }
                    res[data.id] += data.nbr;
                }
            }
        }
        SwissTweets.graphic.obj["densityMap"]
            .updateData(SwissTweets.data.densityLayer, res);
    },
    clickDensityInfo: function(e) {
        var layer = e.target.options.parent;
        document.getElementById("densityInfos").innerHTML =
            "<span class='name'>Name : "
            + e.target.feature.properties.name + "</span><br/>"
            + "<span class='number'>Number : "
            + layer.data[e.target.feature.id] + "</span>";
    },
    /**
     * ************ SENTIMENT MAP FUNCTIONS ************
     */

    /**
     * ************ EVENT MAP FUNCTIONS ************
     */
    loadEventData: function() {
        queue()
            .defer(d3.json, this.events + "events.json")
            .await(this.processEventData);
    },
    processEventData: function(error, eventData) {
        if (error) { throw error; }

        SwissTweets.events = eventData;
        SwissTweets.eventDates =
            eventData.events.map(function(e) { return e.date; });

        var initRange = [eventData.events[0].date,
            eventData.events[eventData.events.length-1].date];
        SwissTweets.data.updateEventDates(initRange[0], initRange[1]);

        var timeLine = new TimeLine("eventTimeline", SwissTweets.eventDates);
        timeLine.addUpdateListener(function(range) {
            SwissTweets.data.updateEventDates(range[0], range[1]);
        });
    },
    updateEventDates: function(start, end) {
        SwissTweets.eventStart = start;
        SwissTweets.eventEnd = end;

        var t = SwissTweets.events.events;
        var res = [];
        for (var i = 0; i < t.length; i++) {
            if (start <= t[i].date && t[i].date <= end) {
                for (var j = 0; j < t[i].data.length; j++) {
                    var data = t[i].data[j];
                    res.push(data);
                }
            }
        }
        SwissTweets.graphic.obj["eventMap"].updateData("events", res);
    },
    clickEventInfo: function(e) {
        var event = e.target.options.data;
        var start = new Date(event.start),
            end = new Date(event.end);
        document.getElementById("eventInfos").innerHTML =
            "<span class='date'>Starting date : "
            + start.getDate() + " - "
            + start.getMonth() + " - "
            + start.getFullYear() + "</span><br/>"
            + "<span class='date'>End : "
            + end.getDate() + " - "
            + end.getMonth() + " - "
            + end.getFullYear() + "</span><br/>"
            + "<span class='keywords'>Keywords : "
            + event.related_keywords + "</span>";
    }
};

SwissTweets.graphic = {
    obj: {},

    initMap: function(error, country, cantons, municipalities) {

        // ******** DENSITY INITIALISE **********
        var densityMap = new SwissMap("densityMap", country);
        var fitBoundsRegion = function(e) {
            densityMap.leafMap.fitBounds(e.target.getBounds());
        };

        var cantonLayer = new TopoLayer("cantons", cantons);
        cantonLayer.addClickListener(SwissTweets.data.clickDensityInfo);
        cantonLayer.addClickListener(fitBoundsRegion);

        var muniLayer = new TopoLayer("municipalities", municipalities);
        muniLayer.addClickListener(SwissTweets.data.clickDensityInfo);
        muniLayer.addClickListener(fitBoundsRegion);

        densityMap.addLayer(cantonLayer);
        densityMap.addLayer(muniLayer);
        densityMap.enableLayer("cantons");

        SwissTweets.graphic.obj["densityMap"] = densityMap;
        SwissTweets.data.loadDensityData();

        // ******** EVENT INITIALISE **********
        var eventMap = new SwissMap("eventMap", country);

        var eventLayer = new MarkerLayer("events");
        eventLayer.addClickListener(SwissTweets.data.clickEventInfo);

        eventMap.addLayer(eventLayer);
        eventMap.enableLayer("events");

        SwissTweets.graphic.obj["eventMap"] = eventMap;
        SwissTweets.data.loadEventData();
    },

    changeDensityLayer: function() {
        var map = SwissTweets.graphic.obj["densityMap"];
        if (SwissTweets.data.densityLayer === "cantons") {
            map.disableLayer("cantons");
            map.enableLayer("municipalities");
            SwissTweets.data.densityLayer = "municipalities"
        } else {
            map.disableLayer("municipalities");
            map.enableLayer("cantons");
            SwissTweets.data.densityLayer = "cantons"
        }
        SwissTweets.data.updateDensityDates(
            SwissTweets.densityStart, SwissTweets.densityEnd);
    }
};