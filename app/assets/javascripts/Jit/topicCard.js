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

function buildCardWithHogan(node) {
    var nodeValues = {};
    var authorized = authorizeToEdit(node);

    //link is rendered differently if user is logged out or in
    var go_link, a_tag, close_a_tag;
    if (!authorized) {
        go_link = '';
        if (node.getData("link") != "") {
            a_tag = '<a href="' + node.getData("link") + '" target="_blank">';
            close_a_tag = '</a>';
        } else {
            a_tag = '';
            close_a_tag = '';
        }
    } else {
        go_link = '<a href="' + node.getData("link") + '" ' +
            '   class="go-link" target="_blank"></a>';
        a_tag = '';
        close_a_tag = '';
    }

    var desc_nil = "Click to add description...";
    var link_nil = "Click to add link...";

    nodeValues.permission = node.getData("permission");
    nodeValues.mk_permission = mk_permission(node);
    nodeValues.map_count = node.getData("inmaps").length;
    nodeValues.synapse_count = node.getData("synapseCount");
    nodeValues.id = node.id;
    nodeValues.metacode = node.getData("metacode");
    nodeValues.imgsrc = imgArray[node.getData("metacode")].src;
    nodeValues.name = node.name;
    nodeValues.userid = node.getData("userid");
    nodeValues.username = node.getData("username");
    nodeValues.date = node.getData("date");

    // the code for this is stored in /views/main/_metacodeOptions.html.erb
    nodeValues.metacode_select = $('#metacodeOptions').html();
    nodeValues.go_link = go_link;
    nodeValues.a_tag = a_tag;
    nodeValues.close_a_tag = close_a_tag;
    nodeValues.link_nil = link_nil;
    nodeValues.link = (node.getData("link") == "" && authorized) ? link_nil : node.getData("link");
    nodeValues.desc_nil = desc_nil;
    nodeValues.desc = (node.getData("desc") == "" && authorized) ? desc_nil : node.getData("desc");

    // the code for the template is stored in /views/layouts/_templates.html.erb
    var hoganTemplate = Hogan.compile($('#topicCardTemplate').html());
    return hoganTemplate.render(nodeValues);
}

function hideCurrentCard() {
    if (MetamapsModel.showcardInUse) {
        var node = Mconsole.graph.getNode(MetamapsModel.showcardInUse);
        hideCard(node);
    }
}

function hideCard(node) {
    var card = '.showcard';

    $(card).fadeOut('fast', function () {
        //node.setData('dim', 25, 'current');
        Mconsole.plot();
    });

    MetamapsModel.showcardInUse = null;
}

function populateShowCard(node) {
    var showCard = document.getElementById('showcard');

    $(showCard).find('.permission').remove();

    var html = buildCardWithHogan(node);

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
    $('.showcard .metacodeImage').mouseenter(function () {
        $('.showcard .icon').css('z-index', '4');
        $('.showcard .metacodeTitle').show();
    });
    $('.showcard .linkItem.icon').mouseleave(function () {
        if (!selectingMetacode) {
            $('.showcard .metacodeTitle').hide();
            $('.showcard .icon').css('z-index', '1');
        }
    });

    $('.showcard .metacodeTitle').click(function () {
        if (!selectingMetacode) {
            selectingMetacode = true;
            $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
            $('.metacodeSelect').show();
            // add the scroll bar to the list of metacode select options if it isn't already there
            if (!$('.metacodeSelect ul').hasClass('mCustomScrollbar')) {
                $('.metacodeSelect ul').mCustomScrollbar();

                $('.metacodeSelect li').click(function () {
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
    if (userid == node.data.$userid) {
        $('.showcard .yourTopic .mapPerm').click(function () {
            if (!selectingPermission) {
                selectingPermission = true;
                $(this).addClass('minimize'); // this line flips the drop down arrow to a pull up arrow
                if ($(this).hasClass('co')) {
                    $(this).append('<ul class="permissionSelect"><li class="public"></li><li class="private"></li></ul>');
                } else if ($(this).hasClass('pu')) {
                    $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="private"></li></ul>');
                } else if ($(this).hasClass('pr')) {
                    $(this).append('<ul class="permissionSelect"><li class="commons"></li><li class="public"></li></ul>');
                }
                $('.permissionSelect li').click(function (event) {
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
    $('.best_in_place_desc textarea').bind('keyup', function () {
        var s = $('.showcard').find('.scroll');
        s.height(s.height()).mCustomScrollbar('update');
        console.log('working');
    });

    //bind best_in_place ajax callbacks
    $(showCard).find('.best_in_place_name').bind("ajax:success", function () {

        var s = $('.showcard').find('.scroll');
        s.height(s.height()).mCustomScrollbar('update');

        var name = $(this).html();
        node.name = decodeEntities(name);
        Mconsole.plot();
    });

    $(showCard).find('.best_in_place_desc').bind("ajax:success", function () {
        this.innerHTML = this.innerHTML.replace(/\r/g, '')

        var s = $('.showcard').find('.scroll');
        s.height(s.height()).mCustomScrollbar('update');

        var desc = $(this).html();
        node.setData("desc", desc);
    });

    $(showCard).find('.best_in_place_link').bind("ajax:success", function () {
        var link = $(this).html();
        $(showCard).find('.go-link').attr('href', link);
        node.setData("link", link);
    });

}