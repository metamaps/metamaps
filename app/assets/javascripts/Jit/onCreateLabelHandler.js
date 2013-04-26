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

function onCreateLabelHandler(domElement, node) {
  // Create a 'name' button and add it to the main node label
  var nameContainer = document.createElement('span'),
  style = nameContainer.style;
  nameContainer.className = 'name topic_' + node.id;
  nameContainer.id = 'topic_' + node.id + '_label';

  nameContainer.innerHTML = generateLittleHTML (node);
  domElement.appendChild(nameContainer);
  style.fontSize = "0.9em";
  style.color = "#222222";

  bindNameContainerCallbacks(nameContainer, node);
}

function generateShowcardHTML() {
  return '                                                                    \
  <div class="CardOnGraph"                                                    \
         id="topic_$_id_$">                                                   \
      <p class="type best_in_place best_in_place_metacode"                    \
         data-url="/topics/$_id_$"                                            \
         data-object="topic"                                                  \
         data-collection=$_metacode_choices_$                                 \
         data-attribute="metacode"                                            \
         data-type="select">$_metacode_$</p>                                  \
      <img alt="$_metacode_$"                                                 \
           class="icon"                                                       \
           title="Click to hide card"                                         \
           height="50"                                                        \
           width="50"                                                         \
           src="$_imgsrc_$" />                                                \
        <div class="cardSettings">                                            \
          <div class="mapPerm"                                                \
               title="$_permission_$">                                        \
               $_mk_permission_$                                              \
          </div>                                                              \
          $_edit_permission_$                                                 \
        </div>                                                                \
        <span class="title">                                                  \
          <span class="best_in_place best_in_place_name"                      \
                data-url="/topics/$_id_$"                                     \
                data-object="topic"                                           \
                data-attribute="name"                                         \
                data-type="input">$_name_$</span>                             \
          <a href="/topics/$_id_$" class="topic-go-arrow" target="_blank">    \
            <img class="topic-go-arrow"                                       \
                 title="Explore Topic"                                        \
                 src="/assets/go-arrow.png" />                                \
          </a>                                                                \
          <div class="clearfloat"></div>                                      \
        </span>                                                               \
        <div class="contributor">                                             \
          Added by: <a href="/users/$_userid_$" target="_blank">$_username_$  \
          </a>                                                                \
        </div>                                                                \
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
      $_go_link_$                                                             \
      $_a_tag_$<span class="best_in_place best_in_place_link"                 \
            data-url="/topics/$_id_$"                                         \
            data-object="topic"                                               \
            data-nil="$_link_nil_$"                                            \
            data-attribute="link"                                             \
            data-type="input">$_link_$</span>$_close_a_tag_$                  \
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
      a_tag = '<a href="' + node.getData("link") + '">';
      close_a_tag = '</a>';
    }
    else {
      a_tag = '';
      close_a_tag = '';
    }
  } else {
    go_link = '<a href="' + node.getData("link") + '" ' +
              '   class="go-link" target="_blank">[go]</a>';
    a_tag = '';
    close_a_tag = '';
  }

  //create metacode_choices array from imgArray
  var metacodes = new Array();
  for (var key in imgArray) {
    if (imgArray.hasOwnProperty(key)) {
      if (key != node.getData("metacode")) {
        metacodes.push(key);
      }
    }
  }

  //Arrange it how we want it
  metacodes.sort();
  metacodes.unshift(node.getData("metacode"));

  var metacode_choices = "'[";
  for (var i in metacodes) {
    metacode_choices += '["' + metacodes[i] + '","' + metacodes[i] + '"],';
  }
  //remove trailing comma and add ]
  metacode_choices = metacode_choices.slice(0, -1);
  metacode_choices += "]'";

  var desc_nil = "<span class='gray'>Click to add description.</span>";
  var link_nil = "<span class='gray'>Click to add link.</span>";
  
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
  html = html.replace(/\$_id_\$/g, node.id);
  html = html.replace(/\$_metacode_\$/g, node.getData("metacode"));
  html = html.replace(/\$_imgsrc_\$/g, imgArray[node.getData("metacode")].src);
  html = html.replace(/\$_name_\$/g, node.name);
  html = html.replace(/\$_userid_\$/g, node.getData("userid"));
  html = html.replace(/\$_username_\$/g, node.getData("username"));
  html = html.replace(/\$_metacode_choices_\$/g, metacode_choices);
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
    html = html.replace(/\$_desc_\$/g, node.getData("desc"));
  }
  return html;
}

function generateLittleHTML(node) {
  var littleHTML = '                                                          \
    <div class="label">$_name_$</div>                                         \
      <div class="nodeOptions">';

  if (userid == null || mapid == null || !mapperm) {
    //unauthenticated, not on a map: can remove from canvas
    littleHTML += '                                                           \
        <span class="removeFromCanvas"                                        \
              onclick="hideNode($_id_$)"                              \
              title="Click to remove topic from canvas">                      \
        </span>';
  } else if (mapperm) {
    //permission to remove nodes from the map
    littleHTML += '                                                           \
        <span class="removeFromCanvas"                                        \
                 onclick="hideNode($_id_$)"                                   \
                 title="Click to remove topic from canvas">                   \
        </span>                                                               \
        <span class="removeFromMap"                                           \
                 onclick="removeNode($_id_$)"                                 \
                 title="Click to remove topic from map">                      \
        </span>';
  }

  if (userid == node.getData('userid')) {
    //logged in, and owner of the topic, thus permission to delete
    littleHTML += '                                                          \
        <span class="deleteTopic"                                            \
                 onclick="var t = confirm(\'Are you sure you want to permanently delete this node and all synapses linking to it?\'); if (t) deleteNode($_id_$)"                                       \
                 title="Click to delete this topic">                         \
        </span>';
  }
  littleHTML += '</div>';
  littleHTML = littleHTML.replace(/\$_id_\$/g, node.id);
  littleHTML = littleHTML.replace(/\$_mapid_\$/g, mapid);
  littleHTML = littleHTML.replace(/\$_name_\$/g, node.name);

  return littleHTML;
}

function hideCurrentCard() {
  if (MetamapsModel.showcardInUse) {
    var node = Mconsole.graph.getNode(MetamapsModel.showcardInUse);
    hideCard(node);
  }
}

function hideCard(node) {
  var card = '.showcard';
  if (node != null) {
    card += '.topic_' + node.id;
  }

  $(card).fadeOut('fast', function(){
    node.setData('dim', 25, 'current');
    Mconsole.labels.hideLabel(Mconsole.graph.getNode(node.id), true)
    Mconsole.plot();
  });

  MetamapsModel.showcardInUse = null;
}

function bindNameContainerCallbacks(nameContainer, node) {
   nameContainer.onmouseover = function(){
     $('.name.topic_' + node.id + ' .nodeOptions').css('display','block');
   }
 
   nameContainer.onmouseout = function(){
     $('.name.topic_' + node.id + ' .nodeOptions').css('display','none');
   }

  // add some events to the label
  $(nameContainer).find('.label').click(function(e){
    
    // set the diameter to full again for whatever node had its topic card showing
    if ( MetamapsModel.showcardInUse != null ) {
      currentOpenNode = Mconsole.graph.getNode(MetamapsModel.showcardInUse)
      currentOpenNode.setData('dim', 25, 'current');
      Mconsole.labels.hideLabel(currentOpenNode, true)
      Mconsole.plot();
    }
    
    //populate the card that's about to show with the right topics data
    populateShowCard(node);
  
    // positions the card in the right place
    var top = $('#' + node.id).css('top');
    var left = parseInt($('#' + node.id).css('left'));
    var w = $('#topic_' + node.id + '_label').width();
    w = w/2;
    left = (left + w) + 'px';
    $('#showcard').css('top', top);
    $('#showcard').css('left', left);   

    $('.showcard.topic_' + node.id).fadeIn('fast');
    node.setData('dim', 1, 'current');
    MetamapsModel.showcardInUse = node.id;
    Mconsole.plot();
    Mconsole.labels.hideLabel(Mconsole.graph.getNode(node.id));
  });
}

function populateShowCard(node) {
  var showCard = document.getElementById('showcard');

    showCard.innerHTML = '';
      
    var html = generateShowcardHTML();
    html = replaceVariables(html, node);
      
    showCard.className = 'showcard topic_' + node.id;
    if (authorizeToEdit(node)) {
      var perm = document.createElement('div');
      perm.className = 'permission canEdit';
      perm.innerHTML = html;
      showCard.appendChild(perm);
    } else {
      showCard.innerHTML = html;
    }

  //bind best_in_place ajax callbacks
  $(showCard).find('.best_in_place_metacode').bind("ajax:success", function() {
    var metacode = $(this).html();
    //changing img alt, img src for top card (topic view page)
    //and on-canvas card. Also changing image of node
    $(showCard).find('img.icon').attr('alt', metacode);
    $(showCard).find('img.icon').attr('src', imgArray[metacode].src);
    node.setData("metacode", metacode);
    Mconsole.plot();
  });

  $(showCard).find('.best_in_place_name').bind("ajax:success", function() {
    var name = $(this).html();
    $('#topic_' + node.id + '_label').find('.label').html(name);
    node.name = name;
  });

  $(showCard).find('.best_in_place_desc').bind("ajax:success", function() {
    $(showCard).find('.scroll').mCustomScrollbar("update");
    var desc = $(this).html();
    node.setData("desc", desc);
  });

  $(showCard).find('.best_in_place_link').bind("ajax:success", function() {
    var link = $(this).html();
    $(showCard).find('.go-link').attr('href', link);
    node.setData("link", link);
  });
  
  $(showCard).find(".permActivator").bind('mouseover', 
        function () { 
          clearTimeout(MetamapsModel.topicPermTimer2);
          that = this;       
          MetamapsModel.topicPermTimer1 = setTimeout(function() {
            if (! MetamapsModel.topicPermSliding) { 
              MetamapsModel.topicPermSliding = true;            
                $(that).animate({
                  width: '203px',
                  height: '37px'
                }, 300, function() {
                  MetamapsModel.topicPermSliding = false;
                });
            } 
          }, 300);
        });
    
    $(showCard).find(".permActivator").bind('mouseout',    
        function () {
          clearTimeout(MetamapsModel.topicPermTimer1);
          that = this;        
          MetamapsModel.topicPermTimer2 = setTimeout(function() { 
			      if (! MetamapsModel.topicPermSliding) { 
				      MetamapsModel.topicPermSliding = true; 
				      $(that).animate({
					      height: '16px',
                width: '16px'
				      }, 300, function() {
					      MetamapsModel.topicPermSliding = false;
				      });
			      } 
		      },800); 
        } 
    );
    
  //bind best_in_place ajax callbacks
  $(showCard).find('.best_in_place_permission').bind("ajax:success", function() {
    var permission = $(this).html();
    var el = $(this).parents('.cardSettings').find('.mapPerm');
    el.attr('title', permission);
    if (permission == "commons") el.html("co");
    else if (permission == "public") el.html("pu");
    else if (permission == "private") el.html("pr");
    node.setData("permission", permission);
  });
  
  $('.showcard.topic_' + node.id).find('.scroll').mCustomScrollbar();
  
  // add some events to the label
  $('.showcard').find('img.icon').click(function(){
    hideCard(node);
  });
}
