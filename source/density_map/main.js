/**
 * Main program
 *
 * @Author Symeon del Marmol
 *
 */

var data = {},
    swissMap,
    timeLine,
    loadDataListener,
    zoomLevel = "canton";

var updateInfo = function(element) {
    var content = "<span class='name'>Name : "
                + element.target.feature.properties.name + "</span><br/>"
                + "<span class='number'>Number : "
                + element.target.feature.properties.data.nbr + "</span>";

    document.getElementById("infos").innerHTML = content;
};

function main() {
    loadDataListener = new EventListener();
    loadDataListener.addListener(displayElements);

    loadData();
    init();
}

function init() {
    var btn = document.createElement("BUTTON"),
        t = document.createTextNode("Change zoom");
    btn.appendChild(t);
    document.getElementById("content").appendChild(btn);
    btn.onclick = changeZoom;
}

function loadData() {
    queue()
        .defer(d3.json, "topo/ch-country.json")
        .defer(d3.json, "topo/ch-cantons.json")
        .defer(d3.json, "topo/ch-municipalities.json")
        .defer(d3.json, "data/canton_density.json")
        .defer(d3.json, "data/municipality_density.json")
        .await(processData);
}

function processData(error, country, cantons, municipalities, cantonsData, muniData) {

    // Throw the error if exists
    if (error) {
        throw error;
    }
    var dates = [];

    // Processing data for cantons
    var cant = cantons.objects.cantons.geometries;
    for (var i in cantonsData.cantons) {
        var dateData = cantonsData.cantons[i];
        dates[i] = dateData.date;
        for (var j in cant) {
            if (!cant[j].properties["data"]) {
                cant[j].properties["data"] = {};
            }
            for (var k in dateData.data) {
                if (dateData.data[k].id == cant[j].properties.id) {
                    cant[j].properties.data[dateData.date] = dateData.data[k].nbr;
                }
            }
        }
    }

    // Processing data for municipalities
    var muni = municipalities.objects.municipalities.geometries;
    for (var i in muni) {
        muni[i].properties["data"] = {};
        for (var j in muniData.municipalities) {
            var dateData = muniData.municipalities[j];
            for (var k in dateData.data) {
                if (dateData.data[k].id == muni[i].properties.id) {
                    muni[i].properties.data[dateData.date] = dateData.data[k].nbr;
                }
            }
        }
    }

    data.dates = dates;
    data.country = country;
    data.cantons = cantons;
    data.municipalities = municipalities;

    loadDataListener.trigger([data]);
}

function displayElements(params) {
    var data = params[0];
    swissMap = new SwissMap(data);
    swissMap.init(zoomLevel);
    swissMap.addClickListener(updateInfo);

    timeLine = new TimeLine(data.dates);
    timeLine.addUpdateListener(swissMap.updateRange);
}

function changeZoom() {
    if (zoomLevel === "canton") {
        zoomLevel = "municipality";
    } else {
        zoomLevel = "canton";
    }
    swissMap.setZoomLevel(zoomLevel);
}

window.onload = main();