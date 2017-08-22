/* global describe, it */

import { expect } from 'chai'
import outdent from 'outdent'

import XMLParser from '../../src/MetamapsXMLParser'

describe('Metamaps.XMLParser.js', function() {
  describe('parseSchema', function() {
    it('View:Projection nodes', function() {
      const xml = outdent`
      <?xml version="1.0" encoding="UTF-8"?>
      <View:ColumnView name="ZPalletToBoxes">
        <viewNode xsi:type="View:Projection" name="NTREE_DATA">
          <element name="MANDT">
            <inlineType primitiveType="NVARCHAR" length="3" precision="3" scale="0"/>
          </element>
        </viewNode>
      </View:ColumnView>`
      { topics, synapses } = XMLParser.parseSchema(xml)
      expect(topics[0].name).to.equal("MANDT")
      expect(topics[0].metacode).to.equal("Wildcard")

      expect(synapses.length).to.equal(0)
    })

    it('lays nodes out correctly', function() {
      const xml = outdent`
      <?xml version="1.0" encoding="UTF-8"?>
      <View:ColumnView name="ZPalletToBoxes">
        <viewNode xsi:type="View:Projection" name="NTREE_DATA">
          <element name="MANDT">
            <inlineType primitiveType="NVARCHAR" length="3" precision="3" scale="0"/>
          </element>
          <layout xCoordinate="176" yCoordinate="569" width="-1" height="-1" expanded="true"/>
        </viewNode>
      </View:ColumnView>`
      { topics, synapses } = XMLParser.parseSchema(xml)
      expect(topics[0].x).to.equal(176)
      expect(topics[0].y).to.equal(569)
    })
  })
})
