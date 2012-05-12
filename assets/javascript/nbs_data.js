(function() {

  window.NBSDataPoint = Backbone.Model.extend({
    get_day: function() {
      return parseInt(this.get("day"), 10);
    },
    get_data: function() {
      return parseInt(this.get("data"), 10);
    }
  });

  window.NBSGeoPoint = Backbone.Model.extend({
    get_country: function() {
      return this.get("country");
    },
    get_data: function() {
      return this.get("data");
    }
  });

  window.NBSData = Backbone.Collection.extend({
    model: NBSDataPoint,
    init: function(spec) {
      this.reset();
      this.artist = spec.artist;
      return this.data_type = spec.data_type;
    },
    raw_json: function() {
      return eval("window." + this.artist + "_" + this.data_type + "_data");
    },
    parse_to_key: function(key, data) {
      if (data[key] !== void 0) return data[key];
      return this.parse_to_key(key, data[Object.keys(data)[0]]);
    },
    add_model: function(k, data) {
      return this.add(new this.model({
        day: k,
        data: data
      }));
    },
    fetch: function(callback) {
      var _this = this;
      this.reset();
      _.each(this.formatted_data(), function(d, key) {
        return _this.add_model(key, d);
      });
      return callback(this.models);
    }
  });

  window.NBSValuesData = window.NBSData.extend({
    formatted_data: function() {
      return this.parse_to_key('values', this.raw_json().data);
    }
  });

  window.NBSRadioGeoData = window.NBSValuesData.extend({
    model: NBSGeoPoint,
    add_model: function(k, data) {
      return this.add(new this.model({
        country: k,
        data: data
      }));
    },
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'radio_geo'
      });
    }
  });

  window.NBSGlobalData = window.NBSData.extend({
    formatted_data: function() {
      return this.parse_to_key('global', this.raw_json().data);
    },
    round: function(n, places) {
      return (Math.round(n * Math.pow(10, places))) / Math.pow(10, places);
    },
    range: function(start_day, end_day) {
      if (start_day && end_day) {
        if (!((end_day - start_day) >= 4)) {
          throw "invalid range " + start_day + " -> " + end_day;
        }
        return this.filter(function(data) {
          var day;
          day = data.get_day();
          return (day >= start_day) && (day <= end_day);
        });
      } else {
        return this;
      }
    },
    get_mean: function(start_day, end_day) {
      var range, total;
      range = this.range(start_day, end_day);
      total = range.reduce((function(sum, data) {
        return sum + data.get_data();
      }), 0);
      return this.round(total / range.length, 4);
    },
    get_last: function(n, end_day) {
      return this.range(end_day - n + 1, end_day).map(function(d) {
        return d.get_data();
      });
    },
    median: function(values) {
      var half;
      half = Math.floor(values.length / 2);
      if (values.length % 2) {
        return values[half];
      } else {
        return (values[half - 1] + values[half]) / 2.0;
      }
    },
    get_quartiles: function(start_day, end_day) {
      var bottom_half, even, len, midway, sorted, top_half;
      sorted = this.range(start_day, end_day).map(function(d) {
        return d.get_data();
      }).sort(function(a, b) {
        return a - b;
      });
      len = sorted.length;
      even = midway % (Math.round(midway)) === 0;
      midway = Math.round(len / 2.0);
      bottom_half = sorted.slice(0, midway);
      if (len % 2 === 0) {
        top_half = sorted.slice(midway);
      } else {
        top_half = sorted.slice(midway - 1);
      }
      return [sorted[0], this.median(bottom_half), this.median(sorted), this.median(top_half), sorted[len - 1]];
    },
    get_chart_data: function(start_day, end_day) {
      return {
        title: this.title,
        subtitle: "subtitle",
        ranges: this.get_quartiles(start_day, end_day),
        measures: this.get_last(5, end_day || this.at(this.length - 1).get_day()),
        markers: [this.get_mean(start_day, end_day)]
      };
    }
  });

  window.NBSTwitterData = window.NBSGlobalData.extend({
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'twitter'
      });
    },
    title: "Twitter Activity"
  });

  window.NBSFacebookData = window.NBSGlobalData.extend({
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'facebook'
      });
    },
    title: "Facebook Activity"
  });

  window.NBSVevoData = window.NBSGlobalData.extend({
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'vevo'
      });
    },
    title: "Vevo Activity"
  });

  window.NBSWikipediaData = window.NBSGlobalData.extend({
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'wikipedia'
      });
    },
    title: "Wikipedia Activity"
  });

}).call(this);
