// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behSwapImageRestore;

//******************* BEHAVIOR FUNCTION **********************

//Included from file MM_swapImgRestore.js

//******************* API **********************


//Checks for the existence of images.
//If none exist, returns false so this Action is grayed out.

function canAcceptBehavior(){
  var nameArray = getObjectRefs("NS 4.0","document","IMG");  //get array of image names
  var retVal = (nameArray.length>0)?"onMouseOut,(onMouseOut)" : false;
  return retVal;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_swapImgRestore";
}



//Returns simple fn call, no args
function applyBehavior() {
  updateBehaviorFns("MM_findObj","MM_swapImage","MM_swapImgRestore"); //if existing swap functions outdated, update entire page
  return "MM_swapImgRestore()";
}



//Passed the function call above, does nothing (no args to handle)
function inspectBehavior(){
}
