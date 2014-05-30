window.realtime = {};

window.realtime.addTopicToMap = function(topic) {
  var newPos, tempForT;
  Mconsole.graph.addNode(topic);
  tempForT = Mconsole.graph.getNode(topic.id);
  tempForT.setData('dim', 1, 'start');
  tempForT.setData('dim', 25, 'end');
  newPos = new $jit.Complex();
  newPos.x = tempForT.data.$xloc;
  newPos.y = tempForT.data.$yloc;
  tempForT.setPos(newPos, 'start');
  tempForT.setPos(newPos, 'current');
  tempForT.setPos(newPos, 'end');
  Mconsole.fx.plotNode(tempForT, Mconsole.canvas);
  return Mconsole.labels.plotLabel(Mconsole.canvas, tempForT, Mconsole.config);
};

window.realtime.updateTopicOnMap = function(topic) {
  var newPos, tempForT;
  tempForT = Mconsole.graph.getNode(topic.id);
  tempForT.data = topic.data;
  tempForT.name = topic.name;
  if (MetamapsModel.showcardInUse === topic.id) {
    populateShowCard(tempForT);
  }
  newPos = new $jit.Complex();
  newPos.x = tempForT.data.$xloc;
  newPos.y = tempForT.data.$yloc;
  tempForT.setPos(newPos, 'start');
  tempForT.setPos(newPos, 'current');
  tempForT.setPos(newPos, 'end');
  return Mconsole.fx.animate({
    modes: ['linear', 'node-property:dim', 'edge-property:lineWidth'],
    transition: $jit.Trans.Quad.easeInOut,
    duration: 500
  });
};

window.realtime.addSynapseToMap = function(synapse) {
  var Node1, Node2, tempForS;
  Node1 = Mconsole.graph.getNode(synapse.data.$direction[0]);
  Node2 = Mconsole.graph.getNode(synapse.data.$direction[1]);
  Mconsole.graph.addAdjacence(Node1, Node2, {});
  tempForS = Mconsole.graph.getAdjacence(Node1.id, Node2.id);
  tempForS.setDataset('start', {
    lineWidth: 0.4
  });
  tempForS.setDataset('end', {
    lineWidth: 2
  });
  tempForS.data = synapse.data;
  Mconsole.fx.plotLine(tempForS, Mconsole.canvas);
  return Mconsole.fx.animate({
    modes: ['linear', 'node-property:dim', 'edge-property:lineWidth'],
    transition: $jit.Trans.Quad.easeInOut,
    duration: 500
  });
};

window.realtime.updateSynapseOnMap = function(synapse) {
  var k, tempForS, v, wasShowDesc, _ref;
  tempForS = Mconsole.graph.getAdjacence(synapse.data.$direction[0], synapse.data.$direction[1]);
  wasShowDesc = tempForS.data.$showDesc;
  _ref = synapse.data;
  for (k in _ref) {
    v = _ref[k];
    tempForS.data[k] = v;
  }
  tempForS.data.$showDesc = wasShowDesc;
  if (MetamapsModel.edgecardInUse === synapse.data.$id) {
    editEdge(tempForS, false);
  }
  return Mconsole.plot();
};