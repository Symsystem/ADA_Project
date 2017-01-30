/**
 * @author Symeon del Marmol
 *
 * @overview A SwissMap object represents a graphic leaflet map that is
 * centered on Switzerland, displays the borders this country and has bounded
 * zoom. This map can have layers (of type LayerMap) characterised by their name
 * and can be configured to display some of them.
 *
 * The data of each layer can be updated.
 */

/**
 * @param {string} htmlId : It has to be the id of an existing html object.
 * @param {topoJSON} countryTopo : The topoJSON object that contains the borders
 *                                 of Switzerland.
 * @param {int} maxZ : The max level of zoom the the map authorizes
 * @constructor Creates a SwissMap contained on the html object with the id 'htmlId'
 *          and uses 'countryTopo' to draw the borders of Switzerland.
 */
function SwissMap(htmlId, countryTopo, maxZ) {

    var swissCoordinates = [46.79, 8.38];
    this.leafMap = L.map(htmlId).setView(swissCoordinates, 8);
    this.leafMap.addLayer(new L.TileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 8,
        maxZoom: maxZ || 12
    }));
    this.leafMap.addLayer(new L.TopoJSON(countryTopo, {
        style: {color: 'black', weight: 3, fill: "none"}
    }));

    this.layers = [];
}

/**
 * @param {MapLayer} layer
 * @effects Adds the layer to the map.
 */
SwissMap.prototype.addLayer = function(layer) {
    this.layers.push(layer);
};

/**
 * @param {String} layerName
 * @param {Object} data : These data has to have the right format depending on
 *                  the type of the layer 'layerName'.
 *                  See the requirements of the layers to have more information.
 * @effects Updates the data of the layer identified by 'layerName'.
 *          Do nothing if the layer is not on the SwissMap.
 */
SwissMap.prototype.updateData = function(layerName, data) {
    var layer;
    for (var i = 0; i < this.layers.length; i++) {
        if (layerName === this.layers[i].name) {
            layer = this.layers[i];
            break;
        }
    }
    if (layer) {
        layer.setData(data);
    }
};

SwissMap.prototype.setActualMaxValue = function(layerName, max) {
    var layer;
    for (var i = 0; i < this.layers.length; i++) {
        if (layerName === this.layers[i].name) {
            layer = this.layers[i];
            break;
        }
    }
    if (layer && layer instanceof TopoLayer) {
        layer.setActualMaxValue(max);
    }
};

/**
 * @param {string} layerName
 * @effects Enables and displays the layer identified by 'layerName'.
 */
SwissMap.prototype.enableLayer = function(layerName) {
    for (var i = 0; i < this.layers.length; i++) {
        if (this.layers[i].name === layerName) {
            this.layers[i].addToLeafMap(this.leafMap);
            break;
        }
    }
};

/**
 * @param {string} layerName
 * @effects Disables and does not display anymore the layer
 *          identified by 'layerName'.
 */
SwissMap.prototype.disableLayer = function(layerName) {
    for (var i = 0; i < this.layers.length; i++) {
        if (this.layers[i].name === layerName) {
            this.layers[i].removeFromLeafMap();
            break;
        }
    }
};

/**
 * @effects Destroy the object and free the memory
 */
SwissMap.prototype.destroy = function() {
    this.layers = null;
    this.leafMap.remove();
    this.leafMap = null;
};

/**
 * @effects Forces the leaflet map to recompute the size and reloading the tiles
 */
SwissMap.prototype.refreshSize = function() {
    this.leafMap.invalidateSize();
};