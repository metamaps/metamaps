const initialState = {
  dataForPresentation: {
    metacodes: {},
    mappers: {},
    synapses: {}
  },
  filters: {
    metacodes: [],
    mappers: [],
    synapses: []
  },
  visible: {
    metacodes: [],
    mappers: [],
    synapses: []
  }
}

export default function (state = initialState, action) {
  return state
}
