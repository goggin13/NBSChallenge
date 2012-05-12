(function() {

  window.DateSlider = Backbone.View.extend({
    "class": 'date_slider',
    render: function() {
      ($(this.el)).slider();
      return this;
    }
  });

}).call(this);
