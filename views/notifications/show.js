import React, { Component } from react

class MyComponent extends Component {
  render = () => {
    return (
<div id="yield">
  <div className="centerContent withPadding back">
    { link_to 'Back to notifications', notifications_path }
  </div>
  <div className="centerContent notificationPage">
    <h2 className="notification-title">
      { case @notification.notification_code
           when MAP_ACCESS_REQUEST
             request = @notification.notified_object
             map = request.map }
         { image_tag @notification.sender.image(:thirtytwo), className: 'thirty-two-avatar' } <span style='font-weight:bold;' className='requesterName'>{ request.user.name }</span> wants to collaborate on map <span style='font-weight:bold;'>{ map.name }</span>
       { else }
         { @notification.subject }
       { end }
    </h2>
    { case @notification.notification_code
         when MAP_ACCESS_REQUEST }
       <div className="notification-body">
         <p className="main-text">
           { if false && request.answered }
             { if request.approved }
               You already responded to this access request, and allowed access.
             { elsif !request.approved }
               You already responded to this access request, and declined access. If you changed your mind, you can still grant
               them access by going to the map and adding them as a collaborator.
             { end }
           { else }
             { image_tag asset_path('ellipsis.gif'), className: 'hidden' }
             { link_to 'Allow', approve_access_post_map_path(id: map.id, request_id: request.id), remote: true, method: :post, className: 'button allow' }
             { link_to 'Decline', deny_access_post_map_path(id: map.id, request_id: request.id), remote: true, method: :post, className: 'button decline' }
             <script>
               $(document).ready(function() {
                 $('.notification-body .button').click(function() {
                   $(this).html('<img src="{ asset_path('ellipsis.gif') }" />')
                 })
               })
             </script>
           { end }
         </p>
         { link_to 'Go to map', map_url(map) }
         &nbsp;&nbsp;{ link_to 'View mapper profile', explore_path(id: request.user.id) }
       </div>
     { else }
       <div className="notification-body">
         { raw @notification.body }
       </div>
     { end }
  </div>
</div>
    )
  }
}

export default MyComponent
