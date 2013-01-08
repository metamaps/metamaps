////
////
////
//// Define all the dynamic interactions for the Analyze using Jquery

$(document).ready(function() {
   
   // this sets up the initial opening of the organize box
   $('#sideOptionAnalyze').bind('click',function(){
	   if (!analyzeOpen) openAnalyze();  
   });
   
   // this sets up the closing of the organize box, and the toggling between open and closed.
   $('#closeAnalyze').bind('click',function(){
	   if (analyzeOpen) closeAnalyze();
   });
});

function openAnalyze() {
  analyzeOpen = true;
  if (findOpen) closeFind();
  if (organizeOpen) closeOrganize();
  $('#sideOptionFind').css('z-index','8');
  $('#sideOptionAnalyze, #closeAnalyze').css('z-index','10');
  $('#sideOptionOrganize').css('z-index','8');
  $('#sideOptionAnalyze').animate({
    width: '100px',
    height: '76px'
    }, 100);
  $('#closeAnalyze').css('display','block');
  $('#sideOptionAnalyze').css('cursor','default');
  var numT = Object.keys(Mconsole.graph.nodes).length;
  var numS = 0;
  Mconsole.graph.eachNode(function (n) {
		n.eachAdjacency(function () {
		  numS++;
		});
  });
  numS = numS/2;
  $('.analysis').html('<p>' + numT + ' topics</p><p>' + numS + ' synapses</p>');
}

function closeAnalyze() {
   analyzeOpen = false;
   $('#closeAnalyze').css('display','none');
   $('#sideOptionAnalyze').css('cursor','pointer');
   $('#sideOptionAnalyze').animate({
     width: '64px',
     height: '32px'
     }, 100);
}