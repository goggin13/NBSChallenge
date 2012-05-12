
($ document).ready ->
  
  $php_page = ($ '#php_challenge')
  $js_page = ($ '#js_challenge')
  
  MyRouter = Backbone.Router.extend
    routes:
      '': 'js_challenge'
      'index.html': 'js_challenge'
      'php': 'php_challenge'
      'js': 'js_challenge'
  
    php_challenge: -> $js_page.fadeOut() && $php_page.fadeIn()
    
    js_challenge: ->
      $php_page.fadeOut() && $js_page.fadeIn()
      artist = new NBSArtist name: 'rihanna'
      chart = new Chart model: artist
      $js_page.append chart.render().el
      chart.init_graph()
      
  router = new MyRouter()
  Backbone.history.start()
  
  ($ 'a.push_nav').click ->
    router.navigate ($ this).attr('href'), {trigger: true}
    false
    
  ($ '.controller h4').click -> 
    ($ this).parent().find('.action').toggle('slow')