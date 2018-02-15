const Mouse = {
  didPan: false,
  didBoxZoom: false,
  changeInX: 0,
  changeInY: 0,
  edgeHoveringOver: false,
  boxStartCoordinates: false,
  boxEndCoordinates: false,
  synapseStartCoordinates: [],
  synapseEndCoordinates: null,
  lastNodeClick: 0,
  lastCanvasClick: 0,
  DOUBLE_CLICK_TOLERANCE: 300
}

export default Mouse
