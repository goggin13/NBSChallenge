
window.NBSArtist = Backbone.Model.extend
  
  get_name: -> (@get "name")
  
  # Options should include
  #  callback -> callback function when data is ready
  #  start_day
  #  end_day -> both optional, to range the returned data
  get_chart_data: (options) ->
    n = @get_name()
    data_sets = [(new NBSFacebookData n),
                 (new NBSTwitterData n),
                 (new NBSWikipediaData n),
                 (new NBSVevoData n)]
    
    data = []
    _.each data_sets, (data_set) -> data_set.fetch ->
        data.push data_set.get_chart_data(options.start_day, options.end_day)
    
    options.callback data
  
  get_events_data: (callback) -> 
    events = new NBSEventsData @get_name()
    events.fetch -> (callback events)
  