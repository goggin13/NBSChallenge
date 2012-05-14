(function() {

  ($(document)).ready(function() {
    var $js_page, $php_page, MyRouter, router;
    $php_page = $('#php_challenge');
    $js_page = $('#js_challenge');
    MyRouter = Backbone.Router.extend({
      routes: {
        '': 'js_challenge',
        'index.html': 'js_challenge',
        'php': 'php_challenge',
        'js': 'js_challenge'
      },
      php_challenge: function() {
        return $js_page.fadeOut() && $php_page.fadeIn();
      },
      js_challenge: function() {
        var artist, chart;
        $php_page.fadeOut() && $js_page.fadeIn();
        if (this._js_initialized) return;
        artist = new NBSArtist({
          name: 'rihanna'
        });
        chart = new Chart({
          model: artist
        });
        $js_page.append(chart.render().el);
        chart.init_graph();
        return this._js_initialized = true;
      }
    });
    router = new MyRouter();
    Backbone.history.start();
    ($('a.push_nav')).click(function() {
      router.navigate(($(this)).attr('href'), {
        trigger: true
      });
      return false;
    });
    return ($('.controller h4')).click(function() {
      return ($(this)).parent().find('.action').toggle('slow');
    });
  });

}).call(this);
