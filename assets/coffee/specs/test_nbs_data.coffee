
describe "NBSData Objects", ->
  fetched = null
  
  beforeEach ->
    fetched = false
    
  describe "NBSGlobalData collections", ->
    
    it "should return NBSDataPoint objects", ->
      data_points = new NBSFacebookData "rihanna"
      data_points.fetch (models, resp) ->
        expect(models[0] instanceof NBSDataPoint).toBeTruthy()
        expect(models[0].get_day()).toEqual 14951
        expect(models[0].get_data()).toEqual 18414108
        fetched = true
      waitsFor (-> fetched), "Facebook API call to return", 1000
    
    it "should retrieve facebook data points", ->
      data_points = new NBSFacebookData "rihanna"
      data_points.fetch (models, resp) ->
        expect(data_points.length).toEqual(349)
        fetched = true
      waitsFor (-> fetched), "Facebook API call to return", 1000

    it "should retrieve twitter data points", ->
      data_points = new NBSTwitterData "rihanna"
      data_points.fetch (models, resp) ->
        expect(data_points.length).toEqual(352)
        fetched = true
      waitsFor (-> fetched), "Twitter API call to return", 1000
      
    it "should retrieve vevo data points", ->
      data_points = new NBSVevoData "rihanna"
      data_points.fetch (models, resp) ->
        expect(data_points.length).toEqual(354)
        fetched = true
      waitsFor (-> fetched), "Vevo API call to return", 1000

    it "should retrieve wikipedia data points", ->
      data_points = new NBSWikipediaData "rihanna"
      data_points.fetch (models, resp) ->
        expect(data_points.length).toEqual(356)
        fetched = true
      waitsFor (-> fetched), "Wikipedia API call to return", 1000
    
    describe "range", ->
      data_points = null
      
      beforeEach ->
        data_points = new NBSWikipediaData "rihanna"
        data_points.fetch (models, resp) ->
          fetched = true
        waitsFor (-> fetched), "Wikipedia API call to return", 1000
    
      
      it "should return the whole collection if start or end date is missing", ->
        expect(data_points.range(null, 14954)).toEqual data_points
        expect(data_points.range(14954)).toEqual data_points
        expect(data_points.range()).toEqual data_points
        
      it "should throw an error if a range less than 5 days is requested", ->
        err = new Error("invalid range 14954 -> 14957")
        expect(-> data_points.range(14954, 14957)).toThrow(err)
    
      it "should return data points in the requested range", ->
        expect(data_points.range(14951, 14960).length).toEqual 10
    
    describe "statistics", ->
      data_points = null
      
      set_data = ->
        window.rihanna_wikipedia_data = data: global:
          "14951": 4
          "14952": 5
          "14953": 9
          "14954": 8
          "14955": 2
          "14956": 4
          "14957": 6
      
      beforeEach ->
        set_data()
        data_points = new NBSWikipediaData "rihanna"
        data_points.fetch (models, resp) ->
          expect(data_points.length).toEqual(7)
          fetched = true
        waitsFor (-> fetched), "Wikipedia API call to return", 1000
        
      it "should calculate the mean", ->
        expect(data_points.get_mean()).toEqual(5.4286)
      
      it "should calculate the mean of a range", ->
        expect(data_points.get_mean(14952, 14956)).toEqual(5.6)
      
      it "should calculate the quartiles", ->
        quartiles = data_points.get_quartiles()
        expect(quartiles[0]).toEqual 2 # min
        expect(quartiles[1]).toEqual 4 # 1'st
        expect(quartiles[2]).toEqual 5 # median
        expect(quartiles[3]).toEqual 7 # 3'rd
        expect(quartiles[4]).toEqual 9 # max

      it "should calculate the quartiles of a range", ->
        quartiles = data_points.get_quartiles(14952, 14957)
        expect(quartiles[0]).toEqual 2 # min
        expect(quartiles[1]).toEqual 4 # 1'st
        expect(quartiles[2]).toEqual 5.5 # median
        expect(quartiles[3]).toEqual 8 # 3'rd
        expect(quartiles[4]).toEqual 9 # max
        
      it "should return data from the last n days", ->
        expect(data_points.get_last(5, 14957)).toEqual [9, 8, 2, 4, 6]
      
      it "should fill in zeros if data isn't available on a day", ->
        expect(data_points.get_last(5, 14954)).toEqual [0, 4, 5, 9, 8]      
      
      it "should return all of the data ready to be put into the chart", ->
        chart_data = data_points.get_chart_data()
        expect(chart_data.title).toEqual "Wikipedia"
        expect(chart_data.ranges).toEqual data_points.get_quartiles()
        expect(chart_data.measures).toEqual data_points.get_last(5, 14957)
        expect(chart_data.markers).toEqual [data_points.get_mean()]

      it "should return all of the data ready to be put into the chart for a range", ->
        chart_data = data_points.get_chart_data(14952, 14957)
        expect(chart_data.title).toEqual "Wikipedia"
        expect(chart_data.ranges).toEqual data_points.get_quartiles(14952, 14957)
        expect(chart_data.measures).toEqual data_points.get_last(5, 14957)
        expect(chart_data.markers).toEqual [data_points.get_mean(14952, 14957)]
      
  describe "NBSRadioGeo collection", ->
    
    it "should return NBSGeoPoint objects", ->
      data_points = new NBSRadioGeoData "rihanna"
      data_points.fetch (models, resp) ->
        expect(models[0] instanceof NBSGeoPoint).toBeTruthy()
        expect(models[0].get_country()).toEqual "SZ"
        expect(models[0].get_data()['15218']).toEqual 7
        fetched = true
      waitsFor (-> fetched), "Facebook API call to return", 1000    
    
    it "should retrieve a set of countrys with associated data points", ->
      data_points = new NBSRadioGeoData "rihanna"
      data_points.fetch (models, resp) ->
        expect(data_points.length).toEqual(4)
        data_points[0]
        fetched = true
      waitsFor (-> fetched), "Radio geo API call to return", 1000  
  
  describe "NBSEventsData", ->
    event_data = null
    data_points = null
    
    beforeEach ->
      data_points = new NBSEventsData "rihanna"
      data_points.fetch (models, resp) ->
        event_data = models[0]
        fetched = true
      waitsFor (-> fetched), "Event API call to return", 1000
      
    it "should return NBSEventData objects", ->
      expect(data_points.at(0) instanceof NBSEventDataPoint).toBeTruthy()
      expect(data_points.length).toEqual 110
    
    it "should return NBSEventData objects by range", -> 
      expect(data_points.range(15201, 15205).length).toEqual 5
          
    it "should return aggregate event data", ->
      agg = data_points.aggregate()
      count = 0
      weight = 0
      freq = 0
      _.each window.rihanna_events_data.data, (value, key) ->
        _.each value, (v) ->
          if v.name == "Post"
            count += v.count
            weight += v.weight
            freq += 1
      expect(agg["Post"].freq).toEqual freq
      expect(agg["Post"].count).toEqual count
      expect(agg["Post"].weight).toEqual weight
    
    it "should return aggregate event data by range", ->
      agg = data_points.aggregate(15201, 15205)
      count = 0
      weight = 0
      freq = 0
      _.each window.rihanna_events_data.data, (value, key) ->
        _.each value, (v) ->
          if v.name == "Concert" && (parseInt(key) >= 15201) && (parseInt(key) <= 15205)
            count += v.count
            weight += v.weight
            freq += 1
      expect(agg["Concert"].freq).toEqual freq
      expect(agg["Concert"].count).toEqual count
      expect(agg["Concert"].weight).toEqual weight
    
    describe "to_charts_url", ->
    
      it "should return a google pie chart url by range", ->
        agg = data_points.aggregate(15201, 15205)
        count = 0
        _.each window.rihanna_events_data.data, (value, key) ->
          _.each value, (v) ->
            if v.name == "Concert" && (parseInt(key) >= 15201) && (parseInt(key) <= 15205)
              count += v.count
        url = data_points.to_charts_url(15201, 15205, "count")
        expect(url).toMatch /https:\/\/chart.googleapis.com\/chart\?cht=p&chs=550x250&chd=t:/
        expect(url).toMatch ",#{count}"

      it "should return null if there are no events", ->
        expect(data_points.to_charts_url(15101, 15105, "count")).toBeNull()

    describe "NBSEventData objects", ->

      it "should return the day as an int", ->
        expect(event_data.get_day()).toEqual 15200
      
      it "should return an array of events hashes", ->
        day_1_events = [
          {count: 42, name: "Chart Appearance", weight: 5, id: 1},
          {count: 14, name: "News and Blog Mention", weight: 9, id: 3}
        ]
        expect(event_data.get_events()).toEqual day_1_events

  describe "NBSArtist", ->
    artist = null
    
    beforeEach ->
      artist = new NBSArtist name: "rihanna"
    
    it "should have a function to retrieve all the chart data", ->
      artist.get_chart_data callback: (data) ->
        expect(data[0].title).toEqual "Facebook"
        expect(data[3].title).toEqual "Vevo"
        fetched = true
      waitsFor (-> fetched), "get_chart_data to return", 1000 

    it "should have a function to retrieve ranged chart data", ->
      artist.get_chart_data 
        start_day: 15020
        end_day: 15025
        callback: (data) ->
          # (24527055 + 24631334 + 24718735 + 24806539 + 24896752 + 24988381) / 6
          expect(data[0].markers).toEqual [24761466]
          fetched = true
      waitsFor (-> fetched), "get_chart_data to return", 1000
      
 