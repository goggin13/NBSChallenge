
##################################################
# Individual Data Points
##################################################
window.NBSDataPoint = Backbone.Model.extend
  get_day: -> parseInt (@get "day"), 10
  get_data: -> parseInt (@get "data"), 10
  
window.NBSGeoPoint = Backbone.Model.extend
  get_country: -> (@get "country")
  get_data: -> (@get "data")

window.NBSEventDataPoint = Backbone.Model.extend
  get_day: -> parseInt (@get "day"), 10
  get_data: -> (@get "data")
  get_events: -> _.map @get_data(), (v, key) -> v
    
##################################################
# Data Collections
##################################################

# Parent collection, simple parsing functions and override
# Backbone's native fetch function to get the provided JSON
window.NBSData = Backbone.Collection.extend
  model: NBSDataPoint
  
  init: (spec) ->
    @reset()
    @artist = spec.artist
    @data_type = spec.data_type

  range: (d1, d2) ->
    return @ unless d1 && d2
    (throw "invalid range #{d1} -> #{d2}") unless (d2 - d1) >= 4
    @filter (data) -> (day = data.get_day()) && (day >= d1) && (day <= d2)

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
    
    
window.NBSEventsData = window.NBSData.extend
  model: NBSEventDataPoint
  initialize: (artist) -> (@init artist: artist, data_type: 'events')
  formatted_data: -> @raw_json().data
  
  aggregate: (start_day, end_day) ->
    collect = (acc, day) ->
      _.each day.get_events(), (event) ->
        event.name = event.name.replace("&amp;", "and")
        acc[event.name] = {count: 0, weight: 0, freq: 0} unless acc[event.name]
        acc[event.name].count += event.count
        acc[event.name].weight += event.weight
        acc[event.name].freq += 1
      acc
    @range(start_day, end_day).reduce collect, {}
  
  # attribute is one of [freq, count, weight]
  to_charts_url: (start_day, end_day, attribute) ->
    base = "https://chart.googleapis.com/chart?cht=p&chs=550x250&chd=t:"
    values = []
    labels = []
    _.each @aggregate(start_day, end_day), (event_data, key) ->
      values.push event_data[attribute]
      labels.push key
    
    if values.length > 0 
      "#{base}#{values.join(',')}&chl=#{labels.join('|')}"
    else
      null
  
window.NBSRadioGeoData = window.NBSData.extend
  model: NBSGeoPoint
  formatted_data: -> (@parse_to_key 'values', @raw_json().data)  
  add_model: (k, data) ->
    @add (new @model country: k, data: data)
  initialize: (artist) -> (@init artist: artist, data_type: 'radio_geo')
  

# Data which relies on parsing down to the 'global' key from the raw JSON
window.NBSGlobalData = window.NBSData.extend
  formatted_data: -> (@parse_to_key 'global', @raw_json().data)
  
  round: (n, places) ->
    (Math.round n * Math.pow(10, places)) / Math.pow(10, places)
  
  get_mean: (start_day, end_day) ->
    range = @range(start_day, end_day)
    total = range.reduce ((sum, data) -> sum + data.get_data()), 0
    @round (total / range.length), 4
  
  get_last: (n, end_day) ->
    day = end_day - n + 1
    data = []
    while (day <= end_day)
      data_point = @find (d) -> d.get_day() == day
      data.push (if data_point then data_point.get_data() else 0)
      day += 1

    data
  
  median: (values) ->
    half = Math.floor(values.length/2)
    if (values.length % 2)
      values[half]
    else
      (values[half-1] + values[half]) / 2.0
  
  # [min, 1'st quartile, mode, 2'nd quartile, max]
  # Find the median, choosing either the middle value in an odd length set,
  # or the average of the two middle values in an even length set.  Calculate
  # 1'st quartile and 3'rd quartile by finding the median of the top and bottom 
  # halfs of the data, including the median value in both iff the set is odd length.
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
  
  # Data in the format required by the bullet chart
  get_chart_data: (start_day, end_day) ->
    title: @title
    subtitle: ""
    ranges: @get_quartiles(start_day, end_day)
    measures: @get_last(5, end_day || @at(@length - 1).get_day())
    markers: [@get_mean(start_day, end_day)]

window.NBSTwitterData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'twitter')
  title: "Twitter"

window.NBSFacebookData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'facebook')
  title: "Facebook"
  
window.NBSVevoData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'vevo')
  title: "Vevo"
  
window.NBSWikipediaData = window.NBSGlobalData.extend
  initialize: (artist) -> (@init artist: artist, data_type: 'wikipedia')
  title: "Wikipedia"
  