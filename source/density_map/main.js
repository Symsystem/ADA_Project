window.onload = main();

function main() {
    loadData();
    swissMap().init();
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

function processData(error, country, cantons, municipalities, cantonsData) {

    // Throw the error if exists
    if (error) {
        throw error;
    }

    // Complete the data
    var cant = cantons.objects.cantons.geometries;
    for (var i in cantonsData.cantons) {
        var yearData = cantonsData.cantons[i];
        years[i] = yearData.year;
        for (var j in cant) {
            for (var k in yearData.data) {
                if (yearData.data[k].id == cant[j].properties.id) {
                    cant[j].properties[yearData.year] = yearData.data[k].nbr;
                }
            }
        }
    }
}