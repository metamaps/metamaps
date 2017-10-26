const initialState = {
  colors: {
    background: '#344A58',
    synapses: {
      normal: '#888888',
      hover: '#888888',
      selected: '#FFFFFF'
    },
    topics: {
      selected: '#FFFFFF'
    },
    labels: {
      background: '#18202E',
      text: '#DDD'
    }
  }
}

export default function (state = initialState, action) {
  return state
}
