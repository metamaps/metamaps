window.Metamaps = window.Metamaps || {}
/* global Metamaps, $ */

/*
 * Metamaps.Mapper.js.erb
 *
 * Dependencies: none!
 */

Metamaps.Mapper = {
  // this function is to retrieve a mapper JSON object from the database
  // @param id = the id of the mapper to retrieve
  get: function (id, callback) {
    return $.ajax({
      url: '/users/' + id + '.json',
      success: function (data) {
        callback(new Metamaps.Backbone.Mapper(data))
      }
    })
  }
}; // end Metamaps.Mapper
