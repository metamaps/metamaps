import Backbone from 'backbone'
Backbone.$ = window.$
import outdent from 'outdent'

const Metacode = Backbone.Model.extend({
  initialize: function () {
    var image = new Image()
    image.crossOrigin = 'Anonymous'
    image.src = this.get('icon')
    this.set('image', image)
  },
  prepareLiForFilter: function () {
    return outdent`
      <li data-id="${this.id}">
        <img src="${this.get('icon')}" data-id="${this.id}" alt="${this.get('name')}" />
        <p>${this.get('name').toLowerCase()}</p>
      </li>`
  }
})

export default Metacode
