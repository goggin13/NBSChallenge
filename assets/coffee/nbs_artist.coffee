
window.NBSArtist = Backbone.Model.extend
  
  get_name: -> (@get "name")
  
  get_chart_data: (callback) ->
    data = []
    
    n = @get_name()
    data_sets = [(new NBSFacebookData n),
                 (new NBSTwitterData n),
                 (new NBSWikipediaData n),
                 (new NBSVevoData n)]
    
    _.each data_sets, (data_set) ->
      data_set.fetch ->
        data.push data_set.get_chart_data()

    # data_points = new NBSTwitterData @get_name()
    # data_points.fetch ->
    #   data.push data_points.get_chart_data()
    #   
    # data_points = new NBSWikipediaData @get_name()
    # data_points.fetch ->
    #   data.push data_points.get_chart_data()
    # 
    # data_points = new NBSVevoData @get_name()
    # data_points.fetch ->
    #   data.push data_points.get_chart_data()

    callback data
