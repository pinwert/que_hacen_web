(function($,_){
  var template = ['<div class="searchWrap">',
    ' <form action="/search" method="get">',
    '   <input type="text" name="q" autocomplete="off"/>',
    ' </form>',
    '   <ul class="results"></ul>',
    '</div>'].join('\n');

  var templateul = ['<% _.each(datos, function(op){ %>',
    '<li><strong><%= op.text %></strong><ul>',
      '<% _.each(op.children, function(a){ %>',
        '<li><a href="<%= a.id %>"><%= a.text %></a></li>',
      '<% })%>',
    '</ul></li>',
    '<% })%>'].join('\n');
  
  var Searcher = function($wrapper) {

    this.$search = $(template);
    this.$ul = $('.results',this.$search);
    this.$input  = $('input[type="text"]',this.$search);
    this.val = '';
    this.busquedas = {};
    $wrapper.append(this.$search);
    this.show();

    var self = this;
    this.$input.on('keyup', function(key) {
      var $this = $(this),
          valor = $this.val();

      if(key.which === 27) {
        self.close();
      } else if( key.which === 40) {
        self.$ul.find('>li:first-child a').focus();
      } else {
        if(this.val !== valor) {
          this.val = valor;
          if(valor.length > 2) {
            self.search(valor);
          } else {
            self.$ul.empty();
          }
        }
      }
    });

    this.$ul.on('keydown', 'li a', function(event) {
      if(event.which === 27) {
        self.close();
      } 
      if(event.which === 13) {
        self.input.val( $(this).text());
        self.form.submit();
      }
      if(event.which === 40) {
        $(this).parent().next().find('a').focus();
      }
      if(event.which === 38) {
        ($(this).parent().prev().find('a')[0] || self.input).focus();
      }
      event.preventDefault();
    });
  };

  Searcher.prototype = {
    show: function () {
      this.$search.show(); 
      this.$input.focus();
    },
    close: function() {
      this.$ul.empty();
      this.$search.hide();
      this.$input.val('');
    },
    search: function(query) {
      var url = '/autocomplete?q=' + encodeURIComponent(query), 
          self = this;

      this.$ul.empty();
      if(query in this.busquedas) {
          self.$ul.html(_.template(templateul)({datos:this.busquedas[query]}));
      } else {
        $.get(url, function(data) {
          try {
            data = $.parseJSON(data) || data;
          } catch(error) {
          }
          self.$ul.html(_.template(templateul)({datos:data}));
          self.busquedas[query] = data;
        });
      }
    }
  };

  var searcher = null;
   $('#buscHeader input').on('focus', function(e) {
    e.preventDefault();
    if(searcher) {
      searcher.show();
    } else {
        searcher = new Searcher($('body'));
    }
  });
})($,_);