var USERVOICE;
if(USERVOICE == undefined) {
  USERVOICE = {};
}

USERVOICE.load = function (name, id, email, sso_token) {
// Include the UserVoice JavaScript SDK (only needed once on a page)
UserVoice=window.UserVoice||[];(function(){var uv=document.createElement('script');uv.type='text/javascript';uv.async=true;uv.src='//widget.uservoice.com/wybK0nSMNuhlWkIKzTyWg.js';var s=document.getElementsByTagName('script')[0];s.parentNode.insertBefore(uv,s)})();

//
// UserVoice Javascript SDK developer documentation:
// https://www.uservoice.com/o/javascript-sdk
//

// Set colors
UserVoice.push(['set', {
  accent_color: '#448dd6',
  trigger_color: 'white',
  trigger_background_color: 'rgba(46, 49, 51, 0.6)'
}]);

// Identify the user and pass traits
// To enable, replace sample data with actual user traits and uncomment the line
if (name) {
  UserVoice.push(['setSSO', sso_token]);
  UserVoice.push(['identify', {
    'email': email, // User’s email address
    'name': name, // User’s real name
    'id': id, // Optional: Unique id of the user 
  }]);
}

// Add default trigger to the bottom-left corner of the window:
UserVoice.push(['addTrigger', { mode: 'contact', trigger_position: 'bottom-left' }]);

// Or, use your own custom trigger:
//UserVoice.push(['addTrigger', '#barometer_tab', { mode: 'contact' }]);

// Autoprompt for Satisfaction and SmartVote (only displayed under certain conditions)
UserVoice.push(['autoprompt', {}]);
};