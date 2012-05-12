
window.Chart = Backbone.View.extend
  model: NBSArtist
  id: 'chart'
  
  initialize: ->
    @slider = new DateSlider({})
  
  init_graph: ->
    @model.get_chart_data (data) =>
      vis = d3.select("#chart").selectAll("svg")
          .data(data)
        .enter().append("svg")
          .attr("class", "bullet")
          .attr("width", width)
          .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(chart);

      title = vis.append("g")
          .attr("text-anchor", "end")
          .attr("transform", "translate(-6," + (height - margin.top - margin.bottom) / 2 + ")");

      title.append("text")
          .attr("class", "title")
          .text((d) -> d.title)

      title.append("text")
          .attr("class", "subtitle")
          .attr("dy", "1em")
          .text((d) -> d.subtitle);

      chart.duration(1000);
      @_initialized = true
      
      ($ @el).append @slider.render().el
    # window.transition = function() {
    #   vis.datum(randomize).call(chart);
    # };
    
  render: ->
    @