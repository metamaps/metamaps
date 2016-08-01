var Metamaps = Metamaps || {}

Metamaps.Header = {
  init: function () {

  },
  fetchUserThenChangeSection: function (signedIn, mapperId) {
    $.ajax({
       url: '/users/' + mapperId + '.json',
       success: function (response) {
         Metamaps.Header.changeSection(signedIn, 'mapper', response.image, response.name)
       },
       error: function () {}
    }); 
  },
  changeSection: function (signedIn, section, userAvatar, userName) {
    ReactDOM.render(
      React.createElement(Metamaps.ReactComponents.Header, { signedIn: signedIn, section: section, userAvatar: userAvatar, userName: userName }),
      document.getElementById('exploreMapsHeader')
    );
  }
}
