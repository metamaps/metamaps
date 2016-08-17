/* global Metamaps, $, Hogan, Backbone */

/*
 * Metamaps.Views.js.erb
 *
 * Dependencies:
 *  - Metamaps.Famous
 *  - Metamaps.Loading
 */

Metamaps.Views = {
  initialized: false
}

Metamaps.Views.init = function () {
  Metamaps.Views.MapperCard = Backbone.View.extend({
    template: Hogan.compile($('#mapperCardTemplate').html()),

    tagName: 'div',

    className: 'mapper',

    render: function () {
      this.$el.html(this.template.render(this.model))
      return this
    }
  })

  Metamaps.Views.MapCard = Backbone.View.extend({
    template: Hogan.compile($('#mapCardTemplate').html()),

    tagName: 'div',

    className: 'map',

    id: function () {
      return this.model.id
    },

    initialize: function () {
      this.listenTo(this.model, 'change', this.render)
    },

    render: function () {
      this.$el.html(this.template.render(this.model.attrForCards()))
      return this
    }

  })

  var MapsWrapper = Backbone.View.extend({
    initialize: function (opts) {},
    setCollection: function (collection) {
      if (this.collection) this.stopListening(this.collection)
      this.collection = collection
      this.listenTo(this.collection, 'add', this.render)
      this.listenTo(this.collection, 'successOnFetch', this.handleSuccess)
      this.listenTo(this.collection, 'errorOnFetch', this.handleError)
    },
    render: function (mapperObj, cb) {
      var that = this

      if (typeof mapperObj === 'function') {
        cb = mapperObj
        mapperObj = null
      }

      this.el.innerHTML = ''

      // in case it is a page where we have to display the mapper card
      if (mapperObj) {
        var view = new Metamaps.Views.MapperCard({ model: mapperObj })

        that.el.appendChild(view.render().el)
      }

      this.collection.each(function (map) {
        var view = new Metamaps.Views.MapCard({ model: map })

        that.el.appendChild(view.render().el)
      })
      this.$el.append('<div class="clearfloat"></div>')
      
      if (this.collection.length >= 20 && this.collection.page != "loadedAll") {
        this.$el.append('<button class="button loadMore">load more</button>')
        this.$el.append('<div class="clearfloat"></div>')
      }
      
      $('#exploreMaps').empty().html(this.el) 
      this.$el.find('.loadMore').click(that.loadMore.bind(that))
      if (cb) cb()
      Metamaps.Loading.hide()
    },
    loadMore: function () {
      if (this.collection.page != "loadedAll") {
        this.collection.getMaps();
      }
      else {
        this.$el.find('.loadMore').hide()
      }
    },
    handleSuccess: function (cb) {
      if (this.collection && this.collection.id === 'mapper') {
        this.fetchUserThenRender(cb)
      } else {
        this.render(cb)
      }
    },
    handleError: function () {
      console.log('error loading maps!') // TODO
    },
    fetchUserThenRender: function (cb) {
      var that = this
      // first load the mapper object and then call the render function
      $.ajax({
        url: '/users/' + this.collection.mapperId + '/details.json',
        success: function (response) {
          that.render(response, cb)
        },
        error: function () {
          that.render(cb)
        }
      })
    }
  })

  Metamaps.Views.exploreMaps = new MapsWrapper()
}
