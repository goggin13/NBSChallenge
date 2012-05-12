

window.DateSlider = Backbone.View.extend
  class: 'date_slider'
  
  render: -> 
    ($ @el).slider()
    @