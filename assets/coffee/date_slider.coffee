
window.format_nbs_date = (d) ->
  d = d * 86400 * 1000
  date = new Date(d)
  "#{date.getMonth() + 1} / #{date.getDate()} / #{date.getFullYear()}"
  
window.DateSlider = Backbone.View.extend
  class: 'date_slider'
  min: 14952
  max: 15307
  on_slide: null
  on_stop: null
  
  initialize: ->
    _.bindAll @
    @start_day_label = ($ "<div class='left' />")
    @end_day_label = ($ "<div class='right' />")
    @on_slide = @options.on_slide
    @on_stop = @options.on_stop
  
  update_legend: (end_day) ->
    day = end_day - 4
    ($ '.legend .measure').each ->
      ($ this).text (format_nbs_date day)
      day += 1  
  
  set_labels: (day_1, day_2) ->
    @start_day_label.text (format_nbs_date day_1)
    @end_day_label.text (format_nbs_date day_2)
    @update_legend day_2
    
  _on_slide: (event, ui) ->
    if ui.values[1] - ui.values[0] < 4
      return false
    @set_labels ui.values[0], ui.values[1]
    (@on_slide ui.values[0], ui.values[1]) if @on_slide
    
  _on_stop: (event, ui) ->
    (@on_stop ui.values[0], ui.values[1]) if @_on_stop
  
  render: -> 
    ($ @el).slider
      range: true
      min: @min
      max: @max
      values: [@min, @max]
      slide: @_on_slide
      stop: @_on_stop
      
    ($ @el).append('<div class="clear" />')
           .append(@end_day_label)
           .append(@start_day_label)
    @set_labels @min, @max
    @