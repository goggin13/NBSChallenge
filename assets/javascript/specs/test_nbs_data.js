(function() {

  describe("NBSData Objects", function() {
    var fetched;
    fetched = null;
    beforeEach(function() {
      return fetched = false;
    });
    describe("NBSGlobalData collections", function() {
      it("should return NBSDataPoint objects", function() {
        var data_points;
        data_points = new NBSFacebookData("rihanna");
        data_points.fetch(function(models, resp) {
          expect(models[0] instanceof NBSDataPoint).toBeTruthy();
          expect(models[0].get_day()).toEqual(14951);
          expect(models[0].get_data()).toEqual(18414108);
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Facebook API call to return", 1000);
      });
      it("should retrieve facebook data points", function() {
        var data_points;
        data_points = new NBSFacebookData("rihanna");
        data_points.fetch(function(models, resp) {
          expect(data_points.length).toEqual(349);
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Facebook API call to return", 1000);
      });
      it("should retrieve twitter data points", function() {
        var data_points;
        data_points = new NBSTwitterData("rihanna");
        data_points.fetch(function(models, resp) {
          expect(data_points.length).toEqual(352);
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Twitter API call to return", 1000);
      });
      it("should retrieve vevo data points", function() {
        var data_points;
        data_points = new NBSVevoData("rihanna");
        data_points.fetch(function(models, resp) {
          expect(data_points.length).toEqual(354);
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Vevo API call to return", 1000);
      });
      it("should retrieve wikipedia data points", function() {
        var data_points;
        data_points = new NBSWikipediaData("rihanna");
        data_points.fetch(function(models, resp) {
          expect(data_points.length).toEqual(356);
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Wikipedia API call to return", 1000);
      });
      describe("range", function() {
        var data_points;
        data_points = null;
        beforeEach(function() {
          data_points = new NBSWikipediaData("rihanna");
          data_points.fetch(function(models, resp) {
            return fetched = true;
          });
          return waitsFor((function() {
            return fetched;
          }), "Wikipedia API call to return", 1000);
        });
        it("should return the whole collection if start or end date is missing", function() {
          expect(data_points.range(null, 14954)).toEqual(data_points);
          expect(data_points.range(14954)).toEqual(data_points);
          return expect(data_points.range()).toEqual(data_points);
        });
        it("should throw an error if a range less than 5 days is requested", function() {
          var err;
          err = new Error("invalid range 14954 -> 14957");
          return expect(function() {
            return data_points.range(14954, 14957);
          }).toThrow(err);
        });
        return it("should return data points in the requested range", function() {
          return expect(data_points.range(14951, 14960).length).toEqual(10);
        });
      });
      return describe("statistics", function() {
        var data_points, set_data;
        data_points = null;
        set_data = function() {
          return window.rihanna_wikipedia_data = {
            data: {
              global: {
                "14951": 4,
                "14952": 5,
                "14953": 9,
                "14954": 8,
                "14955": 2,
                "14956": 4,
                "14957": 6
              }
            }
          };
        };
        beforeEach(function() {
          set_data();
          data_points = new NBSWikipediaData("rihanna");
          data_points.fetch(function(models, resp) {
            expect(data_points.length).toEqual(7);
            return fetched = true;
          });
          return waitsFor((function() {
            return fetched;
          }), "Wikipedia API call to return", 1000);
        });
        it("should calculate the mean", function() {
          return expect(data_points.get_mean()).toEqual(5.4286);
        });
        it("should calculate the mean of a range", function() {
          return expect(data_points.get_mean(14952, 14956)).toEqual(5.6);
        });
        it("should calculate the quartiles", function() {
          var quartiles;
          quartiles = data_points.get_quartiles();
          expect(quartiles[0]).toEqual(2);
          expect(quartiles[1]).toEqual(4);
          expect(quartiles[2]).toEqual(5);
          expect(quartiles[3]).toEqual(7);
          return expect(quartiles[4]).toEqual(9);
        });
        it("should calculate the quartiles of a range", function() {
          var quartiles;
          quartiles = data_points.get_quartiles(14952, 14957);
          expect(quartiles[0]).toEqual(2);
          expect(quartiles[1]).toEqual(4);
          expect(quartiles[2]).toEqual(5.5);
          expect(quartiles[3]).toEqual(8);
          return expect(quartiles[4]).toEqual(9);
        });
        it("should return data from the last n days", function() {
          return expect(data_points.get_last(5, 14957)).toEqual([9, 8, 2, 4, 6]);
        });
        it("should fill in zeros if data isn't available on a day", function() {
          return expect(data_points.get_last(5, 14954)).toEqual([0, 4, 5, 9, 8]);
        });
        it("should return all of the data ready to be put into the chart", function() {
          var chart_data;
          chart_data = data_points.get_chart_data();
          expect(chart_data.title).toEqual("Wikipedia");
          expect(chart_data.ranges).toEqual(data_points.get_quartiles());
          expect(chart_data.measures).toEqual(data_points.get_last(5, 14957));
          return expect(chart_data.markers).toEqual([data_points.get_mean()]);
        });
        return it("should return all of the data ready to be put into the chart for a range", function() {
          var chart_data;
          chart_data = data_points.get_chart_data(14952, 14957);
          expect(chart_data.title).toEqual("Wikipedia");
          expect(chart_data.ranges).toEqual(data_points.get_quartiles(14952, 14957));
          expect(chart_data.measures).toEqual(data_points.get_last(5, 14957));
          return expect(chart_data.markers).toEqual([data_points.get_mean(14952, 14957)]);
        });
      });
    });
    describe("NBSRadioGeo collection", function() {
      it("should return NBSGeoPoint objects", function() {
        var data_points;
        data_points = new NBSRadioGeoData("rihanna");
        data_points.fetch(function(models, resp) {
          expect(models[0] instanceof NBSGeoPoint).toBeTruthy();
          expect(models[0].get_country()).toEqual("SZ");
          expect(models[0].get_data()['15218']).toEqual(7);
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Facebook API call to return", 1000);
      });
      return it("should retrieve a set of countrys with associated data points", function() {
        var data_points;
        data_points = new NBSRadioGeoData("rihanna");
        data_points.fetch(function(models, resp) {
          expect(data_points.length).toEqual(4);
          data_points[0];
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Radio geo API call to return", 1000);
      });
    });
    describe("NBSEventsData", function() {
      var data_points, event_data;
      event_data = null;
      data_points = null;
      beforeEach(function() {
        data_points = new NBSEventsData("rihanna");
        data_points.fetch(function(models, resp) {
          event_data = models[0];
          return fetched = true;
        });
        return waitsFor((function() {
          return fetched;
        }), "Event API call to return", 1000);
      });
      it("should return NBSEventData objects", function() {
        expect(data_points.at(0) instanceof NBSEventDataPoint).toBeTruthy();
        return expect(data_points.length).toEqual(110);
      });
      it("should return NBSEventData objects by range", function() {
        return expect(data_points.range(15201, 15205).length).toEqual(5);
      });
      it("should return aggregate event data", function() {
        var agg, count, freq, weight;
        agg = data_points.aggregate();
        count = 0;
        weight = 0;
        freq = 0;
        _.each(window.rihanna_events_data.data, function(value, key) {
          return _.each(value, function(v) {
            if (v.name === "Post") {
              count += v.count;
              weight += v.weight;
              return freq += 1;
            }
          });
        });
        expect(agg["Post"].freq).toEqual(freq);
        expect(agg["Post"].count).toEqual(count);
        return expect(agg["Post"].weight).toEqual(weight);
      });
      it("should return aggregate event data by range", function() {
        var agg, count, freq, weight;
        agg = data_points.aggregate(15201, 15205);
        count = 0;
        weight = 0;
        freq = 0;
        _.each(window.rihanna_events_data.data, function(value, key) {
          return _.each(value, function(v) {
            if (v.name === "Concert" && (parseInt(key) >= 15201) && (parseInt(key) <= 15205)) {
              count += v.count;
              weight += v.weight;
              return freq += 1;
            }
          });
        });
        expect(agg["Concert"].freq).toEqual(freq);
        expect(agg["Concert"].count).toEqual(count);
        return expect(agg["Concert"].weight).toEqual(weight);
      });
      describe("to_charts_url", function() {
        it("should return a google pie chart url by range", function() {
          var agg, count, url;
          agg = data_points.aggregate(15201, 15205);
          count = 0;
          _.each(window.rihanna_events_data.data, function(value, key) {
            return _.each(value, function(v) {
              if (v.name === "Concert" && (parseInt(key) >= 15201) && (parseInt(key) <= 15205)) {
                return count += v.count;
              }
            });
          });
          url = data_points.to_charts_url(15201, 15205, "count");
          expect(url).toMatch(/https:\/\/chart.googleapis.com\/chart\?cht=p&chs=550x250&chd=t:/);
          return expect(url).toMatch("," + count);
        });
        return it("should return null if there are no events", function() {
          return expect(data_points.to_charts_url(15101, 15105, "count")).toBeNull();
        });
      });
      return describe("NBSEventData objects", function() {
        it("should return the day as an int", function() {
          return expect(event_data.get_day()).toEqual(15200);
        });
        return it("should return an array of events hashes", function() {
          var day_1_events;
          day_1_events = [
            {
              count: 42,
              name: "Chart Appearance",
              weight: 5,
              id: 1
            }, {
              count: 14,
              name: "News and Blog Mention",
              weight: 9,
              id: 3
            }
          ];
          return expect(event_data.get_events()).toEqual(day_1_events);
        });
      });
    });
    return describe("NBSArtist", function() {
      var artist;
      artist = null;
      beforeEach(function() {
        return artist = new NBSArtist({
          name: "rihanna"
        });
      });
      it("should have a function to retrieve all the chart data", function() {
        artist.get_chart_data({
          callback: function(data) {
            expect(data[0].title).toEqual("Facebook");
            expect(data[3].title).toEqual("Vevo");
            return fetched = true;
          }
        });
        return waitsFor((function() {
          return fetched;
        }), "get_chart_data to return", 1000);
      });
      return it("should have a function to retrieve ranged chart data", function() {
        artist.get_chart_data({
          start_day: 15020,
          end_day: 15025,
          callback: function(data) {
            expect(data[0].markers).toEqual([24761466]);
            return fetched = true;
          }
        });
        return waitsFor((function() {
          return fetched;
        }), "get_chart_data to return", 1000);
      });
    });
  });

}).call(this);
