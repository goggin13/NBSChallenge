(function() {

  window.Chart = Backbone.View.extend({
    model: NBSArtist,
    id: 'chart',
    initialize: function() {
      return this.slider = new DateSlider({});
    },
    init_graph: function() {
      var _this = this;
      return this.model.get_chart_data(function(data) {
        var title, vis;
        vis = d3.select("#chart").selectAll("svg").data(data).enter().append("svg").attr("class", "bullet").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(chart);
        title = vis.append("g").attr("text-anchor", "end").attr("transform", "translate(-6," + (height - margin.top - margin.bottom) / 2 + ")");
        title.append("text").attr("class", "title").text(function(d) {
          return d.title;
        });
        title.append("text").attr("class", "subtitle").attr("dy", "1em").text(function(d) {
          return d.subtitle;
        });
        chart.duration(1000);
        _this._initialized = true;
        return ($(_this.el)).append(_this.slider.render().el);
      });
    },
    render: function() {
      return this;
    }
  });

}).call(this);
