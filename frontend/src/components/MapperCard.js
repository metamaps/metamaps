import React, { Component, PropTypes } from 'react'

class MapperCard extends Component {
  render = () => {
    const { user } = this.props
    
    return (
      <div className="mapper">
        <div className="mapperCard">                                                 
          <div className="mapperImage">
            <img src={ user.image } width="96" height="96" />
          </div> 
          <div className="mapperName" title={ user.name }>                                                  
            { user.name }
          </div>
          <div className="mapperInfo">
            <div className="mapperCreatedAt">Mapper since: { user.created_at }</div>
            <div className="mapperGeneration">Generation: { user.generation }</div>
          </div>
          <div className="mapperMetadata">
             <div className="metadataSection metadataMaps"><div>{ user.numMaps }</div>maps</div>
             <div className="metadataSection metadataTopics"><div>{ user.numTopics }</div>topics</div> 
             <div className="metadataSection metadataSynapses"><div>{ user.numSynapses }</div>synapses</div> 
             <div className="clearfloat"></div>                               
          </div>                                         
        </div>
      </div>
    )
  }
}

MapperCard.propTypes = {
  user: PropTypes.object.isRequired
}

export default MapperCard
