/*
 * @file
 * This file holds the Model object that is referenced in other graphsettings
 * files. It lists selected nodes, selected edges, and stores data about
 * double clicks on the canvas
 */

var MetamapsModel = new Object();
MetamapsModel.selectedEdges = new Array();
MetamapsModel.showcardInUse = null;
MetamapsModel.lastCanvasClick = 0;
MetamapsModel.DOUBLE_CLICK_TOLERANCE = 300;
MetamapsModel.edgeHoveringOver = false;
MetamapsModel.edgePermTimer1 = null;
MetamapsModel.edgePermTimer2 = null;
MetamapsModel.edgePermSliding = false;
MetamapsModel.topicPermTimer1 = null;
MetamapsModel.topicPermTimer2 = null;
MetamapsModel.topicPermSliding = false;
