

window.NBSDataPoint = Backbone.Model.extend
  get_day: -> parseInt (@get "day"), 10
  get_data: -> parseInt (@get "data"), 10
  
window.NBSGeoPoint = Backbone.Model.extend
  get_country: -> (@get "country")
  get_data: -> (@get "data")

window.NBSData = Backbone.Collection.extend
  model: NBSDataPoint
  
  init: (spec) ->
    @reset()
    @artist = spec.artist
    @data_type = spec.data_type

  raw_json: -> (eval "window.#{@artist}_#{@data_type}_data")

  parse_to_key: (key, data) ->
    return data[key] if data[key] != undefined
    @parse_to_key key, data[Object.keys(data)[0]]
  
  add_model: (k, data) ->
    @add (new @model(day: k, data: data))
    
  fetch: (callback) ->
    @reset()
    _.each @formatted_data(), (d, key) => (@add_model key, d)
    callback(@models)
    
  
window.NBSValuesData = window.NBSData.extend
  formatted_data: -> (@parse_to_key 'values', @raw_json().data)

window.NBSRadioGeoData = window.NBSValuesData.extend
  model: NBSGeoPoint
  add_model: (k, data) ->
    @add (new @model country: k, data: data)
  initialize: (artist) -> (@init artist: artist, data_type: 'radio_geo')
  

window.NBSGlobalData = window.NBSData.extend
  formatted_data: -> (@parse_to_key 'global', @raw_json().data)
  
  round: (n, places) ->
    (Math.round n * Math.pow(10, places)) / Math.pow(10, places)
  
  range: (start_day, end_day) ->
    if start_day && end_day
      unless (end_day - start_day) >= 4
        throw "invalid range #{start_day} -> #{end_day}"
      @filter (data) ->
        day = data.get_day()
        (day >= start_day) && (day <= end_day)
    else 
      @

  get_mean: (start_day, end_day) ->
    range = @range(start_day, end_day)
    total = range.reduce ((sum, data) -> sum + data.get_data()), 0
    @round (total / range.length), 4
  
  get_last: (n, end_day) ->
    @range(end_day - n + 1, end_day).map((d) -> d.get_data())
  
  median: (values) ->
    half = Math.floor(values.length/2)
    if (values.length % 2)
      values[half]
    else
      (values[half-1] + values[half]) / 2.0
  
  # [min, 1'st quartile, mode, 2'nd quartile, max]
  get_quartiles: (start_day, end_day) ->
    sorted = @range(start_day, end_day)
               .map((d) -> d.get_data())
               .sort((a,b) -> a - b)
    
    len = sorted.length
    even = midway % (Math.round midway) == 0
    midway = Math.round(len / 2.0)
    
    bottom_half = sorted.slice(0, midway)
    if len % 2 == 0
      top_half = sorted.slice(midway)
    else
      top_half = sorted.slice(midway - 1)
      
    [sorted[0], 
     (@median bottom_half), 
     (@median sorted), 
     (@median top_half), 
     sorted[len - 1]]
  
  get_chart_data: (start_day, end_day) ->
    title: @title
    subtitle: "subtitle"
    ranges: @get_quartiles(start_day, end_day)
    measures: @get_last(5, end_day || @at(@length - 1).get_day())
    markers: [@get_mean(start_day, end_day)]
  
window.NBSTwitterData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'twitter')
  title: "Twitter Activity"

window.NBSFacebookData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'facebook')
  title: "Facebook Activity"
  
window.NBSVevoData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'vevo')
  title: "Vevo Activity"
  
window.NBSWikipediaData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'wikipedia')
  title: "Wikipedia Activity"
  