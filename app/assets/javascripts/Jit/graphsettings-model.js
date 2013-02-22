/*
 * @file
 * This file holds the Model object that is referenced in other graphsettings
 * files. It lists selected nodes, selected edges, and stores data about
 * double clicks on the canvas
 */

var MetamapsModel = new Object();

MetamapsModel.embed = false;

//array of all selected edges
MetamapsModel.selectedEdges = new Array();

//is any showcard open right now? which one?
MetamapsModel.showcardInUse = null;

//is the mouse hovering over an edge? which one?
MetamapsModel.edgeHoveringOver = false;

//double clicking of nodes or canvas
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
