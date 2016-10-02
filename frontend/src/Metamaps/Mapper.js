/* global $ */

/*
 * Dependencies:
 *  Metamaps.DataModel
 */

const Mapper = {
  // this function is to retrieve a mapper JSON object from the database
  // @param id = the id of the mapper to retrieve
  get: function (id, callback) {
    $.ajax({
      url: `/users/${id}.json`,
      success: data => {
        callback(new Metamaps.DataModel.Mapper(data))
      }
    })
  }
}

export default Mapper
