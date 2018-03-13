import React, { Component } from 'react'
import PropTypes from 'prop-types'

class MapInfoBox extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    map: PropTypes.object
  }

  createContributorList = () => {
    const { currentUser, map } = this.props
    var relevantPeople = [] // TODO: map.get('permission') === 'commons' ? DataModel.Mappers : DataModel.Collaborators
    var activeMapperIsCreator = currentUser && currentUser.id === map.get('user_id')
    return (
      <div>
        <ul>
          {relevantPeople.map((m) => {
            var isCreator = map.get('user_id') === m.get('id')
            return (
              <li>
                <a href={`/explore/mapper/${m.get('id')}`}>
                  <img className="rtUserImage" width="25" height="25" src={m.get('image')} />
                  {m.get('name')}
                  {isCreator && ' (creator)'}
                </a>
                {activeMapperIsCreator && !isCreator && <span className="removeCollaborator" data-id={m.get('id')}></span>}
              </li>
            )
          })}
        </ul>
        {activeMapperIsCreator && <div className="collabSearchField">
          <span className="addCollab"></span>
          <input className="collaboratorSearchField" placeholder="Add a collaborator" />
        </div>}
      </div>
    )
  }

  render = () => {
    const { currentUser, map } = this.props
    if (!map) return null
    const permission = map.get('permission')
    const topic_count = map.get('topic_count')
    const synapse_count = map.get('synapse_count')
    const isCreator = map.authorizePermissionChange(currentUser)
    const canEdit = map.authorizeToEdit(currentUser)
    const relevantPeople = [] // TODO: permission === 'commons' ? DataModel.Mappers : DataModel.Collaborators
    const shareable = permission !== 'private'

    const contributor_count = relevantPeople.length
    let contributors_class = relevantPeople.length > 1 ? 'multiple' : ''
    contributors_class += relevantPeople.length === 2 ? ' mTwo' : ''
    const contributor_image = relevantPeople.length > 0 ? relevantPeople.models[0].get('image') : '/images/user.png'

    const user_name = isCreator ? 'You' : map.get('user_name')
    const created_at = map.get('created_at_clean')
    const updated_at = map.get('updated_at_clean')

    let classes = 'mapInfoBox mapElement mapElementHidden permission '
    classes += isCreator ? 'yourMap' : ''
    classes += canEdit ? ' canEdit' : ''

    return <div className={classes}>
      <div className="requestTitle">Click here to name this map</div>
      <div className="mapInfoName" id="mapInfoName">
        {canEdit ? <span className="best_in_place best_in_place_name"
          id={`best_in_place_map_${map.id}_name`}
          data-bip-url={`/maps/${map.id}`}
          data-bip-object="map"
          data-bip-attribute="name"
          data-bip-type="textarea"
          data-bip-activator="#mapInfoName"
          data-bip-value={map.get('name')}
        >{map.get('name')}</span> : map.get('name')}
      </div>

      <div className="mapInfoStat">
        <div className="infoStatIcon mapContributors hoverForTip">
          <img id="mapContribs" className={contributors_class}
            width="25" height="25" src={contributor_image} />
          <span className="count">{contributor_count}</span>
          <div className="tip">{this.createContributorList()}</div>
        </div>
        <div className="infoStatIcon mapTopics">
          {topic_count}
        </div>
        <div className="infoStatIcon mapSynapses">
          {synapse_count}
        </div>
        <div className={`infoStatIcon mapPermission ${permission} hoverForTip`}>
          {isCreator && <div className='tooltips'>
            As the creator, you can change the permission of this map, and the permission of all the topics and synapses you have authority to change will change as well.
          </div>}
        </div>
        <div className="clearfloat"></div>
      </div>
      <div className="mapInfoDesc" id="mapInfoDesc">
        {canEdit ? <span className="best_in_place best_in_place_desc"
          id={`best_in_place_map_${map.id}_desc`}
          data-bip-url={`/maps/${map.id}`}
          data-bip-object="map"
          data-bip-attribute="desc"
          data-bip-nil="Click to add description..."
          data-bip-type="textarea"
          data-bip-activator="#mapInfoDesc"
          data-bip-value={map.get('desc')}
        >{map.get('desc')}</span> : map.get('desc')}
      </div>

      <div className="mapInfoMeta">
        <p className="mapCreatedAt"><span>Created by:</span> {user_name} on {created_at}</p>
        <p className="mapEditedAt"><span>Last edited:</span> {updated_at}</p>
        <div className="mapInfoButtonsWrapper">
          <div className="mapInfoThumbnail">
            <div className="thumbnail"></div>
            <div className="tooltip">Update Thumbnail</div>
            <span>Thumb</span>
          </div>
          <div className="mapInfoDelete">
            <div className="deleteMap"></div>
            <span>Delete</span>
          </div>
          <div className="mapInfoShare">
            <div className="mapInfoShareIcon"></div>
            <span>Share</span>
          </div>
        </div>
      </div>
    </div>
  }
}

export default MapInfoBox
