/**
 *
 * The application represented by the object SwissTweets.
 *
 * The main program is divided in 4 parts :
 * -> MAIN : contains the data and the general functions of the program.
 * -> DENSITY, SENTIMENT and EVENT each contains the data and functions related
 *    and specific to the map, timeline, and information to display
 *    in the appropriate tab.
 *
 * The initializing process follow this workflow :
 *
 * main.loading -> main.init -> main.loadData -> density.loadData
 * then it follows the same workflow as for the tab changing.
 *
 * When we click on a new tab, the process is the same for each of the 3 maps :
 *
 * main.changeTab -> main.cleanData
 *                -> main.loadData
 *                   -> tab.loadData
 *                      -> tab.processData
 *                         -> tab.updateDates
 *                            -> loadMap
 *
 * @Author Symeon del Marmol
 */

var SwissTweets = SwissTweets || {};

/**
 *
 * ******* MAIN *********
 *
 */
SwissTweets.main = {
    map : null,
    timeline : null,
    data : {},
    topo: {country: null, cantons: null, municipalities: null},
    htmlMapIds: {
        "density": "densityMap",
        "sentiment": "sentimentMap",
        "event": "eventMap"},
    htmlTimelineIds: {
        "density": "densityTimeline",
        "sentiment": "sentimentTimeline",
        "event": "eventTimeline"},
    loading: function() {
        queue().defer(d3.json, "res/topo/ch-country.json")
            .defer(d3.json, "res/topo/ch-cantons.json")
            .defer(d3.json, "res/topo/ch-municipalities.json")
            .await(this.init);
    },
    init: function(error, country, cantons, muni) {
        if (error) { alert(error); }

        SwissTweets.main.topo.country = country;
        SwissTweets.main.topo.cantons = cantons;
        SwissTweets.main.topo.municipalities = muni;
        SwissTweets.main.loadData("density")
    },
    cleanData: function(tab) {
        if (SwissTweets.main.map != null) {
            SwissTweets.main.map.destroy();
        }
        SwissTweets.main.map = null;
        SwissTweets.main.timeline = null;
        SwissTweets.main.data = {};
        document.getElementById(
            SwissTweets.main.htmlMapIds[tab]).innerHTML = "";
        document.getElementById
        (SwissTweets.main.htmlTimelineIds[tab]).innerHTML = "";
    },
    loadData: function(tab) {
        var tabDiv = document.getElementById(tab);
        tabDiv.getElementsByClassName("loader")[0].style.display = "block";
        tabDiv.getElementsByClassName("loaded")[0].style.display = "none";
        if (tab == "density") {
            SwissTweets.density.loadData();
        } else if (tab == "sentiment") {
            SwissTweets.sentiment.loadData();
        } else if (tab == "event") {
            SwissTweets.event.loadData();
        }
    },
    changeTab: function(tab) {
        SwissTweets.main.cleanData(tab);
        SwissTweets.main.loadData(tab);
    },
    endLoading: function(tab) {
        var tabDiv = document.getElementById(tab);
        tabDiv.getElementsByClassName("loader")[0].style.display = "none";
        tabDiv.getElementsByClassName("loaded")[0].style.display = "block";
        SwissTweets.main.map.refreshSize();
    }
};

/**
 *
 * ******* DENSITY *********
 *
 */
SwissTweets.density = {
    layer: "cantons",
    loadData: function() {
        queue()
            .defer(d3.json, "res/density/canton_density.json")
            .defer(d3.json, "res/density/municipality_density.json")
            .await(SwissTweets.density.processData);

        document.getElementById("density")
            .getElementsByClassName("zoom-level-btn")[0].onclick =
            SwissTweets.density.changeLayer;
    },
    processData: function(error, cantonsData, muniData) {
        if (error) { throw error; }

        SwissTweets.main.data["cantons"] = cantonsData;
        SwissTweets.main.data["municipalities"] = muniData;
        SwissTweets.main.data["dates"] =
            cantonsData.cantons.map(function(e) { return e.date; });

        var initRange = [cantonsData.cantons[0].date,
            cantonsData.cantons[cantonsData.cantons.length-1].date];
        SwissTweets.density.updateDates(initRange[0], initRange[1]);

        var timeLine =
            new TimeLine("densityTimeline", SwissTweets.main.data["dates"]);
        timeLine.addUpdateListener(function(range) {
            SwissTweets.density.updateDates(range[0], range[1]);
        });
        SwissTweets.main.timeline = timeLine;

        SwissTweets.main.endLoading("density");
    },
    updateDates: function(start, end) {
        SwissTweets.density.start = start;
        SwissTweets.density.end = end;

        var t = (SwissTweets.density.layer === "cantons") ?
            SwissTweets.main.data["cantons"].cantons :
            SwissTweets.main.data["municipalities"].municipalities;
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
        if (SwissTweets.main.map == null) {
            SwissTweets.density.loadMap();
        }
        SwissTweets.main.map.updateData(SwissTweets.density.layer, res);
    },
    loadMap: function() {
        var densityMap =
            new SwissMap("densityMap", SwissTweets.main.topo.country);
        var fitBoundsRegion = function(e) {
            densityMap.leafMap.fitBounds(e.target.getBounds());
        };

        var cantonLayer =
            new TopoLayer("cantons", SwissTweets.main.topo.cantons);
        cantonLayer.addClickListener(SwissTweets.density.clickInfo);
        cantonLayer.addClickListener(fitBoundsRegion);

        var muniLayer =
            new TopoLayer("municipalities", SwissTweets.main.topo.municipalities);
        muniLayer.addClickListener(SwissTweets.density.clickInfo);
        muniLayer.addClickListener(fitBoundsRegion);

        densityMap.addLayer(cantonLayer);
        densityMap.addLayer(muniLayer);
        densityMap.enableLayer("cantons");

        SwissTweets.main.map = densityMap;
    },
    clickInfo: function(e) {
        var layer = e.target.options.parent;
        document.getElementById("densityInfos").innerHTML =
            "<span class='name'>Name : "
            + e.target.feature.properties.name + "</span><br/>"
            + "<span class='number'>Number : "
            + layer.data[e.target.feature.id] + "</span>";
    },
    changeLayer: function() {
        var map = SwissTweets.main.map;
        if (SwissTweets.density.layer === "cantons") {
            map.disableLayer("cantons");
            map.enableLayer("municipalities");
            SwissTweets.density.layer = "municipalities"
        } else {
            map.disableLayer("municipalities");
            map.enableLayer("cantons");
            SwissTweets.density.layer = "cantons"
        }
        SwissTweets.density.updateDates(
            SwissTweets.density.start, SwissTweets.density.end);
    }
};


/**
 *
 * ******* SENTIMENT *********
 *
 */
SwissTweets.sentiment = {

};


/**
 *
 * ******* EVENT *********
 *
 */
SwissTweets.event = {
    loadData: function() {
        queue()
            .defer(d3.json, "res/events/events.json")
            .await(SwissTweets.event.processData);
    },
    processData: function(error, eventData) {
        if (error) { throw error; }

        SwissTweets.main.data["events"] = eventData;
        SwissTweets.main.data["dates"] =
            eventData.events.map(function(e) { return e.date; });

        var initRange = [eventData.events[0].date,
            eventData.events[eventData.events.length-1].date];
        SwissTweets.event.updateDates(initRange[0], initRange[1]);

        var timeLine =
            new TimeLine("eventTimeline", SwissTweets.main.data["dates"]);
        timeLine.addUpdateListener(function(range) {
            SwissTweets.event.updateDates(range[0], range[1]);
        });
        SwissTweets.main.timeline = timeLine;

        SwissTweets.main.endLoading("event");
    },
    updateDates: function(start, end) {
        SwissTweets.event.start = start;
        SwissTweets.event.end = end;

        var t = SwissTweets.main.data["events"].events;
        var res = [];
        for (var i = 0; i < t.length; i++) {
            if (start <= t[i].date && t[i].date <= end) {
                for (var j = 0; j < t[i].data.length; j++) {
                    var data = t[i].data[j];
                    res.push(data);
                }
            }
        }

        if (SwissTweets.main.map == null) {
            SwissTweets.event.loadMap();
        }
        SwissTweets.main.map.updateData("events", res);
    },
    loadMap: function() {
        var eventMap = new SwissMap("eventMap", SwissTweets.main.topo.country);

        var eventLayer = new MarkerLayer("events");
        eventLayer.addClickListener(SwissTweets.event.clickInfo);

        eventMap.addLayer(eventLayer);
        eventMap.enableLayer("events");

        SwissTweets.main.map = eventMap;
    },
    clickInfo: function(e) {
        var event = e.target.options.data;
        var date = new Date(event.date);
        var tweets = "";
        for (var i = 0; i < event.tweets.length; i++) {
            tweets += event.tweets[i] + "<br/>";
        }
        document.getElementById("eventInfos").innerHTML =
            "<span class='name'>Name : " + event.name + "</span><br/>"
            + "<span class='date'>Date : "
            + date.getDate() + " - "
            + date.getMonth() + " - "
            + date.getFullYear() + "</span><br/>"
            + "<span class='keywords'>Tweets concerned :<br/>"
            + tweets + "</span>";
    }
};