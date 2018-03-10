import React, { Component } from 'react'

class ForkMap extends Component {
  render = () => {
    return (
      <div className="lightboxContent" id="forkmap">
        <div className="onConsole">
          <form className="new_map" id="fork_map" action="/maps" acceptCharset="UTF-8" data-remote="true" method="post">
            <input name="utf8" type="hidden" value="✓" />
            <h3 className="forCreateMap">Save To New Map</h3>
            <div className="inputGroup">
              <label htmlFor="map_name">Name: </label>
              <input maxLength="140" size="140" type="text" name="map[name]" id="map_name" />
              <div className="clearfloat"></div>
            </div>
            <div className="inputGroup">
              <label htmlFor="map_desc">Description: </label>
              <textarea className="description" rows="5" cols="43" name="map[desc]" id="map_desc"></textarea>
              <div className="clearfloat"></div>
            </div>
            <div className="inputGroup">
              <label htmlFor="map_permission">Permission*: </label>
              <p className="permHelper">*new topics and synapses take on the same permission as the map they are created on</p>
              <div className="permIconWrapper">
                <div className="permIcon" data-permission="commons">
                  <div id="newmap_co" className="mapCommonsIcon mapPermIcon selected">
                    <div className="tip">
                      Anyone with an account can edit this map. Anyone without an account can only view it.
                    </div>
                  </div>
                  <h4>COMMONS</h4>
                </div>
                <div className="permIcon" data-permission="public">
                  <div id="newmap_pu" className="mapPublicIcon mapPermIcon">
                    <div className="tip">
                      Only people you allow can edit this map. Anyone can view it.
                    </div>
                  </div>
                  <h4>PUBLIC</h4>
                </div>
                <div className="permIcon" data-permission="private">
                  <div id="newmap_pr" className="mapPrivateIcon mapPermIcon">
                    <div className="tip">
                      Only people you allow can edit this map. No one else can view it.
                    </div>
                  </div>
                  <h4>PRIVATE</h4>
                </div>
                <div className="clearfloat"></div>
              </div>
              <p className="permText">Anyone with an account can edit this map. Anyone without an account can only view it.</p>
              <div className="clearfloat"></div>
            </div>
            <div className="buttonWrapper">
              <button className="button cancel">Cancel</button>
              <button className="button submitMap">Create!</button>
            </div>
            <div className="clearfloat"></div>
          </form>
        </div>
      </div>
    )
  }
}

export default ForkMap