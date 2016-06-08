var chai = require('chai')
var expect = chai.expect

Metamaps = {}
Metamaps.Import = require('../src/Metamaps.Import')

describe('Metamaps.Import.js', function() {
  it('has a topic whitelist', function() {
    expect(Metamaps.Import.topicWhitelist).to.deep.equal(
      ['id', 'name', 'metacode', 'x', 'y', 'description', 'link', 'permission']
    )
  })
})
