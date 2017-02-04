const Mouse = {
  didPan: false,
  didBoxZoom: false,
  changeInX: 0,
  changeInY: 0,
  edgeHoveringOver: false,
  boxStartCoordinates: false,
  boxEndCoordinates: false,
  focusNodeCoords: null,
  newNodeCoords: { x: 100, y: 0 },
  synapseStartCoordinates: [],
  synapseEndCoordinates: null,
  lastNodeClick: 0,
  lastCanvasClick: 0,
  DOUBLE_CLICK_TOLERANCE: 501
}

export default Mouse
