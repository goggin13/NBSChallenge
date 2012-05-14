(function() {

  window.NBSArtist = Backbone.Model.extend({
    get_name: function() {
      return this.get("name");
    },
    get_chart_data: function(options) {
      var data, data_sets, n;
      n = this.get_name();
      data_sets = [new NBSFacebookData(n), new NBSTwitterData(n), new NBSWikipediaData(n), new NBSVevoData(n)];
      data = [];
      _.each(data_sets, function(data_set) {
        return data_set.fetch(function() {
          return data.push(data_set.get_chart_data(options.start_day, options.end_day));
        });
      });
      return options.callback(data);
    },
    get_events_data: function(callback) {
      var events;
      events = new NBSEventsData(this.get_name());
      return events.fetch(function() {
        return callback(events);
      });
    }
  });

}).call(this);
