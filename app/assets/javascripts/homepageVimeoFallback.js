/* global $ */

$(document).ready(function() {
  if (window.location.pathname === '/') {
    $.ajax({
      type: 'GET',
      url: 'https://player.vimeo.com',
      error: function(e) {
        $('.homeVideo').hide()
        $('.homeVideo').replaceWith($('<video/>', {
          poster: '/assets/metamaps-intro-poster.webp',
          width: '560',
          height: '315',
          class: 'homeVideo',
          controls: ''
        }))
        $('.homeVideo').append($('<source/>', {
          src: 'https://metamaps.cc/videos/metamaps-intro.mp4',
          type: 'video/mp4'
        }))
        $('.homeVideo').append(
          '<p>You can watch our instruction video at ' +
          '<a href="https://metamaps.cc/videos/metamaps-intro.mp4">' +
          'https://metamaps.cc/videos/metamaps-intro.mp4</a>.'
        )
      }
    })
  }// if
})
