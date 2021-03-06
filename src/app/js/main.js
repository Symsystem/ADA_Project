/**
 * @author Symeon del Marmol
 *
 * @overview The application represented by the object SwissTweets.
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
    currentTab: "density",
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
        SwissTweets.main.loadData("density");
    },
    cleanData: function() {
        if (SwissTweets.main.map != null) {
            SwissTweets.main.map.destroy();
        }
        SwissTweets.main.map = null;
        SwissTweets.main.timeline = null;
        SwissTweets.main.data = {};
        var tab = SwissTweets.main.currentTab;
        document.getElementById(
            SwissTweets.main.htmlMapIds[tab]).innerHTML = "";
        document.getElementById
        (SwissTweets.main.htmlTimelineIds[tab]).innerHTML = "";
    },
    loadData: function(tab) {
        var prevTabDiv = document.getElementById(SwissTweets.main.currentTab);
        var prevloaded = prevTabDiv.getElementsByClassName("loaded");
        for (var i = 0; i < prevloaded.length; i++) {
            prevloaded[i].style.display = "none";
        }
        prevTabDiv.getElementsByClassName("loader")[0].style.display = "block";

        SwissTweets.main.currentTab = tab;
        if (tab == "density") {
            SwissTweets.density.loadData();
        } else if (tab == "sentiment") {
            SwissTweets.sentiment.loadData();
        } else if (tab == "event") {
            SwissTweets.event.loadData();
        }
    },
    changeTab: function(tab) {
        SwissTweets.main.cleanData();
        SwissTweets.main.loadData(tab);
    },
    endLoading: function(tab) {
        var tabDiv = document.getElementById(tab);
        tabDiv.getElementsByClassName("loader")[0].style.display = "none";
        var loaded = tabDiv.getElementsByClassName("loaded");
        for (var i = 0; i < loaded.length; i++) {
            loaded[i].style.display = "block";
        }
        SwissTweets.main.map.refreshSize();
        SwissTweets.main.selectedPeriodInfo(SwissTweets.start, SwissTweets.end);
    },
    selectedPeriodInfo: function(start, end) {
        var divs = document.getElementsByClassName("periodSelected"),
            s = new Date(start);
        s.setMonth(s.getMonth() + 1);
        var content = (s.toLocaleString("en-gb", {month: 'long'}))
            + " " + s.getFullYear();
        if (start != end) {
            var e = new Date(end);
            e.setMonth(e.getMonth() + 1);
            content += " - " + (e.toLocaleString("en-gb", {month: 'long'}))
                + " " + e.getFullYear();
        }
        for (var i = 0; i < divs.length; i++) {
            divs[i].innerHTML = content;
        }
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

        var nbrDates = cantonsData.cantons.length;
        SwissTweets.start =
            cantonsData.cantons[nbrDates - Math.floor(nbrDates/4)].date;
        SwissTweets.end = cantonsData.cantons[nbrDates-1].date;

        SwissTweets.density.maxValSlider = new LogSlider(0, 1);
        $('#densitySlider').attr("value", 50);
        SwissTweets.density.updateDates(SwissTweets.start, SwissTweets.end);

        var timeLine = new TimeLine("densityTimeline",
            SwissTweets.main.data["dates"],
            [SwissTweets.start, SwissTweets.end]);

        timeLine.addUpdateListener(function(range) {
            SwissTweets.density.updateDates(range[0], range[1]);
            SwissTweets.main.selectedPeriodInfo(range[0], range[1]);
        });
        SwissTweets.main.timeline = timeLine;

        SwissTweets.main.endLoading("density");
    },
    updateDates: function(start, end) {
        SwissTweets.start = start;
        SwissTweets.end = end;

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
        var arr = Object.keys(res).map(function(key){return res[key];}),
            min = Math.min.apply(null, arr),
            max = Math.max.apply(null, arr);
        SwissTweets.density.maxValSlider.setBounds(min == 0 ? 1 : min, max);
        $('#maxValueDensity').html("Max color: " + max + " tweets");
        res["min"] = 0; res["max"] = max;

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
        densityMap.enableLayer(SwissTweets.density.layer);

        SwissTweets.main.map = densityMap;

        $('#densitySlider').on('change', function() {
            var val = SwissTweets.density.maxValSlider.value(+$(this).val());
            $('#maxValueDensity').html("Max color: " + val.toFixed(0) + " tweets");
            SwissTweets.main.map.setActualMaxValue(SwissTweets.density.layer, val);
        });
    },
    clickInfo: function(e) {
        var layer = e.target.options.parent;
        document.getElementById("densityInfos").innerHTML =
            "<span class='name'>Name: "
            + e.target.feature.properties.name + "</span><br/>"
            + "<span class='number'>Number of tweets: "
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
        SwissTweets.density.updateDates(SwissTweets.start, SwissTweets.end);
    }
};


/**
 *
 * ******* SENTIMENT *********
 *
 */
SwissTweets.sentiment = {
    layer: "cantons",
    loadData: function() {
        queue()
            .defer(d3.json, "res/sentiment/canton_sentiment.json")
            .defer(d3.json, "res/sentiment/municipality_sentiment.json")
            .await(SwissTweets.sentiment.processData);

        document.getElementById("sentiment")
            .getElementsByClassName("zoom-level-btn")[0].onclick =
            SwissTweets.sentiment.changeLayer;
    },
    processData: function(error, cantonsData, muniData) {
        if (error) { throw error; }

        SwissTweets.main.data["cantons"] = cantonsData;
        SwissTweets.main.data["municipalities"] = muniData;
        SwissTweets.main.data["dates"] =
            cantonsData.cantons.map(function(e) { return e.date; });

        var nbrDates = cantonsData.cantons.length;
        SwissTweets.start =
            cantonsData.cantons[nbrDates - Math.floor(nbrDates/4)].date;
        SwissTweets.end = cantonsData.cantons[nbrDates-1].date;

        SwissTweets.sentiment.updateDates(SwissTweets.start, SwissTweets.end);

        var timeLine = new TimeLine("sentimentTimeline",
                SwissTweets.main.data["dates"],
                [SwissTweets.start, SwissTweets.end]);
        timeLine.addUpdateListener(function(range) {
            SwissTweets.sentiment.updateDates(range[0], range[1]);
            SwissTweets.main.selectedPeriodInfo(range[0], range[1]);
        });
        SwissTweets.main.timeline = timeLine;

        SwissTweets.main.endLoading("sentiment");
    },
    updateDates: function(start, end) {
        SwissTweets.start = start;
        SwissTweets.end = end;

        var t = (SwissTweets.sentiment.layer === "cantons") ?
            SwissTweets.main.data["cantons"].cantons :
            SwissTweets.main.data["municipalities"].municipalities;
        var res = {}, totalnbr = {};
        for (var i = 0; i < t.length; i++) {
            if (start <= t[i].date && t[i].date <= end) {
                for (var j = 0; j < t[i].data.length; j++) {
                    var data = t[i].data[j];
                    if (!res[data.id]) {
                        res[data.id] = 0;
                        totalnbr[data.id] = 0;
                    }
                    res[data.id] += data.nbr;
                    totalnbr[data.id] += 1;
                }
            }
        }
        Object.keys(res).map(function(key){ res[key] /= totalnbr[key]; });
        if (SwissTweets.main.map == null) {
            SwissTweets.sentiment.loadMap();
        }
        res["min"] = -1; res["max"] = 1;
        SwissTweets.main.map.updateData(SwissTweets.sentiment.layer, res);
    },
    loadMap: function() {
        var densityMap =
            new SwissMap("sentimentMap", SwissTweets.main.topo.country);
        var fitBoundsRegion = function(e) {
            densityMap.leafMap.fitBounds(e.target.getBounds());
        };

        var cantonLayer =
            new TopoLayer("cantons", SwissTweets.main.topo.cantons);
        cantonLayer.setColors("#e34a33", "#2AB23B");
        cantonLayer.addClickListener(SwissTweets.sentiment.clickInfo);
        cantonLayer.addClickListener(fitBoundsRegion);

        var muniLayer =
            new TopoLayer("municipalities", SwissTweets.main.topo.municipalities);
        muniLayer.setColors("#e34a33", "#2AB23B");
        muniLayer.addClickListener(SwissTweets.sentiment.clickInfo);
        muniLayer.addClickListener(fitBoundsRegion);

        densityMap.addLayer(cantonLayer);
        densityMap.addLayer(muniLayer);
        densityMap.enableLayer(SwissTweets.sentiment.layer);

        SwissTweets.main.map = densityMap;
    },
    clickInfo: function(e) {
        var layer = e.target.options.parent;
        document.getElementById("sentimentInfos").innerHTML =
            "<span class='name'>Name: "
            + e.target.feature.properties.name + "</span><br/>"
            + "<span class='number'>Sentiment: "
            + layer.data[e.target.feature.id].toFixed(2)
            + " <i>(-1 = bad, +1 = good)</i></span>";
    },
    changeLayer: function() {
        var map = SwissTweets.main.map;
        if (SwissTweets.sentiment.layer === "cantons") {
            map.disableLayer("cantons");
            map.enableLayer("municipalities");
            SwissTweets.sentiment.layer = "municipalities"
        } else {
            map.disableLayer("municipalities");
            map.enableLayer("cantons");
            SwissTweets.sentiment.layer = "cantons"
        }
        SwissTweets.sentiment.updateDates(SwissTweets.start, SwissTweets.end);
    }
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

        var nbrDates = eventData.events.length;
        SwissTweets.start =
            eventData.events[nbrDates - Math.floor(nbrDates/4)].date;
        SwissTweets.end = eventData.events[nbrDates-1].date;

        SwissTweets.event.updateDates(SwissTweets.start, SwissTweets.end);

        var timeLine = new TimeLine("eventTimeline",
            SwissTweets.main.data["dates"],
            [SwissTweets.start, SwissTweets.end]);

        timeLine.addUpdateListener(function(range) {
            SwissTweets.event.updateDates(range[0], range[1]);
            SwissTweets.main.selectedPeriodInfo(range[0], range[1]);
        });
        SwissTweets.main.timeline = timeLine;

        SwissTweets.main.endLoading("event");
    },
    updateDates: function(start, end) {
        $("#event-mini-loader").show();
        SwissTweets.start = start;
        SwissTweets.end = end;

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

        setTimeout(function(){
            SwissTweets.main.map.updateData("events", res);
            $("#event-mini-loader").hide();
        }, 20);
    },
    loadMap: function() {
        var eventMap = new SwissMap("eventMap", SwissTweets.main.topo.country, 15);

        var eventLayer = new MarkerLayer("events");
        eventLayer.addClickListener(SwissTweets.event.clickInfo);

        var cantonLayer =
            new TopoLayer("cantons", SwissTweets.main.topo.cantons, false);

        eventMap.addLayer(eventLayer);
        eventMap.addLayer(cantonLayer);
        eventMap.enableLayer("events");
        eventMap.enableLayer("cantons");

        SwissTweets.main.map = eventMap;
    },
    clickInfo: function(e) {
        var event = e.target.options.data;
        var date = new Date(event.date);
        var tweets = "";
        for (var i = 0; i < event.tweets.length; i++) {
            tweets += "<li>" + event.tweets[i] + "</li>";
        }
        var locale = "en-gb";
        document.getElementById("eventInfos").innerHTML =
            "<p><span class='name'>Name: " + event.name + "</span><br/>"
            + "<span class='date'>Date: "
            + date.getDate() + " "
            + date.toLocaleString(locale, {month: "short"}) + " "
            + date.getFullYear() + "</span><br/>"
            + "<span class='date'>Number of tweets: "
            + event.number_of_tweets + "</span></p>"
            + "<div class='panel panel-default panel-tweets'><div class='panel-heading'>"
            + "<i class='fa fa-twitter fa-fw'></i> List of tweets</div>"
            + "<div class='panel-body'><ul>" + tweets + "</ul></div></div>";
    }
};