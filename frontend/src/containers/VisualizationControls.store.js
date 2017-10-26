// import {  } from '../actions'

export const mapStateToProps = (state, ownProps) => {
  return {
    topic: ownProps.topic,
    map: ownProps.map,
    onClickZoomExtents: ownProps.onZoomExtents,
    onClickZoomIn: ownProps.onZoomIn,
    onClickZoomOut: ownProps.onZoomOut
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}
