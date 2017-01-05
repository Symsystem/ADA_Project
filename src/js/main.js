/**
 * Main program
 *
 * @Author Symeon del Marmol
 *
 */

var SwissTweets = SwissTweets || {};

var timeline;

SwissTweets.main = {
    init: function() {
        SwissTweets.data.loadData();
        document.getElementsByClassName("zoom-level-btn")[0].onclick = SwissTweets.graphic.changeDensityLayer;
    }
};

SwissTweets.data = {
    topo: "res/topo/",
    density: "res/density/",

    densityLayer: "cantons",

    loadData: function() {
        queue().defer(d3.json, this.topo + "ch-country.json")
            .defer(d3.json, this.topo + "ch-cantons.json")
            .defer(d3.json, this.topo + "ch-municipalities.json")
            .await(SwissTweets.graphic.initMap);
    },

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
        var initDate = cantonsData.cantons[0].date;
        SwissTweets.data.updateDensityDates(cantonsData.cantons[0].date, cantonsData.cantons[4].date);

        timeLine = new TimeLine(SwissTweets.densityDate);
        timeLine.addUpdateListener(function(range) {
            SwissTweets.data.updateDensityDates(range[0], range[1]);
        });
    },
    updateDensityDates: function(start, end) {
        var c = SwissTweets.densityCanton.cantons;
        var resCantons = {};
        for (var i = 0; i < c.length; i++) {
            if (start <= c[i].date && c[i].date <= end) {
                for (var j = 0; j < c[i].data.length; j++) {
                    var data = c[i].data[j];
                    if (!resCantons[data.id]) {
                        resCantons[data.id] = 0;
                    }
                    resCantons[data.id] += data.nbr;
                }
            }
        }
        var densityMap = SwissTweets.graphic.obj["densityMap"];
        densityMap.updateData("cantons", resCantons);
        densityMap.enableLayer(SwissTweets.data.densityLayer);

        var m = SwissTweets.densityMuni.municipalities;
        var resMuni = {};
        SwissTweets.densityDate = [];
        for (var i = 0; i < m.length; i++) {
            SwissTweets.densityDate.push(m[i].date);
            if (start <= m[i].date && c[i].date <= end) {
                for (var j = 0; j < m[i].data.length; j++) {
                    var data = m[i].data[j];
                    if (!resMuni[data.id]) {
                        resMuni[data.id] = 0;
                    }
                    resMuni[data.id] += data.nbr;
                }
            }
        }
        densityMap.updateData("municipalities", resMuni);
    },
    clickDensityInfo: function(e) {
        var layer = e.target.options.parent;
        var content = "<span class='name'>Name : "
            + e.target.feature.properties.name + "</span><br/>"
            + "<span class='number'>Number : "
            + layer.data[e.target.feature.id] + "</span>";

        document.getElementById("densityInfos").innerHTML = content;
    }
};

SwissTweets.graphic = {
    obj: {},

    initMap: function(error, country, cantons, municipalities) {

        var densityMap = new SwissMap("densityMap", country);
        var cantonLayer = new TopoLayer("cantons", cantons);
        cantonLayer.addClickListener(SwissTweets.data.clickDensityInfo);
        densityMap.addLayer(cantonLayer);
        var muniLayer = new TopoLayer("municipalities", municipalities);

        densityMap.addLayer(muniLayer);
        SwissTweets.graphic.obj["densityMap"] = densityMap;

        SwissTweets.data.loadDensityData();
    },

    changeDensityLayer: function() {
        var o = SwissTweets.graphic.obj;
        if (SwissTweets.data.densityLayer === "cantons") {
            o["densityMap"].disableLayer("cantons");
            o["densityMap"].enableLayer("municipalities");
            SwissTweets.data.densityLayer = "municipalities"
        } else {
            o["densityMap"].disableLayer("municipalities");
            o["densityMap"].enableLayer("cantons");
            SwissTweets.data.densityLayer = "cantons"
        }
    }
};

Window.onload = SwissTweets.main.init();