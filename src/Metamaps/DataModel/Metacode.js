import Backbone from 'backbone'
try { Backbone.$ = window.$ } catch (err) {}
import outdent from 'outdent'

const Metacode = Backbone.Model.extend({
  initialize: function() {
    var image = new window.Image()
    image.crossOrigin = 'Anonymous'
    image.src = this.get('icon')
    this.set('image', image)
  },
  prepareDataForFilter: function() {
    return {
      id: this.id,
      name: this.get('name'),
      icon: this.get('icon')
    }
  }
})

export default Metacode
