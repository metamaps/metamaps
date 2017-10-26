// import {  } from '../actions'

export const mapStateToProps = (state, ownProps) => {
  return {
    mapIsStarred: ownProps.mapIsStarred,
    currentUser: ownProps.currentUser,
    map: ownProps.map,
    onInfoClick: ownProps.toggleMapInfoBox,
    onMapStar: ownProps.onMapStar,
    onMapUnstar: ownProps.onMapUnstar,
    onHelpClick: ownProps.openHelpLightbox,
    infoBoxHtml: ownProps.infoBoxHtml
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}
