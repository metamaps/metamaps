/* global describe, it */

import { expect } from 'chai'

import Import from '../../src/Metamaps/Import.js'

describe('Metamaps.Import.js', function() {
  it('has a topic whitelist', function() {
    expect(Import.topicWhitelist).to.deep.equal(
      ['id', 'name', 'metacode', 'x', 'y', 'description', 'link', 'permission']
    )
  })
})
