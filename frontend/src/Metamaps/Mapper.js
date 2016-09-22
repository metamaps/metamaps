import Backbone from './Backbone'

const Mapper = {
  // this function is to retrieve a mapper JSON object from the database
  // @param id = the id of the mapper to retrieve
  get: function (id, callback) {
    return fetch(`/users/${id}.json`, {
    }).then(response => {
      if (!response.ok) throw response
      return response.json()
    }).then(payload => {
      callback(new Backbone.Mapper(payload))
    })
  }
}

export default Mapper
