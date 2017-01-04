/* global $ */

const CheatSheet = {
  init: function() {
    // tab the cheatsheet
    $('#cheatSheet').tabs()
    $('#quickReference').tabs().addClass('ui-tabs-vertical ui-helper-clearfix')
    $('#quickReference .ui-tabs-nav li').removeClass('ui-corner-top').addClass('ui-corner-left')

    // // id = the id of a vimeo video
    // var switchVideo = function(element, id) {
    //   $('.tutorialItem').removeClass('active')
    //   $(element).addClass('active')
    //   $('#tutorialVideo').attr('src', '//player.vimeo.com/video/' + id)
    // }

    // $('#gettingStarted').click(function() {
    //   switchVideo(this,'88334167')
    // })
    // $('#upYourSkillz').click(function() {
    //   switchVideo(this,'100118167')
    // })
    // $('#advancedMapping').click(function() {
    //   switchVideo(this,'88334167')
    // })
  }
}

export default CheatSheet
