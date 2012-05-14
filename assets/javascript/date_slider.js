(function() {

  window.format_nbs_date = function(d) {
    var date;
    d = d * 86400 * 1000;
    date = new Date(d);
    return "" + (date.getMonth() + 1) + " / " + (date.getDate()) + " / " + (date.getFullYear());
  };

  window.DateSlider = Backbone.View.extend({
    "class": 'date_slider',
    min: 14952,
    max: 15307,
    on_slide: null,
    on_stop: null,
    initialize: function() {
      _.bindAll(this);
      this.start_day_label = $("<div class='left' />");
      this.end_day_label = $("<div class='right' />");
      this.on_slide = this.options.on_slide;
      return this.on_stop = this.options.on_stop;
    },
    update_legend: function(end_day) {
      var day;
      day = end_day - 4;
      return ($('.legend .measure')).each(function() {
        ($(this)).text(format_nbs_date(day));
        return day += 1;
      });
    },
    set_labels: function(day_1, day_2) {
      this.start_day_label.text(format_nbs_date(day_1));
      this.end_day_label.text(format_nbs_date(day_2));
      return this.update_legend(day_2);
    },
    _on_slide: function(event, ui) {
      if (ui.values[1] - ui.values[0] < 4) return false;
      this.set_labels(ui.values[0], ui.values[1]);
      if (this.on_slide) return this.on_slide(ui.values[0], ui.values[1]);
    },
    _on_stop: function(event, ui) {
      if (this._on_stop) return this.on_stop(ui.values[0], ui.values[1]);
    },
    render: function() {
      ($(this.el)).slider({
        range: true,
        min: this.min,
        max: this.max,
        values: [this.min, this.max],
        slide: this._on_slide,
        stop: this._on_stop
      });
      ($(this.el)).append('<div class="clear" />').append(this.end_day_label).append(this.start_day_label);
      this.set_labels(this.min, this.max);
      return this;
    }
  });

}).call(this);
