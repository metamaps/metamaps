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
    const maxDescLength = 236
    const truncatedName = n ? (n.length > maxNameLength ? n.substring(0, maxNameLength) + '...' : n) : ''
    const truncatedDesc = d ? (d.length > maxDescLength ? d.substring(0, maxDescLength) + '...' : d) : ''
    const editPermission = map.authorizeToEdit(currentUser) ? 'canEdit' : 'cannotEdit'

    return (
      <div className="map" id={ map.id }>
        <a href={ '/maps/' + map.id } data-router="true">
          <div className={ 'permission ' + editPermission }>
            <div className='mapCard'>
              <div className='mainContent'>
                <div className='mapScreenshot'>
                  <img src={ map.get('screenshot_url') } />
                </div>
                <div className='title' title={ map.get('name') }>
                  <div className='innerTitle'>{ truncatedName }</div>
                </div>
                <div className='creatorAndPerm'>
                  <img className='creatorImage' src={ map.get('user_image') } />  
                  <span className='creatorName'>{ map.get('user_name') }</span>
                </div>
              </div>
              <div className="mapMetadata">
                <div className="metadataSection numContributors">
                  { map.get('contributor_count') }<br/>
                  { map.get('contributor_count') === 1 ? 'contributor' : 'contributors' }
                </div>
                <div className="metadataSection numTopics">
                  { map.get('topic_count') }<br/>
                  { map.get('topic_count') === 1 ? 'topic' : 'topics' }
                </div>
                <div className="metadataSection numStars">
                  { map.get('star_count') }<br/>
                  { map.get('star_count') === 1 ? 'star' : 'stars' }
                </div>
                <div className="metadataSection numSynapses">
                  { map.get('synapse_count') }<br/>
                  { map.get('synapse_count') === 1 ? 'synapse' : 'synapses' }
                </div>
                <div className="clearfloat"></div>
                <div className="scroll">
                  <div className="desc">
                    { truncatedDesc }
                    <div className="clearfloat"></div>
                  </div>
                </div>
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
