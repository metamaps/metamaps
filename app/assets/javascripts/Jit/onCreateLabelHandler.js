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
           <img alt="$_metacode_$"                                                 \
           class="linkItem icon"                                                       \
           title="click and drag to move card"                                         \
           height="40"                                                        \
           width="40"                                                         \
           src="$_imgsrc_$" />                                                \
           <div class="linkItem contributor"></div>                                    \
           <div class="linkItem mapCount">$_map_count_$</div>                                    \
           <div class="linkItem synapseCount">$_synapse_count_$</div>                                    \
           <div class="linkItem mapPerm $_mk_permission_$"></div>                      \
           <a href="/topics/$_id_$" class="linkItem topicPopout" title="Open Topic in New Tab" target="_blank"></a>\
           <div class="clearfloat"></div>                                     \
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
      perm.className = 'permission canEdit';
      perm.innerHTML = html;
      showCard.appendChild(perm);
    } else {
      var perm = document.createElement('div');
      perm.className = 'permission cannotEdit';
      perm.innerHTML = html;
      showCard.appendChild(perm);
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
    node.name = name;
  });

  $(showCard).find('.best_in_place_desc').bind("ajax:success", function() {
    this.innerHTML = this.innerHTML.replace(/\r/g, '')
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
  
  $('.showcard').find('.scroll').mCustomScrollbar();
  
}
