(function() {

  window.NBSArtist = Backbone.Model.extend({
    get_name: function() {
      return this.get("name");
    },
    get_chart_data: function(callback) {
      var data, data_sets, n;
      data = [];
      n = this.get_name();
      data_sets = [new NBSFacebookData(n), new NBSTwitterData(n), new NBSWikipediaData(n), new NBSVevoData(n)];
      _.each(data_sets, function(data_set) {
        return data_set.fetch(function() {
          return data.push(data_set.get_chart_data());
        });
      });
      return callback(data);
    }
  });

}).call(this);
