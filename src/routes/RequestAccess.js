import React, { Component } from 'react'

class RequestAccess extends Component {
  render = () => {
    return (
      <div id="yield">
        <div className='request_access'>
          <div className='monkey'></div>
          <div className='explainer_text'>
            Hmmm. This map is private, but you can request to edit it from the map creator.
          </div>
          <div className='make_request'>REQUEST ACCESS</div>
        </div>
      </div>
    )
  }
}

export default RequestAccess

/*
<script>
$(document).ready(function() {
  $('.make_request').click(function() {
    var that = $(this)
    that.off('click')
    that.text('requesting...')
    $.ajax({
      url: '/maps/<%= params[:id] %>/access_request',
      type: 'POST',
      contentType: 'application/json',
      statusCode: {
        200: function () { that.text('Request Sent'); setTimeout(function () {window.location.href = '/'}, 2000) },
        400: function () { that.text('An error occurred') }
      }
    })
  })
})
</script>
*/