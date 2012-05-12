
describe "NBSData", ->
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
      
      it "should return all of the data ready to be put into the chart", ->
        chart_data = data_points.get_chart_data()
        expect(chart_data.title).toEqual "Wikipedia Activity"
        expect(chart_data.subtitle).toEqual "subtitle"
        expect(chart_data.ranges).toEqual data_points.get_quartiles()
        expect(chart_data.measures).toEqual data_points.get_last(5, 14957)
        expect(chart_data.markers).toEqual [data_points.get_mean()]

      it "should return all of the data ready to be put into the chart for a range", ->
        chart_data = data_points.get_chart_data(14952, 14957)
        expect(chart_data.title).toEqual "Wikipedia Activity"
        expect(chart_data.subtitle).toEqual "subtitle"
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


