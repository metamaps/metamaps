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
               //fd.canvas.getElement().style.cursor = 'move';
            },
            onMouseLeave: function () {
               //fd.canvas.getElement().style.cursor = '';
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
               var pos = eventInfo.getPos();
               node.pos.setc(pos.x, pos.y);
               console.plot();
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
               console.graph.eachNode(function (n) {
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
               console.fx.animate({
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
         //Number of iterations for the FD algorithm
         iterations: 200,
         //Edge length
         levelDistance: 200,
         // Add text to the labels. This method is only triggered
         // on label creation and only for DOM labels (not native canvas ones).
         onCreateLabel: function (domElement, node) {
            // Create a 'name' and 'close' buttons and add them  
            // to the main node label  
            var nameContainer = document.createElement('span'),
               style = nameContainer.style;
            nameContainer.className = 'name';
            nameContainer.innerHTML = '<div class="label">' + node.name + '</div>';
            domElement.appendChild(nameContainer);
            style.fontSize = "0.9em";
            style.color = "#222222";
            //Toggle a node selection when clicking  
            //its name. This is done by animating some  
            //node styles like its dimension and the color  
            //and lineWidth of its adjacencies.  
            nameContainer.onclick = function () {
               //set final styles  
               console.graph.eachNode(function (n) {
                  if (n.id != node.id) delete n.selected;
                  n.setData('dim', 25, 'end');
                  n.eachAdjacency(function (adj) {
                     adj.setDataset('end', {
                        lineWidth: 0.4,
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
               console.fx.animate({
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
            };
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
               //rg.canvas.getElement().style.cursor = 'move';
            },
            onMouseLeave: function () {
               //rg.canvas.getElement().style.cursor = '';
            },
            //Update node positions when dragged
            onDragMove: function (node, eventInfo, e) {
               var pos = eventInfo.getPos();
               node.pos.setc(pos.x, pos.y);
               rg.plot();
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
               rg.graph.eachNode(function (n) {
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
               rg.fx.animate({
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
         //Number of iterations for the rg algorithm
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
               rg.onClick(node.id, {
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