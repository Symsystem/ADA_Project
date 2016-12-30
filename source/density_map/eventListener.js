/**
 * This class represents custom event listener that trigger a list of functions
 * when an event occurs.
 *
 * @Author Symeon del Marmol
 */

function EventListener() {

    var functions = [];

    this.addListener = function(listener) {
        functions.push(listener);
    };

    this.trigger = function(params) {
        functions.forEach(function(f) {
           f(params);
        });
    };
}
