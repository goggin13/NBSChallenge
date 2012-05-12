(function() {

  describe("NBSData", function() {
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
        it("should return all of the data ready to be put into the chart", function() {
          var chart_data;
          chart_data = data_points.get_chart_data();
          expect(chart_data.title).toEqual("Wikipedia Activity");
          expect(chart_data.subtitle).toEqual("subtitle");
          expect(chart_data.ranges).toEqual(data_points.get_quartiles());
          expect(chart_data.measures).toEqual(data_points.get_last(5, 14957));
          return expect(chart_data.markers).toEqual([data_points.get_mean()]);
        });
        return it("should return all of the data ready to be put into the chart for a range", function() {
          var chart_data;
          chart_data = data_points.get_chart_data(14952, 14957);
          expect(chart_data.title).toEqual("Wikipedia Activity");
          expect(chart_data.subtitle).toEqual("subtitle");
          expect(chart_data.ranges).toEqual(data_points.get_quartiles(14952, 14957));
          expect(chart_data.measures).toEqual(data_points.get_last(5, 14957));
          return expect(chart_data.markers).toEqual([data_points.get_mean(14952, 14957)]);
        });
      });
    });
    return describe("NBSRadioGeo collection", function() {
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
  });

}).call(this);
