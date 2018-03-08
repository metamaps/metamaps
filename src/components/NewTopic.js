import React, { Component } from 'react'

class NewTopic extends Component {
  componentDidMount() {
    this.props.initNewTopic()
  }

  render = () => {
    const metacodes = [
      {
        "id": 1,
        "name": "Action",
        "created_at": "2017-03-04T17:33:07.394Z",
        "updated_at": "2017-03-04T17:33:07.394Z",
        "color": "#BD6C85",
        "icon": "https://s3.amazonaws.com/metamaps-assets/metacodes/blueprint/96px/bp_action.png"
      }
    ]
    return (
      <form className="new_topic" id="new_topic" action="/topics" acceptCharset="UTF-8" data-remote="true" method="post">
        <input name="utf8" type="hidden" value="✓" />
        <div className="openMetacodeSwitcher" onClick={() => this.props.openMetacodeSwitcher()}>
          <div className="tooltipsAbove">Switch Metacodes</div>
        </div>

        <div className="pinCarousel">
          <div className="tooltipsAbove helpPin">Pin Open</div>
          <div className="tooltipsAbove helpUnpin">Unpin</div>
        </div>

        <div id="metacodeImg">
          {metacodes.map(m => <img key={m.id} className="cloudcarousel" width="40" height="40" src={m.icon} alt={m.name} title={m.name} data-id={m.id} />)}
        </div>

        <input maxLength="140" placeholder="title..." size="140" type="text" name="topic[name]" id="topic_name" className="tt-input" autoComplete="off" spellCheck="false" dir="auto" />

        <div id="metacodeImgTitle"></div>
        <div className="clearfloat"></div>
      </form>
    )
  }
}

export default NewTopic

/*
TODO:
{ @metacodes.each do |metacode| }
      Metamaps.Create.selectedMetacodes.push("{ metacode.id }");
      Metamaps.Create.newSelectedMetacodes.push("{ metacode.id }");
      Metamaps.Create.selectedMetacodeNames.push("{ metacode.name }");
      Metamaps.Create.newSelectedMetacodeNames.push("{ metacode.name }");
    { end } 
*/