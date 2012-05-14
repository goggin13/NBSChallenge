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

  window.NBSEventDataPoint = Backbone.Model.extend({
    get_day: function() {
      return parseInt(this.get("day"), 10);
    },
    get_data: function() {
      return this.get("data");
    },
    get_events: function() {
      return _.map(this.get_data(), function(v, key) {
        return v;
      });
    }
  });

  window.NBSData = Backbone.Collection.extend({
    model: NBSDataPoint,
    init: function(spec) {
      this.reset();
      this.artist = spec.artist;
      return this.data_type = spec.data_type;
    },
    range: function(d1, d2) {
      if (!(d1 && d2)) return this;
      if (!((d2 - d1) >= 4)) throw "invalid range " + d1 + " -> " + d2;
      return this.filter(function(data) {
        var day;
        return (day = data.get_day()) && (day >= d1) && (day <= d2);
      });
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

  window.NBSEventsData = window.NBSData.extend({
    model: NBSEventDataPoint,
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'events'
      });
    },
    formatted_data: function() {
      return this.raw_json().data;
    },
    aggregate: function(start_day, end_day) {
      var collect;
      collect = function(acc, day) {
        _.each(day.get_events(), function(event) {
          event.name = event.name.replace("&amp;", "and");
          if (!acc[event.name]) {
            acc[event.name] = {
              count: 0,
              weight: 0,
              freq: 0
            };
          }
          acc[event.name].count += event.count;
          acc[event.name].weight += event.weight;
          return acc[event.name].freq += 1;
        });
        return acc;
      };
      return this.range(start_day, end_day).reduce(collect, {});
    },
    to_charts_url: function(start_day, end_day, attribute) {
      var base, labels, values;
      base = "https://chart.googleapis.com/chart?cht=p&chs=550x250&chd=t:";
      values = [];
      labels = [];
      _.each(this.aggregate(start_day, end_day), function(event_data, key) {
        values.push(event_data[attribute]);
        return labels.push(key);
      });
      if (values.length > 0) {
        return "" + base + (values.join(',')) + "&chl=" + (labels.join('|'));
      } else {
        return null;
      }
    }
  });

  window.NBSRadioGeoData = window.NBSData.extend({
    model: NBSGeoPoint,
    formatted_data: function() {
      return this.parse_to_key('values', this.raw_json().data);
    },
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
    get_mean: function(start_day, end_day) {
      var range, total;
      range = this.range(start_day, end_day);
      total = range.reduce((function(sum, data) {
        return sum + data.get_data();
      }), 0);
      return this.round(total / range.length, 4);
    },
    get_last: function(n, end_day) {
      var data, data_point, day;
      day = end_day - n + 1;
      data = [];
      while (day <= end_day) {
        data_point = this.find(function(d) {
          return d.get_day() === day;
        });
        data.push((data_point ? data_point.get_data() : 0));
        day += 1;
      }
      return data;
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
        subtitle: "",
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
    title: "Twitter"
  });

  window.NBSFacebookData = window.NBSGlobalData.extend({
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'facebook'
      });
    },
    title: "Facebook"
  });

  window.NBSVevoData = window.NBSGlobalData.extend({
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'vevo'
      });
    },
    title: "Vevo"
  });

  window.NBSWikipediaData = window.NBSGlobalData.extend({
    initialize: function(artist) {
      return this.init({
        artist: artist,
        data_type: 'wikipedia'
      });
    },
    title: "Wikipedia"
  });

}).call(this);
