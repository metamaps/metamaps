// import {  } from '../actions'

export const mapStateToProps = (state, ownProps) => {
  return {
    map: ownProps.map,
    currentUser: ownProps.currentUser,
    openImportLightbox: ownProps.openImportLightbox,
    forkMap: ownProps.forkMap,
    canEditMap: ownProps.canEditMap,
    filterData: ownProps.filterData,
    allForFiltering: ownProps.allForFiltering,
    visibleForFiltering: ownProps.visibleForFiltering,
    toggleMetacode: ownProps.toggleMetacode,
    toggleMapper: ownProps.toggleMapper,
    toggleSynapse: ownProps.toggleSynapse,
    filterAllMetacodes: ownProps.filterAllMetacodes,
    filterAllMappers: ownProps.filterAllMappers,
    filterAllSynapses: ownProps.filterAllSynapses
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}
