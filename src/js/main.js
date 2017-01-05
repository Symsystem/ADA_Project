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
        SwissTweets.densityDates =
            cantonsData.cantons.map(function(e) { return e.date; });

        var initRange = [cantonsData.cantons[0].date,
            cantonsData.cantons[cantonsData.cantons.length-1].date];
        SwissTweets.data.updateDensityDates(initRange[0], initRange[1]);

        var densityTimeLine = new TimeLine(SwissTweets.densityDates);
        densityTimeLine.addUpdateListener(function(range) {
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
    }
};

SwissTweets.graphic = {
    obj: {},

    initMap: function(error, country, cantons, municipalities) {

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