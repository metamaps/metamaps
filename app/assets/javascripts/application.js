// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//  
// require autocomplete-rails-uncompressed
//
//= require jquery
//= require jquery-ui
//= require jquery.purr
//= require jquery.lettering
//= require jquery.textillate
//= require jquery.roundabout.min
//= require bip
//= require jquery_ujs
//= require_tree .

// other options are 'graph'
var viewMode = "list";

var labelType, useGradients, nativeTextSupport, animate, json, Mconsole = null,
    gType, tempNode = null,
    tempInit = false,
    tempNode2 = null,
    metacodeIMGinit = false,
    goRealtime = false,
    mapid = null,
    mapperm = false,
    touchPos, touchDragNode, mouseIsDown = false;


// this is to save the layout of a map
function saveLayoutAll() {
    $('.sidebarSave .tip').html('Saving...');
    var coor = "";
    if (gType == "arranged" || gType == "chaotic") {
        Mconsole.graph.eachNode(function (n) {
            coor = coor + n.getData("mappingid") + '/' + n.pos.x + '/' + n.pos.y + ',';
        });
        coor = coor.slice(0, -1);
        $('#map_coordinates').val(coor);
        $('#saveMapLayout').submit();
    }
}

// this is to update the location coordinate of a single node on a map
function saveLayout(id) {
    var n = Mconsole.graph.getNode(id);
    $('#map_coordinates').val(n.getData("mappingid") + '/' + n.pos.x + '/' + n.pos.y);
    $('#saveMapLayout').submit();
    dragged = 0;
    //$('.wandSaveLayout').html('Saved!');
    //setTimeout(function(){$('.wandSaveLayout').html('Save Layout')},1500);
}

// this is to save your console to a map
function saveToMap() {
    var nodes_data = "",
        synapses_data = "";
    var synapses_array = new Array();
    Mconsole.graph.eachNode(function (n) {
        //don't add to the map if it was filtered out
        if (categoryVisible[n.getData('metacode')] == false) {
            return;
        }

        var x, y;
        if (n.pos.x && n.pos.y) {
            x = n.pos.x;
            y = n.pos.y;
        } else {
            var x = Math.cos(n.pos.theta) * n.pos.rho;
            var y = Math.sin(n.pos.theta) * n.pos.rho;
        }
        nodes_data += n.id + '/' + x + '/' + y + ',';
        n.eachAdjacency(function (adj) {
            synapses_array.push(adj.getData("id"));
        });
    });

    //get unique values only
    synapses_array = $.grep(synapses_array, function (value, key) {
        return $.inArray(value, synapses_array) === key;
    });

    synapses_data = synapses_array.join();
    nodes_data = nodes_data.slice(0, -1);

    $('#map_topicsToMap').val(nodes_data);
    $('#map_synapsesToMap').val(synapses_data);
    openLightbox('forkmap');
}

function fetchRelatives(node) {
    var myA = $.ajax({
        type: "Get",
        url: "/topics/" + node.id + "?format=json",
        success: function (data) {
            if (gType == "centered") {
                Mconsole.busy = true;
                Mconsole.op.sum(data, {
                    type: 'fade',
                    duration: 500,
                    hideLabels: false
                });
                Mconsole.graph.eachNode(function (n) {
                    n.eachAdjacency(function (a) {
                        if (!a.getData('showDesc')) {
                            a.setData('alpha', 0.4, 'start');
                            a.setData('alpha', 0.4, 'current');
                            a.setData('alpha', 0.4, 'end');
                        }
                    });
                });
                Mconsole.busy = false;
            } else {
                Mconsole.op.sum(data, {
                    type: 'nothing',
                });
                Mconsole.plot();
            }
        },
        error: function () {
            alert('failure');
        }
    });
}

// @param node = JIT node object
// @param metacode = STRING like "Idea", "Action", etc.
function updateMetacode(node, metacode) {
    var mdata = {
        "topic": {
            "metacode": metacode
        }
    };
    $.ajax({
        type: "PUT",
        dataType: 'json',
        url: "/topics/" + node.id,
        data: mdata,
        success: function (data) {
            $('.CardOnGraph').find('.metacodeTitle').text(metacode)
                .attr('class', 'metacodeTitle mbg' + metacode.replace(/\s/g, ''));
            $('.CardOnGraph').find('.metacodeImage').css('background-image', 'url(' + imgArray[metacode].src + ')');
            node.setData("metacode", metacode);
            Mconsole.plot();
            $('.metacodeTitle').removeClass('minimize'); // this line flips the pull up arrow to a drop down arrow
            $('.metacodeSelect').hide();
            setTimeout(function () {
                $('.metacodeTitle').hide();
                $('.showcard .icon').css('z-index', '1');
            }, 500);
        },
        error: function () {
            alert('failed to update metacode');
        }
    });
}

function updateTopicPermission(node, permission) {
    var mdata = {
        "topic": {
            "permission": permission
        }
    };
    $.ajax({
        type: "PUT",
        dataType: 'json',
        url: "/topics/" + node.id,
        data: mdata,
        success: function (data) {
            $('.showcard .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2));
            $('.permissionSelect').remove();
            node.setData("permission", permission);
        },
        error: function () {
            alert('failed to update permission');
        }
    });
}

function updateSynapsePermission(edge, permission) {
    var mdata = {
        "synapse": {
            "permission": permission
        }
    };
    $.ajax({
        type: "PUT",
        dataType: 'json',
        url: "/synapses/" + edge.data.$id,
        data: mdata,
        success: function (data) {
            $('#edit_synapse .mapPerm').removeClass('co pu pr minimize').addClass(permission.substring(0, 2));
            $('#edit_synapse .permissionSelect').remove();
            edge.setData("permission", permission);
        },
        error: function () {
            alert('failed to update permission');
        }
    });
}

function updateMapPermission(mapid, permission) {
    var mdata = {
        "map": {
            "permission": permission
        }
    };
    $.ajax({
        type: "PUT",
        dataType: 'json',
        url: "/maps/" + mapid,
        data: mdata,
        success: function (data) {
            $('.mapPermission').removeClass('commons public private minimize').addClass(permission);
            $('.mapPermission .permissionSelect').remove();
        },
        error: function () {
            alert('failed to update permission');
        }
    });
}

function updateMetacodeSet(set, index, custom) {

    if (custom && MetamapsModel.newSelectedMetacodes.length == 0) {
        alert('Please select at least one metacode to use!');
        return false;
    }

    var codesToSwitchTo;
    MetamapsModel.selectedMetacodeSetIndex = index;
    MetamapsModel.selectedMetacodeSet = "metacodeset-" + set;

    if (!custom) {
        codesToSwitchTo = $('#metacodeSwitchTabs' + set).attr('data-metacodes').split(',');
        $('.customMetacodeList li').addClass('toggledOff');
        MetamapsModel.selectedMetacodes = [];
        MetamapsModel.selectedMetacodeNames = [];
        MetamapsModel.newSelectedMetacodes = [];
        MetamapsModel.newSelectedMetacodeNames = [];
    }
    if (custom) {
        // uses .slice to avoid setting the two arrays to the same actual array
        MetamapsModel.selectedMetacodes = MetamapsModel.newSelectedMetacodes.slice(0);
        MetamapsModel.selectedMetacodeNames = MetamapsModel.newSelectedMetacodeNames.slice(0);
        codesToSwitchTo = MetamapsModel.selectedMetacodeNames.slice(0);
    }

    // sort by name
    codesToSwitchTo.sort();
    codesToSwitchTo.reverse();

    $('#metacodeImg, #metacodeImgTitle').empty();
    $('#metacodeImg').removeData('cloudcarousel');
    var newMetacodes = "";
    for (var i = 0; i < codesToSwitchTo.length; i++) {
        newMetacodes += '<img class="cloudcarousel" width="40" height="40" src="' + imgArray[codesToSwitchTo[i]].src + '" title="' + codesToSwitchTo[i] + '" alt="' + codesToSwitchTo[i] + '"/>';
    };
    $('#metacodeImg').empty().append(newMetacodes).CloudCarousel({
        titleBox: $('#metacodeImgTitle'),
        yRadius: 40,
        xPos: 150,
        yPos: 40,
        speed: 0.3,
        mouseWheel: true,
        bringToFront: true
    });

    $('#lightbox_overlay').hide();
    $('#topic_name').focus();

    var mdata = {
        "metacodes": {
            "value": custom ? MetamapsModel.selectedMetacodes.toString() : MetamapsModel.selectedMetacodeSet
        }
    };
    $.ajax({
        type: "POST",
        dataType: 'json',
        url: "/user/updatemetacodes",
        data: mdata,
        success: function (data) {
            console.log('selected metacodes saved');
        },
        error: function () {
            console.log('failed to save selected metacodes');
        }
    });
}

function cancelMetacodeSetSwitch() {
    if (MetamapsModel.selectedMetacodeSet != "metacodeset-custom") {
        $('.customMetacodeList li').addClass('toggledOff');
        MetamapsModel.selectedMetacodes = [];
        MetamapsModel.selectedMetacodeNames = [];
        MetamapsModel.newSelectedMetacodes = [];
        MetamapsModel.newSelectedMetacodeNames = [];
    } else { // custom set is selected
        // reset it to the current actual selection
        $('.customMetacodeList li').addClass('toggledOff');
        for (var i = 0; i < MetamapsModel.selectedMetacodes.length; i++) {
            $('#' + MetamapsModel.selectedMetacodes[i]).removeClass('toggledOff');
        };
        // uses .slice to avoid setting the two arrays to the same actual array
        MetamapsModel.newSelectedMetacodeNames = MetamapsModel.selectedMetacodeNames.slice(0);
        MetamapsModel.newSelectedMetacodes = MetamapsModel.selectedMetacodes.slice(0);
    }
    $('#metacodeSwitchTabs').tabs("select", MetamapsModel.selectedMetacodeSetIndex);
    $('#topic_name').focus();
}

function MconsoleReset() {

    var tX = Mconsole.canvas.translateOffsetX;
    var tY = Mconsole.canvas.translateOffsetY;
    Mconsole.canvas.translate(-tX, -tY);

    var mX = Mconsole.canvas.scaleOffsetX;
    var mY = Mconsole.canvas.scaleOffsetY;
    Mconsole.canvas.scale((1 / mX), (1 / mY));
}

function openNodeShowcard(node) {
    //populate the card that's about to show with the right topics data
    populateShowCard(node);

    $('.showcard').fadeIn('fast');
    var s = $('.showcard').find('.scroll');
    s.height(s.height()).mCustomScrollbar({
        mouseWheelPixels: 200,
        advanced: {
            updateOnContentResize: true
        }
    });
    MetamapsModel.showcardInUse = node.id;
}

function openLightbox(which) {
    $('.lightboxContent').hide();
    $('#' + which).show();

    $('#lightbox_overlay').show();
    $('#lightbox_main').css('margin-top', '-' + ($('#lightbox_main').height() / 2) + 'px');

    if (!MetamapsModel.metacodeScrollerInit) {
        $('.customMetacodeList, .metacodeSetList').mCustomScrollbar({
            mouseWheelPixels: 200,
            advanced: {
                updateOnContentResize: true
            }
        });
        MetamapsModel.metacodeScrollerInit = true;
    }
    if (which == "switchMetacodes") {
        MetamapsModel.isSwitchingSet = true;
    }
}

function closeLightbox() {
    $('#lightbox_overlay').hide();
    cancelMapCreate('fork_map');
    cancelMapCreate('new_map');
    if (MetamapsModel.isSwitchingSet) {
        cancelMetacodeSetSwitch();
        MetamapsModel.isSwitchingSet = false;
    }
}

function cancelMapCreate(id) {

    var form = $('#' + id);

    form.find('#map_name').val('');
    form.find('#map_desc').val('');
    form.find('#map_permission').val('commons');

    if (id == "fork_map") {
        form.find('#map_topicsToMap').val('0');
        form.find('#map_synapsesToMap').val('0');
    }
    form.find('.mapPermIcon').removeClass('selected');
    form.find('.mapCommonsIcon').addClass('selected');

    return false;
}