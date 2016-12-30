/**
 * Main program
 *
 * @Author Symeon del Marmol
 *
 */

var data = {},
    swissMap,
    timeLine,
    loadDataListener;

function main() {
    loadDataListener = new EventListener();
    loadDataListener.addListener(displayElements);

    loadData();
}

function loadData() {
    queue()
        .defer(d3.json, "topo/ch-country.json")
        .defer(d3.json, "topo/ch-cantons.json")
        .defer(d3.json, "topo/ch-municipalities.json")
        .defer(d3.json, "data/canton_density.json")
        //.defer(d3.json, "data/municipality_density.json")
        .await(processData);
}

function processData(error, country, cantons, municipalities, cantonsData/*, muniData*/) {

    // Throw the error if exists
    if (error) {
        throw error;
    }

    var dates = [];
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

    data.dates = dates;
    data.country = country;
    data.cantons = cantons;
    data.municipalities = municipalities;

    loadDataListener.trigger([data]);
}

function displayElements(params) {
    var data = params[0];
    swissMap = new SwissMap(data);
    swissMap.init();

    timeLine = new TimeLine(data.dates);
    timeLine.addUpdateListener(swissMap.draw);
}

window.onload = main();