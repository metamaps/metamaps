/*
 * @file
 * There is a lot of code that goes into creating the "label" of a node
 * This includes editable cards with all node details, and some controls
 * onCreateLabelHandler is the main function of this file, and the file
 * also contains a bunch of helper functions
 *
 * html and littleHTML are potentially confusing variables
 * html is the contents of the card shown when you click on a node's label.
 * littleHTML creates little controls for removing/hiding nodes from the canvas
 *
 * This function features PHP-style variable substitution because the strings 
 * are so damn long. Values are identified by $_id_$, and then a regular
 * expression is substituted in later (for html, in a separate function).
 */

function generateShowcardHTML() {
  return '                                                                    \
  <div class="CardOnGraph"                                                    \
         id="topic_$_id_$">                                                   \
        <span class="title">                                                  \
          <span class="best_in_place best_in_place_name"                      \
                data-url="/topics/$_id_$"                                     \
                data-object="topic"                                           \
                data-attribute="name"                                         \
                data-type="input">$_name_$</span>                             \
        </span>                                                               \
        <div class="links">                                                   \
           <div                                                               \
           class="linkItem icon">                                             \
              <div class="metacodeTitle">$_metacode_$</div>                   \
              <div class="metacodeImage"                                      \
                   style="background-image:url($_imgsrc_$);"                  \
                   title="click and drag to move card"></div>                 \
           </div>                                                             \
           <div class="linkItem contributor hoverForTip"> \
             <div class="tip">Created by $_username_$ on $_date_$</div>   \
           </div>                           \
           <a href="/maps/topics/$_id_$" class="linkItem mapCount hoverForTip" \
              title="Click to see which maps topic appears on" target="_blank">                  \
             $_map_count_$                                                    \
           </a>                                                             \
           <div class="linkItem synapseCount">$_synapse_count_$</div>         \
           <div class="linkItem mapPerm $_mk_permission_$"></div>             \
           <a href="/topics/$_id_$" class="linkItem topicPopout" title="Open topic in new tab" target="_blank"></a>\
           <div class="clearfloat"></div>                                     \
        </div>                                                                \
      <div class="metacodeSelect">$_metacode_select_$</div>                   \
      <div class="scroll">                                                    \
        <div class="desc">                                                    \
          <span class="best_in_place best_in_place_desc"                      \
                data-url="/topics/$_id_$"                                     \
                data-object="topic"                                           \
                data-nil="$_desc_nil_$"                                       \
                data-attribute="desc"                                         \
                data-type="textarea">$_desc_$</span>                          \
                <div class="clearfloat"></div>                                \
        </div>                                                                \
      </div>                                                                  \
      <div class="link">                                                      \
      $_a_tag_$<span class="best_in_place best_in_place_link"                 \
            data-url="/topics/$_id_$"                                         \
            data-object="topic"                                               \
            data-nil="$_link_nil_$"                                            \
            data-attribute="link"                                             \
            data-type="input">$_link_$</span>$_close_a_tag_$                  \
      $_go_link_$                                                             \
      </div>                                                                  \
      <div class="clearfloat"></div>                                          \
    </div>';
}//generateShowcardHTML

function replaceVariables(html, node) {
  //link is rendered differently if user is logged out or in
  var go_link, a_tag, close_a_tag;
  if (! authorizeToEdit(node)) {
    go_link = '';
    if (node.getData("link") != "") {
      a_tag = '<a href="' + node.getData("link") + '" target="_blank">';
      close_a_tag = '</a>';
    }
    else {
      a_tag = '';
      close_a_tag = '';
    }
  } else {
    go_link = '<a href="' + node.getData("link") + '" ' +
              '   class="go-link" target="_blank"></a>';
    a_tag = '';
    close_a_tag = '';
  }

  var desc_nil = "<span class='gray'>Click to add description...</span>";
  var link_nil = "<span class='gray'>Click to add link...</span>";
  
  var edit_perm = '';
  if (userid == node.getData("userid")) {
      edit_perm = '                                                  \
        <div class="permActivator">                                  \
          <div class="editSettings">                                 \
            <span>Permissions:&nbsp;</span>                          \
            <span title="Click to Edit">                             \
              <span class="best_in_place best_in_place_permission"   \
                    id="best_in_place_topic_$_id_$_permission"       \
                    data-url="/topics/$_id_$"                        \
                    data-object="topic"                              \
                    data-collection=$_permission_choices_$           \
                    data-attribute="permission"                      \
                    data-type="select"                               \
                    data-value="$_permission_$">                     \
                $_permission_$                                       \
              </span>                                                \
            </span>                                                  \
            <div class="clearfloat"></div>                           \
          </div>                                                     \
        </div>';
  }
  var permissions = ['commons','public','private'];
  var permission_choices = "'[";
  for (var i in permissions) {
    permission_choices += '["' + permissions[i] + '","' + permissions[i] + '"],';
  }
  //remove trailing comma and add ]
  permission_choices = permission_choices.slice(0, -1);
  permission_choices += "]'";
  edit_perm = edit_perm.replace(/\$_permission_choices_\$/g, permission_choices);
  
  html = html.replace(/\$_edit_permission_\$/g, edit_perm);
  html = html.replace(/\$_permission_\$/g, node.getData("permission"));
  html = html.replace(/\$_mk_permission_\$/g, mk_permission(node));
  html = html.replace(/\$_map_count_\$/g, node.getData("inmaps").length);
  html = html.replace(/\$_synapse_count_\$/g, node.getData("synapseCount"));
  html = html.replace(/\$_id_\$/g, node.id);
  html = html.replace(/\$_metacode_\$/g, node.getData("metacode"));
  html = html.replace(/\$_imgsrc_\$/g, imgArray[node.getData("metacode")].src);
  html = html.replace(/\$_name_\$/g, node.name);
  html = html.replace(/\$_userid_\$/g, node.getData("userid"));
  html = html.replace(/\$_username_\$/g, node.getData("username"));
  html = html.replace(/\$_date_\$/g, node.getData("date"));
  html = html.replace(/\$_metacode_select_\$/g, $('#metacodeOptions').html());
  html = html.replace(/\$_go_link_\$/g, go_link);
  html = html.replace(/\$_a_tag_\$/g, a_tag);
  html = html.replace(/\$_close_a_tag_\$/g, close_a_tag);

  html = html.replace(/\$_link_nil_\$/g, link_nil);
  if (node.getData("link") == "" && authorizeToEdit(node)) {
    html = html.replace(/\$_link_\$/g, link_nil);
  } else {
    html = html.replace(/\$_link_\$/g, node.getData("link"));
  }
  
  html = html.replace(/\$_desc_nil_\$/g, desc_nil);
  if (node.getData("desc") == "" && authorizeToEdit(node)) {
    //logged in but desc isn't there so it's invisible
    html = html.replace(/\$_desc_\$/g, desc_nil);
  } else {
    //html = html.replace(/\$_desc_\$/g, node.getData("desc").replace(/\n/g, '<br />'));
    html = html.replace(/\$_desc_\$/g, node.getData("desc"));
  }
  return html;
}

function hideCurrentCard() {
  if (MetamapsModel.showcardInUse) {
    var node = Mconsole.graph.getNode(MetamapsModel.showcardInUse);
    hideCard(node);
  }
}

function hideCard(node) {
  var card = '.showcard';

  $(card).fadeOut('fast', function(){
    //node.setData('dim', 25, 'current');
    Mconsole.plot();
  });

  MetamapsModel.showcardInUse = null;
}

function populateShowCard(node) {
  var showCard = document.getElementById('showcard');

    $(showCard).find('.permission').remove();
      
    var html = generateShowcardHTML();
    html = replaceVariables(html, node);
      
    if (authorizeToEdit(node)) {
      var perm = document.createElement('div');
      
      var string = 'permission canEdit';
      if (userid == node.data.$userid) string += ' yourTopic';
      perm.className = string;
      perm.innerHTML = html;
      showCard.appendChild(perm);
    } else {
      var perm = document.createElement('div');
      perm.className = 'permission cannotEdit';
      perm.innerHTML = html;
      showCard.appendChild(perm);
    }

  var selectingMetacode = false;
  // attach the listener that shows the metacode title when you hover over the image
  $('.showcard .metacodeImage').mouseenter(function(){
    $('.showcard .icon').css('z-index','4');
    $('.showcard .metacodeTitle').show();
  });
  $('.showcard .linkItem.icon').mouseleave(function() {
    if ( !selectingMetacode ) {
      $('.showcard .metacodeTitle').hide();
      $('.showcard .icon').css('z-index','1');
    }
  });
  
  $('.showcard .metacodeTitle').click(function() {
    if (!selectingMetacode) {  
      selectingMetacode = true;
      $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
      $('.metacodeSelect').show();
      // add the scroll bar to the list of metacode select options if it isn't already there
      if ( !$('.metacodeSelect ul').hasClass('mCustomScrollbar') ) {
        $('.metacodeSelect ul').mCustomScrollbar();
        
        $('.metacodeSelect li').click(function() {
          selectingMetacode = false;
          var metacodeName = $(this).find('.mSelectName').text();
          updateMetacode(node, metacodeName);
        });
      }
    } else {
      selectingMetacode = false;
      $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
      $('.metacodeSelect').hide();
    }
  });
  
  
  // ability to change permission
  var selectingPermission = false;
  if (userid == node.data.$userid ) {
   $('.showcard .yourTopic .mapPerm').click(function() {
    if (!selectingPermission) {  
      selectingPermission = true;
      $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
      if ( $(this).hasClass('co') ) {
        $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>');
      } else if ( $(this).hasClass('pu') ) {
        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>');
      } else if ( $(this).hasClass('pr') ) {
        $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>');
      }
      $('.permissionSelect li').click(function(event) {
        selectingPermission = false;
        var permission = $(this).attr('class');
        updateTopicPermission(node, permission);
        event.stopPropagation();
      });
    } else {
      selectingPermission = false;
      $(this).removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
      $('.permissionSelect').remove();
    }
   });
  }
  
  // when you're typing a description, resize the scroll box to have space
  $('.best_in_place_desc textarea').bind('keyup', function() {
    var s = $('.showcard').find('.scroll');
    s.height( s.height() ).mCustomScrollbar('update');
    console.log('working');
  });
  
  //bind best_in_place ajax callbacks
  $(showCard).find('.best_in_place_name').bind("ajax:success", function() {
    
    var s = $('.showcard').find('.scroll');
    s.height( s.height() ).mCustomScrollbar('update');
    
    var name = $(this).html();
    node.name = name;
    Mconsole.plot();
  });

  $(showCard).find('.best_in_place_desc').bind("ajax:success", function() {
    this.innerHTML = this.innerHTML.replace(/\r/g, '')
    
    var s = $('.showcard').find('.scroll');
    s.height( s.height() ).mCustomScrollbar('update');
    
    var desc = $(this).html();
    node.setData("desc", desc);
  });

  $(showCard).find('.best_in_place_link').bind("ajax:success", function() {
    var link = $(this).html();
    $(showCard).find('.go-link').attr('href', link);
    node.setData("link", link);
  });
    
}
