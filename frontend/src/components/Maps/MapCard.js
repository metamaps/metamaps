import React, { Component, PropTypes } from 'react'
import { find, values } from 'lodash'

const IN_CONVERSATION = 1 // shared with /realtime/reducer.js

const MapperList = (props) => {
  return <ul className='mapperList'>
    <li className='live'>LIVE</li>
    { props.mappers.map(mapper => <li key={ mapper.id } ><img src={ mapper.avatar } /><span>{ mapper.username }</span></li>) }
  </ul>
}

class Menu extends Component {

  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  toggle = () => {
    this.setState({ open: !this.state.open })
    return true
  }

  render = () => {
    const { currentUser, map, onStar, onRequest } = this.props
    const style = { display: this.state.open ? 'block' : 'none' }

    return <div className='dropdownMenu'>
      <div className='menuToggle' onClick={ this.toggle }>
        <div className='circle'></div>
        <div className='circle'></div>
        <div className='circle'></div>
      </div>
      <ul className='menuItems' style={ style }>
        <li className='star' onClick={ () => { this.toggle() && onStar(map) }}>Star Map</li>
        { !map.authorizeToEdit(currentUser) && <li className='request' onClick={ () => { this.toggle() && onRequest(map) }}>Request Access</li> }
      </ul>
    </div>
  }
}
Menu.propTypes = {
  currentUser: PropTypes.object.isRequired,
  map: PropTypes.object.isRequired,
  onStar: PropTypes.func.isRequired,
  onRequest: PropTypes.func.isRequired
}

const Metadata = (props) => {
  const { map } = props
  return (<div>
    <div className="metadataSection numTopics">
      <div className="numTopicsIcon"></div>
      { map.get('topic_count') }<br/>
      { map.get('topic_count') === 1 ? 'topic' : 'topics' }
    </div>
    <div className="metadataSection numStars">
      <div className="numStarsIcon"></div>
      { map.get('star_count') }<br/>
      { map.get('star_count') === 1 ? 'star' : 'stars' }
    </div>
    <div className="metadataSection numSynapses">
      <div className="numSynapsesIcon"></div>
      { map.get('synapse_count') }<br/>
      { map.get('synapse_count') === 1 ? 'synapse' : 'synapses' }
    </div>
    <div className="metadataSection numContributors">
      <div className="numContributorsIcon"></div>
      { map.get('contributor_count') }<br/>
      { map.get('contributor_count') === 1 ? 'contributor' : 'contributors' }
    </div>
    <div className="clearfloat"></div>
  </div>)
}

const checkAndWrapInA = (shouldWrap, classString, mapId, element) => {
  if (shouldWrap) return <a className={ classString } href={ `/maps/${mapId}` } data-router="true">{ element }</a>
  else return element
}

class MapCard extends Component {
  render = () => {
    const { map, mobile, juntoState, currentUser, onRequest, onStar } = this.props

    const hasMap = juntoState.liveMaps[map.id]
    const hasConversation = hasMap && find(values(hasMap), v => v === IN_CONVERSATION)
    const hasMapper = hasMap && !hasConversation
    const mapperList = hasMap && Object.keys(hasMap).map(id => juntoState.connectedPeople[id])

    function capitalize (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }

    const n = map.get('name')
    const d = map.get('desc')

    const maxNameLength = 32
    const maxDescLength = 180
    const truncatedName = n ? (n.length > maxNameLength ? n.substring(0, maxNameLength) + '...' : n) : ''
    const truncatedDesc = d ? (d.length > maxDescLength ? d.substring(0, maxDescLength) + '...' : d) : ''
    const editPermission = map.authorizeToEdit(currentUser) ? 'canEdit' : 'cannotEdit'

    return (
      <div className="map" id={ map.id }>
        { checkAndWrapInA(mobile, '', map.id,
        <div className={ 'permission ' + editPermission }>
          <div className='mapCard'>
            <div className='mainContent'>
              { !mobile && <div className='mapScreenshot'>
                <img src={ map.get('screenshot_url') } />
              </div> }
              <div className='title' title={ map.get('name') }>
                <div className='innerTitle'>{ truncatedName }</div>
              </div>
              { mobile && hasMapper && <div className='mobileHasMapper'><MapperList mappers={ mapperList } /></div> }
              { mobile && hasConversation && <div className='mobileHasConversation'><MapperList mappers={ mapperList } /></div> }
              { mobile && d && <div className="desc">{ d }</div> }
              { mobile && <div className='mobileMetadata'><Metadata map={ map } /></div> }
              <div className='creatorAndPerm'>
                <img className='creatorImage' src={ map.get('user_image') } />
                <span className='creatorName'>{ map.get('user_name') }</span>
                { !map.authorizeToEdit(currentUser) && <div className='cardViewOnly'>View Only</div> }
              </div>
            </div>
            { !mobile && checkAndWrapInA(true, 'mapMetadata', map.id,
            <div>
              <Metadata map={ map } />
              <div className="scroll">
                <div className="desc">
                  { truncatedDesc }
                  <div className="clearfloat"></div>
                </div>
              </div>
            </div>) }
            { !mobile && hasMapper && <div className='mapHasMapper'><MapperList mappers={ mapperList } /></div> }
            { !mobile && hasConversation && <div className='mapHasConversation'><MapperList mappers={ mapperList } /></div> }
            { !mobile && currentUser && <Menu currentUser={ currentUser } map={ map } onStar= { onStar } onRequest={ onRequest } /> }
          </div>
        </div>) }
      </div>
    )
  }
}

MapCard.propTypes = {
  map: PropTypes.object.isRequired,
  mobile: PropTypes.bool.isRequired,
  juntoState: PropTypes.object,
  currentUser: PropTypes.object,
  onStar: PropTypes.func.isRequired,
  onRequest: PropTypes.func.isRequired
}

export default MapCard