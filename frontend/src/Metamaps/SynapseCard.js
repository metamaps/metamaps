/* global $ */
import Active from './Active'
import Control from './Control'
import Mapper from './Mapper'
import Visualize from './Visualize'

const SynapseCard = {
  openSynapseCard: null,
  showCard: function(edge, e) {
    var self = SynapseCard

    // reset so we don't interfere with other edges, but first, save its x and y
    var myX = $('#edit_synapse').css('left')
    var myY = $('#edit_synapse').css('top')
    $('#edit_synapse').remove()

    // so label is missing while editing
    Control.deselectEdge(edge)

    var index = edge.getData('displayIndex') ? edge.getData('displayIndex') : 0
    var synapse = edge.getData('synapses')[index] // for now, just get the first synapse

    // create the wrapper around the form elements, including permissions
    // classes to make best_in_place happy
    var editDiv = document.createElement('div')
    editDiv.innerHTML = '<div id="editSynUpperBar"></div><div id="editSynLowerBar"></div>'
    editDiv.setAttribute('id', 'edit_synapse')
    if (synapse.authorizeToEdit(Active.Mapper)) {
      editDiv.className = 'permission canEdit'
      editDiv.className += synapse.authorizePermissionChange(Active.Mapper) ? ' yourEdge' : ''
    } else {
      editDiv.className = 'permission cannotEdit'
    }
    $('#wrapper').append(editDiv)

    self.populateShowCard(edge, synapse)

    // drop it in the right spot, activate it
    $('#edit_synapse').css('position', 'absolute')
    if (e) {
      $('#edit_synapse').css('left', e.clientX)
      $('#edit_synapse').css('top', e.clientY)
    } else {
      $('#edit_synapse').css('left', myX)
      $('#edit_synapse').css('top', myY)
    }
    // $('#edit_synapse_name').click() //required in case name is empty
    // $('#edit_synapse_name input').focus()
    $('#edit_synapse').show()

    self.openSynapseCard = edge
  },

  hideCard: function() {
    $('#edit_synapse').remove()
    SynapseCard.openSynapseCard = null
  },

  populateShowCard: function(edge, synapse) {
    var self = SynapseCard

    self.add_synapse_count(edge)
    self.add_desc_form(synapse)
    self.add_drop_down(edge, synapse)
    self.add_user_info(synapse)
    self.add_perms_form(synapse)
    self.add_direction_form(synapse)
  },
  add_synapse_count: function(edge) {
    var count = edge.getData('synapses').length

    $('#editSynUpperBar').append('<div id="synapseCardCount">' + count + '</div>')
  },
  add_desc_form: function(synapse) {
    var dataNil = 'Click to add description.'

    // TODO make it so that this would work even in sandbox mode,
    // currently with Best_in_place it won't

    // desc editing form
    $('#editSynUpperBar').append('<div id="edit_synapse_desc"></div>')
    $('#edit_synapse_desc').attr('class', 'best_in_place best_in_place_desc')
    $('#edit_synapse_desc').attr('data-bip-object', 'synapse')
    $('#edit_synapse_desc').attr('data-bip-attribute', 'desc')
    $('#edit_synapse_desc').attr('data-bip-type', 'textarea')
    $('#edit_synapse_desc').attr('data-bip-nil', dataNil)
    $('#edit_synapse_desc').attr('data-bip-url', '/synapses/' + synapse.id)
    $('#edit_synapse_desc').attr('data-bip-value', synapse.get('desc'))
    $('#edit_synapse_desc').html(synapse.get('desc'))

    // if edge data is blank or just whitespace, populate it with dataNil
    if ($('#edit_synapse_desc').html().trim() === '') {
      if (synapse.authorizeToEdit(Active.Mapper)) {
        $('#edit_synapse_desc').html(dataNil)
      } else {
        $('#edit_synapse_desc').html('(no description)')
      }
    }

    $('#edit_synapse_desc').keypress(function(e) {
      const ENTER = 13
      if (e.which === ENTER) {
        $(this).data('bestInPlaceEditor').update()
      }
    })
    $('#edit_synapse_desc').bind('ajax:success', function() {
      var desc = $(this).html()
      if (desc === dataNil) {
        synapse.set('desc', '')
      } else {
        synapse.set('desc', desc)
      }
      synapse.trigger('saved')
      Control.selectEdge(synapse.get('edge'))
      Visualize.mGraph.plot()
    })
  },
  add_drop_down: function(edge, synapse) {
    var list, i, synapses, l, desc

    synapses = edge.getData('synapses')
    l = synapses.length

    if (l > 1) {
      // append the element that you click to show dropdown select
      $('#editSynUpperBar').append('<div id="dropdownSynapses"></div>')
      $('#dropdownSynapses').click(function(e) {
        e.preventDefault()
        e.stopPropagation() // stop it from immediately closing it again
        $('#switchSynapseList').toggle()
      })
      // hide the dropdown again if you click anywhere else on the synapse card
      $('#edit_synapse').click(function() {
        $('#switchSynapseList').hide()
      })

      // generate the list of other synapses
      list = '<ul id="switchSynapseList">'
      for (i = 0; i < l; i++) {
        if (synapses[i] !== synapse) { // don't add the current one to the list
          desc = synapses[i].get('desc')
          desc = desc === '' || desc === null ? '(no description)' : desc
          list += '<li data-synapse-index="' + i + '">' + desc + '</li>'
        }
      }
      list += '</ul>'
      // add the list of the other synapses
      $('#editSynLowerBar').append(list)

      // attach click listeners to list items that
      // will cause it to switch the displayed synapse
      // when you click it
      $('#switchSynapseList li').click(function(e) {
        e.stopPropagation()
        var index = parseInt($(this).attr('data-synapse-index'))
        edge.setData('displayIndex', index)
        Visualize.mGraph.plot()
        SynapseCard.showCard(edge, false)
      })
    }
  },
  add_user_info: function(synapse) {
    var u = '<div id="edgeUser" class="hoverForTip">'
    u += '<a href="/explore/mapper/' + synapse.get('user_id') + '"> <img src="" width="24" height="24" /></a>'
    u += '<div class="tip">' + synapse.get('user_name') + '</div></div>'
    $('#editSynLowerBar').append(u)

    // get mapper image
    var setMapperImage = function(mapper) {
      $('#edgeUser img').attr('src', mapper.get('image'))
    }
    Mapper.get(synapse.get('user_id'), setMapperImage)
  },

  add_perms_form: function(synapse) {
    // permissions - if owner, also allow permission editing
    $('#editSynLowerBar').append('<div class="mapPerm ' + synapse.get('calculated_permission').substring(0, 2) + '"></div>')

    // ability to change permission
    var selectingPermission = false
    var permissionLiClick = function(event) {
      selectingPermission = false
      var permission = $(this).attr('class')
      synapse.save({
        permission: permission,
        defer_to_map_id: null
      })
      $('#edit_synapse .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2))
      $('#edit_synapse .permissionSelect').remove()
      event.stopPropagation()
    }

    var openPermissionSelect = function(event) {
      if (!selectingPermission) {
        selectingPermission = true
        $(this).addClass('minimize') // this line flips the drop down arrow to a pull up arrow
        if ($(this).hasClass('co')) {
          $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>')
        } else if ($(this).hasClass('pu')) {
          $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>')
        } else if ($(this).hasClass('pr')) {
          $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>')
        }
        $('#edit_synapse .permissionSelect li').click(permissionLiClick)
        event.stopPropagation()
      }
    }

    var hidePermissionSelect = function() {
      selectingPermission = false
      $('#edit_synapse.yourEdge .mapPerm').removeClass('minimize') // this line flips the pull up arrow to a drop down arrow
      $('#edit_synapse .permissionSelect').remove()
    }

    if (synapse.authorizePermissionChange(Active.Mapper)) {
      $('#edit_synapse.yourEdge .mapPerm').click(openPermissionSelect)
      $('#edit_synapse').click(hidePermissionSelect)
    }
  }, // add_perms_form

  add_direction_form: function(synapse) {
    // directionality checkboxes
    $('#editSynLowerBar').append('<div id="edit_synapse_left"></div>')
    $('#editSynLowerBar').append('<div id="edit_synapse_right"></div>')

    var edge = synapse.get('edge')

    // determine which node is to the left and the right
    // if directly in a line, top is left
    let left
    let right
    if (edge.nodeFrom.pos.x < edge.nodeTo.pos.x ||
      edge.nodeFrom.pos.x === edge.nodeTo.pos.x &&
      edge.nodeFrom.pos.y < edge.nodeTo.pos.y) {
      left = edge.nodeTo.getData('topic')
      right = edge.nodeFrom.getData('topic')
    } else {
      left = edge.nodeFrom.getData('topic')
      right = edge.nodeTo.getData('topic')
    }

    /*
     * One node is actually on the left onscreen. Call it left, & the other right.
     * If category is from-to, and that node is first, check the 'right' checkbox.
     * Else check the 'left' checkbox since the arrow is incoming.
     */

    var directionCat = synapse.get('category') // both, none, from-to
    if (directionCat === 'from-to') {
      var fromTo = [synapse.get('topic1_id'), synapse.get('topic2_id')]
      if (fromTo[0] === left.id) {
        // check left checkbox
        $('#edit_synapse_left').addClass('checked')
      } else {
        // check right checkbox
        $('#edit_synapse_right').addClass('checked')
      }
    } else if (directionCat === 'both') {
      // check both checkboxes
      $('#edit_synapse_left').addClass('checked')
      $('#edit_synapse_right').addClass('checked')
    }

    if (synapse.authorizeToEdit(Active.Mapper)) {
      $('#edit_synapse_left, #edit_synapse_right').click(function() {
        $(this).toggleClass('checked')

        var leftChecked = $('#edit_synapse_left').is('.checked')
        var rightChecked = $('#edit_synapse_right').is('.checked')

        var dir = synapse.getDirection()
        var dirCat = 'none'
        if (leftChecked && rightChecked) {
          dirCat = 'both'
        } else if (!leftChecked && rightChecked) {
          dirCat = 'from-to'
          dir = [right.id, left.id]
        } else if (leftChecked && !rightChecked) {
          dirCat = 'from-to'
          dir = [left.id, right.id]
        }

        synapse.save({
          category: dirCat,
          topic1_id: dir[0],
          topic2_id: dir[1]
        })
        Visualize.mGraph.plot()
      })
    } // if
  } // add_direction_form
}

export default SynapseCard
