/*
 * @file
 * This file holds the Model object that is referenced in other graphsettings
 * files. It lists selected nodes, selected edges, and stores data about
 * double clicks on the canvas
 */

var MetamapsModel = new Object();

MetamapsModel.embed = false;

//array of all selected edges, same for nodes
MetamapsModel.selectedEdges = new Array();
MetamapsModel.selectedNodes = new Array();

//this stores a value that indicates whether the user panned or simply clicked without panning
// used for purposes of knowing whether to close the open card or not (don't if panned)
MetamapsModel.didPan = false;

//is any showcard open right now? which one?
MetamapsModel.showcardInUse = null;
MetamapsModel.widthOfLabel = null;

//is an edge card open right now? which one (the id)?
MetamapsModel.edgecardInUse = null;

//is the mouse hovering over an edge? which one?
MetamapsModel.edgeHoveringOver = false;

//coordinates of shift click for using box select
MetamapsModel.boxStartCoordinates = false;
MetamapsModel.boxEndCoordinates = false;

//coordinates for drawing edge that's not created yet
MetamapsModel.synapseStartCoord = false;
MetamapsModel.synapseEndCoord = false;

//double clicking of nodes or canvas
MetamapsModel.lastSynapseClick = 0;
MetamapsModel.lastNodeClick = 0;
MetamapsModel.lastCanvasClick = 0;
MetamapsModel.DOUBLE_CLICK_TOLERANCE = 300;

//pop-up permission editors timers
MetamapsModel.edgePermTimer1 = null;
MetamapsModel.edgePermTimer2 = null;
MetamapsModel.edgePermSliding = false;
MetamapsModel.topicPermTimer1 = null;
MetamapsModel.topicPermTimer2 = null;
MetamapsModel.topicPermSliding = false;
