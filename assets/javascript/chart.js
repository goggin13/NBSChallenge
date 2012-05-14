(function() {

  window.Chart = Backbone.View.extend({
    model: NBSArtist,
    start_day: false,
    end_day: false,
    events: {
      'change input': 'update_pie_chart_url'
    },
    initialize: function() {
      var msg,
        _this = this;
      _.bindAll(this);
      this.slider = new DateSlider({
        on_stop: this.update_chart
      });
      this.chart_wrapper = $('<div id="chart_wrapper"/>');
      this.chart_image = $("<img id='chart_image' src='' />");
      msg = 'No event data was found between these dates';
      this.no_chart_data = ($("<div class='chart_object'>" + msg + "</div>")).hide();
      this.chart_wrapper.append(this.chart_image).append(this.no_chart_data);
      return this.model.get_events_data(function(events) {
        return _this.event_data = events;
      });
    },
    update_row: function(row, data) {
      return _.find(data, function(d) {
        return row.title === d.title;
      });
    },
    update_pie_chart_url: function() {
      var attribute, url,
        _this = this;
      attribute = ($('input:checked')).val();
      url = this.event_data.to_charts_url(this.start_day, this.end_day, attribute);
      if (url === this.chart_image.attr("src")) return;
      this.chart_image.hide();
      if (url === null) {
        return this.no_chart_data.show();
      } else {
        this.no_chart_data.hide();
        this.chart_image.load(function() {
          return _this.chart_image.fadeIn();
        });
        return this.chart_image.attr("src", url);
      }
    },
    update_chart: function(start_day, end_day) {
      var _this = this;
      this.start_day = start_day;
      this.end_day = end_day;
      return this.model.get_chart_data({
        start_day: this.start_day,
        end_day: this.end_day,
        callback: function(data) {
          _this.update_pie_chart_url();
          return _this.vis.datum(function(d) {
            return _this.update_row(d, data);
          }).call(chart);
        }
      });
    },
    load_data: function(data) {
      var title;
      this.vis = d3.select("#chart").selectAll("svg").data(data).enter().append("svg").attr("class", "bullet").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(chart);
      title = this.vis.append("g").attr("text-anchor", "end").attr("transform", "translate(-6," + ((height - margin.top - margin.bottom) / 2) + ")");
      title.append("text").attr("class", "title").text(function(d) {
        return d.title;
      });
      title.append("text").attr("class", "subtitle").attr("dy", "1em").text(function(d) {
        return d.subtitle;
      });
      return chart.duration(1000);
    },
    init_graph: function() {
      var _this = this;
      return this.model.get_chart_data({
        start_day: this.start_day,
        end_day: this.end_day,
        callback: function(data) {
          _this.load_data(data);
          ($(_this.el)).append(_this.chart_wrapper).append(_this.slider.render().el);
          return _this.update_pie_chart_url();
        }
      });
    },
    render: function() {
      ($(this.el)).html("<div id='chart'></div>                  <ul class='chart_options'>                    <li><input type='radio' name='type' value='count' checked='checked'/>Count</li>                    <li><input type='radio' name='type' value='weight' />Weight</li>                    <li><input type='radio' name='type' value='freq' />Frequency</li>                  </ul>");
      return this;
    }
  });

}).call(this);
