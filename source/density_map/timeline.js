var timeline = d3.slider().axis(true);

timeline.on("slide", function(evt, value) {
   swissMap().draw(value);
});