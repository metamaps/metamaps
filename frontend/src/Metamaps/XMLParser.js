import parseXML from 'xml-parser'

const XMLParser = {
  parseSchema = (text) => {
    // see format of data at https://www.npmjs.com/package/xml-parser
    const data = parseXML(text)

    // TODO algorithm to transform `data` to `returnValue`

    // TODO this is the output format, but we still need to fill it in with real data
    const returnValue = {
      topics: [],
      synapses: []
    }
  }
}

export default XMLParser
