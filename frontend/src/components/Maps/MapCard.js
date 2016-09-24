import React, { Component, PropTypes } from 'react'

class MapCard extends Component {
  render = () => {
    const { map, currentUser } = this.props
    
    function capitalize (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    const n = map.get('name')
    const d = map.get('desc')

    const maxNameLength = 32
    const maxDescLength = 118
    const truncatedName = n ? (n.length > maxNameLength ? n.substring(0, maxNameLength) + '...' : n) : ''
    const truncatedDesc = d ? (d.length > maxDescLength ? d.substring(0, maxDescLength) + '...' : d) : ''
    const editPermission = map.authorizeToEdit(currentUser) ? 'canEdit' : 'cannotEdit'
    
    return (
      <div className="map" id={ map.id }>
        <a href={ '/maps/' + map.id } data-router="true">
          <div className={ 'permission ' + editPermission }>
  	        <div className="mapCard">                                         
              <span className="title" title={ map.get('name') }>
                { truncatedName }
              </span>
              <div className="mapScreenshot">
                <img src={ map.get('screenshot_url') } />
              </div>
              <div className="scroll">
                <div className="desc">
                  { truncatedDesc }
                  <div className="clearfloat"></div>
                </div>
              </div>
              <div className="mapMetadata">
                <div className="metadataSection">
                  <span className="cCountColor">
                    { map.get('contributor_count') }
                  </span>
                  { map.get('contributor_count') === 1 ? ' contributor' : ' contributors' }
                </div>
                <div className="metadataSection">
                  <span className="tCountColor">
                    { map.get('topic_count') }
                  </span>
                  { map.get('topic_count') === 1 ? ' topic' : ' topics' }
                  </div> 
                <div className="metadataSection mapPermission">
                  { map.get('permission') ? capitalize(map.get('permission')) : 'Commons' }
                </div>
                <div className="metadataSection">
                  <span className="sCountColor">
                    { map.get('synapse_count') }
                  </span>
                  { map.get('synapse_count') === 1 ? ' synapse' : ' synapses' }
                </div>
                <div className="clearfloat"></div>
              </div>                                         
            </div>
          </div>
        </a>
      </div>
    )
  }
}

MapCard.propTypes = {
  map: PropTypes.object.isRequired,
  currentUser: PropTypes.object
}

export default MapCard
