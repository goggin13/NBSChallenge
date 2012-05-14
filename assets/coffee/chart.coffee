
window.Chart = Backbone.View.extend
  model: NBSArtist
  start_day: false
  end_day: false
  events: 
    'change input': 'update_pie_chart_url'
  
  initialize: ->
    _.bindAll @
    @slider = new DateSlider({on_stop: @update_chart})
    @chart_wrapper = ($ '<div id="chart_wrapper"/>')
    @chart_image = ($ "<img id='chart_image' src='' />")
    msg = 'No event data was found between these dates'
    @no_chart_data = ($ "<div class='chart_object'>#{msg}</div>").hide()
    @chart_wrapper.append(@chart_image).append(@no_chart_data)
    @model.get_events_data (events) => (@event_data = events)
    
  update_row: (row, data) ->
    _.find data, (d) -> row.title == d.title
  
  update_pie_chart_url: ->
    attribute = ($ 'input:checked').val()
    url = @event_data.to_charts_url(@start_day, @end_day, attribute)
    return if url == @chart_image.attr "src"
    @chart_image.hide()
    if url == null
      @no_chart_data.show()
    else
      @no_chart_data.hide()
      @chart_image.load => @chart_image.fadeIn()
      @chart_image.attr "src", url

  update_chart: (start_day, end_day) ->
    @start_day = start_day
    @end_day = end_day
    @model.get_chart_data 
      start_day: @start_day
      end_day: @end_day
      callback: (data) =>
        @update_pie_chart_url()
        @vis.datum((d) => @update_row d, data).call(chart)
        
  load_data: (data) ->
    @vis = d3.select("#chart").selectAll("svg")
        .data(data)
      .enter().append("svg")
        .attr("class", "bullet")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(#{margin.left},#{margin.top})")
        .call(chart);

    title = @vis.append("g")
        .attr("text-anchor", "end")
        .attr("transform", "translate(-6,#{(height - margin.top - margin.bottom) / 2})")

    title.append("text")
        .attr("class", "title")
        .text((d) -> d.title)

    title.append("text")
        .attr("class", "subtitle")
        .attr("dy", "1em")
        .text((d) -> d.subtitle)

    chart.duration(1000)
  
  init_graph: ->
    @model.get_chart_data 
      start_day: @start_day
      end_day: @end_day
      callback: (data) =>
        @load_data data
        ($ @el).append(@chart_wrapper)
               .append(@slider.render().el)
        @update_pie_chart_url()
            
  render: ->
    ($ @el).html "<div id='chart'></div>
                  <ul class='chart_options'>
                    <li><input type='radio' name='type' value='count' checked='checked'/>Count</li>
                    <li><input type='radio' name='type' value='weight' />Weight</li>
                    <li><input type='radio' name='type' value='freq' />Frequency</li>
                  </ul>"
    @