function graphSettings(type) {
   var t;

   if (type == "arranged" || type == "chaotic") {
      t = {
         //id of the visualization container
         injectInto: 'infovis',
         //Enable zooming and panning
         //by scrolling and DnD
         Navigation: {
            enable: true,
            type: 'HTML',
            //Enable panning events only if we're dragging the empty
            //canvas (and not a node).
            panning: 'avoid nodes',
            zooming: 10 //zoom speed. higher is more sensible
         },
         // Change node and edge styles such as
         // color and width.
         // These properties are also set per node
         // with dollar prefixed data-properties in the
         // JSON structure.
         Node: {
            overridable: true,
            color: '#2D6A5D',
            type: 'customNode',
            dim: 25
         },
         Edge: {
            overridable: true,
            color: '#222222',
            type: 'customEdge',
            lineWidth: 1
         },
         //Native canvas text styling
         Label: {
            type: 'HTML', //Native or HTML
            size: 20,
            //style: 'bold'
         },
         //Add Tips
         Tips: {
            enable: false,
            onShow: function (tip, node) {
               
			   //display node info in tooltip
			   var html =
                  '<p class="type">' + node.getData("itemcatname") + '</p>' +
                  '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
                  '<div class="scroll"><a href="/users/' + node.getData("userid") + '/items/' + node.id + '" class="title">' + node.name + '</a>' +
                  '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' +
                  '<div class="desc"><p>' + node.getData('desc') + '</p></div></div>' +
                  '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a>';
				  
               tip.innerHTML = '<div class="" id="item_' + node.id + '"></div>';
			   $jit.id('item_' + node.id).innerHTML = html;
               $("#_tooltip .scroll").mCustomScrollbar();
            }
         },
         // Add node events
         Events: {
            enable: true,
            type: 'HTML',
            //Change cursor style when hovering a node
            onMouseEnter: function () {
               
            },
            onMouseLeave: function () {
               
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
               var pos = eventInfo.getPos();
               node.pos.setc(pos.x, pos.y);
               Mconsole.plot();
            },
            //Implement the same handler for touchscreens
            onTouchMove: function (node, eventInfo, e) {
               $jit.util.event.stop(e); //stop default touchmove event
               this.onDragMove(node, eventInfo, e);
            },
            //Add also a click handler to nodes
            onClick: function (node) {
               if (!node) return;
               //set final styles  
               Mconsole.graph.eachNode(function (n) {
                  if (n.id != node.id) delete n.selected;
                  n.setData('dim', 25, 'end');
                  n.eachAdjacency(function (adj) {
                     adj.setDataset('end', {
                        lineWidth: 0.5,
                        color: '#222222'
                     });
                     adj.setData('showDesc', false, 'current');
                  });
               });
               if (!node.selected) {
                  node.selected = true;
                  node.setData('dim', 35, 'end');
                  node.eachAdjacency(function (adj) {
                     adj.setDataset('end', {
                        lineWidth: 3,
                        color: '#FFF'
                     });
                     adj.setData('showDesc', true, 'current');
                  });
               } else {
                  delete node.selected;
               }
               //trigger animation to final styles  
               Mconsole.fx.animate({
                  modes: ['node-property:dim',
                     'edge-property:lineWidth:color'],
                  duration: 500
               });
            }
         },
         //Number of iterations for the FD algorithm
         iterations: 200,
         //Edge length
         levelDistance: 200,
         // Add text to the labels. This method is only triggered
         // on label creation and only for DOM labels (not native canvas ones).
         onCreateLabel: function (domElement, node) {
			var html = 
           '<div class="CardOnGraph" title="Click to Hide" id="item_' + node.id + '"><p class="type">' + node.getData("itemcatname") + '</p>' + 
           '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
           '<div class="scroll"><a href="/users/' + node.getData("userid") + '/items/' + node.id + '" class="title">' + node.name + '</a>' + 
		   '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' + 
           '<div class="desc"><p>' + node.getData('desc') + '</p></div></div>' +
           '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a></div>';
		   var showCard = document.createElement('div'); 
			showCard.className = 'showcard item_' + node.id;  
			showCard.innerHTML = html; 
			showCard.style.display = "none";
			domElement.appendChild(showCard);
			
			// add some events to the label
			showCard.onclick = function(){
				$('.showcard.item_' + node.id).fadeOut('fast', function(){
					$('.name').css('display','block');
					Mconsole.plot();
				});	
			}
			
            // Create a 'name' button and add it  
			// to the main node label  
			var nameContainer = document.createElement('span'),  
				style = nameContainer.style;  
			nameContainer.className = 'name item_' + node.id;  
			nameContainer.innerHTML = '<div class="label">' + node.name + '</div>';  
			domElement.appendChild(nameContainer);  
			style.fontSize = "0.9em";  
			style.color = "#222222";
			
			// add some events to the label
			nameContainer.onmouseover = function(){
				$('.showcard').css('display','none');
				$('.name').css('display','block');
				$('.name.item_' + node.id).css('display','none');
				$('.showcard.item_' + node.id).fadeIn('fast');
				Mconsole.plot();
			} 
         },
         // Change node styles when DOM labels are placed
         // or moved.
         onPlaceLabel: function (domElement, node) {
            var style = domElement.style;
            var left = parseInt(style.left);
            var top = parseInt(style.top);
            var w = domElement.offsetWidth;
            var dim = node.getData('dim');
            style.left = (left - w / 2) + 'px';
            style.top = (top + dim) + 'px';
            style.display = '';
         }
      };
   } else if (type = "centered") {
      t = {
         //id of the visualization container
         injectInto: 'infovis',
         //Optional: create a background canvas that plots  
         //concentric circles.  
         background: {
            CanvasStyles: {
               strokeStyle: '#333',
               lineWidth: 1.5
            }
         },
         //Enable zooming and panning
         //by scrolling and DnD
         Navigation: {
            enable: true,
            type: 'HTML',
            //Enable panning events only if we're dragging the empty
            //canvas (and not a node).
            panning: 'avoid nodes',
            zooming: 10 //zoom speed. higher is more sensible
         },
         // Change node and edge styles such as
         // color and width.
         // These properties are also set per node
         // with dollar prefixed data-properties in the
         // JSON structure.
         Node: {
            overridable: true,
            color: '#2D6A5D',
            type: 'customNode',
            dim: 25
         },
         Edge: {
            overridable: true,
            color: '#222222',
            type: 'customEdge',
            lineWidth: 1
         },
         //Native canvas text styling
         Label: {
            type: 'HTML', //Native or HTML
            size: 20,
            //style: 'bold'
         },
         //Add Tips
         Tips: {
            enable: true,
            onShow: function (tip, node) {
               //count connections
               var count = 0;
               node.eachAdjacency(function () {
                  count++;
               });
               //display node info in tooltip
               tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>" + "<div class=\"tip-text\">connections: " + count + "</div>";
            }
         },
         // Add node events
         Events: {
            enable: true,
            type: 'HTML',
            //Change cursor style when hovering a node
            onMouseEnter: function () {
               //Mconsole.canvas.getElement().style.cursor = 'move';
            },
            onMouseLeave: function () {
               //Mconsole.canvas.getElement().style.cursor = '';
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
               var pos = eventInfo.getPos();
               node.pos.setc(pos.x, pos.y);
               Mconsole.plot();
            },
            //Implement the same handler for touchscreens
            onTouchMove: function (node, eventInfo, e) {
               $jit.util.event.stop(e); //stop default touchmove event
               this.onDragMove(node, eventInfo, e);
            },
            //Add also a click handler to nodes
            onClick: function (node) {
               if (!node) return;
               //set final styles  
               Mconsole.graph.eachNode(function (n) {
                  if (n.id != node.id) delete n.selected;
                  n.setData('dim', 25, 'end');
                  n.eachAdjacency(function (adj) {
                     adj.setDataset('end', {
                        lineWidth: 1,
                        color: '#222222'
                     });
                     adj.setData('showDesc', false, 'current');
                  });
               });
               if (!node.selected) {
                  node.selected = true;
                  node.setData('dim', 35, 'end');
                  node.eachAdjacency(function (adj) {
                     adj.setDataset('end', {
                        lineWidth: 3,
                        color: '#FFF'
                     });
                     adj.setData('showDesc', true, 'current');
                  });
               } else {
                  delete node.selected;
               }
               //trigger animation to final styles  
               Mconsole.fx.animate({
                  modes: ['node-property:dim',
                     'edge-property:lineWidth:color'],
                  duration: 500
               });
               // Build the right column relations list.
               // This is done by traversing the clicked node connections.
               var html =
                  '<p class="type">' + node.getData("itemcatname") + '</p>' +
                  '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
                  '<div class="scroll"><a href="/users/' + node.getData("userid") + '/items/' + node.id + '" class="title">' + node.name + '</a>' +
                  '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' +
                  '<div class="desc"><p>' + node.getData('desc') + '</p></div></div>' +
                  '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a>';

               //append connections information
               $jit.id('showcard').innerHTML = '<div class="item" id="item_' + node.id + '"></div>';
               $jit.id('item_' + node.id).innerHTML = html;
               $("#showcard .scroll").mCustomScrollbar();
            }
         },
         //Number of iterations for the Mconsole algorithm
         iterations: 200,
         //Edge length
         levelDistance: 200,
         // Add text to the labels. This method is only triggered
         // on label creation and only for DOM labels (not native canvas ones).
         onCreateLabel: function (domElement, node) {
            // Create a 'name' and 'close' buttons and add them  
            // to the main node label  
            domElement.innerHTML = '<div class="label">' + node.name + '</div>';
            domElement.onclick = function () {
               Mconsole.onClick(node.id, {
                  onComplete: function () {
                     var html =
                        '<p class="type">' + node.getData("itemcatname") + '</p>' +
                        '<img alt="' + node.getData("itemcatname") + '" class="icon" height="50" src="' + imgArray[node.getData("itemcatname")].src + '" width="50" />' +
                        '<div class="scroll"><a href="/users/' + node.getData("userid") + '/items/' + node.id + '" class="title">' + node.name + '</a>' +
                        '<div class="contributor">Added by: <a href="/users/' + node.getData('userid') + '">' + node.getData('username') + '</a></div>' +
                        '<div class="desc"><p>' + node.getData('desc') + '</p></div></div>' +
                        '<a href="' + node.getData('link') + '" class="link" target="_blank">' + node.getData('link') + '</a>';

                     //append connections information
                     $jit.id('showcard').innerHTML = '<div class="item" id="item_' + node.id + '"></div>';
                     $jit.id('item_' + node.id).innerHTML = html;
                     $("#showcard .scroll").mCustomScrollbar();
                  }
               });
            }
         },
         // Change node styles when DOM labels are placed
         // or moved.
         onPlaceLabel: function (domElement, node) {
            var style = domElement.style;
            var left = parseInt(style.left);
            var top = parseInt(style.top);
            var w = domElement.offsetWidth;
            var dim = node.getData('dim');
            style.left = (left - w / 2) + 'px';
            style.top = (top + dim) + 'px';
            style.display = '';
         }
      };
   }

   return t;
}


// defining custom node type	
var nodeSettings = {  
	  'customNode': {  
		  'render': function (node, canvas) {		  			  
			  var pos = node.pos.getc(true),
			  dim = node.getData('dim'),
			  cat = node.getData('itemcatname'),
			  ctx = canvas.getCtx();
			  ctx.drawImage(imgArray[cat], pos.x - dim, pos.y - dim, dim*2, dim*2);

		  },
		  'contains': function(node, pos) {
			var npos = node.pos.getc(true), 
			dim = node.getData('dim');
			return this.nodeHelper.circle.contains(npos, pos, dim);
		  }
	  }
  }
  
  
// defining custom edges
 var edgeSettings = {  
	  'customEdge': {  
		'render': function(adj, canvas) {  
		  //get nodes cartesian coordinates 
		  var pos = adj.nodeFrom.pos.getc(true); 
		  var posChild = adj.nodeTo.pos.getc(true);
		  
		  var directionCat = adj.getData("category");
		  //label placement on edges 
		  //plot arrow edge 
		  if (directionCat == "none") {
				this.edgeHelper.line.render({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, canvas);
		  }
		  else if (directionCat == "both") {
				renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, true, canvas);
				renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, false, canvas);
		  }
		  else if (directionCat == "from-to") {
				var direction = adj.data.$direction;
				var inv = (direction && direction.length>1 && direction[0] != adj.nodeFrom.id);
				renderMidArrow({ x: pos.x, y: pos.y }, { x: posChild.x, y: posChild.y }, 13, inv, canvas);
		  }
		   
		  //check for edge label in data  
		  var desc = adj.getData("desc") + ' (' + adj.getData("userid") + ',' + adj.getData("id") + ')';
		  var showDesc = adj.getData("showDesc");
		  if( desc != "" && showDesc ) { 
			 //now adjust the label placement 
			var radius = canvas.getSize(); 
			var x = parseInt((pos.x + posChild.x - (desc.length * 5)) /2); 
			var y = parseInt((pos.y + posChild.y) /2); 
			canvas.getCtx().fillStyle = '#000';
			canvas.getCtx().font = 'bold 14px arial';
			//canvas.getCtx().fillText(desc, x, y); 
		  }
		}, 'contains' : function(adj, pos) { 
				var from = adj.nodeFrom.pos.getc(true), 
				to = adj.nodeTo.pos.getc(true); 
				return containsMidArrow(from, to, pos, this.edge.epsilon); 
		}  
	  }  
	}
	

