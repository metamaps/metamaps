var signedIn = true

var ExploreHeader = React.createClass({
  render: function() {
    return (
      <div className="exploreMapsBar exploreElement">
        <div className="exploreMapsMenu">
          <div className="exploreMapsCenter">
            {signedIn ? <a href="/explore/mine" className="myMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              My Maps
            </a> : null }
            {signedIn ? <a href="/explore/shared" className="sharedMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              Shared With Me
            </a> : null }
            <a href={signedIn ? "/" : "/explore/active"}  className="activeMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              Recently Active
            </a>
            {!signedIn ? <a href="/explore/featured" className="featuredMaps exploreMapsButton">
              <div className="exploreMapsIcon"></div>
              Featured Maps
            </a> : null }
          </div> 
        </div>
      </div>
    );
  }
});

ReactDOM.render(
  <ExploreHeader active="featured" />, document.getElementById('exploreMapsHeader')
);
