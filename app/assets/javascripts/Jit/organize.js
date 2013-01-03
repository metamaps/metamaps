function organize() {
  Mconsole.compute();
  Mconsole.fx.animate({  
    modes: ['linear'],  
    hideLabels: true  
  });
}


////
////
////
//// Define all the dynamic interactions for the Organize using Jquery

$(document).ready(function() {
   
   // this sets up the initial opening of the organize box
   $('#sideOptionOrganize').bind('click',function(){
	   if (!organizeOpen) openOrganize();  
   });
   
   // this sets up the closing of the organize box, and the toggling between open and closed.
   $('#closeOrganize').bind('click',function(){
	   if (organizeOpen) closeOrganize();
   });
});

function openOrganize() {
  organizeOpen = true;
  if (findOpen) closeFind();
  if (analyzeOpen) closeAnalyze();
  $('#sideOptionFind').css('z-index','8');
  $('#sideOptionAnalyze').css('z-index','9');
  $('#sideOptionOrganize, #closeOrganize').css('z-index','10');
  $('#sideOptionOrganize').animate({
    width: '100px',
    height: '76px'
    }, 100);
  $('#closeOrganize').css('display','block');
  $('#sideOptionOrganize').css('cursor','default');
}

function closeOrganize() {
   organizeOpen = false;
   $('#closeOrganize').css('display','none');
   $('#sideOptionOrganize').css('cursor','pointer');
   $('#sideOptionOrganize').animate({
     width: '75px',
     height: '32px'
     }, 100);
}