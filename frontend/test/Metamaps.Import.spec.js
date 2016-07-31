/* global describe, it */
const chai = require('chai')
const expect = chai.expect

const Metamaps = {}
require('../../app/assets/javascripts/src/Metamaps.Import')

describe('Metamaps.Import.js', function () {
  it('has a topic whitelist', function () {
    expect(Metamaps.Import.topicWhitelist).to.deep.equal(
      ['id', 'name', 'metacode', 'x', 'y', 'description', 'link', 'permission']
    )
  })
})
